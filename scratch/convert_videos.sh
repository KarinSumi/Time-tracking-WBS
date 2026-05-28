#!/bin/bash
set -e

VIDEO_DIR="videos"
DEST_DIR="../frontend/public/tutorial/assets"

mkdir -p $DEST_DIR

for file in $VIDEO_DIR/*.webm; do
  if [ -f "$file" ]; then
    filename=$(basename -- "$file")
    name="${filename%.*}"
    
    echo "Converting $name..."
    # Convert to mp4
    ffmpeg -y -i "$file" -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 128k "$DEST_DIR/$name.mp4"
    # Convert to webp thumbnail/loop
    ffmpeg -y -i "$file" -vcodec libwebp -lossless 0 -q:v 50 -loop 0 -an -vsync 0 -t 5 -s 640x360 "$DEST_DIR/$name.webp"
  fi
done
echo "All conversions complete!"
