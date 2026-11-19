import type { FreeCourse, SourceLink } from '../types'

/*
 * Free online courses to start a career without paying, checked on 5 November 2026 on each provider's official
 * page (Cisco Networking Academy, freeCodeCamp, The Odin Project, Microsoft Learn, Google Skillshop, AWS, Khan
 * Academy, OpenWHO, NAU). Hours and the certificate only when a source gives them; `certificate: null` when none
 * says. Sources and what was left out: docs/recolha-de-dados.md.
 */

const CHECKED = '2026-11-05'

type Course = Omit<FreeCourse, 'checkedAt' | 'provider' | 'sources'> & { sources?: SourceLink[] }

function from(provider: string, base: SourceLink[], courses: Course[]): FreeCourse[] {
  return courses.map(({ sources = [], ...course }) => ({
    ...course,
    provider,
    sources: [...sources, ...base],
    checkedAt: CHECKED,
  }))
}

const NETWORKS = ['administrador-de-redes', 'tecnico-de-telecomunicacoes', 'engenheiro-de-telecomunicacoes']
const SUPPORT = ['tecnico-de-suporte', 'tecnico-de-hardware']
const DATA = ['analista-de-dados', 'analista-de-bi', 'cientista-de-dados', 'engenheiro-de-dados']
const WEB = ['desenvolvedor-frontend', 'desenvolvedor-full-stack']
const BACKEND = ['desenvolvedor-backend', 'desenvolvedor-full-stack']
const CLOUD = ['engenheiro-devops', 'administrador-de-sistemas', 'gestor-de-ti']
const HEALTH_CARE = [
  'enfermeiro',
  'tecnico-medio-enfermagem',
  'parteira',
  'enfermeiro-cuidados-intensivos',
  'instrumentista-cirurgico',
  'medico-clinica-geral',
]
const PUBLIC_HEALTH = ['medico-saude-publica', 'tecnico-saude-publica', 'tecnico-saude-ambiental']

const CISCO_BADGES = { label: 'Credly: badges da Cisco', url: 'https://www.credly.com/org/cisco' }
const netacad = (slug: string) => `https://www.netacad.com/courses/${slug}`

const CISCO = from(
  'Cisco Networking Academy',
  [],
  [
    {
      id: 'cisco-intro-ciberseguranca',
      name: 'Introdução à Cibersegurança',
      languages: ['pt', 'en'],
      careerSlugs: [
        'analista-de-ciberseguranca',
        ...NETWORKS,
        'administrador-de-sistemas',
        'tecnico-de-suporte',
      ],
      areas: ['technology'],
      hours: 6,
      certificate: 'gratis',
      credential: 'badge digital da Cisco (Credly)',
      level: 'iniciante',
      url: netacad('introduction-to-cybersecurity'),
      sources: [
        {
          label: 'Cisco NetAcad (pt)',
          url: 'https://www.netacad.com/trainings/introduction-to-cybersecurity?courseLang=pt-BR',
        },
        CISCO_BADGES,
      ],
    },
    {
      id: 'cisco-networking-basics',
      name: 'Networking Basics',
      languages: ['en'],
      careerSlugs: [...NETWORKS, ...SUPPORT, 'analista-de-ciberseguranca'],
      areas: ['technology'],
      hours: 22,
      certificate: 'gratis',
      credential: 'badge digital da Cisco (Credly), com 70% no exame final',
      level: 'iniciante',
      url: netacad('networking-basics'),
      sources: [{ label: 'Cisco NetAcad', url: netacad('networking-basics') }, CISCO_BADGES],
    },
    {
      id: 'cisco-linux-unhatched',
      name: 'Linux Unhatched',
      languages: ['en'],
      careerSlugs: ['administrador-de-sistemas', 'engenheiro-devops', 'analista-de-ciberseguranca'],
      areas: ['technology'],
      hours: 8,
      certificate: null,
      level: 'iniciante',
      url: netacad('linux-unhatched'),
      sources: [{ label: 'Cisco NetAcad', url: netacad('linux-unhatched') }],
    },
    {
      id: 'cisco-python-essentials-1',
      name: 'Python Essentials 1',
      languages: ['en'],
      careerSlugs: [...DATA, 'desenvolvedor-backend', 'engenheiro-de-qa'],
      areas: ['technology'],
      hours: 30,
      certificate: null,
      level: 'iniciante',
      url: netacad('python-essentials-1'),
      sources: [
        { label: 'Cisco NetAcad', url: 'https://www.netacad.com/learning-collections/python' },
        { label: 'Python Institute', url: 'https://pythoninstitute.org/netacad' },
      ],
    },
    {
      id: 'cisco-data-analytics-essentials',
      name: 'Data Analytics Essentials',
      languages: ['en'],
      careerSlugs: ['analista-de-dados', 'analista-de-bi'],
      areas: ['technology'],
      hours: 30,
      certificate: null,
      level: 'iniciante',
      url: netacad('data-analytics-essentials'),
      sources: [{ label: 'Cisco NetAcad', url: netacad('data-analytics-essentials') }],
    },
    {
      id: 'cisco-intro-data-science',
      name: 'Introduction to Data Science',
      languages: ['en'],
      careerSlugs: ['cientista-de-dados', 'analista-de-dados'],
      areas: ['technology'],
      hours: 6,
      certificate: null,
      level: 'iniciante',
      url: netacad('introduction-data-science'),
      sources: [{ label: 'Cisco NetAcad', url: netacad('introduction-data-science') }],
    },
    {
      id: 'cisco-computer-hardware-basics',
      name: 'Computer Hardware Basics',
      languages: ['en'],
      careerSlugs: SUPPORT,
      areas: ['technology'],
      hours: 6,
      certificate: null,
      level: 'iniciante',
      url: netacad('computer-hardware-basics'),
      sources: [{ label: 'Cisco NetAcad', url: netacad('computer-hardware-basics') }],
    },
  ],
)

