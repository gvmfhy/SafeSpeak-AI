# Safespeak-AI

When we translate and express our ideas into languages we do not speak, we are bound to miscommunicate. Without cultural and linguistic knowledge, you cannot verify whether your translated message conveys inappropriate connotations, uses outdated or offensive terminology, or simply sounds bizarre to native speakers. Despite this, circumstances often call for us to make do with what we have.

To this end, I found myself in a healthcare setting translating English to Mandarin using Claude, verifying that the translation was accurate, then generating audio with ElevenLabs. Anything done more than once is worth automating. So I built this tool that automates those three steps: it parses your message and thinks through cultural context before translating, back-translates through a fresh LLM context (so it can't cheat by remembering your original), and generates audio so you can play the message aloud for whoever you're talking with. The back-translation acts as a safety check, as the initial model aims to add cultural nuance from the target language, but can overshoot.
## How It Works

The core of this tool is a verification loop that ensures your message's intent is preserved. A failed check prompts you to revise your input, which then re-enters the workflow until you approve the translation.


```
┌──────────────┐
│ Your Message │
└──────┬───────┘
       ↓
┌──────────────────────────┐
│ LLM #1: Translate        │
│ (adds cultural context)  │
└──────┬───────────────────┘
       ↓
┌─────────────────────┐
│ Target Language Text│
└──────┬──────────────┘
       ↓
┌──────────────────────────┐
│   SAFETY CHECK / QC      │
├──────────────────────────┤
│ LLM #2: Fresh Context    │
│ "Translate this back to  │
│ English" (no memory of   │
│ your original message)   │
└──────┬───────────────────┘
       ↓
┌──────────────────────────┐
│   Back-translation       │
│   "This is what you're   │
│   actually saying"       │
└──────┬───────────────────┘
       ↓
┌──────────────────────────┐
│      PASS / FAIL?        │
│ Does this match your     │
│ intended meaning?        │
└──────┬───────────────────┘
       │
       ├─── ✗ FAIL ───┐
       │               ↓
       │         ┌─────────────┐
       │         │   REVISE    │
       │         │ Edit message│
       │         └─────┬───────┘
       │               ↓
       │          [Start Over]
       │
       └─── ✓ PASS
              ↓
       ┌──────────────────┐
       │ ElevenLabs TTS   │
       │ Generate Audio   │
       └──────┬───────────┘
              ↓
       ┌──────────────────┐
       │   Play Audio     │
       │       🔊         │
       └──────────────────┘
```

## Author
Austin Morrissey

## License
MIT

<img width="298" height="199" alt="image" src="https://github.com/user-attachments/assets/dda09e42-218d-4ced-a668-b6c84e115829" />

