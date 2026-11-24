import { defineTopic, py } from './kit'

// Topic 22: errors and try/except. Theme from the Python Programming Wikibook (Errors); written from scratch.

export default defineTopic({
  id: 't22',
  intro: [
    'Quando algo corre mal, o Python levanta um erro (exception) e o programa pára. Alguns erros podem ser previstos: a pessoa escreve “abc” onde pedias um número (ValueError) ou o programa divide por zero (ZeroDivisionError). Com try/except podes tratar o erro e continuar.',
    'O código que pode falhar vai no bloco try. Se der erro, o Python salta o resto do try e corre o except desse tipo de erro. Escreve o tipo concreto (except ValueError), não um except vazio, que escondia erros que nem sequer previste. O bloco finally, se existir, corre sempre.',
  ],
  rule: 'try: código que pode falhar / except TipoDeErro: o que fazer / finally: corre sempre. Se não houver erro, o except é ignorado.',
  code: {
    caption: 'Tratar um número mal escrito.',
    lines: [
      'text = "abc"',
      'try:',
      '    n = int(text)',
      '    print("Número:", n)',
      'except ValueError:',
      '    print("Isso não é um número")   # corre este',
      'finally:',
      '    print("Fim")                    # corre sempre',
    ],
  },
  points: [
    'try tenta; except trata o erro desse tipo; finally corre sempre.',
    'Depois do erro, o resto do try não corre.',
    'Escreve o tipo do erro: except ValueError, não except sozinho.',
  ],
  quiz: [
    { prompt: 'Que erro dá int("abc")?', options: ['TypeError', 'ValueError', 'NameError'], answer: 1 },
    { prompt: 'Que erro dá 10 / 0?', options: ['ZeroDivisionError', 'ValueError', 'IndexError'], answer: 0 },
    {
      prompt: 'Quando corre o bloco finally?',
      options: ['Só se houver erro', 'Só se não houver erro', 'Sempre'],
      answer: 2,
    },
  ],
  exercises: [
    (c) => {
      const text = c.pick(['12', 'abc', '7', 'dez', '30'])
      const ok = /^\d+$/.test(text)
      return c.out(
        `text = "${text}"\ntry:\n    n = int(text)\n    print(n + 1)\nexcept ValueError:\n    print("inválido")`,
        ok ? String(Number(text) + 1) : 'inválido',
        ok ? 'A conversão funciona e o except é ignorado.' : 'int() falha com ValueError e corre o except.',
      )
    },
    (c) => {
      const b = c.pick([0, 2, 4, 5])
      const a = c.int(2, 9) * 20
      return c.out(
        `a = ${a}\nb = ${b}\ntry:\n    print(a / b)\nexcept ZeroDivisionError:\n    print("Não dá para dividir por zero")`,
        b === 0 ? 'Não dá para dividir por zero' : py.div(a, b),
        b === 0 ? 'Dividir por 0 levanta ZeroDivisionError.' : 'Sem erro, o except não corre; / dá float.',
      )
    },
    (c) => {
      const bad = c.pick([true, false])
      return c.out(
        `try:\n    print("A")\n    print(int("${bad ? 'x' : '5'}"))\n    print("B")\nexcept ValueError:\n    print("C")`,
        bad ? 'A\nC' : 'A\n5\nB',
        bad
          ? 'Depois do erro, o resto do try não corre: o "B" é saltado.'
          : 'Sem erro, corre tudo o try e nada do except.',
      )
    },
    (c) => {
      const bad = c.pick(['x', '9'])
      return c.out(
        `try:\n    n = int("${bad}")\nexcept ValueError:\n    print("erro")\nfinally:\n    print("fim")`,
        bad === 'x' ? 'erro\nfim' : 'fim',
        'O finally corre sempre, com ou sem erro.',
      )
    },
    (c) =>
      c.ask(
        'Que tipo de erro dá numbers[5] numa lista de 3 valores?',
        'IndexError',
        ['KeyError', 'ValueError'],
        'Índice fora da lista: IndexError.',
      ),
    (c) =>
      c.ask(
        'Que tipo de erro dá prices["milk"] se a chave não existe no dicionário?',
        'KeyError',
        ['IndexError', 'NameError'],
        'Chave em falta num dicionário: KeyError.',
      ),
    (c) =>
      c.ask(
        'Porque é melhor escrever except ValueError do que apenas except?',
        'Porque assim só trata o erro que previste e não esconde os outros.',
        ['Porque é mais curto.', 'Porque o except vazio não é permitido.'],
        'Um except vazio engole também erros que nem sequer pensaste.',
      ),
    (c) =>
      c.fill(
        'try:\n    n = int(text)\n___ ValueError:\n    print("inválido")',
        [['except']],
        'except é o bloco que trata o erro.',
        'Completa a palavra que trata o erro.',
      ),
    (c) =>
      c.fill(
        'try:\n    print(10 / 0)\nexcept ___:\n    print("Não dá")',
        [['ZeroDivisionError']],
        'Dividir por zero levanta ZeroDivisionError.',
        'Completa com o erro que dividir por zero levanta.',
      ),
    (c) =>
      c.order(
        'Ordena as linhas para pedir um número e tratar o caso de a pessoa escrever letras.',
        [
          'try:',
          '    n = int(input("Número? "))',
          'except ValueError:',
          '    print("Escreve só algarismos")',
        ],
        'try, o código que pode falhar, except e o tratamento.',
      ),
  ],
})
