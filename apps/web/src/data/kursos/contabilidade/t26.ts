import { ACC, credit, debit, defineTopic, kz, vat, type Ctx } from './kit'

// Topic 26: case 1, the shop opens. The shop and its numbers are invented; the facts are the same in every exercise of
// the day (c.shared). VAT at 14%.

function facts(c: Ctx) {
  const capital = c.shared('capital', 400, 1000, 50) * 1000
  const equipment = c.shared('equipment', 100, 250, 10) * 1000
  const goods = c.shared('goods', 150, 400, 10) * 1000
  return { capital, equipment, goods }
}

const OPEN = (capital: number) => `A Ana abre uma mercearia e põe ${kz(capital)} na conta bancária da loja.`

export default defineTopic({
  id: 't26',
  intro: [
    'Primeiro caso, para juntar tudo o que aprendeste: a Ana abre a sua mercearia. Põe capital no banco, compra um balcão frigorífico pagando por transferência e compra a primeira remessa de mercadorias a crédito. Todos os valores têm IVA a 14% e são inventados.',
    'Em cada exercício de hoje os números são os mesmos: ficam fixos para o dia, para poderes seguir o caso do princípio ao fim. No fim, o balanço de abertura tem de equilibrar: ativo = passivo + capital próprio.',
  ],
  rule: 'Capital no banco: D Bancos, C Capital. Compra com IVA: D bem (base), D IVA dedutível, C Bancos ou Fornecedores (total).',
  extra: [
    {
      type: 'case',
      title: 'A mercearia da Ana (exemplo com valores fixos)',
      body: [
        'Dia 1: a Ana põe 600.000 Kz no banco como capital. D Bancos 600.000 / C Capital 600.000.',
        'Dia 2: compra um balcão frigorífico de 150.000 Kz mais IVA (21.000 Kz), por transferência. D Equipamento 150.000 / D IVA dedutível 21.000 / C Bancos 171.000.',
        'Dia 3: compra mercadorias de 200.000 Kz mais IVA (28.000 Kz), a crédito. D Mercadorias 200.000 / D IVA dedutível 28.000 / C Fornecedores 228.000.',
        'No fim: ativo = 429.000 (banco) + 150.000 + 200.000 + 49.000 = 828.000 Kz; passivo = 228.000; capital = 600.000. 228.000 + 600.000 = 828.000.',
      ],
    },
  ],
  points: [
    'Cada facto é um lançamento com débitos iguais a créditos.',
    'O IVA dedutível é ativo: é o que se vai descontar ao IVA a pagar.',
    'No fim, ativo = passivo + capital próprio.',
  ],
  quiz: [
    {
      prompt: 'O capital que o dono põe no banco…',
      options: ['Debita Bancos e credita Capital', 'Debita Capital e credita Bancos', 'Credita Vendas'],
      answer: 0,
    },
    {
      prompt: 'Uma compra a crédito com IVA credita…',
      options: ['Fornecedores pelo total com IVA', 'Fornecedores só pela base', 'Caixa'],
      answer: 0,
    },
    {
      prompt: 'No balanço de abertura, o ativo é igual a…',
      options: ['Passivo + capital próprio', 'Passivo − capital próprio', 'Só ao capital'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const { capital } = facts(c)
      return c.entry(
        `${OPEN(capital)} Faz o lançamento.`,
        [debit(ACC.bancos, capital), credit(ACC.capital, capital)],
        'O banco sobe a débito; o capital sobe a crédito.',
        [ACC.caixa, ACC.emprestimos],
      )
    },
    (c) => {
      const { equipment } = facts(c)
      return c.entry(
        `Depois, a Ana compra um balcão frigorífico de ${kz(equipment)} mais IVA a 14%, por transferência. Faz o lançamento.`,
        [
          debit(ACC.equip, equipment),
          debit(ACC.ivaDed, vat(equipment)),
          credit(ACC.bancos, equipment + vat(equipment)),
        ],
        'O equipamento é imobilizado; o IVA é dedutível; o banco paga o total.',
        [ACC.fornecedores, ACC.caixa],
      )
    },
    (c) => {
      const { goods } = facts(c)
      return c.entry(
        `A seguir, a Ana compra mercadorias de ${kz(goods)} mais IVA a 14%, a crédito. Faz o lançamento.`,
        [
          debit(ACC.mercadorias, goods),
          debit(ACC.ivaDed, vat(goods)),
          credit(ACC.fornecedores, goods + vat(goods)),
        ],
        'As mercadorias e o IVA entram a débito; a dívida, com IVA, a crédito.',
        [ACC.caixa, ACC.bancos],
      )
    },
    (c) => {
      const { capital, equipment } = facts(c)
      return c.num(
        `${OPEN(capital)} Pagou um balcão de ${kz(equipment)} mais IVA a 14% pelo banco. Qual é o saldo da conta Bancos?`,
        capital - equipment - vat(equipment),
        `${capital} − (${equipment} + ${vat(equipment)}).`,
      )
    },
    (c) => {
      const { equipment, goods } = facts(c)
      return c.num(
        `A Ana comprou um balcão de ${kz(equipment)} e mercadorias de ${kz(goods)}, ambos mais IVA a 14%. Qual é o saldo da conta IVA dedutível?`,
        vat(equipment) + vat(goods),
        `${vat(equipment)} + ${vat(goods)}.`,
      )
    },
    (c) => {
      const { goods } = facts(c)
      return c.num(
        `A Ana comprou mercadorias de ${kz(goods)} mais IVA a 14%, a crédito. Quanto deve ao fornecedor?`,
        goods + vat(goods),
        `${goods} + ${vat(goods)}.`,
      )
    },
    (c) => {
      const { capital, goods } = facts(c)
      return c.num(
        `Só há duas operações: capital de ${kz(capital)} no banco e mercadorias de ${kz(goods)} mais IVA a 14%, compradas a crédito. Qual é o total do ativo?`,
        capital + goods + vat(goods),
        `Bancos ${capital} + Mercadorias ${goods} + IVA dedutível ${vat(goods)}; é igual ao passivo (${goods + vat(goods)}) mais o capital (${capital}).`,
      )
    },
    (c) =>
      c.ask(
        'Porque aparece o IVA dedutível no ativo?',
        'Porque é um valor que a loja vai descontar ao IVA que deve ao Estado',
        ['Porque é um custo da loja', 'Porque é capital do dono'],
        'É um direito da loja sobre o Estado, até ao apuramento.',
      ),
    (c) =>
      c.decide(
        [
          'A Ana tem 600.000 Kz de capital. O fornecedor oferece mercadorias de 500.000 Kz a crédito (30 dias), mas ela só espera vender 200.000 Kz no primeiro mês.',
          'Tem também de pagar a renda e o salário de uma ajudante.',
        ],
        [
          {
            text: 'Comprar menos (por exemplo, 250.000 Kz) e repetir a compra quando vender.',
            consequence: 'Fica com liquidez e não deve mais do que consegue pagar.',
          },
          {
            text: 'Comprar tudo, porque o prazo é de 30 dias.',
            consequence: 'Fica com muito stock parado e uma dívida que talvez não consiga pagar.',
          },
          { text: 'Não comprar nada.', consequence: 'Sem mercadoria não há vendas.' },
        ],
        0,
        'O que faz mais sentido?',
      ),
  ],
})
