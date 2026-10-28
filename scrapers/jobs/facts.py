"""The facts of a job post (kind, company, province, openings, salary). The post's text is read here and dropped."""

import re
import unicodedata


def fold(text: str) -> str:
    """Lowercase without accents: 'Huíla' and 'huila' are the same word."""
    return ''.join(c for c in unicodedata.normalize('NFD', text.lower()) if unicodedata.category(c) != 'Mn')


# The 21 provinces (2024 division), and towns that name one.
PROVINCES = [
    'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando', 'Cubango', 'Cuanza Norte', 'Cuanza Sul', 'Cunene',
    'Huambo', 'Huíla', 'Icolo e Bengo', 'Luanda', 'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico',
    'Moxico Leste', 'Namibe', 'Uíge', 'Zaire',
]
TOWNS = {
    'lubango': 'Huíla', 'lobito': 'Benguela', 'soyo': 'Zaire', 'soio': 'Zaire', 'luena': 'Moxico',
    'malange': 'Malanje', 'saurimo': 'Lunda Sul', 'dundo': 'Lunda Norte', 'mocamedes': 'Namibe',
    'menongue': 'Cubango', 'ondjiva': 'Cunene', 'talatona': 'Luanda', 'viana': 'Luanda', 'cacuaco': 'Luanda',
    'kilamba': 'Luanda', 'catete': 'Icolo e Bengo', 'cuanza-sul': 'Cuanza Sul', 'kwanza sul': 'Cuanza Sul',
    'kwanza norte': 'Cuanza Norte', 'uige': 'Uíge', 'bie': 'Bié', 'cuito': 'Bié', 'sumbe': 'Cuanza Sul',
}
_PLACES = sorted(
    [(fold(name), name) for name in PROVINCES] + list(TOWNS.items()), key=lambda pair: -len(pair[0])
)

NOT_JOBS = re.compile(
    r'dicas|noticia|curiosidade|bolsa|\bcursos?\b|curriculum|viage|empreendedor|guia|vida pratica|emigra|'
    r'angolanos em portugal|mercado de trabalho|uncategorized'
)
ROUNDUP = re.compile(
    r'vagas de emprego (em angola )?(hoje|do dia|da semana)|vagas (de emprego )?publicadas|^vagas do dia|'
    r'^confira \(?\d+\)? vagas|vagas para tecnicos de nivel medio e superior|'
    r'radar de oportunidades'
)
# News about jobs, not a job: 'Barragem prevê criar 5.500 empregos', 'Angola regista 920 mil vínculos'.
NEWS = re.compile(
    r'\b(cria|criar|criou|gera|gerar|regista|aumenta|preve|impulsion|investe|investimento|emprestimo|produz|'
    r'garante|avanca|reforcam|expectativa|vinculos|desemprego|taxa de|postos de trabalho|numeros)\b'
)
RECRUITING = re.compile(r'recrut|candidat|inscri|concurso|abre (vagas|recrutamento)|vagas abertas|esta a contratar')
JOB_WORDS = re.compile(r'vaga|recrut|contrat|admite|admissao|procura|concurso|estagi|candidatura|oportunidade|emprego')


def kind(title: str, categories: list[str]) -> str | None:
    """What the post is: a job, a public competition, an internship, open applications; None when not a job."""
    t, cats = fold(title), fold(' '.join(categories))
    if ROUNDUP.search(t) or 'vagas do dia' in cats or 'vagas da semana' in cats:
        return None  # a digest of posts the site also publishes one by one
    if NEWS.search(t) and not RECRUITING.search(t):
        return None
    if 'concurso' in t or 'concurso publico' in cats:
        return 'concurso'
    if 'estagi' in t:
        return 'estagio'
    if 'espontanea' in t:
        return 'espontanea'
    job_category = any(word in cats for word in ['emprego', 'vaga', 'estagio', 'concurso', 'luanda'])
    if not job_category and (NOT_JOBS.search(cats) or not JOB_WORDS.search(t)):
        return None
    if NOT_JOBS.search(t) and not JOB_WORDS.search(t):
        return None
    return 'vaga'


def openings(title: str) -> int | None:
    """'486 Vagas', '7.682 vagas' in the title."""
    match = re.search(r'(\d{1,3}(?:[.\s]\d{3})+|\d+)\s+vagas', fold(title))
    return int(re.sub(r'\D', '', match.group(1))) if match else None


_VERBS = r'(?:abre|abriu|esta a recrutar|recruta|contrata|admite|procura|tem vagas|lanca|anuncia|oferece|disponibiliza)'
# Words that end up where the employer should be: places and sectors.
_NOT_EMPLOYERS = {fold(name) for name in PROVINCES} | set(TOWNS) | {
    'angola', 'saude', 'educacao', 'petroleo', 'banca', 'governo', 'estado', 'sector publico', 'setor publico',
}
_GENERIC = re.compile(r'^(empresa|vaga|vagas|recrutamento|oportunidade|candidatura|concurso|emprego|estagio|varias)\b')


