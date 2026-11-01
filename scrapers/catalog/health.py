"""The health area from end to end, for the app to choose from: who teaches it (institutions and their courses),
who works in it (each profession, how many, where, and the specialities in training) and who employs (the national
hospitals and institutes, the public and private network, and the employers in the job ads). Each part keeps its
source.

    python -m catalog.health        # after python -m catalog.institutions

Writes catalog/health.json.
"""

import html
import json
import re
import subprocess
import tempfile
from collections import Counter, defaultdict
from collections.abc import Callable
from difflib import SequenceMatcher
from pathlib import Path

from areas import sector_area
from education.anuario import _readings
from jobs.collect import DATA
from jobs.facts import PROVINCES, fold
from jobs.http import get

HERE = Path(__file__).resolve().parent
OUTPUT = HERE / 'health.json'
# What the app shows of it: the institutions and the employers.
APP_OUTPUT = HERE.parents[1] / 'apps' / 'web' / 'src' / 'data' / 'catalog' / 'health.json'
# The national units are in Luanda, but one.
UNIT_PROVINCES = {'Hospital Dr. Walter Strangway': 'Bié'}
MINSA = {
    'label': 'MINSA, Anuário Estatístico Sanitário 2023',
    'url': 'https://www.ine.gov.ao/Arquivos/arquivosCarregados/Carregados/Publicacao_639110352357683245.pdf',
    'year': 2023,
}
# Tabela 70: who works in the national health service.
WORKFORCE = ['medicos', 'enfermeiros', 'tecnicos_diagnostico_terapeutica', 'administrativos', 'apoio_hospitalar',
             'trabalhadores_sociais']
# Tabela 63: the public units, by type.
PUBLIC_UNITS = ['hospital_nacional', 'hospital_provincial', 'servico_especializado', 'hospital_municipal',
                'centro_materno_infantil', 'centro_saude_referencia', 'centro_saude', 'posto_saude', 'outros']
# Tabela 64: the registered private units, by type.
PRIVATE_UNITS = ['clinicas', 'centros_medicos', 'consultorios_medicos', 'gabinetes_especialidade', 'laboratorios',
                 'postos_enfermagem']
_PROVINCES = {fold(name): name for name in PROVINCES} | {'malange': 'Malanje', 'uige': 'Uíge', 'huila': 'Huíla'}
# The State's monthly base salaries of the health careers, category by category (Decreto Presidencial n.º 16/26).
SALARIES = {
    'medica': 'https://angolex.com/paginas/diversos/tabela-salarial-do-regime-especial-da-carreira-medica-2026a.html',
    'enfermagem': 'https://angolex.com/paginas/diversos/tabela-salarial-do-regime-especial-da-carreira-de-enfermagem-2026a.html',
}
_SALARY_ROW = re.compile(r'\|\s*([A-ZÁ-Úa-zá-ú][^|]*?)\s*\|\s*\|\s*(\d[\d ]*)\s*\|\s*\|\s*(\d[\d ]*,\d{2})')
_SALARY_GROUPS = ('Técnico Superior', 'Técnico Médio', 'Técnico', 'Auxiliar')

