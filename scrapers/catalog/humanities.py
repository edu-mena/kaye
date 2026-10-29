"""Law, public administration and the social and human sciences from end to end, for the app to choose from: who
teaches it (institutions and their courses, the training of lawyers, magistrates, diplomats and public servants), who
employs (the courts, the Public Prosecutor, the justice and State bodies and the employers in the job ads) and the
facts behind them (the State's salary tables), each with its source.

The area takes the Mercado's legal and public areas whole and, from the sciences and humanities, the social and human
sciences (psychology, sociology, social work, history, philosophy, anthropology); the natural sciences stay out.

    python -m catalog.humanities    # after python -m catalog.institutions

Writes catalog/humanities.json and, for the app, apps/web/src/data/catalog/humanities.json.
"""

import html
import json
import re
from collections.abc import Callable
from pathlib import Path

from jobs.facts import fold
from jobs.http import get
from jobs.summarize import _company_key

from .business import employers_in_job_ads
from .health import salaries, teaching

HERE = Path(__file__).resolve().parent
OUTPUT = HERE / 'humanities.json'
APP_OUTPUT = HERE.parents[1] / 'apps' / 'web' / 'src' / 'data' / 'catalog' / 'humanities.json'
JOBS = {'label': 'Anúncios de emprego (Jobartis, AngoEmprego e outros)', 'url': 'https://www.jobartis.com'}
# The social and human sciences among the Mercado's "sciences" (psicologia clínica is health's).
_HUMANITIES = re.compile(
    r'psicolog|sociolog|servicos? social|historia|filosofia|antropolog|geodemograf|ciencia da informacao'
)
# An organisation's name: boards also show the person who posted, never kept.
_ORGANISATION = re.compile(
    r'banco|bank|segur|grupo|group|\blda\b|\bsa\b|empresa|servic|international|ministerio|\bminea\b|instituto|'
    r'fundac|associac|unicef|advogad|juridic'
)
# The companies already curated in the app.
_CURATED = re.compile(r'\bzap\b|unitel|sonangol')
# A State body among the job ads' employers (MINEA is the Ministry of Energy and Water).
_STATE = re.compile(r'ministerio|\bminea\b|instituto nacional')
# The area has few job ads: two make an employer.
MIN_POSTINGS = 2

ANGOLEX = 'https://angolex.com/paginas/diversos/'
# The State's 2026 base salaries (Decreto Presidencial n.º 16/26): the general regime of the public service, the
# technicians of the Public Prosecutor and, apart, the justice officers (four careers in one table), the ranks of the
# diplomats, the police and the SIC, and the magistrates.
SALARY_TABLES = {
    'regime_geral': f'{ANGOLEX}tabela-salarial-do-regime-geral-da-funcao-publica-2026a.html',
    'tecnicos_justica_pgr': f'{ANGOLEX}tabela-salarial-dos-tecnicos-de-justica-da-pgr-2026a.html',
}
JUSTICE_OFFICERS = f'{ANGOLEX}tabela-salarial-do-regime-especial-dos-oficiais-de-justica-2026a.html'
# One column of ranks, each with its index and base salary: the diplomats, the National Police and the SIC.
RANK_TABLES = {
    'diplomatas': f'{ANGOLEX}tabela-salarial-do-regime-especial-da-carreira-de-diplomata-2026a.html',
    'policia_nacional': f'{ANGOLEX}tabela-salarial-do-regime-especial-da-policia-nacional-2026a.html',
    'sic': f'{ANGOLEX}tabela-salarial-sic-angola-2026a-salarios.html',
}
# The magistrates' posts, each with its base salary, representation allowance and total (no index).
MAGISTRATES = {
    'magistrados_judiciais': f'{ANGOLEX}tabela-salarial-dos-magistrados-judiciais-2026a.html',
    'magistrados_mp': f'{ANGOLEX}tabela-salarial-dos-magistrados-do-ministerio-publico-2026a.html',
}
# A rank: its name (it can start with a digit, "1º Secretário"), the index and the base salary.
_RANK_ROW = re.compile(r'\| ([^|]*[^\W\d_][^|]*?) \| (\d[\d ]*) \| (\d[\d ]*,\d{1,2}) (?=\|)')
# A magistrate's post: its name, the base salary, the representation allowance and the total.
_MAGISTRATE_ROW = re.compile(
    r'\| ([^|]*[^\W\d_][^|]*?) \| (\d[\d ]*,\d{2}) \| (\d[\d ]*,\d{2}) \| (\d[\d ]*,\d{2}) (?=\|)'
)
# A row of that table: the category in the registries, the notaries, the courts and civil identification, the index
# and the base salary ("253 336,9" has one decimal).
_JUSTICE_ROW = re.compile(
    r'\|\s*([^|\s][^|]*?)\s*\|\s*([^|\s][^|]*?)\s*\|\s*([^|\s][^|]*?)\s*\|\s*([^|\s][^|]*?)\s*\|\s*(\d{3})\s*\|'
    r'\s*(\d[\d ]*,\d{1,2})'
)


