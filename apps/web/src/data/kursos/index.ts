import { TOPICS as ACCOUNTING_TOPICS } from './contabilidade/topics'
import { TOPICS as PROGRAMMING_TOPICS } from './programacao/topics'
import { topicUnits } from './topicCourse'
import type { AnnouncedCourse, Course, UnitContent } from './types'

// The Kursos catalogue: the courses written (test versions) and the ones announced as "Em breve".

// One topic = one unit with one short lesson (docs/decisoes/0025). A topic without its file yet shows as "Em breve".
const PROGRAMMING_FILES = import.meta.glob<{ default: UnitContent }>('./programacao/t[0-9][0-9].ts')
const ACCOUNTING_FILES = import.meta.glob<{ default: UnitContent }>('./contabilidade/t[0-9][0-9].ts')

const ENGLISH_A1: Course = {
  id: 'ingles-a1',
  title: 'Inglês A1',
  level: 'A1 (QECR)',
  lang: 'en',
  icon: 'globe',
  tone: 'blue',
  subtitle: 'O inglês básico, explicado como num livro: regra, exemplos, exercícios e chave.',
  audience:
    'Para quem está a começar ou nunca estudou inglês com método: estudantes, quem procura o primeiro emprego e quem quer ler documentação técnica.',
  goals: [
    'Apresentar-te e falar de outras pessoas com o verbo to be.',
    'Usar pronomes e possessivos sem confundir he/his, she/her.',
    'Fazer e responder a perguntas simples sobre ti, a tua família e o teu trabalho.',
    'Ler frases curtas do dia a dia e escrever as tuas.',
  ],
  units: [
    {
      id: 'u1',
      number: 1,
      title: 'O verbo to be',
      summary: 'I am, you are, she is: afirmativa, negativa e perguntas.',
      load: () => import('./english-a1/unit1').then((module) => module.default),
      lessons: [
        { id: 'l1', title: 'I am, you are, he is', estimatedMinutes: 15 },
        { id: 'l2', title: 'A negativa e as contrações', estimatedMinutes: 15 },
        { id: 'l3', title: 'Perguntas e respostas curtas', estimatedMinutes: 20 },
      ],
    },
    {
      id: 'u2',
      number: 2,
      title: 'Pronomes e possessivos',
      summary: 'me, him, her; my, your, his; mine, yours e o ’s.',
      load: () => import('./english-a1/unit2').then((module) => module.default),
      lessons: [
        { id: 'l1', title: 'Pronomes de complemento: me, him, us', estimatedMinutes: 15 },
        { id: 'l2', title: 'Possessivos: my, your, his, her', estimatedMinutes: 15 },
        { id: 'l3', title: 'mine, yours e o ’s do possessivo', estimatedMinutes: 20 },
      ],
    },
    { id: 'u3', number: 3, title: 'Artigos e plurais', summary: 'a, an, the; books, boxes, children.' },
    { id: 'u4', number: 4, title: 'Present simple', summary: 'I work, she works, do you work?' },
    { id: 'u5', number: 5, title: 'Rotina e horas', summary: 'What time is it? I get up at six.' },
    {
      id: 'u6',
      number: 6,
      title: 'There is / there are',
      summary: 'Descrever lugares: there is a bank near here.',
    },
    { id: 'u7', number: 7, title: 'Can', summary: 'Capacidades e pedidos: I can drive. Can you help me?' },
    { id: 'u8', number: 8, title: 'O passado de to be', summary: 'was, were: I was at school yesterday.' },
  ],
  loadExam: () => import('./english-a1/exam').then((module) => module.default),
  credits: [
    {
      title: 'English Grammar (Wikibooks)',
      author: 'Contribuidores do Wikibooks',
      license: 'CC BY-SA 4.0',
      url: 'https://en.wikibooks.org/wiki/English_Grammar',
      use: 'Ordem dos temas e formulação das regras do to be e dos pronomes, adaptadas e traduzidas.',
    },
    {
      title: 'An English Grammar (W. M. Baskervill e J. W. Sewell, 1896)',
      author: 'Project Gutenberg',
      license: 'Domínio público',
      url: 'https://www.gutenberg.org/ebooks/search/?query=Baskervill+Sewell',
      use: 'Classificação dos pronomes pessoais e possessivos.',
    },
    {
      title: 'Wiktionary',
      author: 'Contribuidores do Wiktionary',
      license: 'CC BY-SA 4.0',
      url: 'https://en.wiktionary.org/',
      use: 'Confirmação de significados e formas contraídas.',
    },
  ],
}

