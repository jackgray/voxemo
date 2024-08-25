
import librosa
import numpy as np

# Load audio file
y, sr = librosa.load('path/to/audiofile.wav', sr=None)  # sr=None retains the original sampling rate

# Extract MFCC features
mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)  # Example: 13 MFCCs

# Extract Chroma features
chroma = librosa.feature.chroma_stft(y=y, sr=sr)

