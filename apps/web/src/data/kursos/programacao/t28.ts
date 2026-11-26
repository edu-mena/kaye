import { defineTopic } from './kit'

// Topic 28: mini-project, cash register in Kz. Written from scratch; products and prices are invented.

const PRICES: Record<string, number> = { rice: 800, beans: 600, tea: 300, bread: 150, oil: 1200 }
const code = (data: Record<string, number>) =>
  `{${Object.entries(data)
    .map(([key, value]) => `"${key}": ${value}`)
    .join(', ')}}`

export default defineTopic({
  id: 't28',
  intro: [
    'Terceiro mini-projeto: uma caixa registadora simples. Os preços ficam num dicionário (produto: preço em Kz), o carrinho noutro (produto: quantidade), e um ciclo soma preço × quantidade. No fim, o troco é o que a pessoa deu menos o total.',
    'Se a pessoa der menos do que o total, o programa deve avisar em vez de mostrar um troco negativo. Todos os produtos e preços deste exemplo são inventados.',
  ],
  rule: 'total = soma de preço × quantidade para cada produto do carrinho; troco = pago - total, só se pago >= total.',
  code: {
    caption: 'A caixa registadora (preços inventados).',
    lines: [
      'prices = {"rice": 800, "beans": 600, "tea": 300}',
      'cart = {"rice": 2, "tea": 3}',
      'total = 0',
      'for product, quantity in cart.items():',
      '    total += prices[product] * quantity',
      'paid = 3000',
      'print(f"Total: {total} Kz")',
      'if paid >= total:',
      '    print(f"Troco: {paid - total} Kz")',
      'else:',
      '    print(f"Faltam {total - paid} Kz")',
    ],
  },
  points: [
    'Preços e carrinho em dicionários; um ciclo com acumulador dá o total.',
    'O troco é pago - total, mas só depois de testar se pago >= total.',
    'Uma chave que não existe em prices dá KeyError: convém verificar.',
  ],
  quiz: [
    {
      prompt: 'Com prices = {"tea": 300} e cart = {"tea": 3}, quanto é prices["tea"] * cart["tea"]?',
      options: ['303', '900', '3'],
      answer: 1,
    },
    {
      prompt: 'O que se testa antes de mostrar o troco?',
      options: ['Se pago >= total', 'Se total == 0', 'Se há chá'],
      answer: 0,
    },
    {
      prompt: 'Que erro dá prices["pizza"] se pizza não está em prices?',
      options: ['KeyError', 'ValueError', 'IndexError'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const items = ['rice', 'tea', 'bread'] as const
      const cart: Record<string, number> = {}
      for (const item of items.slice(0, 2)) cart[item] = c.int(1, 4)
      const total = Object.entries(cart).reduce(
        (sum, [product, quantity]) => sum + (PRICES[product] ?? 0) * quantity,
        0,
      )
      return c.out(
        `prices = ${code(PRICES)}\ncart = ${code(cart)}\ntotal = 0\nfor product, quantity in cart.items():\n    total += prices[product] * quantity\nprint(total)`,
        String(total),
        'Preço × quantidade de cada produto do carrinho, somados (Kz inventados).',
      )
    },
    (c) => {
      const quantity = c.int(2, 5)
      const total = 800 * quantity
      const paid = (Math.ceil(total / 1000) + c.int(0, 2)) * 1000
      return c.out(
        `prices = {"rice": 800}\ntotal = prices["rice"] * ${quantity}\npaid = ${paid}\nprint(f"Troco: {paid - total} Kz")`,
        `Troco: ${paid - total} Kz`,
        `Total ${total} Kz; troco = ${paid} - ${total}.`,
      )
    },
    (c) => {
      const quantity = c.int(2, 5)
      const total = 600 * quantity
      const paid = total + c.pick([-300, 400])
      return c.out(
        `total = 600 * ${quantity}\npaid = ${paid}\nif paid >= total:\n    print(f"Troco: {paid - total} Kz")\nelse:\n    print(f"Faltam {total - paid} Kz")`,
        paid >= total ? `Troco: ${paid - total} Kz` : `Faltam ${total - paid} Kz`,
        `Total ${total} Kz e pago ${paid} Kz: ${paid >= total ? 'chega' : 'não chega'}.`,
      )
    },
    (c) => {
      const probe = c.pick(['tea', 'pizza'])
      return c.out(
        `prices = {"tea": 300, "rice": 800}\nprint(prices.get("${probe}", 0))`,
        probe === 'tea' ? '300' : '0',
        'get() devolve 0 quando o produto não existe, em vez de dar KeyError.',
      )
    },
    (c) => {
      const quantity = c.int(2, 4)
      const price = c.pick([800, 600, 300])
      const discounted = price * quantity > 1500
      const total = discounted ? price * quantity - 100 : price * quantity
      return c.out(
        `total = ${price} * ${quantity}\nif total > 1500:\n    total -= 100\nprint(total)`,
        String(total),
        discounted
          ? 'Passou de 1500 Kz: desconto de 100 Kz (inventado).'
          : 'Não passou de 1500 Kz: sem desconto.',
      )
    },
    (c) =>
      c.ask(
        'Porque se testa paid >= total antes de calcular o troco?',
        'Para não mostrar um troco negativo quando falta dinheiro.',
        ['Porque o Python não deixa subtrair se pago for menor.', 'Para o programa correr mais depressa.'],
        'A conta pago - total correria, mas o resultado não faria sentido.',
      ),
    (c) =>
      c.fill(
        'for product, quantity in cart.___():\n    total += prices[product] * quantity',
        [['items']],
        '.items() dá cada par produto e quantidade.',
        'Completa com o método que percorre os pares do carrinho.',
      ),
    (c) =>
      c.order(
        'Ordena as linhas que calculam o total do carrinho.',
        [
          'total = 0',
          'for product, quantity in cart.items():',
          '    total += prices[product] * quantity',
          'print(total)',
        ],
        'Acumulador, ciclo, soma e resultado.',
      ),
    (c) =>
      c.decide(
        [
          'A caixa recebe o pedido “2 pizzas”, mas pizza não está no dicionário de preços.',
          'O programa pára com um erro e o cliente fica à espera.',
        ],
        [
          {
            text: 'Verificar com "pizza" in prices e avisar que o produto não existe.',
            consequence: 'O programa continua e a caixa percebe o problema.',
          },
          {
            text: 'Pôr o preço 0 em todos os produtos novos.',
            consequence: 'O cliente leva produtos de graça sem ninguém dar por isso.',
          },
          { text: 'Apagar a linha do total.', consequence: 'Já não há total para cobrar.' },
        ],
        0,
        'O que se faz?',
      ),
  ],
})
