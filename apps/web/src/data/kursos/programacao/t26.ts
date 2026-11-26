import { defineTopic } from './kit'

// Topic 26: mini-project, average of grades. Written from scratch; names and grades are invented.

const NAMES = ['Ana', 'Paulo', 'Luzia', 'Kiala']
const pyFloat = (value: number) => (Number.isInteger(value) ? `${value}.0` : String(value))
const list = (values: number[]) => `[${values.join(', ')}]`

const program = (grades: number[]) =>
  [
    `grades = ${list(grades)}`,
    'total = 0',
    'for grade in grades:',
    '    total += grade',
    'average = total / len(grades)',
    'print(f"Média: {average}")',
    'if average >= 10:',
    '    print("Aprovado")',
    'else:',
    '    print("Reprovado")',
  ].join('\n')

export default defineTopic({
  id: 't26',
  intro: [
    'Primeiro mini-projeto: calcular a média das notas de um aluno e dizer se passou. Junta o que já sabes: uma lista para guardar as notas, um ciclo com acumulador para somar, uma divisão por len() e um if/else para decidir.',
    'Repara no método: lê o problema (entrada: as notas; saída: a média e o resultado), escreve os passos e só depois o código. E repara que o programa não fica preso a 4 notas: com len(grades) funciona com qualquer número.',
  ],
  rule: 'média = soma / len(lista). Ter a nota mínima numa variável (10) em vez de a escrever em vários sítios facilita mudar a regra.',
  code: {
    caption: 'O programa completo (as notas são inventadas).',
    lines: program([12, 15, 9, 14]).split('\n'),
  },
  points: [
    'Lista + ciclo com acumulador + len() dão a média de qualquer número de notas.',
    'A média com / é um float; o if/else decide a partir dela.',
    'Divide o problema em passos antes de programar.',
  ],
  quiz: [
    {
      prompt: 'Como se calcula a média de uma lista grades?',
      options: ['sum(grades) * len(grades)', 'sum(grades) / len(grades)', 'max(grades) / min(grades)'],
      answer: 1,
    },
    {
      prompt: 'Porque se usa len(grades) em vez de escrever 4?',
      options: ['Porque funciona com qualquer número de notas', 'Porque é mais rápido', 'Porque o 4 dá erro'],
      answer: 0,
    },
    {
      prompt: 'Que tipo tem o resultado de total / len(grades)?',
      options: ['int', 'float', 'str'],
      answer: 1,
    },
  ],
  exercises: [
    (c) => {
      const grades = Array.from({ length: 4 }, () => c.int(6, 19))
      const average = grades.reduce((sum, grade) => sum + grade, 0) / 4
      return c.out(
        program(grades),
        `Média: ${pyFloat(average)}\n${average >= 10 ? 'Aprovado' : 'Reprovado'}`,
        `A soma é ${average * 4}; a dividir por 4 dá ${pyFloat(average)}.`,
      )
    },
    (c) => {
      const grades = Array.from({ length: 4 }, () => c.int(6, 19))
      return c.out(
        `grades = ${list(grades)}\nbest = 0\nfor grade in grades:\n    if grade > best:\n        best = grade\nprint(best)`,
        String(Math.max(...grades)),
        'best guarda a maior nota vista até ao momento.',
      )
    },
    (c) => {
      const grades = Array.from({ length: 5 }, () => c.int(5, 18))
      return c.out(
        `grades = ${list(grades)}\ncount = 0\nfor grade in grades:\n    if grade >= 10:\n        count += 1\nprint(count, "de", len(grades))`,
        `${grades.filter((grade) => grade >= 10).length} de 5`,
        'Conta as notas que chegam a 10.',
      )
    },
    (c) => {
      const grades = [c.int(4, 8), c.int(4, 8), c.int(4, 8)]
      const bonus = c.int(2, 4)
      const total = grades.reduce((sum, grade) => sum + grade + bonus, 0)
      return c.out(
        `grades = ${list(grades)}\ntotal = 0\nfor grade in grades:\n    total += grade + ${bonus}\nprint(total)`,
        String(total),
        `Cada nota recebe +${bonus} antes de entrar na soma.`,
      )
    },
    (c) => {
      const name = c.pick(NAMES)
      const grades = Array.from({ length: 2 }, () => c.int(6, 19))
      const average = ((grades[0] ?? 0) + (grades[1] ?? 0)) / 2
      return c.out(
        `name = "${name}"\ngrades = ${list(grades)}\naverage = sum(grades) / len(grades)\nprint(f"{name}: {average}")`,
        `${name}: ${pyFloat(average)}`,
        'A f-string põe o nome e a média; / dá float, por isso aparece .0 se for exata.',
      )
    },
    (c) =>
      c.fill(
        'average = total ___ len(grades)',
        [['/']],
        'A média é o total dividido pelo número de notas.',
        'Completa com o operador que calcula a média.',
      ),
    (c) =>
      c.order(
        'Ordena as linhas para calcular e mostrar a média.',
        ['total = sum(grades)', 'average = total / len(grades)', 'print(average)'],
        'Primeiro a soma, depois a divisão, por fim o resultado.',
      ),
    (c) =>
      c.ask(
        'O que acontece com sum(grades) / len(grades) se a lista estiver vazia?',
        'Dá ZeroDivisionError: len é 0.',
        ['Dá 0.', 'Dá None.'],
        'Dividir por zero levanta erro; convém testar antes se há notas.',
      ),
    (c) =>
      c.decide(
        [
          'A Luzia escreveu average = total / 3, mas hoje o professor lançou 5 notas.',
          'O programa não dá erro, mas a média sai alta de mais.',
        ],
        [
          {
            text: 'Trocar o 3 por len(grades).',
            consequence: 'A média passa a acompanhar o número real de notas: é o que se pretende.',
          },
          {
            text: 'Trocar o 3 por 5.',
            consequence: 'Funciona hoje e volta a falhar amanhã, se as notas forem 4.',
          },
          { text: 'Dividir por 10.', consequence: 'Dá um número sem sentido.' },
        ],
        0,
        'Qual é a correção?',
      ),
  ],
})
