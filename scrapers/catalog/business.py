"""Management, finance and trade from end to end, for the app to choose from: who teaches it (institutions and their
courses, the banking training), who employs (banks, insurers, auditors, the State's finance bodies and the employers
with most job ads) and the facts behind them, each with its source.

    python -m catalog.business      # after python -m catalog.institutions

Writes catalog/business.json and, for the app, apps/web/src/data/catalog/business.json.
"""

import json
import re
from collections import Counter
from pathlib import Path

from areas import sector_area
from jobs.collect import DATA
from jobs.facts import fold
from jobs.summarize import AGENCIES, UNNAMED, _company_key

from .health import teaching

HERE = Path(__file__).resolve().parent
OUTPUT = HERE / 'business.json'
APP_OUTPUT = HERE.parents[1] / 'apps' / 'web' / 'src' / 'data' / 'catalog' / 'business.json'
JOBS = {'label': 'Anúncios de emprego (Jobartis, AngoEmprego e outros)', 'url': 'https://www.jobartis.com'}
# An organisation's name: boards also show the person who posted, never kept.
_ORGANISATION = re.compile(
    r'banco|bank|segur|grupo|group|\blda\b|\bsa\b|industri|comerci|hipermercado|refriango|castel|beverage|kero|'
    r'consult|audit|empresa|servic|angola|international|academia|trading|motors|logistic'
)
# Not an employer: a job title the title parser took for one.
_TITLE = re.compile(r'^(director|chefe|gestor|tecnico|assistente|analista|responsavel)\b')
MIN_POSTINGS = 3
# Banks already in the app's curated companies.
_CURATED = re.compile(r'standard bank|\bbai\b|\bbfa\b|banco de fomento|banco bic|atlantico|banco sol\b')
_ARTICLE = re.compile(r'^(o|a|os|as|empresa)\s+', re.I)

SYSTEMIC = {'label': 'Ver Angola, 12/2025: os seis bancos sistémicos segundo o BNA',
            'url': 'https://www.verangola.net/va/pt/122025/BancaSeguros/47062/BNA-identifica-seis-bancos-que-devem-aumentar-reservas-a-partir-de-Janeiro.htm'}
ARSEG_2020 = {'label': 'Ver Angola, 01/2020: a ENSA é a maior seguradora, segundo a ARSEG',
              'url': 'https://www.verangola.net/va/pt/012020/BancaSeguros/18006/Companhia-Ensa-é-a-maior-seguradora-do-país-revela-a-ARSEG.htm'}
