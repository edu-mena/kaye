import { ACC, credit, debit, defineTopic } from './kit'

// Topic 11: purchases in a foreign currency: the exchange difference when the debt is paid.
// The rates are invented, always in Kz per US dollar.

export default defineTopic({
  id: 't11',
  intro: [
    'Muitas compras de importaÃ§Ã£o sÃ£o faturadas em dÃ³lares. A dÃ­vida regista-se em Kz ao cÃ¢mbio do dia da compra. Mas quando se paga, o cÃ¢mbio jÃ¡ Ã© outro, e a diferenÃ§a Ã© uma diferenÃ§a de cÃ¢mbio.',
    'Se o dÃ³lar subiu entre a compra e o pagamento, a empresa paga mais Kz do que registou: Ã© uma diferenÃ§a desfavorÃ¡vel (um custo). Se o dÃ³lar desceu, paga menos: Ã© favorÃ¡vel (um proveito).',
    'A conta Ã© simples: valor em dÃ³lares Ã— (cÃ¢mbio do pagamento âˆ’ cÃ¢mbio da compra). Um resultado positivo Ã© custo; negativo Ã© proveito.',
  ],
  rule: 'DiferenÃ§a = USD Ã— (cÃ¢mbio ao pagar âˆ’ cÃ¢mbio na compra). Positiva: custo (desfavorÃ¡vel). Negativa: proveito (favorÃ¡vel).',
  extra: [
    {
      type: 'table',
      caption: 'Uma dÃ­vida de 1.000 USD, comprada a 900 Kz/USD.',
      head: ['CÃ¢mbio ao pagar', 'Paga em Kz', 'DiferenÃ§a'],
      rows: [
        ['950', '950.000', '+50.000 (custo)'],
        ['900', '900.000', '0'],
        ['870', '870.000', 'âˆ’30.000 (proveito)'],
      ],
    },
  ],
  points: [
    'A dÃ­vida regista-se ao cÃ¢mbio do dia da compra.',
    'Se o dÃ³lar sobe antes de pagar, hÃ¡ custo; se desce, hÃ¡ proveito.',
    'A diferenÃ§a Ã© calculada sobre o valor em dÃ³lares.',
  ],
  quiz: [
    {
      prompt: 'Compraste a 900 Kz/USD e pagas a 950 Kz/USD. A diferenÃ§a de cÃ¢mbio Ã©â€¦',
      options: ['DesfavorÃ¡vel (custo)', 'FavorÃ¡vel (proveito)', 'Nula'],
      answer: 0,
    },
    {
      prompt: 'Em que cÃ¢mbio se regista a dÃ­vida na compra?',
      options: ['No do dia da compra', 'No do dia do pagamento', 'No do ano anterior'],
      answer: 0,
    },
    {
      prompt: 'O dÃ³lar desceu entre a compra e o pagamento. A empresa pagaâ€¦',
      options: ['Menos Kz do que registou', 'Mais Kz do que registou', 'O mesmo'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const usd = c.int(2, 20) * 500
      const rate = c.int(850, 950)
      return c.num(
        `Compraste mercadorias por ${usd} USD ao cÃ¢mbio de ${rate} Kz/USD. Por quantos Kz registas a dÃ­vida?`,
        usd * rate,
        `${usd} Ã— ${rate}.`,
      )
    },
    (c) => {
      const usd = c.int(2, 20) * 500
      const buy = c.int(850, 950)
      const rise = c.int(10, 50)
      return c.num(
        `A dÃ­vida Ã© de ${usd} USD, registada a ${buy} Kz/USD. Pagas a ${buy + rise} Kz/USD. Qual Ã© a diferenÃ§a de cÃ¢mbio desfavorÃ¡vel?`,
        usd * rise,
        `${usd} Ã— (${buy + rise} âˆ’ ${buy}).`,
      )
    },
    (c) => {
      const usd = c.int(2, 20) * 500
      const buy = c.int(850, 950)
      const fall = c.int(10, 40)
      return c.num(
        `A dÃ­vida Ã© de ${usd} USD, registada a ${buy} Kz/USD. Pagas a ${buy - fall} Kz/USD. Qual Ã© a diferenÃ§a de cÃ¢mbio favorÃ¡vel?`,
        usd * fall,
        `${usd} Ã— (${buy} âˆ’ ${buy - fall}).`,
      )
    },
    (c) => {
      const usd = c.int(2, 20) * 500
      const buy = c.int(850, 950)
      const rise = c.int(10, 50)
      return c.entry(
        `Pagaste, por transferÃªncia, uma dÃ­vida de ${usd} USD registada a ${buy} Kz/USD; no pagamento o cÃ¢mbio Ã© ${buy + rise} Kz/USD. Faz o lanÃ§amento.`,
        [
          debit(ACC.fornecedores, usd * buy),
          debit(ACC.cambioDes, usd * rise),
          credit(ACC.bancos, usd * (buy + rise)),
        ],
        'A dÃ­vida sai pelo valor registado; o banco paga mais; a diferenÃ§a Ã© um custo.',
        [ACC.cambioFav, ACC.caixa],
      )
    },
    (c) => {
      const usd = c.int(2, 20) * 500
      const buy = c.int(850, 950)
      const fall = c.int(10, 40)
      return c.entry(
        `Pagaste, por transferÃªncia, uma dÃ­vida de ${usd} USD registada a ${buy} Kz/USD; no pagamento o cÃ¢mbio Ã© ${buy - fall} Kz/USD. Faz o lanÃ§amento.`,
        [
          debit(ACC.fornecedores, usd * buy),
          credit(ACC.bancos, usd * (buy - fall)),
          credit(ACC.cambioFav, usd * fall),
        ],
        'O banco paga menos do que a dÃ­vida registada; a diferenÃ§a Ã© um proveito.',
        [ACC.cambioDes, ACC.caixa],
      )
    },
    (c) => {
      const usd = c.int(2, 20) * 500
      const buy = c.int(850, 950)
      const pay = buy + c.pick([-30, -20, 20, 40])
      const diff = usd * (pay - buy)
      return c.num(
        `DÃ­vida de ${usd} USD, registada a ${buy} Kz/USD e paga a ${pay} Kz/USD. Qual Ã© a diferenÃ§a (positiva se for custo, negativa se for proveito)?`,
        diff,
        `${usd} Ã— (${pay} âˆ’ ${buy}) = ${diff}.`,
      )
    },
    (c) => {
      const usd = c.int(2, 20) * 500
      const buy = c.int(850, 950)
      const rise = c.int(10, 50)
      return c.num(
        `DÃ­vida de ${usd} USD, registada a ${buy} Kz/USD. O cÃ¢mbio sobe ${rise} Kz. Quanto sai do banco ao pagar?`,
        usd * (buy + rise),
        `${usd} Ã— ${buy + rise}.`,
      )
    },
    (c) =>
      c.ask(
        'Quando o dÃ³lar sobe antes de pagares uma dÃ­vida em dÃ³lares, a diferenÃ§a de cÃ¢mbio Ã©â€¦',
        'DesfavorÃ¡vel: um custo',
        ['FavorÃ¡vel: um proveito', 'Nula', 'Um desconto do fornecedor'],
        'Pagas mais Kz pela mesma dÃ­vida em dÃ³lares.',
      ),
    (c) =>
      c.decide(
        [
          'A Importadora Beira encomendou peÃ§as por 10.000 USD, a pagar em 60 dias.',
          'O dÃ³lar costuma subir de mÃªs para mÃªs.',
        ],
        [
          {
            text: 'Registar a dÃ­vida ao cÃ¢mbio do dia da compra e ajustar quando pagar',
            consequence: 'Ã‰ o que o PGC pede: a diferenÃ§a aparece no pagamento.',
          },
          {
            text: 'Registar a dÃ­vida jÃ¡ ao cÃ¢mbio que se espera daqui a 60 dias',
            consequence: 'NinguÃ©m sabe o cÃ¢mbio futuro: o registo usa o do dia.',
          },
          { text: 'NÃ£o registar nada atÃ© pagar', consequence: 'A dÃ­vida existe desde a compra.' },
        ],
        0,
        'Como registas?',
      ),
  ],
})
