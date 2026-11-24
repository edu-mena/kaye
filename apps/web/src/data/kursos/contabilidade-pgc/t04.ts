import { ACC, credit, debit, defineTopic, kz } from './kit'

// Topic 4: the straight-line (quotas constantes) method, with a residual value and part-year use.

export default defineTopic({
  id: 't04',
  intro: [
    'Um bem dura vários anos, por isso o seu custo reparte-se pelos anos de uso. No método das quotas constantes a quota é igual todos os anos: (custo − valor residual) a dividir pelos anos de vida útil.',
    'O valor residual é o que a empresa espera receber pelo bem no fim da vida. Não se amortiza. Se o bem entrar a meio do ano, a primeira quota conta só os meses de uso.',
    'O valor líquido contabilístico (VLC) é o custo menos as amortizações acumuladas. Desce à mesma quantia todos os anos.',
  ],
  rule: 'Quota anual = (custo − valor residual) ÷ anos de vida. VLC = custo − amortizações acumuladas.',
  extra: [
    {
      type: 'table',
      caption: 'Um bem de 1.000.000 Kz, residual de 200.000 Kz, 4 anos de vida: quota de 200.000 Kz.',
      head: ['Ano', 'Quota', 'Acumulada', 'VLC'],
      rows: [
        ['1', '200.000', '200.000', '800.000'],
        ['2', '200.000', '400.000', '600.000'],
        ['3', '200.000', '600.000', '400.000'],
        ['4', '200.000', '800.000', '200.000'],
      ],
    },
  ],
  points: [
    'A quota constante é a mesma em todos os anos de vida útil.',
    'O valor residual fica de fora da amortização.',
    'No primeiro ano conta-se só o número de meses de uso.',
  ],
  quiz: [
    {
      prompt: 'Um bem custa 600.000 Kz, sem valor residual, e dura 5 anos. Qual é a quota anual?',
      options: ['120.000 Kz', '100.000 Kz', '300.000 Kz'],
      answer: 0,
    },
    {
      prompt: 'O valor residual entra no valor a amortizar?',
      options: ['Não, tira-se ao custo', 'Sim, soma-se ao custo', 'Só no último ano'],
      answer: 0,
    },
    {
      prompt: 'Um bem entra em uso a 1 de outubro. Quantos meses se amortizam nesse ano?',
      options: ['3', '12', '4'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const years = c.pick([4, 5, 8, 10])
      const cost = c.int(10, 50) * years * 10000
      return c.num(
        `Uma máquina custa ${kz(cost)}, sem valor residual, e dura ${years} anos. Qual é a quota anual?`,
        cost / years,
        `${cost} ÷ ${years}.`,
      )
    },
    (c) => {
      const years = c.pick([4, 5, 8])
      const residual = c.int(2, 8) * 10000
      const quota = c.int(5, 20) * 10000
      const cost = quota * years + residual
      return c.num(
        `Uma viatura custa ${kz(cost)} e tem um valor residual de ${kz(residual)} ao fim de ${years} anos. Qual é a quota anual?`,
        quota,
        `(${cost} − ${residual}) ÷ ${years}.`,
      )
    },
    (c) => {
      const years = c.pick([4, 5])
      const quota = c.int(6, 20) * 10000
      const cost = quota * years
      const used = c.int(2, years - 1)
      return c.num(
        `Um equipamento custou ${kz(cost)}, sem valor residual, e dura ${years} anos. Qual é o valor líquido contabilístico depois de ${used} anos de uso?`,
        cost - quota * used,
        `Custo − ${used} quotas de ${quota}.`,
      )
    },
    (c) => {
      const quota = c.int(3, 12) * 12000
      const months = c.pick([3, 4, 6, 9])
      return c.num(
        `A quota anual de um bem é ${kz(quota)}. Começou a ser usado há ${months} meses, neste ano. Qual é a amortização do ano?`,
        (quota / 12) * months,
        `${quota} ÷ 12 × ${months} meses.`,
      )
    },
    (c) => {
      const quota = c.int(5, 25) * 10000
      return c.entry(
        `No fim do ano, a amortização de uma viatura é de ${kz(quota)}. Faz o lançamento.`,
        [debit(ACC.amortEx, quota), credit(ACC.amortAc, quota)],
        'A amortização é um custo do exercício a débito; as amortizações acumuladas aumentam a crédito.',
        [ACC.imobilizado, ACC.equip],
      )
    },
    (c) => {
      const years = c.pick([5, 8, 10])
      const quota = c.int(4, 15) * 10000
      const residual = c.int(1, 5) * 10000
      const cost = quota * years + residual
      return c.num(
        `Um bem custou ${kz(cost)} e tem ${kz(residual)} de valor residual. Dura ${years} anos. No fim do último ano, qual é o seu VLC?`,
        residual,
        'No fim da vida útil, o VLC fica igual ao valor residual.',
      )
    },
    (c) =>
      c.fill(
        'Quota anual = (custo − valor ___) a dividir pelos anos de ___ útil.',
        [['residual'], ['vida']],
        'O valor residual fica de fora e divide-se pela vida útil.',
      ),
    (c) =>
      c.ask(
        'Que valor acumula a crédito, ano após ano, em «Amortizações acumuladas»?',
        'As quotas de amortização já reconhecidas',
        ['O custo do bem', 'O valor residual', 'O IVA do bem'],
        'O custo do bem fica a débito no imobilizado; as quotas acumulam-se à parte.',
      ),
    (c) =>
      c.ask(
        'Qual é o efeito de uma amortização no resultado do ano?',
        'Reduz o resultado, porque é um custo',
        ['Aumenta o resultado', 'Não tem efeito', 'Reduz o capital subscrito'],
        'A amortização é um custo do exercício, sem saída de dinheiro.',
      ),
    (c) => {
      const years = c.pick([4, 5])
      const quota = c.int(6, 20) * 10000
      const residual = c.int(1, 4) * 10000
      const cost = quota * years + residual
      return c.steps(
        'Calcula a amortização por quotas constantes.',
        [`Custo: ${kz(cost)}.`, `Valor residual: ${kz(residual)}.`, `Vida útil: ${years} anos.`],
        [
          { label: 'Valor a amortizar', answer: cost - residual, unit: 'Kz' },
          { label: 'Quota anual', answer: quota, unit: 'Kz' },
          { label: 'Amortizações acumuladas ao fim de 2 anos', answer: quota * 2, unit: 'Kz' },
          { label: 'VLC ao fim de 2 anos', answer: cost - quota * 2, unit: 'Kz' },
        ],
        'Valor a amortizar = custo − residual; quota = valor ÷ anos; VLC = custo − acumuladas.',
      )
    },
  ],
})
