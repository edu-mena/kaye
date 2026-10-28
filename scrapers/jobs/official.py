"""Public competitions from the Diário da República: the dispatches that open a competition for new posts (or give
it posts, province by province), as AngoLEX publishes them, with the posts, the body and the date of each.

    python -m jobs.official

AngoLEX's sitemap lists every page; only the new dispatches are read (one page each, 3 s apart). Writes
data/competitions.jsonl, one dispatch per line. Only facts are kept.
"""

import json
import re
import sys
from datetime import date
from pathlib import Path

from .facts import fold, province
from .http import get
from .jobartis import _text
from .summarize import BODIES, MINISTRIES, body_in_title, competition_area

DATA = Path(__file__).resolve().parent.parent / 'data' / 'competitions.jsonl'
SITEMAP = 'https://angolex.com/sitemap.xml'
SOURCE = {'id': 'angolex', 'name': 'Diário da República (AngoLEX)', 'url': 'https://angolex.com'}
# A competition for new posts: "ingresso externo", "recrutamento de novos agentes", "atribuição de vagas".
_NEW_POSTS = re.compile(r'concurso-publico.*(ingresso|recrutamento|vagas|carreira)|vagas.*concurso-publico')
# Not new posts: promotions of those already in the State, a judge's seat, the rules alone, and tenders.
_NOT_NEW_POSTS = re.compile(
    r'ingresso-interno|-acesso-|curricular|termos-de-referencia|termos-referencia|calendarizacao|aquisicao|'
    r'construcao|privatizacao|'
    r'alimentacao|servicos-de|despesa|empreitada|fornecimento'
)
_POSTS = re.compile(r'(\d{1,3}(?:\.\d{3})+|\d+)\s*(?:\([^)]*\)\s*)?(?:novos agentes|vagas|lugares)', re.I)
_SIGNED = re.compile(r'aos (\d{1,2}) de (\w+) de (\d{4})')
_MONTHS = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro',
           'novembro', 'dezembro']
_MINISTRY = re.compile(r'(Ministério d[aoe]s? .+?)(?=,? para | e Termos|$)')


def _body(title: str, area: str) -> str | None:
    """The body that opens the competition: a ministry named in the title, or the Ministry of Health for the
    doctors given to each province (the same national competition)."""
    named = body_in_title(title)
    if named:
        return named
    ministry = _MINISTRY.search(title)
    if ministry:
        first = fold(ministry.group(1)).split()[2]
        return MINISTRIES.get(first, ministry.group(1).strip())
    if 'ensino superior' in fold(title):
        return BODIES['mescti']
    return BODIES['minsa'] if area == 'health' else None


def dispatch(url: str) -> dict | None:
    """One dispatch's facts, or None when its page has no title."""
    body, _ = get(url, 'text/html')
    text = _text(re.sub(r'<(script|style)\b.*?</\1>', ' ', body.decode('utf-8', 'ignore'), flags=re.S))
    # The page's own heading: the last "Despacho … n.º" before the summary (the first is the menu's).
    end = text.find(' SUMÁRIO')
    starts = [match.start() for match in re.finditer(r'Despacho[^-–]{0,40}?n\.º [\d/]+\s*[-–]', text[: max(end, 0)])]
    if not starts:
        return None
    heading = text[starts[-1] : end].strip()
    posts = _POSTS.search(heading) or _POSTS.search(text[end:])
    signed = _SIGNED.search(fold(text))
    area = competition_area(heading, None)
    return {
        'id': url.rsplit('/', 1)[-1].removesuffix('.html'),
        'source': SOURCE['id'],
        'url': url,
        'title': heading,
        'date': date(int(signed.group(3)), _MONTHS.index(signed.group(2)) + 1, int(signed.group(1))).isoformat()
        if signed and signed.group(2) in _MONTHS
        else None,
        'openings': int(posts.group(1).replace('.', '')) if posts else None,
        'body': _body(heading, area),
        'area': area,
        'province': province(heading, [], ''),
    }


def load() -> dict[str, dict]:
    if not DATA.exists():
        return {}
    with DATA.open(encoding='utf-8') as file:
        return {row['id']: row for row in map(json.loads, file)}


def main() -> None:
    rows = load()
    sitemap, _ = get(SITEMAP, 'application/xml')
    urls = sorted(set(re.findall(r'<loc>([^<]+)</loc>', sitemap.decode('utf-8', 'ignore'))))
    found = [url for url in urls if _NEW_POSTS.search(url) and not _NOT_NEW_POSTS.search(url)]
    new = [url for url in found if url.rsplit('/', 1)[-1].removesuffix('.html') not in rows]
    print(f'{len(found)} competition dispatches, {len(new)} new', file=sys.stderr)
    for url in new:
        row = dispatch(url)
        if row:
            rows[row['id']] = row
    DATA.parent.mkdir(parents=True, exist_ok=True)
    ordered = sorted(rows.values(), key=lambda row: (row['date'] or '', row['id']), reverse=True)
    DATA.write_text(''.join(json.dumps(row, ensure_ascii=False) + '\n' for row in ordered), encoding='utf-8')
    print(f'{len(rows)} dispatches in {DATA}', file=sys.stderr)


if __name__ == '__main__':
    main()
