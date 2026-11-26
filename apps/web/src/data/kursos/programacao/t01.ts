import { defineTopic } from './kit'

// Topic 1: print and variables. Theme from the Python Programming Wikibook (Variables and Strings); written from scratch.

const NAMES = ['Nzinga', 'Kiala', 'Paulo', 'Luzia', 'Domingos', 'Ana']
const CITIES = ['Huambo', 'Lubango', 'Malanje', 'Benguela', 'Cabinda', 'Saurimo']

export default defineTopic({
  id: 't01',
  intro: [
    'Um programa é uma lista de instruções que o computador cumpre pela ordem em que as escreves. A instrução print() escreve alguma coisa no ecrã: print("Olá") mostra Olá.',
    'Uma variável é um nome que aponta para um valor guardado na memória, como uma etiqueta numa caixa. Cria-se com nome = valor. O sinal = quer dizer “guarda”, não “é igual”. Podes mudar o valor quando quiseres: o programa usa sempre o último.',
  ],
  rule: 'nome = valor guarda o valor. Os nomes têm letras, algarismos e _, não começam por algarismo e não têm espaços; maiúsculas contam. Neste curso os nomes são em inglês e em snake_case (first_name).',
  code: {
    caption: 'Criar variáveis, mostrá-las e mudar uma delas.',
    lines: [
      'name = "Nzinga"',
      'age = 17',
      'print(name, age)      # Nzinga 17',
      'age = age + 1         # fez anos',
      'print("Idade:", age)  # Idade: 18',
    ],
  },
  points: [
    'print() escreve no ecrã; vários valores separam-se com vírgula e saem com um espaço entre eles.',
    'nome = valor guarda; o sinal = não compara.',
    'Uma variável pode mudar de valor: conta o último.',
    'Nomes: letras, algarismos e _, sem começar por algarismo, sem espaços.',
  ],
  quiz: [
    {
      prompt: 'Qual destes nomes de variável é válido?',
      options: ['1st_name', 'first name', 'first_name'],
      answer: 2,
    },
    {
      prompt: 'Em x = 5, o sinal = quer dizer…',
      options: ['“é igual a”', '“guarda”', '“compara”'],
      answer: 1,
    },
    {
      prompt: 'price = 100 e depois price = 200. O que imprime print(price)?',
      options: ['100', '200', '300'],
      answer: 1,
    },
  ],
  exercises: [
    (c) => {
      const name = c.pick(NAMES)
      const age = c.int(14, 29)
      return c.out(
        `name = "${name}"\nage = ${age}\nprint(name, age)`,
        `${name} ${age}`,
        'print() com vírgulas junta os valores com um espaço.',
      )
    },
    (c) => {
      const first = c.int(10, 50) * 10
      const second = first + c.int(1, 9) * 10
      return c.out(
        `price = ${first}\nprice = ${second}\nprint(price)`,
        String(second),
        'A variável guarda só o último valor: o primeiro foi substituído.',
      )
    },
    (c) => {
      const a = c.int(1, 9)
      const b = a + c.int(1, 9)
      return c.out(
        `x = ${a}\ny = x\nx = ${b}\nprint(x, y)`,
        `${b} ${a}`,
        'y = x copiou o valor que x tinha nesse momento (' + a + '); depois x mudou, mas y ficou.',
      )
    },
    (c) => {
      const city = c.pick(CITIES)
      const year = c.int(2020, 2030)
      return c.order(
        'Ordena as linhas para guardar a cidade e o ano e depois mostrá-los.',
        [`city = "${city}"`, `year = ${year}`, 'print(city, year)'],
        'Primeiro guardam-se os valores; só depois se usam no print.',
      )
    },
    (c) => {
      const age = c.int(14, 29)
      return c.fill(
        `age ___ ${age}`,
        [['=']],
        'Para guardar um valor numa variável usa-se =.',
        `Completa para guardar o número ${age} na variável age.`,
      )
    },
    (c) =>
      c.ask(
        'Qual destes nomes de variável é válido?',
        c.pick(['first_name', 'total_price', 'student2']),
        [c.pick(['2nd_name', '3rd_place']), c.pick(['first name', 'total price'])],
        'Um nome não começa por algarismo nem tem espaços.',
      ),
    (c) => {
      const a = c.int(2, 9)
      const b = c.int(2, 9)
      return c.out(
        `a = ${a}\nb = ${b}\na = b\nprint(a, b)`,
        `${b} ${b}`,
        'a = b guarda em a o valor de b; os dois ficam iguais.',
      )
    },
    (c) =>
      c.ask(
        'O que faz o sinal = numa linha como total = 10?',
        'Guarda o valor 10 na variável total.',
        ['Compara total com 10.', 'Diz que total é sempre igual a 10, para sempre.'],
        'Em Python, = é a atribuição: guarda um valor. A comparação escreve-se ==.',
      ),
    (c) => {
      const word = c.pick(['Olá', 'Bom dia', 'Boa tarde'])
      return c.out(
        `print("${word}", "Angola")`,
        `${word} Angola`,
        'Os dois textos saem separados por um espaço.',
      )
    },
  ],
})
