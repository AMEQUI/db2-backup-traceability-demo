"""Synthesizes the narration clips for the demo video with a neural voice (edge-tts, Microsoft Edge online voices).

Called by scripts/record-video.mjs when NARRATE=1. Needs internet access while it runs.
Manifest: JSON array of { file, text }; each `file` gets an MP3 written next to the requested path (same name, .mp3).
Env: TTS_VOICE (default en-US-AvaNeural), TTS_RATE (default -4%).
Install: pip install edge-tts
"""
import asyncio
import json
import os
import sys

import edge_tts

VOICE = os.environ.get("TTS_VOICE", "en-US-AvaNeural")
RATE = os.environ.get("TTS_RATE", "-4%")


async def main(manifest_path: str) -> None:
    with open(manifest_path, encoding="utf-8") as f:
        items = json.load(f)
    print(f"voice: {VOICE}")
    for item in items:
        out = os.path.splitext(item["file"])[0] + ".mp3"
        await edge_tts.Communicate(item["text"], VOICE, rate=RATE).save(out)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("usage: synth-voice.py <manifest.json>")
    asyncio.run(main(sys.argv[1]))
