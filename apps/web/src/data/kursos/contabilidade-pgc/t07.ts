import { ACC, credit, debit, defineTopic, kz } from './kit'

// Topic 7: inventory costing: FIFO, LIFO and the weighted average cost.

type Layer = { units: number; price: number }

/** The cost of `sold` units taken from the layers in the order given (oldest first for FIFO). */
function take(layers: Layer[], sold: number): number {
  let left = sold
  let cost = 0
  for (const layer of layers) {
    const used = Math.min(left, layer.units)
    cost += used * layer.price
    left -= used
  }
  return cost
}

const average = (layers: Layer[]) => {
  const units = layers.reduce((sum, layer) => sum + layer.units, 0)
  return layers.reduce((sum, layer) => sum + layer.units * layer.price, 0) / units
}

/** Two purchases at rising prices, and a sale larger than the first one so the methods differ. */
function scene(c: { int: (min: number, max: number) => number }) {
  const first: Layer = { units: c.int(2, 5) * 100, price: c.int(2, 5) * 100 }
  const second: Layer = { units: c.int(2, 5) * 100, price: first.price + c.int(1, 3) * 100 }
  // The whole first layer plus part of the second (never all of it).
  const sold = first.units + Math.min(c.int(1, 2) * 100, second.units - 100)
  return { first, second, sold }
}

const text = (first: Layer, second: Layer, sold: number) =>
  `Existências iniciais: ${first.units} unidades a ${kz(first.price)}. Compra seguinte: ${second.units} unidades a ${kz(second.price)}. Vendem-se ${sold} unidades.`

export default defineTopic({
  id: 't07',
  intro: [
    'Quando a mesma mercadoria foi comprada a preços diferentes, qual é o custo do que se vendeu? Depende da fórmula de custeio que a empresa escolhe e mantém.',
    'FIFO (first in, first out): sai primeiro o que entrou primeiro. LIFO (last in, first out): sai primeiro o que entrou por último. Custo médio ponderado: todas as unidades valem o preço médio do que se comprou.',
    'Quando os preços sobem, o FIFO dá o custo das vendas mais baixo (e o lucro mais alto); o LIFO dá o custo mais alto. O que sobra em armazém tem o valor contrário.',
  ],
  rule: 'Custo das vendas = FIFO: das camadas mais antigas; LIFO: das mais recentes; médio: unidades × preço médio ponderado.',
  extra: [
    {
      type: 'table',
      caption: '100 un. a 200 Kz e 100 un. a 300 Kz; vendem-se 150 un.',
      head: ['Fórmula', 'Custo das vendas', 'Como'],
      rows: [
        ['FIFO', '35.000 Kz', '100 × 200 + 50 × 300'],
        ['LIFO', '40.000 Kz', '100 × 300 + 50 × 200'],
        ['Médio', '37.500 Kz', '150 × 250'],
      ],
    },
  ],
  points: [
    'Com preços a subir, FIFO dá custo das vendas menor e lucro maior.',
    'O LIFO consome primeiro as compras mais recentes (mais caras, se os preços sobem).',
    'O custo médio dá a todas as unidades o preço médio ponderado.',
  ],
  quiz: [
    {
      prompt: 'Em FIFO, que unidades se consideram vendidas primeiro?',
      options: ['As que entraram primeiro', 'As que entraram por último', 'As mais baratas'],
      answer: 0,
    },
    {
      prompt: 'Os preços sobem. Que fórmula dá o custo das vendas mais baixo?',
      options: ['FIFO', 'LIFO', 'Todas dão o mesmo'],
      answer: 0,
    },
    {
      prompt: '100 un. a 200 Kz e 100 un. a 300 Kz. Qual é o custo médio unitário?',
      options: ['250 Kz', '200 Kz', '300 Kz'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const { first, second, sold } = scene(c)
      return c.num(
        `${text(first, second, sold)} Qual é o custo das vendas em FIFO?`,
        take([first, second], sold),
        'No FIFO sai primeiro a camada mais antiga.',
      )
    },
    (c) => {
      const { first, second, sold } = scene(c)
      return c.num(
        `${text(first, second, sold)} Qual é o custo das vendas em LIFO?`,
        take([second, first], sold),
        'No LIFO sai primeiro a camada mais recente.',
      )
    },
    (c) => {
      const { first, second, sold } = scene(c)
      const price = average([first, second])
      return c.num(
        `${text(first, second, sold)} Qual é o custo das vendas pelo custo médio ponderado?`,
        sold * price,
        `Preço médio = ${price}; ${sold} × ${price}.`,
        'Kz',
        1,
      )
    },
    (c) => {
      const { first, second, sold } = scene(c)
      const total = first.units * first.price + second.units * second.price
      return c.num(
        `${text(first, second, sold)} Qual é o valor das existências finais em FIFO?`,
        total - take([first, second], sold),
        'Existências finais = tudo o que se comprou − custo do que se vendeu.',
      )
    },
    (c) => {
      const { first, second, sold } = scene(c)
      const fifo = take([first, second], sold)
      const lifo = take([second, first], sold)
      return c.num(
        `${text(first, second, sold)} Quanto mais lucro dá o FIFO do que o LIFO?`,
        lifo - fifo,
        'Os preços sobem: o FIFO tem custo menor, logo o lucro é maior pela diferença.',
      )
    },
    (c) => {
      const { first, second, sold } = scene(c)
      const cost = take([first, second], sold)
      return c.entry(
        `${text(first, second, sold)} Regista o custo das mercadorias vendidas em FIFO.`,
        [debit(ACC.cmv, cost), credit(ACC.mercadorias, cost)],
        'O custo das vendas sobe a débito e as mercadorias descem a crédito.',
        [ACC.vendas, ACC.fornecedores],
      )
    },
    (c) =>
      c.ask(
        'Quando os preços sobem, que fórmula dá o lucro mais alto?',
        'FIFO',
        ['LIFO', 'Custo médio', 'Todas dão o mesmo'],
        'O FIFO deixa as compras mais recentes (mais caras) em armazém e vende as mais baratas.',
      ),
    (c) =>
      c.fill(
        'FIFO quer dizer first in, first ___; LIFO quer dizer last in, first ___.',
        [['out'], ['out']],
        'Quem entra primeiro (FIFO) ou por último (LIFO) sai primeiro.',
      ),
    (c) =>
      c.decide(
        [
          'A Papelaria Central comprou cadernos em janeiro a 200 Kz e em março a 300 Kz.',
          'Quer saber quanto lucrou: vendeu 150 cadernos a 500 Kz cada.',
        ],
        [
          {
            text: 'Usar sempre o preço da última compra',
            consequence: 'Isso é só uma fórmula (LIFO) e tem de ser a mesma sempre.',
          },
          {
            text: 'Escolher uma fórmula (por exemplo FIFO) e mantê-la nos anos seguintes',
            consequence: 'A comparação entre anos só faz sentido se a fórmula não mudar.',
          },
          {
            text: 'Mudar de fórmula todos os meses para pagar menos imposto',
            consequence: 'Isso estraga a comparação e não é permitido.',
          },
        ],
        1,
        'Como calculas o custo?',
      ),
  ],
})
