import { ACC, credit, debit, defineTopic, kz, type Ctx } from './kit'

// Topic 30: case 5, the shop's year-end. Shop and numbers invented; shared by every exercise of the day. No VAT, no
// corporate tax. The sales are 150% of the cost of goods sold, so the result is always a profit.

function facts(c: Ctx) {
  const capital = c.shared('capital', 400, 800, 50) * 1000
  const equipment = c.shared('equipment', 100, 400, 50) * 1000
  const years = c.shared('years', 5, 10, 5)
  const cost = c.shared('cost', 500, 800, 50) * 1000
  const staff = c.shared('staff', 60, 100, 10) * 1000
  const services = c.shared('services', 30, 60, 10) * 1000
  const sales = (cost * 3) / 2
  const amortization = equipment / years
  return {
    capital,
    equipment,
    years,
    cost,
    staff,
    services,
    sales,
    amortization,
    result: sales - cost - staff - services - amortization,
  }
}

type Facts = ReturnType<typeof facts>
const STORY = (f: Facts) =>
  `Ano da loja da Ana (sem IVA nem imposto sobre o lucro): vendas de ${kz(f.sales)}; custo das mercadorias vendidas ${kz(f.cost)}; pessoal ${kz(f.staff)}; serviços de terceiros ${kz(f.services)}; equipamento de ${kz(f.equipment)} comprado no início do ano, com vida útil de ${f.years} anos e sem valor residual; capital inicial de ${kz(f.capital)}.`

