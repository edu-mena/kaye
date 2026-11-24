import { defineTopic } from './kit'

// Topic 8: comparisons and logic. Theme from the Python Programming Wikibook (Boolean expressions); written from scratch.

const py = (value: boolean) => (value ? 'True' : 'False')

export default defineTopic({
  id: 't08',
  intro: [
    'Uma comparação dá sempre True ou False (o tipo bool). Os operadores são == (igual), != (diferente), <, >, <= e >=. Atenção: = guarda um valor e == compara dois.',
    'Podes combinar resultados com and (os dois têm de ser verdadeiros), or (basta um) e not (inverte). 5 > 3 and 2 > 4 dá False; 5 > 3 or 2 > 4 dá True.',
  ],
  rule: '== compara, = guarda. a and b só é True se ambos forem True; a or b é True se pelo menos um for; not inverte. Comparar texto distingue maiúsculas: "Ana" == "ana" é False.',
  code: {
    caption: 'Comparar e combinar.',
    lines: [
      'age = 17',
      'print(age >= 18)                 # False',
      'print(age == 17)                 # True',
      'print(age > 14 and age < 18)     # True',
      'print(not (age > 14))            # False',
    ],
  },
  points: [
    'Uma comparação dá True ou False.',
    '== compara; = guarda.',
    'and exige os dois; or exige um; not inverte.',
  ],
  quiz: [
    {
      prompt: 'Qual é o operador que verifica se dois valores são iguais?',
      options: ['=', '==', '=>'],
      answer: 1,
    },
    { prompt: 'O que imprime print(5 > 3 and 2 > 4)?', options: ['True', 'False', 'Erro'], answer: 1 },
    { prompt: 'O que imprime print("Ana" == "ana")?', options: ['True', 'False', 'Erro'], answer: 1 },
  ],
  exercises: [
    (c) => {
      const a = c.int(1, 20)
      const b = c.int(1, 20)
      return c.out(
        `print(${a} > ${b})`,
        py(a > b),
        `${a} é ${a > b ? 'maior' : 'menor ou igual'} do que ${b}.`,
      )
    },
    (c) => {
      const a = c.int(1, 9)
      const b = c.pick([a, a + 1])
      return c.out(`print(${a} == ${b})`, py(a === b), '== compara os dois valores.')
    },
    (c) => {
      const a = c.int(1, 9)
      const b = c.pick([a, a + 2])
      return c.out(`print(${a} != ${b})`, py(a !== b), '!= é True quando os valores são diferentes.')
    },
    (c) => {
      const age = c.int(12, 25)
      return c.out(
        `age = ${age}\nprint(age >= 14 and age <= 17)`,
        py(age >= 14 && age <= 17),
        'Os dois testes têm de ser verdadeiros.',
      )
    },
    (c) => {
      const n = c.int(1, 30)
      return c.out(
        `n = ${n}\nprint(n % 2 == 0 or n > 20)`,
        py(n % 2 === 0 || n > 20),
        'Basta um dos testes ser verdadeiro.',
      )
    },
    (c) => {
      const n = c.int(1, 20)
      return c.out(`print(not ${n} > 10)`, py(!(n > 10)), 'not inverte o resultado de n > 10.')
    },
    (c) => {
      const word = c.pick(['Luanda', 'Huambo', 'Kayé'])
      return c.out(
        `print("${word}" == "${word.toLowerCase()}")`,
        'False',
        'Maiúsculas e minúsculas são caracteres diferentes.',
      )
    },
    (c) =>
      c.ask(
        'Qual é a diferença entre = e ==?',
        '= guarda um valor; == compara dois valores.',
        ['= compara; == guarda.', 'Não há diferença.'],
        'Atribuir e comparar são coisas diferentes.',
      ),
    (c) => {
      const age = c.int(18, 29)
      return c.fill(
        `age = ${age}\nprint(age ___ 18)   # True se tem 18 anos ou mais`,
        [['>=']],
        'Pelo menos 18 escreve-se >=, que inclui o próprio 18.',
        'Completa com o operador que verifica se age é pelo menos 18.',
      )
    },
  ],
})