const PROJECT_MANAGEMENT: Course = {
  id: 'gestao-projetos',
  title: 'Fundamentos da Gestão de Projetos',
  level: 'Iniciante',
  lang: 'pt',
  icon: 'target',
  tone: 'gold',
  subtitle: 'Como levar uma ideia do papel ao fim: objetivo, plano, prazos, dinheiro e equipa.',
  audience:
    'Para quem vai organizar alguma coisa pela primeira vez (uma feira, um evento, um pequeno negócio) e para quem quer trabalhar em projetos numa empresa, ONG ou serviço público.',
  goals: [
    'Distinguir um projeto do trabalho do dia a dia e explicar o triângulo âmbito, prazo e custo.',
    'Conhecer as fases de um projeto, do início ao fecho.',
    'Escrever um objetivo SMART e identificar as partes interessadas.',
    'Preparar um termo de abertura simples para um projeto teu.',
  ],
  units: [
    {
      id: 'u1',
      number: 1,
      title: 'O que é um projeto',
      summary: 'Projeto e operação; âmbito, prazo e custo; o ciclo de vida.',
      load: () => import('./gestao-projetos/unit1').then((module) => module.default),
      lessons: [
        { id: 'l1', title: 'Projeto ou operação?', estimatedMinutes: 15 },
        { id: 'l2', title: 'O triângulo: âmbito, prazo e custo', estimatedMinutes: 15 },
        { id: 'l3', title: 'O ciclo de vida de um projeto', estimatedMinutes: 20 },
      ],
    },
    {
      id: 'u2',
      number: 2,
      title: 'Iniciar',
      summary: 'O objetivo SMART, as partes interessadas e o termo de abertura.',
      load: () => import('./gestao-projetos/unit2').then((module) => module.default),
      lessons: [
        { id: 'l1', title: 'O objetivo SMART', estimatedMinutes: 15 },
        { id: 'l2', title: 'As partes interessadas', estimatedMinutes: 20 },
        { id: 'l3', title: 'O termo de abertura', estimatedMinutes: 20 },
      ],
    },
    {
      id: 'u3',
      number: 3,
      title: 'Âmbito e EAP',
      summary: 'Dividir o trabalho em partes: a estrutura analítica do projeto (WBS).',
    },
    {
      id: 'u4',
      number: 4,
      title: 'Cronograma',
      summary: 'Dependências, gráfico de Gantt e caminho crítico.',
    },
    {
      id: 'u5',
      number: 5,
      title: 'Orçamento e riscos',
      summary: 'Estimar custos e preparar-se para o que pode correr mal.',
    },
    {
      id: 'u6',
      number: 6,
      title: 'Acompanhar e fechar',
      summary: 'Relatório de estado, entrega final e lições aprendidas.',
    },
  ],
  loadExam: () => import('./gestao-projetos/exam').then((module) => module.default),
  credits: [
    {
      title: 'Project Management, 2nd ed. (Adrienne Watt, BCcampus, 2014)',
      author: 'Adrienne Watt',
      license: 'CC BY 4.0',
      url: 'https://opentextbc.ca/projectmanagement/',
      use: 'Fonte principal: definição de projeto, tripla restrição, ciclo de vida, partes interessadas e termo de abertura, adaptados e traduzidos; os casos são nossos.',
    },
    {
      title: 'SMART criteria (Wikipedia)',
      author: 'Contribuidores da Wikipedia',
      license: 'CC BY-SA 4.0',
      url: 'https://en.wikipedia.org/wiki/SMART_criteria',
      use: 'Significado das letras SMART.',
    },
  ],
}

