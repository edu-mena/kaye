import { defineTopic } from './kit'

// Topic 7: input and conversions. Theme from the Python Programming Wikibook (Input and Output); written from scratch.
// "What the person types" is part of the statement, since the code is never run.

export default defineTopic({
  id: 't07',
  intro: [
    'A função input() faz uma pergunta, espera que a pessoa escreva e carregue em Enter, e devolve o que ela escreveu. Devolve sempre texto (str), mesmo que a pessoa escreva um número.',
    'Para fazer contas converte-se: int("18") dá 18, float("2.5") dá 2.5 e str(18) dá "18". Se o texto não for um número (int("dezoito")), o programa para com um ValueError.',
  ],
  rule: 'input() devolve sempre str. Para calcular: int(input(…)) ou float(input(…)). int() não aceita decimais em texto ("2.5") nem texto com letras.',
  code: {
    caption: 'Perguntar, converter e calcular.',
    lines: [
      'name = input("Como te chamas? ")',
      'birth_year = int(input("Ano em que nasceste? "))',
      'age = 2026 - birth_year',
      'print(f"Olá, {name}! Fazes {age} anos em 2026.")',
    ],
  },
  points: [
    'input() pergunta e devolve sempre texto.',
    'int(), float() e str() convertem entre tipos.',
    'Converter texto que não é número dá ValueError.',
  ],
  quiz: [
    { prompt: 'Que tipo devolve input()?', options: ['int', 'str', 'float'], answer: 1 },
    { prompt: 'O que dá int("7") + 3?', options: ['73', '10', 'Erro'], answer: 1 },
    { prompt: 'O que dá int("sete")?', options: ['7', '"sete"', 'Erro ValueError'], answer: 2 },
  ],
  exercises: [
    (c) => {
      const n = c.int(2, 9)
      return c.out(
        `n = input()\nprint(n + n)\n# a pessoa escreve ${n}`,
        `${n}${n}`,
        'input() devolve texto: n + n junta dois textos, não soma.',
      )
    },
    (c) => {
      const n = c.int(2, 9)
      return c.out(
        `n = int(input())\nprint(n + n)\n# a pessoa escreve ${n}`,
        String(n + n),
        'Com int(), n é um número e o + soma.',
      )
    },
    (c) => {
      const fare = c.int(2, 6) * 100
      const trips = c.int(2, 9)
      return c.out(
        `fare = int(input())\ntrips = int(input())\nprint(fare * trips)\n# a pessoa escreve ${fare} e depois ${trips}`,
        String(fare * trips),
        'Os dois valores são convertidos para int e multiplicam-se.',
      )
    },
    (c) => {
      const price = c.int(2, 9) + 0.5
      return c.out(
        `price = float(input())\nprint(price * 2)\n# a pessoa escreve ${price}`,
        (price * 2).toFixed(1),
        'float() aceita decimais; o dobro de um float é um float.',
      )
    },
    (c) => {
      const n = c.int(10, 99)
      return c.out(
        `text = input()\nprint(type(text))\n# a pessoa escreve ${n}`,
        "<class 'str'>",
        'input() devolve str, mesmo que a pessoa escreva um número.',
      )
    },
    (c) =>
      c.ask(
        'O que acontece com int(input()) se a pessoa escrever "dez"?',
        'O programa pára com um ValueError.',
        ['Dá o número 10.', 'Dá o texto "dez" e continua.'],
        'int() só converte texto que seja um número.',
      ),
    (c) => {
      const year = c.int(2005, 2012)
      return c.out(
        `year = int(input())\nprint(2026 - year)\n# a pessoa escreve ${year}`,
        String(2026 - year),
        'A idade que a pessoa faz em 2026.',
      )
    },
    (c) => {
      const n = c.int(10, 40)
      return c.fill(
        `age = ___(input("Idade? "))\nprint(age + 1)   # a pessoa escreve ${n}`,
        [['int']],
        'int() converte o texto no número inteiro que se pode somar.',
        'Completa para que o programa some 1 à idade.',
      )
    },
    (c) =>
      c.order(
        'Ordena as linhas para perguntar o nome e saudar a pessoa.',
        ['name = input("Nome? ")', 'greeting = "Olá, " + name', 'print(greeting)'],
        'Primeiro pergunta-se, depois constrói-se o texto, por fim mostra-se.',
      ),
  ],
})