# Gathered by hand from public sources (each one named). The six biggest banks are already in the app.
NAMED_EMPLOYERS = [
    {'name': 'Banco de Poupança e Crédito (BPC)', 'sector': 'banca', 'kind': 'banco_publico', 'source': SYSTEMIC},
    {'name': 'Access Bank Angola', 'sector': 'banca', 'kind': 'banco',
     'source': {'label': 'Access Bank Angola, comunicado de 2026',
                'url': 'https://angola.accessbankplc.com/access/media/documentos/Access-Bank-Angola-Access-Bank-Angola-obtem-autorizacao-da-ARSEG-e-lanca-operacao-de-Bancassurance-com-parcerias-estrategicas-no-sector-segurador.pdf?ext=.pdf'}},
    {'name': 'ENSA Seguros', 'sector': 'seguros', 'kind': 'seguradora_publica', 'source': ARSEG_2020},
    {'name': 'Fidelidade Angola', 'sector': 'seguros', 'kind': 'seguradora', 'source': ARSEG_2020},
    {'name': 'Mulemba Ré', 'sector': 'seguros', 'kind': 'resseguradora',
     'source': {'label': 'Forbes África Lusófona: a primeira resseguradora nacional',
                'url': 'https://forbesafricalusofona.com/?p=173867'}},
    {'name': 'Deloitte Angola', 'sector': 'consultoria', 'kind': 'auditora',
     'source': {'label': 'Deloitte, Banca em Análise',
                'url': 'https://www2.deloitte.com/content/dam/Deloitte/ao/Documents/financial-services/deloitte_banca_em_analise_2016.pdf'}},
    {'name': 'PwC Angola', 'sector': 'consultoria', 'kind': 'auditora',
     'source': {'label': 'Página oficial', 'url': 'https://www.pwc.com/ao'}},
    {'name': 'EY Angola', 'sector': 'consultoria', 'kind': 'auditora',
     'source': {'label': 'Página oficial', 'url': 'https://www.ey.com/pt_ao'}},
    {'name': 'KPMG Angola', 'sector': 'consultoria', 'kind': 'auditora',
     'source': {'label': 'Página oficial', 'url': 'https://kpmg.com/ao'}},
    {'name': 'Banco Nacional de Angola (BNA)', 'sector': 'estado', 'kind': 'regulador',
     'source': {'label': 'Página oficial', 'url': 'https://www.bna.ao'}},
    {'name': 'Administração Geral Tributária (AGT)', 'sector': 'estado', 'kind': 'publico',
     'source': {'label': 'Página oficial', 'url': 'https://agt.minfin.gov.ao'}},
    {'name': 'Ministério das Finanças', 'sector': 'estado', 'kind': 'publico',
     'source': {'label': 'Página oficial', 'url': 'https://www.minfin.gov.ao'}},
    {'name': 'Bolsa de Dívida e Valores de Angola (BODIVA)', 'sector': 'estado', 'kind': 'regulador',
     'source': {'label': 'Página oficial', 'url': 'https://www.bodiva.ao'}},
    {'name': 'Comissão do Mercado de Capitais (CMC)', 'sector': 'estado', 'kind': 'regulador',
     'source': {'label': 'Página oficial', 'url': 'https://www.cmc.ao'}},
    {'name': 'Agência Angolana de Regulação e Supervisão de Seguros (ARSEG)', 'sector': 'estado', 'kind': 'regulador',
     'source': {'label': 'Página oficial', 'url': 'https://www.arseg.ao'}},
    {'name': 'Fundo Soberano de Angola', 'sector': 'estado', 'kind': 'publico',
     'source': {'label': 'Página oficial', 'url': 'https://www.fundosoberano.ao'}},
    {'name': 'Shoprite Angola', 'sector': 'comercio', 'kind': 'retalho',
     'source': {'label': 'Ver Angola, 2017: a Shoprite investe para quase duplicar a rede em Angola',
                'url': 'https://www.verangola.net/va/pt/042017/ComercioIndustria/7954/Sul-africanos-da-Shoprite-investem-mais-de--700-milhões-para-quase-duplicar-rede-em-Angola.htm'}},
    {'name': 'Kero', 'sector': 'comercio', 'kind': 'retalho',
     'source': {'label': 'Ver Angola, 2025: o Kero moderniza as suas 12 lojas',
                'url': 'https://www.verangola.net/va/pt/032025/Comercio/43781/Kero-vai-investir-830-milh%C3%B5es-de-kwanzas-na-moderniza%C3%A7%C3%A3o-das-suas-12-lojas.htm'}},
]
# Training outside degrees, with its source: banking schools and masters approved by decree.
TRAINING = [
    {'name': 'Instituto de Formação Bancária de Angola (IFBA)', 'kind': 'centro_formacao', 'province': 'Luanda',
     'summary': 'A escola da banca angolana, ligada à Associação Angolana de Bancos (ABANC): cursos para quem trabalha '
                'ou quer trabalhar num banco.',
     'source': {'label': 'Expansão: o IFBA reestrutura-se e lança cursos novos',
                'url': 'https://expansao.co.ao/angola/detalhe/instituto-de-formacao-bancaria-sofre-reestruturacao-e-lanca-novos-cursos--47954.html'}},
    {'name': 'Academia BAI', 'kind': 'centro_formacao', 'province': 'Luanda',
     'summary': 'A academia do Banco BAI. Com a ABANC, dá o programa Banking Routes: gestão comercial, de risco, '
                'estratégica e liderança na banca.',
     'source': {'label': 'Forbes África Lusófona: ABANC e Academia BAI ratificam o Banking Routes',
                'url': 'https://forbesafricalusofona.com/?p=70167'}},
]
MASTERS = [
    {'name': 'Mestrado em Contabilidade e Finanças', 'decree': 'Decreto Executivo n.º 414/17, de 13 de Setembro',
     'url': 'https://lex.ao/docs/ministerio-do-ensino-superior/2017/decreto-executivo-n-o-414-17-de-13-de-setembro/'},
    {'name': 'Mestrado em Contabilidade e Finanças', 'decree': 'Decreto Executivo n.º 509/17, de 3 de Outubro',
     'url': 'https://lex.ao/docs/ministerio-do-ensino-superior/2017/decreto-executivo-n-o-509-17-de-03-de-outubro/'},
]


