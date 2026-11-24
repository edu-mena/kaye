import { ACC, credit, debit, defineTopic, kz } from './kit'

// Topic 9: purchases of goods. Theme from Wikipedia (Purchasing; Inventory); written from scratch. VAT comes in topic 11.

export default defineTopic({
  id: 't09',
  intro: [
    'Quando uma loja compra mercadorias para revender, as mercadorias entram no ativo (existências) pelo que custaram. A compra pode ser a pronto (paga-se logo, com dinheiro da caixa ou do banco) ou a crédito (paga-se mais tarde e fica uma dívida ao fornecedor).',
    'O custo da compra inclui tudo o que foi preciso para pôr as mercadorias na loja, como o transporte. Neste tópico ignoramos o IVA; vem no tópico 11.',
  ],
  rule: 'Compra de mercadorias: debita-se Mercadorias; credita-se Caixa ou Bancos (a pronto) ou Fornecedores (a crédito). O custo inclui o transporte.',
  extra: [
    {
      type: 'examples',
      title: 'Dois lançamentos de compra (valores inventados)',
      items: [
        {
          text: 'A pronto: D Mercadorias 60.000 Kz / C Caixa 60.000 Kz',
          note: 'O ativo troca de forma: dinheiro por mercadoria.',
        },
        {
          text: 'A crédito: D Mercadorias 60.000 Kz / C Fornecedores 60.000 Kz',
          note: 'Ficou uma dívida, que se paga mais tarde.',
        },
      ],
    },
  ],
  points: [
    'Mercadorias compradas são ativo até serem vendidas.',
    'A pronto credita-se Caixa ou Bancos; a crédito credita-se Fornecedores.',
    'O transporte da compra faz parte do custo das mercadorias.',
  ],
  quiz: [
    {
      prompt: 'Compras mercadorias a crédito. Que conta se credita?',
      options: ['Fornecedores', 'Clientes', 'Vendas'],
      answer: 0,
    },
    {
      prompt: 'O transporte para trazer as mercadorias para a loja…',
      options: ['Faz parte do custo das mercadorias', 'É sempre uma venda', 'Não se regista'],
      answer: 0,
    },
    {
      prompt: 'Uma compra a pronto, paga em dinheiro, credita…',
      options: ['Caixa', 'Fornecedores', 'Capital'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const amount = c.base(20, 120)
      return c.entry(
        `A loja compra mercadorias por ${kz(amount)} e paga em dinheiro (sem IVA). Faz o lançamento.`,
        [debit(ACC.mercadorias, amount), credit(ACC.caixa, amount)],
        'Entram mercadorias (débito); sai dinheiro da caixa (crédito).',
        [ACC.fornecedores, ACC.bancos],
      )
    },
    (c) => {
      const amount = c.base(20, 120)
      return c.entry(
        `A loja compra mercadorias por ${kz(amount)}, para pagar daqui a 30 dias (sem IVA). Faz o lançamento.`,
        [debit(ACC.mercadorias, amount), credit(ACC.fornecedores, amount)],
        'Entram mercadorias (débito) e fica uma dívida ao fornecedor (crédito).',
        [ACC.caixa, ACC.bancos],
      )
    },
    (c) => {
      const amount = c.base(20, 120)
      return c.entry(
        `A loja compra mercadorias por ${kz(amount)} e paga por transferência bancária (sem IVA). Faz o lançamento.`,
        [debit(ACC.mercadorias, amount), credit(ACC.bancos, amount)],
        'O dinheiro sai da conta no banco.',
        [ACC.caixa, ACC.fornecedores],
      )
    },
    (c) => {
      const quantity = c.int(10, 60)
      const price = c.int(2, 20) * 50
      return c.num(
        `A loja compra ${quantity} caixas de sabão a ${kz(price)} cada. Qual é o valor da compra?`,
        quantity * price,
        `${quantity} × ${price}.`,
      )
    },
    (c) => {
      const quantity = c.int(10, 40)
      const price = c.int(4, 20) * 50
      const transport = c.int(2, 10) * 500
      return c.num(
        `${quantity} caixas a ${kz(price)} cada, mais ${kz(transport)} de transporte pago pela loja. Qual é o custo total das mercadorias?`,
        quantity * price + transport,
        `${quantity} × ${price} + ${transport}: o transporte entra no custo.`,
      )
    },
    (c) => {
      const goods = c.base(30, 100)
      const transport = c.int(2, 10) * 500
      return c.entry(
        `Compras mercadorias por ${kz(goods)} e pagas ${kz(transport)} de transporte, tudo em dinheiro (sem IVA). Faz o lançamento.`,
        [debit(ACC.mercadorias, goods + transport), credit(ACC.caixa, goods + transport)],
        'O transporte soma-se ao custo das mercadorias.',
        [ACC.fornecedores, ACC.fst],
      )
    },
    (c) =>
      c.ask(
        'Que conta se credita numa compra de mercadorias a crédito?',
        'Fornecedores',
        ['Clientes', 'Vendas'],
        'A dívida é ao fornecedor.',
      ),
    (c) =>
      c.ask(
        'No dia da compra, as mercadorias são um custo ou um ativo?',
        'Um ativo (existências), até serem vendidas',
        ['Um custo, logo no dia da compra', 'Um proveito'],
        'Só se tornam custo quando se vendem (tópico 13).',
      ),
    (c) =>
      c.decide(
        [
          'O fornecedor oferece mercadorias por 120.000 Kz, a pagar daqui a 30 dias. A caixa da loja tem só 40.000 Kz.',
          'Já há clientes à espera destes artigos.',
        ],
        [
          {
            text: 'Comprar a crédito e pagar quando o dinheiro das vendas entrar.',
            consequence: 'A loja vende já e paga com o que recebe.',
          },
          {
            text: 'Recusar, porque comprar a crédito é sempre mau.',
            consequence: 'Perde as vendas por falta de mercadoria.',
          },
          {
            text: 'Pagar 120.000 Kz agora, mesmo que não haja dinheiro.',
            consequence: 'A conta Caixa ficava com saldo credor, o que é impossível.',
          },
        ],
        0,
        'O que faz mais sentido?',
      ),
  ],
})
