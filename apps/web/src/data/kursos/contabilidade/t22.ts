import { ACC, credit, debit, defineTopic, kz } from './kit'

// Topic 22: accruals and deferrals. Theme from Wikipedia (Accrual; Deferral); written from scratch.

export default defineTopic({
  id: 't22',
  intro: [
    'Um custo ou um proveito pertence ao período em que acontece, e não ao período em que se paga ou se recebe. Esta ideia chama-se especialização do exercício. Dois casos aparecem sempre no fim do ano.',
    'Acréscimo: o custo já aconteceu mas só se paga no ano seguinte (a eletricidade de dezembro, que chega em janeiro). Regista-se já o custo e a dívida. Diferimento: pagou-se já, mas parte do gasto é do ano seguinte (uma renda paga por 12 meses a começar em outubro). Retira-se do custo do ano a parte do ano seguinte e guarda-se como ativo.',
  ],
  rule: 'O custo é do período a que se refere. Acréscimo: custo de agora, pagamento depois. Diferimento: pagamento agora, parte do custo depois.',
  extra: [
    {
      type: 'table',
      caption: 'Acréscimo ou diferimento? (exemplos)',
      head: ['Facto', 'Tipo'],
      rows: [
        ['Eletricidade de dezembro, paga em janeiro', 'Acréscimo de custos'],
        ['Renda de 12 meses paga em outubro', 'Diferimento (rendas pagas adiantadas)'],
        ['Salários de dezembro, pagos em janeiro', 'Acréscimo de custos'],
      ],
    },
  ],
  points: [
    'O custo pertence ao período a que se refere, não ao do pagamento.',
    'Acréscimo: custo já feito, pagamento no ano seguinte.',
    'Diferimento: pagamento já feito, parte do custo no ano seguinte.',
  ],
  quiz: [
    {
      prompt: 'A eletricidade de dezembro chega em janeiro. É…',
      options: ['Um acréscimo de custos', 'Um diferimento', 'Um proveito'],
      answer: 0,
    },
    {
      prompt: 'Pagaste 12 meses de renda a começar em outubro. O que é do ano seguinte?',
      options: ['Os 9 meses de janeiro a setembro', 'Nenhum', 'Os 12 meses'],
      answer: 0,
    },
    {
      prompt: 'Que princípio diz que o custo é do período a que se refere?',
      options: ['A especialização do exercício', 'A conciliação bancária', 'O balancete'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const monthly = c.int(2, 20) * 1000
      const start = c.int(2, 12)
      const deferred = monthly * (start - 1)
      return c.num(
        `A loja pagou de uma vez 12 meses de renda, a ${kz(monthly)} por mês, a contar do mês ${start} do ano (1 = janeiro; o ano acaba em dezembro). Quanto desse pagamento pertence ao ano seguinte?`,
        deferred,
        `Do mês ${start} a dezembro há ${13 - start} meses; os restantes ${start - 1} pertencem ao ano seguinte.`,
      )
    },
    (c) => {
      const amount = c.int(2, 20) * 3000
      return c.entry(
        `A conta da eletricidade de dezembro, de ${kz(amount)}, só chegará em janeiro. Regista o acréscimo (sem IVA).`,
        [debit(ACC.fst, amount), credit(ACC.acrescimo, amount)],
        'O custo é de dezembro e fica a dívida; paga-se em janeiro.',
        [ACC.caixa, ACC.fornecedores],
      )
    },
    (c) => {
      const deferred = c.int(2, 20) * 6000
      return c.entry(
        `Parte da renda paga este ano, ${kz(deferred)}, pertence ao ano seguinte. Faz o lançamento do diferimento.`,
        [debit(ACC.rendas, deferred), credit(ACC.fst, deferred)],
        'Tira-se do custo do ano (crédito) e guarda-se como ativo (débito).',
        [ACC.caixa, ACC.acrescimo],
      )
    },
    (c) => {
      const recorded = c.base(80, 200)
      const accrual = c.int(2, 20) * 3000
      const deferral = c.int(2, 20) * 2000
      return c.num(
        `Os custos registados no ano somam ${kz(recorded)}. Há um acréscimo de ${kz(accrual)} e um diferimento de ${kz(deferral)}. Qual é o custo certo do ano?`,
        recorded + accrual - deferral,
        `${recorded} + ${accrual} − ${deferral}.`,
      )
    },
    (c) =>
      c.ask(
        'Os salários de dezembro serão pagos em janeiro. Em que ano é o custo?',
        'No ano de dezembro, quando o trabalho foi feito',
        ['No ano de janeiro, quando se paga', 'Metade em cada ano'],
        'O custo é do período em que o trabalho foi feito.',
      ),
    (c) => {
      const accrual = c.pick([true, false])
      return c.ask(
        accrual
          ? 'Os transportes de dezembro foram feitos e só serão pagos em janeiro. Que tipo é?'
          : 'A loja pagou em novembro a renda do ano seguinte. Que tipo é?',
        accrual ? 'Acréscimo de custos' : 'Diferimento',
        accrual ? ['Diferimento', 'Proveito'] : ['Acréscimo de custos', 'Proveito'],
        accrual ? 'O custo já aconteceu; falta pagar.' : 'O pagamento foi feito antes de o custo acontecer.',
      )
    },
    (c) =>
      c.fill(
        'Um custo pertence ao período a que se ___, e não ao período em que se paga.',
        [['refere']],
        'É a especialização do exercício.',
      ),
    (c) =>
      c.ask(
        'Para que serve a especialização do exercício?',
        'Para o resultado de cada ano mostrar só os custos e proveitos desse ano',
        ['Para pagar menos IVA', 'Para esconder custos de um ano para o outro'],
        'Sem ela, o resultado dependeria do dia em que se paga.',
      ),
    (c) =>
      c.decide(
        [
          'A loja só paga as contas de dezembro em janeiro, e o resultado do ano parece muito bom.',
          'Em janeiro, o resultado do novo ano ficará muito pior.',
        ],
        [
          {
            text: 'Registar em dezembro os custos de dezembro, mesmo que se paguem em janeiro.',
            consequence: 'Cada ano mostra o resultado verdadeiro.',
          },
          {
            text: 'Deixar para janeiro: assim o ano acaba melhor.',
            consequence: 'O resultado fica inflacionado e o do ano seguinte, deturpado.',
          },
          {
            text: 'Pagar tudo antes de dezembro, sem registar.',
            consequence: 'Sem registo, perde-se a prova.',
          },
        ],
        0,
        'O que deve fazer?',
      ),
  ],
})
