import { ACC, credit, debit, defineTopic, kz } from './kit'

// Topic 15: banks and reconciliation. Theme from Wikipedia (Bank reconciliation); written from scratch.

export default defineTopic({
  id: 't15',
  intro: [
    'A conta Bancos regista o dinheiro que a loja tem no banco. Um depósito ou uma transferência recebida são débitos; um pagamento ou um levantamento são créditos. É um ativo, como a Caixa.',
    'O extrato do banco e a conta Bancos nem sempre têm o mesmo saldo no mesmo dia. A conciliação bancária compara os dois e explica a diferença: um depósito que o banco ainda não contou, um cheque emitido que ainda não foi descontado, ou um movimento que o banco fez e a loja ainda não registou.',
  ],
  rule: 'Saldo contabilístico = saldo do extrato + depósitos em trânsito − pagamentos ainda não descontados. O que o banco fez e a loja não registou, regista-se.',
  extra: [
    {
      type: 'table',
      caption: 'Uma conciliação (valores inventados).',
      head: ['', 'Kz'],
      rows: [
        ['Saldo do extrato', kz(500000)],
        ['+ Depósito em trânsito', kz(80000)],
        ['− Cheque emitido, ainda não descontado', kz(30000)],
        ['= Saldo da conta Bancos', kz(550000)],
      ],
    },
  ],
  points: [
    'Bancos é um ativo: sobe a débito e desce a crédito.',
    'Concilia-se o extrato com a conta, pelo menos uma vez por mês.',
    'O que o banco fez e a loja não registou, regista-se.',
  ],
  quiz: [
    {
      prompt: 'Um cliente transfere dinheiro para a conta da loja. Que conta se debita?',
      options: ['Bancos', 'Caixa', 'Fornecedores'],
      answer: 0,
    },
    {
      prompt: 'Para que serve a conciliação bancária?',
      options: [
        'Para explicar a diferença entre o extrato e a conta',
        'Para pedir um empréstimo',
        'Para calcular o IVA',
      ],
      answer: 0,
    },
    {
      prompt: 'Um cheque emitido que o banco ainda não descontou…',
      options: ['Já saiu da conta Bancos e ainda não saiu do extrato', 'Ainda não existe', 'Aumenta o saldo'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const amount = c.base(40, 200)
      return c.entry(
        `Um cliente paga ${kz(amount)} por transferência, e a loja tinha vendido a crédito. Faz o lançamento.`,
        [debit(ACC.bancos, amount), credit(ACC.clientes, amount)],
        'O banco sobe a débito; a dívida do cliente desce a crédito.',
        [ACC.caixa, ACC.vendas],
      )
    },
    (c) => {
      const amount = c.base(30, 150)
      return c.entry(
        `A loja paga ${kz(amount)} a um fornecedor por transferência (a dívida já estava registada). Faz o lançamento.`,
        [debit(ACC.fornecedores, amount), credit(ACC.bancos, amount)],
        'A dívida desce (débito) e o banco desce (crédito).',
        [ACC.caixa, ACC.mercadorias],
      )
    },
    (c) => {
      const amount = c.base(50, 200)
      return c.entry(
        `A loja paga ${kz(amount)} do empréstimo ao banco, por débito na conta. Faz o lançamento (ignora os juros).`,
        [debit(ACC.emprestimos, amount), credit(ACC.bancos, amount)],
        'A dívida ao banco desce e o dinheiro sai da conta.',
        [ACC.caixa, ACC.capital],
      )
    },
    (c) => {
      const statement = c.base(100, 400)
      const deposit = c.base(10, 50)
      const cheque = c.base(5, 30)
      return c.num(
        `O extrato mostra ${kz(statement)}. Há um depósito de ${kz(deposit)} ainda não contado pelo banco e um cheque de ${kz(cheque)} emitido e ainda não descontado. Qual é o saldo da conta Bancos?`,
        statement + deposit - cheque,
        `${statement} + ${deposit} − ${cheque}.`,
      )
    },
    (c) => {
      const book = c.base(100, 300)
      const deposit = c.base(10, 40)
      return c.num(
        `A conta Bancos mostra ${kz(book)} e há um depósito em trânsito de ${kz(deposit)}. Quanto deve mostrar o extrato?`,
        book - deposit,
        'O banco ainda não contou o depósito: o extrato tem menos.',
      )
    },
    (c) =>
      c.ask(
        'O extrato mostra uma transferência de um cliente que a loja ainda não registou. O que fazes?',
        'Registas o recebimento na conta Bancos',
        ['Ignoras: o banco enganou-se', 'Pedes ao cliente que pague outra vez'],
        'O dinheiro entrou na conta: tem de estar nas contas da loja.',
      ),
    (c) =>
      c.ask(
        'Que tipo de conta é Bancos?',
        'Um ativo',
        ['Um passivo', 'Um proveito'],
        'É dinheiro que a loja tem.',
      ),
    (c) =>
      c.fill(
        'Um depósito debita a conta ___ e credita a conta Caixa.',
        [['Bancos']],
        'O dinheiro passa da caixa para o banco.',
      ),
    (c) =>
      c.decide(
        [
          'O extrato do banco mostra 120.000 Kz a menos do que a conta Bancos da loja. A Ana não sabe porquê.',
          'Já se passou o fim do mês.',
        ],
        [
          {
            text: 'Comparar cada movimento do extrato com o razão para achar o que falta.',
            consequence: 'Descobre depósitos em trânsito, cheques por descontar ou erros de registo.',
          },
          {
            text: 'Acertar o razão para ser igual ao extrato, sem verificar.',
            consequence: 'Pode apagar um erro verdadeiro e esconder o problema.',
          },
          { text: 'Não fazer nada: o banco tem sempre razão.', consequence: 'Também o banco comete erros.' },
        ],
        0,
        'O que deve fazer?',
      ),
  ],
})
