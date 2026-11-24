import { ACC, credit, debit, defineTopic, kz } from './kit'

// Topic 14: cash. Theme from Wikipedia (Cash and cash equivalents; Petty cash); written from scratch.

export default defineTopic({
  id: 't14',
  intro: [
    'A conta Caixa guarda o dinheiro vivo da loja. Entra a débito (vendas a pronto, recebimentos de clientes) e sai a crédito (pagamentos, depósitos no banco). O saldo da caixa é o que devia estar na gaveta e nunca pode ser credor.',
    'No fim de cada dia conta-se o dinheiro e compara-se com o saldo da conta. Se faltar ou sobrar, escreve-se a diferença e procura-se a causa. Misturar o dinheiro da loja com o do dono é a maneira mais rápida de perder o controlo das contas.',
  ],
  rule: 'Saldo final da caixa = saldo inicial + entradas − saídas. O dinheiro contado deve ser igual ao saldo da conta.',
  extra: [
    {
      type: 'examples',
      title: 'Movimentos de caixa (valores inventados)',
      items: [
        {
          text: 'Depósito no banco: D Bancos 80.000 Kz / C Caixa 80.000 Kz',
          note: 'O dinheiro muda de sítio.',
        },
        {
          text: 'Levantamento: D Caixa 30.000 Kz / C Bancos 30.000 Kz',
          note: 'Para troco ou pequenas despesas.',
        },
      ],
    },
  ],
  points: [
    'Caixa: entradas a débito e saídas a crédito.',
    'Conta-se a caixa todos os dias e compara-se com o saldo.',
    'O dinheiro do dono e o da loja ficam separados.',
  ],
  quiz: [
    {
      prompt: 'A Caixa recebe uma venda a pronto. Em que lado?',
      options: ['Débito', 'Crédito', 'Nenhum'],
      answer: 0,
    },
    {
      prompt: 'Contaste a caixa e há menos dinheiro do que o saldo. O que fazes?',
      options: ['Registas a diferença e procuras a causa', 'Ignoras', 'Mudas o saldo para coincidir'],
      answer: 0,
    },
    {
      prompt: 'Um depósito do dinheiro da caixa no banco…',
      options: ['Debita Bancos e credita Caixa', 'Debita Caixa e credita Bancos', 'Credita Vendas'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const open = c.base(10, 40)
      const inflow = c.base(50, 150)
      const outflow = c.base(20, 60)
      return c.num(
        `A caixa abre com ${kz(open)}, recebe ${kz(inflow)} e paga ${kz(outflow)}. Qual é o saldo ao fecho?`,
        open + inflow - outflow,
        `${open} + ${inflow} − ${outflow}.`,
      )
    },
    (c) => {
      const amount = c.base(30, 150)
      return c.entry(
        `A loja deposita ${kz(amount)} da caixa no banco. Faz o lançamento.`,
        [debit(ACC.bancos, amount), credit(ACC.caixa, amount)],
        'O banco sobe a débito; a caixa desce a crédito.',
        [ACC.vendas, ACC.capital],
      )
    },
    (c) => {
      const amount = c.base(10, 50)
      return c.entry(
        `A loja levanta ${kz(amount)} do banco para a caixa. Faz o lançamento.`,
        [debit(ACC.caixa, amount), credit(ACC.bancos, amount)],
        'A caixa sobe a débito; o banco desce a crédito.',
        [ACC.vendas, ACC.clientes],
      )
    },
    (c) => {
      const rent = c.base(20, 80)
      return c.entry(
        `A loja paga ${kz(rent)} de renda em dinheiro (sem IVA). Faz o lançamento.`,
        [debit(ACC.fst, rent), credit(ACC.caixa, rent)],
        'A renda é um custo (serviço de terceiros); o dinheiro sai da caixa.',
        [ACC.fornecedores, ACC.pessoal],
      )
    },
    (c) => {
      const book = c.base(20, 100)
      const missing = c.int(1, 10) * 100
      return c.num(
        `O saldo da conta Caixa é ${kz(book)}, mas contaste só ${kz(book - missing)}. Quanto falta?`,
        missing,
        `${book} − ${book - missing}.`,
      )
    },
    (c) =>
      c.ask(
        'Porque se conta a caixa todos os dias?',
        'Para ver cedo se falta ou sobra dinheiro e procurar a causa',
        ['Porque a lei obriga a fechar a loja', 'Para decidir o preço dos artigos'],
        'Quanto mais cedo se encontra a diferença, mais fácil é perceber o que aconteceu.',
      ),
    (c) =>
      c.ask(
        'Pode a conta Caixa ter saldo credor?',
        'Não: não se paga mais dinheiro do que o que há',
        ['Sim, quando há muitas vendas', 'Sim, no fim do mês'],
        'Um saldo credor na caixa indica um erro de registo.',
      ),
    (c) =>
      c.order(
        'Ordena os passos do fecho da caixa.',
        [
          'Contar o dinheiro da gaveta',
          'Comparar com o saldo da conta Caixa',
          'Registar e explicar qualquer diferença',
          'Depositar o excesso no banco',
        ],
        'Contar, comparar, explicar e depositar.',
      ),
    (c) =>
      c.decide(
        [
          'O Paulo usa o dinheiro da gaveta para pagar o almoço da família, sem escrever nada.',
          'No fim do mês a caixa «não bate certo».',
        ],
        [
          {
            text: 'Registar cada saída do dono como levantamento seu e usar o dinheiro pessoal à parte.',
            consequence: 'A caixa passa a bater certo e vê-se quanto o dono levou.',
          },
          {
            text: 'Continuar como está: é tudo dinheiro da família.',
            consequence: 'Não se sabe se a loja ganha ou perde.',
          },
          {
            text: 'Fechar a loja um dia por mês para contar.',
            consequence: 'Não resolve a falta de registos.',
          },
        ],
        0,
        'O que deve fazer?',
      ),
  ],
})