// The certifications are free; the exams are only in English for now (same source).
const FCC_SOURCE = {
  label: 'freeCodeCamp (2025)',
  url: 'https://www.freecodecamp.org/news/freecodecamps-new-responsive-web-design-certification-is-now-live/',
}
const fcc = (id: string, name: string, careerSlugs: string[], level: FreeCourse['level']): Course => ({
  id: `fcc-${id}`,
  name,
  languages: ['en'],
  careerSlugs,
  areas: ['technology'],
  certificate: 'gratis',
  credential: 'certificação verificada do freeCodeCamp',
  level,
  url: 'https://www.freecodecamp.org/learn',
})

const FREECODECAMP = from(
  'freeCodeCamp',
  [FCC_SOURCE],
  [
    fcc('responsive-web-design', 'Responsive Web Design', [...WEB, 'designer-ui-ux'], 'iniciante'),
    fcc('javascript', 'JavaScript', [...WEB, 'desenvolvedor-mobile', 'engenheiro-de-qa'], 'iniciante'),
    fcc('frontend-libraries', 'Frontend Libraries', [...WEB, 'desenvolvedor-mobile'], 'intermedio'),
    fcc('python', 'Python', [...DATA, 'desenvolvedor-backend'], 'iniciante'),
    fcc(
      'relational-databases',
      'Relational Databases',
      ['administrador-de-base-de-dados', ...BACKEND, 'engenheiro-de-dados'],
      'intermedio',
    ),
    fcc('backend-javascript', 'Backend JavaScript', BACKEND, 'intermedio'),
    fcc(
      'full-stack',
      'Certified Full Stack Developer',
      ['desenvolvedor-full-stack', 'desenvolvedor-frontend', 'desenvolvedor-backend'],
      'intermedio',
    ),
  ],
)

const ODIN = from(
  'The Odin Project',
  [{ label: 'The Odin Project (FAQ)', url: 'https://www.theodinproject.com/faq' }],
  [
    {
      id: 'odin-foundations',
      name: 'Foundations',
      languages: ['en'],
      careerSlugs: [...WEB, 'desenvolvedor-backend'],
      areas: ['technology'],
      certificate: 'nenhum',
      level: 'iniciante',
      url: 'https://www.theodinproject.com/paths/foundations',
    },
    {
      id: 'odin-full-stack-javascript',
      name: 'Full Stack JavaScript',
      languages: ['en'],
      careerSlugs: ['desenvolvedor-full-stack', 'desenvolvedor-backend', 'desenvolvedor-frontend'],
      areas: ['technology'],
      certificate: 'nenhum',
      level: 'intermedio',
      url: 'https://www.theodinproject.com/paths/full-stack-javascript',
    },
  ],
)

