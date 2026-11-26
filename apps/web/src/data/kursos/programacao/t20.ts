import { defineTopic, py } from './kit'

// Topic 20: scope and default values. Theme from the Python Programming Wikibook (Functions); written from scratch.

export default defineTopic({
  id: 't20',
  intro: [
    'Uma variável criada dentro de uma função é local: só existe lá dentro e desaparece quando a função acaba. Se tiveres outra com o mesmo nome fora da função, são duas variáveis diferentes. Usar fora da função uma variável local dá NameError.',
    'Um parâmetro pode ter um valor por omissão: def hello(name="amigo"). Se não passares o argumento, usa-se o valor por omissão. Os parâmetros com valor por omissão ficam sempre no fim da lista.',
  ],
  rule: 'Variáveis criadas numa função são locais. def f(a, b=10): b é opcional; f(1) usa b = 10 e f(1, 5) usa b = 5.',
  code: {
    caption: 'Variável local e valor por omissão.',
    lines: [
      'x = 5',
      'def change():',
      '    x = 99            # outra variável, só local',
      '    print(x)          # 99',
      'change()',
      'print(x)              # 5: a de fora não mudou',
      '',
      'def power(base, exp=2):',
      '    return base ** exp',
      'print(power(3))        # 9',
      'print(power(3, 3))     # 27',
    ],
  },
  points: [
    'Uma variável criada numa função é local e não existe fora dela.',
    'Uma variável local com o nome de uma de fora não a altera.',
    'Parâmetros com valor por omissão são opcionais e vão no fim.',
  ],
  quiz: [
    {
      prompt: 'Onde existe uma variável criada dentro de uma função?',
      options: ['Em todo o programa', 'Só dentro da função', 'Só fora da função'],
      answer: 1,
    },
    { prompt: 'Com def f(a, b=10): return a + b, quanto dá f(5)?', options: ['5', '15', 'Erro'], answer: 1 },
    {
      prompt: 'Que erro dá usar fora da função uma variável local?',
      options: ['NameError', 'ValueError', 'KeyError'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const outer = c.int(1, 9)
      const inner = outer + c.int(1, 9)
      return c.out(
        `x = ${outer}\n\ndef change():\n    x = ${inner}\n    print(x)\n\nchange()\nprint(x)`,
        `${inner}\n${outer}`,
        'Dentro da função x é outra variável; a de fora fica como estava.',
      )
    },
    (c) => {
      const name = c.pick(['Nzinga', 'Paulo', 'Luzia'])
      const given = c.pick([true, false])
      return c.out(
        `def hello(name="amigo"):\n    return "Olá, " + name\n\nprint(hello(${given ? `"${name}"` : ''}))`,
        `Olá, ${given ? name : 'amigo'}`,
        given
          ? 'O argumento passado substitui o valor por omissão.'
          : 'Sem argumento, usa-se o valor por omissão.',
      )
    },
    (c) => {
      const base = c.int(2, 5)
      const exp = c.int(3, 4)
      return c.out(
        `def power(base, exp=2):\n    return base ** exp\n\nprint(power(${base}), power(${base}, ${exp}))`,
        `${base ** 2} ${base ** exp}`,
        'A primeira chamada usa exp = 2; a segunda, o valor passado.',
      )
    },
    (c) => {
      const price = c.int(2, 9) * 1000
      const rate = c.pick([14, 7])
      return c.out(
        `def tax(price, rate=14):\n    return price * rate / 100\n\nprint(tax(${price}, ${rate}))`,
        py.div(price * rate, 100),
        `${rate}% de ${price} Kz (valores inventados); / dá float.`,
      )
    },
    (c) => {
      const n = c.int(2, 9)
      return c.out(
        `def increase(n):\n    n += 1\n    return n\n\nx = ${n}\nincrease(x)\nprint(x)`,
        String(n),
        'O resultado devolvido não foi guardado, e n dentro da função é uma cópia: x fica igual.',
      )
    },
    (c) => {
      const n = c.int(2, 9)
      return c.out(
        `def increase(n):\n    n += 1\n    return n\n\nx = ${n}\nx = increase(x)\nprint(x)`,
        String(n + 1),
        'Agora o valor devolvido foi guardado em x.',
      )
    },
    (c) =>
      c.ask(
        'O que acontece se usares, fora da função, uma variável criada dentro dela?',
        'Dá NameError: a variável não existe fora da função.',
        ['Usa o último valor que ela tinha.', 'Dá o valor 0.'],
        'As variáveis locais desaparecem quando a função acaba.',
      ),
    (c) =>
      c.ask(
        'Para que serve um valor por omissão num parâmetro?',
        'Para o argumento ser opcional na chamada.',
        ['Para impedir que o valor mude.', 'Para a função correr mais depressa.'],
        'Se não o passares, a função usa o valor por omissão.',
      ),
    (c) =>
      c.fill(
        'def hello(name___"amigo"):\n    return "Olá, " + name',
        [['=']],
        'O valor por omissão escreve-se com = no parâmetro.',
        'Completa o que falta para o parâmetro ter um valor por omissão.',
      ),
  ],
})
