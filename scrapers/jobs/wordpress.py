"""Job blogs built on WordPress: their public REST API lists every post, newest first."""

import html
import json
import re
from collections.abc import Iterator

from .http import get

FIELDS = 'id,date,link,title,categories,content'


def _text(markup: str) -> str:
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', markup))).strip()


def categories(site: str) -> dict[int, str]:
    names: dict[int, str] = {}
    page = 1
    while True:
        body, headers = get(f'https://{site}/wp-json/wp/v2/categories?per_page=100&page={page}&_fields=id,name')
        for category in json.loads(body):
            names[category['id']] = html.unescape(category['name'])
        if page >= int(headers.get('X-WP-TotalPages') or 1):
            return names
        page += 1


def posts(site: str, after: str | None = None) -> Iterator[dict]:
    """Every post (or those after an ISO date): its id, date, link, title, category names and plain text."""
    names = categories(site)
    page = 1
    while True:
        url = f'https://{site}/wp-json/wp/v2/posts?per_page=100&page={page}&_fields={FIELDS}'
        if after:
            url += f'&after={after}'
        body, headers = get(url, 'application/json')
        for post in json.loads(body):
            yield {
                'id': post['id'],
                'date': post['date'][:10],
                'url': post['link'],
                'title': _text(post['title']['rendered']),
                'categories': [names.get(category, '') for category in post.get('categories', [])],
                'text': _text(post['content']['rendered']),
            }
        if page >= int(headers.get('X-WP-TotalPages') or 1):
            return
        page += 1
