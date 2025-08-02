import sys
import os
import json
import torch
from TTS.api import TTS

# Import all four required config classes
from TTS.tts.configs.xtts_config import XttsConfig
from TTS.tts.models.xtts import XttsAudioConfig, XttsArgs
from TTS.config.shared_configs import BaseDatasetConfig

# Add all four classes to the safe globals for PyTorch
torch.serialization.add_safe_globals([
    XttsConfig,
    XttsAudioConfig,
    BaseDatasetConfig,
    XttsArgs
])

# Function to safely print UTF-8 characters to the console
def safe_print(text):
    print(str(text).encode('utf-8', 'ignore').decode('utf-8'))

# CLI arguments
passage_path = sys.argv[1]
voice_path = sys.argv[2]
output_path = sys.argv[3]
voice_map = sys.argv[4] if len(sys.argv) > 4 else ''

safe_print(f"Passage: {passage_path}")
safe_print(f"Voice: {voice_path}")
safe_print(f"Output: {output_path}")
safe_print(f"Voice map: {voice_map}")

def main():
    # Load passage text
    with open(passage_path, 'r', encoding='utf-8') as f:
        passage = f.read().strip()
    if not passage:
        safe_print("Passage is empty")
        sys.exit(1)

    # Determine language from voice_map, default to 'en'
    language = 'en'
    try:
        vm = json.loads(voice_map)
        # Assuming the first key in the map determines the language
        first_key = next(iter(vm))
        language = vm[first_key].get('lang', 'en')
    except (json.JSONDecodeError, StopIteration):
        safe_print("Could not parse voice_map, defaulting to English.")
    
    safe_print(f"Using language: {language}")

    output_file = os.path.join(output_path, 'final_output.wav')

    # Initialize TTS
    tts = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2", gpu=False)

    # Check if voice sample file exists
    if not os.path.exists(voice_path):
        safe_print(f"Voice sample file {voice_path} not found")
        sys.exit(1)

    # Run TTS
    try:
        tts.tts_to_file(
            text=passage,
            speaker_wav=voice_path,
            language=language,
            file_path=output_file
        )
        safe_print("Synthesis successful")
        sys.exit(0)
    except Exception as e:
        safe_print(f"Synthesis failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()