const CYBERSECURITY: Course = {
  id: 'ciberseguranca',
  title: 'Fundamentos da Cibersegurança',
  level: 'Iniciante',
  lang: 'pt',
  icon: 'shield',
  tone: 'night',
  subtitle: 'Proteger as tuas contas, o teu telemóvel e o teu dinheiro das burlas mais comuns.',
  audience:
    'Para quem usa o telemóvel para tudo (WhatsApp, banco, redes sociais, candidaturas) e quer evitar perder contas ou dinheiro; e para quem pensa numa carreira em cibersegurança. Só ensina a defender.',
  goals: [
    'Criar palavras-passe fortes e usar um gestor de palavras-passe.',
    'Ativar a verificação em dois passos e saber porque é que o código é só teu.',
    'Reconhecer phishing, falsos familiares e falsas ofertas de emprego e de bolsas.',
    'Saber o que fazer, e a quem recorrer, se caíres numa burla.',
  ],
  units: [
    {
      id: 'u1',
      number: 1,
      title: 'Palavras-passe e verificação em dois passos',
      summary: 'Frases-passe, gestor de palavras-passe, códigos por SMS e por app.',
      load: () => import('./ciberseguranca/unit1').then((module) => module.default),
      lessons: [
        { id: 'l1', title: 'Uma palavra-passe forte', estimatedMinutes: 15 },
        { id: 'l2', title: 'O gestor de palavras-passe', estimatedMinutes: 15 },
        { id: 'l3', title: 'A verificação em dois passos', estimatedMinutes: 20 },
      ],
    },
    {
      id: 'u2',
      number: 2,
      title: 'Burlas e phishing',
      summary: 'SMS e WhatsApp falsos, “olá mãe, mudei de número”, falsas ofertas; como verificar.',
      load: () => import('./ciberseguranca/unit2').then((module) => module.default),
      lessons: [
        { id: 'l1', title: 'O que é phishing e como o reconhecer', estimatedMinutes: 15 },
        { id: 'l2', title: '“Olá mãe, mudei de número” e os pedidos de código', estimatedMinutes: 20 },
        { id: 'l3', title: 'Falsas ofertas de emprego e de bolsas', estimatedMinutes: 20 },
      ],
    },
    {
      id: 'u3',
      number: 3,
      title: 'O telemóvel seguro',
      summary: 'Atualizações, apps só da loja oficial, permissões e bloqueio.',
    },
    { id: 'u4', number: 4, title: 'Redes e navegação', summary: 'Wi-Fi público, HTTPS e downloads.' },
    {
      id: 'u5',
      number: 5,
      title: 'Privacidade e redes sociais',
      summary: 'O que não publicar e a Lei n.º 22/11, de Proteção de Dados Pessoais.',
    },
    {
      id: 'u6',
      number: 6,
      title: 'Carreiras em cibersegurança',
      summary: 'As funções da área e as certificações mais conhecidas.',
    },
  ],
  loadExam: () => import('./ciberseguranca/exam').then((module) => module.default),
  credits: [
    {
      title: 'NIST SP 800-63B, Digital Identity Guidelines: Authentication and Authenticator Management',
      author: 'National Institute of Standards and Technology (EUA)',
      license: 'Domínio público nos EUA (obra do governo dos EUA, 17 U.S.C. §105)',
      url: 'https://pages.nist.gov/800-63-4/sp800-63b.html',
      use: 'Recomendações sobre palavras-passe (comprimento, sem trocas periódicas, listas de palavras-passe comuns, gestores) e as limitações do código por SMS. Só as recomendações, escritas de raiz em português.',
    },
    {
      title: 'Consumer Advice: phishing, falsos familiares e burlas de emprego',
      author: 'Federal Trade Commission (EUA)',
      license: 'Domínio público (obra do governo dos EUA, 17 U.S.C. §105)',
      url: 'https://consumer.ftc.gov/articles/how-recognize-and-avoid-phishing-scams',
      use: 'Sinais de alerta e formas de verificar nas lições sobre phishing, falsos familiares e ofertas de emprego, adaptados a Angola.',
    },
    {
      title: 'Phishing; Multi-factor authentication (Wikipedia)',
      author: 'Contribuidores da Wikipedia',
      license: 'CC BY-SA 4.0',
      url: 'https://en.wikipedia.org/wiki/Phishing',
      use: 'Origem do termo phishing e os três tipos de prova da verificação em dois passos.',
    },
  ],
}

