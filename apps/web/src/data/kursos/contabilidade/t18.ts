import { ACC, credit, debit, defineTopic, kz, vat } from './kit'

// Topic 18: discounts and returns. Theme from Wikipedia (Sales returns; Discount); written from scratch.

export default defineTopic({
  id: 't18',
  intro: [
    'Há três situações em que o preço ou a mercadoria voltam atrás. O desconto comercial reduz o preço na própria fatura: a fatura já sai com o valor líquido, e não se faz lançamento à parte. O desconto por pronto pagamento acontece depois: o cliente paga cedo e a loja aceita menos do que a fatura dizia. A devolução acontece quando o cliente (ou a loja) devolve a mercadoria.',
    'Nos três casos o IVA acompanha o valor: se o preço baixa, baixa a base e baixa o IVA. Uma devolução de venda desfaz a venda: debita-se Devoluções de vendas e o IVA liquidado, e credita-se Clientes (ou paga-se ao cliente).',
  ],
  rule: 'Desconto comercial: já está na fatura. Pronto pagamento: D Descontos concedidos pela diferença. Devolução de venda: D Devoluções de vendas e IVA liquidado, C Clientes.',
  extra: [
    {
      type: 'examples',
      title: 'Um desconto por pronto pagamento (valores inventados)',
      items: [
        {
          text: 'O cliente devia 100.000 Kz e paga 98.000 Kz: D Caixa 98.000 / D Descontos concedidos 2.000 / C Clientes 100.000',
          note: 'A dívida desaparece toda; os 2.000 Kz são um custo.',
        },
      ],
    },
  ],
  points: [
    'Desconto comercial: o preço da fatura já o inclui.',
    'Pronto pagamento: a diferença é um custo (descontos concedidos).',
    'Devolução: desfaz a venda, com o IVA correspondente.',
  ],
  quiz: [
    {
      prompt: 'Um preço de 20.000 Kz com desconto comercial de 10%. Quanto fica?',
      options: ['18.000 Kz', '22.000 Kz', '19.000 Kz'],
      answer: 0,
    },
    {
      prompt: 'Um cliente devolve mercadoria vendida a crédito. Que conta se credita?',
      options: ['Clientes', 'Vendas', 'Caixa'],
      answer: 0,
    },
    {
      prompt: 'Quando o preço baixa, o IVA…',
      options: ['Baixa também', 'Fica igual', 'Sobe'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const price = c.int(10, 100) * 1000
      const rate = c.pick([5, 10, 15, 20])
      return c.num(
        `Um artigo custa ${kz(price)} e há um desconto comercial de ${rate}%. Qual é o preço depois do desconto?`,
        (price * (100 - rate)) / 100,
        `${price} × ${(100 - rate) / 100}.`,
      )
    },
    (c) => {
      const base = c.base(20, 100)
      const rate = c.pick([10, 20])
      const net = (base * (100 - rate)) / 100
      return c.num(
        `Preço de ${kz(base)} sem IVA, com desconto comercial de ${rate}% e IVA a 14% sobre o preço com desconto. Qual é o total a pagar?`,
        net + vat(net),
        `Base com desconto = ${net}; IVA = ${vat(net)}.`,
      )
    },
    (c) => {
      const owed = c.base(50, 200)
      const discount = c.int(1, 5) * 500
      return c.entry(
        `Um cliente devia ${kz(owed)} e, por pagar cedo, paga só ${kz(owed - discount)} em dinheiro. A loja aceita a diferença. Faz o lançamento.`,
        [debit(ACC.caixa, owed - discount), debit(ACC.descontos, discount), credit(ACC.clientes, owed)],
        'Toda a dívida desaparece; a diferença é um custo da loja.',
        [ACC.vendas, ACC.bancos],
      )
    },
    (c) => {
      const base = c.base(10, 80)
      return c.entry(
        `Um cliente devolve mercadorias vendidas a crédito por ${kz(base)} mais IVA a 14%. Faz o lançamento da devolução.`,
        [debit(ACC.devolucoes, base), debit(ACC.ivaLiq, vat(base)), credit(ACC.clientes, base + vat(base))],
        'A venda é desfeita: o cliente deixa de dever o total e o IVA liquidado diminui.',
        [ACC.vendas, ACC.caixa],
      )
    },
    (c) => {
      const base = c.base(10, 80)
      return c.entry(
        `A loja devolve ao fornecedor mercadorias de ${kz(base)} mais IVA a 14%, que ainda não pagou. Faz o lançamento.`,
        [
          debit(ACC.fornecedores, base + vat(base)),
          credit(ACC.mercadorias, base),
          credit(ACC.ivaDed, vat(base)),
        ],
        'A dívida desce; o stock e o IVA dedutível diminuem.',
        [ACC.caixa, ACC.devolucoes],
      )
    },
    (c) => {
      const base = c.base(20, 100)
      const returned = c.base(2, 19)
      return c.num(
        `A loja vendeu ${kz(base)} e o cliente devolveu mercadorias de ${kz(returned)} (valores sem IVA). Quanto ficam as vendas líquidas?`,
        base - returned,
        `${base} − ${returned}.`,
      )
    },
    (c) =>
      c.ask(
        'Qual é a diferença entre desconto comercial e desconto por pronto pagamento?',
        'O comercial já vem na fatura; o de pronto pagamento acontece quando o cliente paga cedo',
        ['Não há diferença', 'O comercial só existe quando há devolução'],
        'Um muda o preço da venda, o outro dá-se no recebimento.',
      ),
    (c) =>
      c.ask(
        'O cliente devolve parte da mercadoria. O que acontece ao IVA liquidado?',
        'Diminui, na parte devolvida',
        ['Aumenta', 'Fica igual'],
        'Se a venda diminui, o IVA da venda diminui também.',
      ),
    (c) =>
      c.decide(
        [
          'Uma cliente devolve duas camisas com defeito, três dias depois da compra. Pagou a pronto.',
          'A Ana quer registar bem a devolução.',
        ],
        [
          {
            text: 'Registar a devolução da venda com o IVA e devolver o dinheiro à cliente.',
            consequence: 'As vendas e o IVA ficam certos e a cliente confia na loja.',
          },
          {
            text: 'Dar um vale e não registar nada.',
            consequence: 'As vendas ficam maiores do que são e o IVA fica pago a mais.',
          },
          {
            text: 'Recusar a devolução sem ver o defeito.',
            consequence: 'Perde a cliente e, se o defeito é real, a razão.',
          },
        ],
        0,
        'O que deve fazer?',
      ),
  ],
})
