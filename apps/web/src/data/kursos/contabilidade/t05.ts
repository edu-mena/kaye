import { ACC, credit, debit, defineTopic, kz } from './kit'

// Topic 5: debit and credit. Theme from Wikipedia (Debits and credits); written from scratch.

export default defineTopic({
  id: 't05',
  intro: [
    'Cada conta tem dois lados: o débito (esquerda) e o crédito (direita). Débito não quer dizer «mau» e crédito não quer dizer «bom»: são só lados. O que importa é saber de que lado cada tipo de conta aumenta.',
    'Ativos e custos aumentam a débito e diminuem a crédito. Passivo, capital próprio e proveitos aumentam a crédito e diminuem a débito. Por isso a Caixa (ativo) recebe dinheiro a débito, e as Vendas (proveito) aumentam a crédito.',
  ],
  rule: 'Ativos e custos: aumentam a débito. Passivo, capital próprio e proveitos: aumentam a crédito. O contrário diminui.',
  extra: [
    {
      type: 'table',
      caption: 'De que lado aumenta cada tipo de conta.',
      head: ['Tipo', 'Aumenta a…', 'Diminui a…', 'Exemplo'],
      rows: [
        ['Ativo', 'Débito', 'Crédito', 'Caixa'],
        ['Custo', 'Débito', 'Crédito', 'Custos com o pessoal'],
        ['Passivo', 'Crédito', 'Débito', 'Fornecedores'],
        ['Capital próprio', 'Crédito', 'Débito', 'Capital'],
        ['Proveito', 'Crédito', 'Débito', 'Vendas'],
      ],
    },
  ],
  points: [
    'Débito é o lado esquerdo e crédito é o lado direito.',
    'Ativos e custos sobem a débito; passivo, capital e proveitos sobem a crédito.',
    'Um lançamento nunca esquece um lado: o que se debita iguala o que se credita.',
  ],
  quiz: [
    {
      prompt: 'A Caixa recebe dinheiro. Em que lado?',
      options: ['Débito', 'Crédito', 'Nos dois'],
      answer: 0,
    },
    {
      prompt: 'As Vendas aumentam. Em que lado?',
      options: ['Débito', 'Crédito', 'Nenhum'],
      answer: 1,
    },
    {
      prompt: 'Uma dívida a fornecedores aumenta. Em que lado de Fornecedores?',
      options: ['Débito', 'Crédito', 'Depende do dia'],
      answer: 1,
    },
  ],
  exercises: [
    (c) => {
      const account = c.pick(['Caixa', 'Mercadorias', 'Equipamento', 'Clientes'])
      return c.ask(
        `A conta «${account}» (ativo) aumenta. Em que lado se regista?`,
        'Débito',
        ['Crédito', 'Nenhum dos lados'],
        'Os ativos aumentam a débito.',
      )
    },
    (c) => {
      const account = c.pick(['Fornecedores', 'Empréstimos bancários', 'Capital'])
      return c.ask(
        `A conta «${account}» aumenta. Em que lado se regista?`,
        'Crédito',
        ['Débito', 'Nenhum dos lados'],
        'Passivo e capital próprio aumentam a crédito.',
      )
    },
    (c) =>
      c.ask(
        'Os custos com o pessoal aumentam este mês. Em que lado?',
        'Débito',
        ['Crédito', 'Nenhum dos lados'],
        'Os custos aumentam a débito, tal como os ativos.',
      ),
    (c) =>
      c.ask(
        'A Caixa diminui (sai dinheiro). Em que lado?',
        'Crédito',
        ['Débito', 'Nenhum dos lados'],
        'Um ativo diminui a crédito.',
      ),
    (c) => {
      const open = c.base(20, 80)
      const received = c.base(10, 50)
      const paid = c.base(5, 19)
      return c.num(
        `A conta Caixa tem a débito ${kz(open)} e ${kz(received)}, e a crédito ${kz(paid)}. Qual é o saldo (devedor)?`,
        open + received - paid,
        `Saldo de uma conta de ativo = débitos − créditos = ${open + received} − ${paid}.`,
      )
    },
    (c) => {
      const amount = c.base(100, 500)
      return c.entry(
        `O dono põe ${kz(amount)} em dinheiro na caixa do negócio (capital). Faz o lançamento.`,
        [debit(ACC.caixa, amount), credit(ACC.capital, amount)],
        'A caixa (ativo) sobe a débito; o capital próprio sobe a crédito.',
        [ACC.vendas, ACC.fornecedores],
      )
    },
    (c) =>
      c.fill(
        'Ativos e custos aumentam a ___; passivo, capital e proveitos aumentam a ___.',
        [
          ['débito', 'debito'],
          ['crédito', 'credito'],
        ],
        'É a regra dos dois lados.',
      ),
    (c) =>
      c.ask(
        'O que quer dizer «debitar uma conta»?',
        'Registar um valor do lado esquerdo da conta',
        ['Tirar dinheiro à conta', 'Dizer que a conta está em dívida'],
        'Débito e crédito são só os dois lados; não querem dizer «tirar» nem «pôr».',
      ),
    (c) => {
      const amount = c.base(20, 100)
      return c.entry(
        `A loja recebe ${kz(amount)} de vendas a pronto, sem IVA. Faz o lançamento.`,
        [debit(ACC.caixa, amount), credit(ACC.vendas, amount)],
        'A caixa sobe a débito e o proveito (vendas) sobe a crédito.',
        [ACC.fornecedores, ACC.mercadorias],
      )
    },
  ],
})
