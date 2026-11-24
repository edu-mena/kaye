import { ACC, credit, debit, defineTopic, kz } from './kit'

// Topic 25: closing the year. Theme from Wikipedia (Closing the books); written from scratch. In a company the profit
// goes to retained earnings; here it goes to Capital to keep a small shop simple.

export default defineTopic({
  id: 't25',
  intro: [
    'No fim do ano apuram-se os resultados. Fecham-se as contas de proveitos e de custos, passando os seus saldos para uma conta de resultado do exercício. Se os proveitos forem maiores, há lucro; se os custos forem maiores, há prejuízo.',
    'Depois, o resultado passa para o capital próprio (nas empresas, para resultados transitados; aqui, por simplicidade, para a conta Capital). As contas do património (ativo, passivo, capital) não se fecham: os seus saldos transitam para o ano seguinte e abrem o novo ano.',
  ],
  rule: 'Fecho: debitam-se os proveitos e creditam-se os custos contra Resultado do exercício; depois o resultado passa para o capital próprio.',
  extra: [
    {
      type: 'examples',
      title: 'O fecho de um ano (valores inventados)',
      items: [
        {
          text: 'Proveitos: D Vendas 800.000 / C Resultado do exercício 800.000',
          note: 'A conta Vendas fica a zero.',
        },
        {
          text: 'Custos: D Resultado 650.000 / C CMV 400.000 / C Pessoal 150.000 / C Serviços 100.000',
          note: 'As contas de custos ficam a zero.',
        },
        {
          text: 'Lucro: D Resultado 150.000 / C Capital 150.000',
          note: 'O lucro passa para o capital próprio.',
        },
      ],
    },
  ],
  points: [
    'Fecham-se as contas de custos e proveitos contra o resultado do exercício.',
    'O resultado passa depois para o capital próprio.',
    'As contas do património não se fecham: transitam para o ano seguinte.',
  ],
  quiz: [
    {
      prompt: 'Para fechar a conta Vendas, que lado se movimenta?',
      options: ['Debita-se Vendas', 'Credita-se Vendas', 'Nenhum'],
      answer: 0,
    },
    {
      prompt: 'Que contas se fecham no fim do ano?',
      options: ['Custos e proveitos', 'Caixa e Bancos', 'Clientes e Fornecedores'],
      answer: 0,
    },
    {
      prompt: 'O resultado do exercício, depois de apurado, vai para…',
      options: ['O capital próprio', 'O passivo', 'As vendas do ano seguinte'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const sales = c.base(500, 1200)
      return c.entry(
        `Fecha a conta Vendas: o seu saldo credor é ${kz(sales)}.`,
        [debit(ACC.vendas, sales), credit(ACC.resultado, sales)],
        'Debita-se Vendas para a zerar e credita-se o resultado.',
        [ACC.capital, ACC.cmv],
      )
    },
    (c) => {
      const cost = c.base(200, 500)
      const staff = c.base(60, 150)
      return c.entry(
        `Fecha os custos: Custo das mercadorias vendidas ${kz(cost)} e Custos com o pessoal ${kz(staff)}.`,
        [debit(ACC.resultado, cost + staff), credit(ACC.cmv, cost), credit(ACC.pessoal, staff)],
        'Creditam-se as contas de custos para as zerar e debita-se o resultado.',
        [ACC.vendas, ACC.capital],
      )
    },
    (c) => {
      const profit = c.base(30, 250)
      return c.entry(
        `O resultado do ano é um lucro de ${kz(profit)}. Passa-o para o capital próprio.`,
        [debit(ACC.resultado, profit), credit(ACC.capital, profit)],
        'A conta de resultado fecha-se a débito; o capital sobe a crédito.',
        [ACC.vendas, ACC.caixa],
      )
    },
    (c) => {
      const loss = c.base(10, 80)
      return c.entry(
        `O resultado do ano é um prejuízo de ${kz(loss)}. Passa-o para o capital próprio.`,
        [debit(ACC.capital, loss), credit(ACC.resultado, loss)],
        'Um prejuízo reduz o capital: debita-se Capital e fecha-se o resultado a crédito.',
        [ACC.vendas, ACC.caixa],
      )
    },
    (c) => {
      const sales = c.base(600, 1200)
      const cost = c.base(300, 500)
      const staff = c.base(80, 150)
      const services = c.base(40, 100)
      return c.num(
        `Vendas ${kz(sales)}; CMV ${kz(cost)}; pessoal ${kz(staff)}; serviços de terceiros ${kz(services)}. Qual é o resultado do exercício?`,
        sales - cost - staff - services,
        `${sales} − ${cost} − ${staff} − ${services}.`,
      )
    },
    (c) => {
      const capital = c.base(200, 500)
      const profit = c.base(30, 150)
      return c.num(
        `O capital era ${kz(capital)} e o ano deu um lucro de ${kz(profit)}. Qual é o capital próprio no fim do ano?`,
        capital + profit,
        `${capital} + ${profit}.`,
      )
    },
    (c) =>
      c.ask(
        'Que contas NÃO se fecham no fim do ano?',
        'As do património: Caixa, Clientes, Fornecedores, Capital',
        ['As de custos', 'As de proveitos'],
        'Os saldos do património transitam e abrem o ano seguinte.',
      ),
    (c) =>
      c.order(
        'Ordena os passos do fecho do ano.',
        [
          'Fazer amortizações, acréscimos e diferimentos',
          'Fechar proveitos e custos contra o resultado',
          'Passar o resultado para o capital próprio',
          'Abrir o ano seguinte com os saldos do património',
        ],
        'Primeiro os ajustes, depois o fecho e a abertura.',
      ),
    (c) =>
      c.decide(
        [
          'No fim do ano, o Paulo quer «começar do zero» e apagar todas as contas, incluindo Clientes e Fornecedores.',
          'A loja tem 80.000 Kz a receber e 60.000 Kz a pagar.',
        ],
        [
          {
            text: 'Fechar só custos e proveitos; os saldos de Clientes e Fornecedores transitam para o novo ano.',
            consequence: 'Ninguém perde o que lhe devem nem esquece o que deve.',
          },
          {
            text: 'Apagar tudo e recomeçar.',
            consequence: 'Perdem-se as dívidas e os créditos reais.',
          },
          {
            text: 'Apagar só o que se deve.',
            consequence: 'Deixa de se saber o que se deve, e a dívida continua.',
          },
        ],
        0,
        'O que deve fazer?',
      ),
  ],
})
