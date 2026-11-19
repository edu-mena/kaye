"""Logistics and transport from end to end, for the app to choose from: who teaches them (the institutions and their
logistics and transport courses), who employs (the ministry of transport, the civil aviation authority, the ports, the
railway) and the facts behind them (the civil aviation's 2026 salary table), each with its source. The job ads name no
employer often enough.

The area takes the Mercado's logistics area and the transport engineering courses the yearbook files under engineering.

    python -m catalog.logistics    # after python -m catalog.institutions

Writes catalog/logistics.json and, for the app, apps/web/src/data/catalog/logistics.json.
"""

from jobs.facts import fold

from .engineering import TRANSPORT
from .humanities import rank_rows, read_tables
from .output import site, statute, write

# The State's 2026 base salaries (Decreto Presidencial n.º 16/26): the civil aviation's special regime.
SALARY_TABLES = {
    'aviacao_civil': 'https://angolex.com/paginas/diversos/tabela-salarial-do-regime-especial-da-aviacao-civil-2026a.html',
}

# Gathered by hand from public sources (each one named).
NAMED_EMPLOYERS = [
    {'name': 'Ministério dos Transportes (MINTRANS)', 'sector': 'estado', 'kind': 'ministerio',
     'source': statute('Decreto Presidencial n.º 233/20, Estatuto Orgânico do Ministério dos Transportes',
                       'estatuto-organico-do-ministerio-dos-transportes-233a-20a')},
    {'name': 'Autoridade Nacional da Aviação Civil (ANAC)', 'sector': 'estado', 'kind': 'aviacao',
     'source': site('https://www.anac.ao')},
    {'name': 'Porto de Luanda', 'sector': 'transportes', 'kind': 'porto', 'source': site('https://www.portoluanda.co.ao')},
    {'name': 'Porto do Lobito', 'sector': 'transportes', 'kind': 'porto', 'source': site('https://portodolobito.co.ao')},
    {'name': 'Caminho de Ferro de Benguela (CFB)', 'sector': 'transportes', 'kind': 'caminho_de_ferro',
     'source': statute('Decreto Presidencial n.º 150/10, Estatuto da Empresa do Caminho de Ferro de Benguela',
                       'estatuto-da-empresa-do-caminho-de-ferro-de-benguela-150a-10a')},
]


def in_area(course: dict) -> bool:
    return course['area'] == 'logistics' or (
        course['area'] == 'engineering' and bool(TRANSPORT.search(fold(course['name'])))
    )


def main() -> None:
    write('logistics', in_area, named=NAMED_EMPLOYERS,
          salaries={'year': 2026, 'decree': 'Decreto Presidencial n.º 16/26, de 22 de Janeiro', 'urls': SALARY_TABLES,
                    'careers': read_tables(SALARY_TABLES, rank_rows)})


if __name__ == '__main__':
    main()
