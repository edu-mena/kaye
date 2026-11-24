import { defineTopic } from './kit'

// Topic 2: data types. Theme from the Python Programming Wikibook (Data types); written from scratch.

export default defineTopic({
  id: 't02',
  intro: [
    'Cada valor tem um tipo (type), que diz o que se pode fazer com ele. Os números fazem contas; o texto junta-se e repete-se. A função type() diz o tipo de um valor: type(15) é int.',
    'Atenção a duas coisas: nos decimais o Python usa ponto (3.5, não 3,5), e um número entre aspas é texto: "15" não é 15.',
  ],
  rule: 'Os quatro tipos básicos: int (inteiro: 15), float (decimal: 3.5), str (texto: "Lubango") e bool (True ou False, com maiúscula).',
  code: {
    caption: 'type() mostra o tipo de cada valor.',
    lines: [
      "print(type(15))        # <class 'int'>",
      "print(type(3.5))       # <class 'float'>",
      'print(type("15"))      # <class \'str\'>',
      "print(type(True))      # <class 'bool'>",
    ],
  },
  extra: [
    {
      type: 'table',
      caption: 'Valores e tipos',
      head: ['Valor', 'Tipo', 'Porquê'],
      rows: [
        ['42', 'int', 'Número sem parte decimal'],
        ['2.0', 'float', 'Tem ponto decimal, mesmo com .0'],
        ['"42"', 'str', 'Está entre aspas'],
        ['False', 'bool', 'Só True e False'],
      ],
    },
  ],
  points: [
    'Tipos básicos: int, float, str e bool.',
    'Decimais com ponto: 3.5. Qualquer coisa entre aspas é texto.',
    'True e False escrevem-se com maiúscula.',
    'type() diz o tipo de um valor.',
  ],
  quiz: [
    { prompt: 'Qual é o tipo de "2026"?', options: ['int', 'str', 'float'], answer: 1 },
    { prompt: 'Qual é o tipo de 7.0?', options: ['int', 'str', 'float'], answer: 2 },
    {
      prompt: 'Qual é a forma certa de escrever o valor verdadeiro?',
      options: ['true', 'True', '"True"'],
      answer: 1,
    },
  ],
  exercises: [
    (c) => {
      const n = c.int(2, 99)
      return c.out(`print(type(${n}))`, "<class 'int'>", 'Um número sem ponto decimal e sem aspas é int.')
    },
    (c) => {
      const n = c.int(1, 9)
      const d = c.int(1, 9)
      return c.out(`print(type(${n}.${d}))`, "<class 'float'>", 'Um número com ponto decimal é float.')
    },
    (c) => {
      const n = c.int(10, 99)
      return c.out(`print(type("${n}"))`, "<class 'str'>", 'Entre aspas é texto, mesmo que pareça um número.')
    },
    (c) => {
      const value = c.pick([true, false])
      return c.out(
        `print(type(${value ? 'True' : 'False'}))`,
        "<class 'bool'>",
        'True e False são do tipo bool.',
      )
    },
    (c) => {
      const city = c.pick(['Benguela', 'Cabinda', 'Uíge', 'Namibe'])
      return c.ask(`Qual é o tipo de "${city}"?`, 'str', ['int', 'bool'], 'Texto entre aspas é str.')
    },
    (c) => {
      const n = c.int(1, 9)
      return c.ask(`Qual é o tipo de ${n}.5?`, 'float', ['int', 'str'], 'Tem ponto decimal: float.')
    },
    (c) => {
      const n = c.int(10, 99)
      return c.ask(`Qual é o tipo de ${n}?`, 'int', ['str', 'float'], 'Sem aspas e sem ponto: int.')
    },
    (c) =>
      c.ask(
        'Qual é a forma certa de escrever 3,5 em Python?',
        '3.5',
        ['3,5', '"3,5"'],
        'O Python usa ponto nos decimais; 3,5 seria um par de valores.',
      ),
    (c) => {
      const n = c.int(10, 99)
      return c.fill(
        `print(type(___))   # <class 'str'>`,
        [[`"${n}"`, `'${n}'`]],
        'Para o tipo ser str, o valor tem de estar entre aspas.',
        `Completa com o valor ${n} de modo a que o tipo seja texto.`,
      )
    },
  ],
})
