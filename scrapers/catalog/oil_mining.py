"""Oil, gas and mining from end to end, for the app to choose from: who teaches it (the institutions and their petroleum,
mining, geology and metallurgy courses), who employs (the oil and gas agency, the ministry, the geological institute,
the diamond companies) and the oil companies and service firms with most job ads, each with its source.

The area takes the Mercado's oil and mining area and the metallurgy courses the yearbook files under engineering.

    python -m catalog.oil_mining    # after python -m catalog.institutions

Writes catalog/oil_mining.json and, for the app, apps/web/src/data/catalog/oil_mining.json.
"""

import re

from jobs.facts import fold

from .business import employers_in_job_ads
from .engineering import METAL
from .output import site, statute, write

# An oil company or a service firm among the job ads' employers.
_ORGANISATION = re.compile(r'chevron|total|azule|halliburton|baker|spie|southey|sercomoil|schlumberger|\bslb\b|exxon|'
                           r'\beni\b|\bbp\b|oil|gas|energy|petrol|group|limitada|\blda\b')
# Sonangol is curated in the app; "Sector Petrolífero" names no one.
_ELSEWHERE = re.compile(r'sonangol|sector petrol|setor petrol')
MIN_POSTINGS = 5

# Gathered by hand from public sources (each one named).
NAMED_EMPLOYERS = [
    {'name': 'Agência Nacional de Petróleo, Gás e Biocombustíveis (ANPG)', 'sector': 'estado', 'kind': 'agencia',
     'source': site('https://www.anpg.co.ao')},
    {'name': 'Ministério dos Recursos Minerais, Petróleo e Gás (MIREMPET)', 'sector': 'estado', 'kind': 'ministerio',
     'source': statute('Estatuto Orgânico do Ministério dos Recursos Minerais, Petróleo e Gás',
                       'estatuto-organico-do-ministerio-dos-recursos-minerais-petroleo-e-gas')},
    {'name': 'Instituto Geológico de Angola (IGEO)', 'sector': 'estado', 'kind': 'geologico',
     'source': statute('Decreto Presidencial n.º 16/19, Estatuto Orgânico do IGEO',
                       'estatuto-organico-do-instituto-geologico-de-angola-igeo-16a-19a')},
    {'name': 'Endiama', 'sector': 'mineracao', 'kind': 'diamantes', 'source': site('https://www.endiama.co.ao')},
    {'name': 'Sociedade Mineira de Catoca', 'sector': 'mineracao', 'kind': 'mina', 'source': site('https://www.catoca.com')},
    {'name': 'Azule Energy', 'sector': 'energia', 'kind': 'petrolifera', 'source': site('https://www.azule-energy.com')},
]


def in_area(course: dict) -> bool:
    return course['area'] == 'oil_mining' or (course['area'] == 'engineering' and bool(METAL.search(fold(course['name']))))


def main() -> None:
    ads = employers_in_job_ads('oil_mining', _ORGANISATION, _ELSEWHERE, MIN_POSTINGS)
    # One company under two names ("TotalEnergies", "TotalEnergies EP").
    merged: dict[str, dict] = {}
    for ad in ads:
        name = 'TotalEnergies' if fold(ad['name']).startswith('totalenergies') else ad['name']
        merged.setdefault(name, {'name': name, 'postings': 0})['postings'] += ad['postings']
    ads = sorted(merged.values(), key=lambda entry: -entry['postings'])
    write('oil_mining', in_area, named=NAMED_EMPLOYERS, ads=ads, ad_sector='energia')


if __name__ == '__main__':
    main()
