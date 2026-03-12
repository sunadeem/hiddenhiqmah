#!/bin/bash
# Download word-level audio timestamps from Quran.com API for Mishari al-Afasy (reciter 7)
# Format: segments = [[word_pos, word_index, start_ms, end_ms], ...]

OUT_DIR="src/data/quran/timestamps"
mkdir -p "$OUT_DIR"

for chapter in $(seq 1 114); do
  FILE="$OUT_DIR/${chapter}.json"
  if [ -f "$FILE" ]; then
    echo "Skipping chapter $chapter (already exists)"
    continue
  fi

  echo "Downloading chapter $chapter..."

  # Fetch with pagination - some surahs have many verses
  DATA=$(curl -s "https://api.quran.com/api/v4/recitations/7/by_chapter/${chapter}?fields=segments&per_page=300")

  # Extract and transform: { "verseNumber": [[start_ms, end_ms], ...], ... }
  echo "$DATA" | python3 -c "
import json, sys
data = json.load(sys.stdin)
result = {}
for af in data.get('audio_files', []):
    vk = af['verse_key']
    verse_num = vk.split(':')[1]
    segs = af.get('segments', [])
    # Convert to simple [start_ms, end_ms] pairs per word
    result[verse_num] = [[s[2], s[3]] for s in segs if len(s) >= 4]
json.dump(result, sys.stdout, separators=(',', ':'))
" > "$FILE"

  # Rate limit - be nice to the API
  sleep 0.5
done

echo "Done! Downloaded timestamps for all 114 surahs."