const DIGITAL_MARKETING: Course = {
  id: 'marketing-digital',
  title: 'Fundamentos do Marketing Digital',
  level: 'Iniciante',
  lang: 'pt',
  icon: 'megaphone',
  tone: 'coral',
  subtitle: 'Perceber o cliente e mostrar bem o teu negócio no WhatsApp, Instagram e Facebook.',
  audience:
    'Para quem tem ou quer ter um pequeno negócio (salão, venda de roupa, explicações, comida) e para quem pensa trabalhar em marketing. Não promete ganhos: ensina o método.',
  goals: [
    'Explicar o que é marketing e distinguir necessidade de desejo.',
    'Escrever a proposta de valor de um negócio e decidir os 4 P.',
    'Montar um perfil de negócio com nome, foto, descrição, catálogo e horário.',
    'Responder aos clientes com método e sem promessas enganosas.',
  ],
  units: [
    {
      id: 'u1',
      number: 1,
      title: 'O que é marketing',
      summary: 'Cliente, necessidade, proposta de valor e os 4 P.',
      load: () => import('./marketing-digital/unit1').then((module) => module.default),
      lessons: [
        { id: 'l1', title: 'Marketing é mais do que publicidade', estimatedMinutes: 15 },
        { id: 'l2', title: 'A proposta de valor', estimatedMinutes: 15 },
        { id: 'l3', title: 'Os 4 P', estimatedMinutes: 20 },
      ],
    },
    {
      id: 'u2',
      number: 2,
      title: 'Presença digital',
      summary:
        'O perfil de negócio no WhatsApp, Instagram e Facebook: nome, foto, descrição, catálogo e horário.',
      load: () => import('./marketing-digital/unit2').then((module) => module.default),
      lessons: [
        { id: 'l1', title: 'O perfil de negócio', estimatedMinutes: 15 },
        { id: 'l2', title: 'A descrição e o catálogo', estimatedMinutes: 20 },
        { id: 'l3', title: 'Horário, respostas e confiança', estimatedMinutes: 15 },
      ],
    },
    {
      id: 'u3',
      number: 3,
      title: 'Conteúdo e calendário',
      summary: 'O que publicar, com que frequência e como planear o mês.',
    },
    {
      id: 'u4',
      number: 4,
      title: 'Anúncios pagos básicos',
      summary: 'Escolher o público, definir um orçamento em Kz e saber quando vale a pena.',
    },
    {
      id: 'u5',
      number: 5,
      title: 'Métricas',
      summary: 'Alcance, interações, cliques e vendas: o que medir.',
    },
    {
      id: 'u6',
      number: 6,
      title: 'Ética e lei',
      summary: 'Publicidade enganosa, dados dos clientes e a Lei n.º 22/11, de Proteção de Dados Pessoais.',
    },
  ],
  loadExam: () => import('./marketing-digital/exam').then((module) => module.default),
  credits: [
    {
      title: 'Marketing; Value proposition; Marketing mix (Wikipedia)',
      author: 'Contribuidores da Wikipedia',
      license: 'CC BY-SA 4.0',
      url: 'https://en.wikipedia.org/wiki/Marketing_mix',
      use: 'Fonte principal da unidade 1: definição de marketing, proposta de valor e os 4 P (McCarthy, 1960), adaptados e escritos de raiz em português.',
    },
    {
      title: 'Digital marketing; Social media marketing (Wikipedia)',
      author: 'Contribuidores da Wikipedia',
      license: 'CC BY-SA 4.0',
      url: 'https://en.wikipedia.org/wiki/Social_media_marketing',
      use: 'Conceitos de presença digital e perfis de negócio da unidade 2; as funções das plataformas são descritas de forma geral.',
    },
  ],
}

const PROGRAMMING: Course = {
  id: 'programacao',
  title: 'Programação: Nível Iniciante (Python)',
  level: 'Iniciante',
  lang: 'pt',
  icon: 'code',
  tone: 'blue',
  subtitle:
    'Os primeiros passos em programação com Python: ler código, prever o que faz e praticar num editor online.',
  audience:
    'Para quem nunca programou e quer perceber como funciona: estudantes, quem pensa em cursos de informática ou dados e quem quer automatizar tarefas. Basta um telemóvel com navegador.',
  goals: [
    'Escrever e ler programas curtos em Python com variáveis, tipos, operadores, texto e input.',
    'Decidir e repetir com if, for e while; guardar dados em listas e dicionários.',
    'Criar funções, ler e escrever ficheiros de texto e tratar erros com try/except.',
    'Ler um problema, depurar um erro e acabar 5 mini-projetos: média de notas, tabuada, caixa registadora em Kz, lista de contactos e jogo de adivinhar.',
  ],
  units: topicUnits('programacao', PROGRAMMING_TOPICS, PROGRAMMING_FILES),
  loadExam: () => import('./programacao/exam').then((module) => module.default()),
  credits: [
    {
      title: 'Python Programming (Wikibooks)',
      author: 'Contribuidores do Wikibooks',
      license: 'CC BY-SA 4.0',
      url: 'https://en.wikibooks.org/wiki/Python_Programming',
      use: 'Fonte principal, só como tema (variáveis, tipos, texto, decisões, ciclos, listas, dicionários, funções, ficheiros, erros e módulos): as lições e as perguntas são escritas de raiz em português, com variantes por parâmetros; os programas e os dados (nomes, valores em Kz) são nossos e inventados.',
    },
    {
      title: 'Algorithm; Python (programming language) (Wikipedia)',
      author: 'Contribuidores da Wikipedia',
      license: 'CC BY-SA 4.0',
      url: 'https://en.wikipedia.org/wiki/Algorithm',
      use: 'Origem do Python e dos termos técnicos (algoritmo, módulo, função), só como confirmação de significados.',
    },
  ],
}

