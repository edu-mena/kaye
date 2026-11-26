import { ACC, credit, debit, defineTopic, kz, vat } from './kit'

// Topic 11: VAT, what it is and how it is calculated. Theme from Wikipedia (Value-added tax) and the Código do IVA
// (Lei n.º 7/19; general rate of 14%, art. 19.º, to confirm in the Diário da República). Written from scratch.

export default defineTopic({
  id: 't11',
  intro: [
    'O IVA (Imposto sobre o Valor Acrescentado) é um imposto sobre o consumo. A loja junta-o ao preço, cobra-o ao cliente e entrega-o ao Estado: não é nem custo nem ganho da loja. A taxa geral em Angola é de 14% (Código do IVA, Lei n.º 7/19; confirmar o artigo e as taxas reduzidas no Diário da República). Neste Kurso usamos só os 14%.',
    'Três números andam juntos: a base (o preço sem IVA), o IVA (base × 14%) e o total (base × 1,14). Para tirar o IVA de um total, divide-se por 1,14. Nos exercícios, as bases são múltiplos de 50 Kz, para o IVA dar sempre um número inteiro.',
  ],
  rule: 'IVA = base × 14%. Total = base + IVA = base × 1,14. Base = total ÷ 1,14.',
  extra: [
    {
      type: 'table',
      caption: 'Os três números (valores inventados).',
      head: ['Base (sem IVA)', 'IVA 14%', 'Total'],
      rows: [
        [kz(10000), kz(1400), kz(11400)],
        [kz(50000), kz(7000), kz(57000)],
        [kz(100000), kz(14000), kz(114000)],
      ],
    },
  ],
  points: [
    'O IVA é cobrado ao cliente e entregue ao Estado: não é ganho da loja.',
    'IVA = base × 14%; total = base × 1,14.',
    'Para achar a base a partir do total, divide-se por 1,14.',
  ],
  quiz: [
    {
      prompt: 'Qual é a taxa geral do IVA usada neste Kurso?',
      options: ['14%', '5%', '25%'],
      answer: 0,
    },
    {
      prompt: 'Uma venda de 10.000 Kz sem IVA. Quanto é o total com IVA?',
      options: ['11.400 Kz', '11.000 Kz', '10.014 Kz'],
      answer: 0,
    },
    {
      prompt: 'O IVA cobrado ao cliente é…',
      options: ['Do Estado: a loja só o recolhe e entrega', 'Lucro da loja', 'Um desconto ao cliente'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const base = c.base(10, 200)
      return c.num(`Uma venda de ${kz(base)} sem IVA. Quanto é o IVA a 14%?`, vat(base), `${base} × 0,14.`)
    },
    (c) => {
      const base = c.base(10, 200)
      return c.num(
        `Um artigo custa ${kz(base)} sem IVA. Quanto paga o cliente com IVA a 14%?`,
        base + vat(base),
        `${base} + ${vat(base)} = ${base} × 1,14.`,
      )
    },
    (c) => {
      const base = c.base(10, 200)
      return c.num(
        `A fatura tem o total de ${kz(base + vat(base))} com IVA a 14%. Qual é a base (sem IVA)?`,
        base,
        `${base + vat(base)} ÷ 1,14.`,
      )
    },
    (c) => {
      const base = c.base(10, 200)
      const total = base + vat(base)
      return c.num(
        `O recibo mostra ${kz(total)} com IVA incluído. Quanto desse total é IVA?`,
        vat(base),
        `Base = ${total} ÷ 1,14 = ${base}; IVA = ${total} − ${base}.`,
      )
    },
    (c) => {
      const base = c.base(20, 150)
      return c.entry(
        `A loja compra mercadorias por ${kz(base)} mais IVA a 14% e paga tudo em dinheiro. Faz o lançamento.`,
        [debit(ACC.mercadorias, base), debit(ACC.ivaDed, vat(base)), credit(ACC.caixa, base + vat(base))],
        'O IVA pago nas compras é dedutível: fica numa conta própria, não no custo das mercadorias.',
        [ACC.fornecedores, ACC.ivaLiq],
      )
    },
    (c) => {
      const base = c.base(20, 150)
      return c.entry(
        `A loja vende por ${kz(base)} mais IVA a 14% e recebe tudo em dinheiro. Faz o lançamento.`,
        [debit(ACC.caixa, base + vat(base)), credit(ACC.vendas, base), credit(ACC.ivaLiq, vat(base))],
        'A venda é só a base; o IVA cobrado é uma dívida ao Estado (IVA liquidado).',
        [ACC.clientes, ACC.ivaDed],
      )
    },
    (c) =>
      c.ask(
        'De quem é o IVA que a loja cobra aos clientes?',
        'Do Estado: a loja só o recolhe e entrega',
        ['Da loja, como lucro', 'Do fornecedor'],
        'O IVA não é proveito da loja.',
      ),
    (c) => c.fill('IVA = base × ___ %', [['14']], 'A taxa geral do IVA é de 14%.', 'Completa a fórmula.'),
    (c) => {
      const prices = [c.base(5, 20), c.base(5, 20), c.base(5, 20)]
      const base = prices.reduce((sum, price) => sum + price, 0)
      return c.num(
        `Uma fatura tem três artigos sem IVA: ${prices.map(kz).join(', ')}. Qual é o total a pagar com IVA a 14%?`,
        base + vat(base),
        `Soma as bases (${base}) e depois acrescenta 14%.`,
      )
    },
  ],
})
