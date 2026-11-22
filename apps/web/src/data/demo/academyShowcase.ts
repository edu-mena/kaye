import type { Academy, AcademyOffer, Schedule } from '../types'
import { CAREER_SUMMARIES } from './careers'

// The showcase institutions of Luanda (docs/recolha-de-dados.md, "Academias completas"): what the sources do not say
// (length, schedule, the courses of a school with none listed, how to get in) is filled in by the kind of institution
// and marked `estimated: true`. Never a phone, a name or a price: those stay empty until a source gives them.

/** About 60 institutions: the universities and higher institutes, the main médio schools and training centres. */
const SHOWCASE_IDS = new Set([
  // universities and higher institutes
  'uan',
  'isutic',
  'isptec',
  'ucan',
  'uma',
  'ula',
  'utanga',
  'universidade-independente-de-angola',
  'universidade-privada-de-angola',
  'universidade-de-belas',
  'universidade-de-luanda',
  'universidade-oscar-ribas',
  'universidades-jean-piaget',
  'universidade-gregorio-semedo',
  'instituto-superior-politecnico-kalandula-de-angola',
  'instituto-superior-politecnico-internacional-de-angola',
  'instituto-superior-politecnico-metropolitano',
  'instituto-superior-politecnico-atlantida',
  'instituto-superior-politecnico-alvorecer-de-juventude',
  'instituto-superior-politecnico-deolinda-rodrigues',
  'instituto-superior-politecnico-intercontinental-de-luanda',
  'instituto-superior-politecnico-kangonjo',
  'instituto-superior-politecnico-privado-do-kilamba',
  'instituto-superior-politecnico-tocoista',
  'instituto-superior-politecnico-do-cazenga',
  'instituto-superior-politecnico-do-bita',
  'instituto-superior-politecnico-do-zango',
  'instituto-superior-politecnico-nelson-mandela',
  'instituto-superior-tecnico-de-angola',
  'instituto-superior-de-angola',
  'instituto-superior-de-artes',
  'instituto-superior-de-ciencias-de-educacao-de-luanda',
  'instituto-superior-de-ciencias-sociais-e-relacoes-internacionais',
  'instituto-superior-tecnico-militar',
  'escola-superior-de-saude-castelo',
  'instituto-de-especializacao-em-saude',
  // médio schools (public and health)
  'itel',
  'instituto-medio-industrial-de-luanda',
  'instituto-medio-politecnico-industrial-de-luanda',
  'instituto-medio-politecnico-do-kilamba-kiaxi',
  'instituto-medio-de-administracao-e-gestao-do-kilamba-kiaxi',
  'instituto-medio-de-economia-de-luanda',
  'instituto-medio-comercial-de-luanda',
  'instituto-medio-politecnico-alda-lara',
  'instituto-politecnico-maiombe',
  'instituto-politecnico-dos-ramiros',
  'escola-de-formacao-de-tecnicos-de-saude-de-luanda',
  'instituto-tecnico-de-saude-do-kilamba-n-2-010',
  'instituto-tecnico-de-saude-n-5-146',
  // training centres
  'inefop',
  'cinfotec',
  'escola-42-luanda',
  'academia-cisco-tocoista',
  'instituto-de-formacao-bancaria-de-angola-ifba',
  'academia-bai',
  'academia-de-seguros-e-fundos-de-pensoes',
  'centro-de-formacao-de-jornalistas-cefojor',
  'complexo-das-escolas-de-artes-cearte',
  'pavilhao-artes-oficios-ramiros',
  'centro-formacao-profissional-feminino',
  'escola-nacional-de-administracao-e-politicas-publicas-enapp',
  'pmi-angola-chapter',
  'academia-petroangola',
])

/** Where the institution is, from its decree or its own documents; the catalogue only had the province. */
const PLACES: Record<string, string> = {
  'instituto-superior-de-ciencias-de-educacao-de-luanda': 'Centralidade do Kilamba, Luanda',
  'instituto-superior-politecnico-kalandula-de-angola': 'Camama II, Belas, Luanda',
  'instituto-superior-politecnico-atlantida': 'Benfica (Kifica), Belas, Luanda',
  'universidade-privada-de-angola': 'Talatona, Luanda',
  'instituto-superior-politecnico-metropolitano': 'Morro Bento, Luanda',
  'universidade-oscar-ribas': 'Talatona, Luanda',
}

const MONTHS_BY_LEVEL: Record<AcademyOffer['level'], number> = {
  formacao_profissional: 6,
  certificacao: 3,
  medio_tecnico: 48,
  licenciatura: 48,
  mestrado: 24,
  especialidade: 24,
}

/** Length in months by level, longer for the courses that usually take more (engineering, medicine, residencies). */
function months(offer: AcademyOffer): number {
  const name = offer.name.toLowerCase()
  if (offer.level === 'licenciatura') {
    if (/medicina/.test(name)) return 72
    if (/engenharia|arquitectura|arquitetura/.test(name)) return 60
  }
  if (offer.level === 'especialidade' && /^especialidade m[eé]dica/.test(name)) return 48
  return MONTHS_BY_LEVEL[offer.level]
}

/** Public schools teach by day; private ones and short courses add evening classes for those who work. */
function schedules(academy: Academy, offer: AcademyOffer): Schedule[] {
  if (academy.type === 'online') return ['online']
  const short = offer.level === 'formacao_profissional' || offer.level === 'certificacao'
  return academy.ownership === 'publica' && !short ? ['diurno'] : ['diurno', 'pos_laboral']
}

