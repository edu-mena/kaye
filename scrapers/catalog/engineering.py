"""Engineering and construction from end to end, for the app to choose from: who teaches it (the institutions and their
engineering and architecture courses), who employs (the ministries of public works and of energy and water, the
engineering laboratory, the electricity companies, the builders) and the job ads' employers, each with its source.

The area takes the Mercado's engineering area but transport and logistics (to logistics), food and fish processing
(to agriculture) and metallurgy (to oil, gas and mining).

    python -m catalog.engineering    # after python -m catalog.institutions

Writes catalog/engineering.json and, for the app, apps/web/src/data/catalog/engineering.json.
"""

import re

from jobs.facts import fold

from .business import employers_in_job_ads
from .output import site, statute, write

# The engineering courses other areas take.
TRANSPORT = re.compile(r'transporte|logistic')
FOOD = re.compile(r'agro.alimentar|pescado')
METAL = re.compile(r'metalurg')
# A builder or an industrial firm among the job ads' employers (Wange and the oil companies are other areas';
# "Indústria de Produção alimentar" names no one).
_ORGANISATION = re.compile(r'grupo|group|\blda\b|limitada|\bsa\b|construc|engenharia|contracting|services|industr')
_ELSEWHERE = re.compile(r'wange|chevron|total|sonangol|azule|industria de producao')
MIN_POSTINGS = 5

# Gathered by hand from public sources (each one named).
NAMED_EMPLOYERS = [
    {'name': 'Ministério das Obras Públicas, Urbanismo e Habitação (MINOPUH)', 'sector': 'estado',
     'kind': 'obras_publicas',
     'source': statute('Estatuto Orgânico do Ministério das Obras Públicas, Urbanismo e Habitação',
                       'estatuto-organico-do-ministerio-das-obras-publicas-urbanismo-e-habitacao')},
    {'name': 'Ministério da Energia e Águas (MINEA)', 'sector': 'estado', 'kind': 'energia_aguas',
     'source': statute('Decreto Presidencial n.º 223/20, Estatuto Orgânico do Ministério da Energia e Águas',
                       'estatuto-organico-do-ministerio-da-energia-e-aguas-223a-20a')},
    {'name': 'Laboratório de Engenharia de Angola (LEA)', 'sector': 'estado', 'kind': 'laboratorio',
     'source': statute('Decreto Presidencial n.º 306/14, Estatuto Orgânico do Laboratório de Engenharia de Angola',
                       'estatuto-organico-do-laboratorio-de-engenharia-de-angola-306a-14a')},
    {'name': 'Empresa Nacional de Distribuição de Electricidade (ENDE)', 'sector': 'energia', 'kind': 'distribuicao',
     'source': statute('Decreto Presidencial n.º 305/14, Estatuto Orgânico da ENDE',
                       'estatuto-organico-da-empresa-nacional-de-distribuicao-de-electricidade-305a-14a')},
    {'name': 'Empresa Pública de Produção de Electricidade (PRODEL)', 'sector': 'energia', 'kind': 'producao',
     'source': site('https://www.prodel.co.ao')},
    {'name': 'Mota-Engil Angola', 'sector': 'industria', 'kind': 'construtora', 'source': site('https://www.mota-engil.com')},
    {'name': 'Grupo Omatapalo', 'sector': 'industria', 'kind': 'construtora', 'source': site('https://www.omatapalo.com')},
]


def in_area(course: dict) -> bool:
    name = fold(course['name'])
    return course['area'] == 'engineering' and not (TRANSPORT.search(name) or FOOD.search(name) or METAL.search(name))


def main() -> None:
    ads = employers_in_job_ads('engineering', _ORGANISATION, _ELSEWHERE, MIN_POSTINGS)
    write('engineering', in_area, named=NAMED_EMPLOYERS, ads=ads, ad_sector='industria')


if __name__ == '__main__':
    main()
