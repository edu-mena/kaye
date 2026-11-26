import { ACC, credit, debit, defineTopic } from './kit'

// Topic 11: purchases in a foreign currency: the exchange difference when the debt is paid.
// The rates are invented, always in Kz per US dollar.

export default defineTopic({
  id: 't11',
  intro: [
    'Muitas compras de importação são faturadas em dólares. A dívida regista-se em Kz ao câmbio do dia da compra. Mas quando se paga, o câmbio já é outro, e a diferença é uma diferença de câmbio.',
    'Se o dólar subiu entre a compra e o pagamento, a empresa paga mais Kz do que registou: é uma diferença desfavorável (um custo). Se o dólar desceu, paga menos: é favorável (um proveito).',
    'A conta é simples: valor em dólares × (câmbio do pagamento − câmbio da compra). Um resultado positivo é custo; negativo é proveito.',
  ],
  rule: 'Diferença = USD × (câmbio ao pagar − câmbio na compra). Positiva: custo (desfavorável). Negativa: proveito (favorável).',
  extra: [
    {
      type: 'table',
      caption: 'Uma dívida de 1.000 USD, comprada a 900 Kz/USD.',
      head: ['Câmbio ao pagar', 'Paga em Kz', 'Diferença'],
      rows: [
        ['950', '950.000', '+50.000 (custo)'],
        ['900', '900.000', '0'],
        ['870', '870.000', '−30.000 (proveito)'],
      ],
    },
  ],
  points: [
    'A dívida regista-se ao câmbio do dia da compra.',
    'Se o dólar sobe antes de pagar, há custo; se desce, há proveito.',
    'A diferença é calculada sobre o valor em dólares.',
  ],
  quiz: [
    {
      prompt: 'Compraste a 900 Kz/USD e pagas a 950 Kz/USD. A diferença de câmbio é…',
      options: ['Desfavorável (custo)', 'Favorável (proveito)', 'Nula'],
      answer: 0,
    },
    {
      prompt: 'Em que câmbio se regista a dívida na compra?',
      options: ['No do dia da compra', 'No do dia do pagamento', 'No do ano anterior'],
      answer: 0,
    },
    {
      prompt: 'O dólar desceu entre a compra e o pagamento. A empresa paga…',
      options: ['Menos Kz do que registou', 'Mais Kz do que registou', 'O mesmo'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const usd = c.int(2, 20) * 500
      const rate = c.int(850, 950)
      return c.num(
        `Compraste mercadorias por ${usd} USD ao câmbio de ${rate} Kz/USD. Por quantos Kz registas a dívida?`,
        usd * rate,
        `${usd} × ${rate}.`,
      )
    },
    (c) => {
      const usd = c.int(2, 20) * 500
      const buy = c.int(850, 950)
      const rise = c.int(10, 50)
      return c.num(
        `A dívida é de ${usd} USD, registada a ${buy} Kz/USD. Pagas a ${buy + rise} Kz/USD. Qual é a diferença de câmbio desfavorável?`,
        usd * rise,
        `${usd} × (${buy + rise} − ${buy}).`,
      )
    },
    (c) => {
      const usd = c.int(2, 20) * 500
      const buy = c.int(850, 950)
      const fall = c.int(10, 40)
      return c.num(
        `A dívida é de ${usd} USD, registada a ${buy} Kz/USD. Pagas a ${buy - fall} Kz/USD. Qual é a diferença de câmbio favorável?`,
        usd * fall,
        `${usd} × (${buy} − ${buy - fall}).`,
      )
    },
    (c) => {
      const usd = c.int(2, 20) * 500
      const buy = c.int(850, 950)
      const rise = c.int(10, 50)
      return c.entry(
        `Pagaste, por transferência, uma dívida de ${usd} USD registada a ${buy} Kz/USD; no pagamento o câmbio é ${buy + rise} Kz/USD. Faz o lançamento.`,
        [
          debit(ACC.fornecedores, usd * buy),
          debit(ACC.cambioDes, usd * rise),
          credit(ACC.bancos, usd * (buy + rise)),
        ],
        'A dívida sai pelo valor registado; o banco paga mais; a diferença é um custo.',
        [ACC.cambioFav, ACC.caixa],
      )
    },
    (c) => {
      const usd = c.int(2, 20) * 500
      const buy = c.int(850, 950)
      const fall = c.int(10, 40)
      return c.entry(
        `Pagaste, por transferência, uma dívida de ${usd} USD registada a ${buy} Kz/USD; no pagamento o câmbio é ${buy - fall} Kz/USD. Faz o lançamento.`,
        [
          debit(ACC.fornecedores, usd * buy),
          credit(ACC.bancos, usd * (buy - fall)),
          credit(ACC.cambioFav, usd * fall),
        ],
        'O banco paga menos do que a dívida registada; a diferença é um proveito.',
        [ACC.cambioDes, ACC.caixa],
      )
    },
    (c) => {
      const usd = c.int(2, 20) * 500
      const buy = c.int(850, 950)
      const pay = buy + c.pick([-30, -20, 20, 40])
      const diff = usd * (pay - buy)
      return c.num(
        `Dívida de ${usd} USD, registada a ${buy} Kz/USD e paga a ${pay} Kz/USD. Qual é a diferença (positiva se for custo, negativa se for proveito)?`,
        diff,
        `${usd} × (${pay} − ${buy}) = ${diff}.`,
      )
    },
    (c) => {
      const usd = c.int(2, 20) * 500
      const buy = c.int(850, 950)
      const rise = c.int(10, 50)
      return c.num(
        `Dívida de ${usd} USD, registada a ${buy} Kz/USD. O câmbio sobe ${rise} Kz. Quanto sai do banco ao pagar?`,
        usd * (buy + rise),
        `${usd} × ${buy + rise}.`,
      )
    },
    (c) =>
      c.ask(
        'Quando o dólar sobe antes de pagares uma dívida em dólares, a diferença de câmbio é…',
        'Desfavorável: um custo',
        ['Favorável: um proveito', 'Nula', 'Um desconto do fornecedor'],
        'Pagas mais Kz pela mesma dívida em dólares.',
      ),
    (c) =>
      c.decide(
        [
          'A Importadora Beira encomendou peças por 10.000 USD, a pagar em 60 dias.',
          'O dólar costuma subir de mês para mês.',
        ],
        [
          {
            text: 'Registar a dívida ao câmbio do dia da compra e ajustar quando pagar',
            consequence: 'É o que o PGC pede: a diferença aparece no pagamento.',
          },
          {
            text: 'Registar a dívida já ao câmbio que se espera daqui a 60 dias',
            consequence: 'Ninguém sabe o câmbio futuro: o registo usa o do dia.',
          },
          { text: 'Não registar nada até pagar', consequence: 'A dívida existe desde a compra.' },
        ],
        0,
        'Como registas?',
      ),
    (c) => {
      const usd = c.int(2, 20) * 500
      const buy = c.int(850, 950)
      const pay = buy + c.pick([-30, 20, 40])
      return c.steps(
        'Fecha a dívida em dólares.',
        [`Dívida: ${usd} USD, registada a ${buy} Kz/USD, paga a ${pay} Kz/USD.`],
        [
          { label: 'Dívida registada', answer: usd * buy, unit: 'Kz' },
          { label: 'Saída do banco', answer: usd * pay, unit: 'Kz' },
          {
            label: 'Diferença de câmbio (em valor positivo)',
            answer: Math.abs(usd * (pay - buy)),
            unit: 'Kz',
          },
        ],
        'Registada = USD × câmbio da compra; paga = USD × câmbio do pagamento; a diferença é custo se o dólar subiu e proveito se desceu.',
      )
    },
  ],
})