# Gathered by hand from public sources (each one named), where no table can be read.
TECHNICAL_TRAINING = {
    'courses': ['Análises Clínicas', 'Anatomia Patológica', 'Cardiopneumologia', 'Dietética', 'Enfermagem',
                'Estomatologia', 'Farmácia', 'Fisioterapia', 'Ortótica', 'Ortoprotesia', 'Radiologia',
                'Saúde Ambiental'],
    'coursesSource': {'label': 'Decreto Executivo Conjunto MED/MINSA n.º 97/11, de 21 de Julho (via RETS/Fiocruz)',
                      'url': 'https://www.rets.epsjv.fiocruz.br/membros/escola-de-formacao-de-tecnicos-de-saude-de-luanda-0'},
    'publicSchools': [
        {'name': 'Escola Técnica de Saúde de Luanda', 'province': 'Luanda'},
        {'name': 'Escola de Formação de Técnicos de Saúde do Bié', 'province': 'Bié'},
        {'name': 'Instituto Técnico de Saúde do Kilamba', 'province': 'Luanda'},
        {'name': 'Instituto Técnico de Saúde de Malanje', 'province': 'Malanje'},
        {'name': 'Instituto Técnico de Saúde do Namibe', 'province': 'Namibe'},
    ],
    'schoolsSource': {'label': 'RETS/Fiocruz e MINSA, Anuário Estatístico Sanitário 2023 (Tabela 155)',
                      'url': 'https://www.rets.epsjv.fiocruz.br/en/node/507'},
    'privateInstitutes': {'total': 264, 'legalInLuanda': 102, 'barred2023': 33, 'year': 2023,
                          'source': {'label': 'RNA, 14/08/2023 (lista do Ministério da Educação)',
                                     'url': 'https://rna.ao/rna.ao/2023/08/14/confira-a-listas-dos-institutos-tecnicos-de-saude-nao-autorizados-a-matricular-alunos/'}},
    'suspension': {
        'decree': 'Decreto Executivo n.º 01/25, de 23 de Junho',
        'courses': ['Enfermagem', 'Análises Clínicas'],
        'from': '2025/2026',
        'years': 5,
        'provinces': ['Bengo', 'Benguela', 'Cuanza Sul', 'Huambo', 'Huíla', 'Icolo e Bengo', 'Luanda', 'Malanje',
                      'Namibe', 'Uíge'],
        'allowedIfEquipped': ['Bié', 'Cabinda', 'Cuando', 'Cubango', 'Cuanza Norte', 'Cunene', 'Lunda Norte',
                              'Lunda Sul', 'Moxico Leste', 'Zaire'],
        'alternatives': ['Anatomia Patológica', 'Cardiopneumologia', 'Estomatologia', 'Farmácia', 'Fisioterapia',
                         'Nutrição e Dietética', 'Ortoprotesia', 'Ortóptica', 'Radiologia', 'Saúde Ambiental'],
        'source': {'label': 'O País, 27/06/2025',
                   'url': 'https://www.opais.ao/sociedade/governo-suspende-cursos-tecnicos-de-enfermagem-e-analises-clinicas-em-todos-institutos-de-saude-durante-5-anos/'},
    },
}
NAMED_EMPLOYERS = [
    {'name': 'Clínica Multiperfil', 'kind': 'publica_especial',
     'source': {'label': 'MINSA, Anuário Estatístico Sanitário 2023 (Tabela 159)', 'url': MINSA['url']}},
    {'name': 'Clínica Sagrada Esperança', 'kind': 'privada',
     'source': {'label': 'MINSA, Anuário Estatístico Sanitário 2023 (Tabela 159)', 'url': MINSA['url']}},
    {'name': 'Clínica Girassol', 'kind': 'privada',
     'source': {'label': 'Página oficial', 'url': 'https://www.facebook.com/clinicagirassol.saude/'}},
    {'name': 'Aliva Saúde', 'kind': 'privada',
     'source': {'label': 'Página oficial', 'url': 'https://alivasaude.com/quem-somos/'}},
    {'name': 'Elnor Pharma', 'kind': 'distribuidora',
     'source': {'label': 'Directório de empresas', 'url': 'https://village.ai/company/elnor-pharma'}},
    {'name': 'Pharmadis', 'kind': 'distribuidora',
     'source': {'label': 'Directório de empresas', 'url': 'https://village.ai/company/pharmadis-sa'}},
    {'name': 'Neofarma', 'kind': 'distribuidora',
     'source': {'label': 'Devex', 'url': 'https://www.devex.com/organizations/neofarma-distribuidora-de-mediamentos-e-cosmeticos-lda-172313'}},
    {'name': 'Central de Compras e Aprovisionamento de Medicamentos e Meios Médicos (CECOMA)', 'kind': 'publica',
     'source': {'label': 'Decreto Presidencial n.º 269/14 (AngoLEX)',
                'url': 'https://angolex.com/paginas/decreto-presidencial/estatuto-organico-da-central-de-compras-e-aprovisionamento-de-medicamentos-e-meios-medicos-269a-14a.html'}},
    {'name': 'Instituto Nacional de Emergência Médica (INEMA)', 'kind': 'publica',
     'source': {'label': 'Decreto Presidencial n.º 273/14 (AngoLEX)',
                'url': 'https://angolex.com/paginas/decreto-presidencial/estatuto-organico-do-instituto-nacional-de-emergencias-medicas-inema-273a-14a.html'}},
]

