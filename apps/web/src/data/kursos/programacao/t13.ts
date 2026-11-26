import { defineTopic } from './kit'

// Topic 13: break, continue and nested loops. Theme from the Python Programming Wikibook (Flow control); written from scratch.

export default defineTopic({
  id: 't13',
  intro: [
    'break sai do ciclo logo, sem fazer as voltas que faltam. continue salta o resto da volta atual e passa à seguinte. Servem para parar quando já encontraste o que procuravas e para ignorar casos que não interessam.',
    'Podes pôr um ciclo dentro de outro. O ciclo de dentro corre inteiro a cada volta do de fora: com 2 voltas por fora e 3 por dentro, o bloco do meio corre 2 × 3 = 6 vezes. Um break só sai do ciclo em que está.',
  ],
  rule: 'break termina o ciclo; continue salta para a volta seguinte. Em ciclos aninhados, o de dentro dá todas as voltas em cada volta do de fora.',
  code: {
    caption: 'break, continue e um ciclo dentro de outro.',
    lines: [
      'for i in range(1, 10):',
      '    if i == 4:',
      '        break          # sai do ciclo',
      '    print(i)           # 1, 2, 3',
      '',
      'for i in range(1, 5):',
      '    if i % 2 == 0:',
      '        continue       # salta os pares',
      '    print(i)           # 1, 3',
      '',
      'for a in range(2):',
      '    for b in range(3):',
      '        print(a, b)    # 6 linhas',
    ],
  },
  points: [
    'break sai do ciclo; continue passa à volta seguinte.',
    'Ciclos aninhados: voltas de fora × voltas de dentro.',
    'break só sai do ciclo mais interior onde está.',
  ],
  quiz: [
    {
      prompt: 'O que faz break dentro de um for?',
      options: ['Salta a volta atual', 'Sai do ciclo', 'Repete a volta'],
      answer: 1,
    },
    {
      prompt: 'O que faz continue?',
      options: ['Sai do ciclo', 'Passa logo à volta seguinte', 'Pára o programa'],
      answer: 1,
    },
    {
      prompt: 'Quantas vezes corre o bloco de dentro em for a in range(3): for b in range(4)?',
      options: ['7', '12', '4'],
      answer: 1,
    },
  ],
  exercises: [
    (c) => {
      const k = c.int(3, 7)
      return c.out(
        `for i in range(1, 20):\n    if i % ${k} == 0:\n        break\n    print(i)`,
        Array.from({ length: k - 1 }, (_, at) => at + 1).join('\n'),
        `Pára no primeiro múltiplo de ${k}, que já não é impresso.`,
      )
    },
    (c) => {
      const n = c.int(5, 9)
      const odd = Array.from({ length: n }, (_, at) => at + 1).filter((value) => value % 2 === 1)
      return c.out(
        `for i in range(1, ${n + 1}):\n    if i % 2 == 0:\n        continue\n    print(i)`,
        odd.join('\n'),
        'continue salta os pares; só os ímpares chegam ao print.',
      )
    },
    (c) => {
      const a = c.int(2, 3)
      const b = c.int(2, 3)
      const lines: string[] = []
      for (let i = 1; i <= a; i++) for (let j = 1; j <= b; j++) lines.push(String(i * j))
      return c.out(
        `for i in range(1, ${a + 1}):\n    for j in range(1, ${b + 1}):\n        print(i * j)`,
        lines.join('\n'),
        'Para cada i, j dá todas as voltas.',
      )
    },
    (c) => {
      const a = c.int(2, 6)
      const b = c.int(2, 6)
      return c.out(
        `count = 0\nfor i in range(${a}):\n    for j in range(${b}):\n        count += 1\nprint(count)`,
        String(a * b),
        `${a} voltas por fora × ${b} por dentro.`,
      )
    },
    (c) => {
      const stop = c.int(1, 3)
      const lines: string[] = []
      for (let i = 0; i < 2; i++)
        for (let j = 0; j < 5; j++) {
          if (j === stop) break
          lines.push(`${i} ${j}`)
        }
      return c.out(
        `for i in range(2):\n    for j in range(5):\n        if j == ${stop}:\n            break\n        print(i, j)`,
        lines.join('\n'),
        'O break só sai do ciclo de dentro; o de fora continua.',
      )
    },
    (c) => {
      const step = c.int(3, 7)
      const limit = c.int(10, 30)
      const n = (Math.floor(limit / step) + 1) * step
      return c.out(
        `n = 0\nwhile True:\n    n += ${step}\n    if n > ${limit}:\n        break\nprint(n)`,
        String(n),
        'while True só acaba pelo break: o primeiro múltiplo que passa o limite.',
      )
    },
    (c) =>
      c.ask(
        'Num ciclo, o que faz a palavra continue?',
        'Salta o resto da volta e passa à seguinte.',
        ['Sai do ciclo.', 'Volta ao princípio do programa.'],
        'break sai; continue só salta a volta atual.',
      ),
    (c) =>
      c.fill(
        'for i in range(10):\n    if i == 3:\n        ___\n    print(i)   # imprime 0, 1 e 2',
        [['break']],
        'break sai do ciclo quando i chega a 3.',
        'Completa para o ciclo parar quando i chega a 3.',
      ),
    (c) =>
      c.fill(
        'for i in range(5):\n    if i == 2:\n        ___\n    print(i)   # não imprime o 2',
        [['continue']],
        'continue salta só essa volta.',
        'Completa para saltar o número 2 mas continuar o ciclo.',
      ),
  ],
})
