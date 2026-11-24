import { ACC, credit, debit, defineTopic, kz } from './kit'

// Topic 2: purchases with a trade discount (on the invoice) and a prompt-payment discount (when you pay).

export default defineTopic({
  id: 't02',
  intro: [
    'Há dois descontos que se confundem. O desconto comercial vem escrito na fatura e baixa o preço da mercadoria: o custo e o IVA calculam-se já sobre o valor depois do desconto.',
    'O desconto de pronto pagamento é outra coisa: o fornecedor oferece-o se pagares cedo. Não muda o custo da mercadoria; é um ganho financeiro que se regista quando pagas, em «Descontos de pronto pagamento obtidos».',
  ],
  rule: 'Desconto comercial: reduz o custo da mercadoria e a base do IVA. Desconto de pronto pagamento: é um proveito financeiro, registado ao pagar.',
  extra: [
    {
      type: 'table',
      caption: 'Os dois descontos lado a lado.',
      head: ['', 'Comercial', 'De pronto pagamento'],
      rows: [
        ['Onde aparece', 'Na fatura', 'No pagamento'],
        ['Efeito no custo', 'Reduz o custo', 'Não reduz o custo'],
        ['Base do IVA', 'Valor depois do desconto', 'Não muda'],
        ['Como se regista', 'Compra pelo valor líquido', 'Proveito financeiro ao pagar'],
      ],
    },
  ],
  points: [
    'O desconto comercial baixa o custo e a base do IVA.',
    'O desconto de pronto pagamento é um proveito, registado quando se paga.',
    'Mercadorias entram pelo valor depois do desconto comercial, mais os custos de a trazer.',
  ],
  quiz: [
    {
      prompt: 'Um desconto escrito na fatura baixa o custo da mercadoria. De que desconto se trata?',
      options: ['Comercial', 'De pronto pagamento', 'Nenhum dos dois'],
      answer: 0,
    },
    {
      prompt: 'O fornecedor dá 5% se pagares em 10 dias. Como se regista ao pagar?',
      options: ['Proveito financeiro', 'Menos custo das mercadorias', 'Mais IVA dedutível'],
      answer: 0,
    },
    {
      prompt: 'Sobre que valor se calcula o IVA de uma compra com desconto comercial?',
      options: ['O valor depois do desconto', 'O valor antes do desconto', 'Só o valor do transporte'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const list = c.int(10, 60) * 1000
      const percent = c.pick([5, 10, 20, 25])
      const base = (list * (100 - percent)) / 100
      return c.num(
        `A fatura de mercadorias é de ${kz(list)}, com ${percent}% de desconto comercial. Qual é o valor líquido (base do IVA)?`,
        base,
        `${list} − ${percent}% = ${base}.`,
      )
    },
    (c) => {
      const list = c.int(10, 60) * 1000
      const percent = c.pick([10, 20, 25])
      const base = (list * (100 - percent)) / 100
      return c.num(
        `A fatura é de ${kz(list)} com ${percent}% de desconto comercial. Qual é o IVA (14%)?`,
        (base * 14) / 100,
        `O IVA calcula-se sobre ${base}, o valor depois do desconto.`,
      )
    },
    (c) => {
      const list = c.int(20, 80) * 1000
      const percent = c.pick([10, 20, 25])
      const base = (list * (100 - percent)) / 100
      const iva = (base * 14) / 100
      return c.entry(
        `Compraste mercadorias a crédito: ${kz(list)} de lista, ${percent}% de desconto comercial e IVA de 14%. Faz o lançamento.`,
        [debit(ACC.mercadorias, base), debit(ACC.ivaDed, iva), credit(ACC.fornecedores, base + iva)],
        'A mercadoria e o IVA contam o valor depois do desconto; a dívida é o total da fatura.',
        [ACC.caixa, ACC.descObtidos],
      )
    },
    (c) => {
      const base = c.int(10, 60) * 1000
      const total = base + (base * 14) / 100
      const percent = c.pick([5, 10])
      return c.num(
        `Deves ${kz(total)} (IVA incluído). O fornecedor dá ${percent}% de desconto de pronto pagamento sobre este total. Quanto pagas?`,
        total - (total * percent) / 100,
        `${total} − ${percent}% de ${total}.`,
      )
    },
    (c) => {
      const base = c.int(10, 60) * 1000
      const total = base + (base * 14) / 100
      const percent = c.pick([5, 10])
      const discount = (total * percent) / 100
      return c.entry(
        `Pagas por transferência a dívida de ${kz(total)} dentro do prazo e recebes ${percent}% de desconto de pronto pagamento. Faz o lançamento.`,
        [
          debit(ACC.fornecedores, total),
          credit(ACC.bancos, total - discount),
          credit(ACC.descObtidos, discount),
        ],
        'Sai do banco só o que pagaste; o desconto é um proveito financeiro.',
        [ACC.caixa, ACC.mercadorias],
      )
    },
    (c) =>
      c.ask(
        'Qual dos descontos reduz o custo da mercadoria comprada?',
        'O desconto comercial da fatura',
        ['O desconto de pronto pagamento', 'Nenhum dos dois', 'Os dois, sempre'],
        'O desconto de pronto pagamento é um proveito à parte, não muda o custo.',
      ),
    (c) =>
      c.fill(
        'O desconto comercial baixa o ___ da mercadoria; o de pronto pagamento é um ___ financeiro.',
        [
          ['custo', 'preço'],
          ['proveito', 'ganho'],
        ],
        'Dois descontos com tratamentos diferentes.',
      ),
    (c) => {
      const list = c.int(20, 80) * 1000
      const percent = c.pick([10, 20])
      const transport = c.base(2, 10)
      const base = (list * (100 - percent)) / 100
      return c.num(
        `Mercadorias de ${kz(list)} com ${percent}% de desconto comercial, mais ${kz(transport)} de transporte (a tua empresa paga). Qual é o custo total da compra, sem IVA?`,
        base + transport,
        `Custo = valor depois do desconto (${base}) + transporte (${transport}).`,
      )
    },
    (c) =>
      c.decide(
        [
          'Chega uma fatura de mercadorias com um desconto comercial escrito.',
          'Estás a registar a compra no diário.',
        ],
        [
          {
            text: 'Registar a mercadoria pelo valor antes do desconto',
            consequence: 'Fica a mercadoria e o IVA inflacionados e a dívida errada.',
          },
          {
            text: 'Registar a mercadoria e o IVA pelo valor depois do desconto',
            consequence: 'É o valor que de facto pagas e o IVA bate com a fatura.',
          },
          {
            text: 'Registar o desconto como proveito financeiro',
            consequence: 'Esse é o tratamento do pronto pagamento, não do desconto comercial.',
          },
        ],
        1,
      ),
  ],
})
