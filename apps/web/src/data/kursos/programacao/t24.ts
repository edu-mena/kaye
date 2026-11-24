import { defineTopic } from './kit'

// Topic 24: reading a problem. Written from scratch; the statements are invented.

type Problem = { text: string; inputs: string; outputs: string; steps: string[] }

const PROBLEMS: Problem[] = [
  {
    text: 'Lê o preço de um produto e a quantidade comprada e mostra o total a pagar.',
    inputs: 'o preço e a quantidade',
    outputs: 'o total a pagar',
    steps: ['Ler o preço', 'Ler a quantidade', 'Multiplicar o preço pela quantidade', 'Mostrar o total'],
  },
  {
    text: 'Lê três notas e mostra a média.',
    inputs: 'as três notas',
    outputs: 'a média',
    steps: ['Ler as três notas', 'Somar as notas', 'Dividir a soma por 3', 'Mostrar a média'],
  },
  {
    text: 'Lê um número inteiro e diz se é par ou ímpar.',
    inputs: 'um número inteiro',
    outputs: 'a palavra “par” ou “ímpar”',
    steps: [
      'Ler o número',
      'Calcular o resto da divisão por 2',
      'Se o resto for 0, mostrar “par”',
      'Senão, mostrar “ímpar”',
    ],
  },
  {
    text: 'Lê a idade de uma pessoa e diz se pode votar (18 anos ou mais).',
    inputs: 'a idade',
    outputs: 'se a pessoa pode votar ou não',
    steps: [
      'Ler a idade',
      'Comparar a idade com 18',
      'Se for 18 ou mais, mostrar “pode votar”',
      'Senão, mostrar “não pode votar”',
    ],
  },
  {
    text: 'Lê um número de segundos e mostra quantos minutos inteiros e quantos segundos sobram.',
    inputs: 'o número de segundos',
    outputs: 'os minutos inteiros e os segundos que sobram',
    steps: [
      'Ler os segundos',
      'Calcular os minutos com a divisão inteira por 60',
      'Calcular os segundos que sobram com o resto por 60',
      'Mostrar os dois valores',
    ],
  },
]

