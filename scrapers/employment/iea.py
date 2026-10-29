"""Unemployment by age and the young people who neither work nor study, from INE's employment survey (IEA).

    python -m employment.iea

Reads the yearly report with pdftotext (poppler) and writes apps/web/src/data/market/employment.json.
"""

import json
import re
import subprocess
import tempfile
from pathlib import Path

from jobs.http import get

REPORT = {
    'label': 'INE, Inquérito sobre o Emprego em Angola 2025 (anuário de abril de 2026)',
    'url': 'https://www.ine.gov.ao/Arquivos/arquivosCarregados/Carregados/Publicacao_639118346133135279.pdf',
    'year': 2025,
}
OUTPUT = Path(__file__).resolve().parents[2] / 'apps' / 'web' / 'src' / 'data' / 'market' / 'employment.json'

# A row ends with the rates for all, men and women ("51,8 53,0 50,6"); the first is the one kept.
_RATES = re.compile(r'\s(\d+,\d)\s+\d+,\d\s+\d+,\d$')
_AGE = re.compile(r'^(\d+)(?:-(\d+)| ou mais) anos\s')


def _table(lines: list[str], title: str) -> list[str]:
    """The lines of a table, from its title (the last one: the first is in the contents) to the next "Fonte"."""
    start = max(index for index, line in enumerate(lines) if line.startswith(title))
    end = next(index for index in range(start, len(lines)) if lines[index].startswith('Fonte'))
    return lines[start:end]


def _rate(line: str) -> float:
    match = _RATES.search(line) or re.search(r'\s(\d+,\d)$', line)
    if not match:
        raise SystemExit(f'No rate in {line!r}')
    return round(float(match.group(1).replace(',', '.')) / 100, 3)


def read(text: str) -> dict:
    lines = [line.strip() for line in text.splitlines()]
    # Quadro 5: everyone 15 or older, by age group.
    unemployment = _table(lines, 'Quadro 5 ')
    ages = []
    for line in unemployment[unemployment.index('Grupos etários') :]:
        match = _AGE.match(line)
        if line == 'Outros grupos etários':
            break
        if match:
            ages.append({'from': int(match.group(1)), 'to': int(match.group(2)) if match.group(2) else None,
                         'rate': _rate(line)})
    angola = next(line for line in unemployment if line.startswith('Angola '))
    # Quadro 25: the young (15 to 24) in towns and in the country. Quadro 26: those who neither work nor study.
    youth = _table(lines, 'Quadro 25 ')
    neither = _table(lines, 'Quadro 26 ')
    row = lambda table, name: next(line for line in table if line.startswith(name + ' '))  # noqa: E731
    return {
        'year': REPORT['year'],
        'source': {key: REPORT[key] for key in ('label', 'url')},
        'unemployment': _rate(angola),
        'ages': ages,
        'youth': {
            'unemployment': _rate(row(youth, 'Angola')),
            'urban': _rate(row(youth, 'Urbana')),
            'rural': _rate(row(youth, 'Rural')),
            'neitherWorkNorStudy': _rate(row(neither, 'Angola')),
        },
    }


def main() -> None:
    body, _ = get(REPORT['url'], 'application/pdf')
    with tempfile.TemporaryDirectory() as folder:
        pdf = Path(folder) / 'iea.pdf'
        pdf.write_bytes(body)
        raw = subprocess.run(
            ['pdftotext', '-raw', '-enc', 'UTF-8', str(pdf), '-'], capture_output=True, check=True
        ).stdout.decode('utf-8')
    data = read(raw)
    OUTPUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n', encoding='utf-8', newline='\n')
    print(f"Unemployment {data['unemployment']}, young {data['youth']['unemployment']} -> {OUTPUT}")


if __name__ == '__main__':
    main()
