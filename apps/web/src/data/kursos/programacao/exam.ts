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
  // U1 L1: algoritmo
  c(
    'e01',
    'u1',
    'Um algoritmo é…',
    ['uma sequência finita de passos precisos', 'um tipo de computador', 'uma rede social'],
    0,
  ),
  c(
    'e02',
    'u1',
    'Qual destes passos é preciso?',
    ['Espera um pouco', 'Espera 10 minutos', 'Espera o que achares'],
    1,
  ),
  g('e03', 'u1', 'Em inglês, algoritmo diz-se ___.', ['algorithm']),
  // U1 L2: programas e Python
  c(
    'e04',
    'u1',
    'Um programa é…',
    ['um algoritmo escrito numa linguagem de programação', 'um ecrã', 'um erro'],
    0,
  ),
  c(
    'e05',
    'u1',
    'O que faz o interpretador do Python?',
    ['Desenha o ecrã', 'Lê e executa o código linha a linha', 'Traduz para português'],
    1,
  ),
  c(
    'e06',
    'u1',
    'Onde podes praticar Python sem instalar nada?',
    ['Num editor de Python online', 'Só num computador da escola', 'Em lado nenhum'],
    0,
  ),
  // U1 L3: print
  c('e07', 'u1', 'O que imprime print(6 + 4)?', ['6 + 4', '10', '64'], 1),
  c('e08', 'u1', 'O que imprime print("6 + 4")?', ['6 + 4', '10', 'Erro'], 0),
  c('e09', 'u1', 'O que imprime print("Nota:", 17)?', ['Nota:17', 'Nota: 17', 'Nota, 17'], 1),
  g('e10', 'u1', 'Em Python, um comentário começa com o símbolo ___.', ['#', 'cardinal']),
  // U2 L1: variáveis
  c('e11', 'u2', 'Qual destes nomes de variável é válido?', ['meal price', 'meal_price', '1meal'], 1),
  c('e12', 'u2', 'x = 3, depois x = x + 2. Quanto vale x?', ['3', '5', '32'], 1),
  g('e13', 'u2', 'Em Python, para guardar um valor numa variável usa-se o sinal ___.', ['=', 'igual']),
  // U2 L2: tipos e operações
  c('e14', 'u2', 'O que imprime print("4" + "4")?', ['8', '44', 'Erro'], 1),
  c('e15', 'u2', 'O que imprime print(8 / 2)?', ['4', '4.0', '4,0'], 1),
  c('e16', 'u2', 'O que imprime print(11 % 3)?', ['2', '3', '3.6'], 0),
  c('e17', 'u2', 'Qual é o tipo de "Cabinda"?', ['int', 'str', 'bool'], 1),
  // U2 L3: input e conversões
  c('e18', 'u2', 'Que tipo devolve sempre input()?', ['str', 'int', 'float'], 0),
  c('e19', 'u2', 'O que dá int("12") + 8?', ['128', '20', 'Erro'], 1),
  c('e20', 'u2', 'O que acontece com int("doze")?', ['Dá 12', 'Dá erro ValueError', 'Dá "doze"'], 1),
  g('e21', 'u2', 'Para converter o texto "1.5" no decimal 1.5 usa-se a função ___.', ['float', 'float()']),
]

export default exam
