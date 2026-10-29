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
    'graduates': ('Quadro 2.4', 'Quadro 2.7'),
    # Quadro 5.7: students per course, public and private, day and after-work.
    'enrolled': ('Quadro 5.7', 'Quadro 5.8'),
    # Quadro 1.2: the national numbers, among them candidates and first-year students.
    'indicators': ('Quadro 1.2', 'Quadro 1.3'),
}
# The national numbers the Mercado shows, by their row in Quadro 1.2.
INDICATORS = {
    'candidates': 'Número de Candidatos Inscritos',
    'firstTime': 'Número Estudantes Matriculados pela 1ª vez em Graduação',
    'enrolled': 'Número de Estudantes Matriculados em Graduação',
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
_HEADERS = {
    'Instituições de Ensino Superior e Cursos', 'Instituições de Ensino Superior', 'Sexo', 'Sexo Total', 'Total Geral',
    'Geral', 'M F',
}


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


def courses(
    text: str, table: tuple[str, str] = YEARBOOK['graduates'], field: str = 'graduates', nature: str | None = None
) -> tuple[list[dict], int]:
    """Each course of each institution (with the institution, and whether it is public or private), and the
    table's own total, to check against.

    An institution's row comes first, then its faculties or schools (a university), then their courses, until
    they add up to the institution's total. Tables of both natures say which rows are "Pública" or "Privada".
    """
    # What is still to come under each open institution and faculty, and their names.
    rows, total, left, names, pending = [], 0, [], [], ''
    for line in _table(text, *table):
        match = _ROW.match(line)
        numbers = match and _split(match.group(2).split())
        if not numbers:
            # A long course name breaks over two lines.
            keep = line not in _HEADERS and not line.isdigit() and not line.startswith('Quadro')
            pending = f'{pending} {line}'.strip() if keep else ''
            continue
        name, count = f'{pending} {match.group(1)}'.strip(), numbers[2]
        pending = ''
        if name in ('Pública', 'Privada'):
            total += count
            nature = 'publica' if name == 'Pública' else 'privada'
        elif name == 'Total Geral':
            total = total or count
        elif not left or _UNIT.match(name):
            if left and count > left[-1]:
                raise SystemExit(f'{name}: more than its institution')
            left.append(count)
            names.append(name)
        else:
            rows.append({'institution': names[0], 'nature': nature, 'name': name, field: count})
            left = [open_count - count for open_count in left]
            if left[-1] < 0:
                raise SystemExit(f'{name}: more than its institution')
            while left and left[-1] == 0:
                left.pop()
                names.pop()
    if left:
        raise SystemExit(f'Courses missing: {left}')
    return rows, total


def _table(text: str, first: str, last: str) -> list[str]:
    """The lines of a table, from its title to the next table's. The title's last line is the table's: the
    contents come first (and a long title there can have its dots on the next line)."""
    lines = [line.strip() for line in text.splitlines()]
    start = max(index for index, line in enumerate(lines) if line.startswith(first))
    end = next(index for index in range(start + 1, len(lines)) if lines[index].startswith(last))
    return lines[start + 1 : end]


def _readings(groups: list[str]):
    """Every way to read space-separated groups as numbers: a thousand is a group of 3 digits after 1 to 3."""
    if not groups:
        yield []
        return
    yield from ([int(groups[0])] + rest for rest in _readings(groups[1:]))
    if len(groups) > 1 and len(groups[1]) == 3 and len(groups[0]) <= 3:
        yield from ([int(groups[0] + groups[1])] + rest for rest in _readings(groups[2:]))


def _blocks(numbers: list[int]):
    """The totals of the blocks a row splits into: "men, women, total", or "one sex, total" when a cell is empty."""
    if not numbers:
        yield []
        return
    if len(numbers) >= 3 and numbers[0] + numbers[1] == numbers[2]:
        yield from ([numbers[2]] + rest for rest in _blocks(numbers[3:]))
    if len(numbers) >= 2 and numbers[0] == numbers[1]:
        yield from ([numbers[1]] + rest for rest in _blocks(numbers[2:]))


def _grand_total(groups: list[str]) -> int | None:
    """A row of Quadro 5.7 (day: men, women, total; after-work: the same; the grand total; empty cells left out):
    the reading whose blocks add up to its last number."""
    for numbers in _readings(groups):
        *parts, total = numbers
        if any(1 <= len(found) <= 2 and sum(found) == total for found in _blocks(parts)):
            return total
    return None


def enrolled(text: str) -> tuple[list[dict], int]:
    """Students per course (Quadro 5.7) and the table's total, to check against."""
    rows, total, pending = [], 0, ''
    for line in _table(text, *YEARBOOK['enrolled']):
        match = _ROW.match(line)
        count = match and _grand_total(match.group(2).split())
        if not count:
            keep = line not in _HEADERS and not line.isdigit() and not re.match(r'(Regular|Pós|Laboral|Geral|M F)', line)
            pending = f'{pending} {line}'.strip() if keep and not match else ''
            continue
        name = f'{pending} {match.group(1)}'.strip()
        pending = ''
        if name == 'Total Geral':
            total = count
        elif name not in ('Pública', 'Privada'):
            rows.append({'name': name, 'enrolled': count})
    return rows, total


def indicators(text: str) -> dict[str, int]:
    """The national numbers of Quadro 1.2 the Mercado shows (their total column)."""
    found = {}
    for line in _table(text, *YEARBOOK['indicators']):
        for key, label in INDICATORS.items():
            numbers = line.startswith(label + ' ') and _split(line[len(label) :].split())
            if numbers:
                found[key] = numbers[2]
    return found


def by_course(rows: list[dict], field: str) -> dict[str, dict]:
    """The same course in every institution, added up, under its most common spelling, by its folded name."""
    counts: Counter = Counter()
    names: dict[str, Counter] = defaultdict(Counter)
    for row in rows:
        key = re.sub(r'\s+', ' ', fold(row['name']))
        counts[key] += row[field]
        names[key][row['name']] += 1
    return {key: {'name': names[key].most_common(1)[0][0], field: count} for key, count in counts.items()}


def main() -> None:
    body, _ = get(YEARBOOK['url'], 'application/pdf')
    with tempfile.TemporaryDirectory() as folder:
        pdf = Path(folder) / 'anuario.pdf'
        pdf.write_bytes(body)
        raw = subprocess.run(
            ['pdftotext', '-raw', '-enc', 'UTF-8', str(pdf), '-'], capture_output=True, check=True
        ).stdout.decode('utf-8')
    rows, total = courses(raw)
    if sum(row['graduates'] for row in rows) != total:
        raise SystemExit(f'The courses add up to {sum(r["graduates"] for r in rows)}, the tables say {total}')
    students, students_total = enrolled(raw)
    if sum(row['enrolled'] for row in students) != students_total:
        raise SystemExit(f'Students add up to {sum(r["enrolled"] for r in students)}, the table says {students_total}')
    access = indicators(raw)
    if set(access) != set(INDICATORS) or access['enrolled'] != students_total:
        raise SystemExit(f'Quadro 1.2 read as {access}')

    # Each course with its graduates and its students now (a new course has students and no graduates yet).
    merged: dict[str, dict] = defaultdict(lambda: {'graduates': 0, 'enrolled': 0})
    for key, row in by_course(rows, 'graduates').items():
        merged[key].update(row)
    for key, row in by_course(students, 'enrolled').items():
        merged[key].update({'name': merged[key].get('name', row['name']), 'enrolled': row['enrolled']})
    areas = {area: [] for area in AREAS}
    for row in merged.values():
        areas[course_area(row['name'])].append({'name': row['name'], 'graduates': row['graduates'], 'enrolled': row['enrolled']})
    data = {
        'year': YEARBOOK['year'],
        'total': total,
        'access': access,
        'source': {k: YEARBOOK[k] for k in ('label', 'url')},
        'areas': [
            {
                'area': area,
                'graduates': sum(row['graduates'] for row in items),
                'enrolled': sum(row['enrolled'] for row in items),
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
