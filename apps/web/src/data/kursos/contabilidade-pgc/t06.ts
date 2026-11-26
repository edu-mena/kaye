import { ACC, credit, debit, defineTopic, kz } from './kit'

// Topic 6: selling or scrapping a fixed asset: the book value, the gain or the loss.

export default defineTopic({
  id: 't06',
  intro: [
    'Quando a empresa vende um imobilizado, compara o preço de venda com o valor líquido contabilístico (VLC): custo menos as amortizações acumuladas. Se vendeu por mais, tem uma mais-valia (um proveito). Se vendeu por menos, tem uma menos-valia (um custo).',
    'No lançamento o bem sai: o custo do imobilizado e as amortizações acumuladas desaparecem das contas. O que entra no dinheiro é o preço, e a diferença vai para mais-valias ou menos-valias.',
    'No abate, o bem deixa de existir ou de servir. Se ainda tem VLC, esse valor é uma perda. Se já está totalmente amortizado, o abate não tem efeito no resultado.',
  ],
  rule: 'VLC = custo − amortizações acumuladas. Mais-valia = preço − VLC (se positivo); menos-valia se negativo.',
  extra: [
    {
      type: 'table',
      caption: 'Venda de um bem de custo 1.000 e amortizações acumuladas 700 (VLC = 300).',
      head: ['Preço', 'Preço − VLC', 'Resultado'],
      rows: [
        ['400', '+100', 'Mais-valia de 100'],
        ['300', '0', 'Sem efeito'],
        ['200', '−100', 'Menos-valia de 100'],
      ],
    },
  ],
  points: [
    'O VLC é o custo menos as amortizações acumuladas.',
    'Preço acima do VLC dá mais-valia; abaixo dá menos-valia.',
    'No lançamento saem o custo e as amortizações acumuladas do bem.',
  ],
  quiz: [
    {
      prompt: 'Um bem tem VLC de 300.000 Kz e é vendido por 400.000 Kz. O que há?',
      options: ['Mais-valia de 100.000 Kz', 'Menos-valia de 100.000 Kz', 'Nada'],
      answer: 0,
    },
    {
      prompt: 'Um bem totalmente amortizado é abatido. Qual é o efeito no resultado?',
      options: ['Nenhum', 'Um grande lucro', 'Uma grande perda'],
      answer: 0,
    },
    {
      prompt: 'Na venda de um imobilizado, o que acontece às amortizações acumuladas desse bem?',
      options: ['Saem, a débito', 'Ficam para sempre', 'Passam a proveito'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const cost = c.int(10, 40) * 100000
      const accumulated = (cost * c.pick([2, 4, 6])) / 10
      return c.num(
        `Um bem custou ${kz(cost)} e tem ${kz(accumulated)} de amortizações acumuladas. Qual é o VLC?`,
        cost - accumulated,
        `${cost} − ${accumulated}.`,
      )
    },
    (c) => {
      const cost = c.int(10, 40) * 100000
      const accumulated = (cost * c.pick([4, 6])) / 10
      const vlc = cost - accumulated
      const gain = c.int(1, 5) * 10000
      return c.num(
        `Um bem de custo ${kz(cost)} e amortizações acumuladas de ${kz(accumulated)} é vendido por ${kz(vlc + gain)}. Qual é a mais-valia?`,
        gain,
        `Preço (${vlc + gain}) − VLC (${vlc}).`,
      )
    },
    (c) => {
      const cost = c.int(10, 40) * 100000
      const accumulated = (cost * c.pick([4, 6])) / 10
      const vlc = cost - accumulated
      const loss = c.int(1, 5) * 10000
      return c.num(
        `Um bem de custo ${kz(cost)} e amortizações acumuladas de ${kz(accumulated)} é vendido por ${kz(vlc - loss)}. Qual é a menos-valia?`,
        loss,
        `VLC (${vlc}) − preço (${vlc - loss}).`,
      )
    },
    (c) => {
      const cost = c.int(10, 40) * 100000
      const accumulated = (cost * c.pick([4, 6])) / 10
      const gain = c.int(1, 5) * 10000
      const price = cost - accumulated + gain
      return c.entry(
        `Vendeste, a dinheiro, uma viatura de custo ${kz(cost)} e amortizações acumuladas de ${kz(accumulated)} por ${kz(price)} (ignora o IVA). Faz o lançamento.`,
        [
          debit(ACC.caixa, price),
          debit(ACC.amortAc, accumulated),
          credit(ACC.imobilizado, cost),
          credit(ACC.maisValias, gain),
        ],
        'Sai o custo e as amortizações do bem; a diferença para o preço é a mais-valia.',
        [ACC.menosValias, ACC.bancos],
      )
    },
    (c) => {
      const cost = c.int(10, 40) * 100000
      const accumulated = (cost * c.pick([4, 6])) / 10
      const loss = c.int(1, 5) * 10000
      const price = cost - accumulated - loss
      return c.entry(
        `Vendeste, a dinheiro, uma máquina de custo ${kz(cost)} e amortizações acumuladas de ${kz(accumulated)} por ${kz(price)} (ignora o IVA). Faz o lançamento.`,
        [
          debit(ACC.caixa, price),
          debit(ACC.amortAc, accumulated),
          debit(ACC.menosValias, loss),
          credit(ACC.imobilizado, cost),
        ],
        'Vendeste abaixo do VLC: a diferença é uma menos-valia, um custo.',
        [ACC.maisValias, ACC.bancos],
      )
    },
    (c) => {
      const cost = c.int(5, 30) * 100000
      return c.entry(
        `Abateste um computador de custo ${kz(cost)} que estava totalmente amortizado. Faz o lançamento.`,
        [debit(ACC.amortAc, cost), credit(ACC.imobilizado, cost)],
        'Sem VLC, não há perda: o bem e as suas amortizações desaparecem juntos.',
        [ACC.menosValias, ACC.caixa],
      )
    },
    (c) => {
      const cost = c.int(10, 30) * 100000
      const accumulated = (cost * c.pick([5, 7])) / 10
      return c.entry(
        `Abateste uma máquina de custo ${kz(cost)} e amortizações acumuladas de ${kz(accumulated)}, que já não serve e não se vende. Faz o lançamento.`,
        [
          debit(ACC.amortAc, accumulated),
          debit(ACC.menosValias, cost - accumulated),
          credit(ACC.imobilizado, cost),
        ],
        'O VLC que sobra perde-se: vai para menos-valias.',
        [ACC.maisValias, ACC.caixa],
      )
    },
    (c) =>
      c.fill(
        'Preço de venda acima do VLC dá uma ___-valia; abaixo do VLC dá uma ___-valia.',
        [['mais'], ['menos']],
        'A diferença entre o preço e o VLC.',
      ),
    (c) =>
      c.ask(
        'Como se chama o resultado de vender um imobilizado por menos do que o seu VLC?',
        'Menos-valia, um custo',
        ['Mais-valia, um proveito', 'Amortização do exercício', 'Desconto comercial'],
        'Perdeste a diferença para o VLC.',
      ),
  ],
})
