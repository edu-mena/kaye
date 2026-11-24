import { defineTopic, kz } from './kit'

// Topic 24: the balance sheet. Theme from Wikipedia (Balance sheet); written from scratch.

export default defineTopic({
  id: 't24',
  intro: [
    'O balanço é a fotografia do património numa data (por exemplo, 31 de dezembro). De um lado mostra o ativo: o imobilizado (já deduzido das amortizações acumuladas), as existências, o que os clientes devem, e o dinheiro. Do outro mostra o passivo (fornecedores, Estado, pessoal, empréstimos) e o capital próprio (capital mais resultados).',
    'O balanço tem de equilibrar-se: total do ativo = total do passivo + capital próprio. A demonstração de resultados mostra o que aconteceu ao longo do ano; o balanço mostra onde se chegou. O resultado do ano faz parte do capital próprio.',
  ],
  rule: 'Balanço: Ativo = Passivo + Capital próprio (capital + resultado). O equipamento aparece pelo valor líquido (custo − amortizações acumuladas).',
  extra: [
    {
      type: 'table',
      caption: 'Um balanço a 31 de dezembro (valores inventados).',
      head: ['Ativo', 'Kz', 'Passivo e capital próprio', 'Kz'],
      rows: [
        ['Equipamento (líquido)', kz(150000), 'Fornecedores', kz(100000)],
        ['Mercadorias', kz(300000), 'Estado (IVA a pagar)', kz(28000)],
        ['Clientes', kz(80000), 'Capital', kz(300000)],
        ['Caixa e bancos', kz(168000), 'Resultado do exercício', kz(270000)],
        ['Total do ativo', kz(698000), 'Total', kz(698000)],
      ],
    },
  ],
  points: [
    'O balanço é uma fotografia numa data: ativo = passivo + capital próprio.',
    'O equipamento mostra-se pelo valor líquido.',
    'O resultado do ano entra no capital próprio.',
  ],
  quiz: [
    {
      prompt: 'O balanço mostra…',
      options: ['O património numa data', 'Os ganhos de um ano', 'Só as vendas'],
      answer: 0,
    },
    {
      prompt: 'Ativo de 698.000 Kz e passivo de 128.000 Kz. Qual é o capital próprio?',
      options: ['570.000 Kz', '826.000 Kz', '128.000 Kz'],
      answer: 0,
    },
    {
      prompt: 'Onde entra o resultado do ano?',
      options: ['No capital próprio', 'No passivo', 'No ativo'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const equipment = c.base(100, 300)
      const stock = c.base(150, 400)
      const customers = c.base(30, 100)
      const cash = c.base(50, 200)
      return c.num(
        `Equipamento ${kz(equipment)}, mercadorias ${kz(stock)}, clientes ${kz(customers)} e caixa e bancos ${kz(cash)}. Qual é o total do ativo?`,
        equipment + stock + customers + cash,
        `${equipment} + ${stock} + ${customers} + ${cash}.`,
      )
    },
    (c) => {
      const assets = c.base(500, 900)
      const suppliers = c.base(50, 200)
      const state = c.base(10, 50)
      return c.num(
        `O ativo é ${kz(assets)}; o passivo tem fornecedores de ${kz(suppliers)} e Estado de ${kz(state)}. Qual é o capital próprio (com o resultado)?`,
        assets - suppliers - state,
        `${assets} − (${suppliers} + ${state}).`,
      )
    },
    (c) => {
      const capital = c.base(200, 400)
      const profit = c.base(30, 150)
      const liabilities = c.base(100, 250)
      return c.num(
        `Capital de ${kz(capital)}, resultado do ano de ${kz(profit)} e passivo de ${kz(liabilities)}. Qual é o total do ativo?`,
        capital + profit + liabilities,
        `Ativo = passivo + capital + resultado = ${liabilities} + ${capital} + ${profit}.`,
      )
    },
    (c) => {
      const cost = c.base(150, 300)
      const accumulated = c.base(30, 100)
      return c.num(
        `O equipamento custou ${kz(cost)} e tem ${kz(accumulated)} de amortizações acumuladas. Por que valor aparece no balanço?`,
        cost - accumulated,
        `${cost} − ${accumulated}.`,
      )
    },
    (c) => {
      const assets = c.base(500, 900)
      const gap = c.int(1, 9) * 500
      return c.num(
        `O ativo soma ${kz(assets)} e o passivo mais o capital próprio somam ${kz(assets - gap)}. Quanto falta para o balanço equilibrar?`,
        gap,
        'O balanço tem de equilibrar-se: se não, há um erro de registo.',
      )
    },
    (c) =>
      c.ask(
        'Qual é a diferença entre o balanço e a demonstração de resultados?',
        'O balanço mostra o património numa data; a demonstração, os ganhos e gastos de um período',
        ['São o mesmo relatório', 'O balanço só mostra as vendas'],
        'Um é uma fotografia, o outro é um filme.',
      ),
    (c) =>
      c.ask(
        'As dívidas a fornecedores aparecem no…',
        'Passivo',
        ['Ativo', 'Capital próprio'],
        'São o que a loja deve.',
      ),
    (c) =>
      c.fill(
        'No balanço, o total do ativo é igual ao total do passivo mais o ___ próprio.',
        [['capital']],
        'A equação fundamental.',
      ),
    (c) =>
      c.decide(
        [
          'O balanço da loja tem ativo de 700.000 Kz e passivo + capital de 640.000 Kz.',
          'O contabilista tem de entregar as contas amanhã.',
        ],
        [
          {
            text: 'Procurar os 60.000 Kz de diferença no balancete e nos lançamentos do fecho.',
            consequence: 'Acha o erro e entrega um balanço correto.',
          },
          {
            text: 'Aumentar o capital em 60.000 Kz para igualar.',
            consequence: 'Esconde o erro e inventa capital.',
          },
          {
            text: 'Entregar assim e explicar depois.',
            consequence: 'Um balanço que não equilibra está errado.',
          },
        ],
        0,
        'O que deve fazer?',
      ),
  ],
})
