import { defineTopic } from './kit'

// Topic 30: mini-project, guessing game. Written from scratch.
// A random number cannot be predicted, so the exercises fix the secret number and the guesses.

/** What the game prints for each guess until the secret is found. */
function play(secret: number, guesses: number[]): string[] {
  const lines: string[] = []
  let tries = 0
  for (const guess of guesses) {
    tries += 1
    if (guess < secret) lines.push('Mais alto')
    else if (guess > secret) lines.push('Mais baixo')
    else {
      lines.push(`Acertaste em ${tries}`)
      break
    }
  }
  return lines
}

const listing = (secret: number, guesses: number[]) =>
  [
    `secret = ${secret}`,
    'tries = 0',
    `for guess in [${guesses.join(', ')}]:`,
    '    tries += 1',
    '    if guess < secret:',
    '        print("Mais alto")',
    '    elif guess > secret:',
    '        print("Mais baixo")',
    '    else:',
    '        print("Acertaste em", tries)',
    '        break',
  ].join('\n')

export default defineTopic({
  id: 't30',
  intro: [
    'Último mini-projeto: o jogo de adivinhar. O computador sorteia um número entre 1 e 20 com random.randint e a pessoa vai dando palpites. A cada palpite o programa diz “Mais alto” ou “Mais baixo” até acertar, e no fim diz em quantas tentativas.',
    'Junta quase tudo: import, input com conversão, while True com break, if/elif/else e um contador. Para testares uma lógica destas sem sorte, fixas o segredo (secret = 14) e escreves os palpites à mão: é o que fazemos nos exercícios.',
  ],
  rule: 'while True repete até um break. O contador tries += 1 conta as voltas. Num palpite menor que o segredo diz-se “Mais alto”; num maior, “Mais baixo”.',
  code: {
    caption: 'O jogo completo.',
    lines: [
      'import random',
      'secret = random.randint(1, 20)',
      'tries = 0',
      'while True:',
      '    guess = int(input("O teu palpite: "))',
      '    tries += 1',
      '    if guess < secret:',
      '        print("Mais alto")',
      '    elif guess > secret:',
      '        print("Mais baixo")',
      '    else:',
      '        print("Acertaste em", tries, "tentativas")',
      '        break',
    ],
  },
  points: [
    'random.randint sorteia o segredo; input + int lê o palpite.',
    'while True com break repete até acertar; tries conta as tentativas.',
    'Para testar, fixa o segredo e os palpites.',
  ],
  quiz: [
    {
      prompt: 'Com segredo 14, que resposta dá o palpite 9?',
      options: ['Mais alto', 'Mais baixo', 'Acertaste'],
      answer: 0,
    },
    {
      prompt: 'O que faz o break no fim do jogo?',
      options: ['Sai do ciclo while', 'Reinicia o jogo', 'Apaga o segredo'],
      answer: 0,
    },
    {
      prompt: 'Qual é o maior valor que random.randint(1, 20) pode dar?',
      options: ['19', '20', '21'],
      answer: 1,
    },
  ],
  exercises: [
    (c) => {
      const secret = c.int(5, 18)
      const guesses = [secret - c.int(1, 4), secret + c.int(1, 2), secret]
      return c.out(
        listing(secret, guesses),
        play(secret, guesses).join('\n'),
        `Segredo ${secret}: compara-se cada palpite.`,
      )
    },
    (c) => {
      const secret = c.int(8, 14)
      const guesses = [c.int(1, 5), c.int(15, 20), secret]
      return c.out(
        listing(secret, guesses),
        play(secret, guesses).join('\n'),
        'Mais alto quando o palpite é menor, mais baixo quando é maior.',
      )
    },
    (c) => {
      const secret = c.int(5, 15)
      const tries = c.int(1, 4)
      const guesses = [...Array.from({ length: tries - 1 }, (_, at) => secret - 1 - at), secret]
      return c.out(
        `secret = ${secret}\ntries = 0\nfor guess in [${guesses.join(', ')}]:\n    tries += 1\n    if guess == secret:\n        break\nprint(tries)`,
        String(tries),
        'tries conta as voltas até ao break; o último palpite é o certo.',
        'O que imprime este código?',
      )
    },
    (c) => {
      const secret = c.int(8, 14)
      const guess = secret + c.pick([-3, 3, 0])
      return c.out(
        `secret = ${secret}\nguess = ${guess}\nif guess < secret:\n    print("Mais alto")\nelif guess > secret:\n    print("Mais baixo")\nelse:\n    print("Acertaste")`,
        guess < secret ? 'Mais alto' : guess > secret ? 'Mais baixo' : 'Acertaste',
        `O palpite ${guess} comparado com o segredo ${secret}.`,
      )
    },
    (c) => {
      const low = c.int(1, 5)
      const high = low + c.int(6, 12)
      return c.out(
        `low = ${low}\nhigh = ${high}\nmiddle = (low + high) // 2\nprint(middle)`,
        String(Math.floor((low + high) / 2)),
        'O palpite do meio parte o intervalo ao meio: a melhor estratégia.',
      )
    },
    (c) =>
      c.ask(
        'Porque não se consegue prever o que o jogo imprime ao correr?',
        'Porque o número secreto é sorteado de cada vez.',
        ['Porque o input é lento.', 'Porque o Python muda o ciclo.'],
        'Para testar, fixa-se o segredo e os palpites.',
      ),
    (c) =>
      c.ask(
        'Qual é a melhor estratégia para adivinhar um número de 1 a 100 com menos tentativas?',
        'Tentar sempre o número do meio do intervalo que ainda resta.',
        ['Tentar números ao acaso.', 'Tentar sempre 1, 2, 3, 4…'],
        'Cada palpite do meio elimina metade das possibilidades: bastam 7 tentativas.',
      ),
    (c) =>
      c.fill(
        'while True:\n    guess = int(input())\n    if guess == secret:\n        print("Acertaste")\n        ___',
        [['break']],
        'break sai do while True.',
        'Completa a palavra que acaba o ciclo.',
      ),
    (c) =>
      c.order(
        'Ordena as linhas do início do jogo.',
        ['import random', 'secret = random.randint(1, 20)', 'tries = 0', 'while True:'],
        'Importa-se, sorteia-se, inicia-se o contador e começa o ciclo.',
      ),
    (c) =>
      c.decide(
        [
          'O Paulo escreveu o jogo, mas quando a pessoa escreve “vinte” em vez de 20, o programa pára com ValueError.',
          'Ele quer que o jogo continue.',
        ],
        [
          {
            text: 'Pôr o int(input()) dentro de um try/except ValueError e pedir de novo.',
            consequence: 'O jogo avisa e volta a pedir o palpite: é o que se pretende.',
          },
          { text: 'Trocar int por str.', consequence: 'Deixa de se poder comparar com o segredo.' },
          { text: 'Tirar o input e fixar o palpite.', consequence: 'O jogo deixa de ser um jogo.' },
        ],
        0,
        'Qual é a melhor solução?',
      ),
  ],
})
