import os
import sys
import json
from gtts import gTTS
from pydub import AudioSegment

# CLI Arguments
passage_path = sys.argv[1]  # e.g., passage.txt
voice_sample_path = sys.argv[2]  # (currently unused, for compatibility)
output_dir = sys.argv[3]  # where to save outputs
voice_map_json = sys.argv[4] if len(sys.argv) > 4 else None

# Read passage from file
with open(passage_path, 'r', encoding='utf-8') as f:
    passage = f.read()

# Split into paragraphs
paragraphs = [p.strip() for p in passage.strip().split('\n') if p.strip()]

# Parse voiceMap
voice_map = []
if voice_map_json:
    try:
        voice_map = json.loads(voice_map_json)
    except:
        print("⚠️ Failed to parse voiceMap, defaulting to 'en'")
        voice_map = []

# Ensure output directory exists
os.makedirs(output_dir, exist_ok=True)
final_audio = AudioSegment.empty()

for i, para in enumerate(paragraphs):
    # Pick voice language if provided
    lang = voice_map[i]['lang'] if i < len(voice_map) else 'en'

    tts = gTTS(text=para, lang=lang)
    mp3_path = os.path.join(output_dir, f"para_{i+1}.mp3")
    wav_path = os.path.join(output_dir, f"para_{i+1}.wav")

    tts.save(mp3_path)
    audio = AudioSegment.from_mp3(mp3_path)
    final_audio += audio
    audio.export(wav_path, format="wav")

# Save final combined
final_output_path = os.path.join(output_dir, "final_output.wav")
final_audio.export(final_output_path, format="wav")
print(f"✅ Final combined audio: {final_output_path}")