# An organisation in a job ad. Boards also name the person who posted (a recruiter): personal data, never kept.
_ORGANISATION = re.compile(
    r'clinic|hospital|medic|centr|saude|farm|lab|minsa|ministerio|instituto|unicef|carter|chemonics|electromedicina|'
    r'group|grupo|\blda\b|\bltd\b|\bsa\b|organiza|fundac|associac|embaixada|universidade|faculdade|international|comercio|'
    r'industria|empresa|servicos'
)
# Not employers: words the title parser took from news headlines.
_NOT_EMPLOYER = re.compile(r'\b(esta|vai|enquanto|ministra|sector|trabalho|alimentar)\b')


def _lines(text: str, title: str, end: str = 'Fonte') -> list[str]:
    """A table's lines, from its title (the last one: the first is in the contents) to `end`."""
    lines = [line.strip() for line in text.splitlines()]
    start = max(index for index, line in enumerate(lines) if line.startswith(title))
    stop = next((index for index in range(start + 1, len(lines)) if lines[index].startswith(end)), len(lines))
    return lines[start + 1 : stop]


def _numbers(groups: list[str], count: int) -> list[int] | None:
    """`count` numbers whose last is the total of the others ("1.429" and "1 421" are thousands)."""
    groups = [group.replace('.', '') for group in groups]
    return next(
        (numbers for numbers in _readings(groups) if len(numbers) == count and numbers[-1] == sum(numbers[:-1])),
        None,
    )


def by_province(lines: list[str], kinds: list[str]) -> list[dict]:
    """Rows of a province table; a province's name can break over two lines ("Cuando" / "Cubango")."""
    rows, pending = [], []
    for line in lines:
        match = re.match(r'^(\D*?)\s*((?:\d[\d.]*\s*)+)$', line)
        if not match:
            pending = (pending + [line])[-2:]
            continue
        words = match.group(1) or ' '.join(pending)
        if not match.group(1) and len(pending) == 2 and fold(pending[-1]) in _PROVINCES:
            words = pending[-1]
        pending = []
        name = 'Total' if fold(words).startswith('total') else _PROVINCES.get(fold(words))
        if fold(words).startswith('orgao central'):
            name = 'Órgão Central'
        numbers = _numbers(match.group(2).split(), len(kinds) + 1)
        if name and numbers:
            rows.append({'province': name} | dict(zip(kinds, numbers[:-1], strict=True)) | {'total': numbers[-1]})
    return rows


def specialities(text: str) -> tuple[list[dict], list[dict]]:
    """The medical specialities with their residents (Tabela 163: the last column of its last block is the total)
    and the technical ones with their trainees (Tabela 153)."""
    medical = {}
    for line in _lines(text, 'Tabela 163'):
        match = re.match(r'^(\D+?)\s+((?:\d+\s*)+)$', line)
        if match:
            medical[match.group(1)] = int(match.group(2).split()[-1])
    total = medical.pop('Total', None)
    if total != sum(medical.values()):
        raise SystemExit(f'Residents add up to {sum(medical.values())}, the table says {total}')
    technical = []
    for line in _lines(text, 'Tabela 153'):
        match = re.match(r'^(\D+?)\s+((?:\d+\s*)+)$', line)
        numbers = match and _numbers(match.group(2).split(), 7)
        if numbers and match.group(1) != 'Total Geral':
            technical.append({'name': match.group(1), 'trainees': numbers[-1]})
    return (
        [{'name': name, 'residents': count} for name, count in sorted(medical.items(), key=lambda item: -item[1])],
        technical,
    )


