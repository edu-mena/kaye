import { ACC, credit, debit, defineTopic, kz } from './kit'

// Topic 9: returned sales (credit note) and the provision for customers who may not pay.

export default defineTopic({
  id: 't09',
  intro: [
    'Se um cliente devolve mercadoria já faturada, a empresa emite uma nota de crédito. A venda não se apaga: regista-se a devolução em «Devoluções de vendas», desfaz-se o IVA liquidado e baixa-se a dívida do cliente.',
    'Muitas vezes só parte da mercadoria é devolvida. A nota de crédito é só dessa parte: base, IVA a 14% e total da parte devolvida.',
    'Alguns clientes não pagam. Quando há dúvidas sobre a cobrança, a empresa faz uma provisão para cobranças duvidosas: um custo agora, para não mostrar no balanço dinheiro que provavelmente não vai receber.',
  ],
  rule: 'Devolução: débito em Devoluções de vendas e em IVA liquidado, crédito em Clientes. Cobrança duvidosa: provisão = saldo em risco × percentagem estimada.',
  extra: [
    {
      type: 'table',
      caption: 'Devolução de uma venda de 100.000 Kz + 14% de IVA (total 114.000), um quarto da mercadoria.',
      head: ['Conta', 'Débito', 'Crédito'],
      rows: [
        ['Devoluções de vendas', '25.000', ''],
        ['IVA liquidado', '3.500', ''],
        ['Clientes', '', '28.500'],
      ],
    },
  ],
  points: [
    'A devolução regista-se à parte, sem apagar a venda original.',
    'A nota de crédito desfaz também o IVA liquidado da parte devolvida.',
    'A provisão para cobranças duvidosas é um custo estimado, não uma perda confirmada.',
  ],
  quiz: [
    {
      prompt: 'O cliente devolve uma parte da mercadoria. Que conta fica a débito (além do IVA)?',
      options: ['Devoluções de vendas', 'Clientes', 'Caixa'],
      answer: 0,
    },
    {
      prompt: 'A provisão para cobranças duvidosas é…',
      options: ['Um custo estimado', 'Um proveito', 'Um desconto ao cliente'],
      answer: 0,
    },
    {
      prompt: 'Uma nota de crédito de uma devolução faz o saldo do cliente…',
      options: ['Descer', 'Subir', 'Ficar igual'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const base = c.int(20, 100) * 1000
      const part = c.pick([2, 4, 5])
      return c.num(
        `Vendeste mercadoria por ${kz(base)} + IVA de 14%. O cliente devolve 1/${part} da mercadoria. Qual é a base da nota de crédito?`,
        base / part,
        `${base} ÷ ${part}.`,
      )
    },
    (c) => {
      const base = c.int(20, 100) * 1000
      const part = c.pick([2, 4, 5])
      const back = base / part
      return c.num(
        `Vendeste mercadoria por ${kz(base)} + IVA de 14%. O cliente devolve 1/${part} da mercadoria. Qual é o valor total da nota de crédito (com IVA)?`,
        back + (back * 14) / 100,
        `Base ${back} + IVA de 14% (${(back * 14) / 100}).`,
      )
    },
    (c) => {
      const base = c.int(20, 100) * 1000
      const part = c.pick([2, 4, 5])
      const back = base / part
      const iva = (back * 14) / 100
      return c.entry(
        `Vendeste mercadoria por ${kz(base)} + IVA de 14%. O cliente devolve 1/${part} e emites a nota de crédito. Faz o lançamento (sem o custo das mercadorias).`,
        [debit(ACC.devolucoes, back), debit(ACC.ivaLiq, iva), credit(ACC.clientes, back + iva)],
        'A devolução e o IVA da parte devolvida sobem a débito; a dívida do cliente desce a crédito.',
        [ACC.vendas, ACC.caixa],
      )
    },
    (c) => {
      const balance = c.int(20, 100) * 10000
      const percent = c.pick([5, 10, 20, 25])
      return c.num(
        `Os clientes duvidosos devem ${kz(balance)} e a empresa estima perder ${percent}%. Qual é a provisão?`,
        (balance * percent) / 100,
        `${balance} × ${percent}%.`,
      )
    },
    (c) => {
      const balance = c.int(20, 100) * 10000
      const percent = c.pick([10, 20, 25])
      const provision = (balance * percent) / 100
      return c.entry(
        `Os clientes duvidosos devem ${kz(balance)} e a empresa estima perder ${percent}%. Faz o lançamento da provisão.`,
        [debit(ACC.provEx, provision), credit(ACC.provCliente, provision)],
        'A estimativa é um custo do exercício; a provisão fica a crédito, a descontar nos clientes.',
        [ACC.clientes, ACC.reposicao],
      )
    },
    (c) => {
      const balance = c.int(20, 100) * 10000
      const percent = c.pick([10, 20, 25])
      const provision = (balance * percent) / 100
      return c.num(
        `Clientes: ${kz(balance)}. Provisão para cobranças duvidosas: ${kz(provision)}. Que valor de clientes se mostra no balanço, já líquido da provisão?`,
        balance - provision,
        `${balance} − ${provision}.`,
      )
    },
    (c) => {
      const old = c.int(1, 4) * 10000
      const need = old + c.int(1, 5) * 10000
      return c.num(
        `A provisão para cobranças duvidosas necessária no fim do ano é ${kz(need)} e a do ano anterior era ${kz(old)}. Qual é o reforço do ano?`,
        need - old,
        `${need} − ${old}.`,
      )
    },
    (c) =>
      c.ask(
        'Porque se faz uma provisão para cobranças duvidosas?',
        'Para não mostrar como recebível dinheiro que provavelmente não se vai receber',
        ['Para pagar menos IVA', 'Para dar desconto ao cliente', 'Para esconder as vendas'],
        'A prudência: as contas não contam ganhos duvidosos.',
      ),
    (c) =>
      c.decide(
        [
          'A Serralharia Bela vendeu portões por 500.000 Kz + IVA. O cliente devolveu um por defeito de fábrica (um quinto da venda).',
          'O contabilista pergunta como registar.',
        ],
        [
          {
            text: 'Apagar a fatura original',
            consequence: 'Perde-se a história: a fatura existe e foi comunicada.',
          },
          {
            text: 'Emitir uma nota de crédito pela parte devolvida, com o IVA proporcional',
            consequence: 'A venda fica, a devolução regista-se, e o IVA liquidado é corrigido.',
          },
          {
            text: 'Não fazer nada e deixar o cliente com a dívida toda',
            consequence: 'O cliente não deve o que devolveu.',
          },
        ],
        1,
        'O que fazes?',
      ),
  ],
})
