import { defineTopic } from './kit'

// Topic 15: list methods. Theme from the Python Programming Wikibook (Lists); written from scratch.

const list = (values: (number | string)[]) =>
  `[${values.map((value) => (typeof value === 'string' ? `'${value}'` : value)).join(', ')}]`

export default defineTopic({
  id: 't15',
  intro: [
    'As listas têm métodos que as alteram no próprio sítio: append(x) junta x ao fim, remove(x) tira a primeira ocorrência de x, pop() tira e devolve o último valor, sort() ordena e reverse() inverte. count(x) conta as vezes que x aparece.',
    'Há também funções que só leem: sum(lista) soma, min(lista) e max(lista) dão o menor e o maior. Cuidado: sort() muda a lista e devolve None, por isso lista = lista.sort() apaga a lista.',
  ],
  rule: 'append, remove, pop, sort e reverse mudam a lista; sum, min, max, len e sorted(lista) só leem (sorted devolve uma lista nova).',
  code: {
    caption: 'Os métodos mais usados.',
    lines: [
      'grades = [12, 8, 15]',
      'grades.append(10)      # [12, 8, 15, 10]',
      'grades.remove(8)       # [12, 15, 10]',
      'last = grades.pop()    # last = 10, grades = [12, 15]',
      'grades.sort()          # [12, 15]',
      'print(sum(grades), min(grades), max(grades))   # 27 12 15',
    ],
  },
  points: [
    'append junta ao fim; remove tira um valor; pop tira o último.',
    'sort() ordena a própria lista e devolve None.',
    'sum, min e max leem a lista sem a mudar.',
  ],
  quiz: [
    {
      prompt: 'O que faz lista.append(7)?',
      options: ['Junta 7 ao fim', 'Tira o 7', 'Ordena a lista'],
      answer: 0,
    },
    { prompt: 'O que imprime print([3, 1, 2].sort())?', options: ['[1, 2, 3]', 'None', 'Erro'], answer: 1 },
    { prompt: 'O que dá max([4, 9, 2])?', options: ['2', '9', '15'], answer: 1 },
  ],
  exercises: [
    (c) => {
      const values = [c.int(5, 9), c.int(10, 14), c.int(15, 19)]
      const extra = c.int(1, 4)
      return c.out(
        `grades = ${list(values)}\ngrades.append(${extra})\nprint(grades)`,
        list([...values, extra]),
        'append junta o valor ao fim da lista.',
      )
    },
    (c) => {
      const values = [c.int(5, 9), c.int(10, 14), c.int(15, 19), c.int(1, 4)]
      const out = c.pick(values)
      const index = values.indexOf(out)
      const result = values.filter((_, at) => at !== index)
      return c.out(
        `grades = ${list(values)}\ngrades.remove(${out})\nprint(grades)`,
        list(result),
        'remove tira a primeira ocorrência do valor.',
      )
    },
    (c) => {
      const values = [c.int(5, 9), c.int(10, 14), c.int(15, 19)]
      return c.out(
        `grades = ${list(values)}\nlast = grades.pop()\nprint(last)\nprint(grades)`,
        `${values.at(-1)}\n${list(values.slice(0, -1))}`,
        'pop tira o último valor e devolve-o.',
      )
    },
    (c) => {
      const values = Array.from({ length: 4 }, () => c.int(1, 20))
      return c.out(
        `numbers = ${list(values)}\nnumbers.sort()\nprint(numbers)`,
        list(values.toSorted((a, b) => a - b)),
        'sort() ordena do menor para o maior.',
      )
    },
    (c) => {
      const values = Array.from({ length: 4 }, () => c.int(1, 20))
      return c.out(
        `numbers = ${list(values)}\nprint(sum(numbers), min(numbers), max(numbers))`,
        `${values.reduce((sum, value) => sum + value, 0)} ${Math.min(...values)} ${Math.max(...values)}`,
        'A soma, o menor e o maior valor da lista.',
      )
    },
    (c) => {
      const values = Array.from({ length: 3 }, () => c.int(1, 20))
      return c.out(
        `numbers = ${list(values)}\nprint(numbers.sort())`,
        'None',
        'sort() muda a lista e devolve None; é por isso que o print mostra None.',
      )
    },
    (c) => {
      const first = c.int(5, 9)
      const second = c.int(10, 14)
      // The third grade makes the sum a multiple of 3, so the average is a whole float such as 12.0.
      const third = 15 + ((3 - ((first + second + 15) % 3)) % 3)
      const values = [first, second, third]
      const average = (first + second + third) / 3
      return c.out(
        `grades = ${list(values)}\naverage = sum(grades) / len(grades)\nprint(average)`,
        `${average}.0`,
        'A média é a soma a dividir pelo número de valores; / dá float.',
      )
    },
    (c) =>
      c.ask(
        'Qual é a diferença entre grades.sort() e sorted(grades)?',
        'sort() ordena a própria lista; sorted() devolve uma lista nova e deixa a original.',
        ['Não há diferença.', 'sorted() ordena a própria lista; sort() devolve uma nova.'],
        'sort() é um método da lista; sorted() é uma função que não a altera.',
      ),
    (c) =>
      c.fill(
        'names = ["Ana"]\nnames.___("Paulo")   # ["Ana", "Paulo"]',
        [['append']],
        'append junta um valor ao fim.',
        'Completa com o método que junta um nome ao fim da lista.',
      ),
    (c) =>
      c.order(
        'Ordena as linhas para calcular e mostrar a nota mais alta.',
        ['grades = [12, 17, 9]', 'best = max(grades)', 'print(best)'],
        'Cria-se a lista, calcula-se e mostra-se.',
      ),
  ],
})