def _clean_company(name: str) -> str | None:
    name = re.sub(r'\s*[\(\[].*$', '', name)
    name = re.sub(r'\s+(em|para|no|na)\s+(angola|luanda)\b.*$', '', name, flags=re.I)
    name = re.sub(r'\s+(\d{4}|angola)$', '', name.strip(' -–|:,.!'), flags=re.I).strip(' -–|:,.!')
    folded = fold(name)
    if not name or len(name) > 60 or not name[0].isupper() or _GENERIC.match(folded) or folded in _NOT_EMPLOYERS:
        return None
    return name


def company(title: str) -> str | None:
    """The employer named in the title: 'Unitel abre recrutamento…', '…Técnico de Redes na Unitel'."""
    before_verb = re.match(rf'^(.+?)\s+{_VERBS}\b', fold(title))
    if before_verb:
        return _clean_company(title[: before_verb.end(1)])
    after = re.search(r'\s(?:na|no|da|do|pela|pelo|para a|para o)\s+([A-Z][^–\-|:(]+?)\s*(?:[–\-|:(]|$)', title)
    return _clean_company(after.group(1)) if after else None


def province(title: str, categories: list[str], text: str) -> str | None:
    """Where the job is: the categories first, then the title, then the start of the text."""
    for source in (' '.join(categories), title, text[:1500]):
        folded = f' {fold(source)} '
        for key, name in _PLACES:
            if re.search(rf'[^a-z]{re.escape(key)}[^a-z]', folded):
                return name
    return None


_SALARY = re.compile(
    r'(?:salario|remuneracao|vencimento)[^.]{0,80}?(\d{1,3}(?:[.\s]\d{3})+|\d{5,7})(?:,\d{2})?\s*(?:kz|kwanzas|aoa)'
)


def salary(text: str) -> int | None:
    """A monthly salary stated in Kz, when the post gives one (most do not)."""
    match = _SALARY.search(fold(text))
    if not match:
        return None
    amount = int(re.sub(r'\D', '', match.group(1)))
    return amount if 20_000 <= amount <= 10_000_000 else None


# The app's scale of education (apps/web/src/data/types.ts, EDUCATION_LEVELS), highest first.
LEVELS = [
    # Not "mestre": "mestre de obras" is a job.
    ('mestrado', r'mestrad|doutorad|doutoramento|pos.?gradua'),
    ('licenciatura', r'licenciad|licenciatura|bachar|bachel|ensino superior|formacao superior|curso superior|'
     r'nivel superior|universitari|graduad[oa] em'),
    ('medio_tecnico', r'tecnico.profissional|tecnic[oa] medi|medio tecnico|ensino medio|curso medio|formacao media|'
     r'nivel medio|\b13.{0,2} ?classe'),
    # "12.ª classe", "12ª classe" and "12 classe".
    ('ii_ciclo', r'\b12.{0,2} ?classe|ensino secundario|ii ciclo|segundo ciclo'),
    ('i_ciclo', r'\b9.{0,2} ?classe|(?<!i)i ciclo do ensino|primeiro ciclo'),
    ('primario', r'ensino primario|ensino de base|\b6.{0,2} ?classe|sem estudos|sem escolaridade|saber ler'),
]
_LEVELS = [(level, re.compile(pattern)) for level, pattern in LEVELS]
# Where a post lists what it asks for; the text before it describes the job.
_REQUIREMENTS = re.compile(r'requisitos|perfil|habilitac|qualificac|formacao academica|titulacao')
_FIELD = re.compile(
    r'(?:licenciatura|licenciad[oa]|bacharelato|mestrado|formacao(?: superior| academica| media| tecnica)?|'
    r'curso(?: superior| medio)?|tecnic[oa] medi[oa]|ensino medio)\s+(?:em|de|na area de|nas areas de|na area da)\s+'
    r'([a-z][^.;:!?()\n]{2,80})'
)


def education(text: str) -> tuple[str | None, str | None]:
    """The lowest education a post asks for ("12.ª classe; licenciatura é uma mais-valia" asks for the 12.ª) and
    the course it names first ("Licenciatura em Contabilidade ou Gestão" names Contabilidade)."""
    folded = fold(text)
    start = _REQUIREMENTS.search(folded)
    asked = folded[start.start() :] if start else folded
    found = [level for level, pattern in _LEVELS if pattern.search(asked)]
    field = _FIELD.search(asked)
    course = re.split(r'\s(?:ou|e|com|para|,)\s|,', field.group(1))[0].strip() if field else None
    return (found[-1] if found else None), course
