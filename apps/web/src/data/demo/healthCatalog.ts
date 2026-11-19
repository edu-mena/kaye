import catalog from '../catalog/health.json'
import { buildArea, type AreaData } from './areaCatalog'
import { HEALTH_CAREERS } from './healthCareers'

// Health, from scrapers/catalog/health.json (python -m catalog.health): every higher education institution with
// health courses (MESCTI yearbook 2023-2024) and the employers with a name (MINSA's statistical yearbook 2023,
// decrees and official pages).

const DOCTORS = HEALTH_CAREERS.filter((career) => career.group === 'medicina').map((career) => career.slug)
const HOSPITAL = [
  'medico-clinica-geral',
  'enfermeiro',
  'tecnico-analises-clinicas',
  'tecnico-radiologia',
  'farmaceutico',
]
const GENERAL_HOSPITAL = [
  ...HOSPITAL,
  'medico-internista',
  'medico-pediatra',
  'medico-ginecologista-obstetra',
  'cirurgiao-geral',
  'medico-anestesista',
  'medico-intensivista',
  'medico-radiologista',
  'medico-neurologista',
  'medico-urologista',
  'medico-otorrinolaringologista',
  'medico-dermatologista',
  'medico-dentista',
  'tecnico-medio-enfermagem',
  'parteira',
  'enfermeiro-cuidados-intensivos',
  'instrumentista-cirurgico',
  'tecnico-anatomia-patologica',
  'tecnico-electromedicina',
  'tecnico-estomatologia',
  'tecnico-farmacia',
  'cardiopneumologista',
  'fisioterapeuta',
  'nutricionista',
  'psicologo-clinico',
]
const SUMMARIES: Record<string, string> = {
  distribuidora: 'Empresa que importa e distribui medicamentos e produtos de saúde em Angola.',
  nacional: 'Unidade nacional do Serviço Nacional de Saúde, no anuário estatístico do Ministério da Saúde.',
  publica: 'Organismo público do sector da saúde, criado por decreto.',
  publica_especial: 'Clínica pública com estatuto especial, que também forma médicos internos.',
  privada: 'Unidade privada de saúde.',
}

export const HEALTH = buildArea(catalog as AreaData, {
  careers: HEALTH_CAREERS,
  courses: 'saúde',
  courseCareers: [
    [/^enfermagem e obstetr/, ['parteira', 'enfermeiro']],
    [/^enfermagem/, ['enfermeiro', 'enfermeiro-cuidados-intensivos', 'instrumentista-cirurgico']],
    [/^analises clinicas e saude publica/, ['tecnico-analises-clinicas', 'tecnico-saude-publica']],
    [/^(analises clinicas|laboratorio clinico)/, ['tecnico-analises-clinicas']],
    [/^psicologia clinica/, ['psicologo-clinico']],
    [/^fisioterapia/, ['fisioterapeuta']],
    [/^(medicina dentaria|odontologia)/, ['medico-dentista']],
    [/^medicina/, [...DOCTORS, 'medico-saude-publica']],
    [
      /^(ciencias farmaceuticas|farmacia)/,
      ['farmaceutico', 'tecnico-farmacia', 'delegado-informacao-medica'],
    ],
    [/^cardiopneumologia/, ['cardiopneumologista']],
    [/^radiologia/, ['tecnico-radiologia']],
    [/^nutricao/, ['nutricionista']],
    [/^electromedicina/, ['tecnico-electromedicina']],
  ],
  employs: [
    [/pharma|pharmadis|neofarma/, ['delegado-informacao-medica', 'farmaceutico', 'tecnico-farmacia']],
    [
      /pediatrico/,
      [
        'medico-pediatra',
        'enfermeiro',
        'tecnico-medio-enfermagem',
        'enfermeiro-cuidados-intensivos',
        'tecnico-analises-clinicas',
        'nutricionista',
      ],
    ],
    [
      /maternidade|^hmi/,
      [
        'medico-ginecologista-obstetra',
        'medico-pediatra',
        'medico-anestesista',
        'parteira',
        'enfermeiro',
        'tecnico-medio-enfermagem',
        'instrumentista-cirurgico',
      ],
    ],
    [/psiquiatrico/, ['medico-psiquiatra', 'psicologo-clinico', 'enfermeiro', 'tecnico-medio-enfermagem']],
    [/oftalmologico/, ['medico-oftalmologista', 'ortoptista', 'enfermeiro', 'instrumentista-cirurgico']],
    [
      /cardio-pulmonares/,
      [
        'medico-cardiologista',
        'medico-intensivista',
        'cardiopneumologista',
        'enfermeiro-cuidados-intensivos',
        'tecnico-electromedicina',
        'tecnico-radiologia',
        'tecnico-analises-clinicas',
      ],
    ],
    [
      /neves bendinha/,
      [
        'cirurgiao-geral',
        'medico-anestesista',
        'enfermeiro',
        'enfermeiro-cuidados-intensivos',
        'instrumentista-cirurgico',
        'fisioterapeuta',
      ],
    ],
    [
      /sanatorio|cetep/,
      [
        'medico-internista',
        'medico-intensivista',
        'enfermeiro',
        'tecnico-medio-enfermagem',
        'tecnico-analises-clinicas',
        'tecnico-radiologia',
      ],
    ],
    [
      /cancer/,
      [
        'tecnico-anatomia-patologica',
        'medico-radiologista',
        'medico-internista',
        'tecnico-radiologia',
        'enfermeiro',
      ],
    ],
    [/josina|boa vida|prenda|strangway|multiperfil|sagrada esperanca|girassol/, GENERAL_HOSPITAL],
    [
      /investigacoes|sida|tripanossomiases/,
      [
        'medico-saude-publica',
        'tecnico-saude-publica',
        'tecnico-saude-ambiental',
        'tecnico-analises-clinicas',
        'enfermeiro',
      ],
    ],
    [/^(hospital|hmi|complexo|maternidade|clinica|cetep|aliva)/, HOSPITAL],
    [/^centro (ortopedico|de medicina fisica)/, ['fisioterapeuta', 'ortoprotesico', 'medico-ortopedista']],
    [/^central de compras/, ['farmaceutico', 'tecnico-farmacia']],
    [/emergencia medica/, ['medico-clinica-geral', 'enfermeiro']],
    [/^instituto/, ['medico-saude-publica', 'tecnico-analises-clinicas', 'enfermeiro']],
  ],
  fallback: HOSPITAL,
  sector: 'saude',
  source: catalog.sources.health,
  describe: (employer) => SUMMARIES[employer.kind] ?? SUMMARIES.privada ?? '',
})