def national(text: str) -> list[str]:
    """The national hospitals (Tabela 62, 2023) and the national institutes that report to the yearbook."""
    hospitals, year = [], None
    for line in _lines(text, 'Tabela 62', end='ANUÁRIO'):
        if line in ('2022', '2023'):
            year = line
        elif line.startswith('Total'):
            year = None  # the rest is the page's foot
        elif year == '2023' and re.search(r'[A-Za-z]', line):
            hospitals.append(re.sub(r'\s+[\d.]+\s+[\d.]+$', '', line))
    # Names that break over two lines ("Complexo Hospitalar…" / "Cardeal…") come back together.
    joined = []
    for name in hospitals:
        if joined and not re.search(r'\d', name) and not name.startswith(('Hospital', 'HMI', 'CETEP', 'Complexo')):
            joined[-1] = f'{joined[-1]} {name}'
        else:
            joined.append(name)
    institutes = [
        re.sub(r'^\d+\.\s*', '', line)
        # The list runs to the end of the yearbook.
        for line in _lines(text, 'Unidades que forneceram', end='\0')
        if re.match(r'^\d+\.\s*(Instituto|Centro |Hospital|Maternidade)', line)
    ]
    # One name per unit: "Hospital Américo Boa Vida" is "Hospital Américo Boavida", and "Maternidade Lucrécia
    # Paim" the "Hospital Maternidade…" of the other table.
    names: dict[str, str] = {}
    for name in [*joined, *institutes]:
        squeezed = re.sub(r'[^a-z]', '', fold(name)).removeprefix('hospital')
        if not any(SequenceMatcher(None, squeezed, other).ratio() >= 0.9 for other in names):
            names[squeezed] = name.replace('"', '')
    return sorted(names.values())


def salaries(tables: dict[str, str] = SALARIES) -> dict[str, list[dict]]:
    """Each career's categories with their monthly base salary in Kz, lowest first (the health careers by default)."""
    found = {}
    for career, url in tables.items():
        body, _ = get(url, 'text/html')
        page = re.sub(r'<(script|style)\b.*?</\1>', ' ', body.decode('utf-8', 'ignore'), flags=re.S)
        text = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' | ', page)))
        rows = [
            {'category': name, 'index': int(index.replace(' ', '')), 'salary': round(float(pay.replace(' ', '').replace(',', '.')))}
            for name, index, pay in _SALARY_ROW.findall(text)
            if name not in _SALARY_GROUPS
        ]
        if not rows:
            raise SystemExit(f'No salary table in {url}')
        found[career] = sorted(rows, key=lambda row: row['salary'])
    return found


def from_job_ads(area: str = 'health') -> tuple[list[dict], list[dict]]:
    """The employers and the job titles of an area's job ads collected so far."""
    with DATA.open(encoding='utf-8') as file:
        rows = [row for row in map(json.loads, file) if sector_area(row['sector']) == area and row['kind'] == 'vaga']
    employers = Counter(
        row['company'] for row in rows
        if row['company']
        and _ORGANISATION.search(fold(row['company']))
        and not _NOT_EMPLOYER.search(fold(row['company']))
    )
    titles = Counter(re.sub(r'\s*[(/]\s*[ao]\s*\)?', '', row['title']).strip().capitalize() for row in rows)
    return (
        [{'name': name, 'postings': count} for name, count in employers.most_common()],
        [{'title': title, 'postings': count} for title, count in titles.most_common()],
    )


