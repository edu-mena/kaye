import { defineTopic, py } from './kit'

// Topic 3: arithmetic operators. Theme from the Python Programming Wikibook (Numbers); written from scratch.

export default defineTopic({
  id: 't03',
  intro: [
    'O Python faz contas com operadores. A divisão / dá sempre um decimal (float), mesmo quando é exata: 10 / 2 é 5.0. A divisão inteira // dá só a parte inteira e o resto % dá o que sobra. Com 17 // 5 = 3 e 17 % 5 = 2 sabes que em 17 cabem 3 grupos de 5 e sobram 2.',
    'O resto é muito usado: um número é par quando n % 2 é 0, e os minutos de uma hora depois de contar em segundos saem com %.',
  ],
  rule: '+ soma, - subtrai, * multiplica, / divide (dá float), // divisão inteira, % resto, ** potência.',
  code: {
    caption: 'Os operadores com 17 e 5.',
    lines: [
      'print(17 + 5)    # 22',
      'print(17 - 5)    # 12',
      'print(17 * 5)    # 85',
      'print(17 / 5)    # 3.4',
      'print(17 // 5)   # 3',
      'print(17 % 5)    # 2',
      'print(2 ** 4)    # 16',
    ],
  },
  points: [
    '/ dá sempre float; // dá a parte inteira; % dá o resto.',
    '** é a potência: 2 ** 3 é 8.',
    'n % 2 == 0 diz que n é par.',
    'Os operadores trabalham com variáveis do mesmo modo que com números.',
  ],
  quiz: [
    { prompt: 'O que imprime print(9 // 2)?', options: ['4.5', '4', '1'], answer: 1 },
    { prompt: 'O que imprime print(9 % 2)?', options: ['4', '1', '0'], answer: 1 },
    { prompt: 'O que imprime print(10 / 2)?', options: ['5', '5.0', '2'], answer: 1 },
  ],
  exercises: [
    (c) => {
      const a = c.int(10, 99)
      const b = c.int(2, 9)
      return c.out(
        `print(${a} // ${b})`,
        String(py.floor(a, b)),
        `${a} // ${b} é a parte inteira de ${a} ÷ ${b}.`,
      )
    },
    (c) => {
      const a = c.int(10, 99)
      const b = c.int(2, 9)
      return c.out(`print(${a} % ${b})`, String(py.mod(a, b)), `O resto de ${a} dividido por ${b}.`)
    },
    (c) => {
      const b = c.int(2, 9)
      const a = b * c.int(2, 9)
      return c.out(`print(${a} / ${b})`, py.div(a, b), 'A divisão / dá sempre float, mesmo quando é exata.')
    },
    (c) => {
      const base = c.int(2, 9)
      const exp = c.int(2, 4)
      return c.out(
        `print(${base} ** ${exp})`,
        String(base ** exp),
        `${base} multiplicado por si mesmo ${exp} vezes.`,
      )
    },
    (c) => {
      const a = c.int(10, 50)
      const b = c.int(2, 9)
      return c.out(
        `x = ${a}\ny = ${b}\nprint(x + y, x * y)`,
        `${a + b} ${a * b}`,
        'Cada expressão do print calcula-se e os resultados saem com um espaço.',
      )
    },
    (c) => {
      const minutes = c.int(130, 400)
      return c.out(
        `total = ${minutes}\nprint(total // 60, total % 60)`,
        `${py.floor(minutes, 60)} ${py.mod(minutes, 60)}`,
        `${minutes} minutos são ${py.floor(minutes, 60)} horas e ${py.mod(minutes, 60)} minutos.`,
      )
    },
    (c) => {
      const n = c.int(11, 99)
      const even = n % 2 === 0
      return c.ask(
        `${n} é par ou ímpar, segundo ${n} % 2?`,
        even ? 'Par: o resto é 0.' : 'Ímpar: o resto é 1.',
        [even ? 'Ímpar: o resto é 1.' : 'Par: o resto é 0.', 'Nenhum dos dois: o resto é 2.'],
        `${n} % 2 dá ${n % 2}.`,
      )
    },
    (c) =>
      c.ask(
        'Qual operador dá o resto de uma divisão?',
        '%',
        ['//', '/'],
        '% dá o resto; // dá a parte inteira; / dá o resultado decimal.',
      ),
    (c) => {
      const a = c.int(7, 40)
      return c.fill(
        `print(${a} ___ 2)   # ${py.floor(a, 2)}`,
        [['//']],
        'A divisão inteira // devolve só a parte inteira.',
        `Completa para imprimir a parte inteira de ${a} a dividir por 2.`,
      )
    },
  ],
})
