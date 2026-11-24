import { defineTopic, kz, type Ctx } from './kit'

// Topic 29: case 4, the month's trial balance. Shop and numbers invented; shared by every exercise of the day.
// To keep the case short there is no VAT here. The facts of the month:
//   capital in the bank; equipment paid by the bank; goods bought on credit; sales half cash, half on credit at a cost
//   of 60% of the sale; salaries paid in cash.

function facts(c: Ctx) {
  const capital = c.shared('capital', 400, 800, 50) * 1000
  const equipment = c.shared('equipment', 100, 250, 10) * 1000
  const goods = c.shared('goods', 150, 400, 10) * 1000
  const sales = c.shared('sales', 100, 250, 20) * 1000
  const salaries = c.shared('salaries', 20, 40, 10) * 1000
  const cost = (sales * 3) / 5
  return {
    capital,
    equipment,
    goods,
    sales,
    salaries,
    cost,
    bank: capital - equipment,
    stock: goods - cost,
    customers: sales / 2,
    cash: sales / 2 - salaries,
  }
}

type Facts = ReturnType<typeof facts>
const STORY = (f: Facts) =>
  `Mês da loja da Ana (sem IVA): capital ${kz(f.capital)} no banco; balcão de ${kz(f.equipment)} pago pelo banco; mercadorias de ${kz(f.goods)} compradas a crédito; vendas de ${kz(f.sales)}, metade a pronto e metade a crédito, com custo de 60% das vendas; salários de ${kz(f.salaries)} pagos em dinheiro.`