// Training is free; a learning path gives a trophy on the Learn profile, not a certificate (FAQ).
const MS_FAQ = {
  label: 'Microsoft Learn (FAQ)',
  url: 'https://learn.microsoft.com/pt-pt/training/support/faq',
}
const msPath = (
  id: string,
  name: string,
  careerSlugs: string[],
  level: FreeCourse['level'] = 'iniciante',
): Course => ({
  id: `ms-${id}`,
  name,
  languages: ['pt', 'en', 'fr'],
  careerSlugs,
  areas: ['technology'],
  certificate: 'nenhum',
  credential: 'troféu no perfil do Microsoft Learn',
  level,
  url: `https://learn.microsoft.com/pt-pt/training/paths/${id}/`,
})

const MICROSOFT = from(
  'Microsoft Learn',
  [MS_FAQ],
  [
    msPath(
      'microsoft-azure-fundamentals-describe-cloud-concepts',
      'Azure (AZ-900) 1: conceitos de nuvem',
      CLOUD,
    ),
    msPath(
      'azure-fundamentals-describe-azure-architecture-services',
      'Azure (AZ-900) 2: arquitetura e serviços',
      CLOUD,
    ),
    msPath('describe-azure-management-governance', 'Azure (AZ-900) 3: gestão e governação', CLOUD),
    msPath(
      'describe-concepts-of-security-compliance-identity',
      'Segurança, conformidade e identidade (SC-900)',
      ['analista-de-ciberseguranca', 'administrador-de-sistemas'],
    ),
    msPath('get-started-ai-apps-agents', 'Aplicações e agentes de IA no Azure', [
      'cientista-de-dados',
      'engenheiro-de-dados',
      'desenvolvedor-backend',
    ]),
    msPath('azure-data-fundamentals-explore-core-data-concepts', 'Conceitos básicos de dados (DP-900)', [
      ...DATA,
      'administrador-de-base-de-dados',
    ]),
  ],
)

const SKILLSHOP_SOURCES = [
  { label: 'Google Skillshop', url: 'https://skillshop.withgoogle.com/intl/pt-BR_ALL/' },
  { label: 'Reliablesoft: Skillshop', url: 'https://www.reliablesoft.net/google-skillshop-review/' },
]
const MARKETING = ['gestor-de-marketing-digital', 'gestor-de-marketing', 'gestor-de-redes-sociais']

const GOOGLE = from('Google Skillshop', SKILLSHOP_SOURCES, [
  {
    id: 'google-ads-certificacao',
    name: 'Certificação Google Ads',
    languages: ['pt', 'en', 'fr'],
    careerSlugs: [...MARKETING, 'tecnico-comercial'],
    areas: ['technology', 'business', 'communication'],
    certificate: 'gratis',
    credential: 'certificação de produto do Google, válida 1 ano',
    level: 'iniciante',
    url: 'https://skillshop.withgoogle.com/',
  },
  {
    id: 'google-analytics-certificacao',
    name: 'Certificação Google Analytics',
    languages: ['pt', 'en', 'fr'],
    careerSlugs: [...MARKETING, 'analista-de-dados'],
    areas: ['technology', 'business', 'communication'],
    certificate: 'gratis',
    credential: 'certificação de produto do Google',
    level: 'iniciante',
    url: 'https://skillshop.withgoogle.com/',
  },
])

const AWS = from(
  'AWS Skill Builder',
  [],
  [
    {
      id: 'aws-cloud-practitioner-essentials',
      name: 'AWS Cloud Practitioner Essentials',
      languages: ['en'],
      careerSlugs: CLOUD,
      areas: ['technology'],
      hours: 12.75,
      certificate: null,
      level: 'iniciante',
      url: 'https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/',
      sources: [
        { label: 'AWS', url: 'https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/' },
        {
          label: 'AWS: formação grátis',
          url: 'https://aws.amazon.com/blogs/training-and-certification/make-the-most-of-free-training-from-aws-training-and-certification',
        },
      ],
    },
  ],
)

