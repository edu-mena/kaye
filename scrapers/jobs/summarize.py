"""The Mercado's summary of job posts: the last 12 months, counted by month, area, sector, province, employer,
tech career and source. Only counts leave this folder; the posts themselves never reach the app.

    python -m jobs.summarize
"""

import json
import re
from collections import Counter, defaultdict
from datetime import date, timedelta
from pathlib import Path
from statistics import median

from areas import sector_area

from .collect import DATA, SOURCES
from .facts import PROVINCES, fold

# The dispatches of the Diário da República (jobs.official).
OFFICIAL = DATA.parent / 'competitions.jsonl'
OUTPUT = Path(__file__).resolve().parents[2] / 'apps' / 'web' / 'src' / 'data' / 'market' / 'jobs.json'
TOP_COMPANIES = 12
LEGAL_FORM = re.compile(r'\b(s\.?a\.?|lda\.?|limitada|sarl)(?=\W|$)', re.I)
# Recruitment agencies and boards that publish for their clients: counted apart from the employers.
AGENCIES = re.compile(
    r'kept people|ascending|jobartis|recrut|recruit|recursos humanos|outsourcing|staffing|talent|headhunt|'
    r'manpower|adecco|randstad|michael page|\bhays\b'
)
# Employers a board hides behind a description ("Indústria do sector alimentar").
UNNAMED = re.compile(r'^(industria d[oe] sector|a leading company|projecto de|empresa\b|confidencial|multinacional)')
# The minimum experience asked, in years: none, 1 to 2, 3 to 5, 6 or more.
EXPERIENCE = [('none', 0, 0), ('junior', 1, 2), ('mid', 3, 5), ('senior', 6, 99)]
# 3-month blocks, so the estimated dates of a board do not make monthly spikes.
BLOCK_MONTHS = 3


def _company_key(name: str) -> str:
    """'UNITEL S.A.' and 'Unitel' are the same employer, and so are 'MINEA - RECLIMA' and 'MINEA (UCP)'."""
    key = LEGAL_FORM.sub('', fold(re.split(r'\s+-\s+|\s*\(', name)[0]))
    key = re.sub(r'\bangola\b', '', key)
    return re.sub(r'[^a-z0-9]+', ' ', key).strip()


def _display(name: str) -> str:
    """An employer's name without its legal form: 'SOL SORRISO - COMÉRCIO E INDÚSTRIA LIMITADA .' loses 'LIMITADA .'."""
    return LEGAL_FORM.sub('', name).strip(' .,-–')


def _counts(counter: Counter, key: str) -> list[dict]:
    return [{key: name, 'postings': count} for name, count in counter.most_common()]


def _employers(recent: list[dict], agencies: bool) -> list[dict]:
    """The employers (or the agencies) with most posts, each under its most common spelling."""
    names: dict[str, Counter] = defaultdict(Counter)
    for row in recent:
        name = row['company']
        if not name or UNNAMED.match(fold(name)) or bool(AGENCIES.search(fold(name))) != agencies:
            continue
        names[_company_key(name)][name] += 1
    return sorted(
        (
            {'name': _display(variants.most_common(1)[0][0]), 'postings': sum(variants.values())}
            for variants in names.values()
        ),
        key=lambda company: -company['postings'],
    )


def blocks(months: Counter, latest: date) -> list[dict]:
    """The 12 months in blocks of 3, the last one ending with the newest month, oldest first."""
    month = latest.year * 12 + latest.month - 1
    keys = [f'{(month - n) // 12}-{(month - n) % 12 + 1:02d}' for n in range(12)][::-1]
    return [
        {'month': keys[at], 'postings': sum(months[key] for key in keys[at : at + BLOCK_MONTHS])}
        for at in range(0, 12, BLOCK_MONTHS)
    ]


def asks(recent: list[dict]) -> dict:
    """What the posts ask for: the minimum education, the area of the course and the years of experience.
    Each share counts only the posts that say it."""
    levels = Counter(row['education'] for row in recent if row.get('education'))
    fields = Counter(row['field'] for row in recent if row.get('field'))
    years = [row['experience'] for row in recent if row.get('experience') is not None]
    return {
        'read': sum(1 for row in recent if 'education' in row),
        'education': _counts(levels, 'level'),
        'fields': _counts(fields, 'area'),
        'experience': [
            {'band': band, 'postings': sum(1 for value in years if low <= value <= high)}
            for band, low, high in EXPERIENCE
        ],
    }


