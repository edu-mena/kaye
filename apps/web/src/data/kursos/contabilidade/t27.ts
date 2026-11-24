import { ACC, credit, debit, defineTopic, kz, vat, type Ctx } from './kit'

// Topic 27: case 2, a week of sales. Shop and numbers invented; the facts are shared by every exercise of the day.
// The price is the cost plus 40% (the cost is a multiple of 500 Kz, so the price and its VAT are whole numbers).

function facts(c: Ctx) {
  const unit = c.shared('unit', 4, 20, 2) * 500
  const price = (unit * 14) / 10
  const cash = c.shared('cash', 5, 30)
  const credits = c.shared('credit', 5, 30)
  return { unit, price, cash, credits, all: cash + credits }
}

type Facts = ReturnType<typeof facts>
const STORY = ({ unit, price, cash, credits }: Facts) =>
  `Na loja da Ana, cada artigo custa ${kz(unit)} e vende-se a ${kz(price)} (sem IVA). Na semana, vendeu ${cash} a pronto e ${credits} a crédito. IVA a 14%.`

export default defineTopic({
  id: 't27',
  intro: [
    'Segundo caso: uma semana de vendas na loja da Ana. Cada artigo custa à Ana um valor e vende-se com 40% de margem. Há vendas a pronto, que entram na caixa, e vendas a crédito, que ficam em Clientes. Cada venda tem dois lançamentos: um da venda (com IVA) e um do custo das mercadorias vendidas.',
    'No fim da semana, com os mesmos números, podes responder a várias perguntas: quanto vendeu, quanto cobrou de IVA, quanto ganhou (margem bruta), quanto dinheiro entrou e quanto ficou por receber.',
  ],
  rule: 'Venda com IVA: D Caixa ou Clientes (total), C Vendas (base), C IVA liquidado. Custo: D CMV, C Mercadorias. Margem bruta = vendas − CMV.',
  extra: [
    {
      type: 'case',
      title: 'Um dia na loja da Ana (exemplo com valores fixos)',
      body: [
        'Um artigo custa 2.000 Kz e vende-se a 2.800 Kz (sem IVA). Hoje vendeu 10 a pronto.',
        'Venda: D Caixa 31.920 (28.000 + 3.920 de IVA) / C Vendas 28.000 / C IVA liquidado 3.920.',
        'Custo: D Custo das mercadorias vendidas 20.000 / C Mercadorias 20.000.',
        'Margem bruta do dia: 28.000 − 20.000 = 8.000 Kz.',
      ],
    },
  ],
  points: [
    'Cada venda tem dois lançamentos: a venda e o custo da mercadoria.',
    'A pronto entra na caixa; a crédito fica em Clientes.',
    'Margem bruta = vendas (sem IVA) − custo das mercadorias vendidas.',
  ],
  quiz: [
    {
      prompt: 'Vendeste a pronto 28.000 Kz mais 14% de IVA. Quanto entra na caixa?',
      options: ['31.920 Kz', '28.000 Kz', '3.920 Kz'],
      answer: 0,
    },
    {
      prompt: 'Quando vendes mercadoria, o stock…',
      options: ['Diminui pelo custo', 'Aumenta', 'Fica igual'],
      answer: 0,
    },
    {
      prompt: 'A margem bruta usa as vendas…',
      options: ['Sem IVA', 'Com IVA', 'Só a crédito'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const f = facts(c)
      const base = f.cash * f.price
      return c.entry(
        `${STORY(f)} Regista as vendas a pronto.`,
        [debit(ACC.caixa, base + vat(base)), credit(ACC.vendas, base), credit(ACC.ivaLiq, vat(base))],
        'A caixa recebe o total com IVA; a venda é só a base; o IVA é dívida ao Estado.',
        [ACC.clientes, ACC.mercadorias],
      )
    },
    (c) => {
      const f = facts(c)
      const base = f.credits * f.price
      return c.entry(
        `${STORY(f)} Regista as vendas a crédito.`,
        [debit(ACC.clientes, base + vat(base)), credit(ACC.vendas, base), credit(ACC.ivaLiq, vat(base))],
        'Os clientes devem o total com IVA.',
        [ACC.caixa, ACC.bancos],
      )
    },
    (c) => {
      const f = facts(c)
      return c.entry(
        `${STORY(f)} Regista o custo de todas as mercadorias vendidas.`,
        [debit(ACC.cmv, f.all * f.unit), credit(ACC.mercadorias, f.all * f.unit)],
        'O stock desce pelo custo (crédito) e o custo da venda sobe (débito).',
        [ACC.vendas, ACC.caixa],
      )
    },
    (c) => {
      const f = facts(c)
      return c.num(
        `${STORY(f)} Qual foi o total das vendas, sem IVA?`,
        f.all * f.price,
        `${f.all} × ${f.price}.`,
      )
    },
    (c) => {
      const f = facts(c)
      return c.num(
        `${STORY(f)} Quanto IVA liquidado gerou a semana?`,
        vat(f.all * f.price),
        `14% de ${f.all * f.price}.`,
      )
    },
    (c) => {
      const f = facts(c)
      return c.num(
        `${STORY(f)} Qual foi a margem bruta da semana?`,
        f.all * (f.price - f.unit),
        `${f.all} × (${f.price} − ${f.unit}).`,
      )
    },
    (c) => {
      const f = facts(c)
      const base = f.credits * f.price
      return c.num(
        `${STORY(f)} Quanto devem os clientes no fim da semana (com IVA)?`,
        base + vat(base),
        `${base} + ${vat(base)}.`,
      )
    },
    (c) => {
      const f = facts(c)
      const base = f.cash * f.price
      return c.num(
        `${STORY(f)} Quanto dinheiro entrou na caixa com as vendas a pronto (com IVA)?`,
        base + vat(base),
        `${base} + ${vat(base)}.`,
      )
    },
    (c) =>
      c.decide(
        [
          'Um cliente quer levar 40 artigos por 112.000 Kz mais IVA, a crédito a 60 dias. A Ana nunca lhe vendeu.',
          'A Ana só tem 40 artigos em stock e a caixa está curta.',
        ],
        [
          {
            text: 'Propor metade a pronto e o resto a 30 dias, e pedir um sinal por escrito.',
            consequence: 'Vende e reduz o risco de não cobrar.',
          },
          {
            text: 'Vender tudo a 60 dias: é muita venda.',
            consequence: 'Fica sem stock e sem dinheiro, com muito risco.',
          },
          { text: 'Recusar a venda.', consequence: 'Perde uma boa venda sem tentar proteger-se.' },
        ],
        0,
        'O que faz mais sentido?',
      ),
  ],
})