// Khan Academy is free (about page) and gives no certificate (help centre).
const KHAN_SOURCES = [
  { label: 'Khan Academy (sobre)', url: 'https://pt.khanacademy.org/about' },
  {
    label: 'Khan Academy (ajuda)',
    url: 'https://support.khanacademy.org/hc/de/community/posts/360018979011/comments/360002024411',
  },
]
const khan = (
  id: string,
  name: string,
  path: string,
  careerSlugs: string[],
  areas: FreeCourse['areas'],
): Course => ({
  id: `khan-${id}`,
  name,
  languages: ['pt', 'en', 'fr'],
  careerSlugs,
  areas,
  certificate: 'nenhum',
  level: 'iniciante',
  url: `https://pt.khanacademy.org/${path}`,
})

const KHAN = from('Khan Academy', KHAN_SOURCES, [
  khan(
    'programacao',
    'Programação de computadores',
    'computing/computer-programming',
    [...WEB, 'formador-de-tic', 'professor-de-informatica'],
    ['technology', 'education'],
  ),
  khan(
    'estatistica',
    'Estatística e probabilidade',
    'math/statistics-probability',
    [...DATA, 'estatistico', 'actuario', 'analista-de-risco'],
    ['technology', 'business', 'sciences'],
  ),
  khan(
    'economia',
    'Economia e finanças',
    'economics-finance-domain',
    ['economista', 'analista-financeiro', 'contabilista', 'analista-de-credito', 'gestor-de-empresas'],
    ['business'],
  ),
  khan(
    'biologia',
    'Biologia',
    'science/biology',
    [...HEALTH_CARE, 'tecnico-analises-clinicas', 'biologo', 'professor-de-biologia'],
    ['health', 'sciences', 'education'],
  ),
  khan(
    'quimica',
    'Química',
    'science/chemistry',
    ['farmaceutico', 'tecnico-farmacia', 'quimico', 'engenheiro-quimico', 'professor-de-quimica'],
    ['health', 'sciences', 'engineering'],
  ),
  khan(
    'fisica',
    'Física',
    'science/physics',
    [
      'engenheiro-electrotecnico',
      'engenheiro-mecanico',
      'fisico',
      'tecnico-radiologia',
      'professor-de-fisica',
    ],
    ['engineering', 'sciences', 'health'],
  ),
  khan(
    'saude-medicina',
    'Saúde e medicina',
    'science/health-and-medicine',
    [...HEALTH_CARE, 'fisioterapeuta', 'nutricionista', 'farmaceutico'],
    ['health'],
  ),
])

const OPENWHO = from(
  'OpenWHO (Organização Mundial da Saúde)',
  [],
  [
    {
      id: 'openwho-recursos',
      name: 'Formação da OMS para emergências de saúde',
      languages: ['pt', 'en', 'fr'],
      careerSlugs: [...HEALTH_CARE, ...PUBLIC_HEALTH, 'tecnico-analises-clinicas'],
      areas: ['health'],
      certificate: 'nenhum',
      level: 'iniciante',
      url: 'https://openwho.org/',
      sources: [
        { label: 'OpenWHO (FAQ)', url: 'https://openwho.org/faq' },
        {
          label: 'OMS (05/2023)',
          url: 'https://www.who.int/news/item/24-05-2023-strengthening-influenza-preparedness-through-an-openwho-online-course',
        },
      ],
    },
  ],
)

// NAU's own participation certificate is free; a course by a higher-education institution may follow its own rules.
const NAU_POLICY = {
  label: 'NAU: política de certificação',
  url: 'https://www.nau.edu.pt/pt/legal/politica-de-certificacao',
}

const NAU = from(
  'NAU (Portugal)',
  [NAU_POLICY],
  [
    {
      id: 'nau-higiene-das-maos',
      name: 'Higiene das Mãos na Prevenção de Infeções (DGS)',
      languages: ['pt'],
      careerSlugs: [...HEALTH_CARE, ...PUBLIC_HEALTH],
      areas: ['health'],
      hours: 3,
      certificate: 'gratis',
      credential: 'certificado de participação, com 50% de nota mínima',
      level: 'iniciante',
      url: 'https://www.nau.edu.pt/curso/higiene-das-maos-na-prevencao-de-infecoes',
      sources: [
        { label: 'NAU', url: 'https://www.nau.edu.pt/curso/higiene-das-maos-na-prevencao-de-infecoes' },
      ],
    },
    {
      id: 'nau-introducao-programacao',
      name: 'Introdução à Programação: conceitos fundamentais (IPT)',
      languages: ['pt'],
      careerSlugs: [...WEB, 'desenvolvedor-backend', 'engenheiro-de-qa'],
      areas: ['technology'],
      hours: 60,
      certificate: null,
      level: 'intermedio',
      url: 'https://www.nau.edu.pt/pt/curso/introducao-a-programacao-conceitos-fundamentais',
      sources: [
        {
          label: 'NAU',
          url: 'https://www.nau.edu.pt/pt/curso/introducao-a-programacao-conceitos-fundamentais',
        },
      ],
    },
  ],
)

