import type { Academy, AcademyOffer, CareerGroup } from '../types'
import { CAREER_SUMMARIES } from './careers'

// Centres that teach or examine international certifications in Angola, each with what its source confirms. The bodies
// behind each certificate keep the official lists: an approval not stated in a source is not claimed here.

const offer = (
  name: string,
  careers: string[],
  level: AcademyOffer['level'] = 'certificacao',
): AcademyOffer => ({
  course: {
    id: name
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),
    name,
  },
  name,
  level,
  careers,
  areas: [
    ...new Set(
      CAREER_SUMMARIES.filter((career) => careers.includes(career.slug)).map(
        (career): CareerGroup => career.group,
      ),
    ),
  ],
})

const NETWORKS = [
  'administrador-de-redes',
  'tecnico-de-suporte',
  'analista-de-ciberseguranca',
  'tecnico-de-telecomunicacoes',
]
const OFFSHORE = [
  'tecnico-de-manutencao-mecanica',
  'mecanico-de-sonda',
  'rigger-e-operador-de-grua',
  'tecnico-de-instrumentacao',
  'operador-de-producao-petrolifera',
]

export const CERTIFICATION_CENTRES: Academy[] = [
  {
    id: 'academia-cisco-tocoista',
    name: 'Academia Cisco Tocoísta',
    type: 'centro_formacao',
    ownership: 'privada',
    province: 'Luanda',
    place: 'Instituto Superior Politécnico Tocoísta, Luanda',
    summary:
      'Inaugurada em Outubro de 2026, com três salas e cursos de tecnologia com ênfase nas certificações Cisco. As mensalidades anunciadas vão de 25 mil a 40 mil Kz.',
    offers: [offer('Certificações Cisco', NETWORKS)],
    sources: [
      {
        label: 'Ver Angola: abertura da Academia Cisco Tocoísta (Outubro de 2026)',
        url: 'https://www.verangola.net/va/en/102026/Technology/50493/Academy-dedicated-to-technological-training-opens-its-doors-with-courses-starting-at-25000-kwanzas.htm',
      },
    ],
  },
  {
    id: 'treinp',
    name: 'Treinp',
    type: 'centro_formacao',
    ownership: 'privada',
    province: 'Luanda',
    place: 'Angola',
    summary:
      'Parceira de formação da PeopleCert, que dá o ITIL. Anuncia aulas presenciais ou online e um centro de exames de certificação internacional. A morada não vem na fonte.',
    offers: [
      offer('ITIL (gestão de serviços de tecnologia)', [
        'tecnico-de-suporte',
        'administrador-de-sistemas',
        'gestor-de-ti',
        'gestor-de-projetos-de-ti',
      ]),
    ],
    sources: [
      {
        label: 'PeopleCert: Treinp',
        url: 'https://www.peoplecert.org/ways-to-get-certified/ato/treinp-2629412',
      },
    ],
  },
  {
    id: 'operatec-omitc',
    name: 'Operatec OMITC',
    type: 'centro_formacao',
    ownership: 'privada',
    province: 'Luanda',
    place: 'Sequele (Luanda) e Cabinda',
    summary:
      'Centro de formação marítima e industrial, com formação técnica e de segurança para o petróleo e gás. Numa entrevista, o director disse que iria alargar os cursos OPITO depois de fechar as certificações: confirma com o centro quais estão aprovados.',
    offers: [
      offer('Segurança e formação técnica para petróleo e gás', [
        ...OFFSHORE,
        'tecnico-de-seguranca-no-trabalho',
      ]),
    ],
    sources: [
      {
        label: 'The Energy Year: entrevista à Operatec',
        url: 'https://theenergyyear.com/articles/subsea-services-for-angolas-oil-and-gas-sector/',
      },
    ],
  },
  {
    id: 'resilience-qhse',
    name: 'Resilience QHSE',
    type: 'centro_formacao',
    ownership: 'privada',
    province: 'Luanda',
    place: 'Luanda',
    summary:
      'Diz ser um de apenas três centros em Angola aprovados para dar cursos STCW, de segurança básica para quem trabalha no mar.',
    offers: [
      offer('STCW: segurança básica no mar', [
        ...OFFSHORE,
        'tecnico-de-seguranca-no-trabalho',
        'oficial-da-marinha-mercante',
      ]),
    ],
    sources: [
      {
        label: 'STCW Direct: Resilience QHSE',
        url: 'https://www.stcwdirect.com/schools/169/resilience-qhse/',
      },
    ],
  },
  {
    id: 'itgest-formacao',
    name: 'ITGest (centro de formação)',
    type: 'centro_formacao',
    ownership: 'privada',
    province: 'Luanda',
    place: 'Luanda',
    summary:
      'Centro de formação aberto em 2024, com acções certificadas por entidades como a SAP e o INEFOP.',
    offers: [
      offer('Formação SAP', [
        'analista-de-sistemas',
        'contabilista',
        'analista-financeiro',
        'tecnico-de-compras',
      ]),
    ],
    sources: [
      {
        label: 'Forbes África Lusófona: centro da ITGest (2024)',
        url: 'https://forbesafricalusofona.com/?p=102472',
      },
    ],
  },
  {
    id: 'pwc-academy-angola',
    name: 'PwC Academy Angola',
    type: 'centro_formacao',
    ownership: 'privada',
    province: 'Luanda',
    place: 'Luanda',
    website: 'https://www.pwc.com/ao/pt/formacao/sobre-nos.html',
    summary:
      'A academia da PwC em Angola tem formação em contabilidade e finanças. Quando consultámos, não listava datas de cursos.',
    offers: [
      offer('Contabilidade e Finanças', [
        'contabilista',
        'auditor',
        'auditor-interno',
        'analista-financeiro',
        'tecnico-de-impostos',
      ]),
      offer(
        'Curso Executivo de Procurement',
        ['tecnico-de-contratacao-publica', 'gestor-de-logistica'],
        'formacao_profissional',
      ),
    ],
    sources: [
      {
        label: 'PwC Angola: Accounting and Finance',
        url: 'https://www.pwc.com/ao/en/pwc-academy/portfolios/accounting-and-finance.html',
      },
      {
        label:
          'PwC Angola: Curso Executivo de Procurement (8 horas, 680 000 Kz mais IVA, datas por anunciar)',
        url: 'https://www.pwc.com/ao/pt/formacao/portefolios/contabilidade-e-financas/curso-executivo-procurement-luanda.html',
      },
    ],
  },
  {
    id: 'centro-de-formacao-maritima-de-angola',
    name: 'Centro de Formação Marítima de Angola (CFMA)',
    type: 'centro_formacao',
    ownership: null,
    province: 'Cuanza Sul',
    place: 'Perto do Sumbe, Cuanza Sul',
    summary:
      'Criado pela Sonangol e pela sueca Stena e inaugurado em 2014, com ensino marítimo e certificação para até 200 alunos por ano. Confirma se os cursos continuam a abrir.',
    offers: [offer('Formação marítima e certificação STCW', ['oficial-da-marinha-mercante'])],
    sources: [
      {
        label: 'The Maritime Executive: abertura do CFMA (2014)',
        url: 'https://maritime-executive.com/corporate/New-Maritime-Training-Facility-Launched-in-Angola-2014-08-29',
      },
    ],
  },
  {
    id: 'inamet-certificacao',
    name: 'Instituto Nacional de Meteorologia e Geofísica (INAMET)',
    type: 'centro_formacao',
    ownership: 'publica',
    province: 'Luanda',
    place: 'Luanda',
    summary:
      'Certifica a competência técnica e profissional do seu pessoal depois de formação especializada, sobretudo em meteorologia aeronáutica.',
    offers: [offer('Certificação em meteorologia aeronáutica', ['meteorologista'])],
    sources: [
      {
        label: 'Decreto Presidencial n.º 230/14 (Lex.AO)',
        url: 'https://lex.ao/docs/presidente-da-republica/2014/decreto-presidencial-n-o-230-14-de-04-de-setembro/',
      },
    ],
  },
  {
    id: 'centro-de-formacao-de-jornalistas-cefojor',
    name: 'Centro de Formação de Jornalistas (CEFOJOR)',
    type: 'centro_formacao',
    ownership: 'publica',
    province: 'Luanda',
    place: 'Luanda',
    summary:
      'O centro de formação de jornalistas do Estado, desde 2002, com mais de 50 cursos curtos de jornalismo.',
    offers: [offer('Cursos de jornalismo', ['jornalista', 'editor-de-video'], 'formacao_profissional')],
    sources: [],
  },
  {
    id: 'instituto-superior-de-artes',
    name: 'Instituto Superior de Artes',
    type: 'instituto_superior',
    ownership: 'publica',
    province: 'Luanda',
    place: 'Luanda',
    summary:
      'Instituição pública de ensino superior das artes, com licenciaturas criadas em 2017. Confirma quais os cursos que abrem em cada ano.',
    offers: [
      offer('Artes Visuais', ['artista-plastico', 'gestor-cultural'], 'licenciatura'),
      offer('Música com Opção em Canto Lírico', ['musico', 'gestor-cultural'], 'licenciatura'),
      offer('Design de Moda', ['designer-de-moda'], 'licenciatura'),
      offer('Teatro', ['actor', 'gestor-cultural'], 'licenciatura'),
    ],
    sources: [
      {
        label: 'Decreto Executivo n.º 584/17 (Lex.AO)',
        url: 'https://lex.ao/docs/ministerio-do-ensino-superior/2017/decreto-executivo-n-o-584-17-de-04-de-outubro/',
      },
    ],
  },
  {
    id: 'complexo-das-escolas-de-artes-cearte',
    name: 'Complexo das Escolas de Artes (CEARTE)',
    type: 'centro_formacao',
    ownership: 'publica',
    province: 'Luanda',
    place: 'Camama, Luanda',
    summary:
      'Criado em 2015, com cerca de 23 cursos em teatro, artes visuais, música, cinema e dança e mais de 1000 alunos. Diz ter levado mais de 300 artistas ao mercado de trabalho.',
    offers: [
      offer('Formação em Teatro', ['actor'], 'medio_tecnico'),
      offer('Formação em Artes Visuais', ['artista-plastico'], 'medio_tecnico'),
      offer('Formação em Música', ['musico'], 'medio_tecnico'),
      offer('Formação em Cinema', ['realizador', 'editor-de-video'], 'medio_tecnico'),
    ],
    sources: [
      {
        label: 'Ver Angola: uma década do CEARTE (2025)',
        url: 'https://www.verangola.net/va/pt/012025/Cultura/42854/Numa-d%C3%A9cada-CEARTE-introduziu-mais-de-300-artistas-no-mercado-de-trabalho.htm',
      },
    ],
  },
  {
    id: 'alianca-francesa-de-luanda',
    name: 'Aliança Francesa de Luanda',
    type: 'centro_formacao',
    ownership: 'privada',
    province: 'Luanda',
    place: 'Luanda',
    summary:
      'Ensina francês, português e quimbundo. Em 2025 teve mais de 1900 alunos e 220 candidatos aos exames DELF e DALF. Há também Alianças em Cabinda e no Lubango.',
    offers: [offer('Francês e exames DELF e DALF', ['tradutor', 'interprete', 'diplomata'])],
    sources: [
      {
        label: 'Governo francês: director da Aliança Francesa de Luanda',
        url: 'https://choisirleservicepublic.gouv.fr/offre-emploi/directeur-d-alliance-francaise---fh---alliance-francaise-de-luanda---angola-reference-MAE_50599ff6-5000-402e-91c5-e91a9b697aed/',
      },
    ],
  },
  {
    id: 'instituto-confucio-uan',
    name: 'Instituto Confúcio da Universidade Agostinho Neto',
    type: 'centro_formacao',
    ownership: 'publica',
    province: 'Luanda',
    place: 'Universidade Agostinho Neto, Luanda',
    summary:
      'O primeiro Instituto Confúcio de Angola, com cursos de mandarim. Não confirmámos se faz os exames HSK.',
    offers: [offer('Curso de Mandarim', ['tradutor', 'interprete'], 'formacao_profissional')],
    sources: [
      {
        label: 'China Daily: jovens angolanos a estudar chinês (2024)',
        url: 'https://global.chinadaily.com.cn/a/202403/23/WS65fe384ba31082fc043be43a.html',
      },
    ],
  },
  {
    id: 'escola-de-moda-beatriz-franck',
    name: 'Escola de Moda Beatriz Franck',
    type: 'centro_formacao',
    ownership: 'privada',
    province: 'Luanda',
    place: 'Luanda',
    summary:
      'Escola de moda na sede da marca Beatriz Franck, aberta em 2021. A fonte não indica os cursos: confirma com a marca.',
    offers: [offer('Formação em Moda', ['designer-de-moda'], 'formacao_profissional')],
    sources: [
      {
        label: 'Ver Angola: nova sede da Beatriz Franck (2021)',
        url: 'https://www.verangola.net/va/pt/102021/Lazer/27749/BEATRIZFRANCK-soma-e-segue-na-ind%C3%BAstria-da-moda-e-inaugura-novo-edif%C3%ADcio-sede-em-Luanda.htm',
      },
    ],
  },
  {
    id: 'escola-de-hotelaria-e-turismo-de-cabinda',
    name: 'Escola de Hotelaria e Turismo de Cabinda',
    type: 'centro_formacao',
    ownership: 'publica',
    province: 'Cabinda',
    place: 'Liambo, Cabinda',
    summary:
      'Inaugurada em Novembro de 2025, para até 240 alunos por ciclo, com cozinha, pastelaria, restaurante e bar, andares e recepção. Certificada pelo Turismo de Portugal e licenciada pelo INEFOP.',
    offers: [
      offer('Cozinha e Pastelaria', ['chefe-de-cozinha'], 'formacao_profissional'),
      offer('Restaurante e Bar', ['gestor-de-restauracao'], 'formacao_profissional'),
      offer('Recepção de Hotel', ['recepcionista-de-hotel', 'gestor-hoteleiro'], 'formacao_profissional'),
    ],
    sources: [
      {
        label: 'Ver Angola: escola de hotelaria de Cabinda (2025)',
        url: 'https://www.verangola.net/va/pt/112025/Turismo/46575/Ministro-do-Turismo-inaugura-escola-de-hotelaria-e-turismo-em-Cabinda.htm',
      },
    ],
  },
  {
    id: 'escola-de-hotelaria-e-restauracao-de-talatona',
    name: 'Escola de Hotelaria e Restauração de Talatona',
    type: 'centro_formacao',
    ownership: null,
    province: 'Luanda',
    place: 'Talatona, Luanda',
    summary:
      'Escola técnico-profissional de hotelaria, criada em 2011. A fonte é de 2015: confirma os cursos e se continua a funcionar.',
    offers: [
      offer(
        'Formação em Hotelaria e Restauração',
        ['chefe-de-cozinha', 'recepcionista-de-hotel', 'gestor-de-restauracao'],
        'formacao_profissional',
      ),
    ],
    sources: [
      {
        label: 'Ver Angola: fórum da escola de Talatona (2015)',
        url: 'https://www.verangola.net/va/pt/082015/Turismo/2017/Escola-de-Hotelaria-e-Restaura%C3%A7%C3%A3o-de-Talatona-organiza-1%C2%BA-F%C3%B3rum-Internacional-de-Turismo.htm',
      },
    ],
  },
  {
    id: 'escola-nacional-de-administracao-e-politicas-publicas-enapp',
    name: 'Escola Nacional de Administração e Políticas Públicas (ENAPP)',
    type: 'centro_formacao',
    ownership: 'publica',
    province: 'Luanda',
    place: 'Talatona, Luanda',
    website: 'https://enapp.gov.ao',
    summary:
      'Forma quem trabalha na administração pública, com cursos curtos e pós-graduações, e conduz os concursos da Entidade Recrutadora Única. A Pós-Graduação em Contratação Pública tem 240 horas. Tem um centro regional no Lubango.',
    offers: [
      offer('Pós-Graduação em Contratação Pública', ['tecnico-de-contratacao-publica'], 'especialidade'),
      offer(
        'Cursos de Administração Pública',
        ['tecnico-superior-de-administracao-publica'],
        'formacao_profissional',
      ),
    ],
    sources: [
      {
        label: 'allAfrica: pós-graduação em Contratação Pública (Junho de 2026)',
        url: 'https://allafrica.com/stories/202606160224.html',
      },
    ],
  },
  {
    id: 'instituto-de-formacao-da-administracao-local-ifal',
    name: 'Instituto de Formação da Administração Local (IFAL)',
    type: 'centro_formacao',
    ownership: 'publica',
    province: 'Luanda',
    place: 'Luanda',
    summary:
      'O instituto do Ministério da Administração do Território: dá cursos de capacitação para entrar e progredir na administração local, cursos técnico-profissionais abertos ao público e cursos de nível médio.',
    offers: [
      offer(
        'Cursos de Administração Local e Autárquica',
        ['tecnico-superior-de-administracao-publica'],
        'formacao_profissional',
      ),
    ],
    sources: [
      {
        label: 'Decreto Presidencial n.º 161/13 (Lex.AO)',
        url: 'https://lex.ao/docs/presidente-da-republica/2013/decreto-presidencial-n-o-161-13-de-18-de-outubro/',
      },
    ],
  },
  {
    id: 'academia-diplomatica-venancio-de-moura',
    name: 'Academia Diplomática Venâncio de Moura',
    type: 'centro_formacao',
    ownership: 'publica',
    province: 'Luanda',
    place: 'Kilamba, Luanda',
    summary:
      'A academia do Ministério das Relações Exteriores, no Kilamba: forma diplomatas e especialistas em relações internacionais, com capacidade para 1800 por ano.',
    offers: [
      offer(
        'Formação em Diplomacia e Relações Internacionais',
        ['diplomata', 'tecnico-de-cooperacao-internacional'],
        'formacao_profissional',
      ),
    ],
    sources: [],
  },
  {
    id: 'centro-de-formacao-do-sic-da-damba',
    name: 'Centro de Formação do SIC da Damba',
    type: 'centro_formacao',
    ownership: 'publica',
    province: 'Malanje',
    place: 'Damba, Mucari, Malanje',
    summary:
      'Onde o Serviço de Investigação Criminal deu o seu primeiro curso, de seis meses, com técnicas de investigação, armamento, socorrismo e defesa pessoal. Só entra quem é admitido no concurso.',
    offers: [
      offer('Curso Básico de Investigação Criminal', ['investigador-criminal'], 'formacao_profissional'),
    ],
    sources: [
      {
        label: 'Ver Angola: SIC com mais de 1700 novos efectivos (2024)',
        url: 'https://www.verangola.net/va/pt/012024/Defesa/39320/SIC-conta-com-mais-de-1700-novos-efectivos.htm',
      },
      {
        label: 'Decreto Presidencial n.º 194/17 (Lex.AO)',
        url: 'https://lex.ao/docs/presidente-da-republica/2017/decreto-presidencial-n-o-194-17-de-22-de-agosto/',
      },
    ],
  },
  {
    id: 'instituto-nacional-de-estudos-judiciarios-inej',
    name: 'Instituto Nacional de Estudos Judiciários (INEJ)',
    type: 'centro_formacao',
    ownership: 'publica',
    province: 'Luanda',
    place: 'Luanda',
    summary:
      'Forma os novos juízes e procuradores: quem entra na magistratura faz aqui a formação inicial, com estágio nos tribunais.',
    offers: [offer('Formação inicial de magistrados', ['juiz', 'procurador'], 'formacao_profissional')],
    sources: [],
  },
  {
    id: 'centro-de-estudos-e-formacao-da-ordem-dos-advogados-de-angola',
    name: 'Centro de Estudos e Formação da Ordem dos Advogados de Angola',
    type: 'centro_formacao',
    ownership: null,
    province: 'Luanda',
    place: 'Luanda',
    summary:
      'O caminho para ser advogado, depois da licenciatura em Direito: 18 meses de estágio com um patrono, a formação inicial no Centro e a Prova Final de Acesso à Advocacia, em Abril, em todo o país.',
    offers: [offer('Formação inicial obrigatória e Prova Final de Acesso à Advocacia', ['advogado'])],
    sources: [],
  },
  {
    id: 'centro-de-arbitragem-da-aia',
    name: 'Centro de Arbitragem da AIA',
    type: 'centro_formacao',
    ownership: 'privada',
    province: 'Luanda',
    place: 'Rua Rainha Ginga, Luanda',
    summary:
      'Os estatutos incluem a formação de árbitros, mediadores e conciliadores. Confirma se o curso é reconhecido pelo organismo da Justiça, como pede a Lei n.º 12/16.',
    offers: [
      offer('Formação de mediadores e conciliadores', ['mediador-de-conflitos'], 'formacao_profissional'),
    ],
    sources: [
      {
        label: 'Decreto Executivo n.º 464/17 (Lex.AO)',
        url: 'https://lex.ao/docs/ministerio-da-justica-e-dos-direitos-humanos/2017/decreto-executivo-n-o-464-17-de-02-de-outubro/',
      },
    ],
  },
]
