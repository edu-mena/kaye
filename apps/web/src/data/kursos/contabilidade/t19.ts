import { ACC, credit, debit, defineTopic, kz } from './kit'

// Topic 19: salaries and social security. Theme from Wikipedia (Payroll) and the INSS regime (Decreto Presidencial
// n.º 227/18: 8% employer, 3% employee; articles and base to confirm in the Diário da República). The IRT is not taught.

const gross = (c: { int: (min: number, max: number) => number }) => c.int(5, 60) * 10000

export default defineTopic({
  id: 't19',
  intro: [
    'O salário tem três valores. O bruto é o que está no contrato. O líquido é o que o trabalhador recebe. A diferença são os descontos: a contribuição do trabalhador para a Segurança Social (INSS), de 3% do salário, e o imposto sobre o rendimento do trabalho (IRT), que não se ensina neste Kurso.',
    'A empresa paga ainda a sua própria contribuição para o INSS, de 8% do salário. Segundo o Decreto Presidencial n.º 227/18 (confirmar o texto e a base no Diário da República), as taxas são 8% da entidade empregadora e 3% do trabalhador. O custo total do trabalhador para a empresa é o salário bruto mais os 8%.',
  ],
  rule: 'INSS do trabalhador = 3% do bruto; INSS da empresa = 8% do bruto. Líquido = bruto − descontos. Custo para a empresa = bruto + 8%.',
  extra: [
    {
      type: 'table',
      caption: 'Um salário de 100.000 Kz (sem IRT; valores inventados).',
      head: ['', 'Kz'],
      rows: [
        ['Salário bruto', kz(100000)],
        ['− INSS do trabalhador (3%)', kz(3000)],
        ['= Líquido a receber (sem IRT)', kz(97000)],
        ['INSS da empresa (8%)', kz(8000)],
        ['Custo total para a empresa', kz(108000)],
      ],
    },
  ],
  points: [
    'Bruto − descontos = líquido.',
    'INSS: 3% o trabalhador, 8% a empresa (confirmar no diploma).',
    'O custo para a empresa é maior do que o bruto.',
  ],
  quiz: [
    {
      prompt: 'Que percentagem do bruto paga a empresa para o INSS (neste Kurso)?',
      options: ['8%', '3%', '14%'],
      answer: 0,
    },
    {
      prompt: 'Bruto de 100.000 Kz. Quanto desconta o trabalhador para o INSS?',
      options: ['3.000 Kz', '8.000 Kz', '11.000 Kz'],
      answer: 0,
    },
    {
      prompt: 'O salário líquido é…',
      options: [
        'O que o trabalhador recebe depois dos descontos',
        'O que a empresa gasta',
        'O salário do contrato',
      ],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const pay = gross(c)
      return c.num(
        `Salário bruto de ${kz(pay)}. Quanto desconta o trabalhador para o INSS (3%)?`,
        pay * 0.03,
        `${pay} × 3%.`,
      )
    },
    (c) => {
      const pay = gross(c)
      return c.num(
        `Salário bruto de ${kz(pay)}. Qual é a contribuição da empresa para o INSS (8%)?`,
        pay * 0.08,
        `${pay} × 8%.`,
      )
    },
    (c) => {
      const pay = gross(c)
      return c.num(
        `Salário bruto de ${kz(pay)}, só com o desconto de INSS de 3% (ignora o IRT). Quanto recebe o trabalhador?`,
        pay * 0.97,
        `${pay} − 3%.`,
      )
    },
    (c) => {
      const pay = gross(c)
      return c.num(
        `Salário bruto de ${kz(pay)}. Qual é o custo total deste trabalhador para a empresa (bruto + INSS da empresa)?`,
        pay * 1.08,
        `${pay} + 8%.`,
      )
    },
    (c) => {
      const pay = gross(c)
      return c.entry(
        `Processa o salário bruto de ${kz(pay)} (ignora o IRT): INSS do trabalhador de 3% e da empresa de 8%.`,
        [debit(ACC.pessoal, pay * 1.08), credit(ACC.salarios, pay * 0.97), credit(ACC.inss, pay * 0.11)],
        'O custo é o bruto mais os 8% da empresa; o trabalhador tem a receber o líquido; ao INSS devem-se os 3% + 8%.',
        [ACC.bancos, ACC.caixa],
      )
    },
    (c) => {
      const net = c.base(50, 300)
      return c.entry(
        `A loja paga ${kz(net)} de salários líquidos por transferência bancária. Faz o lançamento.`,
        [debit(ACC.salarios, net), credit(ACC.bancos, net)],
        'A dívida ao pessoal desce e o banco desce.',
        [ACC.pessoal, ACC.inss],
      )
    },
    (c) => {
      const pay = gross(c)
      return c.entry(
        `A loja entrega ${kz(pay * 0.11)} ao INSS por transferência (3% + 8% de um salário). Faz o lançamento.`,
        [debit(ACC.inss, pay * 0.11), credit(ACC.bancos, pay * 0.11)],
        'A dívida ao INSS desce e o banco desce.',
        [ACC.salarios, ACC.pessoal],
      )
    },
    (c) =>
      c.ask(
        'Quem paga os 8% de contribuição para o INSS?',
        'A empresa, além do salário bruto',
        ['O trabalhador, descontado do salário', 'O Estado'],
        'Os 3% são do trabalhador e os 8% são da empresa (confirmar no diploma em vigor).',
      ),
    (c) =>
      c.decide(
        [
          'Um novo empregado propõe à Ana: «paga-me 100.000 Kz líquidos em mão e não me declares ao INSS».',
          'A Ana quer poupar os 8% da empresa.',
        ],
        [
          {
            text: 'Recusar e declarar o trabalhador, para que ele tenha direitos e a loja esteja em ordem.',
            consequence: 'O trabalhador fica protegido e a loja evita multas.',
          },
          {
            text: 'Aceitar: poupa-se dinheiro dos dois lados.',
            consequence: 'Sem registo, o trabalhador perde proteção e a loja arrisca multas.',
          },
          {
            text: 'Aceitar só nos dois primeiros meses.',
            consequence: 'Continua a ser um trabalhador não declarado.',
          },
        ],
        0,
        'O que deve fazer?',
      ),
  ],
})
