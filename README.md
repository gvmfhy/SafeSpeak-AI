# TranslateBridge

I found myself in the hospital translating English to Mandarin using Claude, verifying that the translation was accurate, then generating audio with ElevenLabs. Anything done more than once is worth automating. So I built this tool that does those three steps automatically: translates your message, back-translates it to verify nothing got lost in translation (using a fresh LLM context to prevent cheating), and generates audio so you can play the message aloud for whoever you're talking with. The back-translation acts as a safety check, as the initial model aims to add cultural nuance from the target language, but can overshoot.

## Author
Austin Morrissey

## License
MIT