// Cheap paid certifications: official exams (price from the provider's page) and well-rated Udemy courses.
const AWS_PRICES = {
  label: 'AWS: preços dos exames',
  url: 'https://aws.amazon.com/certification/policies/before-testing/',
}
const awsExam = (slug: string): SourceLink => ({
  label: 'AWS',
  url: `https://aws.amazon.com/certification/${slug}/`,
})

const EXAMS: FreeCourse[] = [
  ...from(
    'AWS',
    [AWS_PRICES],
    [
      {
        id: 'aws-exame-cloud-practitioner',
        name: 'Exame AWS Certified Cloud Practitioner',
        languages: ['en', 'fr'],
        careerSlugs: [...CLOUD, 'administrador-de-redes', 'desenvolvedor-backend'],
        areas: ['technology'],
        certificate: 'pago',
        credential: 'certificação AWS (nível Foundational), 90 minutos',
        priceUsd: 100,
        level: 'iniciante',
        url: awsExam('certified-cloud-practitioner').url,
        sources: [awsExam('certified-cloud-practitioner')],
      },
      {
        id: 'aws-exame-solutions-architect-associate',
        name: 'Exame AWS Certified Solutions Architect – Associate',
        languages: ['en'],
        careerSlugs: [...CLOUD, 'desenvolvedor-backend', 'engenheiro-de-dados'],
        areas: ['technology'],
        certificate: 'pago',
        credential: 'certificação AWS (nível Associate)',
        priceUsd: 150,
        level: 'intermedio',
        url: awsExam('certified-solutions-architect-associate').url,
      },
      {
        id: 'aws-exame-devops-professional',
        name: 'Exame AWS Certified DevOps Engineer – Professional',
        languages: ['en'],
        careerSlugs: ['engenheiro-devops', 'administrador-de-sistemas'],
        areas: ['technology'],
        certificate: 'pago',
        credential: 'certificação AWS (nível Professional); pede 2+ anos de experiência em AWS',
        priceUsd: 300,
        level: 'avancado',
        url: awsExam('certified-devops-engineer-professional').url,
        sources: [awsExam('certified-devops-engineer-professional')],
      },
    ],
  ),
  ...from(
    'Microsoft',
    [],
    [
      {
        id: 'ms-exame-az-900',
        name: 'Exame AZ-900: Microsoft Azure Fundamentals',
        languages: ['pt', 'en', 'fr'],
        careerSlugs: CLOUD,
        areas: ['technology'],
        certificate: 'pago',
        credential: 'Microsoft Certified: Azure Fundamentals; preço varia por país (99 USD nos EUA)',
        priceUsd: 99,
        level: 'iniciante',
        url: 'https://learn.microsoft.com/pt-pt/credentials/certifications/azure-fundamentals/',
        sources: [
          {
            label: 'Microsoft Learn',
            url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/',
          },
          { label: 'MSCertQuiz (2026)', url: 'https://mscertquiz.com/blog/is-az-900-worth-it' },
        ],
      },
    ],
  ),
  ...from(
    'Google Cloud',
    [],
    [
      {
        id: 'google-exame-associate-cloud-engineer',
        name: 'Exame Google Associate Cloud Engineer',
        languages: ['pt', 'en'],
        careerSlugs: CLOUD,
        areas: ['technology'],
        certificate: 'pago',
        credential: 'certificação Google Cloud, válida 3 anos; recomenda 6+ meses de prática',
        priceUsd: 125,
        level: 'intermedio',
        url: 'https://cloud.google.com/learn/certification/cloud-engineer',
        sources: [
          { label: 'Google Cloud', url: 'https://cloud.google.com/learn/certification/cloud-engineer' },
        ],
      },
    ],
  ),
  ...from(
    'Python Institute (OpenEDG)',
    [],
    [
      {
        id: 'python-institute-pcep',
        name: 'Exame PCEP: Certified Entry-Level Python Programmer',
        languages: ['en'],
        careerSlugs: [...DATA, 'desenvolvedor-backend', 'engenheiro-de-qa'],
        areas: ['technology'],
        certificate: 'pago',
        credential: 'certificação PCEP, 50 minutos; continua o Python Essentials 1 da Cisco',
        priceUsd: 59,
        level: 'iniciante',
        url: 'https://pythoninstitute.org/pcep',
        sources: [
          { label: 'Python Institute', url: 'https://pythoninstitute.org/pcep' },
          {
            label: 'Open Exam Prep (2026)',
            url: 'https://open-exam-prep.com/blog/openedg-pcep-certified-entry-level-python-programmer-exam-guide-2026',
          },
        ],
      },
    ],
  ),
]

