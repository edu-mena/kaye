import { ACC, credit, debit, defineTopic, kz } from './kit'

// Topic 10: sales of goods. Theme from Wikipedia (Sales; Revenue); written from scratch. VAT comes in topic 11.

export default defineTopic({
  id: 't10',
  intro: [
    'Uma venda é um proveito: aumenta as Vendas, que é uma conta de crédito. Do outro lado, aumenta o que a loja recebeu. A pronto, o dinheiro entra na Caixa ou nos Bancos; a crédito, o cliente fica a dever e debita-se Clientes.',
    'A margem é o que sobra do preço de venda depois do custo da mercadoria. Para um preço com margem, soma-se ao custo a percentagem desejada. Neste tópico a venda ainda não regista o custo das mercadorias vendidas (tópico 13) nem o IVA (tópico 11).',
  ],
  rule: 'Venda: credita-se Vendas; debita-se Caixa ou Bancos (a pronto) ou Clientes (a crédito). Preço = custo + margem.',
  extra: [
    {
      type: 'examples',
      title: 'Duas vendas (valores inventados)',
      items: [
        { text: 'A pronto: D Caixa 20.000 Kz / C Vendas 20.000 Kz', note: 'O dinheiro entrou logo.' },
        { text: 'A crédito: D Clientes 20.000 Kz / C Vendas 20.000 Kz', note: 'O cliente ficou a dever.' },
      ],
    },
  ],
  points: [
    'Vendas é uma conta de proveitos: aumenta a crédito.',
    'A pronto debita-se Caixa ou Bancos; a crédito debita-se Clientes.',
    'Preço de venda = custo + margem.',
  ],
  quiz: [
    {
      prompt: 'Vendes a crédito. Que conta se debita?',
      options: ['Clientes', 'Fornecedores', 'Capital'],
      answer: 0,
    },
    {
      prompt: 'A conta Vendas aumenta em que lado?',
      options: ['Crédito', 'Débito', 'Nos dois'],
      answer: 0,
    },
    {
      prompt: 'Custo de 1.000 Kz e margem de 30%. Qual é o preço?',
      options: ['1.300 Kz', '1.030 Kz', '3.000 Kz'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const amount = c.base(10, 80)
      return c.entry(
        `A loja vende por ${kz(amount)} e recebe em dinheiro (sem IVA). Faz o lançamento.`,
        [debit(ACC.caixa, amount), credit(ACC.vendas, amount)],
        'Entra dinheiro (débito) e aumenta o proveito (crédito).',
        [ACC.clientes, ACC.mercadorias],
      )
    },
    (c) => {
      const amount = c.base(10, 80)
      return c.entry(
        `A loja vende por ${kz(amount)}, a cliente paga só no fim do mês (sem IVA). Faz o lançamento.`,
        [debit(ACC.clientes, amount), credit(ACC.vendas, amount)],
        'O cliente fica a dever (débito) e o proveito aumenta (crédito).',
        [ACC.caixa, ACC.fornecedores],
      )
    },
    (c) => {
      const amount = c.base(10, 80)
      return c.entry(
        `A loja vende por ${kz(amount)} e o cliente paga por transferência bancária (sem IVA). Faz o lançamento.`,
        [debit(ACC.bancos, amount), credit(ACC.vendas, amount)],
        'O dinheiro entrou na conta do banco.',
        [ACC.caixa, ACC.clientes],
      )
    },
    (c) => {
      const quantity = c.int(5, 40)
      const price = c.int(4, 30) * 50
      return c.num(
        `A loja vende ${quantity} pacotes de arroz a ${kz(price)} cada. Qual é o valor da venda?`,
        quantity * price,
        `${quantity} × ${price}.`,
      )
    },
    (c) => {
      const cost = c.int(10, 60) * 100
      const margin = c.pick([10, 20, 25, 30, 40, 50])
      return c.num(
        `Um artigo custa ${kz(cost)} à loja. Quer uma margem de ${margin}% sobre o custo. Qual é o preço de venda?`,
        (cost * (100 + margin)) / 100,
        `${cost} × ${(100 + margin) / 100}.`,
      )
    },
    (c) => {
      const sales = c.base(50, 200)
      const cost = c.base(20, 49)
      return c.num(
        `A loja vendeu ${kz(sales)} em mercadorias que lhe custaram ${kz(cost)}. Qual foi o ganho (margem bruta)?`,
        sales - cost,
        `${sales} − ${cost}.`,
      )
    },
    (c) =>
      c.ask(
        'Numa venda a crédito, que conta aumenta a débito?',
        'Clientes',
        ['Fornecedores', 'Vendas'],
        'O cliente fica a dever à loja: é um direito (ativo).',
      ),
    (c) =>
      c.fill(
        'Preço de venda = ___ + margem',
        [['custo']],
        'A margem é o que se acrescenta ao custo.',
        'Completa a fórmula.',
      ),
    (c) =>
      c.decide(
        [
          'Um cliente pede 80.000 Kz em mercadorias e promete pagar para a semana. A Ana nunca lhe vendeu antes.',
          'A loja precisa de vendas, mas também precisa de dinheiro.',
        ],
        [
          {
            text: 'Vender uma parte a crédito, receber uma parte agora e registar o resto em Clientes.',
            consequence: 'Reduz o risco e a dívida fica visível nas contas.',
          },
          {
            text: 'Vender sem registar nada: «é só uma semana».',
            consequence: 'Se o cliente esquecer, ninguém sabe quanto deve.',
          },
          {
            text: 'Recusar qualquer venda a crédito, mesmo a clientes de confiança.',
            consequence: 'Perdem-se vendas que se podiam cobrar.',
          },
        ],
        0,
        'O que faz mais sentido?',
      ),
  ],
})
