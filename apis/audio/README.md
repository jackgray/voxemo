# Audio Intake API

Specifically handles retrieving audio data from the client and converting it into WAV format

Goals:

Send off 30s chunks round robin to different Whisper replicas to transcribe in parallel then stitch together the full request


