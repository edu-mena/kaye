import { defineTopic } from './kit'

// Topic 10: elif and chained decisions. Theme from the Python Programming Wikibook (Decisions); written from scratch.

const band = (grade: number) =>
  grade >= 16 ? 'Muito bom' : grade >= 14 ? 'Bom' : grade >= 10 ? 'Suficiente' : 'Insuficiente'

export default defineTopic({
  id: 't10',
  intro: [
    'Quando há mais de dois caminhos usa-se elif (“senão, se”). O Python testa as condições de cima para baixo e corre só o primeiro bloco cuja condição for verdadeira; o else, no fim, apanha o que sobrou.',
    'Por isso a ordem conta: põe primeiro a condição mais difícil de cumprir. Também podes pôr um if dentro de outro (condições aninhadas), com mais um nível de avanço.',
  ],
  rule: 'if … elif … elif … else: corre no máximo um bloco, o primeiro cuja condição seja verdadeira. Se nenhuma for, corre o else (se existir).',
  code: {
    caption: 'Uma escala de notas com elif.',
    lines: [
      'grade = 15',
      'if grade >= 16:',
      '    print("Muito bom")',
      'elif grade >= 14:',
      '    print("Bom")',
      'elif grade >= 10:',
      '    print("Suficiente")',
      'else:',
      '    print("Insuficiente")   # aqui imprime: Bom',
    ],
  },
  points: [
    'elif acrescenta caminhos; só corre o primeiro bloco verdadeiro.',
    'A ordem das condições muda o resultado.',
    'else apanha o que nenhuma condição apanhou.',
  ],
  quiz: [
    {
      prompt: 'Quantos blocos de um if/elif/else podem correr?',
      options: ['Todos', 'No máximo um', 'Pelo menos dois'],
      answer: 1,
    },
    {
      prompt: 'Com grade = 15 na escala da lição, o que imprime?',
      options: ['Muito bom', 'Bom', 'Suficiente'],
      answer: 1,
    },
    {
      prompt: 'Para que serve o else no fim?',
      options: [
        'Para o caso em que nenhuma condição foi verdadeira',
        'Para repetir o if',
        'Para terminar o programa',
      ],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const grade = c.int(3, 20)
      return c.out(
        `grade = ${grade}\nif grade >= 16:\n    print("Muito bom")\nelif grade >= 14:\n    print("Bom")\nelif grade >= 10:\n    print("Suficiente")\nelse:\n    print("Insuficiente")`,
        band(grade),
        'Testa-se de cima para baixo e corre o primeiro bloco verdadeiro.',
      )
    },
    (c) => {
      const n = c.int(-5, 5)
      return c.out(
        `n = ${n}\nif n > 0:\n    print("positivo")\nelif n < 0:\n    print("negativo")\nelse:\n    print("zero")`,
        n > 0 ? 'positivo' : n < 0 ? 'negativo' : 'zero',
        'Três caminhos: maior, menor, ou o que sobra (zero).',
      )
    },
    (c) => {
      const n = c.int(1, 30)
      return c.out(
        `n = ${n}\nif n % 3 == 0:\n    print("A")\nelif n % 2 == 0:\n    print("B")\nelse:\n    print("C")`,
        n % 3 === 0 ? 'A' : n % 2 === 0 ? 'B' : 'C',
        'Só corre o primeiro bloco verdadeiro; se n for múltiplo de 3 e de 2, imprime A.',
      )
    },
    (c) => {
      const n = c.int(1, 20)
      return c.out(
        `n = ${n}\nif n > 5:\n    print("X")\nelif n > 10:\n    print("Y")\nelse:\n    print("Z")`,
        n > 5 ? 'X' : 'Z',
        'O elif n > 10 nunca chega a correr: quem é maior que 10 já foi apanhado pelo primeiro if.',
      )
    },
    (c) => {
      const age = c.int(10, 70)
      const member = c.pick([true, false])
      const price = age < 12 ? 500 : age >= 60 ? 700 : member ? 1000 : 1500
      return c.out(
        `age = ${age}\nmember = ${member ? 'True' : 'False'}\nif age < 12:\n    price = 500\nelif age >= 60:\n    price = 700\nelse:\n    if member:\n        price = 1000\n    else:\n        price = 1500\nprint(price)`,
        String(price),
        'Preços em Kz inventados: primeiro a idade, e só no else se olha para o cartão de sócio.',
      )
    },
    (c) =>
      c.order(
        'Ordena as linhas para classificar o número n em positivo, negativo ou zero.',
        [
          'if n > 0:',
          '    print("positivo")',
          'elif n < 0:',
          '    print("negativo")',
          'else:',
          '    print("zero")',
        ],
        'if, elif e else, cada um com o seu bloco.',
      ),
    (c) =>
      c.fill(
        'if n > 0:\n    print("positivo")\n___ n < 0:\n    print("negativo")',
        [['elif']],
        'elif é o “senão, se”.',
        'Completa a palavra que liga a segunda condição.',
      ),
    (c) =>
      c.ask(
        'Porque é que se põe primeiro a condição mais restrita (nota >= 16) numa escala?',
        'Porque, se estivesse depois de nota >= 10, nunca chegaria a correr.',
        ['Porque o Python obriga a pôr o maior número primeiro.', 'Por estética; a ordem não muda nada.'],
        'O Python corre o primeiro bloco verdadeiro, e quem tem 16 também cumpre >= 10.',
      ),
    (c) =>
      c.decide(
        [
          'A Luzia escreveu um programa de bilhetes: if age >= 12: price = 1000, elif age >= 60: price = 500.',
          'Um senhor de 70 anos pagou 1000 em vez de 500 (valores inventados).',
        ],
        [
          {
            text: 'Pôr o elif age >= 60 primeiro.',
            consequence:
              'Quem tem 70 anos cumpre as duas condições; só a primeira corre, por isso a mais restrita tem de vir antes.',
          },
          {
            text: 'Trocar elif por else.',
            consequence: 'Continuava a ser o primeiro bloco a apanhar o senhor de 70 anos.',
          },
          {
            text: 'Apagar a condição age >= 12.',
            consequence: 'Resolvia este caso mas dava o preço errado às crianças.',
          },
        ],
        0,
        'Qual é a correção?',
      ),
  ],
})