const ACCOUNTING: Course = {
  id: 'contabilidade',
  title: 'Contabilidade: Nível Iniciante',
  level: 'Iniciante',
  lang: 'pt',
  icon: 'wallet',
  tone: 'success',
  subtitle: 'Registar, somar e perceber as contas de uma loja angolana, passo a passo e com exercícios.',
  audience:
    'Para quem tem ou quer ter um pequeno negócio, para quem vai trabalhar num escritório ou numa loja e para quem pensa em cursos de contabilidade, gestão ou economia. Basta saber somar e subtrair.',
  goals: [
    'Distinguir ativo, passivo e capital próprio e usar a equação fundamental.',
    'Fazer lançamentos a débito e a crédito no diário e verificar o balancete.',
    'Registar compras, vendas, IVA, existências, caixa, bancos, clientes, fornecedores e salários.',
    'Calcular amortizações e acréscimos e ler a demonstração de resultados e o balanço de uma loja.',
  ],
  units: topicUnits('contabilidade', ACCOUNTING_TOPICS, ACCOUNTING_FILES),
  loadExam: () => import('./contabilidade/exam').then((module) => module.default()),
  credits: [
    {
      title: 'Accounting; Double-entry bookkeeping; Balance sheet; Income statement (Wikipedia)',
      author: 'Contribuidores da Wikipedia',
      license: 'CC BY-SA 4.0',
      url: 'https://en.wikipedia.org/wiki/Double-entry_bookkeeping',
      use: 'Fonte principal, só como tema (equação fundamental, débito e crédito, razão, balancete, balanço, demonstração de resultados, amortização): as lições e as perguntas são escritas de raiz em português; as empresas, as pessoas e os valores em Kz são inventados.',
    },
    {
      title: 'Plano Geral de Contabilidade (Decreto n.º 82/01, de 16 de Novembro)',
      author: 'Governo de Angola',
      license: 'Texto oficial (diploma legal), consultado e não copiado',
      url: 'https://angolex.com/paginas/decreto-presidencial/plano-geral-de-contabilidade-angolano-82a-01a.html',
      use: 'Existência do plano e organização das contas em classes. Os nomes das classes e das contas usadas no Kurso estão por confirmar no texto em vigor no Diário da República.',
    },
    {
      title: 'Código do Imposto sobre o Valor Acrescentado (Lei n.º 7/19, republicado pela Lei n.º 14/23)',
      author: 'Assembleia Nacional de Angola',
      license: 'Texto oficial (diploma legal), consultado e não copiado',
      url: 'https://cms.law/pt/prt/publication/angola-alteracoes-ao-codigo-do-imposto-sobre-o-valor-acrescentado',
      use: 'Taxa geral de 14% (art. 19.º, n.º 1, alínea a), por confirmar no Diário da República). As outras taxas e os regimes especiais não são ensinados.',
    },
    {
      title:
        'Regime de contribuições para a Segurança Social (Decreto Presidencial n.º 227/18, de 27 de Setembro)',
      author: 'Presidente da República de Angola',
      license: 'Texto oficial (diploma legal), consultado e não copiado',
      url: 'https://lex.ao/docs/presidente-da-republica/2018/decreto-presidencial-n-o-227-18-de-27-de-setembro/',
      use: 'Taxas de 8% (entidade empregadora) e 3% (trabalhador) sobre a remuneração; artigos e base de incidência por confirmar no Diário da República.',
    },
  ],
}

