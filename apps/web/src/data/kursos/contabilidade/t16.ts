import { ACC, credit, debit, defineTopic, kz, vat } from './kit'

// Topic 16: customers (accounts receivable). Theme from Wikipedia (Accounts receivable); written from scratch.

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)

export default defineTopic({
  id: 't16',
  intro: [
    'Quando a loja vende a crédito, o cliente fica a dever. Essa dívida é um direito da loja: a conta Clientes, um ativo. A venda debita Clientes pelo total com IVA; quando o cliente paga, credita-se Clientes e debita-se Caixa ou Bancos.',
    'O saldo de cada cliente é o que ele ainda deve. Convém ver quais as faturas vencidas (passado o prazo) e cobrar cedo: quanto mais tempo passa, mais difícil é receber. O total que os clientes devem não é dinheiro até ser cobrado.',
  ],
  rule: 'Venda a crédito: D Clientes (total com IVA), C Vendas (base), C IVA liquidado. Recebimento: D Caixa ou Bancos, C Clientes.',
  extra: [
    {
      type: 'examples',
      title: 'Uma venda a crédito e o recebimento (valores inventados)',
      items: [
        {
          text: 'Venda: D Clientes 57.000 / C Vendas 50.000 / C IVA liquidado 7.000',
          note: 'O cliente deve 57.000 Kz.',
        },
        { text: 'Recebimento: D Bancos 57.000 / C Clientes 57.000', note: 'A dívida fica a zero.' },
      ],
    },
  ],
  points: [
    'Clientes é um ativo: o que ainda se tem a receber.',
    'A venda a crédito debita Clientes pelo total com IVA.',
    'Cobra-se cedo: faturas antigas cobram-se pior.',
  ],
  quiz: [
    {
      prompt: 'Um cliente paga uma fatura em dinheiro. Que conta se credita?',
      options: ['Clientes', 'Vendas', 'Caixa'],
      answer: 0,
    },
    {
      prompt: 'Vendes a crédito 50.000 Kz mais IVA 14%. Quanto se debita a Clientes?',
      options: ['57.000 Kz', '50.000 Kz', '7.000 Kz'],
      answer: 0,
    },
    {
      prompt: 'A conta Clientes é…',
      options: ['Um ativo', 'Um passivo', 'Um custo'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const base = c.base(20, 150)
      return c.entry(
        `A loja vende a crédito por ${kz(base)} mais IVA a 14%. Faz o lançamento.`,
        [debit(ACC.clientes, base + vat(base)), credit(ACC.vendas, base), credit(ACC.ivaLiq, vat(base))],
        'O cliente deve o total (com IVA); a venda é a base; o IVA é dívida ao Estado.',
        [ACC.caixa, ACC.ivaDed],
      )
    },
    (c) => {
      const amount = c.base(20, 150)
      return c.entry(
        `Um cliente paga ${kz(amount)} em dinheiro de uma fatura antiga. Faz o lançamento.`,
        [debit(ACC.caixa, amount), credit(ACC.clientes, amount)],
        'A caixa sobe a débito; a dívida do cliente desce a crédito.',
        [ACC.vendas, ACC.bancos],
      )
    },
    (c) => {
      const sold = c.base(50, 200)
      const paid = c.base(10, 49)
      return c.num(
        `Um cliente ficou a dever ${kz(sold)} e já pagou ${kz(paid)}. Quanto deve ainda?`,
        sold - paid,
        `${sold} − ${paid}.`,
      )
    },
    (c) => {
      const debts = [c.base(10, 80), c.base(10, 80), c.base(10, 80)]
      return c.num(
        `Três clientes devem ${debts.map(kz).join(', ')}. Qual é o saldo da conta Clientes?`,
        sum(debts),
        'O saldo é a soma do que cada cliente deve.',
      )
    },
    (c) => {
      const total = c.base(100, 400)
      const late = c.base(10, 50)
      return c.num(
        `Os clientes devem ${kz(total)}, dos quais ${kz(late)} estão vencidos há mais de 60 dias. Que percentagem do total está vencida (arredonda às unidades)?`,
        Math.round((late / total) * 100),
        `${late} ÷ ${total} × 100.`,
        '%',
        1,
      )
    },
    (c) =>
      c.ask(
        'O que significa um saldo devedor na conta Clientes?',
        'Os clientes ainda devem esse valor à loja',
        ['A loja deve esse valor aos clientes', 'A loja tem esse dinheiro na caixa'],
        'Clientes é um direito (ativo) até o dinheiro entrar.',
      ),
    (c) =>
      c.ask(
        'Vendeste a crédito. Já ganhaste esse dinheiro?',
        'A venda está feita, mas o dinheiro só entra quando o cliente pagar',
        ['Sim, é o mesmo que estar na caixa', 'Não, a venda só conta quando o cliente pagar'],
        'A venda regista-se quando se faz; o dinheiro, quando entra.',
      ),
    (c) =>
      c.fill(
        'Venda a crédito: debita-se ___ e credita-se Vendas.',
        [['Clientes']],
        'O cliente fica a dever.',
      ),
    (c) =>
      c.decide(
        [
          'Uma cliente deve 90.000 Kz há três meses e promete pagar «para a semana», todos os meses.',
          'A loja precisa desse dinheiro para pagar a um fornecedor.',
        ],
        [
          {
            text: 'Combinar uma data e um valor por escrito e não vender mais a crédito até pagar.',
            consequence: 'Fica um compromisso claro e a dívida não cresce.',
          },
          {
            text: 'Continuar a vender a crédito para a manter como cliente.',
            consequence: 'A dívida cresce e o risco também.',
          },
          {
            text: 'Apagar a dívida das contas.',
            consequence: 'O dinheiro continua devido, mas ninguém o vê.',
          },
        ],
        0,
        'O que deve fazer?',
      ),
  ],
})
