import { defineTopic, kz } from './kit'

// Topic 23: the income statement. Theme from Wikipedia (Income statement); written from scratch. Corporate tax on
// profit is not taught here.

export default defineTopic({
  id: 't23',
  intro: [
    'A demonstração de resultados responde a «ganhei ou perdi?» num período. Começa pelas vendas, tira o custo das mercadorias vendidas (e obtém a margem bruta) e depois tira os outros custos: pessoal, serviços de terceiros, amortizações. O que sobra é o resultado do período: lucro, se for positivo, ou prejuízo, se for negativo.',
    'Só entram custos e proveitos do período (especialização). O IVA não entra: não é nem ganho nem custo da loja. Nem o dinheiro que o dono põe, nem as compras de equipamento: o equipamento só entra pela amortização do ano. O imposto sobre o lucro não é ensinado neste Kurso.',
  ],
  rule: 'Resultado = proveitos − custos. Vendas − CMV = margem bruta; margem bruta − outros custos = resultado.',
  extra: [
    {
      type: 'table',
      caption: 'A demonstração de resultados de um ano (valores inventados).',
      head: ['', 'Kz'],
      rows: [
        ['Vendas', kz(1200000)],
        ['− Custo das mercadorias vendidas', kz(700000)],
        ['= Margem bruta', kz(500000)],
        ['− Custos com o pessoal', kz(200000)],
        ['− Fornecimentos e serviços de terceiros', kz(100000)],
        ['− Amortizações do exercício', kz(50000)],
        ['= Resultado do exercício (lucro)', kz(150000)],
      ],
    },
  ],
  points: [
    'Resultado = proveitos − custos do período.',
    'Margem bruta = vendas − custo das mercadorias vendidas.',
    'O IVA, o capital do dono e as compras de equipamento não entram.',
  ],
  quiz: [
    {
      prompt: 'Vendas de 1.200.000 e CMV de 700.000. Margem bruta?',
      options: ['500.000 Kz', '1.900.000 Kz', '700.000 Kz'],
      answer: 0,
    },
    {
      prompt: 'O IVA cobrado aos clientes entra nas vendas da demonstração de resultados?',
      options: ['Não', 'Sim', 'Só metade'],
      answer: 0,
    },
    {
      prompt: 'Se os custos são maiores do que os proveitos, o resultado é…',
      options: ['Um prejuízo', 'Um lucro', 'Zero'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const sales = c.base(500, 1500)
      const cost = c.base(200, 499)
      return c.num(
        `Vendas de ${kz(sales)} e custo das mercadorias vendidas de ${kz(cost)}. Qual é a margem bruta?`,
        sales - cost,
        `${sales} − ${cost}.`,
      )
    },
    (c) => {
      const gross = c.base(300, 600)
      const staff = c.base(80, 150)
      const services = c.base(30, 80)
      const depreciation = c.base(10, 40)
      return c.num(
        `Margem bruta de ${kz(gross)}; pessoal ${kz(staff)}; serviços de terceiros ${kz(services)}; amortizações ${kz(depreciation)}. Qual é o resultado do exercício?`,
        gross - staff - services - depreciation,
        `${gross} − ${staff} − ${services} − ${depreciation}.`,
      )
    },
    (c) => {
      const sales = c.base(600, 1200)
      const cost = c.base(300, 500)
      const staff = c.base(100, 200)
      const other = c.base(50, 150)
      return c.num(
        `Vendas ${kz(sales)}, CMV ${kz(cost)}, pessoal ${kz(staff)} e outros custos ${kz(other)}. Qual é o resultado?`,
        sales - cost - staff - other,
        `${sales} − ${cost} − ${staff} − ${other}.`,
      )
    },
    (c) => {
      const profit = c.pick([true, false])
      const proveitos = c.base(300, 500)
      const diff = c.base(20, 80)
      const costs = profit ? proveitos - diff : proveitos + diff
      return c.ask(
        `Proveitos de ${kz(proveitos)} e custos de ${kz(costs)}. Qual foi o resultado?`,
        profit ? `Lucro de ${kz(diff)}` : `Prejuízo de ${kz(diff)}`,
        profit
          ? [`Prejuízo de ${kz(diff)}`, `Lucro de ${kz(proveitos)}`]
          : [`Lucro de ${kz(diff)}`, `Prejuízo de ${kz(costs)}`],
        'Resultado = proveitos − custos; negativo é prejuízo.',
      )
    },
    (c) => {
      const sales = c.base(400, 900)
      const returns = c.base(10, 50)
      return c.num(
        `A loja vendeu ${kz(sales)} (sem IVA) e teve ${kz(returns)} de devoluções de vendas. Quanto são as vendas líquidas?`,
        sales - returns,
        `${sales} − ${returns}.`,
      )
    },
    (c) =>
      c.ask(
        'O IVA que a loja cobra aos clientes entra nas vendas da demonstração de resultados?',
        'Não: é do Estado',
        ['Sim, é parte da venda', 'Só se for pago a pronto'],
        'O IVA é recolhido e entregue; não é proveito.',
      ),
    (c) =>
      c.ask(
        'A compra de um computador por 200.000 Kz entra de uma vez na demonstração de resultados?',
        'Não: entra só a amortização de cada ano',
        ['Sim, tudo no ano da compra', 'Não entra nunca'],
        'O equipamento é ativo; só a amortização do ano é custo.',
      ),
    (c) =>
      c.fill(
        'Resultado do período = ___ − custos',
        [['proveitos']],
        'Lucro se for positivo, prejuízo se for negativo.',
      ),
    (c) =>
      c.decide(
        [
          'O Paulo diz: «Pus 300.000 Kz do meu bolso na loja este mês, por isso tive 300.000 Kz de lucro.»',
          'As vendas foram 200.000 Kz e os custos 250.000 Kz.',
        ],
        [
          {
            text: 'Explicar que o dinheiro do dono é capital, não proveito, e que o mês teve prejuízo de 50.000 Kz.',
            consequence: 'O Paulo percebe a diferença entre o que o dono pôs e o que a loja ganhou.',
          },
          {
            text: 'Concordar: entrou dinheiro, é lucro.',
            consequence: 'Esconde o prejuízo.',
          },
          { text: 'Somar o capital às vendas.', consequence: 'Mistura o dono com o negócio.' },
        ],
        0,
        'O que deve dizer o contabilista?',
      ),
  ],
})
