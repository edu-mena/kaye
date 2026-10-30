import type { CareerSummary } from '../types'
import { entry, riasec, summary } from './careerSummary'

// Education, the sixth area of the catalogue (scrapers/catalog/education.json): the professions behind the teacher
// training and sport degrees (MESCTI yearbook 2023-2024), the training of teachers in service and the employers (the
// Ministry of Education and its institutes, schools). Interest profiles approximate O*NET's. Demand reads the job ads
// and the public competitions. Salaries: the State's 2026 base salary on entry to the career with a degree (Decreto
// Presidencial 16/26), only where a table names the career.

/** Primary and secondary school teachers with a degree, on entry (Professor do 6.º Grau), in Kz a month. */
const TEACHER = entry(361_910)
/** Nursery teachers with a degree, on entry (Técnico Superior: Educador de Infância de Nível I do 3.º Grau). */
const NURSERY_TEACHER = entry(410_165)
/** Lecturers on entry (Assistente Estagiário); Decreto Presidencial 17/26 adds a supplementary pay. */
const LECTURER = entry(458_419)
/** Especialista de Administração da Educação on entry (6.º Grau), the pedagogical staff with a degree. */
const EDUCATION_SPECIALIST = entry(361_910)
/** Formador and Especialista de Emprego e Formação on entry, side by side in one table (Técnico Superior de 2.ª
 * Classe). */
const EMPLOYMENT_AND_TRAINING = entry(361_910)

