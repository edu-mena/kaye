import { defineTopic, kz } from './kit'

// Topic 7: the ledger and the balance of an account. Theme from Wikipedia (General ledger); written from scratch.

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)

export default defineTopic({
  id: 't07',
  intro: [
    'O diário ordena os factos por data; o razão ordena-os por conta. No razão, cada conta tem uma página (uma «conta em T») com os débitos à esquerda e os créditos à direita. Assim vês de uma vez tudo o que aconteceu na Caixa, nos Clientes ou nas Vendas.',
    'O saldo de uma conta é a diferença entre os dois lados. Se os débitos são maiores, o saldo é devedor; se os créditos são maiores, é credor. Uma conta de ativo tem normalmente saldo devedor, e uma de passivo ou de proveitos tem saldo credor.',
  ],
  rule: 'Saldo = total dos débitos − total dos créditos. Se for positivo é devedor; se for negativo é credor.',
  extra: [
    {
      type: 'table',
      caption: 'A conta Caixa (valores inventados).',
      head: ['Débito', 'Crédito'],
      rows: [
        [kz(100000), kz(30000)],
        [kz(50000), kz(20000)],
        ['Saldo devedor', kz(100000)],
      ],
    },
  ],
  points: [
    'O razão agrupa os movimentos por conta; o diário, por data.',
    'Saldo = débitos − créditos.',
    'A Caixa nunca pode ter saldo credor: não se paga mais do que há.',
  ],
  quiz: [
    {
      prompt: 'O que o razão mostra?',
      options: ['Os movimentos de cada conta', 'Só os lançamentos do dia', 'Os preços dos produtos'],
      answer: 0,
    },
    {
      prompt: 'Débitos de 90.000 Kz e créditos de 60.000 Kz. O saldo é…',
      options: ['Devedor de 30.000 Kz', 'Credor de 30.000 Kz', 'Devedor de 150.000 Kz'],
      answer: 0,
    },
    {
      prompt: 'Uma conta de passivo tem normalmente saldo…',
      options: ['Credor', 'Devedor', 'Sempre zero'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const debits = [c.base(20, 80), c.base(10, 50), c.base(5, 30)]
      const credits = [c.base(5, 25), c.base(5, 25)]
      return c.num(
        `A conta Caixa tem débitos de ${debits.map(kz).join(', ')} e créditos de ${credits.map(kz).join(' e ')}. Qual é o saldo devedor?`,
        sum(debits) - sum(credits),
        `${sum(debits)} − ${sum(credits)}.`,
      )
    },
    (c) => {
      const debits = [c.base(5, 20), c.base(5, 20)]
      const credits = [c.base(30, 60), c.base(10, 40)]
      return c.num(
        `A conta Fornecedores tem créditos de ${credits.map(kz).join(' e ')} e débitos de ${debits.map(kz).join(' e ')}. Qual é o saldo credor?`,
        sum(credits) - sum(debits),
        'Numa conta de passivo, o saldo é credor: créditos − débitos.',
      )
    },
    (c) => {
      const debit = c.base(40, 120)
      const credit = c.base(10, 39)
      return c.ask(
        `Uma conta tem débitos de ${kz(debit)} e créditos de ${kz(credit)}. Qual é o saldo?`,
        `Devedor de ${kz(debit - credit)}`,
        [`Credor de ${kz(debit - credit)}`, `Devedor de ${kz(debit + credit)}`],
        'Débitos maiores que créditos dão saldo devedor, igual à diferença.',
      )
    },
    (c) => {
      const credits = [c.base(30, 90), c.base(20, 80)]
      const returns = c.base(2, 15)
      return c.num(
        `A conta Vendas tem créditos de ${credits.map(kz).join(' e ')} e um débito de ${kz(returns)} (devolução). Qual é o saldo credor?`,
        sum(credits) - returns,
        `${sum(credits)} − ${returns}.`,
      )
    },
    (c) =>
      c.ask(
        'Qual é a diferença entre o diário e o razão?',
        'O diário ordena por data e o razão ordena por conta',
        ['O diário só tem vendas e o razão só tem compras', 'Não há diferença'],
        'Os mesmos lançamentos aparecem nos dois, com ordens diferentes.',
      ),
    (c) => {
      const debit = c.base(10, 30)
      const credit = c.base(31, 60)
      return c.ask(
        `A Caixa tem débitos de ${kz(debit)} e créditos de ${kz(credit)}. O que isto indica?`,
        'Há um erro: a caixa não pode ter saldo credor',
        ['Está tudo normal', 'A loja tem lucro'],
        'Não se pode pagar mais dinheiro do que o que está na caixa.',
      )
    },
    (c) =>
      c.fill(
        'Saldo devedor = total dos ___ menos o total dos ___',
        [
          ['débitos', 'debitos'],
          ['créditos', 'creditos'],
        ],
        'Numa conta de ativo, os débitos são o que entrou.',
      ),
    (c) => {
      const debits = [c.base(10, 40), c.base(10, 40)]
      const credits = [c.base(5, 20)]
      return c.num(
        `A conta Clientes tem débitos de ${debits.map(kz).join(' e ')} (vendas a crédito) e um crédito de ${kz(credits[0] ?? 0)} (um cliente pagou). Quanto devem os clientes?`,
        sum(debits) - sum(credits),
        'Saldo devedor de Clientes = o que ainda se tem a receber.',
      )
    },
    (c) =>
      c.ask(
        'Que tipo de saldo tem normalmente a conta Vendas?',
        'Credor',
        ['Devedor', 'Zero'],
        'Os proveitos aumentam a crédito.',
      ),
  ],
})
