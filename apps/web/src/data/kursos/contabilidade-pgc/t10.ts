import { ACC, credit, debit, defineTopic, kz } from './kit'

// Topic 10: Imposto Industrial: from the accounting result to the taxable income and the tax to pay.
// The rate is always given in the question, so the exercises do not depend on the law in force.

export default defineTopic({
  id: 't10',
  intro: [
    'O Imposto Industrial é o imposto sobre o lucro das empresas. O ponto de partida é o resultado contabilístico antes de impostos, mas o Estado não aceita todos os custos: alguns têm de ser somados de volta. O resultado depois destes acertos é a matéria coletável.',
    'Ao imposto apurado desconta-se o que a empresa já pagou durante o ano por conta (os pagamentos provisórios). O que falta é o imposto a pagar.',
    'Neste Kurso a taxa vem sempre no enunciado. Em casos reais, confirma a taxa e as regras em vigor no Código do Imposto Industrial e nas suas alterações.',
  ],
  rule: 'Matéria coletável = resultado antes de impostos + custos não aceites fiscalmente. Imposto = matéria coletável × taxa. A pagar = imposto − pagamentos por conta.',
  extra: [
    {
      type: 'table',
      caption: 'Um exemplo, taxa de 25%.',
      head: ['Passo', 'Valor'],
      rows: [
        ['Resultado antes de impostos', '4.000.000'],
        ['+ Custos não aceites', '400.000'],
        ['= Matéria coletável', '4.400.000'],
        ['Imposto (25%)', '1.100.000'],
        ['− Pagamentos por conta', '300.000'],
        ['= Imposto a pagar', '800.000'],
      ],
    },
  ],
  points: [
    'A matéria coletável parte do resultado e soma os custos que o Estado não aceita.',
    'O imposto é a matéria coletável vezes a taxa; os pagamentos por conta já o reduzem.',
    'O imposto do ano é um custo do exercício.',
  ],
  quiz: [
    {
      prompt: 'Um custo não aceite fiscalmente, na matéria coletável…',
      options: ['Soma-se ao resultado', 'Tira-se ao resultado', 'Ignora-se'],
      answer: 0,
    },
    {
      prompt:
        'O imposto do ano é 600.000 Kz e já houve 200.000 Kz de pagamentos por conta. Quanto falta pagar?',
      options: ['400.000 Kz', '800.000 Kz', '200.000 Kz'],
      answer: 0,
    },
    {
      prompt: 'O Imposto Industrial incide sobre…',
      options: ['O lucro da empresa', 'Cada fatura de venda', 'Só os salários'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const result = c.int(10, 60) * 100000
      const extra = c.int(1, 8) * 10000
      return c.num(
        `O resultado antes de impostos é ${kz(result)} e há ${kz(extra)} de custos não aceites fiscalmente. Qual é a matéria coletável?`,
        result + extra,
        `${result} + ${extra}.`,
      )
    },
    (c) => {
      const base = c.int(10, 60) * 100000
      const rate = c.pick([20, 25, 30])
      return c.num(
        `A matéria coletável é ${kz(base)}. À taxa de ${rate}%, qual é o imposto?`,
        (base * rate) / 100,
        `${base} × ${rate}%.`,
      )
    },
    (c) => {
      const result = c.int(10, 60) * 100000
      const extra = c.int(1, 8) * 10000
      const rate = c.pick([25, 30])
      return c.num(
        `Resultado antes de impostos: ${kz(result)}. Custos não aceites: ${kz(extra)}. Taxa: ${rate}%. Qual é o imposto do ano?`,
        ((result + extra) * rate) / 100,
        `(${result} + ${extra}) × ${rate}%.`,
      )
    },
    (c) => {
      const tax = c.int(10, 50) * 100000
      const paid = c.int(1, 5) * 100000
      return c.num(
        `O imposto do ano é ${kz(tax)} e a empresa já pagou ${kz(paid)} por conta. Quanto falta pagar?`,
        tax - paid,
        `${tax} − ${paid}.`,
      )
    },
    (c) => {
      const tax = c.int(10, 50) * 100000
      const paid = c.int(1, 5) * 100000
      return c.entry(
        `No fim do ano, o imposto apurado é ${kz(tax)} e já havia ${kz(paid)} pagos por conta. Faz o lançamento do apuramento.`,
        [debit(ACC.imposto, tax), credit(ACC.pagConta, paid), credit(ACC.impostoPagar, tax - paid)],
        'O imposto é um custo; usa-se o que já foi pago por conta e fica a dívida ao Estado.',
        [ACC.bancos, ACC.resultado],
      )
    },
    (c) => {
      const tax = c.int(10, 50) * 100000
      return c.entry(
        `Pagaste ao Estado, por transferência, o imposto industrial em dívida de ${kz(tax)}. Faz o lançamento.`,
        [debit(ACC.impostoPagar, tax), credit(ACC.bancos, tax)],
        'A dívida ao Estado extingue-se a débito; o banco desce a crédito.',
        [ACC.caixa, ACC.imposto],
      )
    },
    (c) => {
      const result = c.int(20, 80) * 100000
      const rate = c.pick([25, 30])
      const tax = (result * rate) / 100
      return c.num(
        `Antes de impostos, uma empresa tem resultado de ${kz(result)} (sem custos não aceites) e a taxa é ${rate}%. Qual é o resultado líquido, depois do imposto?`,
        result - tax,
        `${result} − ${tax}.`,
      )
    },
    (c) =>
      c.ask(
        'O imposto industrial do ano, na demonstração de resultados, é…',
        'Um custo do exercício',
        ['Um proveito', 'Capital próprio', 'Um desconto às vendas'],
        'É deduzido ao resultado antes de impostos.',
      ),
    (c) =>
      c.fill(
        'A matéria ___ parte do resultado e soma os custos não ___ fiscalmente.',
        [
          ['coletável', 'coletável', 'tributável'],
          ['aceites', 'aceites'],
        ],
        'Resultado mais os custos que o Estado não aceita.',
      ),
  ],
})
