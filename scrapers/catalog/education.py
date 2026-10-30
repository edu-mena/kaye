"""Education from end to end, for the app to choose from: who teaches it (institutions and their teacher training and
sport courses, the training of teachers in service), who employs (the Ministry of Education and its institutes, the
employment and vocational training institute, the schools in the job ads) and the facts behind them (the State's
salary tables), each with its source.

The area takes the Mercado's education area whole and the sport course the yearbook files under the sciences.

    python -m catalog.education    # after python -m catalog.institutions

Writes catalog/education.json and, for the app, apps/web/src/data/catalog/education.json.
"""

import json
import re
from pathlib import Path

from jobs.facts import fold
from jobs.summarize import _company_key

from .business import employers_in_job_ads
from .health import teaching
from .humanities import rank_rows, read_tables

HERE = Path(__file__).resolve().parent
OUTPUT = HERE / 'education.json'
APP_OUTPUT = HERE.parents[1] / 'apps' / 'web' / 'src' / 'data' / 'catalog' / 'education.json'
JOBS = {'label': 'Anúncios de emprego (Jobartis, AngoEmprego e outros)', 'url': 'https://www.jobartis.com'}
# Sport ("Ciências Deporto e Motricidade Humana" is the yearbook's spelling, under the sciences).
SPORT = re.compile(r'desporto|deporto')
# A school or a training organisation among the job ads' employers.
_ORGANISATION = re.compile(r'colegio|escola|school|college|academia|complexo escolar|centro de formacao|instituto medio')
# The higher education institutions, already in the app as academies.
_ACADEMIES = re.compile(r'universidade|instituto superior|escola superior')
# The area has few job ads: two make an employer.
MIN_POSTINGS = 2

ANGOLEX = 'https://angolex.com/paginas/diversos/'
STATUTES = 'https://angolex.com/paginas/decreto-presidencial/'
# The State's 2026 base salaries (Decreto Presidencial n.º 16/26), each a table of ranks: the primary and secondary
# school teachers, the nursery teachers, the lecturers, the pedagogical staff and the employment and training staff.
SALARY_TABLES = {
    'professores': f'{ANGOLEX}tabela-salarial-do-regime-especial-do-professor-do-ensino-primario-e-secundario-2026a.html',
    'educadores_infancia': f'{ANGOLEX}tabela-salarial-do-regime-especial-do-educador-de-infancia-2026a.html',
    'docentes_ensino_superior': f'{ANGOLEX}tabela-salarial-do-regime-especial-da-carreira-docente-do-ensino-superior-2026a.html',
    'tecnicos_pedagogicos': f'{ANGOLEX}tabela-salarial-do-regime-especial-dos-tecnicos-pedagogicos-e-especialista-da-educacao-2026a.html',
    'emprego_formacao': f'{ANGOLEX}tabela-salarial-do-regime-especial-da-carreira-do-sistema-nacional-de-emprego-e-formacao-profissional-2026a.html',
}


def _site(url: str) -> dict:
    return {'label': 'Página oficial', 'url': url}


# Gathered by hand from public sources (each one named).
NAMED_EMPLOYERS = [
    {'name': 'Ministério da Educação (MED)', 'sector': 'educacao', 'kind': 'ministerio_educacao',
     'source': {'label': 'Decreto Presidencial n.º 222/20, Estatuto Orgânico do Ministério da Educação (AngoLEX)',
                'url': f'{STATUTES}estatuto-organico-do-ministerio-da-educacao.html'}},
    {'name': 'Instituto Nacional de Avaliação e Desenvolvimento da Educação', 'sector': 'educacao',
     'kind': 'avaliacao',
     'source': {'label': 'Decreto Presidencial n.º 91/21, Estatuto Orgânico (AngoLEX)',
                'url': f'{STATUTES}estatuto-organico-do-instituto-nacional-de-avaliacao-e-desenvolvimento-da-educacao-91a-21a.html'}},
    {'name': 'Instituto Nacional de Educação Especial', 'sector': 'educacao', 'kind': 'educacao_especial',
     'source': {'label': 'Decreto Presidencial n.º 63/21, Estatuto Orgânico (AngoLEX)',
                'url': f'{STATUTES}estatuto-organico-do-instituto-nacional-de-educacao-especial-63a-21a.html'}},
    {'name': 'Instituto Nacional de Emprego e Formação Profissional (INEFOP)', 'sector': 'educacao',
     'kind': 'emprego_formacao', 'source': _site('https://inefop.gov.ao')},
    {'name': 'Luanda International School (LIS)', 'sector': 'educacao', 'kind': 'escola_internacional',
     'source': _site('https://lisluanda.com')},
]
# Training outside degrees, with its source.
TRAINING = [
    {'name': 'Instituto Nacional de Formação de Quadros da Educação (INFQE)', 'kind': 'centro_formacao',
     'province': 'Luanda',
     'summary': 'O instituto do Ministério da Educação que forma e actualiza os professores e os outros quadros da '
                'educação já em serviço, com cursos e acções de formação contínua.',
     'source': {'label': 'Decreto Presidencial n.º 134/21, Estatuto Orgânico do INFQE (AngoLEX)',
                'url': f'{STATUTES}estatuto-organico-do-instituto-nacional-de-formacao-de-quadros-da-educacao-134a-21a.html'}},
]


def in_area(course: dict) -> bool:
    return course['area'] == 'education' or bool(SPORT.search(fold(course['name'])))


def main() -> None:
    institutions, courses, yearbook = teaching(in_area)
    # A board appends the employer's group after a dash ("St. Andrews English School - Mardolcar").
    ads = [ad | {'name': ad['name'].split(' - ')[0].strip()}
           for ad in employers_in_job_ads('education', _ORGANISATION, _ACADEMIES, MIN_POSTINGS)]
    data = {
        'area': 'education',
        'sources': {'education': {key: yearbook[key] for key in ('label', 'url')}, 'jobs': JOBS},
        'teaching': {'year': yearbook['year'], 'institutions': institutions, 'courses': courses},
        'training': TRAINING,
        'salaries': {'year': 2026, 'decree': 'Decreto Presidencial n.º 16/26, de 22 de Janeiro', 'urls': SALARY_TABLES,
                     'careers': read_tables(SALARY_TABLES, rank_rows)},
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
            {'name': ad['name'], 'sector': 'educacao', 'kind': 'anuncios', 'province': 'Luanda',
             'postings': ad['postings'], 'source': JOBS}
            for ad in ads
            if _company_key(ad['name']) not in named
        ],
    }
    APP_OUTPUT.write_text(json.dumps(app, ensure_ascii=False, indent=1) + '\n', encoding='utf-8', newline='\n')
    print(f"{len(institutions)} institutions, {len(courses)} courses, {len(NAMED_EMPLOYERS)} named employers, "
          f"{len(ads)} employers with {MIN_POSTINGS}+ job ads -> {OUTPUT}")


if __name__ == '__main__':
    main()
