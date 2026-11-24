import { defineTopic } from './kit'

// Topic 16: slices. Theme from the Python Programming Wikibook (Lists, Strings); written from scratch.

const list = (values: (number | string)[]) =>
  `[${values.map((value) => (typeof value === 'string' ? `'${value}'` : value)).join(', ')}]`

const WORDS = ['Benguela', 'Huambo', 'Luanda', 'Cabinda', 'Malanje']

export default defineTopic({
  id: 't16',
  intro: [
    'Uma fatia (slice) tira um pedaço de uma lista ou de um texto: sequência[início:fim] dá os elementos do índice início até ao índice fim − 1. O fim nunca entra, como no range.',
    'Podes omitir os extremos: [:3] são os três primeiros, [2:] vai do índice 2 até ao fim, [-2:] são os dois últimos. Com um terceiro número escolhes o passo: [::2] salta de dois em dois e [::-1] inverte. A fatia cria uma cópia: a original não muda.',
  ],
  rule: 'sequência[início:fim:passo]. O fim não entra; extremos em falta querem dizer “desde o princípio” ou “até ao fim”; [::-1] inverte.',
  code: {
    caption: 'Fatias de um texto e de uma lista.',
    lines: [
      'city = "Benguela"',
      'print(city[:3])        # Ben',
      'print(city[3:])        # guela',
      'print(city[::-1])      # aleugneB',
      '',
      'numbers = [10, 20, 30, 40, 50]',
      'print(numbers[1:3])    # [20, 30]',
      'print(numbers[-2:])    # [40, 50]',
      'print(numbers[::2])    # [10, 30, 50]',
    ],
  },
  points: [
    'sequência[início:fim]: o índice fim não entra.',
    '[:n] são os n primeiros; [n:] o resto; [-n:] os n últimos.',
    '[::-1] inverte; a fatia é uma cópia e a original não muda.',
  ],
  quiz: [
    { prompt: 'O que dá "Luanda"[:3]?', options: ['"Lua"', '"Luan"', '"uan"'], answer: 0 },
    { prompt: 'Quantos elementos tem lista[2:5]?', options: ['2', '3', '5'], answer: 1 },
    { prompt: 'O que dá "abc"[::-1]?', options: ['"abc"', '"cba"', '"bca"'], answer: 1 },
  ],
  exercises: [
    (c) => {
      const word = c.pick(WORDS)
      const n = c.int(2, 4)
      return c.out(`print("${word}"[:${n}])`, word.slice(0, n), `Os ${n} primeiros caracteres.`)
    },
    (c) => {
      const word = c.pick(WORDS)
      const n = c.int(2, 4)
      return c.out(`print("${word}"[${n}:])`, word.slice(n), `Do índice ${n} até ao fim.`)
    },
    (c) => {
      const word = c.pick(WORDS)
      return c.out(`print("${word}"[::-1])`, [...word].toReversed().join(''), '[::-1] inverte o texto.')
    },
    (c) => {
      const values = Array.from({ length: 6 }, (_, at) => (at + 1) * c.int(2, 5))
      const start = c.int(0, 2)
      const stop = start + c.int(2, 3)
      return c.out(
        `numbers = ${list(values)}\nprint(numbers[${start}:${stop}])`,
        list(values.slice(start, stop)),
        `Índices ${start} a ${stop - 1}: o ${stop} não entra.`,
      )
    },
    (c) => {
      const values = Array.from({ length: 6 }, () => c.int(1, 50))
      const n = c.int(2, 3)
      return c.out(
        `numbers = ${list(values)}\nprint(numbers[-${n}:])`,
        list(values.slice(-n)),
        `Os ${n} últimos valores.`,
      )
    },
    (c) => {
      const values = Array.from({ length: 6 }, () => c.int(1, 50))
      return c.out(
        `numbers = ${list(values)}\nprint(numbers[::2])`,
        list(values.filter((_, at) => at % 2 === 0)),
        'De dois em dois, a começar no índice 0.',
      )
    },
    (c) => {
      const values = Array.from({ length: 5 }, () => c.int(1, 50))
      return c.out(
        `numbers = ${list(values)}\ncopy = numbers[1:3]\nprint(numbers)`,
        list(values),
        'A fatia é uma cópia: a lista original fica igual.',
      )
    },
    (c) => {
      const a = c.int(0, 3)
      const b = a + c.int(2, 5)
      return c.ask(
        `Quantos elementos tem lista[${a}:${b}]?`,
        String(b - a),
        [String(b - a + 1), String(b - a - 1)],
        `Do índice ${a} ao ${b - 1}: ${b - a} elementos.`,
      )
    },
    (c) => {
      const word = c.pick(WORDS)
      return c.fill(
        `word = "${word}"\nprint(word[:___])   # ${word.slice(0, 3)}`,
        [['3']],
        'Os 3 primeiros caracteres: [:3].',
        'Completa com o número de caracteres a mostrar.',
      )
    },
  ],
})
