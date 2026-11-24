import { ACC, credit, debit, defineTopic, kz } from './kit'

// Topic 6: the journal and double entry. Theme from Wikipedia (Double-entry bookkeeping); written from scratch.

export default defineTopic({
  id: 't06',
  intro: [
    'Tudo começa num documento: uma fatura, um recibo, um extrato do banco. Com o documento regista-se o facto no diário, o livro onde os lançamentos ficam por ordem de data. Cada lançamento diz que contas se debitam, que contas se creditam e quanto.',
    'Este é o método das partidas dobradas: cada facto mexe em pelo menos duas contas e o total debitado é igual ao total creditado. Nestes primeiros tópicos ignoramos o IVA; ele entra no tópico 11.',
  ],
  rule: 'Em cada lançamento, total a débito = total a crédito. Sem documento não há lançamento.',
  extra: [
    {
      type: 'table',
      caption: 'Um lançamento no diário (valores inventados).',
      head: ['Data', 'Conta', 'Débito', 'Crédito'],
      rows: [
        ['02/03', 'Mercadorias', kz(80000), ''],
        ['02/03', 'Fornecedores', '', kz(80000)],
        ['', 'Compra a crédito, fatura n.º 12', '', ''],
      ],
    },
  ],
  points: [
    'Cada lançamento parte de um documento e fica no diário por data.',
    'Partidas dobradas: o total a débito é igual ao total a crédito.',
    'Cada facto mexe em duas ou mais contas.',
  ],
  quiz: [
    {
      prompt: 'Num lançamento, o total a débito é…',
      options: ['Igual ao total a crédito', 'Maior que o total a crédito', 'Sempre zero'],
      answer: 0,
    },
    {
      prompt: 'Onde se registam os lançamentos por ordem de data?',
      options: ['No diário', 'No balancete', 'No balanço'],
      answer: 0,
    },
    {
      prompt: 'O que se guarda antes de fazer um lançamento?',
      options: ['O documento do facto', 'Nada, basta lembrar-se', 'Só o nome do cliente'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const amount = c.base(100, 400)
      return c.entry(
        `O dono deposita ${kz(amount)} na conta bancária do negócio (capital). Faz o lançamento.`,
        [debit(ACC.bancos, amount), credit(ACC.capital, amount)],
        'O banco (ativo) sobe a débito; o capital sobe a crédito.',
        [ACC.caixa, ACC.emprestimos],
      )
    },
    (c) => {
      const amount = c.base(50, 200)
      return c.entry(
        `A loja compra um computador a pronto por ${kz(amount)} (sem IVA). Faz o lançamento.`,
        [debit(ACC.equip, amount), credit(ACC.caixa, amount)],
        'O equipamento sobe a débito; a caixa desce a crédito.',
        [ACC.mercadorias, ACC.fornecedores],
      )
    },
    (c) => {
      const amount = c.base(30, 150)
      return c.entry(
        `A loja compra mercadorias a crédito por ${kz(amount)} (sem IVA). Faz o lançamento.`,
        [debit(ACC.mercadorias, amount), credit(ACC.fornecedores, amount)],
        'As mercadorias sobem a débito; a dívida ao fornecedor sobe a crédito.',
        [ACC.caixa, ACC.vendas],
      )
    },
    (c) => {
      const amount = c.base(30, 150)
      return c.entry(
        `A loja vende a pronto por ${kz(amount)} (sem IVA, sem custo das vendas). Faz o lançamento.`,
        [debit(ACC.caixa, amount), credit(ACC.vendas, amount)],
        'A caixa sobe a débito; as vendas sobem a crédito.',
        [ACC.clientes, ACC.mercadorias],
      )
    },
    (c) => {
      const amount = c.base(100, 500)
      return c.entry(
        `O banco empresta ${kz(amount)} e o dinheiro entra na conta da loja. Faz o lançamento.`,
        [debit(ACC.bancos, amount), credit(ACC.emprestimos, amount)],
        'O banco sobe a débito; a nova dívida sobe a crédito.',
        [ACC.capital, ACC.caixa],
      )
    },
    (c) => {
      const first = c.base(20, 100)
      const second = c.base(10, 80)
      return c.num(
        `Um lançamento tem dois débitos (${kz(first)} e ${kz(second)}) e um só crédito. Qual é o valor desse crédito?`,
        first + second,
        'O total a crédito é igual ao total a débito.',
      )
    },
    (c) =>
      c.ask(
        'Que documento prova que a loja vendeu a um cliente?',
        'A fatura',
        ['A lista de preços', 'O cartaz da montra'],
        'A fatura é o documento do facto: sem ela, o lançamento não tem prova.',
      ),
    (c) =>
      c.order(
        'Ordena os passos para registar uma compra.',
        [
          'Recebes a fatura do fornecedor',
          'Confirmas o valor e os artigos',
          'Fazes o lançamento no diário',
          'Arquivas a fatura',
        ],
        'Primeiro o documento, depois o registo, no fim o arquivo.',
      ),
    (c) =>
      c.decide(
        [
          'A Ana pagou uma renda de 60.000 Kz à mão, sem recibo, e só se lembrou no fim do mês.',
          'O lançamento ainda não foi feito.',
        ],
        [
          {
            text: 'Pedir um recibo ao senhorio e fazer o lançamento com a data do pagamento.',
            consequence: 'O custo fica provado e no mês certo.',
          },
          {
            text: 'Não registar: foi só uma renda.',
            consequence: 'O custo desaparece e o resultado do mês fica maior do que é.',
          },
          {
            text: 'Registar uma venda do mesmo valor.',
            consequence: 'Inventa um proveito que não existiu.',
          },
        ],
        0,
        'O que deve fazer a Ana?',
      ),
  ],
})
