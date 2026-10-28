"""Collects job posts from the sources into data/postings.jsonl, one fact sheet per post.

    python -m jobs.collect                       # everything each source has
    python -m jobs.collect --since 2026-10-01    # only the new ones
    python -m jobs.collect --reclassify          # redo kind, sector, career and employer from the stored titles

Only facts are kept (date, title, kind, company, province, openings, salary, sector, career, contract,
experience). The text of the post is read to find them and then dropped: it is never stored nor shown.
"""

import argparse
import json
import sys
from datetime import date, timedelta
from pathlib import Path

from areas import known_course_area

from . import jobartis, verangola, wordpress
from .classify import career, employer_sector, sector
from .facts import company, education, kind, openings, province, salary

DATA = Path(__file__).resolve().parent.parent / 'data' / 'postings.jsonl'

SOURCES = [
    {'id': 'angovagas', 'name': 'AngoVagas', 'site': 'angovagas.net', 'type': 'wordpress'},
    {'id': 'angoemprego', 'name': 'Ango Emprego', 'site': 'angoemprego.com', 'type': 'wordpress'},
    {'id': 'angorecruta', 'name': 'AngoRecruta', 'site': 'angorecruta.com', 'type': 'wordpress'},
    {'id': 'jobartis', 'name': 'Jobartis', 'site': 'www.jobartis.com', 'type': 'jobartis'},
    {'id': 'verangola', 'name': 'Ver Angola Empregos', 'site': 'empregos.verangola.net', 'type': 'verangola'},
]
# Boards whose employer comes from the board itself, not from the title.
STRUCTURED = {'jobartis', 'verangola'}
# How far back a board without dates is read (Jobartis keeps its closed posts for years).
HISTORY_DAYS = 400
# Facts from a post's own page (jobs.details); a new pass over the listing keeps them.
DETAILS = {'education', 'field', 'openings', 'deadline', 'date'}


def classify(title: str, what: str, employer: str | None, hint: str | None) -> tuple[str, str | None]:
    """The sector (from the title, then the board's category, then the employer) and the tech career."""
    in_sector = sector(title)
    if in_sector == 'other' and hint:
        in_sector = sector(hint)
    if in_sector == 'other':
        in_sector = employer_sector(employer or title) or 'other'
    if what == 'concurso' and in_sector == 'other':
        in_sector = 'public_admin'  # a public competition for many posts at once
    return in_sector, career(title, in_sector)


def facts(source: str, post: dict) -> dict | None:
    """A post's fact sheet, or None when the post is not a job (tips, news, digests)."""
    what = kind(post['title'], post['categories'])
    if what is None:
        return None
    employer = post.get('company') or company(post['title'])
    in_sector, tech_career = classify(post['title'], what, employer, post.get('sector_hint'))
    level, course = education(post['text'])
    return {
        'id': f"{source}:{post['id']}",
        'source': source,
        'date': post['date'],
        'date_estimated': post.get('date_estimated', False),
        'url': post['url'],
        'title': post['title'],
        'kind': what,
        'company': employer,
        'province': post.get('province') or province(post['title'], post['categories'], post['text']),
        'openings': openings(post['title']),
        'salary': salary(post['text']),
        'sector': in_sector,
        'sector_hint': post.get('sector_hint'),
        'career': tech_career,
        'contract': post.get('contract'),
        'experience': post.get('experience'),
        # Boards without the text (Jobartis) get these from each post's page (jobs.details).
        **({'education': level, 'field': known_course_area(course) if course else None} if post['text'] else {}),
    }


def reclassify(rows: dict[str, dict]) -> dict[str, dict]:
    """The stored posts classified again with the current rules, without asking the sites."""
    kept = {}
    for key, row in rows.items():
        what = kind(row['title'], ['Emprego'])
        if what is None:
            continue  # news or a digest, by today's rules
        what = row['kind'] if what == 'vaga' else what
        employer = row['company'] if row['source'] in STRUCTURED else company(row['title'])
        in_sector, tech_career = classify(row['title'], what, employer, row.get('sector_hint'))
        kept[key] = {**row, 'kind': what, 'company': employer, 'sector': in_sector, 'career': tech_career}
    return kept


def load() -> dict[str, dict]:
    if not DATA.exists():
        return {}
    with DATA.open(encoding='utf-8') as file:
        return {row['id']: row for row in map(json.loads, file)}


def save(rows: dict[str, dict]) -> None:
    DATA.parent.mkdir(parents=True, exist_ok=True)
    ordered = sorted(rows.values(), key=lambda row: (row['date'], row['id']), reverse=True)
    # Written aside and swapped in, so a reader never sees half a file.
    partial = DATA.with_suffix('.tmp')
    with partial.open('w', encoding='utf-8', newline='\n') as file:
        for row in ordered:
            file.write(json.dumps(row, ensure_ascii=False) + '\n')
    partial.replace(DATA)


def found_in(source: dict, since: str | None):
    if source['type'] == 'jobartis':
        start = date.fromisoformat(since) if since else date.today() - timedelta(days=HISTORY_DAYS)
        return jobartis.posts(start)
    if source['type'] == 'verangola':
        return verangola.posts()
    return wordpress.posts(source['site'], f'{since}T00:00:00' if since else None)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--since', help='only posts after this date (YYYY-MM-DD)')
    parser.add_argument('--source', action='append', help='only these sources (ids)')
    parser.add_argument('--reclassify', action='store_true', help='redo the classification of the stored posts')
    args = parser.parse_args()

    rows = load()
    if args.reclassify:
        rows = reclassify(rows)
        save(rows)
        print(f'{len(rows)} jobs reclassified in {DATA}', file=sys.stderr)
        return

    for source in SOURCES:
        if args.source and source['id'] not in args.source:
            continue
        seen = kept = 0
        for post in found_in(source, args.since):
            seen += 1
            sheet = facts(source['id'], post)
            if sheet:
                # What jobs.details read on the post's page stays (and its date, from the deadline).
                old = rows.get(sheet['id'], {})
                kept_details = 'education' in old and 'education' not in sheet
                read = {key: value for key, value in old.items() if key in DETAILS} if kept_details else {}
                rows[sheet['id']] = {**sheet, **read}
                kept += 1
            if seen % 500 == 0:
                print(f"{source['id']}: {seen} posts read, {kept} jobs", flush=True)
                save(rows)
        print(f"{source['id']}: done, {seen} posts read, {kept} jobs", flush=True)
        save(rows)
    print(f'{len(rows)} jobs in {DATA}', file=sys.stderr)


if __name__ == '__main__':
    main()
