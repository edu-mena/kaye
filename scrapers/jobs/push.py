"""Sends the facts of the collected posts to the API (POST /api/v1/ingest/jobs).

    python -m jobs.push                        # every stored post
    python -m jobs.push --since 2026-11-20     # only the posts of that date on (the light run)

Needs KAYE_API_URL (the site, e.g. https://kaye.example) and INGEST_TOKEN (the same secret as the server's). Without
either it says so and stops with success, so a run before the server is connected does not fail. Only facts are sent.
"""

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request
from collections.abc import Iterator
from pathlib import Path

from .http import USER_AGENT

DATA = Path(__file__).resolve().parent.parent / 'data' / 'postings.jsonl'
BATCH = 500  # the API refuses more rows than this in one request
FIELDS = ('id', 'source', 'date', 'url', 'title', 'kind', 'company', 'province', 'sector', 'career', 'openings')


def facts(rows: list[dict], since: str | None) -> list[dict]:
    """The rows from `since` on, reduced to the fields the API keeps (never any text of the post)."""
    return [{key: row.get(key) for key in FIELDS} for row in rows if not since or row['date'] >= since]


def batches(rows: list[dict]) -> Iterator[list[dict]]:
    for start in range(0, len(rows), BATCH):
        yield rows[start:start + BATCH]


def send(url: str, token: str, rows: list[dict]) -> dict:
    """One request, tried up to 3 times on server errors and network failures."""
    body = json.dumps({'jobs': rows}, ensure_ascii=False).encode('utf-8')
    request = urllib.request.Request(
        f"{url.rstrip('/')}/api/v1/ingest/jobs",
        data=body,
        method='POST',
        headers={'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': f'Bearer {token}', 'User-Agent': USER_AGENT},
    )
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                return json.load(response)
        except urllib.error.HTTPError as error:
            if error.code < 500 or attempt == 2:
                raise
        except (urllib.error.URLError, TimeoutError):
            if attempt == 2:
                raise
        time.sleep(5 * (attempt + 1))
    raise RuntimeError('unreachable')


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--since', help='only posts dated from this day on (YYYY-MM-DD)')
    args = parser.parse_args()

    url, token = os.environ.get('KAYE_API_URL', ''), os.environ.get('INGEST_TOKEN', '')
    if not url or not token:
        print('KAYE_API_URL or INGEST_TOKEN is not set: nothing sent.', file=sys.stderr)
        return 0
    if not DATA.exists():
        print('No postings to send.', file=sys.stderr)
        return 0

    with DATA.open(encoding='utf-8') as file:
        rows = facts([json.loads(line) for line in file], args.since)
    saved = rejected = 0
    for batch in batches(rows):
        answer = send(url, token, batch)
        saved += answer.get('saved', 0)
        rejected += answer.get('rejected', 0)
    print(f'{len(rows)} posts sent: {saved} saved, {rejected} rejected.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
