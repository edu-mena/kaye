"""The sector of a job post, and the Kayé career when it is a tech one, from its title."""

import re

from .facts import fold

# First match wins, so the specific sectors come before the broad ones.
SECTORS: list[tuple[str, str]] = [
    ('technology', r'informatic|programador|desenvolvedor|developer|software|sistemas de informacao|\bti\b|\bit\b|'
     r'redes(?! sociais)|dados|data |cibersegur|helpdesk|help desk|suporte tecnico|devops|full.?stack|front.?end|back.?end|'
     r'\berp\b|odoo|sap\b|web|ui/ux|ux/ui|base de dados|cloud|tecnologias de informacao'),
    ('telecom', r'telecomunica|fibra optica|radiofrequencia|\brf\b'),
    ('oil_mining', r'petrol|offshore|\bgas\b|\bminas?\b|minera|mineir|diamant|geolog|sonangol|endiama|catoca|perfura'),
    ('health', r'enfermeir|medic|farmac|saude|clinic|hospital|laboratori|analises clinicas|nutricion|fisioterap|'
     r'dentist|parteir|radiolog'),
    ('education', r'professor|docente|formador|educador|explicador|pedagog|ensino|escola'),
    ('finance', r'contabil|financ|auditor|banco|bancari|tesour|fiscal|credito|seguros|actuari|economista|'
     r'controller'),
    ('engineering', r'engenheir|electrotecn|eletrotecn|electricista|eletricista|mecanic|manutencao|tecnico de frio|'
     r'soldador|soldadur|torneiro|\btorno\b|instrumentista|instrumentac|electricidade|eletricidade|caldeireir|'
     r'hse|qhse|seguranca no trabalho|ambiental'),
    ('construction', r'construcao|obra|pedreiro|carpinteir|serralheir|canalizador|pintor|armador|encarregado|'
     r'topograf|arquitect|arquitet|desenhador|orcamentist|alvenaria|ceramic|ladrilh|estucador|tubulac'),
    ('logistics', r'motorista|logistic|armazem|fiel de|estafeta|transport|condutor|operador de maquina|'
     r'empilhador|aviacao|bordo|aeroport|maritim|portuari|despachante|aduaneir|compras|procurement|'
     r'marinheir|capitao|tripulante|navio|estiva|motoboy'),
    ('hospitality', r'cozinh|chef|empregad[oa] de mesa|hotel|restaura|barman|bartender|camareir|pasteleir|padeiro|'
     r'turismo|rececionista de hotel'),
    ('sales', r'vendedor|comercial|vendas|promotor|atendimento|call center|televend|loja|retalho|merchandis|'
     r'operador de caixa|consultor de vendas|key account'),
    ('marketing', r'marketing|redes sociais|design|comunicacao|jornalis|social media|conteudo|fotograf|video|publicidade|'
     r'relacoes publicas'),
    ('legal', r'jurist|advogad|juridic|direito|notari|compliance'),
    ('security', r'seguranca|vigilante|agente|policia|bombeir|guarda|proteccao civil|militar|forcas armadas'),
    ('agriculture', r'agronom|agricult|agro|pecuari|veterinar|florest|pesca|zootecn|jardin'),
    ('administration', r'administrativ|secretari|recepcionista|rececionista|assistente|recursos humanos|\brh\b|'
     r'gestor|gerente|director|diretor|coordenador|supervisor|chefe|tecnico superior|tecnico medio|auxiliar|'
     r'limpeza|servicos gerais|protocolo|arquivista|estagiario'),
]
_SECTORS = [(sector, re.compile(pattern)) for sector, pattern in SECTORS]

