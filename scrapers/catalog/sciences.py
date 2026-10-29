"""Languages, communication and the arts, and the natural and exact sciences, from end to end, for the app to choose
from: who teaches them (institutions and their courses, the training of journalists), who employs (the public media,
the State's culture, media and science bodies) and the facts behind them (the State's salary tables), each with its
source.

The area takes the Mercado's communication area whole, from the sciences and humanities everything the humanities
area leaves (biology, chemistry, physics, mathematics, statistics, oceanography, meteorology, design, hydraulics,
navigation, information systems, international trade) and the sport courses, which the yearbook files under education.
Its job ads are marketing and design ones, from firms the business area already lists: no employers come from them.

    python -m catalog.sciences    # after python -m catalog.institutions

Writes catalog/sciences.json and, for the app, apps/web/src/data/catalog/sciences.json.
"""

import json
import re
from pathlib import Path

from jobs.facts import fold

from .health import salaries, teaching
from .humanities import in_area as in_humanities
from .humanities import rank_rows, read_tables

HERE = Path(__file__).resolve().parent
OUTPUT = HERE / 'sciences.json'
APP_OUTPUT = HERE.parents[1] / 'apps' / 'web' / 'src' / 'data' / 'catalog' / 'sciences.json'
# Sport, under education in the yearbook ("Ciências Deporto e Motricidade Humana" is its spelling).
_SPORT = re.compile(r'desporto|deporto')

ANGOLEX = 'https://angolex.com/paginas/diversos/'
# The State's 2026 base salaries (Decreto Presidencial n.º 16/26): the scientific career and the statisticians and,
# for the physical education teachers, the primary and secondary school teachers (a table of ranks).
SALARY_TABLES = {
    'cientifica': f'{ANGOLEX}tabela-salarial-do-regime-especial-da-carreira-cientifica-2026a.html',
    'estatistica': f'{ANGOLEX}tabela-salarial-do-regime-especial-da-carreira-estatistica-2026a.html',
}
TEACHERS = {
    'professores': f'{ANGOLEX}tabela-salarial-do-regime-especial-do-professor-do-ensino-primario-e-secundario-2026a.html',
}


def _site(url: str) -> dict:
    return {'label': 'Página oficial', 'url': url}


# Gathered by hand from public sources (each one named).
NAMED_EMPLOYERS = [
    {'name': 'Televisão Pública de Angola (TPA)', 'sector': 'comunicacao', 'kind': 'televisao',
     'source': _site('https://tpa.ao')},
    {'name': 'Rádio Nacional de Angola (RNA)', 'sector': 'comunicacao', 'kind': 'radio',
     'source': _site('https://www.rna.ao')},
    {'name': 'Agência Angola Press (ANGOP)', 'sector': 'comunicacao', 'kind': 'agencia',
     'source': _site('https://www.angop.ao')},
    {'name': 'Jornal de Angola (Edições Novembro)', 'sector': 'comunicacao', 'kind': 'jornal',
     'source': _site('https://www.jornaldeangola.ao')},
    {'name': 'Entidade Reguladora da Comunicação Social de Angola (ERCA)', 'sector': 'estado', 'kind': 'regulador',
     'source': _site('https://erca.ao')},
    {'name': 'Ministério das Telecomunicações, Tecnologias de Informação e Comunicação Social (MINTTICS)',
     'sector': 'estado', 'kind': 'comunicacao_social', 'source': _site('https://minttics.gov.ao')},
    {'name': 'Ministério da Cultura', 'sector': 'estado', 'kind': 'cultura', 'source': _site('https://mincult.gov.ao')},
    {'name': 'Ministério do Ensino Superior, Ciência, Tecnologia e Inovação (MESCTI)', 'sector': 'estado',
     'kind': 'ciencia', 'source': _site('https://mescti.gov.ao')},
    {'name': 'Centro Nacional de Investigação Científica (CNIC)', 'sector': 'estado', 'kind': 'investigacao_cientifica',
     'source': _site('https://cnic.gov.ao')},
    {'name': 'Gabinete de Gestão do Programa Espacial Nacional (GGPEN)', 'sector': 'estado', 'kind': 'espacial',
     'source': _site('https://www.ggpen.gov.ao')},
    {'name': 'Instituto Nacional da Biodiversidade e Áreas de Conservação (INBAC)', 'sector': 'estado',
     'kind': 'biodiversidade', 'source': _site('https://www.inbac.gov.ao')},
]
# Training outside degrees, with its source.
TRAINING = [
    {'name': 'Centro de Formação de Jornalistas (CEFOJOR)', 'kind': 'centro_formacao', 'province': 'Luanda',
     'summary': 'O centro de formação de jornalistas do Estado, desde 2002: mais de 50 cursos curtos de jornalismo, '
                'multimédia, cinema, relações públicas e publicidade, em Luanda e no Huambo.',
     'source': {'label': 'CEFOJOR, Sobre nós', 'url': 'https://cefojor.ao/sobre-nos/'}},
]


def in_area(course: dict) -> bool:
    return (
        course['area'] == 'communication'
        or (course['area'] == 'sciences' and not in_humanities(course))
        or bool(_SPORT.search(fold(course['name'])))
    )


def main() -> None:
    institutions, courses, yearbook = teaching(in_area)
    data = {
        'area': 'sciences',
        'sources': {'education': {key: yearbook[key] for key in ('label', 'url')}},
        'teaching': {'year': yearbook['year'], 'institutions': institutions, 'courses': courses},
        'training': TRAINING,
        'salaries': {'year': 2026, 'decree': 'Decreto Presidencial n.º 16/26, de 22 de Janeiro',
                     'urls': SALARY_TABLES | TEACHERS,
                     'careers': salaries(SALARY_TABLES) | read_tables(TEACHERS, rank_rows)},
        'employers': {'named': NAMED_EMPLOYERS},
    }
    OUTPUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n', encoding='utf-8', newline='\n')
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
        'employers': [{**employer, 'province': 'Luanda'} for employer in NAMED_EMPLOYERS],
    }
    APP_OUTPUT.write_text(json.dumps(app, ensure_ascii=False, indent=1) + '\n', encoding='utf-8', newline='\n')
    print(f'{len(institutions)} institutions, {len(courses)} courses, {len(NAMED_EMPLOYERS)} named employers -> {OUTPUT}')


if __name__ == '__main__':
    main()
