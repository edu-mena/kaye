"""Jobartis: a job board whose listing pages go from the newest post to the oldest, open and closed.

The cards give title, employer, place, contract and experience, but no date. Open posts say how many days
are left to apply; the page of a closed post gives its deadline ("Oferta aberta até 21/11/2025"). So the
listing is read first, one post in every few pages is dated (posted about 30 days before its deadline),
and the pages in between get dates on a straight line between those. These dates are marked as estimated.
"""

import html
import re
from collections.abc import Iterator
from datetime import date, timedelta

from .facts import province
from .http import get

BASE = 'https://www.jobartis.com'
SAMPLE_EVERY = 5
OPEN_DAYS = 30
# Employers that hide their name: "Confidencial", "Empresa líder em Petróleo e Gás".
_HIDDEN = re.compile(r'^(confidencial|empresa lider|empresa\b)', re.I)
# Open posts are "job", closed ones "job job--closed".
_CARD = re.compile(r'<div class="job(?: [^"]*)?">(.*?)<div class="panel-footer">(.*?)</div>', re.S)


def _text(markup: str) -> str:
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', markup))).strip()


def _experience(text: str) -> int | None:
    if re.search(r'nenhuma experi', text, re.I):
        return 0
    match = re.search(r'(\d+)\s+anos? de experi', text)
    return int(match.group(1)) if match else None


def listing(page: int) -> list[dict]:
    body, _ = get(f'{BASE}/vagas-emprego?page={page}', 'text/html')
    cards = []
    for card, footer in _CARD.findall(body.decode('utf-8', 'ignore')):
        url = re.search(r'class="job-link" href="([^"]+)"', card)
        title = re.search(r'class="job__title">(.*?)</h2>', card, re.S)
        if not url or not title:
            continue
        employer = re.search(r'class="job__company[^"]*">(.*?)</h5>', card, re.S)
        details = [_text(item) for item in re.findall(r'<li>(.*?)</li>', card, re.S)]
        days_left = re.search(r'Já só tem <strong>(\d+)</strong> dias', card)
        employer_name = _text(employer.group(1)) if employer else ''
        cards.append({
            'url': url.group(1),
            'title': _text(title.group(1)).rstrip('.'),
            'company': None if not employer_name or _HIDDEN.match(employer_name) else employer_name,
            'employer_hint': employer_name,
            'place': details[0] if details else '',
            'contract': details[1] if len(details) > 1 else None,
            'experience': _experience(' '.join(details[2:])),
            'category': _text(footer),
            'days_left': int(days_left.group(1)) if days_left else None,
        })
    return cards


def deadline(url: str) -> date | None:
    body, _ = get(url, 'text/html')
    match = re.search(r'Oferta aberta até\s*(\d{2})/(\d{2})/(\d{4})', _text(body.decode('utf-8', 'ignore')))
    return date(int(match.group(3)), int(match.group(2)), int(match.group(1))) if match else None


def _dated(page: int, cards: list[dict], today: date) -> date | None:
    """The estimated posting date of a page's first post, when it can be known."""
    first = cards[0]
    if first['days_left'] is not None:
        return min(today, today + timedelta(days=first['days_left'] - OPEN_DAYS))
    if page % SAMPLE_EVERY == 0:
        ends = deadline(first['url'])
        return min(today, ends - timedelta(days=OPEN_DAYS)) if ends else None
    return None


def _between(anchors: dict[int, date], page: int) -> date:
    """A page's date on the straight line between the dated pages around it (newest first)."""
    before = max((p for p in anchors if p <= page), default=None)
    after = min((p for p in anchors if p >= page), default=None)
    if before is None or after is None or before == after:
        return anchors[before if before is not None else after]  # type: ignore[index]
    span = (anchors[before] - anchors[after]).days
    return anchors[before] - timedelta(days=round(span * (page - before) / (after - before)))


def posts(since: date, today: date | None = None) -> Iterator[dict]:
    """Posts from the newest back to about `since`, with estimated posting dates."""
    today = today or date.today()
    pages: dict[int, list[dict]] = {}
    anchors: dict[int, date] = {}
    page = 1
    while True:
        cards = listing(page)
        if not cards:
            break
        pages[page] = cards
        dated = _dated(page, cards, today)
        if dated:
            anchors[page] = min(dated, *(anchors.values())) if anchors else dated
            if anchors[page] < since:
                break
        page += 1

    for number, cards in pages.items():
        posted = _between(anchors, number)
        for card in cards:
            yield {
                'id': card['url'].rsplit('/', 1)[-1],
                'date': posted.isoformat(),
                'date_estimated': True,
                'url': card['url'],
                'title': card['title'],
                'categories': ['Emprego'],
                # The board's category and the hidden employer's line ("Empresa líder em Petróleo e Gás").
                'sector_hint': f"{card['category']} {card['employer_hint']}",
                'text': '',
                'company': card['company'],
                'province': province('', [card['place']], ''),
                'contract': card['contract'],
                'experience': card['experience'],
            }