export const EDUCATION_CAREERS: CareerSummary[] = [
  summary(
    'educador-de-infancia',
    'Educador de Infância',
    'ensino_primario',
    'Cuida e ensina as crianças até aos 5 anos, com jogos, histórias e actividades que as preparam para a escola. Trabalha em creches e jardins de infância públicos e privados.',
    riasec(0.3, 0.25, 0.6, 0.95, 0.35, 0.4),
    'media',
    NURSERY_TEACHER,
  ),
  summary(
    'professor-do-ensino-primario',
    'Professor do Ensino Primário',
    'ensino_primario',
    'Ensina a ler, a escrever e a contar e acompanha a mesma turma em todas as disciplinas, da 1.ª à 6.ª classe. Trabalha em escolas públicas, onde se entra por concurso, e em colégios.',
    riasec(0.2, 0.4, 0.45, 0.95, 0.4, 0.55),
    'media',
    TEACHER,
  ),
  summary(
    'professor-de-educacao-especial',
    'Professor de Educação Especial',
    'ensino_primario',
    'Ensina crianças e jovens com deficiência ou dificuldades de aprendizagem, com métodos e materiais próprios. Trabalha em escolas de educação especial e nas escolas comuns, ao lado dos outros professores.',
    riasec(0.2, 0.5, 0.45, 0.95, 0.3, 0.5),
    'baixa',
    TEACHER,
  ),
  summary(
    'professor-de-matematica',
    'Professor de Matemática',
    'ensino_secundario',
    'Ensina matemática no I e no II ciclo do ensino secundário: prepara as aulas, corrige os testes e acompanha os alunos com mais dificuldades. Trabalha em escolas públicas e colégios.',
    riasec(0.15, 0.8, 0.2, 0.8, 0.35, 0.6),
    'media',
    TEACHER,
  ),
  summary(
    'professor-de-lingua-portuguesa',
    'Professor de Língua Portuguesa',
    'ensino_secundario',
    'Ensina a língua portuguesa e a literatura: a leitura, a escrita e a gramática. Trabalha em escolas públicas e colégios, do ensino primário ao secundário.',
    riasec(0.05, 0.55, 0.6, 0.85, 0.35, 0.5),
    'media',
    TEACHER,
  ),
  summary(
    'professor-de-linguas-estrangeiras',
    'Professor de Inglês ou Francês',
    'ensino_secundario',
    'Ensina inglês ou francês nas escolas e nos centros de línguas, a crianças, jovens e adultos. Trabalha em escolas públicas, colégios e centros de línguas.',
    riasec(0.05, 0.45, 0.6, 0.85, 0.45, 0.45),
    'media',
    TEACHER,
  ),
  summary(
    'professor-de-biologia',
    'Professor de Biologia',
    'ensino_secundario',
    'Ensina biologia no ensino secundário, com aulas práticas no laboratório e no campo. Trabalha em escolas públicas e colégios.',
    riasec(0.3, 0.8, 0.25, 0.8, 0.3, 0.5),
    'media',
    TEACHER,
  ),
  summary(
    'professor-de-quimica',
    'Professor de Química',
    'ensino_secundario',
    'Ensina química no ensino secundário e nos institutos médios, com experiências no laboratório. Trabalha em escolas públicas, colégios e institutos técnicos.',
    riasec(0.35, 0.85, 0.15, 0.75, 0.3, 0.6),
    'media',
    TEACHER,
  ),
  summary(
    'professor-de-fisica',
    'Professor de Física',
    'ensino_secundario',
    'Ensina física no ensino secundário e nos institutos médios, das forças à electricidade. Trabalha em escolas públicas, colégios e institutos técnicos.',
    riasec(0.35, 0.85, 0.2, 0.75, 0.3, 0.55),
    'media',
    TEACHER,
  ),
  summary(
    'professor-de-historia',
    'Professor de História',
    'ensino_secundario',
    'Ensina a história de Angola, de África e do mundo no ensino secundário. Trabalha em escolas públicas e colégios.',
    riasec(0.05, 0.7, 0.45, 0.8, 0.35, 0.45),
    'baixa',
    TEACHER,
  ),
  summary(
    'professor-de-geografia',
    'Professor de Geografia',
    'ensino_secundario',
    'Ensina o território, a população, o clima e os recursos de Angola e do mundo no ensino secundário. Trabalha em escolas públicas e colégios.',
    riasec(0.2, 0.7, 0.3, 0.8, 0.35, 0.5),
    'baixa',
    TEACHER,
  ),
  summary(
    'professor-de-filosofia',
    'Professor de Filosofia e Ciências Sociais',
    'ensino_secundario',
    'Ensina filosofia, sociologia, psicologia ou educação moral e cívica no ensino secundário e nas escolas de formação de professores. Trabalha em escolas públicas e colégios.',
    riasec(0.05, 0.75, 0.45, 0.8, 0.35, 0.4),
    'baixa',
    TEACHER,
  ),
  summary(
    'professor-de-informatica',
    'Professor de Informática',
    'ensino_secundario',
    'Ensina a usar o computador, a programar e a trabalhar com redes no ensino secundário e nos institutos médios. Trabalha em escolas públicas, colégios e institutos técnicos.',
    riasec(0.4, 0.7, 0.3, 0.75, 0.35, 0.55),
    'media',
    TEACHER,
  ),
  summary(
    'professor-do-ensino-tecnico',
    'Professor do Ensino Técnico-Profissional',
    'ensino_secundario',
    'Ensina uma profissão nos institutos médios: agropecuária, alimentação, gestão e outras, com aulas práticas e estágios. Trabalha em institutos médios técnicos públicos e privados.',
    riasec(0.55, 0.55, 0.15, 0.75, 0.4, 0.55),
    'baixa',
    TEACHER,
  ),
  summary(
    'pedagogo',
    'Pedagogo',
    'pedagogia',
    'Prepara os programas, os manuais e os métodos de ensino e ajuda os professores a melhorar as aulas. Trabalha em escolas, nas direcções de educação e nos institutos do Ministério da Educação.',
    riasec(0.1, 0.7, 0.45, 0.8, 0.45, 0.55),
    'baixa',
    null,
  ),
  summary(
    'especialista-de-administracao-da-educacao',
    'Especialista de Administração da Educação',
    'pedagogia',
    'Planeia e acompanha a rede escolar: as escolas, os professores, as matrículas e os resultados. Trabalha nas direcções provinciais e municipais de educação e no Ministério da Educação.',
    riasec(0.1, 0.55, 0.1, 0.55, 0.6, 0.8),
    'baixa',
    EDUCATION_SPECIALIST,
  ),
  summary(
    'director-escolar',
    'Director Escolar',
    'pedagogia',
    'Dirige uma escola: os professores, os horários, as contas e a relação com as famílias. Chega-se ao cargo com anos de ensino, por nomeação ou concurso.',
    riasec(0.15, 0.4, 0.15, 0.75, 0.85, 0.7),
    'baixa',
    null,
  ),
  summary(
    'docente-do-ensino-superior',
    'Docente do Ensino Superior',
    'ensino_superior',
    'Dá aulas numa universidade ou instituto superior, orienta trabalhos de fim de curso e faz investigação. Começa como assistente estagiário, normalmente depois de um mestrado.',
    riasec(0.1, 0.85, 0.4, 0.75, 0.4, 0.45),
    'media',
    LECTURER,
  ),
  summary(
    'formador-profissional',
    'Formador Profissional',
    'ensino_superior',
    'Ensina uma profissão a jovens e adultos em cursos curtos e práticos. Trabalha em centros de formação profissional, públicos e privados, e nas empresas.',
    riasec(0.45, 0.4, 0.25, 0.85, 0.5, 0.45),
    'media',
    EMPLOYMENT_AND_TRAINING,
  ),
  summary(
    'tecnico-de-emprego-e-formacao',
    'Técnico de Emprego e Formação Profissional',
    'ensino_superior',
    'Ajuda quem procura emprego, organiza cursos de formação e acompanha os estágios nas empresas. Trabalha nos centros de emprego e de formação do Estado.',
    riasec(0.1, 0.4, 0.15, 0.85, 0.55, 0.7),
    'baixa',
    EMPLOYMENT_AND_TRAINING,
  ),
  summary(
    'professor-de-educacao-fisica',
    'Professor de Educação Física',
    'desporto',
    'Dá as aulas de educação física e organiza o desporto escolar. Trabalha em escolas públicas e privadas, onde se entra por concurso ou contrato.',
    riasec(0.6, 0.25, 0.2, 0.9, 0.5, 0.35),
    'media',
    TEACHER,
  ),
  summary(
    'treinador-desportivo',
    'Treinador Desportivo',
    'desporto',
    'Prepara atletas e equipas, planeia os treinos e dirige-os nos jogos e nas provas. Trabalha em clubes, federações e escolas de formação.',
    riasec(0.6, 0.35, 0.15, 0.75, 0.7, 0.3),
    'baixa',
    null,
  ),
  summary(
    'preparador-fisico',
    'Preparador Físico',
    'desporto',
    'Planeia o treino físico de atletas e de quem quer ganhar forma, e ajuda a recuperar de lesões. Trabalha em clubes, ginásios e por conta própria.',
    riasec(0.7, 0.5, 0.1, 0.7, 0.45, 0.35),
    'baixa',
    null,
  ),
  summary(
    'gestor-desportivo',
    'Gestor Desportivo',
    'desporto',
    'Gere clubes, ginásios, pavilhões e eventos desportivos: as equipas, as contas e os patrocínios. Trabalha em clubes, federações, empresas e no Estado.',
    riasec(0.25, 0.3, 0.15, 0.55, 0.85, 0.6),
    'baixa',
    null,
  ),
]