export default defineTopic({
  id: 't30',
  intro: [
    'Último caso: o fecho do ano da loja da Ana. Primeiro fazem-se os ajustes do fim do ano: aqui, a amortização do equipamento. Depois fecham-se as contas de custos e de proveitos contra o resultado do exercício e passa-se o resultado para o capital. No fim, o capital próprio é o capital inicial mais o lucro.',
    'Os números são os mesmos em todos os exercícios de hoje. Se acompanhares o caso do princípio ao fim, no fim sabes ler uma demonstração de resultados e um balanço de uma loja pequena.',
  ],
  rule: 'Amortização = custo ÷ vida útil. Resultado = vendas − CMV − pessoal − serviços − amortização. Capital final = capital inicial + resultado.',
  extra: [
    {
      type: 'case',
      title: 'O ano da loja da Ana (exemplo com valores fixos)',
      body: [
        'Vendas 900.000 Kz; CMV 600.000; pessoal 80.000; serviços 40.000; equipamento de 200.000 Kz com vida útil de 10 anos (amortização de 20.000 Kz).',
        'Resultado = 900.000 − 600.000 − 80.000 − 40.000 − 20.000 = 160.000 Kz de lucro.',
        'Capital inicial de 500.000 Kz: capital próprio no fim = 660.000 Kz. Equipamento no balanço: 200.000 − 20.000 = 180.000 Kz.',
      ],
    },
  ],
  points: [
    'Os ajustes do fim do ano vêm antes do fecho (amortização, acréscimos, diferimentos).',
    'O resultado = proveitos − custos; passa para o capital próprio.',
    'O equipamento aparece no balanço pelo valor líquido.',
  ],
  quiz: [
    {
      prompt: 'Equipamento de 200.000 Kz com vida útil de 10 anos. Amortização anual?',
      options: ['20.000 Kz', '2.000.000 Kz', '200.000 Kz'],
      answer: 0,
    },
    {
      prompt: 'Capital inicial de 500.000 Kz e lucro de 160.000 Kz. Capital próprio no fim?',
      options: ['660.000 Kz', '340.000 Kz', '160.000 Kz'],
      answer: 0,
    },
    {
      prompt: 'O que se faz primeiro no fim do ano?',
      options: ['Os ajustes, como a amortização', 'Abrir o ano seguinte', 'Apagar os custos'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const f = facts(c)
      return c.num(`${STORY(f)} Qual é a amortização do ano?`, f.amortization, `${f.equipment} ÷ ${f.years}.`)
    },
    (c) => {
      const f = facts(c)
      return c.entry(
        `${STORY(f)} Regista a amortização do ano.`,
        [debit(ACC.amortEx, f.amortization), credit(ACC.amortAc, f.amortization)],
        'O custo do ano sobe; as amortizações acumuladas reduzem o valor do equipamento.',
        [ACC.equip, ACC.caixa],
      )
    },
    (c) => {
      const f = facts(c)
      return c.num(
        `${STORY(f)} Qual é o resultado do exercício (positivo se for lucro)?`,
        f.result,
        `${f.sales} − ${f.cost} − ${f.staff} − ${f.services} − ${f.amortization}.`,
      )
    },
    (c) => {
      const f = facts(c)
      return c.entry(
        `${STORY(f)} Fecha a conta Vendas contra o resultado do exercício.`,
        [debit(ACC.vendas, f.sales), credit(ACC.resultado, f.sales)],
        'Debita-se Vendas para a zerar e credita-se o resultado.',
        [ACC.capital, ACC.cmv],
      )
    },
    (c) => {
      const f = facts(c)
      return c.entry(
        `${STORY(f)} Fecha as contas de custos (CMV, pessoal, serviços de terceiros e amortizações do exercício) contra o resultado.`,
        [
          debit(ACC.resultado, f.cost + f.staff + f.services + f.amortization),
          credit(ACC.cmv, f.cost),
          credit(ACC.pessoal, f.staff),
          credit(ACC.fst, f.services),
          credit(ACC.amortEx, f.amortization),
        ],
        'Creditam-se as contas de custos para as zerar; o total vai a débito do resultado.',
        [ACC.vendas, ACC.capital],
      )
    },
    (c) => {
      const f = facts(c)
      return c.entry(
        `${STORY(f)} Passa o lucro do ano para o capital próprio.`,
        [debit(ACC.resultado, f.result), credit(ACC.capital, f.result)],
        'A conta de resultado fecha a débito; o capital sobe a crédito.',
        [ACC.vendas, ACC.caixa],
      )
    },
    (c) => {
      const f = facts(c)
      return c.num(
        `${STORY(f)} Qual é o capital próprio no fim do ano (capital inicial mais o lucro)?`,
        f.capital + f.result,
        `${f.capital} + ${f.result}.`,
      )
    },
    (c) => {
      const f = facts(c)
      return c.num(
        `${STORY(f)} Por que valor aparece o equipamento no balanço do fim do ano?`,
        f.equipment - f.amortization,
        `${f.equipment} − ${f.amortization}.`,
      )
    },
    (c) => {
      const f = facts(c)
      const debts = c.shared('debts', 50, 200, 10) * 1000
      return c.num(
        `${STORY(f)} No fim do ano, as dívidas da loja (passivo) são de ${kz(debts)}. Qual é o total do ativo no balanço?`,
        debts + f.capital + f.result,
        `Ativo = passivo + capital próprio = ${debts} + ${f.capital + f.result}.`,
      )
    },
    (c) =>
      c.decide(
        [
          'No fim do ano, a Ana tem um lucro de 160.000 Kz e quer levantar todo o dinheiro da loja para si.',
          'A loja ainda deve 100.000 Kz a fornecedores e tem de comprar mercadoria para o novo ano.',
        ],
        [
          {
            text: 'Levantar uma parte e deixar o resto na loja para pagar dívidas e comprar mercadoria.',
            consequence: 'A Ana recebe pelo trabalho e a loja continua a funcionar.',
          },
          {
            text: 'Levantar tudo: o lucro é dela.',
            consequence: 'Sem dinheiro para pagar aos fornecedores, a loja pára.',
          },
          { text: 'Não levantar nada nunca.', consequence: 'O dono nunca recebe pelo risco que tomou.' },
        ],
        0,
        'O que faz mais sentido?',
      ),
  ],
})