const DATA_ANALYSIS: Course = {
  id: 'analise-dados',
  title: 'Fundamentos da Análise de Dados',
  level: 'Iniciante',
  lang: 'pt',
  icon: 'chart',
  tone: 'blue',
  subtitle: 'Organizar, limpar e resumir dados, com exemplos de turmas e cantinas fictícias.',
  audience:
    'Para quem trabalha ou vai trabalhar com listas, inquéritos e folhas de cálculo (escola, comércio, saúde, associações) e para quem pensa numa carreira em dados. Não precisas de saber programar.',
  goals: [
    'Distinguir dados de informação e organizar dados numa tabela arrumada.',
    'Reconhecer os tipos de variáveis e o que se pode calcular com cada um.',
    'Recolher dados com uma amostra sem viés.',
    'Limpar erros comuns, duplicados e formatos de data e de Kz.',
  ],
  units: [
    {
      id: 'u1',
      number: 1,
      title: 'O que são dados',
      summary: 'Dados e informação, a tabela (linha = registo, coluna = variável) e os tipos de variáveis.',
      load: () => import('./analise-dados/unit1').then((module) => module.default),
      lessons: [
        { id: 'l1', title: 'Dados e informação', estimatedMinutes: 15 },
        { id: 'l2', title: 'A tabela: linhas e colunas', estimatedMinutes: 15 },
        { id: 'l3', title: 'Tipos de variáveis', estimatedMinutes: 20 },
      ],
    },
    {
      id: 'u2',
      number: 2,
      title: 'Recolher e limpar',
      summary: 'Amostras sem viés, erros comuns, duplicados e formatos de data e de Kz.',
      load: () => import('./analise-dados/unit2').then((module) => module.default),
      lessons: [
        { id: 'l1', title: 'Recolher bem', estimatedMinutes: 15 },
        { id: 'l2', title: 'Erros comuns e duplicados', estimatedMinutes: 20 },
        { id: 'l3', title: 'Formatos de data e de Kz', estimatedMinutes: 20 },
      ],
    },
    { id: 'u3', number: 3, title: 'Resumir', summary: 'Contagem, percentagem, média, mediana e moda.' },
    { id: 'u4', number: 4, title: 'Gráficos', summary: 'Qual escolher e quando.' },
    {
      id: 'u5',
      number: 5,
      title: 'Folha de cálculo',
      summary: 'SOMA, MÉDIA, CONTAR.SE, filtros e tabela dinâmica, com os nomes em pt-PT e em inglês.',
    },
    {
      id: 'u6',
      number: 6,
      title: 'Contar uma história com dados',
      summary: 'Da tabela à conclusão que outros percebem.',
    },
  ],
  loadExam: () => import('./analise-dados/exam').then((module) => module.default),
  credits: [
    {
      title: 'OpenIntro Statistics, 4th ed. (Diez, Çetinkaya-Rundel e Barr)',
      author: 'OpenIntro',
      license: 'CC BY-SA 3.0',
      url: 'https://www.openintro.org/book/os/',
      use: 'Fonte principal: observações, variáveis, matriz de dados, tipos de variáveis (secção 1.2), população, amostra e viés (secção 1.3), adaptados e escritos de raiz em português.',
    },
    {
      title: 'Data cleansing; Sampling bias; ISO 8601 (Wikipedia)',
      author: 'Contribuidores da Wikipedia',
      license: 'CC BY-SA 4.0',
      url: 'https://en.wikipedia.org/wiki/Data_cleansing',
      use: 'Erros comuns na limpeza de dados, viés de amostragem e o formato de data ano-mês-dia.',
    },
  ],
}

export const KURSOS: Course[] = [
  ENGLISH_A1,
  PROJECT_MANAGEMENT,
  CYBERSECURITY,
  DIGITAL_MARKETING,
  PROGRAMMING,
  ACCOUNTING,
  DATA_ANALYSIS,
]

/** Next in line, one at a time (docs/roadmap.md). */
export const ANNOUNCED: AnnouncedCourse[] = [
  {
    id: 'economia',
    title: 'Economia',
    body: 'Oferta, procura, preços e inflação, com exemplos do mercado angolano.',
    icon: 'chart',
  },
]

/** What CompletedPage offers next: the following written course, else the first announced. */
export function nextCourse(id: string): Course | AnnouncedCourse | undefined {
  const at = KURSOS.findIndex((course) => course.id === id)
  return (at >= 0 ? KURSOS[at + 1] : undefined) ?? ANNOUNCED[0]
}

export function findCourse(id: string | undefined): Course | undefined {
  return KURSOS.find((course) => course.id === id)
}

/** "Concluir e seguir" walks this list: every written lesson, then each unit's review. */
export type Step = { unit: string; lesson: string }
export const REVIEW = 'revisao'

export function courseSteps(course: Course): Step[] {
  return course.units.flatMap((unit) =>
    unit.load
      ? (unit.lessons ?? [])
          .map((lesson): Step => ({ unit: unit.id, lesson: lesson.id }))
          .concat({ unit: unit.id, lesson: REVIEW })
      : [],
  )
}

export const stepKey = (step: Step) => `${step.unit}/${step.lesson}`
