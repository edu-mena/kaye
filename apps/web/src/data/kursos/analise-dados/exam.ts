import type { ExamQuestion } from '../types'

// The final exam's bank: 20 questions are drawn from it each attempt (domain/kursos.ts).
// Only units 1 and 2 are written in this test version, so only they are asked (3 or 4 per lesson).
// All data in the questions is invented.

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
  // U1 L1: dados e informação
  c('e01', 'u1', '“8, 12, 15, 10” (notas soltas) são…', ['dados', 'informação', 'uma variável'], 0),
  c(
    'e02',
    'u1',
    '“A turma fictícia teve média de 11 no trimestre” é…',
    ['dados', 'informação', 'uma célula'],
    1,
  ),
  g('e03', 'u1', 'Em inglês, informação diz-se ___.', ['information']),
  // U1 L2: a tabela
  c('e04', 'u1', 'Numa tabela arrumada, cada coluna é…', ['um registo', 'uma variável', 'um gráfico'], 1),
  c(
    'e05',
    'u1',
    'Qual destas células está bem preenchida na coluna “Quantidade”?',
    ['3', '3 sumos', '3 sumos, 750 Kz'],
    0,
  ),
  g('e06', 'u1', 'Uma tabela com 30 alunos (um por linha) tem ___ registos.', ['30', 'trinta']),
  // U1 L3: tipos de variáveis
  c('e07', 'u1', 'O número de irmãos é uma variável…', ['discreta', 'contínua', 'nominal'], 0),
  c(
    'e08',
    'u1',
    'O meio de transporte (táxi, a pé, carro) é uma variável…',
    ['contínua', 'nominal', 'ordinal'],
    1,
  ),
  c('e09', 'u1', 'O número de telefone deve ser tratado como…', ['numérico', 'categórico', 'contínuo'], 1),
  c(
    'e10',
    'u1',
    '“Fraco, suficiente, bom, muito bom” é uma variável…',
    ['ordinal', 'nominal', 'discreta'],
    0,
  ),
  // U2 L1: recolher bem
  c(
    'e11',
    'u2',
    'Queres saber a opinião de todos os alunos da escola. Todos os alunos são…',
    ['a amostra', 'a população', 'o viés'],
    1,
  ),
  c(
    'e12',
    'u2',
    'Qual destas amostras tem menos viés?',
    ['Os teus amigos', 'Alunos sorteados de todas as turmas', 'Quem responde na página da escola'],
    1,
  ),
  g('e13', 'u2', 'A parte da população a quem fazes as perguntas é a ___.', ['amostra']),
  // U2 L2: erros comuns e duplicados
  c(
    'e14',
    'u2',
    'Uma idade está em branco. O que não deves fazer?',
    ['Deixar vazia', 'Pôr 0', 'Contar quantas faltam'],
    1,
  ),
  c(
    'e15',
    'u2',
    '“luanda”, “Luanda” e “LUANDA” na mesma coluna são um problema de…',
    ['grafia', 'duplicado', 'data'],
    0,
  ),
  g('e16', 'u2', 'Uma lista tem 50 linhas e 5 duplicados. Ficam ___ registos únicos.', [
    '45',
    'quarenta e cinco',
  ]),
  c(
    'e17',
    'u2',
    'Antes de limpar dados, deves…',
    ['guardar uma cópia dos originais', 'apagar as linhas vazias', 'ordenar por data'],
    0,
  ),
  // U2 L3: formatos de data e de Kz
  c('e18', 'u2', 'Que formato de data não se confunde?', ['03/04/26', '2026-04-03', '3/4'], 1),
  c(
    'e19',
    'u2',
    'Na coluna “Preço (Kz)”, como se escreve mil e duzentos kwanzas?',
    ['1.200 Kz', '1200', 'mil e duzentos'],
    1,
  ),
  g('e20', 'u2', '“1.000 Kz” + “2 500” + “500”, depois de limpos, somam ___ Kz.', ['4000', '4 000', '4.000']),
  c(
    'e21',
    'u2',
    'Porque é que a célula “750 Kz” não entra numa soma?',
    ['Porque é texto', 'Porque é pequena', 'Porque não tem vírgula'],
    0,
  ),
]

export default exam
