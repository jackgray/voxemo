# Voxemo

##### Extract emotional sentiment from voice input in real time

##### Generate responses through visual or musical art generation or TTS


Voxemo aims to be an emotional translator for the social-cognitive or simpaired, or anyone seeking new forms of expression.


Voxemo will listen to any speaker and describe their emotional state in any spoken language, or through other forms of generative ai such as visual or musical art. UML could theoretically also be leveraged to create diagrams, flowcharts, and graphs to explain something.

Physiologic recording, facial recognition, body language, or even incoherent audio signal could also be used for emotional sensing, and Voxemo can learn from its users by asking for feedback from of how accurate its interpretation is.

This could be helpful for stroke patients who have difficulty coming up with the words to express how they feel, and also those on the spectrum or other socio-cog disorders like ADHD and schizophroenia who have difficulty understanding others. 

Additionally, anyone can use this app to streamline summaries of notes and get help rephrasing sentences into clearer more effective terms in real time.

If you let Voxemo passively listen or track your location (understandable if you don't), it will provide summaries of different parts of your day with a view to overlay key points on a map of where you were, including other metadata about the context. It could even send you alerts to catch you from entering negative brain states based on learned precipitating queues. 


## Design Approach

Voxemo is all about speed. Hot, nasty, bad-ass speed.
- Eleanor Roosevelt, maybe

Audio is collected by a Nextjs web client to Node API server, and streamed through a feature extraction pipeline chained together by Kafka, and ultimately those features are stored in a vector database such as Pinecone.Accompanying metadata in ClickHouse.

The key to high transmission rates is appropriately chunking the audio so that processing can begin soon after the user starts speaking, and allocating a high replica count so that ideally each word the user speaks goes to a different node in a round robin fashion so that there is never a processing queue greater than 1. 


### Client Application using web recorder api
The client application, built on Next.js/React streans the raw byte input to the API server

### API / Node Server (raw_bytestream)
Before the speaker is done recording, the server is already recieving the audio bytestream from the client in real time, and immediately passes that up to a Kakfa topic called bytestream

### Kafka byestream ffmpeg consumer (chunks_2wav)
A fleet of consumers listening on the bytestream topic proccesses WAV files in chunks to be passed on to transcription. It sends a series of small WAV files containing sentence fragments to another Kafka topic called wav_2whisper where a Whisper ASR service will pick them up

### Kafka Whisper consumer (wav_2whisper)
Another fleet of consumers await new wav files to send to the Whisper ASR API, which send back a transcription of the input file. When the Whisper consumer application receives a response it forwards it to another topic where another consumer will stitch the sentences back together


### Paralinguistic/Acoustic Feature Extraction  

#### Resources
https://assets.amazon.science/21/f3/1496cf78467399381a6e8bf0ae47/towards-paralinguistic-only-speech-representations-for-end-to-end-speech-emotion-recognition.pdf


### Large Language Models (LLM)

### Text To Speech (TTS)

