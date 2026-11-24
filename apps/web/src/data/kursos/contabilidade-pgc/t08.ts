import { ACC, credit, debit, defineTopic, kz } from './kit'

// Topic 8: breakage, surpluses and the provision for stock whose value fell below its cost.

export default defineTopic({
  id: 't08',
  intro: [
    'Na contagem física do armazém, nem sempre o que há é o que os livros dizem. Se faltam unidades (roubo, estrago, quebra), regista-se uma perda: débito em «Custos por quebras de existências» e crédito em Mercadorias. Se sobram, o movimento é o contrário.',
    'Outro problema: a mercadoria que se vende por menos do que custou. As existências valem o menor de dois valores: o custo e o valor realizável líquido (o preço de venda menos os custos para vender). Se o valor realizável for menor, a empresa regista uma provisão para a perda.',
    'A provisão acompanha o que falta cobrir: se no fim do ano a provisão necessária for maior do que a que já existe, faz-se um reforço; se for menor, faz-se uma reposição (um proveito).',
  ],
  rule: 'Quebra: custo das unidades que faltam. Provisão = unidades × (custo − valor realizável) quando este é menor. Reforço ou reposição = diferença para a provisão anterior.',
  extra: [
    {
      type: 'table',
      caption: 'A provisão pedida no fim do ano contra a que já existe.',
      head: ['Provisão necessária', 'Já existente', 'Movimento'],
      rows: [
        ['50.000', '30.000', 'Reforço de 20.000 (custo)'],
        ['50.000', '50.000', 'Nada'],
        ['20.000', '50.000', 'Reposição de 30.000 (proveito)'],
      ],
    },
  ],
  points: [
    'Quebras são perdas: custo das unidades em falta.',
    'As existências valem o menor entre o custo e o valor realizável líquido.',
    'O ajuste de provisão é só a diferença para a anterior: reforço (custo) ou reposição (proveito).',
  ],
  quiz: [
    {
      prompt: 'Faltam 10 unidades no armazém, a 500 Kz cada. Qual é o custo da quebra?',
      options: ['5.000 Kz', '500 Kz', '10.000 Kz'],
      answer: 0,
    },
    {
      prompt: 'O valor realizável líquido está abaixo do custo. As existências valem…',
      options: ['O valor realizável líquido', 'O custo', 'A média dos dois'],
      answer: 0,
    },
    {
      prompt: 'A provisão necessária desceu em relação à do ano anterior. O que se regista?',
      options: ['Uma reposição, que é um proveito', 'Um reforço, que é um custo', 'Nada'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const missing = c.int(3, 20)
      const cost = c.int(2, 10) * 100
      return c.num(
        `A contagem mostra menos ${missing} unidades que os livros, a ${kz(cost)} de custo cada. Qual é o custo da quebra?`,
        missing * cost,
        `${missing} × ${cost}.`,
      )
    },
    (c) => {
      const missing = c.int(3, 20)
      const cost = c.int(2, 10) * 100
      const total = missing * cost
      return c.entry(
        `Faltam ${missing} unidades de mercadoria, a ${kz(cost)} de custo cada, na contagem do armazém. Faz o lançamento.`,
        [debit(ACC.quebras, total), credit(ACC.mercadorias, total)],
        'A perda sobe a débito (custo) e as mercadorias descem a crédito.',
        [ACC.cmv, ACC.caixa],
      )
    },
    (c) => {
      const units = c.int(10, 50)
      const cost = c.int(5, 20) * 100
      const sell = cost - c.int(1, 4) * 100
      return c.num(
        `Tens ${units} unidades que custaram ${kz(cost)} cada e que só se vendem por ${kz(sell)} cada (sem custos para vender). Qual é a provisão necessária?`,
        units * (cost - sell),
        `${units} × (${cost} − ${sell}).`,
      )
    },
    (c) => {
      const units = c.int(10, 50)
      const cost = c.int(5, 20) * 100
      const sell = cost + c.int(1, 4) * 100
      return c.num(
        `Tens ${units} unidades que custaram ${kz(cost)} cada e que se vendem por ${kz(sell)} cada. Qual é a provisão necessária?`,
        0,
        'O valor realizável é maior do que o custo: as existências ficam pelo custo e não há provisão.',
      )
    },
    (c) => {
      const old = c.int(2, 6) * 10000
      const need = old + c.int(1, 5) * 10000
      return c.entry(
        `No fim do ano a provisão para existências deve ser de ${kz(need)}; já havia ${kz(old)}. Faz o lançamento do reforço.`,
        [debit(ACC.provEx, need - old), credit(ACC.provExist, need - old)],
        'O reforço é um custo do exercício; a provisão aumenta a crédito.',
        [ACC.reposicao, ACC.mercadorias],
      )
    },
    (c) => {
      const need = c.int(1, 4) * 10000
      const old = need + c.int(1, 5) * 10000
      return c.entry(
        `No fim do ano a provisão para existências deve ser de ${kz(need)}; já havia ${kz(old)}. Faz o lançamento da reposição.`,
        [debit(ACC.provExist, old - need), credit(ACC.reposicao, old - need)],
        'A provisão desce a débito e a diferença é um proveito (reposição).',
        [ACC.provEx, ACC.mercadorias],
      )
    },
    (c) => {
      const cost = c.int(10, 40) * 1000
      const price = cost - c.int(1, 4) * 1000
      const selling = c.int(1, 3) * 500
      return c.num(
        `Uma mercadoria custou ${kz(cost)} e vende-se por ${kz(price)}, com ${kz(selling)} de custos para a vender. Qual é o valor realizável líquido?`,
        price - selling,
        `Preço de venda (${price}) − custos de venda (${selling}).`,
      )
    },
    (c) =>
      c.ask(
        'As existências são avaliadas pelo…',
        'Menor valor entre o custo e o valor realizável líquido',
        ['Maior valor entre o custo e o preço de venda', 'Preço de venda sempre', 'Valor do último ano'],
        'O princípio da prudência não deixa contar lucros que ainda não existem.',
      ),
    (c) =>
      c.fill(
        'Quando a provisão necessária sobe, faz-se um ___ (custo); quando desce, uma ___ (proveito).',
        [['reforço'], ['reposição']],
        'O movimento é a diferença para a provisão anterior.',
      ),
  ],
})
