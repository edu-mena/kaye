"""Every higher education institution in the 2023-2024 yearbook with its courses: the area, the students and the
graduates of each, whether it is public or private, and its province. One catalogue for every area: each area of
the app takes its part (`python -m catalog.area health`).

    python -m catalog.institutions

Writes catalog/institutions.json (public figures, with their source).
"""

import json
import re
import subprocess
import tempfile
from collections import defaultdict
from difflib import SequenceMatcher
from pathlib import Path

from areas import course_area
from education.anuario import YEARBOOK, _table, courses
from jobs.facts import PROVINCES, fold
from jobs.http import get

OUTPUT = Path(__file__).resolve().parent / 'institutions.json'
# Students per institution and course: public schools and institutes, public universities, private institutions.
STUDENTS = [
    (('Quadro 5.4', 'Quadro 5.5'), 'publica'),
    (('Quadro 5.5', 'Quadro 5.6'), 'publica'),
    (('Quadro 5.6', 'Quadro 5.7'), 'privada'),
]
# Students per province and institution: where each institution is.
PLACES = ('Quadro 5.8', 'Quadro 5.9')
_PROVINCES = {fold(name): name for name in PROVINCES}
# A province of the yearbook that the 2024 division split in two: its institutions are placed by hand.
_SPLIT_PROVINCES = {'cuando cubango'}
# Institutions Quadro 5.8 leaves out, names differently or lists in two provinces, where they are known to be.
KNOWN_PLACES = {
    # Teaches in both Lundas; its seat is in Dundo, Lunda Norte (Decreto Presidencial n.º 285/20).
    'universidade lueji a nkonde': 'Lunda Norte',
    'instituto superior tecnico militar': 'Luanda',
    # The National Police's institute (Decreto Presidencial n.º 99/13; ANGOP and Ver Angola place it in Luanda).
    'instituto superior de ciencias policiais e criminais general osvaldo serra vandunem': 'Luanda',
    # In Menongue, now the capital of Cubango (the university's seat: Decreto Presidencial n.º 314/21).
    'universidade cuito cuanavale': 'Cubango',
    'instituto superior politecnico privado de menongue': 'Cubango',
}
# Institutions the graduates' table names unlike the students' tables (they share their courses).
SAME_AS = {
    'escola superior pedagogica do bengo': 'escola pedagogica do bengo',
    'escola superior de ciencias sociais artes e humanidades': 'escola superior de ciencias artes e humanidade',
    'instituto superior politecnico kalandula': 'instituto superior politecnico kalandula de angola',
    'instituto superior politecnico katangoji': 'instituto superior politecnico katangojo',
    'instituto superior politecnico de kangojo': 'instituto superior politecnico kangonjo',
    'instituto de ciencias de educacao de luanda': 'instituto superior de ciencias de educacao de luanda',
    'universidade katyavala bwila': 'universidade katyavala buila',
    'universidade lueji a n konde': 'universidade lueji a nkonde',
}


def key(name: str) -> str:
    """'Intituto Superior…' and 'Instituto Superior…' are the same institution (the yearbook has typos)."""
    folded = re.sub(r'\bintituto\b', 'instituto', fold(name))
    squeezed = re.sub(r'[^a-z0-9]+', ' ', folded).strip()
    return SAME_AS.get(squeezed, squeezed)


def same(one: str, other: str, ratio: float) -> bool:
    """Two keys for one institution: the same last word ("…do Bié" is not "…do Uíge") and nearly the same
    letters ("Universidade Agostino Neto", "Escola Pedagógica do Bengo" for "Escola Superior Pedagógica…")."""
    return one.split()[-1] == other.split()[-1] and SequenceMatcher(None, one, other).ratio() >= ratio


def find(name_key: str, keys, ratio: float) -> str | None:
    if name_key in keys:
        return name_key
    return next((other for other in keys if same(name_key, other, ratio)), None)


def places(text: str) -> dict[str, str]:
    """Each institution's province: the province's row, then its institutions."""
    found, province = {}, None
    for line in _table(text, *PLACES):
        match = re.match(r'^(.*?[^\d\s])((?: \d+)+)$', line)
        if not match:
            continue
        name = match.group(1).strip()
        if fold(name) in _PROVINCES or fold(name) in _SPLIT_PROVINCES:
            province = _PROVINCES.get(fold(name))
        elif province:
            found[key(name)] = province
    return found


def catalogue(text: str) -> list[dict]:
    graduates, _ = courses(text)
    students = [row for table, nature in STUDENTS for row in courses(text, table, 'students', nature)[0]]
    where = places(text)

    institutions: dict[str, dict] = {}
    offers: dict[str, dict[str, dict]] = defaultdict(dict)
    for row in students + graduates:
        name_key = find(key(row['institution']), institutions, 0.92) or key(row['institution'])
        place = find(name_key, where, 0.8)
        entry = institutions.setdefault(
            name_key,
            {
                'name': row['institution'],
                'nature': row['nature'],
                'province': KNOWN_PLACES.get(name_key) or (where[place] if place else None),
            },
        )
        entry['nature'] = entry['nature'] or row['nature']
        offer = offers[name_key].setdefault(
            key(row['name']),
            {'name': row['name'], 'area': course_area(row['name']), 'students': 0, 'graduates': 0},
        )
        offer['students'] += row.get('students', 0)
        offer['graduates'] += row.get('graduates', 0)
    return sorted(
        (
            entry | {'courses': sorted(offers[name_key].values(), key=lambda offer: -offer['students'])}
            for name_key, entry in institutions.items()
        ),
        key=lambda entry: entry['name'],
    )


def main() -> None:
    body, _ = get(YEARBOOK['url'], 'application/pdf')
    with tempfile.TemporaryDirectory() as folder:
        pdf = Path(folder) / 'anuario.pdf'
        pdf.write_bytes(body)
        text = subprocess.run(
            ['pdftotext', '-raw', '-enc', 'UTF-8', str(pdf), '-'], capture_output=True, check=True
        ).stdout.decode('utf-8')
    institutions = catalogue(text)
    data = {
        'year': YEARBOOK['year'],
        'source': {k: YEARBOOK[k] for k in ('label', 'url')},
        'institutions': institutions,
    }
    OUTPUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n', encoding='utf-8', newline='\n')
    placed = sum(1 for entry in institutions if entry['province'])
    print(f'{len(institutions)} institutions ({placed} with a province) -> {OUTPUT}')


if __name__ == '__main__':
    main()
