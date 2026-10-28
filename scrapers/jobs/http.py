"""Polite fetching: the bot says who it is, asks one thing at a time with a pause, and follows robots.txt."""

import time
import urllib.error
import urllib.request
import urllib.robotparser
from email.message import Message
from urllib.parse import urlsplit

USER_AGENT = 'KayeBot/1.0 (+https://github.com/edu-mena/kaye)'
PAUSE_SECONDS = 3.0

_robots: dict[str, urllib.robotparser.RobotFileParser] = {}
_last_request = 0.0


def _open(url: str, accept: str) -> tuple[bytes, Message]:
    """One request, after the pause since the previous one, with retries on server errors."""
    global _last_request
    request = urllib.request.Request(url, headers={'User-Agent': USER_AGENT, 'Accept': accept})
    for attempt in range(3):
        wait = PAUSE_SECONDS - (time.monotonic() - _last_request)
        if wait > 0:
            time.sleep(wait)
        try:
            with urllib.request.urlopen(request, timeout=90) as response:
                return response.read(), response.headers
        except urllib.error.HTTPError as error:
            if error.code < 500 or attempt == 2:
                raise
        except (urllib.error.URLError, TimeoutError):
            if attempt == 2:
                raise
        finally:
            _last_request = time.monotonic()
        time.sleep(10 * (attempt + 1))
    raise RuntimeError('unreachable')


def allowed(url: str) -> bool:
    """Whether the site's robots.txt lets this bot read the URL. No robots.txt means yes."""
    parts = urlsplit(url)
    base = f'{parts.scheme}://{parts.netloc}'
    if base not in _robots:
        parser = urllib.robotparser.RobotFileParser()
        try:
            body, headers = _open(base + '/robots.txt', 'text/plain')
            # A site without robots.txt sometimes answers with its home page.
            text = '' if 'html' in (headers.get('Content-Type') or '') else body.decode('utf-8', 'ignore')
        except urllib.error.HTTPError:
            text = ''
        parser.parse(text.splitlines())
        _robots[base] = parser
    return _robots[base].can_fetch(USER_AGENT, url)


def get(url: str, accept: str = '*/*') -> tuple[bytes, Message]:
    if not allowed(url):
        raise PermissionError(f'robots.txt does not allow {url}')
    return _open(url, accept)
