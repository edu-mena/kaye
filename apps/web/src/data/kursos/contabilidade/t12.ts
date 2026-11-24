import { ACC, credit, debit, defineTopic, kz, vat } from './kit'

// Topic 12: output VAT, input VAT and VAT payable. Theme from Wikipedia (Value-added tax); written from scratch.
// The rules of carrying a credit forward or refunding it are not taught here (to confirm in the Código do IVA).

export default defineTopic({
  id: 't12',
  intro: [
    'Nas vendas, a loja cobra IVA aos clientes: é o IVA liquidado (uma dívida ao Estado). Nas compras, a loja paga IVA aos fornecedores: é o IVA dedutível (um direito, que se desconta). No fim do período, a loja entrega ao Estado a diferença.',
    'Se o IVA liquidado for maior que o dedutível, a loja paga a diferença. Se for menor, o saldo fica a favor da loja; as regras de reporte ou reembolso desse saldo estão no Código do IVA (confirmar) e não são ensinadas aqui. Só se pode deduzir o IVA de compras com fatura em nome da loja.',
  ],
  rule: 'IVA a pagar = IVA liquidado (vendas) − IVA dedutível (compras). Só se deduz o IVA de compras com fatura.',
  extra: [
    {
      type: 'table',
      caption: 'O IVA de um mês da loja da Ana (valores inventados).',
      head: ['', 'Base', 'IVA 14%'],
      rows: [
        ['Vendas do mês', kz(500000), kz(70000)],
        ['Compras do mês', kz(300000), kz(42000)],
        ['IVA a pagar', '', kz(28000)],
      ],
    },
  ],
  points: [
    'IVA liquidado = o que se cobrou nas vendas; IVA dedutível = o que se pagou nas compras.',
    'A diferença entre os dois é o que se entrega ao Estado.',
    'Sem fatura em nome da loja não há IVA dedutível.',
  ],
  quiz: [
    {
      prompt: 'O IVA que a loja paga nas compras chama-se…',
      options: ['IVA dedutível', 'IVA liquidado', 'IVA a pagar'],
      answer: 0,
    },
    {
      prompt: 'IVA liquidado de 70.000 Kz e dedutível de 42.000 Kz. A loja entrega ao Estado…',
      options: ['28.000 Kz', '112.000 Kz', '42.000 Kz'],
      answer: 0,
    },
    {
      prompt: 'Compraste sem fatura. Podes deduzir o IVA?',
      options: ['Não', 'Sim, sempre', 'Só se for pouco dinheiro'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const sales = c.base(100, 500)
      const purchases = c.base(40, 99)
      return c.num(
        `No mês, vendas de ${kz(sales)} e compras de ${kz(purchases)}, ambas sem IVA e a 14%. Quanto IVA se entrega ao Estado?`,
        vat(sales) - vat(purchases),
        `IVA liquidado ${vat(sales)} − IVA dedutível ${vat(purchases)}.`,
      )
    },
    (c) => {
      const output = c.base(20, 100) / 10
      const input = c.base(2, 9) / 10
      return c.num(
        `IVA liquidado de ${kz(output)} e IVA dedutível de ${kz(input)}. Qual é o IVA a pagar?`,
        output - input,
        'A diferença entre o que se cobrou e o que se pagou.',
      )
    },
    (c) => {
      const sales = c.base(50, 200)
      return c.num(
        `A loja vendeu ${kz(sales)} sem IVA. Quanto IVA liquidado isso gera?`,
        vat(sales),
        `${sales} × 14%.`,
      )
    },
    (c) => {
      const output = vat(c.base(100, 300))
      const input = vat(c.base(30, 90))
      return c.entry(
        `No fim do mês, o IVA liquidado é ${kz(output)} e o dedutível é ${kz(input)}. Faz o lançamento de apuramento do IVA.`,
        [debit(ACC.ivaLiq, output), credit(ACC.ivaDed, input), credit(ACC.estado, output - input)],
        'As duas contas do IVA fecham-se e a diferença fica como dívida ao Estado.',
        [ACC.bancos, ACC.caixa],
      )
    },
    (c) => {
      const due = vat(c.base(30, 150))
      return c.entry(
        `A loja paga ${kz(due)} de IVA ao Estado por transferência bancária. Faz o lançamento.`,
        [debit(ACC.estado, due), credit(ACC.bancos, due)],
        'A dívida ao Estado desaparece e o dinheiro sai do banco.',
        [ACC.ivaLiq, ACC.caixa],
      )
    },
    (c) =>
      c.ask(
        'Qual destes é IVA dedutível?',
        'O IVA da fatura de um fornecedor de mercadorias',
        ['O IVA que cobras a um cliente', 'O IVA que já entregaste ao Estado'],
        'O IVA dedutível é o que se paga nas compras.',
      ),
    (c) =>
      c.ask(
        'O IVA dedutível é maior do que o IVA liquidado. Qual é o resultado do apuramento?',
        'O saldo é a favor da loja (não há IVA a pagar)',
        ['A loja paga mais IVA ainda', 'A loja deixa de ter de entregar declarações'],
        'Pagou mais IVA nas compras do que cobrou nas vendas. O que se faz ao saldo está no Código do IVA (confirmar).',
      ),
    (c) =>
      c.fill('IVA a pagar = IVA ___ − IVA dedutível', [['liquidado']], 'O IVA liquidado é o das vendas.'),
    (c) =>
      c.decide(
        [
          'A Ana comprou um ventilador para a loja por 28.500 Kz (com IVA), mas só pediu um papel escrito à mão, sem fatura.',
          'No fim do mês quer deduzir o IVA.',
        ],
        [
          {
            text: 'Voltar à loja e pedir uma fatura em nome da loja.',
            consequence: 'Com a fatura pode deduzir o IVA e provar a compra.',
          },
          {
            text: 'Deduzir o IVA na mesma, porque pagou.',
            consequence: 'Sem fatura não há dedução e pode ter problemas com o Estado.',
          },
          {
            text: 'Esquecer a compra.',
            consequence: 'Perde o custo e o IVA.',
          },
        ],
        0,
        'O que deve fazer?',
      ),
  ],
})
