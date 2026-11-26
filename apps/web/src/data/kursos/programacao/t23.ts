import { defineTopic } from './kit'

// Topic 23: modules. Theme from the Python Programming Wikibook (Modules, Standard library); written from scratch.
// The listings never rely on random numbers: they are only ever about what the code would do.

export default defineTopic({
  id: 't23',
  intro: [
    'Um módulo é um ficheiro com funções prontas. Importa-se com import: import math dá acesso a math.sqrt (raiz quadrada), math.floor (arredonda para baixo), math.ceil (para cima) e math.pi. Com from math import sqrt usas só sqrt(…), sem o prefixo.',
    'O módulo random sorteia valores: random.randint(1, 6) devolve um inteiro de 1 a 6, incluindo os dois. Como o resultado muda a cada vez, um programa com random não se prevê: o que se prevê é o intervalo.',
  ],
  rule: 'import módulo e depois módulo.função(); ou from módulo import função. math.sqrt dá sempre float. random.randint(a, b) inclui a e b.',
  code: {
    caption: 'math e random.',
    lines: [
      'import math',
      'print(math.sqrt(81))        # 9.0',
      'print(math.floor(7.8))      # 7',
      'print(math.ceil(7.2))       # 8',
      'print(round(math.pi, 2))    # 3.14',
      '',
      'import random',
      'dice = random.randint(1, 6) # 1, 2, 3, 4, 5 ou 6',
    ],
  },
  points: [
    'import traz um módulo; módulo.função() usa-o.',
    'math.sqrt devolve float; floor arredonda para baixo e ceil para cima.',
    'random.randint(a, b) devolve um inteiro de a a b, inclusive.',
  ],
  quiz: [
    { prompt: 'O que dá math.sqrt(16)?', options: ['4', '4.0', '8'], answer: 1 },
    {
      prompt: 'Que valores pode dar random.randint(1, 6)?',
      options: ['De 1 a 5', 'De 1 a 6', 'De 0 a 6'],
      answer: 1,
    },
    {
      prompt: 'Para usar só sqrt, sem o prefixo math., escreve-se…',
      options: ['import sqrt', 'from math import sqrt', 'use math.sqrt'],
      answer: 1,
    },
  ],
  exercises: [
    (c) => {
      const n = c.int(2, 15)
      return c.out(
        `import math\nprint(math.sqrt(${n * n}))`,
        `${n}.0`,
        `A raiz quadrada de ${n * n}; sqrt dá sempre float.`,
      )
    },
    (c) => {
      const base = c.int(2, 15)
      const x = c.pick(['2', '5', '8'])
      return c.out(
        `import math\nprint(math.floor(${base}.${x}), math.ceil(${base}.${x}))`,
        `${base} ${base + 1}`,
        'floor arredonda para baixo; ceil, para cima.',
      )
    },
    (c) => {
      const digits = c.int(1, 3)
      return c.out(
        `import math\nprint(round(math.pi, ${digits}))`,
        { 1: '3.1', 2: '3.14', 3: '3.142' }[digits] ?? '',
        `pi arredondado a ${digits} casa(s) decimal(is).`,
      )
    },
    (c) => {
      const n = c.int(2, 12)
      return c.out(
        `from math import sqrt\nprint(sqrt(${n * n}))`,
        `${n}.0`,
        'Com from … import usa-se sqrt sem o prefixo.',
      )
    },
    (c) => {
      const a = c.int(1, 20)
      const b = a + c.int(5, 40)
      return c.out(`print(abs(${a} - ${b}))`, String(b - a), 'abs() dá o valor sem sinal.')
    },
    (c) => {
      const price = c.int(2, 9) * 100 + c.int(1, 99)
      return c.out(
        `import math\nprint(math.ceil(${price} / 100))`,
        String(Math.ceil(price / 100)),
        `${price} Kz a dividir por 100 e arredondado para cima (valores inventados).`,
      )
    },
    (c) =>
      c.ask(
        'Que valores pode devolver random.randint(1, 6)?',
        '1, 2, 3, 4, 5 ou 6.',
        ['Só de 1 a 5.', 'Qualquer decimal entre 1 e 6.'],
        'randint inclui os dois extremos e devolve inteiros.',
      ),
    (c) =>
      c.ask(
        'Porque não se consegue prever o que imprime um programa com random.randint?',
        'Porque o valor é sorteado de cada vez que corre.',
        ['Porque o Python tem um erro.', 'Porque randint devolve sempre 0.'],
        'O que se prevê é o intervalo, não o valor.',
      ),
    (c) =>
      c.fill(
        '___ math\nprint(math.sqrt(25))   # 5.0',
        [['import']],
        'import traz o módulo para o programa.',
        'Completa com a palavra que importa o módulo.',
      ),
    (c) =>
      c.fill(
        'from random import ___\ndice = randint(1, 6)',
        [['randint']],
        'from módulo import função traz só essa função.',
        'Completa com a função que sorteia um inteiro.',
      ),
  ],
})
