import { defineTopic } from './kit'

// Topic 25: debugging. Theme from the Python Programming Wikibook (Errors); written from scratch.

const CASES = [
  { code: 'total = 10\nprint(totl)', error: 'NameError', why: 'O nome totl não existe: está mal escrito.' },
  {
    code: 'print("Idade: " + 17)',
    error: 'TypeError',
    why: 'Não se junta texto com um número sem converter.',
  },
  {
    code: 'age = 17\nif age > 14\n    print(age)',
    error: 'SyntaxError',
    why: 'Faltam os dois pontos no fim do if.',
  },
  {
    code: 'numbers = [1, 2, 3]\nprint(numbers[3])',
    error: 'IndexError',
    why: 'A lista só tem os índices 0, 1 e 2.',
  },
  { code: 'print(10 / 0)', error: 'ZeroDivisionError', why: 'Não se divide por zero.' },
  { code: 'n = int("abc")', error: 'ValueError', why: 'O texto "abc" não é um número.' },
  {
    code: 'prices = {"rice": 800}\nprint(prices["tea"])',
    error: 'KeyError',
    why: 'A chave "tea" não existe no dicionário.',
  },
  {
    code: 'def hello():\nprint("Olá")',
    error: 'IndentationError',
    why: 'O corpo da função tem de ter avanço.',
  },
]

export default defineTopic({
  id: 't25',
  intro: [
    'Todos os programadores têm erros nos programas: depurar (debug) é parte do ofício. Quando o Python pára, mostra uma mensagem (traceback): a última linha diz o tipo de erro e o que aconteceu, e acima dela está o número da linha onde falhou. Começa sempre por aí.',
    'Os erros são de três famílias: de sintaxe (SyntaxError, o código está mal escrito e nem arranca), de execução (NameError, TypeError, ValueError…, o programa arranca e pára) e de lógica (o programa corre sem erro mas dá o resultado errado). Para estes, acrescenta um print para ver o valor de uma variável a meio, e muda uma coisa de cada vez.',
  ],
  rule: 'Lê a última linha do erro, vai à linha indicada, muda uma coisa de cada vez e volta a correr. Num erro de lógica, usa print para ver os valores.',
  code: {
    caption: 'Um erro de lógica: o programa corre mas a soma está errada.',
    lines: [
      'total = 0',
      'for i in range(1, 5):          # só vai de 1 a 4',
      '    total += i',
      'print("total =", total)        # 10, e não 15',
      '',
      '# Corrigir: for i in range(1, 6)',
    ],
  },
  points: [
    'A última linha do erro diz o tipo; o número indica a linha.',
    'Sintaxe (não arranca), execução (pára) e lógica (resultado errado).',
    'Um print a meio mostra os valores; muda uma coisa de cada vez.',
  ],
  quiz: [
    {
      prompt: 'Onde se lê o tipo de erro numa mensagem do Python?',
      options: ['Na primeira linha', 'Na última linha', 'Não se lê'],
      answer: 1,
    },
    {
      prompt: 'O programa corre sem erro mas o resultado está errado. Que família de erro é?',
      options: ['Sintaxe', 'Execução', 'Lógica'],
      answer: 2,
    },
    {
      prompt: 'Qual é um bom hábito ao corrigir?',
      options: ['Mudar tudo de uma vez', 'Mudar uma coisa e voltar a correr', 'Apagar o programa'],
      answer: 1,
    },
  ],
  exercises: [
    (c) => {
      const item = c.pick(CASES)
      return c.out(
        item.code,
        item.error,
        item.why,
        'Que tipo de erro aparece ao correr este código? Escreve só o nome do erro.',
      )
    },
    (c) => {
      const before = c.int(1, 4)
      const lines = [
        ...Array.from({ length: before }, (_, at) => `x${at} = ${at + 1}`),
        'a = 5',
        'b = 0',
        'c = a / b',
        'print(c)',
      ]
      return c.out(
        lines.join('\n'),
        String(before + 3),
        'O erro está na linha da divisão por zero.',
        'Em que linha pára o programa? Escreve só o número da linha (a primeira é a 1).',
      )
    },
    (c) => {
      const start = c.int(2, 9)
      return c.out(
        `x = ${start}\nx = x + 1\nprint("x =", x)\ny = x * 2\nprint(y)`,
        `x = ${start + 1}\n${(start + 1) * 2}`,
        'Segue-se o valor de x linha a linha, como um print de depuração mostraria.',
      )
    },
    (c) => {
      const n = c.int(3, 8)
      return c.out(
        `total = 0\nfor i in range(1, ${n}):\n    total += i\nprint(total)`,
        String(((n - 1) * n) / 2),
        `range(1, ${n}) pára em ${n - 1}: a soma não inclui o ${n}. É um erro de lógica comum.`,
      )
    },
    (c) =>
      c.ask(
        'O que lês primeiro numa mensagem de erro do Python?',
        'A última linha, que diz o tipo de erro e o que aconteceu.',
        ['A primeira linha, que diz sempre a solução.', 'Nada: copia o erro e esquece.'],
        'Depois olhas o número da linha, que está acima.',
      ),
    (c) =>
      c.ask(
        'Escreveste if x = 5: em vez de if x == 5:. Que família de erro é?',
        'Sintaxe: o Python nem arranca.',
        ['Lógica: corre mas dá o resultado errado.', 'Execução: pára a meio.'],
        'Dentro de um if, o = não é permitido: era para comparar com ==.',
      ),
    (c) =>
      c.ask(
        'O programa corre, não dá nenhum erro, mas a média sai errada. Que tipo de erro é?',
        'Erro de lógica.',
        ['Erro de sintaxe.', 'O Python está avariado.'],
        'Sem mensagem, usa print para ver os valores a meio do programa.',
      ),
    (c) =>
      c.fill(
        'total = 0\nfor n in numbers:\n    total += n\n    print("total =", ___)   # vê o valor a cada volta',
        [['total']],
        'Um print do acumulador mostra como cresce a cada volta.',
        'Completa o print de depuração com a variável a vigiar.',
      ),
    (c) =>
      c.order(
        'Ordena os passos de depuração.',
        [
          'Ler a última linha da mensagem de erro',
          'Ir à linha indicada',
          'Mudar uma só coisa',
          'Voltar a correr o programa',
        ],
        'Ler, localizar, mudar e testar.',
      ),
    (c) =>
      c.decide(
        [
          'O Kiala escreveu um programa de caixa. Mostra o total errado em alguns pedidos, mas só com mais de 5 produtos.',
          'Não há mensagem de erro.',
        ],
        [
          {
            text: 'Testar com 5 e com 6 produtos e pôr prints para ver o total a cada volta.',
            consequence: 'O print mostra em que volta o valor sai do esperado; é o caminho mais curto.',
          },
          { text: 'Reescrever o programa todo.', consequence: 'Perdes tempo e podes criar erros novos.' },
          {
            text: 'Ignorar: só acontece de vez em quando.',
            consequence: 'O erro continua e vai dar prejuízo ao caixa.',
          },
        ],
        0,
        'Qual é o melhor passo?',
      ),
  ],
})