# Kayé's tech careers and the words job titles use for them; the longer, more specific ones first.
CAREERS: dict[str, list[str]] = {
    'gestor-de-marketing-digital': ['marketing digital', 'social media', 'gestor de redes sociais', 'seo'],
    'desenvolvedor-full-stack': ['full stack', 'full-stack', 'fullstack'],
    'desenvolvedor-frontend': ['frontend', 'front-end', 'front end', 'react', 'angular'],
    'desenvolvedor-backend': ['backend', 'back-end', 'back end', 'php', 'java', '.net', 'node', 'python'],
    'desenvolvedor-mobile': ['mobile', 'android', 'ios', 'flutter'],
    'engenheiro-de-qa': ['qa', 'testes de software', 'tester', 'quality assurance'],
    'cientista-de-dados': ['cientista de dados', 'data scientist', 'machine learning', 'inteligencia artificial'],
    'engenheiro-de-dados': ['engenheiro de dados', 'data engineer'],
    'analista-de-bi': ['business intelligence', ' bi ', 'power bi', 'analista bi'],
    'analista-de-dados': ['analista de dados', 'data analyst', 'analise de dados', 'estatistic'],
    'administrador-de-base-de-dados': ['base de dados', 'dba', 'database', 'oracle', 'sql server'],
    'engenheiro-devops': ['devops', 'cloud', 'azure', 'aws', 'sre'],
    'analista-de-ciberseguranca': ['ciberseguranca', 'seguranca informatica', 'seguranca da informacao', 'cyber', 'soc'],
    'administrador-de-redes': ['redes', 'network', 'cisco'],
    'administrador-de-sistemas': ['administrador de sistemas', 'sysadmin', 'linux', 'windows server', 'infraestrutura'],
    'tecnico-de-hardware': ['hardware', 'manutencao informatica', 'manutencao de computadores'],
    'tecnico-de-suporte': ['suporte', 'helpdesk', 'help desk', 'service desk', 'tecnico de informatica', 'informatica'],
    'engenheiro-de-telecomunicacoes': ['engenheiro de telecomunicacoes', 'engenheiro rf', 'engenheiro de rf'],
    'tecnico-de-telecomunicacoes': ['telecomunicacoes', 'fibra optica', 'tecnico rf'],
    'designer-ui-ux': ['ui/ux', 'ux/ui', 'ux designer', 'ui designer', 'product designer'],
    'designer-grafico': ['designer grafico', 'design grafico', 'multimedia', 'motion'],
    'analista-de-sistemas': ['analista de sistemas', 'analista funcional', 'analista de negocio', 'erp', 'odoo', 'sap'],
    'gestor-de-projetos-de-ti': ['gestor de projetos de ti', 'gestor de projectos de ti', 'project manager', 'scrum'],
    'product-manager': ['product manager', 'product owner', 'gestor de produto'],
    'gestor-de-ti': ['gestor de ti', 'director de ti', 'diretor de ti', 'responsavel de ti', 'chefe de informatica'],
    'comercial-de-ti': ['comercial de ti', 'vendas de software', 'account manager ti'],
    'formador-de-tic': ['formador de informatica', 'formador de tic', 'professor de informatica'],
}
# Whole words only: 'sap' must not match 'sapateiro'.
_CAREERS = [
    (slug, re.compile('|'.join(rf'(?<![a-z0-9]){re.escape(fold(alias).strip())}(?![a-z0-9])' for alias in aliases)))
    for slug, aliases in CAREERS.items()
]
# Careers are looked for only in these sectors: 'Gestor de Redes Sociais' is not a network admin.
CAREER_SECTORS = {'technology', 'telecom', 'marketing'}


def sector(title: str) -> str:
    folded = fold(title)
    for name, pattern in _SECTORS:
        if pattern.search(folded):
            return name
    return 'other'


def career(title: str, in_sector: str) -> str | None:
    """The Kayé career a tech job title names, when it names one."""
    if in_sector not in CAREER_SECTORS:
        return None
    folded = fold(title)
    for slug, pattern in _CAREERS:
        if pattern.search(folded):
            return slug
    return None

# The big employers and their sector, for posts that name the employer but not the job
# ("BFA tem 2 novas oportunidades").
EMPLOYERS: dict[str, str] = {
    'sonangol': 'oil_mining', 'halliburton': 'oil_mining', 'totalenergies': 'oil_mining', 'chevron': 'oil_mining',
    'azule': 'oil_mining', 'eni': 'oil_mining', 'schlumberger': 'oil_mining', 'slb': 'oil_mining',
    'pumangol': 'oil_mining', 'endiama': 'oil_mining', 'catoca': 'oil_mining', 'baker hughes': 'oil_mining',
    'saipem': 'oil_mining', 'ponticelli': 'oil_mining', 'angoil': 'oil_mining', 'subsea7': 'oil_mining',
    'technip': 'oil_mining', 'oceaneering': 'oil_mining', 'weatherford': 'oil_mining', 'somoil': 'oil_mining',
    'acrep': 'oil_mining', 'exxonmobil': 'oil_mining', 'esso': 'oil_mining', 'sonils': 'oil_mining',
    'biocom': 'agriculture', 'aldeia nova': 'agriculture', 'novagest': 'agriculture',
    'bfa': 'finance', 'bai': 'finance', 'bic': 'finance', 'bpc': 'finance', 'atlantico': 'finance',
    'standard bank': 'finance', 'banco sol': 'finance', 'keve': 'finance', 'bni': 'finance', 'caixa angola': 'finance',
    'unitel': 'telecom', 'africell': 'telecom', 'movicel': 'telecom', 'angola telecom': 'telecom', 'multitel': 'telecom',
    'paratus': 'telecom', 'tv cabo': 'telecom', 'zap': 'telecom', 'angola cables': 'telecom',
    'omatapalo': 'construction', 'mota-engil': 'construction', 'griner': 'construction', 'carmon': 'construction',
    'teixeira duarte': 'construction', 'casais': 'construction', 'taag': 'logistics', 'sonair': 'logistics',
    'refriango': 'sales', 'castel': 'sales', 'shoprite': 'sales', 'kero': 'sales', 'candando': 'sales',
    'kibabo': 'sales', 'nosso super': 'sales', 'minsa': 'health', 'mininterior': 'security', 'minint': 'security',
    'ministerio da educacao': 'education', 'med': 'education',
}
_EMPLOYERS = [(re.compile(rf'(?<![a-z]){re.escape(name)}(?![a-z])'), sector) for name, sector in EMPLOYERS.items()]


def employer_sector(text: str) -> str | None:
    """The sector of a big employer named in a title or as the employer."""
    folded = fold(text)
    return next((sector for pattern, sector in _EMPLOYERS if pattern.search(folded)), None)