def employers_in_job_ads(
    area: str = 'business',
    organisation: re.Pattern = _ORGANISATION,
    curated: re.Pattern = _CURATED,
    least: int = MIN_POSTINGS,
) -> list[dict]:
    """The organisations with most job ads in an area (not the recruitment agencies), each under one name."""
    with DATA.open(encoding='utf-8') as file:
        rows = [row for row in map(json.loads, file) if sector_area(row['sector']) == area and row['kind'] == 'vaga']
    names: dict[str, Counter] = {}
    for row in rows:
        name = _ARTICLE.sub('', row['company'] or '').strip()
        folded = fold(name)
        if not name or AGENCIES.search(folded) or UNNAMED.match(folded) or _TITLE.match(folded):
            continue
        if not organisation.search(folded) or curated.search(folded):
            continue
        names.setdefault(_company_key(name), Counter())[name] += 1
    found = [
        {'name': variants.most_common(1)[0][0].strip(' .'), 'postings': sum(variants.values())}
        for variants in names.values()
    ]
    return sorted((entry for entry in found if entry['postings'] >= least), key=lambda entry: -entry['postings'])


def sector_of(name: str) -> str:
    folded = fold(name)
    if re.search(r'banco|bank', folded):
        return 'banca'
    if 'segur' in folded:
        return 'seguros'
    if re.search(r'consult|audit|academia', folded):
        return 'consultoria'
    if re.search(r'refriango|castel|beverage|industri|alimentar', folded):
        return 'industria'
    return 'comercio'


def main() -> None:
    institutions, courses, yearbook = teaching('business')
    ads = employers_in_job_ads()
    data = {
        'area': 'business',
        'sources': {'education': {key: yearbook[key] for key in ('label', 'url')}, 'jobs': JOBS},
        'teaching': {'year': yearbook['year'], 'institutions': institutions, 'courses': courses},
        'training': TRAINING,
        'masters': MASTERS,
        'employers': {'named': NAMED_EMPLOYERS, 'jobAds': ads},
    }
    OUTPUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n', encoding='utf-8', newline='\n')
    named = {_company_key(employer['name']) for employer in NAMED_EMPLOYERS}
    app = {
        'year': yearbook['year'],
        'sources': data['sources'],
        'institutions': [
            {**institution, 'courses': [{key: course[key] for key in ('name', 'students', 'graduates')}
                                        for course in institution['courses']]}
            for institution in institutions
            if institution['province']
        ],
        'training': TRAINING,
        'employers': [{**employer, 'province': 'Luanda'} for employer in NAMED_EMPLOYERS] + [
            {'name': ad['name'], 'sector': sector_of(ad['name']), 'kind': 'anuncios', 'province': 'Luanda',
             'postings': ad['postings'], 'source': JOBS}
            for ad in ads
            if _company_key(ad['name']) not in named
        ],
    }
    APP_OUTPUT.write_text(json.dumps(app, ensure_ascii=False, indent=1) + '\n', encoding='utf-8', newline='\n')
    print(f"{len(institutions)} institutions, {len(courses)} courses, {len(NAMED_EMPLOYERS)} named employers, "
          f"{len(ads)} employers with {MIN_POSTINGS}+ job ads -> {OUTPUT}")


if __name__ == '__main__':
    main()
