import { defineTopic } from './kit'

// Topic 19: functions. Theme from the Python Programming Wikibook (Functions); written from scratch.

export default defineTopic({
  id: 't19',
  intro: [
    'Uma função é um bloco de código com nome que podes usar muitas vezes. Define-se com def nome(parâmetros): e chama-se escrevendo nome(valores). Os parâmetros são as variáveis que a função recebe; os valores que passas na chamada chamam-se argumentos.',
    'return devolve um valor a quem chamou a função. Sem return, a função devolve None. Atenção: print mostra no ecrã, return entrega o resultado ao programa, que o pode guardar ou usar numa conta.',
  ],
  rule: 'def nome(a, b): … return resultado. Define-se uma vez e chama-se quantas quiseres. print mostra; return devolve. Sem return, o resultado é None.',
  code: {
    caption: 'Definir e chamar funções.',
    lines: [
      'def area(width, height):',
      '    return width * height',
      '',
      'def greet(name):',
      '    return "Olá, " + name + "!"',
      '',
      'print(area(3, 4))        # 12',
      'print(greet("Nzinga"))   # Olá, Nzinga!',
      'total = area(2, 5) + 1   # 11: o resultado usa-se numa conta',
    ],
  },
  points: [
    'def define; nome(argumentos) chama.',
    'return devolve o resultado; sem return a função devolve None.',
    'print mostra no ecrã; return entrega o valor ao programa.',
  ],
  quiz: [
    { prompt: 'Que palavra define uma função?', options: ['func', 'def', 'function'], answer: 1 },
    { prompt: 'O que devolve uma função sem return?', options: ['0', 'None', 'O último valor'], answer: 1 },
    {
      prompt: 'Com def double(n): return n * 2, quanto dá double(double(3))?',
      options: ['6', '12', '9'],
      answer: 1,
    },
  ],
  exercises: [
    (c) => {
      const n = c.int(2, 20)
      return c.out(
        `def double(n):\n    return n * 2\n\nprint(double(${n}))`,
        String(n * 2),
        'A função devolve o dobro do argumento.',
      )
    },
    (c) => {
      const w = c.int(2, 9)
      const h = c.int(2, 9)
      return c.out(
        `def area(width, height):\n    return width * height\n\nprint(area(${w}, ${h}))`,
        String(w * h),
        'width = ' + w + ' e height = ' + h + ': a função multiplica-os.',
      )
    },
    (c) => {
      const n = c.int(2, 9)
      return c.out(
        `def double(n):\n    return n * 2\n\nprint(double(double(${n})))`,
        String(n * 4),
        'Chama-se duas vezes: o resultado da primeira entra na segunda.',
      )
    },
    (c) => {
      const n = c.int(2, 9)
      return c.out(
        `def double(n):\n    n * 2\n\nprint(double(${n}))`,
        'None',
        'Sem return, a função não devolve o resultado: devolve None.',
      )
    },
    (c) => {
      const name = c.pick(['Ana', 'Paulo', 'Luzia', 'Kiala'])
      return c.out(
        `def greet(name):\n    return "Olá, " + name + "!"\n\nprint(greet("${name}"))`,
        `Olá, ${name}!`,
        'A função junta os textos e devolve-os.',
      )
    },
    (c) => {
      const n = c.int(1, 30)
      return c.out(
        `def is_even(n):\n    return n % 2 == 0\n\nprint(is_even(${n}))`,
        n % 2 === 0 ? 'True' : 'False',
        'A função devolve o resultado de uma comparação: um bool.',
      )
    },
    (c) => {
      const price = c.int(2, 9) * 100
      const qty = c.int(2, 6)
      return c.out(
        `def total(price, quantity):\n    return price * quantity\n\nprint(total(${price}, ${qty}) + 50)`,
        String(price * qty + 50),
        'O valor devolvido usa-se numa conta (preço em Kz inventado).',
      )
    },
    (c) =>
      c.ask(
        'Qual é a diferença entre print e return numa função?',
        'print mostra no ecrã; return devolve o valor a quem chamou.',
        ['São iguais.', 'return mostra no ecrã; print devolve o valor.'],
        'Só o valor devolvido se pode guardar numa variável ou usar numa conta.',
      ),
    (c) =>
      c.fill(
        'def square(n):\n    ___ n * n\n\nprint(square(4))   # 16',
        [['return']],
        'return devolve o resultado.',
        'Completa para a função devolver o quadrado.',
      ),
    (c) =>
      c.order(
        'Ordena as linhas para definir uma função que devolve o triplo e usá-la.',
        ['def triple(n):', '    return n * 3', 'result = triple(5)', 'print(result)'],
        'Define-se primeiro, chama-se depois.',
      ),
  ],
})
