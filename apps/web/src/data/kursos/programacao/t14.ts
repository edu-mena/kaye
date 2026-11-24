import { defineTopic } from './kit'

// Topic 14: lists. Theme from the Python Programming Wikibook (Lists); written from scratch.

const list = (values: (number | string)[]) =>
  `[${values.map((value) => (typeof value === 'string' ? `'${value}'` : value)).join(', ')}]`

const NAMES = ['Ana', 'Paulo', 'Luzia', 'Kiala', 'Nzinga', 'Domingos']

export default defineTopic({
  id: 't14',
  intro: [
    'Uma lista (list) guarda vários valores numa só variável, entre parênteses retos e separados por vírgulas. Cada valor tem um índice, a contar desde 0, e len() diz quantos são. Os índices negativos contam do fim: lista[-1] é o último.',
    'Podes mudar um valor (lista[1] = 15), ver se um valor existe (15 in lista) e percorrer a lista com for. Pedir um índice que não existe dá IndexError.',
  ],
  rule: 'lista = [a, b, c]; lista[0] é o primeiro; lista[-1] o último; len(lista) o tamanho; valor in lista diz se existe. for item in lista: percorre os valores.',
  code: {
    caption: 'Criar, ler, mudar e percorrer uma lista.',
    lines: [
      'grades = [12, 15, 9]',
      'print(grades[0])        # 12',
      'print(grades[-1])       # 9',
      'grades[2] = 11         # muda o terceiro valor',
      'print(len(grades))      # 3',
      'for grade in grades:',
      '    print(grade)        # 12, 15, 11',
    ],
  },
  points: [
    'Lista: valores entre [ ], com índices desde 0.',
    'lista[-1] é o último; len() dá o tamanho.',
    'Podes mudar um valor pelo índice e testar com in.',
    'Índice fora da lista dá IndexError.',
  ],
  quiz: [
    { prompt: 'Com notas = [12, 15, 9], quanto vale notas[1]?', options: ['12', '15', '9'], answer: 1 },
    { prompt: 'Com notas = [12, 15, 9], quanto vale notas[-1]?', options: ['12', '15', '9'], answer: 2 },
    {
      prompt: 'O que acontece com notas[3] numa lista de 3 valores?',
      options: ['Dá 0', 'Dá IndexError', 'Dá o último valor'],
      answer: 1,
    },
  ],
  exercises: [
    (c) => {
      const values = Array.from({ length: 4 }, () => c.int(5, 20))
      const at = c.int(0, 3)
      return c.out(
        `grades = ${list(values)}\nprint(grades[${at}])`,
        String(values[at]),
        `O índice ${at} é o ${at + 1}.º valor.`,
      )
    },
    (c) => {
      const values = Array.from({ length: c.int(3, 6) }, () => c.int(5, 20))
      return c.out(
        `grades = ${list(values)}\nprint(len(grades))`,
        String(values.length),
        'len() conta os valores.',
      )
    },
    (c) => {
      const values = Array.from({ length: 4 }, () => c.int(5, 20))
      return c.out(
        `grades = ${list(values)}\nprint(grades[-1])`,
        String(values.at(-1)),
        'O índice -1 é o último valor.',
      )
    },
    (c) => {
      const values = Array.from({ length: 4 }, () => c.int(5, 20))
      const at = c.int(0, 3)
      const value = c.int(1, 4)
      const changed = values.map((item, index) => (index === at ? value : item))
      return c.out(
        `grades = ${list(values)}\ngrades[${at}] = ${value}\nprint(grades)`,
        list(changed),
        `O valor do índice ${at} foi substituído.`,
      )
    },
    (c) => {
      const values = Array.from({ length: 3 }, () => c.int(2, 9))
      return c.out(
        `numbers = ${list(values)}\nfor n in numbers:\n    print(n * 2)`,
        values.map((n) => n * 2).join('\n'),
        'O ciclo passa por cada valor e imprime o dobro.',
      )
    },
    (c) => {
      const names = NAMES.toSorted(() => c.int(-1, 1)).slice(0, 3)
      const probe = c.pick([names[0] as string, 'Zeca'])
      return c.out(
        `names = ${list(names)}\nprint("${probe}" in names)`,
        names.includes(probe) ? 'True' : 'False',
        'in diz se o valor está na lista.',
      )
    },
    (c) => {
      const values = Array.from({ length: 4 }, () => c.int(5, 20))
      return c.out(
        `grades = ${list(values)}\ntotal = 0\nfor grade in grades:\n    total += grade\nprint(total)`,
        String(values.reduce((sum, value) => sum + value, 0)),
        'O acumulador soma todos os valores da lista.',
      )
    },
    (c) => {
      const size = c.int(3, 6)
      return c.ask(
        `Numa lista com ${size} valores, qual é o último índice válido?`,
        String(size - 1),
        [String(size), String(size + 1)],
        'Os índices vão de 0 a len − 1.',
      )
    },
    (c) =>
      c.fill(
        'names = ["Ana", "Luzia"]\nprint(___(names))   # 2',
        [['len']],
        'len() devolve o número de valores da lista.',
        'Completa para imprimir quantos nomes tem a lista.',
      ),
  ],
})
