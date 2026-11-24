import { defineTopic } from './kit'

// Topic 11: the for loop and range. Theme from the Python Programming Wikibook (For loops); written from scratch.

const range = (start: number, stop: number, step = 1) => {
  const values: number[] = []
  for (let value = start; value < stop; value += step) values.push(value)
  return values
}

export default defineTopic({
  id: 't11',
  intro: [
    'O ciclo for repete um bloco para cada valor de uma sequência. range(n) dá os números de 0 a n − 1; range(a, b) vai de a a b − 1; range(a, b, passo) salta de passo em passo. O último valor nunca entra.',
    'Um uso muito comum é o acumulador: uma variável que começa em 0 antes do ciclo e vai crescendo com +=. No fim tens a soma, a contagem ou o total.',
  ],
  rule: 'for i in range(a, b): corre o bloco com i = a, a+1, …, b-1. O bloco tem avanço de 4 espaços. Um acumulador (total = 0) fica antes do ciclo.',
  code: {
    caption: 'Contar e somar.',
    lines: [
      'for i in range(3):',
      '    print(i)            # 0, 1, 2',
      '',
      'total = 0',
      'for i in range(1, 5):   # 1, 2, 3, 4',
      '    total += i',
      'print(total)            # 10',
    ],
  },
  points: [
    'range(n) vai de 0 a n-1; o valor final nunca entra.',
    'range(a, b, passo) escolhe o início, o fim e o salto.',
    'Um acumulador começa fora do ciclo e cresce com +=.',
  ],
  quiz: [
    { prompt: 'Que números dá range(3)?', options: ['1, 2, 3', '0, 1, 2', '0, 1, 2, 3'], answer: 1 },
    { prompt: 'Quantas vezes corre o bloco de for i in range(2, 7)?', options: ['4', '5', '6'], answer: 1 },
    {
      prompt: 'Onde se põe total = 0 num acumulador?',
      options: ['Antes do ciclo', 'Dentro do ciclo', 'Depois do ciclo'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const n = c.int(2, 5)
      return c.out(
        `for i in range(${n}):\n    print(i)`,
        range(0, n).join('\n'),
        `range(${n}) dá de 0 a ${n - 1}.`,
      )
    },
    (c) => {
      const start = c.int(1, 5)
      const stop = start + c.int(2, 4)
      return c.out(
        `for i in range(${start}, ${stop}):\n    print(i)`,
        range(start, stop).join('\n'),
        `Começa em ${start} e pára antes de ${stop}.`,
      )
    },
    (c) => {
      const n = c.int(3, 10)
      return c.out(
        `total = 0\nfor i in range(1, ${n + 1}):\n    total += i\nprint(total)`,
        String((n * (n + 1)) / 2),
        `Soma de 1 até ${n}.`,
      )
    },
    (c) => {
      const step = c.int(2, 4)
      const stop = c.int(8, 14)
      return c.out(
        `for i in range(0, ${stop}, ${step}):\n    print(i)`,
        range(0, stop, step).join('\n'),
        `De ${step} em ${step}, sempre abaixo de ${stop}.`,
      )
    },
    (c) => {
      const stop = c.int(8, 15)
      return c.out(
        `count = 0\nfor i in range(${stop}):\n    if i % 2 == 0:\n        count += 1\nprint(count)`,
        String(range(0, stop).filter((value) => value % 2 === 0).length),
        'Conta os números pares de 0 até ao último valor do range.',
      )
    },
    (c) => {
      const word = c.pick(['Kayé', 'casa', 'sol', 'Lubango'])
      return c.out(
        `for letter in "${word}":\n    print(letter)`,
        [...word].join('\n'),
        'Um for percorre um texto caracter a caracter.',
      )
    },
    (c) => {
      const a = c.int(1, 5)
      const b = a + c.int(3, 8)
      return c.ask(
        `Quantas vezes corre o bloco de for i in range(${a}, ${b})?`,
        String(b - a),
        [String(b - a + 1), String(b - a - 1)],
        `range(${a}, ${b}) tem ${b - a} valores: o ${b} não entra.`,
      )
    },
    (c) => {
      const n = c.int(3, 8)
      return c.fill(
        `for i in ___(${n}):\n    print(i)`,
        [['range']],
        'range() gera a sequência de números.',
        `Completa para repetir ${n} vezes.`,
      )
    },
    (c) => {
      const n = c.int(3, 6)
      return c.order(
        'Ordena as linhas para somar os números de 1 a n.',
        ['total = 0', `for i in range(1, ${n + 1}):`, '    total += i', 'print(total)'],
        'O acumulador começa antes do ciclo e o print vem depois.',
      )
    },
  ],
})
