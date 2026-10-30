import type { CareerSummary } from '../types'
import { entry, riasec, summary } from './careerSummary'

// Health, the second area of the catalogue (scrapers/catalog/health.json): the professions of the national health
// service (MINSA, Anuário Estatístico Sanitário 2023: who works there and the specialities in training), the
// technical courses of Decreto Executivo Conjunto 97/11 and the job ads. Interest profiles approximate O*NET's.
// Salaries: the State's 2026 base salary on entry to the career (Decreto Presidencial 16/26), for the careers with
// a table (medical, nursing, and diagnosis and therapy as each guide comes); the others have none yet.

/** The medical career on entry (Médico Interno de Especialidade / Médico Geral), in Kz a month. */
const MEDICAL = entry(410_165)
/** A specialist on entry (Médico Assistente). */
const SPECIALIST = entry(506_674)
/** The nursing career with a degree, on entry (Enfermeiro de 3.ª Classe). */
const NURSE = entry(361_910)
/** The nursing career at the technical level, on entry (Técnico Médio de Enfermagem de 3.ª Classe). */
const TECHNICAL_NURSE = entry(144_764)
/** A technician with a post-secondary speciality, on entry (Técnico Médio de Enfermagem Especializado de 3.ª Classe). */
const SPECIALISED_TECHNICAL_NURSE = entry(180_955)
/**
 * The diagnosis and therapy career (Decreto Presidencial n.º 188/18) with a degree, on entry (Técnico Superior de
 * Diagnóstico e Terapêutica de 2.ª Classe): the State opened only these places in 2026.
 */
const DIAGNOSIS_GRADUATE = entry(361_910)
/** The same career with the technical course only, on entry (Técnico Médio de Diagnóstico e Terapêutica de 2.ª Classe). */
const DIAGNOSIS_TECHNICIAN = entry(156_828)

const doctor = (slug: string, name: string, text: string, R: number, A: number, S: number) =>
  summary(slug, name, 'medicina', text, riasec(R, 0.85, A, S, 0.3, 0.35), 'alta', SPECIALIST)

