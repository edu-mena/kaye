import { defineTopic } from './kit'

// Topic 12: the while loop. Theme from the Python Programming Wikibook (While loops); written from scratch.

export default defineTopic({
  id: 't12',
  intro: [
    'O ciclo while repete enquanto a condição for verdadeira. Antes de cada volta o Python testa a condição: se for False, o ciclo acaba. Usa-se quando não sabes quantas voltas vão ser, por exemplo “até a pessoa acertar na palavra-passe”.',
    'O perigo é o ciclo infinito: se nada dentro do bloco muda a condição, ela nunca deixa de ser verdadeira e o programa não pára. Quase sempre falta uma linha como i += 1.',
  ],
  rule: 'while condição: repete o bloco enquanto a condição for True. Dentro do bloco tem de mudar alguma coisa que acabe por tornar a condição False.',
  code: {
    caption: 'Contagem decrescente e um saldo que se gasta.',
    lines: [
      'count = 3',
      'while count > 0:',
      '    print(count)       # 3, 2, 1',
      '    count -= 1',
      'print("Fim")',
    ],
  },
  points: [
    'while repete enquanto a condição for True; a condição testa-se antes de cada volta.',
    'Algo no bloco tem de mudar a condição, senão o ciclo não acaba.',
    'for quando sabes quantas voltas; while quando não sabes.',
  ],
  quiz: [
    {
      prompt: 'Quando pára um ciclo while?',
      options: ['Quando a condição fica False', 'Depois de 10 voltas', 'Nunca pára'],
      answer: 0,
    },
    {
      prompt: 'Porque é que o ciclo while i < 3: print(i) nunca pára?',
      options: ['Falta i += 1', 'O print está errado', '3 é um número grande'],
      answer: 0,
    },
    {
      prompt: 'Se a condição é False logo à partida, quantas vezes corre o bloco?',
      options: ['Uma', 'Nenhuma', 'Duas'],
      answer: 1,
    },
  ],
  exercises: [
    (c) => {
      const start = c.int(2, 4)
      return c.out(
        `i = 0\nwhile i < ${start}:\n    print(i)\n    i += 1`,
        Array.from({ length: start }, (_, at) => at).join('\n'),
        `Corre enquanto i for menor que ${start}.`,
      )
    },
    (c) => {
      const start = c.int(3, 5)
      return c.out(
        `count = ${start}\nwhile count > 0:\n    print(count)\n    count -= 1`,
        Array.from({ length: start }, (_, at) => start - at).join('\n'),
        'Conta-se para trás até count chegar a 0.',
      )
    },
    (c) => {
      const limit = c.int(20, 90)
      let n = 1
      while (n < limit) n *= 2
      return c.out(
        `n = 1\nwhile n < ${limit}:\n    n = n * 2\nprint(n)`,
        String(n),
        `n duplica até deixar de ser menor que ${limit}.`,
      )
    },
    (c) => {
      const price = c.int(2, 5) * 100
      const balance = c.int(8, 20) * 100
      return c.out(
        `balance = ${balance}\nprice = ${price}\nbought = 0\nwhile balance >= price:\n    balance -= price\n    bought += 1\nprint(bought)`,
        String(Math.floor(balance / price)),
        `Quantas vezes cabem ${price} Kz em ${balance} Kz (valores inventados).`,
      )
    },
    (c) => {
      const n = c.int(1, 4)
      return c.out(
        `i = ${n}\nwhile i < ${n}:\n    print(i)\n    i += 1\nprint("fim")`,
        'fim',
        'A condição é False logo à partida: o bloco nunca corre.',
      )
    },
    (c) =>
      c.ask(
        'O que acontece com i = 0 e while i < 3: print(i), sem mais nenhuma linha no bloco?',
        'Escreve 0 sem parar: o ciclo é infinito.',
        ['Escreve 0, 1 e 2.', 'Escreve 0 uma vez e pára.'],
        'Nada muda i, por isso a condição é sempre verdadeira.',
      ),
    (c) =>
      c.fill(
        'count = 0\nwhile count ___ 3:\n    print(count)\n    count += 1',
        [['<']],
        'Corre enquanto count for menor que 3: imprime 0, 1 e 2.',
        'Completa a condição para imprimir 0, 1 e 2.',
      ),
    (c) =>
      c.order(
        'Ordena as linhas de uma contagem decrescente a partir de 3.',
        ['n = 3', 'while n > 0:', '    print(n)', '    n -= 1'],
        'Inicializa-se, testa-se, usa-se e muda-se.',
      ),
    (c) =>
      c.ask(
        'Quando escolhes while em vez de for?',
        'Quando não sabes quantas voltas vão ser.',
        ['Quando queres percorrer um texto.', 'Quando queres gastar menos memória.'],
        'for é para um número ou sequência conhecidos; while para “até que…”.',
      ),
  ],
})