const careerAreas = (careers: string[]) => [
  ...new Set(
    CAREER_SUMMARIES.filter((career) => careers.includes(career.slug)).map((career) => career.group),
  ),
]

const course = (id: string, name: string, level: AcademyOffer['level'], careers: string[]): AcademyOffer => ({
  course: { id, name },
  name,
  level,
  careers,
  areas: careerAreas(careers),
  estimated: true,
})

const COMPUTING = course('tecnico-informatica', 'Informática', 'medio_tecnico', [
  'tecnico-de-suporte',
  'tecnico-de-hardware',
  'administrador-de-redes',
])
const ACCOUNTING = course('tecnico-contabilidade-e-gestao', 'Contabilidade e Gestão', 'medio_tecnico', [
  'tecnico-de-contabilidade',
  'contabilista',
  'assistente-administrativo',
])
const COMPUTING_MANAGEMENT = course(
  'tecnico-informatica-de-gestao',
  'Informática de Gestão',
  'medio_tecnico',
  ['assistente-administrativo', 'tecnico-de-suporte'],
)
const BUSINESS = course('tecnico-gestao-empresarial', 'Gestão Empresarial', 'medio_tecnico', [
  'gestor-de-empresas',
  'assistente-administrativo',
  'gestor-comercial',
])
const INDUSTRIAL = [
  course('tecnico-de-electricidade', 'Electricidade', 'medio_tecnico', ['tecnico-electricista']),
  course('tecnico-de-mecanica-de-manutencao', 'Mecânica de Manutenção', 'medio_tecnico', [
    'tecnico-de-manutencao-mecanica',
    'mecanico-auto',
  ]),
  course('tecnico-de-construcao-civil', 'Construção Civil', 'medio_tecnico', [
    'tecnico-de-obras',
    'canalizador',
  ]),
  COMPUTING,
]
const BANKING = course('formacao-bancaria', 'Formação bancária', 'formacao_profissional', [
  'gestor-de-clientes-bancario',
  'operador-de-caixa-bancario',
])

/** The courses to list for an institution that has none, by what its name says it is. Editorial, estimated. */
function coursesFor(academy: Academy): AcademyOffer[] {
  const id = academy.id
  if (id === 'isutic')
    return [
      course('engenharia-informatica', 'Engenharia Informática', 'licenciatura', [
        'desenvolvedor-backend',
        'analista-de-sistemas',
        'administrador-de-sistemas',
      ]),
      course('engenharia-de-telecomunicacoes', 'Engenharia de Telecomunicações', 'licenciatura', [
        'tecnico-de-telecomunicacoes',
        'engenheiro-de-telecomunicacoes',
      ]),
    ]
  if (id === 'inefop')
    return [
      course('informatica-de-utilizador', 'Informática de utilizador', 'formacao_profissional', [
        'tecnico-de-suporte',
      ]),
      course('secretariado-administrativo', 'Secretariado Administrativo', 'formacao_profissional', [
        'assistente-administrativo',
        'secretario-executivo',
      ]),
      course('oficio-mecanica-auto', 'Mecânica Auto', 'formacao_profissional', ['mecanico-auto']),
    ]
  if (id === 'instituto-de-formacao-bancaria-de-angola-ifba' || id === 'academia-bai') return [BANKING]
  if (/industrial|ramiros|maiombe|politecnico-do-kilamba/.test(id)) return INDUSTRIAL
  if (/economia|comercial|administracao/.test(id)) return [ACCOUNTING, COMPUTING_MANAGEMENT, BUSINESS]
  if (/alda-lara/.test(id)) return [COMPUTING, ACCOUNTING]
  return []
}

const sentence = (list: string[]) =>
  list.length > 3 ? `${list.slice(0, 3).join(', ')} e mais ${list.length - 3}` : list.join(', ')

/** How a person gets in, by kind of institution; the exact dates and fees are only shown when a source gives them. */
function access(academy: Academy): string {
  if (academy.type === 'instituto_medio')
    return academy.ownership === 'publica'
      ? 'A entrada é por prova de acesso, com inscrição no portal do INFQE no fim de julho.'
      : 'A entrada é por inscrição e entrevista na própria escola.'
  if (academy.type === 'centro_formacao') return 'A inscrição faz-se no próprio centro, em geral sem exame.'
  if (academy.ownership === 'publica')
    return 'A entrada é por exame de acesso, com inscrições em agosto; vê as datas de 2026/27 na página de acesso.'
  return 'A entrada é por exame de admissão ou análise do certificado do ensino médio, nas datas que a instituição publica.'
}

/**
 * Adds, to the showcase institutions, the courses of a school with none (estimated), a description with its courses
 * and how to get in, and — for every offer of any institution — the estimated length and schedule.
 */
export function withShowcase(academies: Academy[]): Academy[] {
  return academies.map((academy) => {
    const showcase = SHOWCASE_IDS.has(academy.id)
    const listed = academy.offers.length > 0 || !showcase ? academy.offers : coursesFor(academy)
    const offers = listed.map((offer) =>
      Object.assign({}, offer, {
        durationMonths: offer.durationMonths ?? months(offer),
        schedule: offer.schedule ?? schedules(academy, offer),
        estimated: true as const,
      }),
    )
    if (!showcase) return { ...academy, offers }
    const names = [...new Set(offers.map((offer) => offer.name))]
    const courses = names.length > 0 ? ` Cursos: ${sentence(names)}.` : ''
    return {
      ...academy,
      offers,
      place: PLACES[academy.id] ?? academy.place,
      summary: `${academy.summary}${courses} ${access(academy)}`,
      estimated: true,
    }
  })
}
