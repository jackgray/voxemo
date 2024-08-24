import React, { useState } from "react";
import RecordRTC from "recordrtc";
import { Button, Input, Loading } from "@nextui-org/react";

function Record() {
  const [serverEndpoint, setServerEndpoint] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [jsonLoading, setJsonLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [transcriptUrl, setTranscriptUrl] = useState(null);
  const [transcriptFilename, setTranscriptFilename] = useState(null);
  const [mp3Url, setMp3Url] = useState(null);
  const [mp3Filename, setMp3Filename] = useState(null);

  const uploadAudio = async (formData) => {
    try {
      console.log("Uploading audio file to server (/api/upload)");
      const response = await fetch(`${serverEndpoint}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("fetched json data: ", data);
        if (data.url && data.filename) {
          const mp3Download = serverEndpoint + data.url;
          setMp3Url(mp3Download);
          setMp3Filename(data.filename);
          console.log("Path to mp3 file: ", mp3Download);
        } else {
          throw new Error("Received data does not contain url or filename.");
        }
      } else {
        throw new Error("Server response was not OK.");
      }
    } catch (error) {
      console.error("Error uploading the audio file:", error);
    }
  };

  const startRecording = async () => {
    setMp3Url(null);
    setIsRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 2,
        sampleRate: 48000,
        sampleSize: 16,
      },
    });

    const recordRTC = RecordRTC(stream, {
      type: "audio",
      mimeType: "audio/webm",
    });
    recordRTC.startRecording();
    setRecorder(recordRTC);
  };

  const stopRecording = () => {
    setIsRecording(false);

    recorder.stopRecording(async () => {
      const blob = recorder.getBlob();
      const formData = "";

      try {
        setAudioLoading(true);
        console.log("Starting audio upload");
        await uploadAudio(formData);
        console.log(
          "Finished audio upload, setting transcript loading to true"
        );
        setJsonLoading(true);
      } catch (error) {
        console.error("Error uploading audio file: ", error);
      } finally {
        setAudioLoading(false);
      }
    });
  };

  const handleUpload = async () => {
    if (selectedFile) {
      const audioForm = new FormData();
      audioForm.append("file", selectedFile, {
        filename: selectedFile.name,
        contentType: "audio/mpeg",
      });
      audioForm.append("task", "transcribe");
      audioForm.append("language", "en");
      audioForm.append("output", "json");

      console.log("Uploading file:", selectedFile);
      setUploading(true);

      // Perform the upload (this is where you'd call the upload function)
      await uploadAudio(audioForm);

      setUploading(false);
      setSelectedFile(null);
    } else {
      console.log("No file selected.");
    }
  };

  const clickDownloadAudio = async () => {
    try {
      const res = await fetch(mp3Url);
      if (!res.ok) {
        throw new Error(`HTTP error. Status: ${res.status}`);
      } else {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = mp3Filename;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error(
        `Failed to fetch the mp3 file from the server. Download may not be ready: ${error}`
      );
    }
  };

  const clickDownloadTranscript = async () => {
    try {
      const res = await fetch(transcriptUrl);
      if (!res.ok) {
        throw new Error(`HTTP error. Status: ${res.status}`);
      } else {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = transcriptFilename;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setTranscriptUrl(null);
      }
    } catch (error) {
      console.error(
        `Failed to fetch the transcript file from the server. Download may not be ready: ${error}`
      );
    }
  };

  return (
    <div>
      <Button
        color={isRecording ? "error" : "success"}
        onPress={isRecording ? stopRecording : startRecording}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </Button>

      <Input
        type="file"
        accept="audio/*"
        onChange={(event) => {
          const fileList = event.target.files;
          const audioFile = fileList[0];
          setSelectedFile(audioFile);
        }}
      />
      {(selectedFile || uploading) && (
        <Button
          disabled={uploading}
          onPress={handleUpload}
        >
          {uploading ? <Loading /> : "Transcribe"}
        </Button>
      )}

      {mp3Url && (
        <Button onPress={clickDownloadAudio}>
          Download Audio
        </Button>
      )}
    </div>
  );
}

export default Record;
