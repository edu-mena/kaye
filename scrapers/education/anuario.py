"""Graduates per course from the higher education yearbook, for the Mercado.

    python -m education.anuario

Reads the yearbook of 2023-2024 (MESCTI, published by INE in August 2026) with pdftotext (poppler) and writes
apps/web/src/data/market/education.json. Every number keeps its source and year.
"""

import itertools
import json
import re
import subprocess
import tempfile
from collections import Counter, defaultdict
from pathlib import Path

from areas import AREAS, course_area
from jobs.facts import fold
from jobs.http import get

YEARBOOK = {
    'label': 'MESCTI, Anuário Estatístico do Ensino Superior 2023-2024 (INE, agosto de 2026)',
    'url': 'https://ine.gov.ao/Arquivos/arquivosCarregados//Carregados/Publicacao_639215989476277608.pdf',
    'year': '2023/24',
    # Quadros 2.4 to 2.6: graduates per institution and course, public and private (2.7 repeats the private
    # universities already in 2.6).
    'pages': (25, 45),
    'first': 'Quadro 2.4',
    'last': 'Quadro 2.7',
}
EXPANSAO = {
    'label': 'Expansão, a partir dos anuários do MESCTI (21/07/2026)',
    'url': 'https://expansao.co.ao/angola/detalhe/so-1-em-cada-10-licenciados-tiram-cursos-de-engenharia-universidades-desalinhadas-com-a-economia-73392.html',
}
YEARBOOK_2019 = {
    'label': 'INE, Anuário Estatístico do Ensino Superior, Ciência, Tecnologia e Inovação 2019',
    'url': 'https://www.ine.gov.ao/Arquivos/arquivosCarregados/Carregados/Publicacao_638240590069968941.pdf',
}
YEARBOOK_2023 = {
    'label': 'MESCTI, Anuário Estatístico do Ensino Superior 2022-2023 (INE, agosto de 2026)',
    'url': 'https://ine.gov.ao/Arquivos/arquivosCarregados//Carregados/Publicacao_639216002117172437.pdf',
}
# Graduates a year, from each yearbook's Quadro 2.2 total.
SERIES = [
    {'year': '2014', 'graduates': 13_547, 'source': EXPANSAO},
    {'year': '2018', 'graduates': 21_661, 'source': YEARBOOK_2019},
    {'year': '2022/23', 'graduates': 29_302, 'source': YEARBOOK_2023},
    {'year': '2023/24', 'graduates': 31_503, 'source': {k: YEARBOOK[k] for k in ('label', 'url')}},
]
OUTPUT = Path(__file__).resolve().parents[2] / 'apps' / 'web' / 'src' / 'data' / 'market' / 'education.json'

_ROW = re.compile(r'^(.*?[^\d\s])((?: \d+)+)$')
# The parts of a university, each with its own courses.
_UNIT = re.compile(r'^(Faculdade|Escola|Instituto|Departamento|Unidade|Centro|P[óo]lo)\b')
# Lines repeated at the top of every page of the tables.
_HEADERS = {'Instituições de Ensino Superior e Cursos', 'Sexo', 'Total Geral', 'M F'}


def _split(groups: list[str]) -> list[int] | None:
    """'987 431 1 418' into men, women and total: the reading where men + women = total.

    Thousands are separated by a space, so '987 431' alone could be one number or two.
    """
    for sizes in itertools.product([1, 2], repeat=3):
        if sum(sizes) != len(groups):
            continue
        parts, at = [], 0
        for size in sizes:
            parts.append(groups[at : at + size])
            at += size
        if any(len(part) == 2 and len(part[1]) != 3 for part in parts):
            continue
        men, women, total = (0 if part == ['-'] else int(''.join(part)) for part in parts)
        if men + women == total:
            return [men, women, total]
    # Only men or only women: the empty cell is left out, so the total repeats the one number ('27 27').
    half = len(groups) // 2
    if len(groups) % 2 == 0 and groups[:half] == groups[half:]:
        value = int(''.join(groups[:half]))
        return [value, 0, value]
    return None


def courses(text: str) -> tuple[list[dict], int]:
    """Each course of each institution, and the yearbook's total, to check against.

    An institution's row comes first, then its faculties or schools (a university), then their courses, until
    they add up to the institution's total.
    """
    lines = text.splitlines()
    start = next(index for index, line in enumerate(lines) if line.startswith(YEARBOOK['first']))
    end = next(index for index, line in enumerate(lines) if line.startswith(YEARBOOK['last']))
    # Graduates still to come under each open institution and faculty.
    rows, total, left, pending = [], 0, [], ''
    for line in (line.strip() for line in lines[start + 1 : end]):
        match = _ROW.match(line)
        numbers = match and _split(match.group(2).split())
        if not numbers:
            # A long course name breaks over two lines.
            keep = line not in _HEADERS and not line.isdigit() and not line.startswith('Quadro')
            pending = f'{pending} {line}'.strip() if keep else ''
            continue
        name, graduates = f'{pending} {match.group(1)}'.strip(), numbers[2]
        pending = ''
        if name in ('Pública', 'Privada'):
            total += graduates
        elif name == 'Total Geral':
            continue
        elif not left or _UNIT.match(name):
            if left and graduates > left[-1]:
                raise SystemExit(f'{name}: more graduates than its institution')
            left.append(graduates)
        else:
            rows.append({'name': name, 'graduates': graduates})
            left = [count - graduates for count in left]
            if left[-1] < 0:
                raise SystemExit(f'{name}: more graduates than its institution')
            while left and left[-1] == 0:
                left.pop()
    if left:
        raise SystemExit(f'Courses missing: {left}')
    return rows, total


def by_course(rows: list[dict]) -> list[dict]:
    """The same course in every institution, added up, under its most common spelling."""
    graduates: Counter = Counter()
    names: dict[str, Counter] = defaultdict(Counter)
    for row in rows:
        key = re.sub(r'\s+', ' ', fold(row['name']))
        graduates[key] += row['graduates']
        names[key][row['name']] += 1
    return [{'name': names[key].most_common(1)[0][0], 'graduates': count} for key, count in graduates.items()]


def main() -> None:
    body, _ = get(YEARBOOK['url'], 'application/pdf')
    with tempfile.TemporaryDirectory() as folder:
        pdf = Path(folder) / 'anuario.pdf'
        pdf.write_bytes(body)
        first, last = YEARBOOK['pages']
        raw = subprocess.run(
            ['pdftotext', '-f', str(first), '-l', str(last), '-raw', '-enc', 'UTF-8', str(pdf), '-'],
            capture_output=True,
            check=True,
        ).stdout
    rows, total = courses(raw.decode('utf-8'))
    if sum(row['graduates'] for row in rows) != total:
        raise SystemExit(f'The courses add up to {sum(r["graduates"] for r in rows)}, the tables say {total}')

    areas = {area: [] for area in AREAS}
    for row in by_course(rows):
        areas[course_area(row['name'])].append(row)
    data = {
        'year': YEARBOOK['year'],
        'total': total,
        'source': {k: YEARBOOK[k] for k in ('label', 'url')},
        'areas': [
            {
                'area': area,
                'graduates': sum(row['graduates'] for row in items),
                'courses': sorted(items, key=lambda row: -row['graduates']),
            }
            for area, items in areas.items()
        ],
        'series': SERIES,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n', encoding='utf-8', newline='\n')
    print(f'{len(rows)} courses in institutions, {total} graduates in {YEARBOOK["year"]} -> {OUTPUT}')


if __name__ == '__main__':
    main()