export const HEALTH_CAREERS: CareerSummary[] = [
  summary(
    'medico-clinica-geral',
    'Médico de Clínica Geral',
    'medicina',
    'Acompanha a saúde das pessoas e famílias, trata o mais comum e encaminha para o especialista.',
    riasec(0.35, 0.85, 0.2, 0.8, 0.3, 0.35),
    'alta',
    MEDICAL,
  ),
  doctor(
    'medico-pediatra',
    'Médico Pediatra',
    'Cuida da saúde das crianças, do nascimento à adolescência.',
    0.3,
    0.25,
    0.9,
  ),
  doctor(
    'medico-ginecologista-obstetra',
    'Médico Ginecologista-Obstetra',
    'Acompanha a saúde da mulher, a gravidez e o parto.',
    0.45,
    0.2,
    0.8,
  ),
  doctor(
    'medico-internista',
    'Médico Internista',
    'Trata as doenças dos adultos que envolvem vários órgãos.',
    0.3,
    0.15,
    0.7,
  ),
  doctor(
    'cirurgiao-geral',
    'Cirurgião Geral',
    'Opera doenças e lesões do abdómen, da pele e dos tecidos.',
    0.6,
    0.2,
    0.55,
  ),
  doctor(
    'medico-intensivista',
    'Médico Intensivista',
    'Trata doentes em estado grave nos cuidados intensivos.',
    0.5,
    0.15,
    0.65,
  ),
  doctor(
    'medico-ortopedista',
    'Médico Ortopedista',
    'Trata ossos, articulações e lesões do movimento.',
    0.65,
    0.2,
    0.6,
  ),
  doctor(
    'medico-radiologista',
    'Médico Radiologista',
    'Lê raios-X, ecografias e TACs para chegar ao diagnóstico.',
    0.45,
    0.25,
    0.4,
  ),
  doctor(
    'medico-anestesista',
    'Médico Anestesista',
    'Adormece e vigia os doentes durante as cirurgias.',
    0.55,
    0.15,
    0.5,
  ),
  doctor(
    'medico-cardiologista',
    'Médico Cardiologista',
    'Trata as doenças do coração e da circulação.',
    0.4,
    0.15,
    0.65,
  ),
  doctor(
    'medico-oftalmologista',
    'Médico Oftalmologista',
    'Trata os olhos e a visão, com consultas e cirurgias.',
    0.55,
    0.2,
    0.6,
  ),
  doctor(
    'medico-psiquiatra',
    'Médico Psiquiatra',
    'Trata as doenças mentais, com conversa e medicamentos.',
    0.15,
    0.4,
    0.9,
  ),
  doctor(
    'medico-neurologista',
    'Médico Neurologista',
    'Trata as doenças do cérebro e dos nervos.',
    0.3,
    0.15,
    0.6,
  ),
  doctor(
    'medico-urologista',
    'Médico Urologista',
    'Trata o aparelho urinário e as suas cirurgias.',
    0.55,
    0.15,
    0.55,
  ),
  doctor(
    'medico-otorrinolaringologista',
    'Médico Otorrinolaringologista',
    'Trata o ouvido, o nariz e a garganta.',
    0.5,
    0.15,
    0.6,
  ),
  doctor(
    'medico-dermatologista',
    'Médico Dermatologista',
    'Trata a pele, o cabelo e as unhas.',
    0.35,
    0.3,
    0.65,
  ),
  summary(
    'medico-saude-publica',
    'Médico de Saúde Pública',
    'saude_publica',
    'Estuda e previne as doenças de uma população: vacinas, surtos e campanhas.',
    riasec(0.25, 0.85, 0.2, 0.75, 0.5, 0.5),
    'media',
    SPECIALIST,
  ),
  summary(
    'enfermeiro',
    'Enfermeiro',
    'enfermagem',
    'Cuida dos doentes todos os dias: tratamentos, medicação e vigilância, com a equipa médica.',
    riasec(0.4, 0.6, 0.2, 0.9, 0.35, 0.45),
    'alta',
    NURSE,
  ),
  summary(
    'tecnico-medio-enfermagem',
    'Técnico Médio de Enfermagem',
    'enfermagem',
    'Presta cuidados de enfermagem depois do curso médio técnico de saúde.',
    riasec(0.45, 0.5, 0.15, 0.85, 0.25, 0.45),
    'media',
    TECHNICAL_NURSE,
  ),
  summary(
    'parteira',
    'Parteira',
    'enfermagem',
    'Acompanha a grávida, faz partos normais e cuida da mãe e do bebé.',
    riasec(0.45, 0.6, 0.2, 0.9, 0.3, 0.4),
    'alta',
    NURSE,
  ),
  summary(
    'enfermeiro-cuidados-intensivos',
    'Enfermeiro de Cuidados Intensivos',
    'enfermagem',
    'Cuida de doentes graves ligados a máquinas, nos cuidados intensivos.',
    riasec(0.5, 0.65, 0.15, 0.8, 0.3, 0.5),
    'media',
    NURSE,
  ),
  summary(
    'instrumentista-cirurgico',
    'Instrumentista Cirúrgico',
    'enfermagem',
    'Prepara e passa os instrumentos ao cirurgião durante a operação.',
    riasec(0.65, 0.5, 0.15, 0.55, 0.2, 0.65),
    'media',
    SPECIALISED_TECHNICAL_NURSE,
  ),
  summary(
    'tecnico-analises-clinicas',
    'Técnico de Análises Clínicas',
    'diagnostico',
    'Faz as análises ao sangue e a outras amostras que ajudam no diagnóstico.',
    riasec(0.55, 0.75, 0.1, 0.3, 0.15, 0.7),
    'media',
    DIAGNOSIS_GRADUATE,
  ),
  summary(
    'tecnico-radiologia',
    'Técnico de Radiologia',
    'diagnostico',
    'Faz raios-X, ecografias e TACs com segurança para o doente.',
    riasec(0.65, 0.6, 0.15, 0.5, 0.15, 0.55),
    'media',
    DIAGNOSIS_GRADUATE,
  ),
  summary(
    'tecnico-anatomia-patologica',
    'Técnico de Anatomia Patológica',
    'diagnostico',
    'Prepara tecidos e células para o patologista ver ao microscópio.',
    riasec(0.6, 0.75, 0.15, 0.2, 0.1, 0.7),
    'baixa',
    DIAGNOSIS_TECHNICIAN,
  ),
  summary(
    'cardiopneumologista',
    'Cardiopneumologista',
    'diagnostico',
    'Faz electrocardiogramas e exames ao coração e aos pulmões.',
    riasec(0.55, 0.75, 0.1, 0.5, 0.15, 0.55),
    'media',
    DIAGNOSIS_GRADUATE,
  ),
  summary(
    'tecnico-electromedicina',
    'Técnico de Electromedicina',
    'diagnostico',
    'Instala e repara os equipamentos dos hospitais: monitores, raios-X, laboratórios.',
    riasec(0.85, 0.6, 0.1, 0.25, 0.2, 0.5),
    'media',
    DIAGNOSIS_GRADUATE,
  ),
  summary(
    'farmaceutico',
    'Farmacêutico',
    'farmacia',
    'Garante que os medicamentos são os certos, seguros e bem usados.',
    riasec(0.3, 0.8, 0.1, 0.55, 0.35, 0.75),
    'media',
    null,
  ),
  summary(
    'tecnico-farmacia',
    'Técnico de Farmácia',
    'farmacia',
    'Prepara e entrega medicamentos e explica às pessoas como os tomar.',
    riasec(0.45, 0.45, 0.1, 0.55, 0.3, 0.8),
    'media',
    null,
  ),
  summary(
    'delegado-informacao-medica',
    'Delegado de Informação Médica',
    'farmacia',
    'Apresenta medicamentos e equipamentos a médicos e farmácias, em nome de uma empresa.',
    riasec(0.15, 0.45, 0.2, 0.6, 0.85, 0.45),
    'media',
    null,
  ),
  summary(
    'fisioterapeuta',
    'Fisioterapeuta',
    'reabilitacao',
    'Ajuda as pessoas a recuperar o movimento depois de lesões, doenças ou cirurgias.',
    riasec(0.55, 0.65, 0.15, 0.85, 0.25, 0.35),
    'media',
    null,
  ),
  summary(
    'nutricionista',
    'Nutricionista',
    'reabilitacao',
    'Planeia a alimentação de pessoas e doentes para melhorar a saúde.',
    riasec(0.25, 0.75, 0.2, 0.75, 0.35, 0.45),
    'media',
    null,
  ),
  summary(
    'ortoprotesico',
    'Ortoprotésico',
    'reabilitacao',
    'Faz e adapta próteses e ortóteses para quem perdeu ou tem dificuldade num membro.',
    riasec(0.8, 0.55, 0.4, 0.55, 0.15, 0.45),
    'baixa',
    null,
  ),
  summary(
    'ortoptista',
    'Ortoptista',
    'reabilitacao',
    'Avalia e trata problemas da visão, como o estrabismo, com o oftalmologista.',
    riasec(0.45, 0.7, 0.15, 0.7, 0.15, 0.5),
    'baixa',
    null,
  ),
  summary(
    'medico-dentista',
    'Médico Dentista',
    'saude_oral',
    'Previne e trata os problemas dos dentes e da boca.',
    riasec(0.65, 0.75, 0.3, 0.6, 0.4, 0.45),
    'media',
    null,
  ),
  summary(
    'tecnico-estomatologia',
    'Técnico de Estomatologia',
    'saude_oral',
    'Apoia o dentista nos tratamentos e cuida da higiene oral dos doentes.',
    riasec(0.65, 0.5, 0.2, 0.6, 0.2, 0.5),
    'baixa',
    null,
  ),
  summary(
    'tecnico-saude-ambiental',
    'Técnico de Saúde Ambiental',
    'saude_publica',
    'Controla água, lixo, mosquitos e alimentos para evitar doenças.',
    riasec(0.6, 0.65, 0.1, 0.45, 0.3, 0.55),
    'media',
    null,
  ),
  summary(
    'tecnico-saude-publica',
    'Técnico de Saúde Pública',
    'saude_publica',
    'Organiza vacinação, rastreios e campanhas de prevenção nas comunidades.',
    riasec(0.35, 0.65, 0.15, 0.8, 0.45, 0.5),
    'media',
    null,
  ),
  summary(
    'psicologo-clinico',
    'Psicólogo Clínico',
    'saude_mental',
    'Avalia e acompanha pessoas com sofrimento psicológico, com consultas e terapia.',
    riasec(0.1, 0.8, 0.45, 0.9, 0.3, 0.35),
    'media',
    null,
  ),
]

/** A health career's summary, for its full guide. */
export function detailedHealthCareer(slug: string): CareerSummary {
  const found = HEALTH_CAREERS.find((career) => career.slug === slug)
  if (!found) throw new Error(`Unknown health career ${slug}`)
  return { ...found, detailed: true }
}
