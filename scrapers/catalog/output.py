"""What an area's script writes: the whole area for the record (catalog/<area>.json) and, for the app
(apps/web/src/data/catalog/<area>.json), the institutions with a province, the training and the employers with a name.
The first areas (health to education) write their own files; the ones after them share this."""

import json
from collections.abc import Callable
from pathlib import Path

from jobs.summarize import _company_key

from .health import teaching

HERE = Path(__file__).resolve().parent
APP = HERE.parents[1] / 'apps' / 'web' / 'src' / 'data' / 'catalog'
JOBS = {'label': 'Anúncios de emprego (Jobartis, AngoEmprego e outros)', 'url': 'https://www.jobartis.com'}
STATUTES = 'https://angolex.com/paginas/decreto-presidencial/'


def site(url: str) -> dict:
    return {'label': 'Página oficial', 'url': url}


def statute(label: str, page: str) -> dict:
    """A body's statute on AngoLEX, when its own site does not answer."""
    return {'label': f'{label} (AngoLEX)', 'url': f'{STATUTES}{page}.html'}


def write(area: str, in_area: Callable[[dict], bool], *, named: list[dict], training: list[dict] | None = None,
          ads: list[dict] | None = None, ad_sector: str = 'comercio', salaries: dict | None = None) -> None:
    institutions, courses, yearbook = teaching(in_area)
    sources = {'education': {key: yearbook[key] for key in ('label', 'url')}, 'jobs': JOBS}
    data = {
        'area': area,
        'sources': sources,
        'teaching': {'year': yearbook['year'], 'institutions': institutions, 'courses': courses},
        'training': training or [],
        'salaries': salaries,
        'employers': {'named': named, 'jobAds': ads or []},
    }
    (HERE / f'{area}.json').write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n', encoding='utf-8',
                                       newline='\n')
    known = {_company_key(employer['name']) for employer in named}
    app = {
        'year': yearbook['year'],
        'sources': sources,
        'institutions': [
            {**institution, 'courses': [{key: course[key] for key in ('name', 'students', 'graduates')}
                                        for course in institution['courses']]}
            for institution in institutions
            if institution['province']
        ],
        'training': training or [],
        'employers': [{**employer, 'province': 'Luanda'} for employer in named] + [
            {'name': ad['name'], 'sector': ad_sector, 'kind': 'anuncios', 'province': 'Luanda',
             'postings': ad['postings'], 'source': JOBS}
            for ad in ads or []
            if _company_key(ad['name']) not in known
        ],
    }
    (APP / f'{area}.json').write_text(json.dumps(app, ensure_ascii=False, indent=1) + '\n', encoding='utf-8',
                                      newline='\n')
    print(f"{area}: {len(institutions)} institutions, {len(courses)} courses, {len(named)} named employers, "
          f"{len(ads or [])} from the job ads")
