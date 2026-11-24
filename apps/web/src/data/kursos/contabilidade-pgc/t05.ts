import { defineTopic, kz } from './kit'

// Topic 5: two methods that do not charge the same amount every year: sum of the digits and units of production.

export default defineTopic({
  id: 't05',
  intro: [
    'Nem todos os bens perdem valor por igual. Um carro gasta-se mais nos primeiros anos; uma máquina gasta-se conforme o que produz. Por isso o PGC admite outros métodos além das quotas constantes.',
    'No método dos dígitos (quotas degressivas) as quotas começam altas e descem. Soma-se os números dos anos (para 4 anos: 4 + 3 + 2 + 1 = 10). A quota do primeiro ano é 4/10 do valor a amortizar, a do segundo 3/10, e assim por diante.',
    'No método das unidades de produção a quota depende do uso: valor a amortizar × (unidades produzidas no ano ÷ unidades totais esperadas).',
  ],
  rule: 'Dígitos: quota do ano k = valor a amortizar × (anos restantes) ÷ (soma dos dígitos). Produção: quota = valor a amortizar × unidades do ano ÷ unidades totais.',
  extra: [
    {
      type: 'table',
      caption: 'Dígitos, 4 anos, valor a amortizar de 1.000.000 Kz (soma = 10).',
      head: ['Ano', 'Fração', 'Quota', 'Acumulada'],
      rows: [
        ['1', '4/10', '400.000', '400.000'],
        ['2', '3/10', '300.000', '700.000'],
        ['3', '2/10', '200.000', '900.000'],
        ['4', '1/10', '100.000', '1.000.000'],
      ],
    },
  ],
  points: [
    'Os dígitos dão quotas que descem ano após ano; a soma das quotas é o valor a amortizar.',
    'As unidades de produção seguem o uso: mais produção, mais amortização.',
    'Em qualquer método o valor residual fica de fora.',
  ],
  quiz: [
    {
      prompt: 'Num bem de 4 anos pelo método dos dígitos, que fração se amortiza no 1.º ano?',
      options: ['4/10', '1/4', '1/10'],
      answer: 0,
    },
    {
      prompt: 'No método das unidades de produção, um ano sem produzir amortiza…',
      options: ['Nada', 'A quota máxima', 'Metade da quota'],
      answer: 0,
    },
    {
      prompt: 'Qual método dá a maior quota no primeiro ano?',
      options: ['Dígitos (degressivo)', 'Quotas constantes', 'Todos dão o mesmo'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const years = c.pick([3, 4, 5])
      return c.num(
        `Num bem de ${years} anos, qual é a soma dos dígitos dos anos (1 + 2 + … + ${years})?`,
        (years * (years + 1)) / 2,
        `${years} × ${years + 1} ÷ 2.`,
        '',
      )
    },
    (c) => {
      const part = c.int(5, 20) * 10000
      const amount = part * 10
      return c.num(
        `Um bem de 4 anos tem ${kz(amount)} para amortizar. Pelo método dos dígitos, qual é a quota do 1.º ano?`,
        (amount * 4) / 10,
        `Soma dos dígitos = 10; o 1.º ano é 4/10 de ${amount}.`,
      )
    },
    (c) => {
      const part = c.int(5, 20) * 10000
      const amount = part * 10
      const year = c.pick([2, 3])
      return c.num(
        `Um bem de 4 anos tem ${kz(amount)} para amortizar. Pelo método dos dígitos, qual é a quota do ${year}.º ano?`,
        (amount * (5 - year)) / 10,
        `No ${year}.º ano faltam ${5 - year} dígitos: ${5 - year}/10 de ${amount}.`,
      )
    },
    (c) => {
      const part = c.int(5, 20) * 10000
      const residual = c.int(1, 4) * 10000
      const cost = part * 15 + residual
      return c.num(
        `Um equipamento custa ${kz(cost)}, com valor residual de ${kz(residual)} e 5 anos de vida. Pelo método dos dígitos, qual é a quota do 1.º ano? (soma = 15)`,
        (part * 15 * 5) / 15,
        `Valor a amortizar = ${cost} − ${residual} = ${part * 15}; o 1.º ano é 5/15.`,
      )
    },
    (c) => {
      const units = c.int(5, 20) * 1000
      const total = units * 10
      const cost = c.int(10, 40) * 100000
      const year = units * c.int(1, 3)
      return c.num(
        `Uma máquina de ${kz(cost)}, sem valor residual, deve produzir ${total} peças na vida toda. Este ano produziu ${year}. Qual é a amortização do ano?`,
        (cost * year) / total,
        `${cost} × ${year} ÷ ${total}.`,
      )
    },
    (c) => {
      const km = c.pick([100000, 200000, 250000, 400000, 500000])
      const price = c.int(4, 12) * 1000000
      const residual = c.int(1, 3) * 100000
      const driven = c.int(1, 3) * 10000
      return c.num(
        `Uma viatura custa ${kz(price)}, com valor residual de ${kz(residual)}, e deve fazer ${km} km na vida útil. Este ano fez ${driven} km. Qual é a amortização do ano?`,
        ((price - residual) * driven) / km,
        `(${price} − ${residual}) × ${driven} ÷ ${km}.`,
      )
    },
    (c) =>
      c.ask(
        'Num bem de 4 anos, qual destas séries pode ser a das quotas pelo método dos dígitos?',
        '400, 300, 200, 100',
        ['250, 250, 250, 250', '100, 200, 300, 400', '400, 400, 100, 100'],
        'As quotas descem de forma regular e somam o valor a amortizar.',
      ),
    (c) =>
      c.fill(
        'No método dos ___ as quotas descem; no método das ___ de produção a quota segue o uso.',
        [['dígitos'], ['unidades']],
        'Dois métodos que não repartem por igual.',
      ),
    (c) =>
      c.decide(
        [
          'A Pedreira Sul comprou uma britadeira que trabalha muito nos meses de obra e pára na época das chuvas.',
          'O contabilista quer uma amortização que acompanhe o desgaste.',
        ],
        [
          { text: 'Quotas constantes', consequence: 'Reparte por igual e ignora que o desgaste varia.' },
          {
            text: 'Unidades de produção',
            consequence: 'A quota segue as peças produzidas: é o que desgasta a máquina.',
          },
          { text: 'Não amortizar', consequence: 'Um imobilizado que se gasta tem de ser amortizado.' },
        ],
        1,
        'Que método escolhes?',
      ),
    (c) => {
      const part = c.int(5, 20) * 10000
      const amount = part * 10
      return c.steps(
        'Completa o plano de amortização pelo método dos dígitos (4 anos, soma = 10).',
        [`Valor a amortizar: ${kz(amount)}.`],
        [
          { label: 'Quota do ano 1 (4/10)', answer: part * 4, unit: 'Kz' },
          { label: 'Quota do ano 2 (3/10)', answer: part * 3, unit: 'Kz' },
          { label: 'Quota do ano 3 (2/10)', answer: part * 2, unit: 'Kz' },
          { label: 'Quota do ano 4 (1/10)', answer: part, unit: 'Kz' },
          { label: 'Amortizações acumuladas no fim do ano 2', answer: part * 7, unit: 'Kz' },
        ],
        'As quotas descem 4, 3, 2 e 1 décimos e somam o valor a amortizar.',
      )
    },
  ],
})