export default defineTopic({
  id: 't24',
  intro: [
    'Antes de escrever código, lê o problema devagar. Procura três coisas: o que entra (as entradas), o que tem de sair (as saídas) e o que se faz entre uma coisa e a outra (os passos). Só depois de os teres escritos por palavras é que passas ao Python.',
    'Faz depois um exemplo à mão com números pequenos e um caso limite (zero, o valor exato do limite, uma lista de um só valor). Se a mão acerta, o programa tem de dar o mesmo resultado; se não acerta, o erro está no raciocínio, não no Python.',
  ],
  rule: 'Problema = entradas + passos + saídas. Escreve-os por palavras, resolve um exemplo à mão e testa um caso limite antes de programar.',
  code: {
    caption: 'O problema “lê o preço e a quantidade e mostra o total”, passo a passo, e depois em código.',
    lines: [
      '# Entradas: o preço e a quantidade',
      '# Passos: ler, multiplicar',
      '# Saída: o total',
      'price = int(input("Preço em Kz: "))',
      'quantity = int(input("Quantidade: "))',
      'total = price * quantity',
      'print("Total:", total, "Kz")',
    ],
  },
  points: [
    'Separa entradas, passos e saídas antes de programar.',
    'Resolve um exemplo pequeno à mão: é o teste do programa.',
    'Testa um caso limite: o valor exato em que a regra muda.',
  ],
  quiz: [
    {
      prompt: 'Qual é o primeiro passo diante de um problema?',
      options: ['Escrever código', 'Ler e separar entradas e saídas', 'Pesquisar a solução'],
      answer: 1,
    },
    {
      prompt: 'No problema “diz se a pessoa pode votar (18 ou mais)”, qual é um caso limite?',
      options: ['Idade 5', 'Idade 18', 'Idade 90'],
      answer: 1,
    },
    {
      prompt: 'Um exemplo feito à mão serve para…',
      options: [
        'Enfeitar o programa',
        'Saber o resultado esperado e testar o programa',
        'Evitar usar o input',
      ],
      answer: 1,
    },
  ],
  exercises: [
    (c) => {
      const problem = c.pick(PROBLEMS)
      const others = PROBLEMS.filter((item) => item !== problem)
      return c.ask(
        `Problema: ${problem.text} Quais são as entradas?`,
        problem.inputs,
        [others[0]?.inputs ?? '', others[1]?.inputs ?? ''],
        'As entradas são o que o programa recebe.',
      )
    },
    (c) => {
      const problem = c.pick(PROBLEMS)
      const others = PROBLEMS.filter((item) => item !== problem)
      const [first, second] = [others[0], others[1]]
      return c.ask(
        `Problema: ${problem.text} O que tem de sair?`,
        problem.outputs,
        [first?.outputs ?? '', second?.outputs ?? ''],
        'As saídas são o que o programa mostra.',
      )
    },
    (c) => {
      const problem = c.pick(PROBLEMS)
      return c.order(
        `Ordena os passos do problema: ${problem.text}`,
        problem.steps,
        'Lê-se primeiro, calcula-se a seguir e mostra-se no fim.',
      )
    },
    (c) => {
      const secs = c.int(100, 900)
      return c.out(
        `seconds = ${secs}\nminutes = seconds // 60\nleft = seconds % 60\nprint(minutes, left)`,
        `${Math.floor(secs / 60)} ${secs % 60}`,
        'Os passos do problema dos segundos: divisão inteira e resto por 60.',
      )
    },
    (c) => {
      const price = c.int(3, 9) * 1000
      const qty = c.int(2, 6)
      const total = price * qty
      return c.out(
        `price = ${price}\nquantity = ${qty}\ntotal = price * quantity\nif total > 20000:\n    total = total - total // 10\nprint(total)`,
        String(total > 20000 ? total - Math.floor(total / 10) : total),
        'Desconto de 10% quando o total passa de 20000 Kz (valores inventados).',
      )
    },
    (c) =>
      c.ask(
        'Qual é um bom caso limite para “mostra “Aprovado” se a nota é pelo menos 10”?',
        'A nota 10, o valor exato em que a regra muda.',
        ['A nota 15, que está a meio.', 'A nota 20, a mais alta.'],
        'Os erros escondem-se no valor onde a regra muda.',
      ),
    (c) =>
      c.ask(
        'Que dois valores deves testar, no mínimo, na regra “maior de idade se tem 18 anos ou mais”?',
        '17 e 18',
        ['5 e 50', '18 e 100'],
        'Um valor de cada lado do limite mostra se o >= está bem escrito.',
      ),
    (c) =>
      c.fill(
        'price = 500\nquantity = 3\ntotal = price ___ quantity   # 1500\nprint(total)',
        [['*']],
        'O total é o preço vezes a quantidade.',
        'Completa com o operador do passo “multiplicar”.',
      ),
    (c) =>
      c.decide(
        [
          'O enunciado diz: “Mostra o desconto ao cliente”, mas não diz quanto é o desconto.',
          'Falta uma informação que o programa precisa.',
        ],
        [
          {
            text: 'Perguntar quanto é o desconto (ou escrever a suposição que fizeste) antes de programar.',
            consequence:
              'Resolves a dúvida antes de gastar tempo; o programa fica a fazer o que se pretendia.',
          },
          {
            text: 'Inventar um desconto e não dizer a ninguém.',
            consequence: 'O programa corre, mas pode dar resultados errados sem ninguém saber porquê.',
          },
          { text: 'Não fazer nada e esperar.', consequence: 'Perdes tempo: uma pergunta curta resolvia.' },
        ],
        0,
        'O que fazes primeiro?',
      ),
  ],
})