# A competition being opened, not news about its tests, results or lists.
_OPENS = re.compile(r'\b(abre|abriu|abertura|abert[oa]s?|lanca|vagas)\b')
_STAGE = re.compile(
    r'\b(datas?|testes?|exames?|resultados?|listas?|guia|calendario|consult\w*|admitid\w*|preparacao|topicos|'
    r'reclama\w*|transparencia|devem|seleccionad\w*|selecionad\w*|provas?|psicotecnic\w*|'
    # Not new posts: competitions for those already in the State, and tenders to buy things.
    r'intern[oa]|promocao|progressao|aquisicao|fornecimento|empreitada|medicamentos)\b'
)
# Dates within this many days, the same number of posts and the same province: the same competition
# published by several blogs.
SAME_COMPETITION_DAYS = 45
# A big number of posts is the same competition even when the news comes back months later.
BIG_COMPETITION = 100
# (The MINSA's 6 000 posts were announced in January and opened in July.)
SAME_BIG_COMPETITION_DAYS = 270
# Acronyms the news use for the bodies that open the most competitions.
BODIES = {
    'minint': 'Ministério do Interior', 'minsa': 'Ministério da Saúde', 'med': 'Ministério da Educação',
    'mescti': 'Ministério do Ensino Superior, Ciência, Tecnologia e Inovação',
    'mirempet': 'Ministério dos Recursos Minerais, Petróleo e Gás', 'mjdh': 'Ministério da Justiça e dos Direitos Humanos',
    'csmj': 'Conselho Superior da Magistratura Judicial', 'gpl': 'Governo Provincial (Luanda)',
}
_PROVINCES = {fold(name): name for name in PROVINCES}
# The area of a competition's posts: from its title first ("professores"), then from the body that opens it;
# public administration when neither says.
COMPETITION_AREAS = [
    ('education', r'professor|docente|educacao|ensino|escola|pedagog|\bmed\b'),
    ('health', r'saude|enferm|medic|hospita|minsa|diagnostico|farmac'),
    ('legal', r'justica|magistra|juiz|tribuna|procuradori|registos|notariado|csmj|mjdh'),
    ('public', r'policia|agentes|efectivos|militar|forcas armadas|defesa|bombeiro|interior|minint|penitencia|'
     r'migracao|\bsme\b|protecao civil'),
    ('business', r'financas|\bagt\b|tributari|banco nacional|\bbna\b|economia|comercio'),
    ('agriculture', r'agricultura|pescas|florest|ambiente'),
    ('oil_mining', r'petrole|recursos minerais|mirempet|geolog|\bminas\b'),
    ('engineering', r'obras publicas|construcao|energia|aguas|minea'),
    ('logistics', r'transportes|aeroport|portos|caminhos de ferro'),
    ('technology', r'telecomunica|tecnologias|informatica|mtti'),
    ('communication', r'comunicacao social|cultura|jornal'),
    ('hospitality', r'turismo|hotel'),
]
_COMPETITION_AREAS = [(area, re.compile(pattern)) for area, pattern in COMPETITION_AREAS]


def competition_area(title: str, body: str | None) -> str:
    for text in (fold(title), fold(body or '')):
        area = next((area for area, pattern in _COMPETITION_AREAS if pattern.search(text)), None)
        if area:
            return area
    return 'public'


def _body(name: str | None) -> str | None:
    """The public body that opens a competition, from the employer found in the title."""
    if not name:
        return None
    name = re.sub(r'^(o|a|os|as)\s+', '', name.strip(), flags=re.I)
    name = re.sub(r'\s+(com|para)\s+\d.*$|\s+de$', '', name, flags=re.I).strip()
    folded = fold(name)
    if folded in BODIES:
        return BODIES[folded]
    if folded.startswith('ensino superior'):  # "…do Ensino Superior e Investigação Científica"
        return BODIES['mescti']
    # "Governo do Cuando", "Governo da Província do Cuando" and "Governo Provincial de Luanda".
    province_of = re.match(r'^governo(?: provincial| da provincia)? d[aoe]s? (.+)$', folded)
    folded = province_of.group(1) if province_of else folded
    if folded in _PROVINCES:
        return f'Governo Provincial ({_PROVINCES[folded]})'
    return None if re.search(r'vagas|preenchimento|apos|concurso', folded) or len(name) < 3 else name


