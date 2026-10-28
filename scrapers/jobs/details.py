"""Jobartis: the facts on each post's own page, which the listing does not show: the minimum education, the
course asked for, the number of openings and the deadline (a better date than the listing's estimate).

    python -m jobs.details              # the posts of the last 60 days not read yet
    python -m jobs.details --days 120

Saves every 50 posts, so it can be stopped and started again. Only facts are kept, never the text.
"""

import argparse
import re
import sys
import urllib.error
from datetime import date, timedelta

from areas import known_course_area

from .collect import load, save
from .facts import education
from .jobartis import OPEN_DAYS, _text
from .http import get

SAVE_EVERY = 50
# Only the recent posts: what employers ask now, at 3 s a page.
DAYS = 60


def read(url: str, today: date) -> dict:
    """The facts of one post's page."""
    body, _ = get(url, 'text/html')
    text = _text(body.decode('utf-8', 'ignore'))
    level = re.search(r'Titulação mínima (.+?) (?:Experiência|Nacionalidade|Línguas|Area funcional)', text)
    count = re.search(r'Número de vagas (\d+)', text)
    deadline = re.search(r'Oferta aberta até\s*(\d{2})/(\d{2})/(\d{4})', text)
    described = text[text.find('Descrição') :] if 'Descrição' in text else text
    found_level, course = education(level.group(1)) if level else (None, None)
    if level and not found_level:
        print(f'Unknown education level: {level.group(1)!r}', file=sys.stderr)
    course = education(described)[1] or course
    facts = {
        'education': found_level,
        'field': known_course_area(course) if course else None,
        'openings': int(count.group(1)) if count else None,
    }
    if deadline:
        ends = date(int(deadline.group(3)), int(deadline.group(2)), int(deadline.group(1)))
        facts['deadline'] = ends.isoformat()
        facts['date'] = min(today, ends - timedelta(days=OPEN_DAYS)).isoformat()
    return facts


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--days', type=int, default=DAYS, help='only the posts of the last days')
    args = parser.parse_args()

    today = date.today()
    since = (today - timedelta(days=args.days)).isoformat()
    rows = load()
    todo = [key for key, row in rows.items() if row['source'] == 'jobartis' and row['date'] >= since and 'education' not in row]
    print(f'{len(todo)} Jobartis posts to read', file=sys.stderr)
    for done, key in enumerate(todo, 1):
        try:
            rows[key] = {**rows[key], **read(rows[key]['url'], today)}
        except urllib.error.HTTPError as error:
            if error.code != 404:
                raise
            rows[key] = {**rows[key], 'education': None, 'field': None}  # the post is gone
        if done % SAVE_EVERY == 0 or done == len(todo):
            save(rows)
            print(f'{done}/{len(todo)}', file=sys.stderr)


if __name__ == '__main__':
    main()
