"""The areas of the Mercado overview, shared by job posts and graduates, so both can be read side by side.

A job post has a sector (jobs/classify.py); a graduate has a course (education/anuario.py). Both fall into
one of these areas.
"""

import re

from jobs.facts import fold

AREAS = [
    'technology', 'engineering', 'oil_mining', 'health', 'education', 'business', 'legal', 'public',
    'communication', 'agriculture', 'hospitality', 'logistics', 'sciences',
]

SECTOR_AREAS = {
    'technology': 'technology', 'telecom': 'technology', 'engineering': 'engineering',
    'construction': 'engineering', 'oil_mining': 'oil_mining', 'health': 'health', 'education': 'education',
    'finance': 'business', 'sales': 'business', 'administration': 'business', 'marketing': 'communication',
    'legal': 'legal', 'security': 'public', 'public_admin': 'public', 'agriculture': 'agriculture',
    'hospitality': 'hospitality', 'logistics': 'logistics',
}

# First match wins: teaching courses go to education before their subject ("Ensino da Matemática").
COURSE_AREAS: list[tuple[str, str]] = [
    ('education', r'^ensino|educacao|pedagog|formacao de professores|magisterio|didac?tica|informatica educativa|instrucao primaria'),
    ('health', r'medicina(?! veterin)|enferm|analises|cardio|farmac|fisioter|nutric|radiolog|laboratorio clinico|'
     r'electromedicina|hospitalar|psicologia clinica|odontolog|estomatolog'),
    ('oil_mining', r'petrole|minas|geolog|geofisica|metalurgia'),
    ('technology', r'informat|comput|telecomunica|eletronica|electronica|redes'),
    ('agriculture', r'agron|agropec|agraria|florest|zootec|veterin|ambiente|meteorolog|biologia marinha|aquicultura|recursos marinhos|pescas'),
    ('engineering', r'engenharia|arquitec?tura|urbanismo|mecatronica|planeamento regional|construcao civil|electromecanica'),
    ('legal', r'direito'),
    ('public', r'administracao publica|gestao publica|administracao do territorio|gestao do territorio|criminais|'
     r'ciencia politica|politicas|relacoes internacionais'),
    ('hospitality', r'hotel|turismo'),
    ('logistics', r'logistica'),
    ('business', r'secretariado'),
    ('communication', r'comunicacao|jornalismo|cinema|teatro|musica|artes|lingua|literatura'),
    ('business', r'gestao|administracao|contabil|financ|econom|bancar|marketing|secretariado|organizacao'),
]
_COURSE_AREAS = [(area, re.compile(pattern)) for area, pattern in COURSE_AREAS]


def sector_area(sector: str) -> str | None:
    return SECTOR_AREAS.get(sector)


def course_area(course: str) -> str:
    """The area of a degree course; the sciences and humanities when no other fits."""
    return known_course_area(course) or 'sciences'


def known_course_area(course: str) -> str | None:
    """The area of a course, or None when no rule knows it (a job ad's "formação em…" can be anything)."""
    folded = fold(course)
    return next((area for area, pattern in _COURSE_AREAS if pattern.search(folded)), None)