def _site(url: str) -> dict:
    return {'label': 'Página oficial', 'url': url}


# Gathered by hand from public sources (each one named).
NAMED_EMPLOYERS = [
    {'name': 'Tribunal Supremo', 'sector': 'justica', 'kind': 'tribunal_supremo',
     'source': _site('https://tribunalsupremo.ao')},
    {'name': 'Tribunal Constitucional', 'sector': 'justica', 'kind': 'tribunal_constitucional',
     'source': _site('https://www.tribunalconstitucional.ao')},
    {'name': 'Conselho Superior da Magistratura Judicial (CSMJ)', 'sector': 'justica', 'kind': 'magistratura',
     'source': _site('https://www.csmj.ao')},
    {'name': 'Procuradoria-Geral da República (PGR)', 'sector': 'justica', 'kind': 'ministerio_publico',
     'source': {'label': 'Lei n.º 22/12, Lei Orgânica da PGR e do Ministério Público (AngoLEX)',
                'url': 'https://angolex.com/paginas/leis/lei-do-organica-da-procuradoria-geral-da-republica-e-do-ministerio-publico.html'}},
    {'name': 'Ministério da Justiça e dos Direitos Humanos', 'sector': 'justica', 'kind': 'ministerio_justica',
     'source': _site('https://minjusdh.gov.ao')},
    {'name': 'Guiché Único da Empresa (GUE)', 'sector': 'justica', 'kind': 'guiche',
     'source': _site('https://gue.gov.ao/portal/')},
    {'name': 'Serviço de Investigação Criminal (SIC)', 'sector': 'justica', 'kind': 'investigacao',
     'source': _site('https://sic.gov.ao')},
    {'name': 'Provedor de Justiça', 'sector': 'justica', 'kind': 'provedor',
     'source': _site('https://provedordejustica.ao')},
    {'name': 'Ministério das Relações Exteriores (MIREX)', 'sector': 'estado', 'kind': 'diplomacia',
     'source': _site('https://mirex.gov.ao/PortalMIREX/')},
    {'name': 'Assembleia Nacional', 'sector': 'estado', 'kind': 'parlamento',
     'source': _site('https://www.parlamento.ao')},
    {'name': 'Comissão Nacional Eleitoral (CNE)', 'sector': 'estado', 'kind': 'eleitoral',
     'source': _site('https://www.cne.ao')},
    {'name': 'Ministério da Administração do Território (MAT)', 'sector': 'estado', 'kind': 'territorio',
     'source': _site('https://www.mat.gov.ao')},
    {'name': 'Ministério da Acção Social, Família e Promoção da Mulher (MASFAMU)', 'sector': 'estado',
     'kind': 'accao_social', 'source': _site('https://masfamu.gov.ao')},
    {'name': 'Instituto Nacional de Estatística (INE)', 'sector': 'estado', 'kind': 'estatistica',
     'source': _site('https://www.ine.gov.ao')},
]
# Training outside degrees, with its source: the way into the bar, the magistracy, diplomacy and the public service.
TRAINING = [
    {'name': 'Centro de Estudos e Formação da Ordem dos Advogados de Angola', 'kind': 'centro_formacao',
     'province': 'Luanda',
     'summary': 'O caminho para ser advogado, depois da licenciatura em Direito: 18 meses de estágio com um patrono, '
                'a formação inicial no Centro e a Prova Final de Acesso à Advocacia, em Abril, em todo o país.',
     'source': {'label': 'Regulamento n.º 1/26, de Acesso à Advocacia (AngoLEX)',
                'url': 'https://www.angolex.com/paginas/regulamentos/regulamento-de-acesso-a-advocacia-1a-26a.html'}},
    {'name': 'Instituto Nacional de Estudos Judiciários (INEJ)', 'kind': 'centro_formacao', 'province': 'Luanda',
     'summary': 'Forma os novos juízes e procuradores: quem entra na magistratura faz aqui a formação inicial, com '
                'estágio nos tribunais.',
     'source': {'label': 'Regulamento Interno do INEJ, Deliberação n.º 9/16 (AngoLEX)',
                'url': 'https://angolex.com/paginas/deliberacoes/regulamento-interno-do-instituto-nacional-de-estudos-judiciarios-inej-9a-16a.html'}},
    {'name': 'Academia Diplomática Venâncio de Moura', 'kind': 'centro_formacao', 'province': 'Luanda',
     'summary': 'A academia do Ministério das Relações Exteriores, no Kilamba: forma diplomatas e especialistas em '
                'relações internacionais, com capacidade para 1800 por ano.',
     'source': {'label': 'Ver Angola, 11/2020: inaugurada a academia que vai formar 1800 diplomatas por ano',
                'url': 'https://www.verangola.net/va/pt/112020/Educacao/22741/Inaugurada-academia-no-Kilamba-que-vai-formar-1800-diplomatas-por-ano.htm'}},
    {'name': 'Escola Nacional de Administração e Políticas Públicas (ENAPP)', 'kind': 'centro_formacao',
     'province': 'Luanda',
     'summary': 'Forma quem trabalha na administração pública, com cursos curtos e pós-graduações, e conduz os '
                'concursos da Entidade Recrutadora Única. Tem um centro regional no Lubango.',
     'source': _site('https://enapp.gov.ao')},
]


