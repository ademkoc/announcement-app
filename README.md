# Announcement-to-Text Notifier

This tool automatically **converts audio files recorded with [RTLSDR-Airband](https://github.com/rtl-airband/RTLSDR-Airband) into text** and **sends the transcriptions to a specific channel via [ntfy.sh](https://ntfy.sh/)**.

### How It Works

- Audio is recorded using RTLSDR-Airband.
- Each file is processed through the selected Speech-to-Text engine.
- The transcription is sent to a channel via ntfy.sh.

## Supported Speech-to-Text Services

- **[Whisper.cpp](https://github.com/ggml-org/whisper.cpp?tab=readme-ov-file#quick-start)**
- **Azure Cognitive Services**

## Requirements & Setup

### Whisper.cpp

To use Whisper.cpp:

- Install it following the official instructions.
- Create a symlink named `whisper-cli` pointing to the binary.

### Azure Cognitive Services

- Azure supports only .wav files.
- RTLSDR-Airband records audio as .mp3, so you’ll need to convert the files before transcription.
- Make sure GStreamer is installed with the necessary plugins (e.g., gstreamer-plugins-good, gstreamer-plugins-ugly, etc.). 
- To convert .mp3 to .wav, use:

```bash
gst-launch-1.0 filesrc location=input.mp3 ! decodebin ! audioconvert ! audioresample ! wavenc ! filesink location=output.wav
```
