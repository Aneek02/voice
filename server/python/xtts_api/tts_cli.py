# python/xtts_api/tts_cli.py

import sys, json, torchaudio, torch
from TTS.api import TTS
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2", gpu=False)
def main():

    cfg = json.loads(sys.stdin.readline())
    #Generates audio from text using a specified speaker and language.
    # Reads configuration from stdin, which includes text, speaker, language, and output file path
    wav = tts.tts(text=cfg["text"],
                  speaker_wav=cfg["speaker"],
                  language=cfg.get("lang","en"))
    torchaudio.save(cfg["out"], torch.tensor(wav).unsqueeze(0), 24000)

if __name__=="__main__": main() # Entry point
# This script is designed to be run in a CLI environment where it reads JSON input from stdin
# and outputs a generated audio file based on the provided text and speaker information.

"""
Sample json input for stdin:
{
  "text": "Hello, this is a test.",
  "speaker": "/path/to/speaker_sample.wav",
  "lang": "en",
  "out": "/path/to/output_speech.wav"
}"""
