import { ACC, credit, debit, defineTopic, kz, vat } from './kit'

// Topic 17: suppliers (accounts payable). Theme from Wikipedia (Accounts payable); written from scratch.

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)

export default defineTopic({
  id: 't17',
  intro: [
    'Quando a loja compra a crédito, deve ao fornecedor. A conta Fornecedores é um passivo: sobe a crédito quando se compra e desce a débito quando se paga. O valor é o total da fatura, com IVA.',
    'Pagar a horas mantém a confiança do fornecedor e pode dar descontos. Pagar tarde dá má fama e, às vezes, multas. Por isso convém saber, todas as semanas, quanto se deve e a quem.',
  ],
  rule: 'Compra a crédito: D Mercadorias (base), D IVA dedutível, C Fornecedores (total). Pagamento: D Fornecedores, C Caixa ou Bancos.',
  extra: [
    {
      type: 'examples',
      title: 'Uma compra a crédito e o pagamento (valores inventados)',
      items: [
        {
          text: 'Compra: D Mercadorias 100.000 / D IVA dedutível 14.000 / C Fornecedores 114.000',
          note: 'A loja deve 114.000 Kz.',
        },
        { text: 'Pagamento: D Fornecedores 114.000 / C Bancos 114.000', note: 'A dívida fica a zero.' },
      ],
    },
  ],
  points: [
    'Fornecedores é um passivo: o que a loja deve.',
    'A compra a crédito credita Fornecedores pelo total com IVA.',
    'Paga-se a horas e sabe-se sempre quanto se deve.',
  ],
  quiz: [
    {
      prompt: 'A loja paga uma dívida a um fornecedor. Que conta se debita?',
      options: ['Fornecedores', 'Clientes', 'Vendas'],
      answer: 0,
    },
    {
      prompt: 'A conta Fornecedores é…',
      options: ['Um passivo', 'Um ativo', 'Um proveito'],
      answer: 0,
    },
    {
      prompt: 'Compra a crédito de 100.000 Kz mais IVA 14%. Quanto se credita a Fornecedores?',
      options: ['114.000 Kz', '100.000 Kz', '14.000 Kz'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const base = c.base(30, 200)
      return c.entry(
        `A loja compra mercadorias a crédito por ${kz(base)} mais IVA a 14%. Faz o lançamento.`,
        [
          debit(ACC.mercadorias, base),
          debit(ACC.ivaDed, vat(base)),
          credit(ACC.fornecedores, base + vat(base)),
        ],
        'As mercadorias e o IVA dedutível entram a débito; a dívida (com IVA) a crédito.',
        [ACC.caixa, ACC.ivaLiq],
      )
    },
    (c) => {
      const amount = c.base(30, 200)
      return c.entry(
        `A loja paga ${kz(amount)} a um fornecedor, com dinheiro da caixa. Faz o lançamento.`,
        [debit(ACC.fornecedores, amount), credit(ACC.caixa, amount)],
        'A dívida desce a débito; a caixa desce a crédito.',
        [ACC.mercadorias, ACC.bancos],
      )
    },
    (c) => {
      const invoiced = c.base(50, 200)
      const paid = c.base(10, 49)
      return c.num(
        `A loja deve ${kz(invoiced)} a um fornecedor e já pagou ${kz(paid)}. Quanto deve ainda?`,
        invoiced - paid,
        `${invoiced} − ${paid}.`,
      )
    },
    (c) => {
      const debts = [c.base(20, 100), c.base(20, 100), c.base(20, 100)]
      return c.num(
        `A loja deve ${debts.map(kz).join(', ')} a três fornecedores. Qual é o saldo da conta Fornecedores?`,
        sum(debts),
        'O saldo é a soma do que se deve a cada um.',
      )
    },
    (c) => {
      const base = c.base(30, 200)
      return c.num(
        `A fatura do fornecedor tem ${kz(base)} sem IVA. Quanto vai a loja pagar, com IVA a 14%?`,
        base + vat(base),
        `${base} + ${vat(base)}.`,
      )
    },
    (c) =>
      c.ask(
        'O que significa um saldo credor na conta Fornecedores?',
        'A loja deve esse valor aos fornecedores',
        ['Os fornecedores devem à loja', 'A loja tem esse valor na caixa'],
        'Fornecedores é um passivo: sobe a crédito.',
      ),
    (c) =>
      c.ask(
        'Porque convém pagar aos fornecedores dentro do prazo?',
        'Mantém a confiança e pode dar melhores condições',
        ['Porque o IVA desaparece', 'Porque a dívida passa a ser um proveito'],
        'Um bom fornecedor é um parceiro: a confiança vale dinheiro.',
      ),
    (c) =>
      c.fill(
        'Pagamento a um fornecedor: debita-se ___ e credita-se Caixa ou Bancos.',
        [['Fornecedores']],
        'A dívida desce.',
      ),
    (c) =>
      c.decide(
        [
          'A loja deve 150.000 Kz a um fornecedor, com prazo de 15 dias. A caixa só tem 90.000 Kz.',
          'O fornecedor é importante para a loja.',
        ],
        [
          {
            text: 'Ligar antes do prazo, pagar 90.000 Kz e combinar a data do resto.',
            consequence: 'Mantém a confiança e a loja continua a receber mercadoria.',
          },
          {
            text: 'Esperar que o fornecedor se lembre de cobrar.',
            consequence: 'Pode perder o fornecedor ou ter de pagar mais.',
          },
          {
            text: 'Pagar menos sem avisar.',
            consequence: 'O fornecedor fica sem perceber e desconfia.',
          },
        ],
        0,
        'O que deve fazer?',
      ),
  ],
})
