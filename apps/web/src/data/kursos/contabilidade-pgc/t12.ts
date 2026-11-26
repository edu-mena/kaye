import { ACC, credit, debit, defineTopic, kz } from './kit'

// Topic 12: share capital (subscribed and paid), reserves and the dividends of the year's result.
// Rates for the reserve are always given in the question.

export default defineTopic({
  id: 't12',
  intro: [
    'Quando os sócios criam uma sociedade, primeiro subscrevem o capital (prometem entregá-lo) e depois realizam-no (entregam o dinheiro). O capital sobe quando se subscreve; o que ainda falta realizar fica numa conta de sócios.',
    'No fim do ano, o resultado líquido pode ser aplicado de três maneiras: guardar parte em reservas (por exemplo, a reserva legal), distribuir parte aos sócios (dividendos) e deixar o resto em resultados transitados.',
    'Os dividendos aprovados passam a ser uma dívida da empresa aos sócios até serem pagos.',
  ],
  rule: 'Subscrição: débito Sócios, crédito Capital. Realização: débito Bancos, crédito Sócios. Aplicação do resultado: reservas e dividendos saem do resultado.',
  extra: [
    {
      type: 'table',
      caption: 'Resultado de 2.000.000 Kz: 10% para reserva legal e metade para dividendos.',
      head: ['Destino', 'Valor'],
      rows: [
        ['Reserva legal (10%)', '200.000'],
        ['Dividendos (50%)', '1.000.000'],
        ['Resultados transitados (o resto)', '800.000'],
      ],
    },
  ],
  points: [
    'Subscrever é prometer, realizar é pagar.',
    'A reserva legal e os dividendos saem do resultado líquido.',
    'Dividendos aprovados e por pagar são uma dívida aos sócios.',
  ],
  quiz: [
    {
      prompt: 'Os sócios subscrevem o capital. Que conta sobe a crédito?',
      options: ['Capital', 'Bancos', 'Reservas'],
      answer: 0,
    },
    {
      prompt: 'Um dividendo aprovado e ainda não pago é…',
      options: ['Uma dívida aos sócios', 'Um custo', 'Um aumento de capital'],
      answer: 0,
    },
    {
      prompt: 'Realizar o capital quer dizer…',
      options: ['Entregar o dinheiro prometido', 'Prometer o dinheiro', 'Distribuir os lucros'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const capital = c.int(5, 40) * 1000000
      return c.entry(
        `Os sócios subscrevem um capital de ${kz(capital)}. Faz o lançamento da subscrição.`,
        [debit(ACC.socios, capital), credit(ACC.capital, capital)],
        'O capital sobe a crédito; os sócios ficam a dever o que prometeram.',
        [ACC.bancos, ACC.caixa],
      )
    },
    (c) => {
      const capital = c.int(5, 40) * 1000000
      const percent = c.pick([25, 40, 50])
      const paid = (capital * percent) / 100
      return c.entry(
        `Os sócios realizam ${percent}% do capital subscrito de ${kz(capital)}, por transferência. Faz o lançamento.`,
        [debit(ACC.bancos, paid), credit(ACC.socios, paid)],
        'O dinheiro entra no banco; a dívida dos sócios desce.',
        [ACC.capital, ACC.caixa],
      )
    },
    (c) => {
      const capital = c.int(5, 40) * 1000000
      const percent = c.pick([25, 40, 50])
      return c.num(
        `O capital subscrito é ${kz(capital)} e os sócios já realizaram ${percent}%. Quanto falta realizar?`,
        capital - (capital * percent) / 100,
        `${capital} − ${percent}%.`,
      )
    },
    (c) => {
      const result = c.int(5, 40) * 500000
      const rate = c.pick([5, 10, 20])
      return c.num(
        `O resultado líquido é ${kz(result)} e a reserva legal é de ${rate}%. Quanto se guarda em reserva?`,
        (result * rate) / 100,
        `${result} × ${rate}%.`,
      )
    },
    (c) => {
      const result = c.int(5, 40) * 500000
      const reserve = c.pick([10, 20])
      const dividend = c.pick([30, 50])
      return c.num(
        `Do resultado líquido de ${kz(result)}, ${reserve}% vai para reserva legal e ${dividend}% para dividendos. Quanto fica em resultados transitados?`,
        result - (result * reserve) / 100 - (result * dividend) / 100,
        `${result} − ${(result * reserve) / 100} − ${(result * dividend) / 100}.`,
      )
    },
    (c) => {
      const result = c.int(5, 40) * 500000
      const reserve = c.pick([10, 20])
      const dividend = c.pick([30, 50])
      const toReserve = (result * reserve) / 100
      const toDividends = (result * dividend) / 100
      return c.entry(
        `A assembleia aprova a aplicação do resultado líquido de ${kz(result)}: ${reserve}% para reserva legal, ${dividend}% para dividendos e o resto fica em transitados. Faz o lançamento.`,
        [
          debit(ACC.resultado, result),
          credit(ACC.reservaLegal, toReserve),
          credit(ACC.dividendos, toDividends),
          credit(ACC.resultadosTrans, result - toReserve - toDividends),
        ],
        'O resultado fecha a débito e reparte-se pelos três destinos a crédito.',
        [ACC.bancos, ACC.capital],
      )
    },
    (c) => {
      const dividends = c.int(2, 20) * 500000
      return c.entry(
        `Pagaste, por transferência, os dividendos aprovados de ${kz(dividends)}. Faz o lançamento.`,
        [debit(ACC.dividendos, dividends), credit(ACC.bancos, dividends)],
        'A dívida aos sócios extingue-se e o banco desce.',
        [ACC.caixa, ACC.reservaLegal],
      )
    },
    (c) =>
      c.ask(
        'Qual é a diferença entre subscrever e realizar o capital?',
        'Subscrever é prometer o valor; realizar é entregá-lo',
        ['São a mesma coisa', 'Subscrever é distribuir lucros', 'Realizar é aprovar dividendos'],
        'Primeiro a promessa, depois o pagamento.',
      ),
    (c) =>
      c.fill(
        'A parte do resultado guardada para reforçar a empresa chama-se ___; a parte entregue aos sócios chama-se ___.',
        [
          ['reserva', 'reservas'],
          ['dividendos', 'dividendo'],
        ],
        'Reservas ficam na empresa; dividendos saem para os sócios.',
      ),
    (c) => {
      const result = c.int(5, 40) * 500000
      const reserve = c.pick([10, 20])
      const dividend = c.pick([30, 50])
      return c.steps(
        'Aplica o resultado líquido.',
        [`Resultado líquido: ${kz(result)}. Reserva legal: ${reserve}%. Dividendos: ${dividend}%.`],
        [
          { label: 'Reserva legal', answer: (result * reserve) / 100, unit: 'Kz' },
          { label: 'Dividendos', answer: (result * dividend) / 100, unit: 'Kz' },
          {
            label: 'Resultados transitados',
            answer: result - (result * reserve) / 100 - (result * dividend) / 100,
            unit: 'Kz',
          },
        ],
        'O que não vai para reserva nem para dividendos fica transitado.',
      )
    },
  ],
})
