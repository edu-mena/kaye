import { defineTopic } from './kit'

// Topic 5: strings. Theme from the Python Programming Wikibook (Strings); written from scratch.

const WORDS = ['Luanda', 'Huambo', 'Kayé', 'Python', 'escola', 'trabalho', 'Angola']

export default defineTopic({
  id: 't05',
  intro: [
    'Um texto (string) é uma sequência de caracteres entre aspas. Com + juntas dois textos, com * repetes um texto, e len() diz quantos caracteres tem (os espaços contam).',
    'Cada caracter tem um índice (index), a contar desde 0: em "Luanda", o índice 0 é "L" e o último é o índice len − 1, ou −1. Um índice fora do texto dá o erro IndexError.',
  ],
  rule: 'texto[0] é o primeiro caracter; texto[-1] é o último; len(texto) conta os caracteres. "a" + "b" junta; "a" * 3 repete.',
  code: {
    caption: 'Juntar, repetir, medir e escolher um caracter.',
    lines: [
      'city = "Luanda"',
      'print(city + "!")      # Luanda!',
      'print(city * 2)        # LuandaLuanda',
      'print(len(city))       # 6',
      'print(city[0])         # L',
      'print(city[-1])        # a',
    ],
  },
  points: [
    '+ junta textos e * repete-os; só se juntam textos com textos.',
    'len() conta os caracteres, incluindo espaços.',
    'Os índices começam em 0; -1 é o último caracter.',
  ],
  quiz: [
    { prompt: 'O que imprime print(len("Kayé"))?', options: ['3', '4', '5'], answer: 1 },
    { prompt: 'Com word = "escola", qual é o valor de word[0]?', options: ['"e"', '"a"', '"s"'], answer: 0 },
    { prompt: 'O que imprime print("ha" * 3)?', options: ['hahaha', 'ha3', 'Erro'], answer: 0 },
  ],
  exercises: [
    (c) => {
      const word = c.pick(WORDS)
      return c.out(`print(len("${word}"))`, String([...word].length), 'len() conta os caracteres.')
    },
    (c) => {
      const word = c.pick(WORDS)
      const i = c.int(0, [...word].length - 1)
      return c.out(
        `word = "${word}"\nprint(word[${i}])`,
        [...word][i] ?? '',
        `O índice conta-se desde 0: posição ${i}.`,
      )
    },
    (c) => {
      const word = c.pick(WORDS)
      return c.out(
        `word = "${word}"\nprint(word[-1])`,
        [...word].at(-1) ?? '',
        'O índice -1 é o último caracter.',
      )
    },
    (c) => {
      const word = c.pick(['ha', 'ba', 'la', 'na'])
      const n = c.int(2, 4)
      return c.out(`print("${word}" * ${n})`, word.repeat(n), 'O * repete o texto.')
    },
    (c) => {
      const first = c.pick(['Ana', 'Paulo', 'Luzia', 'Kiala'])
      const last = c.pick(['Neto', 'Kiluanje', 'Mendes', 'Sapalo'])
      return c.out(
        `first = "${first}"\nlast = "${last}"\nprint(first + " " + last)`,
        `${first} ${last}`,
        'O + junta os textos; o " " põe o espaço entre eles.',
      )
    },
    (c) => {
      const a = c.int(2, 9)
      const b = c.int(2, 9)
      return c.out(`print("${a}" + "${b}")`, `${a}${b}`, 'Entre aspas é texto: o + junta, não soma.')
    },
    (c) =>
      c.ask(
        'Qual é o índice do primeiro caracter de um texto?',
        '0',
        ['1', '-0'],
        'Em Python os índices começam em 0.',
      ),
    (c) => {
      const word = c.pick(WORDS)
      return c.ask(
        `Quantos caracteres tem "${word} Sul" (com o espaço)?`,
        String([...word].length + 4),
        [String([...word].length + 3), String([...word].length + 5)],
        'Contam-se as letras, o espaço e as três letras de "Sul".',
      )
    },
    (c) => {
      const word = c.pick(WORDS)
      return c.fill(
        `word = "${word}"\nprint(___(word))`,
        [['len']],
        'len() devolve o número de caracteres.',
        `Completa para imprimir ${[...word].length}, o número de caracteres de word.`,
      )
    },
  ],
})
