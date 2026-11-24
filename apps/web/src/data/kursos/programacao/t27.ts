import { defineTopic } from './kit'

// Topic 27: mini-project, times table. Written from scratch.

export default defineTopic({
  id: 't27',
  intro: [
    'Segundo mini-projeto: a tabuada de um número. É o clássico para treinar o ciclo for com f-strings: para cada i de 1 a 10, o programa escreve uma linha “n x i = resultado”.',
    'O programa faz só uma coisa por linha e usa o ciclo para não repetir 10 vezes o print. Com input podes perguntar qual número queres, e com um segundo ciclo por fora podes escrever várias tabuadas.',
  ],
  rule: 'for i in range(1, 11): corre com i de 1 a 10. Dentro do ciclo, f"{n} x {i} = {n * i}" calcula e escreve. O 11 do range não entra.',
  code: {
    caption: 'A tabuada de um número lido do teclado.',
    lines: [
      'n = int(input("Tabuada de que número? "))',
      'for i in range(1, 11):',
      '    print(f"{n} x {i} = {n * i}")',
    ],
  },
  points: [
    'range(1, 11) dá de 1 a 10: o fim não entra.',
    'f"{n} x {i} = {n * i}" mete valores e contas no texto.',
    'Um ciclo evita repetir o mesmo print dez vezes.',
  ],
  quiz: [
    {
      prompt: 'Para escrever a tabuada de 1 a 10, o range é…',
      options: ['range(1, 10)', 'range(1, 11)', 'range(10)'],
      answer: 1,
    },
    {
      prompt: 'Com n = 4 e i = 3, o que mostra f"{n} x {i} = {n * i}"?',
      options: ['4 x 3 = 12', '4 x 3 = 7', '{n} x {i} = 12'],
      answer: 0,
    },
    { prompt: 'Quantas linhas escreve o programa da lição?', options: ['9', '10', '11'], answer: 1 },
  ],
  exercises: [
    (c) => {
      const n = c.int(2, 9)
      const stop = c.int(3, 4)
      return c.out(
        `n = ${n}\nfor i in range(1, ${stop + 1}):\n    print(f"{n} x {i} = {n * i}")`,
        Array.from({ length: stop }, (_, at) => `${n} x ${at + 1} = ${n * (at + 1)}`).join('\n'),
        `${stop} linhas: i vai de 1 a ${stop}.`,
      )
    },
    (c) => {
      const n = c.int(2, 9)
      const i = c.int(5, 10)
      return c.out(
        `n = ${n}\nfor i in range(1, 11):\n    if i == ${i}:\n        print(n * i)`,
        String(n * i),
        `Só a volta em que i vale ${i} imprime.`,
      )
    },
    (c) => {
      const n = c.int(2, 9)
      return c.out(
        `n = ${n}\ntotal = 0\nfor i in range(1, 11):\n    total += n * i\nprint(total)`,
        String(n * 55),
        `A soma da tabuada de ${n} é ${n} × (1 + 2 + … + 10) = ${n} × 55.`,
      )
    },
    (c) => {
      const n = c.int(2, 9)
      const i = c.int(1, 3)
      return c.out(
        `n = ${n}\ni = ${i}\nwhile i <= 3:\n    print(n * i)\n    i += 1`,
        Array.from({ length: 4 - i }, (_, at) => String(n * (i + at))).join('\n'),
        'A versão com while faz o mesmo que o for: a condição pára depois de i = 3.',
      )
    },
    (c) => {
      const n = c.int(2, 9)
      return c.out(
        `n = ${n}\nfor i in range(1, 11):\n    if i % 2 == 0:\n        print(n * i)`,
        [2, 4, 6, 8, 10].map((i) => String(n * i)).join('\n'),
        'Só os múltiplos pares de i chegam ao print.',
      )
    },
    (c) =>
      c.ask(
        'Quantas linhas escreve for i in range(1, 11): print(i)?',
        '10',
        ['11', '9'],
        'De 1 a 10 são 10 valores; o 11 não entra.',
      ),
    (c) =>
      c.fill(
        'for i in range(1, ___):\n    print(f"7 x {i} = {7 * i}")   # até 7 x 10',
        [['11']],
        'Para chegar a 10, o limite do range é 11.',
        'Completa o limite do range para a tabuada chegar a 10.',
      ),
    (c) =>
      c.order(
        'Ordena as linhas do programa da tabuada.',
        ['n = int(input("Número? "))', 'for i in range(1, 11):', '    print(f"{n} x {i} = {n * i}")'],
        'Lê-se n, depois o ciclo escreve cada linha.',
      ),
    (c) =>
      c.decide(
        ['O Domingos quer a tabuada de 1 a 10 mas o programa só chega a 9.', 'No código está range(1, 10).'],
        [
          {
            text: 'Mudar para range(1, 11).',
            consequence: 'O fim do range não entra: com 11 o último valor é 10.',
          },
          { text: 'Mudar para range(10).', consequence: 'Começa em 0 e acaba em 9: ainda falta o 10.' },
          {
            text: 'Somar 1 ao resultado.',
            consequence: 'Muda os resultados e não acrescenta nenhuma linha.',
          },
        ],
        0,
        'Qual é a correção?',
      ),
  ],
})
