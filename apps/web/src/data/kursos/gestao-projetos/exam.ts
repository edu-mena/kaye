import type { ExamQuestion } from '../types'

// The final exam's bank: 20 questions are drawn from it each attempt (domain/kursos.ts).
// Only units 1 and 2 are written in this test version, so only they are asked (3 or 4 per lesson).

const c = (id: string, unit: string, prompt: string, options: string[], answer: number): ExamQuestion => ({
  id,
  unit,
  kind: 'choice',
  prompt,
  options,
  answer,
})
const g = (id: string, unit: string, prompt: string, answers: string[]): ExamQuestion => ({
  id,
  unit,
  kind: 'gap',
  prompt,
  answers,
})

const exam: ExamQuestion[] = [
  // U1 L1: projeto ou operação
  c(
    'e01',
    'u1',
    'Qual destes é um projeto?',
    ['Abrir a farmácia todas as manhãs', 'Pintar a escola nas férias', 'Dar aulas de matemática'],
    1,
  ),
  c('e02', 'u1', 'Servir almoços todos os dias na cantina é…', ['um projeto', 'uma operação', 'uma fase'], 1),
  g('e03', 'u1', 'Um projeto é temporário e o seu resultado é ___.', ['único']),
  // U1 L2: o triângulo
  c(
    'e04',
    'u1',
    'Os três lados do triângulo de um projeto são…',
    ['âmbito, prazo e custo', 'equipa, cliente e chefe', 'iniciar, executar e fechar'],
    0,
  ),
  c(
    'e05',
    'u1',
    'O orçamento da feira foi cortado, e a data e as atividades ficam iguais. O que fica em risco?',
    ['O âmbito', 'A qualidade', 'Nada'],
    1,
  ),
  c(
    'e06',
    'u1',
    'A data da campanha foi antecipada. Uma saída possível é…',
    ['juntar mais enfermeiros', 'aumentar o âmbito', 'reduzir a equipa'],
    0,
  ),
  g('e07', 'u1', 'Em inglês, o âmbito de um projeto chama-se ___.', ['scope']),
  // U1 L3: ciclo de vida
  c('e08', 'u1', 'Qual é a primeira fase do ciclo de vida?', ['Planear', 'Iniciar', 'Executar'], 1),
  c(
    'e09',
    'u1',
    'Quando se acompanha o projeto?',
    ['Só no fim', 'Ao mesmo tempo que se executa', 'Só antes de começar'],
    1,
  ),
  c('e10', 'u1', 'Registar as lições aprendidas faz parte de…', ['iniciar', 'executar', 'fechar'], 2),
  // U2 L1: SMART
  c(
    'e11',
    'u2',
    'Qual objetivo é SMART?',
    [
      'Melhorar o bairro.',
      'Vacinar 90% das crianças até 5 anos do bairro em duas semanas.',
      'Vacinar muita gente.',
    ],
    1,
  ),
  c('e12', 'u2', '“Ter 300 visitantes na feira” não tem data. Que letra do SMART falta?', ['S', 'M', 'T'], 2),
  g('e13', 'u2', 'Na regra SMART, o A quer dizer ___.', ['atingível', 'alcançável']),
  // U2 L2: partes interessadas
  c(
    'e14',
    'u2',
    'Os vizinhos da escola, no dia da feira, são…',
    ['partes interessadas', 'a equipa', 'patrocinadores'],
    0,
  ),
  c(
    'e15',
    'u2',
    'Pouco poder e muito interesse: como gerir?',
    ['Gerir de perto', 'Manter informado', 'Manter satisfeito'],
    1,
  ),
  c(
    'e16',
    'u2',
    'Quem planeia, coordena e responde pelo projeto?',
    ['O gestor do projeto', 'O beneficiário', 'O fornecedor'],
    0,
  ),
  g('e17', 'u2', 'Em inglês, partes interessadas diz-se ___.', ['stakeholders', 'stakeholder']),
  // U2 L3: termo de abertura
  c('e18', 'u2', 'Quem aprova o termo de abertura?', ['A equipa', 'O patrocinador', 'Os clientes'], 1),
  c(
    'e19',
    'u2',
    '“A cantina não inclui serviço de jantar” é uma frase sobre…',
    ['o orçamento', 'o âmbito', 'os riscos'],
    1,
  ),
  g('e20', 'u2', 'O documento que autoriza o projeto a começar é o termo de ___.', ['abertura']),
]

export default exam
