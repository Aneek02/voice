import sys
import os
import json
from TTS.api import TTS

# Required packages: torch, torchaudio, TTS (install with: pip install torch torchaudio TTS)

# CLI arguments
passage_path = sys.argv[1]    # Path to passage.txt
voice_path = sys.argv[2]      # Path to uploaded/speaker WAV file
output_path = sys.argv[3]     # Directory to save output (should already exist)
voice_map = sys.argv[4] if len(sys.argv) > 4 else ''  # Optional voice map

print(f"Passage: {passage_path}")
print(f"Voice: {voice_path}")
print(f"Output: {output_path}")
print(f"Voice map: {voice_map}")

def main():
    # Load passage text
    with open(passage_path, 'r', encoding='utf-8') as f:
        passage = f.read().strip()
    if not passage:
        print("Passage is empty")
        sys.exit(1)

    output_file = os.path.join(output_path, 'final_output.wav')

    # Initialize TTS
    tts = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2", gpu=False)  # False for CPU, True for GPU

    # Check if voice sample file exists
    if not os.path.exists(voice_path):
        print(f"Voice sample file {voice_path} not found")
        sys.exit(1)

    # Run TTS
    try:
        tts.tts_to_file(
            text=passage,
            speaker_wav=voice_path,
            language="en",           # Default, adjust based on voice_map if needed
            file_path=output_file
        )
        print("✅ Synthesis successful")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Synthesis failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