export default defineTopic({
  id: 't29',
  intro: [
    'Quarto caso: o balancete do mês. Com os factos do mês, calcula-se o saldo de cada conta e depois verifica-se que os saldos devedores somam o mesmo que os credores. Se não, há um erro para procurar.',
    'Para poupar contas, este caso não tem IVA. Cada exercício repete os factos do mês para poderes calcular o saldo que te pedem.',
  ],
  rule: 'Saldo de cada conta = o que entrou − o que saiu, de cada lado. Balancete: total dos saldos devedores = total dos saldos credores.',
  extra: [
    {
      type: 'table',
      caption: 'O balancete de um mês (exemplo com valores fixos, sem IVA).',
      head: ['Conta', 'Saldo devedor', 'Saldo credor'],
      rows: [
        ['Bancos', kz(450000), ''],
        ['Equipamento', kz(150000), ''],
        ['Mercadorias', kz(240000), ''],
        ['Clientes', kz(100000), ''],
        ['Caixa', kz(70000), ''],
        ['Custo das mercadorias vendidas', kz(120000), ''],
        ['Custos com o pessoal', kz(30000), ''],
        ['Fornecedores', '', kz(300000)],
        ['Capital', '', kz(600000)],
        ['Vendas', '', kz(200000)],
        ['Total', kz(1160000), kz(1100000)],
      ],
    },
    {
      type: 'text',
      title: 'Este balancete não fecha',
      body: [
        'O total dos devedores é maior em 60.000 Kz. Procura um lançamento que falte do lado do crédito ou que esteja a mais do lado do débito. (Neste exemplo faltam 60.000 Kz em Mercadorias: o saldo certo é 180.000 Kz.)',
      ],
    },
  ],
  points: [
    'Calcula-se o saldo de cada conta a partir dos factos do mês.',
    'O balancete fecha quando os dois totais são iguais.',
    'Se não fechar, procura-se a diferença no razão.',
  ],
  quiz: [
    {
      prompt: 'Compraste mercadorias de 300.000 Kz e vendeste a custo de 120.000 Kz. Saldo de Mercadorias?',
      options: ['180.000 Kz', '420.000 Kz', '300.000 Kz'],
      answer: 0,
    },
    {
      prompt: 'Qual destas contas tem saldo credor no balancete?',
      options: ['Vendas', 'Caixa', 'Equipamento'],
      answer: 0,
    },
    {
      prompt: 'O balancete tem débitos 60.000 Kz maiores. O que fazes?',
      options: ['Procuras a diferença nos lançamentos', 'Ignoras', 'Aumentas o capital'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const f = facts(c)
      return c.num(`${STORY(f)} Qual é o saldo da conta Bancos?`, f.bank, `${f.capital} − ${f.equipment}.`)
    },
    (c) => {
      const f = facts(c)
      return c.num(
        `${STORY(f)} Qual é o saldo da conta Mercadorias?`,
        f.stock,
        `${f.goods} − ${f.cost}: o stock desce pelo custo das mercadorias vendidas.`,
      )
    },
    (c) => {
      const f = facts(c)
      return c.num(
        `${STORY(f)} Qual é o saldo da conta Caixa?`,
        f.cash,
        `Metade das vendas (${f.sales / 2}) menos os salários (${f.salaries}).`,
      )
    },
    (c) => {
      const f = facts(c)
      return c.num(
        `${STORY(f)} Qual é o saldo da conta Clientes?`,
        f.customers,
        `Metade das vendas, a crédito: ${f.sales} ÷ 2.`,
      )
    },
    (c) => {
      const f = facts(c)
      return c.num(
        `${STORY(f)} Qual é o total dos saldos credores (Capital, Fornecedores e Vendas)?`,
        f.capital + f.goods + f.sales,
        `${f.capital} + ${f.goods} + ${f.sales}.`,
      )
    },
    (c) => {
      const f = facts(c)
      return c.num(
        `${STORY(f)} Qual é o total dos saldos devedores? (Bancos, Equipamento, Mercadorias, Clientes, Caixa, Custo das mercadorias vendidas e Pessoal.)`,
        f.bank + f.equipment + f.stock + f.customers + f.cash + f.cost + f.salaries,
        'Tem de ser igual ao total dos credores.',
      )
    },
    (c) => {
      const f = facts(c)
      return c.num(
        `${STORY(f)} Os saldos devedores de Bancos, Equipamento, Mercadorias, Caixa, CMV e Pessoal somam ${kz(f.bank + f.equipment + f.stock + f.cash + f.cost + f.salaries)}. Qual tem de ser o saldo de Clientes para o balancete fechar?`,
        f.customers,
        `Total dos credores (${f.capital + f.goods + f.sales}) − os restantes devedores.`,
      )
    },
    (c) => {
      const f = facts(c)
      return c.num(
        `${STORY(f)} Por engano, a venda a crédito foi lançada só a débito de Clientes, sem o crédito em Vendas. Quanto a menos somam os créditos no balancete?`,
        f.sales / 2,
        'Falta o crédito de Vendas da venda a crédito.',
      )
    },
    (c) =>
      c.ask(
        'Quais destas contas têm saldo credor no balancete da loja?',
        'Capital, Fornecedores e Vendas',
        ['Caixa, Bancos e Clientes', 'Equipamento, Mercadorias e Custo das mercadorias vendidas'],
        'Passivo, capital próprio e proveitos têm saldo credor.',
      ),
    (c) =>
      c.decide(
        [
          'O balancete do mês da loja não fecha: os créditos somam 15.000 Kz a menos que os débitos.',
          'A Ana vai entregar as contas ao contabilista amanhã.',
        ],
        [
          {
            text: 'Procurar um lançamento de 15.000 Kz ou de 7.500 Kz (um lado trocado) no diário.',
            consequence: 'Encontra o erro e corrige-o antes de entregar.',
          },
          {
            text: 'Pôr 15.000 Kz no capital para fechar.',
            consequence: 'O erro continua escondido e o capital fica errado.',
          },
          {
            text: 'Entregar o balancete e avisar que não fecha.',
            consequence: 'Dá trabalho a outros sem tentar antes.',
          },
        ],
        0,
        'O que deve fazer?',
      ),
  ],
})
