"""Records the guide's sentences into public/voice (docs/decisoes/0013).

Run from apps/web, after sentences.ts:
    pip install edge-tts
    python scripts/voice/generate.py

Clips that already exist are skipped, and clips no sentence uses any more are removed.
"""

import asyncio
import json
from pathlib import Path

import edge_tts

SOURCE = Path("scripts/voice/sentences.json")
TARGET = Path("public/voice")
AT_ONCE = 3
ATTEMPTS = 5


async def record(clip: dict, limit: asyncio.Semaphore) -> None:
    path = TARGET / clip["voice"] / clip["file"]
    if path.exists():
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    partial = path.with_suffix(".part")
    async with limit:
        for attempt in range(1, ATTEMPTS + 1):
            try:
                await edge_tts.Communicate(clip["text"], clip["voice"]).save(str(partial))
                partial.replace(path)
                return
            except Exception:  # The service drops connections under load.
                if attempt == ATTEMPTS:
                    raise
                await asyncio.sleep(attempt * 2)


def remove_unused(clips: list[dict]) -> None:
    used = {TARGET / clip["voice"] / clip["file"] for clip in clips}
    for path in TARGET.glob("*/*.mp3"):
        if path not in used:
            path.unlink()


async def main() -> None:
    clips = json.loads(SOURCE.read_text(encoding="utf-8"))
    limit = asyncio.Semaphore(AT_ONCE)
    await asyncio.gather(*(record(clip, limit) for clip in clips))
    remove_unused(clips)
    print(f"{len(clips)} clips in {TARGET}")


asyncio.run(main())
