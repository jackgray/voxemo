from kafka import KafkaConsumer, KafkaProducer
import requests
import json

consumer = KafkaConsumer('wav-files', group_id='asr-group', bootstrap_servers=kafka_bootstrap_servers)
producer = KafkaProducer(bootstrap_servers='localhost:9092', value_serializer=lambda v: json.dumps(v).encode('utf-8'))

def transcribe_audio(file_path):
    with open(file_path, 'rb') as f:
        response = requests.post('http://whisper-service/transcribe', files={'file': f})
        return response.json()

def publish_transcription(session_id, transcription):
    producer.send('transcription-topic', {'session_id': session_id, 'transcription': transcription})

for message in consumer:
    session_id = message.headers['session_id']
    wav_file = message.value.decode('utf-8')
    
    # Transcribe audio
    transcription = transcribe_audio(wav_file)
    
    # Publish transcription
    publish_transcription(session_id, transcription)
