import type { Academy, SourceLink } from '../types'

// Public mid-level institutes in Luanda that the press names among the most sought after (docs/recolha-de-dados.md,
// "Institutos médios de Luanda"). Only what the articles say: no courses until a decree or the school confirms them.

const EXPANSAO_2024: SourceLink = {
  label: 'Expansão, 27/07/2024',
  url: 'https://expansao.co.ao/angola/detalhe/funcionarios-das-escolas-publicas-micham-ate-400-mil-kz-para-garantir-vagas-62314.html',
}
const EXPANSAO_2025: SourceLink = {
  label: 'Expansão, 16/08/2025',
  url: 'https://expansao.co.ao/angola/detalhe/apenas-1-em-cada-5-inscritos-vai-entrar-no-ensino-medio-tecnico-profissional-66860.html',
}
const SOUGHT = 'A Expansão (2024) põe-no entre as escolas públicas mais procuradas de Luanda.'
const ACCESS =
  'As inscrições das escolas públicas fazem-se no portal do INFQE, no fim de julho, e há prova de acesso.'
/** In 2024 the press reported places sold for money ("micha"): a vacancy is never paid for. */
const NO_MICHA = 'Uma vaga numa escola pública não se paga: se te pedirem dinheiro, recusa e denuncia.'

const school = (
  id: string,
  name: string,
  place: string,
  summary: string,
  sources: SourceLink[],
): Academy => ({
  id,
  name,
  type: 'instituto_medio',
  ownership: 'publica',
  province: 'Luanda',
  place,
  summary: `${summary} ${ACCESS} ${NO_MICHA}`,
  offers: [],
  sources,
})

export const LUANDA_MIDDLE_SCHOOLS: Academy[] = [
  school(
    'instituto-medio-industrial-de-luanda',
    'Instituto Médio Industrial de Luanda (IMIL)',
    'Luanda',
    `Instituto médio público de cursos industriais. ${SOUGHT}`,
    [EXPANSAO_2024],
  ),
  school(
    'instituto-medio-politecnico-industrial-de-luanda',
    'Instituto Médio Politécnico Industrial de Luanda (IMPIL)',
    'Luanda',
    'Instituto médio público. Em 2025 abriu 1200 vagas para 6200 candidatos, mais de 5 por vaga, e saiu a nota da prova no próprio dia.',
    [EXPANSAO_2025],
  ),
  school(
    'instituto-medio-politecnico-do-kilamba-kiaxi',
    'Instituto Médio Politécnico do Kilamba Kiaxi',
    'Kilamba Kiaxi, Luanda',
    'Instituto médio público. Em 2025 abriu 540 vagas para 2193 candidatos.',
    [EXPANSAO_2025],
  ),
  school(
    'instituto-medio-de-administracao-e-gestao-do-kilamba-kiaxi',
    'Instituto Médio de Administração e Gestão do Kilamba Kiaxi',
    'Kilamba Kiaxi, Luanda',
    'Instituto médio público de administração e gestão. Em 2025 abriu 490 vagas para 2143 candidatos.',
    [EXPANSAO_2025],
  ),
  school(
    'instituto-medio-de-economia-de-luanda',
    'Instituto Médio de Economia de Luanda (IMEL)',
    'Luanda',
    `Instituto médio público de economia: a imprensa fala dos cursos de Contabilidade e de Gestão Empresarial. ${SOUGHT}`,
    [EXPANSAO_2024, EXPANSAO_2025],
  ),
  school(
    'instituto-medio-comercial-de-luanda',
    'Instituto Médio Comercial de Luanda (IMCL)',
    'Luanda',
    `Instituto médio público da área comercial. ${SOUGHT}`,
    [EXPANSAO_2024],
  ),
  school(
    'instituto-medio-politecnico-alda-lara',
    'Instituto Médio Politécnico Alda Lara',
    'Luanda',
    `Instituto médio politécnico público. ${SOUGHT}`,
    [EXPANSAO_2024],
  ),
]