# Ministries the titles name without an employer the title parser can find ("Concurso Público 2026 Ministério da
# Saúde: …"), by their acronym or the first word after "Ministério da".
MINISTRIES = {
    'saude': BODIES['minsa'], 'educacao': BODIES['med'], 'interior': BODIES['minint'], 'justica': BODIES['mjdh'],
    'ensino': BODIES['mescti'], 'financas': 'Ministério das Finanças', 'defesa': 'Ministério da Defesa Nacional',
}
_MINISTRY = re.compile(r'\bministerio d[aoe]s? (\w+)|\b(minsa|med|minint|mescti|mjdh|csmj)\b')


def body_in_title(title: str) -> str | None:
    match = _MINISTRY.search(fold(title))
    if not match:
        return None
    return MINISTRIES.get(match.group(1)) if match.group(1) else BODIES[match.group(2)]


def public_competitions(recent: list[dict], dispatches: list[dict]) -> dict:
    """Public competitions opened in the period, each counted once, with the posts they announced: from the
    Diário da República's dispatches when there are, from the news otherwise."""
    opened = sorted(
        (row for row in recent if row['kind'] == 'concurso' and _OPENS.search(fold(row['title']))
         and not _STAGE.search(fold(row['title']))),
        key=lambda row: row['date'],
    )
    competitions: list[dict] = []
    for row in opened:
        day, body = date.fromisoformat(row['date']), _body(row['company']) or body_in_title(row['title'])
        area = competition_area(row['title'], body)
        def same(seen: dict) -> bool:
            days = (day - seen['day']).days
            # 6 000 posts in health and 6 000 in education are two competitions.
            if area != 'public' and seen['area'] != 'public' and area != seen['area']:
                return False
            if body and seen['body'] and fold(body) != fold(seen['body']):
                return False
            equal = bool(row['openings']) and row['openings'] == seen['openings']
            if equal and row['openings'] >= BIG_COMPETITION and days <= SAME_BIG_COMPETITION_DAYS:
                return True
            if days > SAME_COMPETITION_DAYS:
                return False
            places_agree = not row['province'] or not seen['province'] or row['province'] == seen['province']
            same_body = bool(body and seen['body']) and fold(body) == fold(seen['body'])
            return (equal and places_agree) or same_body

        twin = next((seen for seen in competitions if same(seen)), None)
        if twin:
            twin['body'] = twin['body'] or body
            twin['openings'] = twin['openings'] or row['openings']
            twin['province'] = twin['province'] or row['province']
            twin['area'] = area if twin['area'] == 'public' else twin['area']
            twin['day'] = day  # the latest news of it: the next ones are compared with this
            continue
        competitions.append(
            {'day': day, 'body': body, 'openings': row['openings'], 'province': row['province'], 'area': area}
        )

    # The Diário da República's numbers replace the news of the same body (and, without a body, of the same area).
    confirmed = official_competitions(dispatches)
    by_body = {fold(competition['body']) for competition in confirmed}
    by_area = {competition['area'] for competition in confirmed} - {'public'}
    competitions = [
        competition
        for competition in competitions
        if not (competition['body'] and fold(competition['body']) in by_body)
        and not (not competition['body'] and competition['area'] in by_area)
    ] + confirmed
    places = Counter(competition['province'] for competition in competitions if competition['province'])
    places.update(row['province'] for row in dispatches if row['province'])

    bodies: dict[str, dict] = {}
    for competition in competitions:
        if competition['body']:
            entry = bodies.setdefault(
                fold(competition['body']), {'name': competition['body'], 'competitions': 0, 'openings': 0}
            )
            entry['competitions'] += 1
            entry['openings'] += competition['openings'] or 0
    areas: dict[str, dict] = {}
    for competition in competitions:
        entry = areas.setdefault(competition['area'], {'area': competition['area'], 'competitions': 0, 'openings': 0})
        entry['competitions'] += 1
        entry['openings'] += competition['openings'] or 0
    return {
        'areas': sorted(areas.values(), key=lambda entry: (-entry['openings'], -entry['competitions'])),
        'competitions': len(competitions),
        'openings': sum(competition['openings'] or 0 for competition in competitions),
        'withOpenings': sum(1 for competition in competitions if competition['openings']),
        'bodies': sorted(bodies.values(), key=lambda entry: (-entry['openings'], -entry['competitions']))[:10],
        'provinces': _counts(places, 'province'),
        'official': {
            'openings': sum(competition['openings'] for competition in confirmed),
            'dispatches': len(dispatches),
            'competitions': [
                {key: competition[key] for key in ('body', 'area', 'openings', 'dispatches')}
                | {'date': competition['day'].isoformat()}
                for competition in sorted(confirmed, key=lambda competition: -competition['openings'])
            ],
            'source': {'name': 'Diário da República (AngoLEX)', 'url': 'https://angolex.com'},
        },
    }


