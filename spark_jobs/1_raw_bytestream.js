


const { Kafka } = require('kafkajs');
const kafka = new Kafka({
  brokers: ['localhost:9092'],
});
const producer = kafka.producer();

await producer.connect();

async function sendAudioChunk(audioChunk, sessionId, timestamp) {
  await producer.send({
    topic: 'bytestream',
    messages: [{ value: audioChunk, headers: { sessionId, timestamp } }],
  });
}
