"""Ver Angola Empregos: its RSS feed has the latest posts, each with employer, province, town and category.

The feed only holds the newest few dozen, so the history grows from one weekly run to the next.
"""

import html
import re
from collections.abc import Iterator
from email.utils import parsedate_to_datetime

from .http import get

FEED = 'https://empregos.verangola.net/feed'


def _field(item: str, name: str) -> str:
    match = re.search(rf'<{name}>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?</{name}>', item, re.S)
    return html.unescape(match.group(1)).strip() if match else ''


def posts() -> Iterator[dict]:
    body, _ = get(FEED, 'application/rss+xml')
    for item in re.findall(r'<item>(.*?)</item>', body.decode('utf-8', 'ignore'), re.S):
        link = _field(item, 'link')
        anonymous = _field(item, 'anonimo') == '1'
        yield {
            'id': link.rsplit('_i', 1)[-1],
            'date': parsedate_to_datetime(_field(item, 'pubDate')).date().isoformat(),
            'url': link,
            'title': _field(item, 'title'),
            'categories': ['Emprego'],
            'sector_hint': _field(item, 'category'),
            'text': '',
            'company': None if anonymous else (_field(item, 'company') or None),
            'province': _field(item, 'region') or None,
        }