def official_competitions(dispatches: list[dict]) -> list[dict]:
    """One competition per body from its dispatches. A body's posts are those its opening dispatches announce or,
    when larger, the sum of the posts it gives out province by province ("Atribui 3.037 vagas", "Atribuição de
    361 vagas… na Huíla"): never both, since they are the same posts."""
    grouped: dict[str, list[dict]] = defaultdict(list)
    for row in dispatches:
        if row['body'] and row['openings']:
            grouped[fold(row['body'])].append(row)
    competitions = []
    for rows in grouped.values():
        given = sum(row['openings'] for row in rows if fold(row['title']).find('atribu') >= 0)
        opened = sum(row['openings'] for row in rows if fold(row['title']).find('atribu') < 0)
        competitions.append({
            'day': max(date.fromisoformat(row['date']) for row in rows),
            'body': rows[0]['body'],
            'openings': max(given, opened),
            'province': None,
            'area': rows[0]['area'],
            'dispatches': len(rows),
        })
    return competitions


def summarize(rows: list[dict], dispatches: list[dict] | None = None, today: date | None = None) -> dict:
    dispatches = dispatches or []
    # A board's estimate can never be later than today.
    latest = min(max(date.fromisoformat(row['date']) for row in rows), today or date.today())
    start = latest - timedelta(days=365)
    recent = [row for row in rows if start < date.fromisoformat(row['date']) <= latest]

    months = Counter(row['date'][:7] for row in recent)
    agencies = _employers(recent, agencies=True)
    salaries = [row['salary'] for row in recent if row['salary']]

    sources = []
    for source in SOURCES:
        own = [row for row in rows if row['source'] == source['id']]
        if own:
            sources.append({
                'id': source['id'],
                'name': source['name'],
                'url': f"https://{source['site']}",
                'postings': sum(1 for row in recent if row['source'] == source['id']),
                'since': min(row['date'] for row in own),
            })

    return {
        'updated': latest.isoformat(),
        'from': (start + timedelta(days=1)).isoformat(),
        'postings': len(recent),
        'kinds': dict(Counter(row['kind'] for row in recent)),
        'months': [{'month': month, 'postings': months[month]} for month in sorted(months)][-12:],
        'blocks': blocks(months, latest),
        'areas': _counts(Counter(sector_area(row['sector']) or 'other' for row in recent), 'area'),
        'sectors': _counts(Counter(row['sector'] for row in recent), 'sector'),
        'provinces': _counts(Counter(row['province'] for row in recent if row['province']), 'province'),
        'companies': _employers(recent, agencies=False)[:TOP_COMPANIES],
        'agencies': {
            'postings': sum(agency['postings'] for agency in agencies),
            'names': [agency['name'] for agency in agencies[:5]],
        },
        'asks': asks(recent),
        'careers': _counts(Counter(row['career'] for row in recent if row['career']), 'slug'),
        'salaries': {'count': len(salaries), 'median': round(median(salaries)) if salaries else None},
        'public': public_competitions(recent, [row for row in dispatches if row['date'] and start < date.fromisoformat(row['date']) <= latest]),
        'sources': sources,
    }


def main() -> None:
    with DATA.open(encoding='utf-8') as file:
        rows = [json.loads(line) for line in file]
    dispatches = [json.loads(line) for line in OFFICIAL.open(encoding='utf-8')] if OFFICIAL.exists() else []
    summary = summarize(rows, dispatches)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(summary, ensure_ascii=False, indent=1) + '\n', encoding='utf-8', newline='\n')
    print(f"{summary['postings']} job posts from {summary['from']} to {summary['updated']} -> {OUTPUT}")


if __name__ == '__main__':
    main()
