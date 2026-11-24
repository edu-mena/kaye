import { defineTopic } from './kit'

// Topic 17: dictionaries. Theme from the Python Programming Wikibook (Dictionaries); written from scratch.
// Names and prices in Kz are invented.

const PRODUCTS = ['rice', 'beans', 'oil', 'bread', 'tea', 'sugar']

const dict = (pairs: [string, number][]) =>
  `{${pairs.map(([key, value]) => `'${key}': ${value}`).join(', ')}}`
const code = (pairs: [string, number][]) =>
  `{${pairs.map(([key, value]) => `"${key}": ${value}`).join(', ')}}`

export default defineTopic({
  id: 't17',
  intro: [
    'Um dicionário (dict) guarda pares chave: valor entre chavetas. Em vez de procurar por posição, como numa lista, procuras pela chave: precos["rice"] dá o valor dessa chave. As chaves não se repetem.',
    'Para juntar ou mudar um valor escreve-se dicionario[chave] = valor. Pedir uma chave que não existe dá KeyError; o método get(chave, omissão) evita o erro e devolve o valor por omissão. A pergunta chave in dicionario diz se existe.',
  ],
  rule: 'd = {"chave": valor}; d["chave"] lê; d["chave"] = x junta ou muda; d.get("chave", 0) lê sem erro; "chave" in d testa; len(d) conta os pares.',
  code: {
    caption: 'Preços de uma cantina (valores inventados, em Kz).',
    lines: [
      'prices = {"rice": 800, "beans": 600}',
      'print(prices["rice"])          # 800',
      'prices["tea"] = 300            # junta um par',
      'prices["rice"] = 900           # muda o valor',
      'print(len(prices))             # 3',
      'print("oil" in prices)         # False',
      'print(prices.get("oil", 0))    # 0',
    ],
  },
  points: [
    'Dicionário: pares chave: valor; lê-se pela chave.',
    'd[chave] = valor junta um par novo ou muda um existente.',
    'Chave em falta: KeyError, ou get() com valor por omissão.',
  ],
  quiz: [
    { prompt: 'Com d = {"a": 1, "b": 2}, quanto vale d["b"]?', options: ['1', '2', '"b"'], answer: 1 },
    { prompt: 'O que dá d["x"] se "x" não é uma chave?', options: ['None', '0', 'KeyError'], answer: 2 },
    {
      prompt: 'Como se testa se existe a chave "rice" em prices?',
      options: ['"rice" in prices', 'prices.has("rice")', 'prices == "rice"'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const keys = [...PRODUCTS].slice(0, 3)
      const pairs = keys.map((key): [string, number] => [key, c.int(2, 9) * 100])
      const at = c.int(0, 2)
      return c.out(
        `prices = ${code(pairs)}\nprint(prices["${pairs[at]?.[0]}"])`,
        String(pairs[at]?.[1]),
        'Lê-se o valor pela chave.',
      )
    },
    (c) => {
      const pairs = PRODUCTS.slice(0, 3).map((key): [string, number] => [key, c.int(2, 9) * 100])
      return c.out(
        `prices = ${code(pairs)}\nprices["sugar"] = 500\nprint(len(prices))`,
        '4',
        'Uma chave nova junta um par: passa de 3 a 4.',
      )
    },
    (c) => {
      const pairs = PRODUCTS.slice(0, 3).map((key): [string, number] => [key, c.int(2, 9) * 100])
      const price = c.int(2, 9) * 100 + 50
      return c.out(
        `prices = ${code(pairs)}\nprices["rice"] = ${price}\nprint(len(prices), prices["rice"])`,
        `3 ${price}`,
        'Uma chave que já existe só muda de valor: o tamanho fica 3.',
      )
    },
    (c) => {
      const pairs = PRODUCTS.slice(0, 3).map((key): [string, number] => [key, c.int(2, 9) * 100])
      const probe = c.pick(['rice', 'tea'])
      return c.out(
        `prices = ${code(pairs)}\nprint("${probe}" in prices)`,
        probe === 'rice' ? 'True' : 'False',
        'in testa as chaves.',
      )
    },
    (c) => {
      const pairs = PRODUCTS.slice(0, 2).map((key): [string, number] => [key, c.int(2, 9) * 100])
      const probe = c.pick(['rice', 'oil'])
      const found = pairs.find(([key]) => key === probe)
      return c.out(
        `prices = ${code(pairs)}\nprint(prices.get("${probe}", 0))`,
        String(found ? found[1] : 0),
        'get() devolve o valor por omissão quando a chave não existe.',
      )
    },
    (c) => {
      const pairs = PRODUCTS.slice(0, 2).map((key): [string, number] => [key, c.int(2, 9) * 100])
      return c.out(
        `prices = ${code(pairs)}\nprint(prices)`,
        dict(pairs),
        'O print mostra o dicionário com chavetas e aspas simples.',
      )
    },
    (c) =>
      c.ask(
        'Qual é a diferença entre uma lista e um dicionário?',
        'A lista procura-se por posição; o dicionário, por chave.',
        ['A lista guarda só números.', 'O dicionário guarda só texto.'],
        'Em ambos podes guardar vários tipos, mas o acesso é diferente.',
      ),
    (c) =>
      c.ask(
        'O que acontece com prices["milk"] se não existe a chave "milk"?',
        'Dá KeyError.',
        ['Dá 0.', 'Dá None.'],
        'Para evitar o erro usa-se prices.get("milk", 0).',
      ),
    (c) =>
      c.fill(
        'prices = {"rice": 800}\nprint(prices.___("tea", 0))   # 0',
        [['get']],
        'get() lê sem dar erro e devolve o valor por omissão.',
        'Completa com o método que lê uma chave que pode não existir.',
      ),
  ],
})
