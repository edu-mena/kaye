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
const SUMMARIES: Record<string, string> = {
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
    [/^(ciencias farmaceuticas|farmacia)/, ['farmaceutico', 'tecnico-farmacia']],
    [/^cardiopneumologia/, ['cardiopneumologista']],
    [/^radiologia/, ['tecnico-radiologia']],
    [/^nutricao/, ['nutricionista']],
    [/^electromedicina/, ['tecnico-electromedicina']],
  ],
  employs: [
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