// Udemy sets the price by country and runs frequent promotions, so no single price is kept.
const UDEMY_PRICING = {
  label: 'Udemy: preços',
  url: 'https://support.udemy.com/hc/en-us/articles/229606248-Udemy-Course-Pricing-Learner-FAQ',
}
const udemy = (slug: string) => `https://www.udemy.com/course/${slug}/`

const UDEMY = from(
  'Udemy',
  [UDEMY_PRICING],
  [
    {
      id: 'udemy-curso-web-moderno',
      name: 'Curso Web Moderno Completo com JavaScript + Projetos (Cod3r)',
      languages: ['pt'],
      careerSlugs: [...WEB, 'desenvolvedor-backend'],
      areas: ['technology'],
      certificate: 'pago',
      credential: 'certificado de conclusão da Udemy (não é acreditado)',
      level: 'iniciante',
      url: udemy('curso-web'),
      sources: [
        { label: 'GitHub: curso Cod3r', url: 'https://github.com/Merieli/cod3r-webModernoComJavascript' },
      ],
    },
    {
      id: 'udemy-100-days-of-code',
      name: '100 Days of Code: The Complete Python Pro Bootcamp (Angela Yu)',
      languages: ['en'],
      careerSlugs: [...DATA, 'desenvolvedor-backend'],
      areas: ['technology'],
      certificate: 'pago',
      credential: 'certificado de conclusão da Udemy (não é acreditado)',
      level: 'iniciante',
      url: udemy('100-days-of-code'),
    },
    {
      id: 'udemy-aws-cloud-practitioner',
      name: 'Ultimate AWS Certified Cloud Practitioner CLF-C02 (Stephane Maarek)',
      languages: ['en'],
      careerSlugs: CLOUD,
      areas: ['technology'],
      certificate: 'pago',
      credential: 'certificado de conclusão da Udemy; prepara o exame da AWS (pago à parte)',
      level: 'iniciante',
      url: udemy('aws-certified-cloud-practitioner-new'),
      sources: [
        {
          label: 'Class Central',
          url: 'https://www.classcentral.com/course/udemy-aws-certified-cloud-practitioner-new-26063',
        },
      ],
    },
    {
      id: 'udemy-complete-sql-bootcamp',
      name: 'The Complete SQL Bootcamp (Jose Portilla)',
      languages: ['en'],
      careerSlugs: [
        'analista-de-dados',
        'analista-de-bi',
        'administrador-de-base-de-dados',
        'desenvolvedor-backend',
      ],
      areas: ['technology'],
      certificate: 'pago',
      credential: 'certificado de conclusão da Udemy (não é acreditado)',
      level: 'iniciante',
      url: 'https://www.udemy.com/the-complete-sql-bootcamp/',
    },
  ],
)

/** Portuguese first, then the ones with a free certificate; the paid ones go to their own list. */
export const FREE_COURSES: FreeCourse[] = [
  ...MICROSOFT,
  ...NAU,
  ...KHAN,
  ...CISCO,
  ...GOOGLE,
  ...FREECODECAMP,
  ...OPENWHO,
  ...ODIN,
  ...AWS,
  ...EXAMS,
  ...UDEMY,
]
