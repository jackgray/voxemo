require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const multer = require("multer");
const AWS = require('aws-sdk');
const Minio = require('minio');
const fs = require("fs");
const path = require("path");
const mime = require("mime");
const FormData = require("form-data");

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const CLIENT_PORT = process.env.CLIENT_PORT || 3000;
const SERVER_PORT = process.env.SERVER_PORT || 3001;
const WHISPER_PORT = process.env.WHISPER_PORT || 3002;
const CLIENT_ENDPOINT = process.env.CLIENT_ENDPOINT || `http://localhost:${CLIENT_PORT}`;
const WHISPER_ENDPOINT = process.env.WHISPER_ENDPOINT || `http://localhost:${WHISPER_PORT}`;

const STORAGE_TYPE = process.env.STORAGE_TYPE;
let s3Client;

// Initialize S3 client based on storage type
if (STORAGE_TYPE === 'aws') {
    s3Client = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        endpoint: process.env.AWS_S3_ENDPOINT,
        s3ForcePathStyle: true,
        signatureVersion: 'v4',
    });
} else if (STORAGE_TYPE === 'minio') {
    s3Client = new Minio.Client({
        endPoint: process.env.MINIO_ENDPOINT,
        useSSL: false,
        accessKey: process.env.MINIO_ACCESS_KEY,
        secretKey: process.env.MINIO_SECRET_KEY,
    });
}

// Middlewares
app.use(cors({ origin: CLIENT_ENDPOINT }));
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() }).single("audio");

// Routes
app.use("/api/config", express.static("/app/data/config"));

app.post("/api/upload", upload, async (req, res) => {
    try {
        const audioFile = req.file;
        const filename = path.parse(audioFile.originalname).name;
        const mp3OutputPath = `/tmp/${filename}.mp3`;

        await convertToMP3(audioFile.buffer, mp3OutputPath);

        const s3UploadResult = await uploadToS3(mp3OutputPath, filename);

        if (!s3UploadResult) {
            saveToDisk(mp3OutputPath, filename);
        }

        const whisperRes = await callWhisperAPI(mp3OutputPath);

        if (whisperRes.status === 200) {
            saveTranscript(whisperRes.data, filename);
            res.json({ url: `/api/audio/${filename}.mp3`, filename: `${filename}.mp3` });
        } else {
            throw new Error("Whisper API call failed");
        }
    } catch (error) {
        console.error("Error in upload route:", error);
        res.status(500).json({ error: "File processing error" });
    }
});

app.listen(SERVER_PORT, () => {
    console.log(`Server is running on port ${SERVER_PORT}`);
    console.log(`CORS enabled: allowing requests only from ${CLIENT_ENDPOINT}`);
});

// Helper Functions
async function convertToMP3(buffer, outputPath) {
    return new Promise((resolve, reject) => {
        const inputStream = new Readable();
        inputStream.push(buffer);
        inputStream.push(null);

        ffmpeg(inputStream)
            .inputFormat('ogg')
            .audioCodec('pcm_f32le')    // WAV codec (for mp3, use libmp3lame)
            .save(outputPath)
            .on('end', resolve)
            .on('error', reject);
    });
}

async function uploadToS3(filePath, filename) {
    const bucketName = process.env.S3_BUCKET_NAME || 'default-bucket';
    const key = `audio/${filename}.mp3`;

    const uploadParams = {
        Bucket: bucketName,
        Key: key,
        Body: fs.createReadStream(filePath),
        ContentType: mime.getType(filePath),
    };

    try {
        await s3Client.putObject(uploadParams).promise();
        console.log(`Uploaded to S3: ${key}`);
        return true;
    } catch (error) {
        console.error("S3 upload failed:", error);
        return false;
    }
}

function saveToDisk(filePath, filename) {
    const outputDir = `/app/data/audio/`;
    const outputFilePath = path.join(outputDir, `${filename}.mp3`);

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.copyFileSync(filePath, outputFilePath);
    console.log(`Saved locally: ${outputFilePath}`);
}

async function callWhisperAPI(mp3OutputPath) {
    const audioBuffer = fs.readFileSync(mp3OutputPath);

    const audioForm = new FormData();
    audioForm.append("audio_file", audioBuffer, {
        filename: path.basename(mp3OutputPath),
        contentType: mime.getType(mp3OutputPath),
    });

    return axios.post(WHISPER_ENDPOINT, audioForm, {
        params: { task: "transcribe", language: "en", output: "json" },
        headers: { ...audioForm.getHeaders() },
    });
}

function saveTranscript(transcriptData, filename) {
    const transcriptPath = `/app/data/transcripts/${filename}.json`;

    fs.writeFileSync(transcriptPath, JSON.stringify(transcriptData));
    console.log(`Transcript saved: ${transcriptPath}`);
}
