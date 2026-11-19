"""Agriculture, fisheries and the environment from end to end, for the app to choose from: who teaches them (the
institutions and their agronomy, forestry, veterinary, fisheries and environment courses) and who employs (the
ministries of agriculture and of fisheries, the agrarian and forestry institutes, the weather service, the agro-industry),
each with its source. The job ads name no employer often enough.

The area takes the Mercado's agriculture area and the food and fish processing courses the yearbook files under
engineering.

    python -m catalog.agriculture    # after python -m catalog.institutions

Writes catalog/agriculture.json and, for the app, apps/web/src/data/catalog/agriculture.json.
"""

from jobs.facts import fold

from .engineering import FOOD
from .output import site, statute, write

# Gathered by hand from public sources (each one named).
NAMED_EMPLOYERS = [
    {'name': 'Ministério da Agricultura e Florestas (MINAGRIF)', 'sector': 'estado', 'kind': 'agricultura',
     'source': statute('Estatuto Orgânico do Ministério da Agricultura e Floresta',
                       'estatuto-organico-do-ministerio-da-agricultura-e-floresta')},
    {'name': 'Ministério das Pescas e Recursos Marinhos (MINPERMAR)', 'sector': 'estado', 'kind': 'pescas',
     'source': statute('Decreto Presidencial n.º 132/24, Estatuto Orgânico do Ministério das Pescas e Recursos Marinhos',
                       'estatuto-organico-do-ministerio-das-pescas-e-recursos-marinhos-132a-24a')},
    {'name': 'Instituto de Desenvolvimento Agrário (IDA)', 'sector': 'estado', 'kind': 'desenvolvimento_agrario',
     'source': site('https://ida.gov.ao')},
    {'name': 'Instituto de Desenvolvimento Florestal (IDF)', 'sector': 'estado', 'kind': 'florestal',
     'source': statute('Decreto Presidencial n.º 5/14, Estatuto Orgânico do Instituto de Desenvolvimento Florestal',
                       'estatuto-organico-do-instituto-de-desenvolvimento-florestal-5a-14a')},
    {'name': 'Instituto Nacional de Meteorologia e Geofísica (INAMET)', 'sector': 'estado', 'kind': 'meteorologia',
     'source': statute('Decreto Presidencial n.º 164/21, Estatuto Orgânico do INAMET',
                       'estatuto-organico-do-instituto-nacional-de-meteorologia-e-geofisica-164a-21a')},
    {'name': 'Biocom, Companhia de Bioenergia de Angola', 'sector': 'agricultura', 'kind': 'agroindustria',
     'source': site('https://biocom-angola.com')},
]


def in_area(course: dict) -> bool:
    return course['area'] == 'agriculture' or (course['area'] == 'engineering' and bool(FOOD.search(fold(course['name']))))


def main() -> None:
    write('agriculture', in_area, named=NAMED_EMPLOYERS)


if __name__ == '__main__':
    main()