def in_area(course: dict) -> bool:
    return course['area'] in ('legal', 'public') or (
        course['area'] == 'sciences' and bool(_HUMANITIES.search(fold(course['name'])))
    )


def _kwanzas(pay: str) -> int:
    return round(float(pay.replace(' ', '').replace(',', '.')))


def justice_rows(text: str) -> list[dict]:
    """The justice officers' table: each row's category in the four careers, lowest salary first."""
    rows = [
        {'registos': registries, 'notariado': notaries, 'tribunal': courts, 'identificacao': identification,
         'index': int(index), 'salary': _kwanzas(pay)}
        for registries, notaries, courts, identification, index, pay in _JUSTICE_ROW.findall(text)
    ]
    return sorted(rows, key=lambda row: row['salary'])


def rank_rows(text: str) -> list[dict]:
    """A table of ranks: each rank with its index and base salary, lowest salary first."""
    text = re.sub(r'(\|\s*)+', '| ', text)
    rows = [
        {'category': name, 'index': int(index.replace(' ', '')), 'salary': _kwanzas(pay)}
        for name, index, pay in _RANK_ROW.findall(text)
    ]
    return sorted(rows, key=lambda row: row['salary'])


def magistrate_rows(text: str) -> list[dict]:
    """A magistrates' table: each post with its base salary (the representation allowance comes on top)."""
    text = re.sub(r'(\|\s*)+', '| ', text)
    rows = [
        {'category': name, 'salary': _kwanzas(base), 'representation': _kwanzas(allowance)}
        for name, base, allowance, _ in _MAGISTRATE_ROW.findall(text)
    ]
    return sorted(rows, key=lambda row: row['salary'])


def read_tables(tables: dict[str, str], read: Callable[[str], list[dict]]) -> dict[str, list[dict]]:
    """Each table's rows, read from its page's text."""
    found = {}
    for career, url in tables.items():
        body, _ = get(url, 'text/html')
        page = re.sub(r'<(script|style)\b.*?</\1>', ' ', body.decode('utf-8', 'ignore'), flags=re.S)
        rows = read(re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' | ', page))))
        if not rows:
            raise SystemExit(f'No salary table in {url}')
        found[career] = rows
    return found


def main() -> None:
    institutions, courses, yearbook = teaching(in_area)
    ads = employers_in_job_ads('legal', _ORGANISATION, _CURATED, MIN_POSTINGS)
    data = {
        'area': 'humanities',
        'sources': {'education': {key: yearbook[key] for key in ('label', 'url')}, 'jobs': JOBS},
        'teaching': {'year': yearbook['year'], 'institutions': institutions, 'courses': courses},
        'training': TRAINING,
        'salaries': {'year': 2026, 'decree': 'Decreto Presidencial n.º 16/26, de 22 de Janeiro',
                     'urls': SALARY_TABLES | {'oficiais_justica': JUSTICE_OFFICERS} | RANK_TABLES | MAGISTRATES,
                     'careers': salaries(SALARY_TABLES)
                                | read_tables({'oficiais_justica': JUSTICE_OFFICERS}, justice_rows)
                                | read_tables(RANK_TABLES, rank_rows) | read_tables(MAGISTRATES, magistrate_rows)},
        'employers': {'named': NAMED_EMPLOYERS, 'jobAds': ads},
    }
    OUTPUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n', encoding='utf-8', newline='\n')
    named = {_company_key(employer['name']) for employer in NAMED_EMPLOYERS}
    app = {
        'year': yearbook['year'],
        'sources': data['sources'],
        'institutions': [
            {**institution, 'courses': [{key: course[key] for key in ('name', 'students', 'graduates')}
                                        for course in institution['courses']]}
            for institution in institutions
            if institution['province']
        ],
        'training': TRAINING,
        'employers': [{**employer, 'province': 'Luanda'} for employer in NAMED_EMPLOYERS] + [
            {'name': ad['name'], 'sector': 'estado' if _STATE.search(fold(ad['name'])) else 'comercio',
             'kind': 'anuncios', 'province': 'Luanda', 'postings': ad['postings'], 'source': JOBS}
            for ad in ads
            if _company_key(ad['name']) not in named
        ],
    }
    APP_OUTPUT.write_text(json.dumps(app, ensure_ascii=False, indent=1) + '\n', encoding='utf-8', newline='\n')
    print(f"{len(institutions)} institutions, {len(courses)} courses, {len(NAMED_EMPLOYERS)} named employers, "
          f"{len(ads)} employers with {MIN_POSTINGS}+ job ads -> {OUTPUT}")


if __name__ == '__main__':
    main()
