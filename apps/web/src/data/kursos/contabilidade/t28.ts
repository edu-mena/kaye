import { ACC, credit, debit, defineTopic, kz, vat, type Ctx } from './kit'

// Topic 28: case 3, salaries and VAT of the month. Shop and numbers invented; shared by every exercise of the day.
// INSS: 3% employee and 8% employer (to confirm in the Decreto Presidencial n.º 227/18); the IRT is left out.

function facts(c: Ctx) {
  const first = c.shared('first', 5, 20) * 10000
  const second = c.shared('second', 5, 20) * 10000
  const sales = c.shared('sales', 400, 900, 50) * 1000
  const purchases = c.shared('purchases', 150, 350, 50) * 1000
  return { first, second, gross: first + second, sales, purchases }
}

type Facts = ReturnType<typeof facts>
const STORY = ({ first, second, sales, purchases }: Facts) =>
  `No mês, a loja da Ana tem dois empregados com salários brutos de ${kz(first)} e ${kz(second)} (INSS: 3% o trabalhador, 8% a loja; ignora o IRT). Vendeu ${kz(sales)} e comprou ${kz(purchases)}, ambos sem IVA, a 14%.`

export default defineTopic({
  id: 't28',
  intro: [
    'Terceiro caso: o fim do mês na loja da Ana. Há duas tarefas: processar os salários (com o INSS) e apurar o IVA. Os números são os mesmos em todos os exercícios de hoje.',
    'Nos salários, o custo para a loja é o bruto mais 8%; o trabalhador recebe o bruto menos 3%; ao INSS entregam-se 11% do bruto. No IVA, entrega-se ao Estado o IVA liquidado das vendas menos o IVA dedutível das compras.',
  ],
  rule: 'Salários: custo = bruto × 1,08; líquido = bruto × 0,97; INSS = bruto × 0,11. IVA a pagar = IVA das vendas − IVA das compras.',
  extra: [
    {
      type: 'case',
      title: 'O fim de mês da loja (exemplo com valores fixos)',
      body: [
        'Salários brutos: 100.000 Kz e 80.000 Kz (total 180.000). INSS do trabalhador: 5.400; da loja: 14.400.',
        'Processamento: D Custos com o pessoal 194.400 / C Salários a pagar 174.600 / C INSS a pagar 19.800.',
        'Vendas do mês: 500.000 Kz (IVA 70.000). Compras: 300.000 Kz (IVA 42.000). IVA a pagar: 28.000 Kz.',
      ],
    },
  ],
  points: [
    'O custo do pessoal para a loja é o bruto + 8% de INSS.',
    'Ao INSS entregam-se os 11% (3% do trabalhador + 8% da loja).',
    'IVA a pagar = IVA liquidado − IVA dedutível.',
  ],
  quiz: [
    {
      prompt: 'Salários brutos de 180.000 Kz. Quanto entrega a loja ao INSS (3% + 8%)?',
      options: ['19.800 Kz', '14.400 Kz', '5.400 Kz'],
      answer: 0,
    },
    {
      prompt: 'O trabalhador recebe…',
      options: ['O bruto menos o desconto de 3%', 'O bruto mais 8%', 'O bruto mais 3%'],
      answer: 0,
    },
    {
      prompt: 'O IVA do mês a pagar é…',
      options: ['IVA das vendas − IVA das compras', 'IVA das compras − IVA das vendas', 'A soma dos dois'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const f = facts(c)
      return c.num(`${STORY(f)} Qual é o total dos salários brutos?`, f.gross, `${f.first} + ${f.second}.`)
    },
    (c) => {
      const f = facts(c)
      return c.num(
        `${STORY(f)} Quanto se entrega ao INSS no total (3% + 8% dos salários brutos)?`,
        f.gross * 0.11,
        `${f.gross} × 11%.`,
      )
    },
    (c) => {
      const f = facts(c)
      return c.num(
        `${STORY(f)} Quanto recebem os dois empregados no total (bruto menos 3%)?`,
        f.gross * 0.97,
        `${f.gross} × 0,97.`,
      )
    },
    (c) => {
      const f = facts(c)
      return c.num(
        `${STORY(f)} Qual é o custo total com o pessoal para a loja (bruto mais 8%)?`,
        f.gross * 1.08,
        `${f.gross} × 1,08.`,
      )
    },
    (c) => {
      const f = facts(c)
      return c.entry(
        `${STORY(f)} Processa os salários do mês.`,
        [
          debit(ACC.pessoal, f.gross * 1.08),
          credit(ACC.salarios, f.gross * 0.97),
          credit(ACC.inss, f.gross * 0.11),
        ],
        'O custo é o bruto + 8%; aos trabalhadores deve-se o líquido; ao INSS, os 11%.',
        [ACC.bancos, ACC.caixa],
      )
    },
    (c) => {
      const f = facts(c)
      return c.entry(
        `${STORY(f)} Paga os salários líquidos por transferência.`,
        [debit(ACC.salarios, f.gross * 0.97), credit(ACC.bancos, f.gross * 0.97)],
        'A dívida ao pessoal desce e o banco desce.',
        [ACC.pessoal, ACC.inss],
      )
    },
    (c) => {
      const f = facts(c)
      return c.num(`${STORY(f)} Quanto é o IVA liquidado do mês?`, vat(f.sales), `14% de ${f.sales}.`)
    },
    (c) => {
      const f = facts(c)
      return c.num(
        `${STORY(f)} Quanto é o IVA a pagar ao Estado?`,
        vat(f.sales) - vat(f.purchases),
        `${vat(f.sales)} − ${vat(f.purchases)}.`,
      )
    },
    (c) => {
      const f = facts(c)
      return c.entry(
        `${STORY(f)} Faz o lançamento do apuramento do IVA do mês.`,
        [
          debit(ACC.ivaLiq, vat(f.sales)),
          credit(ACC.ivaDed, vat(f.purchases)),
          credit(ACC.estado, vat(f.sales) - vat(f.purchases)),
        ],
        'As duas contas do IVA fecham e a diferença fica em dívida ao Estado.',
        [ACC.bancos, ACC.caixa],
      )
    },
    (c) =>
      c.decide(
        [
          'No fim do mês, a Ana tem 120.000 Kz na conta e deve 100.000 Kz de IVA e INSS ao Estado, mais 150.000 Kz de salários líquidos.',
          'Os clientes devem-lhe 300.000 Kz, mas só vão pagar na próxima semana.',
        ],
        [
          {
            text: 'Pagar primeiro os salários líquidos (dívida aos trabalhadores) e combinar com o Estado a regularização do resto.',
            consequence: 'Os trabalhadores recebem a horas e a loja mantém-se de boa-fé com o Estado.',
          },
          {
            text: 'Não pagar nada até os clientes pagarem.',
            consequence: 'Trabalhadores sem salário e dívidas ao Estado a crescer.',
          },
          {
            text: 'Pagar só o IVA e atrasar os salários.',
            consequence: 'Os trabalhadores ficam sem rendimento.',
          },
        ],
        0,
        'O que faz mais sentido?',
      ),
  ],
})
