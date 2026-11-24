import { defineTopic, kz } from './kit'

// Topic 3: the accounting equation. Theme from Wikipedia (Accounting equation); written from scratch.

export default defineTopic({
  id: 't03',
  intro: [
    'A equação fundamental diz que o ativo é sempre igual ao passivo mais o capital próprio: Ativo = Passivo + Capital próprio. Tudo o que a empresa tem foi pago com dívidas (passivo) ou com dinheiro do dono (capital próprio).',
    'Cada facto mexe na equação mas nunca a desequilibra. Se compras mercadorias a pronto, um ativo (mercadorias) sobe e outro (caixa) desce. Se compras a crédito, o ativo sobe e o passivo sobe por igual.',
  ],
  rule: 'Ativo = Passivo + Capital próprio. Depois de qualquer facto, os dois lados continuam iguais.',
  extra: [
    {
      type: 'table',
      caption: 'Como alguns factos mexem na equação.',
      head: ['Facto', 'Ativo', 'Passivo', 'Capital próprio'],
      rows: [
        ['O dono põe dinheiro na caixa', '+', '', '+'],
        ['Compra de mercadorias a crédito', '+', '+', ''],
        ['Compra de mercadorias a pronto', '+ e −', '', ''],
        ['Pagamento de uma dívida', '−', '−', ''],
      ],
    },
  ],
  points: [
    'Ativo = passivo + capital próprio, sempre.',
    'Cada facto mexe em pelo menos dois sítios da equação.',
    'Uma compra a pronto troca um ativo por outro; a crédito aumenta ativo e passivo.',
  ],
  quiz: [
    {
      prompt: 'Qual é a equação fundamental?',
      options: [
        'Ativo = Passivo + Capital próprio',
        'Ativo = Passivo − Capital próprio',
        'Passivo = Ativo + Capital próprio',
      ],
      answer: 0,
    },
    {
      prompt: 'Compras mercadorias a crédito. O que acontece?',
      options: ['O ativo e o passivo aumentam', 'O capital próprio diminui', 'O ativo diminui'],
      answer: 0,
    },
    {
      prompt: 'Pagas uma dívida com dinheiro da caixa. O que acontece?',
      options: ['O ativo e o passivo diminuem', 'O capital próprio aumenta', 'Só o passivo diminui'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const assets = c.base(200, 600)
      const liabilities = c.base(50, 190)
      return c.num(
        `Ativo de ${kz(assets)} e passivo de ${kz(liabilities)}. Qual é o capital próprio?`,
        assets - liabilities,
        `CP = A − P = ${assets} − ${liabilities}.`,
      )
    },
    (c) => {
      const liabilities = c.base(50, 190)
      const equity = c.base(100, 300)
      return c.num(
        `O passivo é ${kz(liabilities)} e o capital próprio é ${kz(equity)}. Qual é o ativo?`,
        liabilities + equity,
        `A = P + CP = ${liabilities} + ${equity}.`,
      )
    },
    (c) => {
      const assets = c.base(300, 700)
      const equity = c.base(100, 290)
      return c.num(
        `O ativo é ${kz(assets)} e o capital próprio é ${kz(equity)}. Qual é o passivo?`,
        assets - equity,
        `P = A − CP = ${assets} − ${equity}.`,
      )
    },
    (c) => {
      const amount = c.base(20, 100)
      return c.ask(
        `Compras mercadorias a pronto por ${kz(amount)}. Que efeito tem na equação?`,
        'Um ativo aumenta e outro diminui; o total não muda',
        ['O ativo e o passivo aumentam', 'O capital próprio aumenta'],
        'Mercadorias sobem e a caixa desce pelo mesmo valor.',
      )
    },
    (c) => {
      const amount = c.base(20, 100)
      return c.ask(
        `Compras mercadorias a crédito por ${kz(amount)}. Que efeito tem?`,
        'O ativo e o passivo aumentam por igual',
        ['Só o ativo aumenta', 'O capital próprio aumenta'],
        'As mercadorias entram (ativo) e fica a dívida ao fornecedor (passivo).',
      )
    },
    (c) => {
      const amount = c.base(50, 200)
      return c.ask(
        `O dono põe ${kz(amount)} na caixa do negócio. Que efeito tem?`,
        'O ativo e o capital próprio aumentam por igual',
        ['O ativo e o passivo aumentam', 'Só o passivo aumenta'],
        'O dinheiro é novo ativo e pertence ao dono (capital próprio).',
      )
    },
    (c) => {
      const amount = c.base(10, 80)
      return c.ask(
        `Pagas ${kz(amount)} a um fornecedor com dinheiro da caixa. Que efeito tem?`,
        'O ativo e o passivo diminuem por igual',
        ['Só o ativo diminui', 'O capital próprio diminui'],
        'Sai dinheiro (ativo) e a dívida desaparece (passivo).',
      )
    },
    (c) => {
      const assets = c.base(200, 500)
      const liabilities = c.base(50, 150)
      const loan = c.base(20, 100)
      return c.num(
        `Antes: ativo ${kz(assets)} e passivo ${kz(liabilities)}. O banco empresta ${kz(loan)} (o dinheiro entra na conta). Qual é o novo ativo?`,
        assets + loan,
        `${assets} + ${loan}: o dinheiro novo é ativo, e o passivo sobe também.`,
      )
    },
    (c) =>
      c.fill(
        'Ativo = ___ + capital próprio',
        [['passivo']],
        'Tudo o que se tem foi financiado por dívidas ou pelo dono.',
      ),
  ],
})