def teaching(area: str | Callable[[dict], bool] = 'health') -> tuple[list[dict], list[dict], dict]:
    """The institutions with an area's courses (only those courses) and each of its courses in the country. `area` is
    an area's key, or a test of a course for an area made of parts of others."""
    catalogue = json.loads((HERE / 'institutions.json').read_text(encoding='utf-8'))
    belongs = area if callable(area) else lambda course: course['area'] == area
    institutions, courses = [], defaultdict(lambda: {'students': 0, 'graduates': 0, 'institutions': 0})
    for institution in catalogue['institutions']:
        own = [course for course in institution['courses'] if belongs(course)]
        if not own:
            continue
        institutions.append({key: institution[key] for key in ('name', 'nature', 'province')} | {'courses': own})
        for course in own:
            entry = courses[course['name']]
            entry['students'] += course['students']
            entry['graduates'] += course['graduates']
            entry['institutions'] += 1
    listed = sorted(({'name': name} | entry for name, entry in courses.items()), key=lambda entry: -entry['students'])
    return institutions, listed, catalogue['source'] | {'year': catalogue['year']}


def main() -> None:
    body, _ = get(MINSA['url'], 'application/pdf')
    with tempfile.TemporaryDirectory() as folder:
        pdf = Path(folder) / 'minsa.pdf'
        pdf.write_bytes(body)
        text = subprocess.run(
            ['pdftotext', '-raw', '-enc', 'UTF-8', str(pdf), '-'], capture_output=True, check=True
        ).stdout.decode('utf-8')
    workforce = by_province(_lines(text, 'Tabela 70', end='Racio'), WORKFORCE)
    foreign = re.search(r'Total (\d+) [\d.]+\s+Total de médicos (\d+)', ' '.join(_lines(text, 'Tabela 71')))
    medical, technical = specialities(text)
    institutions, courses, yearbook = teaching()
    employers, titles = from_job_ads()
    data = {
        'area': 'health',
        'sources': {
            'health': {key: MINSA[key] for key in ('label', 'url')},
            'education': {key: yearbook[key] for key in ('label', 'url')},
            'jobs': 'Sites de emprego angolanos (scrapers/jobs)',
        },
        'workforce': {
            'year': MINSA['year'],
            'provinces': workforce,
            'foreignDoctors': int(foreign.group(1)) if foreign else None,
        },
        'specialities': {'medical': medical, 'technical': technical},
        'salaries': {'year': 2026, 'decree': 'Decreto Presidencial n.º 16/26, de 22 de Janeiro', 'urls': SALARIES,
                     'careers': salaries()},
        'technicalTraining': TECHNICAL_TRAINING,
        'units': {
            'national': national(text),
            'named': NAMED_EMPLOYERS,
            'public': by_province(_lines(text, 'Tabela 63'), PUBLIC_UNITS),
            'private': by_province(_lines(text, 'Tabela 64'), PRIVATE_UNITS),
        },
        'teaching': {'year': yearbook['year'], 'institutions': institutions, 'courses': courses},
        'jobAds': {'employers': employers, 'titles': titles},
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
        'employers': [
            {'name': name, 'kind': 'nacional', 'province': UNIT_PROVINCES.get(name, 'Luanda')}
            for name in data['units']['national']
        ] + [{**employer, 'province': 'Luanda'} for employer in NAMED_EMPLOYERS],
    }
    APP_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    APP_OUTPUT.write_text(json.dumps(app, ensure_ascii=False, indent=1) + '\n', encoding='utf-8', newline='\n')
    total = next((row for row in workforce if row['province'] == 'Total'), {})
    print(
        f"{len(institutions)} institutions, {len(courses)} courses, {total.get('total')} health workers, "
        f"{len(medical)} medical and {len(technical)} technical specialities, {len(data['units']['national'])} "
        f"national units, {len(employers)} employers in job ads -> {OUTPUT}"
    )


if __name__ == '__main__':
    main()
