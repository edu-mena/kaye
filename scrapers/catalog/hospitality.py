"""Tourism and hospitality from end to end, for the app to choose from: who teaches them (the institutions and their
tourism and hotel management courses), who employs (the ministry of tourism, a hotel group) and the hotels with most
job ads, each with its source.

    python -m catalog.hospitality    # after python -m catalog.institutions

Writes catalog/hospitality.json and, for the app, apps/web/src/data/catalog/hospitality.json.
"""

import re

from .business import employers_in_job_ads
from .output import site, statute, write

# A hotel among the job ads' employers.
_ORGANISATION = re.compile(r'hotel|resort|lodge|turismo')
_ELSEWHERE = re.compile(r'sana')
MIN_POSTINGS = 4

# Gathered by hand from public sources (each one named).
NAMED_EMPLOYERS = [
    {'name': 'Ministério do Turismo (MINTUR)', 'sector': 'estado', 'kind': 'ministerio',
     'source': statute('Decreto Presidencial n.º 134/24, Estatuto Orgânico do Ministério do Turismo',
                       'estatuto-organico-do-ministerio-do-turismo-134a-24a')},
    {'name': 'SANA Hotels', 'sector': 'turismo', 'kind': 'hotel', 'source': site('https://www.sanahotels.com')},
]


def in_area(course: dict) -> bool:
    return course['area'] == 'hospitality'


def main() -> None:
    ads = employers_in_job_ads('hospitality', _ORGANISATION, _ELSEWHERE, MIN_POSTINGS)
    write('hospitality', in_area, named=NAMED_EMPLOYERS, ads=ads, ad_sector='turismo')


if __name__ == '__main__':
    main()
