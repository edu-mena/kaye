import { defineTopic } from './kit'

// Topic 4: order of operations and augmented assignment. Written from scratch.

export default defineTopic({
  id: 't04',
  intro: [
    'Como na matemática, o Python faz primeiro a potência **, depois * / // %, e só no fim + e -. Os parênteses mandam sempre: o que está dentro calcula-se primeiro. 2 + 3 * 4 dá 14, mas (2 + 3) * 4 dá 20.',
    'Muitas vezes atualizas uma variável com base no valor dela: total = total + 5. Existe um atalho: total += 5. Também há -=, *= e //=. Estes atalhos são muito usados em contadores e totais.',
  ],
  rule: 'Ordem: parênteses, **, depois * / // %, depois + e -. A variável += valor é o mesmo que variável = variável + valor.',
  code: {
    caption: 'Prioridades e atalhos.',
    lines: [
      'print(2 + 3 * 4)     # 14',
      'print((2 + 3) * 4)   # 20',
      'total = 100',
      'total += 50          # total = total + 50',
      'total -= 30',
      'print(total)         # 120',
    ],
  },
  points: [
    'Parênteses primeiro; depois **; depois * / // %; no fim + e -.',
    'x += n soma n a x; x -= n subtrai; x *= n multiplica.',
    'Em dúvida, usa parênteses: o código fica mais claro.',
  ],
  quiz: [
    { prompt: 'O que imprime print(2 + 3 * 4)?', options: ['20', '14', '24'], answer: 1 },
    { prompt: 'x = 10 e depois x += 5. Quanto vale x?', options: ['5', '10', '15'], answer: 2 },
    { prompt: 'O que imprime print((6 + 2) // 4)?', options: ['2', '8', '7'], answer: 0 },
  ],
  exercises: [
    (c) => {
      const a = c.int(2, 9)
      const b = c.int(2, 9)
      const d = c.int(2, 9)
      return c.out(`print(${a} + ${b} * ${d})`, String(a + b * d), 'A multiplicação faz-se antes da soma.')
    },
    (c) => {
      const a = c.int(2, 9)
      const b = c.int(2, 9)
      const d = c.int(2, 9)
      return c.out(`print((${a} + ${b}) * ${d})`, String((a + b) * d), 'Os parênteses calculam-se primeiro.')
    },
    (c) => {
      const start = c.int(10, 90)
      const add = c.int(1, 9)
      return c.out(
        `total = ${start}\ntotal += ${add}\ntotal += ${add}\nprint(total)`,
        String(start + 2 * add),
        'Cada += soma ao valor que a variável tem nesse momento.',
      )
    },
    (c) => {
      const start = c.int(50, 99)
      const sub = c.int(1, 9)
      const times = c.int(2, 4)
      return c.out(
        `x = ${start}\nx -= ${sub}\nx *= ${times}\nprint(x)`,
        String((start - sub) * times),
        `Primeiro ${start} - ${sub}, depois o resultado vezes ${times}.`,
      )
    },
    (c) => {
      const base = c.int(2, 5)
      const e = c.int(2, 3)
      const k = c.int(1, 9)
      return c.out(`print(${k} + ${base} ** ${e})`, String(k + base ** e), 'A potência faz-se antes da soma.')
    },
    (c) => {
      const items = c.int(3, 9)
      const price = c.int(2, 9) * 100
      const discount = c.int(1, 5) * 100
      return c.out(
        `items = ${items}\nprice = ${price}\ndiscount = ${discount}\nprint(items * price - discount)`,
        String(items * price - discount),
        'Primeiro a multiplicação (valores em Kz inventados), depois a subtração.',
      )
    },
    (c) =>
      c.ask(
        'O que faz a linha count += 1?',
        'Soma 1 ao valor de count.',
        ['Compara count com 1.', 'Guarda 1 em count, apagando o valor anterior.'],
        'count += 1 é o mesmo que count = count + 1.',
      ),
    (c) => {
      const n = c.int(2, 9)
      return c.fill(
        `score = ${n}\nscore ___ 10\nprint(score)   # ${n + 10}`,
        [['+=', '+ =']],
        'O atalho de somar é +=.',
        'Completa para somar 10 a score.',
      )
    },
    (c) => {
      const a = c.int(2, 9)
      const b = c.int(2, 9)
      return c.ask(
        `Qual é o valor de ${a} + ${b} * 2?`,
        String(a + b * 2),
        [String((a + b) * 2), String((a + b) * 2 + 1)],
        'A multiplicação vem antes da soma.',
      )
    },
  ],
})
