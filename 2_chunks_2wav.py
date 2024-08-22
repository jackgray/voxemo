from kafka import KafkaConsumer
import subprocess
import os

consumer = KafkaConsumer('bytestream', group_id='aggregation-group', bootstrap_servers='localhost:9092')

def aggregate_chunks(session_id, chunk_data):
    if not os.path.exists(f'{session_id}.mp3'):
        with open(f'{session_id}.mp3', 'wb') as f:
            f.write(chunk_data)
    else:
        with open(f'{session_id}.mp3', 'ab') as f:
            f.write(chunk_data)

def convert_to_wav(input_path):
    output_path = input_path.replace('.mp3', '.wav')
    subprocess.run(['ffmpeg', '-i', input_path, output_path])
    return output_path

current_chunks = {}

for message in consumer:
    session_id = message.headers['session_id']
    audio_data = message.value
    
    # Aggregate audio chunks
    aggregate_chunks(session_id, audio_data)
    
    # Convert to WAV
    wav_file = convert_to_wav(f'{session_id}.mp3')
    
    # You can now publish the WAV file path or content to another Kafka topic for ASR processing
