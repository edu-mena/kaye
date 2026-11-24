import { ACC, credit, debit, defineTopic, kz } from './kit'

// Topic 13: stock and cost of goods sold. Theme from Wikipedia (Cost of goods sold; Inventory); written from scratch.

export default defineTopic({
  id: 't13',
  intro: [
    'As mercadorias que estão na loja são existências (stock) e valem o que custaram. Quando se vendem, deixam de ser ativo e passam a custo: é o custo das mercadorias vendidas (CMV). Só então se sabe quanto a venda realmente deu.',
    'Há dois modos de calcular o CMV. Com inventário permanente, regista-se o custo em cada venda: debita-se Custo das mercadorias vendidas e credita-se Mercadorias. Com a fórmula do fim do período: CMV = existências iniciais + compras − existências finais (as finais contam-se na prateleira).',
  ],
  rule: 'CMV = existências iniciais + compras − existências finais. Margem bruta = vendas − CMV.',
  extra: [
    {
      type: 'table',
      caption: 'Um mês da loja (valores inventados).',
      head: ['', 'Kz'],
      rows: [
        ['Existências iniciais', kz(200000)],
        ['+ Compras', kz(500000)],
        ['− Existências finais', kz(300000)],
        ['= Custo das mercadorias vendidas', kz(400000)],
      ],
    },
  ],
  points: [
    'Mercadorias em stock são ativo; vendidas, passam a custo (CMV).',
    'CMV = existências iniciais + compras − existências finais.',
    'Margem bruta = vendas − CMV.',
  ],
  quiz: [
    {
      prompt: 'Inicial 200.000, compras 500.000, final 300.000. Quanto é o CMV?',
      options: ['400.000 Kz', '1.000.000 Kz', '600.000 Kz'],
      answer: 0,
    },
    {
      prompt: 'Quando se vende uma mercadoria, que conta se credita no inventário permanente?',
      options: ['Mercadorias', 'Clientes', 'Capital'],
      answer: 0,
    },
    {
      prompt: 'Margem bruta é…',
      options: ['Vendas − custo das mercadorias vendidas', 'Vendas + compras', 'Compras − stock final'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const initial = c.base(50, 200)
      const purchases = c.base(200, 500)
      const final = c.base(50, 200)
      return c.num(
        `Existências iniciais ${kz(initial)}, compras ${kz(purchases)}, existências finais ${kz(final)}. Qual é o CMV?`,
        initial + purchases - final,
        `${initial} + ${purchases} − ${final}.`,
      )
    },
    (c) => {
      const initial = c.base(50, 200)
      const purchases = c.base(200, 400)
      const cost = c.base(100, 300)
      return c.num(
        `Existências iniciais ${kz(initial)}, compras ${kz(purchases)} e CMV de ${kz(cost)}. Qual é o valor do stock no fim?`,
        initial + purchases - cost,
        `Existências finais = ${initial} + ${purchases} − ${cost}.`,
      )
    },
    (c) => {
      const quantity = c.int(5, 40)
      const unit = c.int(4, 40) * 50
      const price = unit + c.int(2, 20) * 50
      return c.entry(
        `A loja vende ${quantity} unidades a ${kz(price)}, que lhe custaram ${kz(unit)} cada. Faz só o lançamento do custo das mercadorias vendidas.`,
        [debit(ACC.cmv, quantity * unit), credit(ACC.mercadorias, quantity * unit)],
        'O stock desce (crédito) pelo custo; o custo da venda sobe (débito).',
        [ACC.vendas, ACC.caixa],
      )
    },
    (c) => {
      const quantity = c.int(5, 40)
      const unit = c.int(4, 40) * 50
      return c.num(
        `${quantity} unidades que custaram ${kz(unit)} cada foram vendidas. Qual é o custo das mercadorias vendidas?`,
        quantity * unit,
        `${quantity} × ${unit}.`,
      )
    },
    (c) => {
      const sales = c.base(200, 600)
      const cost = c.base(100, 199)
      return c.num(
        `Vendas de ${kz(sales)} e CMV de ${kz(cost)}. Qual é a margem bruta?`,
        sales - cost,
        `${sales} − ${cost}.`,
      )
    },
    (c) => {
      const q1 = c.int(10, 30)
      const q2 = c.int(10, 30)
      const p1 = c.int(10, 20) * 50
      const p2 = p1 + c.int(1, 5) * 50
      return c.num(
        `A loja comprou ${q1} caixas a ${kz(p1)} e depois ${q2} caixas a ${kz(p2)}. Qual é o custo médio por caixa (arredonda às unidades)?`,
        Math.round((q1 * p1 + q2 * p2) / (q1 + q2)),
        `(${q1} × ${p1} + ${q2} × ${p2}) ÷ ${q1 + q2}.`,
        'Kz',
        1,
      )
    },
    (c) =>
      c.ask(
        'Uma mercadoria foi vendida. O que acontece à conta Mercadorias (stock)?',
        'Diminui, pelo custo da mercadoria',
        ['Aumenta, pelo preço de venda', 'Não muda'],
        'O stock sai da loja; desce pelo que custou, não pelo preço de venda.',
      ),
    (c) =>
      c.fill(
        'CMV = existências iniciais + ___ − existências finais',
        [['compras']],
        'O que havia mais o que se comprou, menos o que sobrou.',
      ),
    (c) =>
      c.decide(
        [
          'No fim do mês, a Ana contou as prateleiras e o stock vale menos 30.000 Kz do que as contas dizem.',
          'Pode ter havido roubo, erros ou mercadoria estragada.',
        ],
        [
          {
            text: 'Procurar a causa e registar a diferença como custo (quebra de stock).',
            consequence: 'As contas ficam verdadeiras e a Ana percebe onde se perde dinheiro.',
          },
          {
            text: 'Deixar as contas como estão: «é só uma diferença pequena».',
            consequence: 'O ativo fica maior do que é na realidade.',
          },
          {
            text: 'Aumentar as compras para tapar a diferença.',
            consequence: 'Esconde o problema e gasta dinheiro.',
          },
        ],
        0,
        'O que deve fazer?',
      ),
  ],
})
