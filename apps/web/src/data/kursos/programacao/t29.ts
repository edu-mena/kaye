import { defineTopic } from './kit'

// Topic 29: mini-project, contact list. Written from scratch; names and numbers are invented (900 000 xxx).

const PEOPLE: [string, string][] = [
  ['Ana', '900000001'],
  ['Paulo', '900000002'],
  ['Luzia', '900000003'],
  ['Kiala', '900000004'],
]
const code = (pairs: [string, string][]) =>
  `{${pairs.map(([name, phone]) => `"${name}": "${phone}"`).join(', ')}}`

export default defineTopic({
  id: 't29',
  intro: [
    'Quarto mini-projeto: uma lista de contactos. O dicionário guarda nome: telefone e três funções fazem o trabalho: add junta ou muda um contacto, find procura e delete apaga. Dar um nome a cada tarefa deixa o programa principal curto e fácil de ler.',
    'Duas coisas novas: del contactos[nome] apaga um par, e contactos.pop(nome, valor) apaga e devolve o valor sem erro se a chave não existir. Os números de telefone deste exemplo são inventados.',
  ],
  rule: 'del d[chave] apaga (KeyError se não existir). d.pop(chave, omissão) apaga e devolve sem erro. Cada tarefa do programa pode ser uma função.',
  code: {
    caption: 'Três funções sobre um dicionário (números inventados).',
    lines: [
      'contacts = {}',
      '',
      'def add(name, phone):',
      '    contacts[name] = phone',
      '',
      'def find(name):',
      '    return contacts.get(name, "não existe")',
      '',
      'def delete(name):',
      '    contacts.pop(name, None)',
      '',
      'add("Ana", "900000001")',
      'add("Paulo", "900000002")',
      'delete("Paulo")',
      'print(find("Ana"), find("Paulo"), len(contacts))   # 900000001 não existe 1',
    ],
  },
  points: [
    'Um dicionário nome: telefone e uma função por tarefa.',
    'get e pop com valor por omissão evitam o KeyError.',
    'del apaga um par; juntar com a mesma chave substitui.',
  ],
  quiz: [
    {
      prompt: 'O que faz add("Ana", "900000009") se Ana já existe?',
      options: ['Dá erro', 'Muda o telefone da Ana', 'Junta um segundo contacto Ana'],
      answer: 1,
    },
    {
      prompt: 'Que método procura sem dar erro se o nome não existe?',
      options: ['contacts[name]', 'contacts.get(name, "não existe")', 'del contacts[name]'],
      answer: 1,
    },
    {
      prompt: 'O que dá len(contacts) depois de juntar 3 contactos diferentes e apagar 1?',
      options: ['1', '2', '3'],
      answer: 1,
    },
  ],
  exercises: [
    (c) => {
      const pairs = PEOPLE.slice(0, 3)
      const [name, phone] = c.pick(pairs)
      return c.out(
        `contacts = ${code(pairs)}\nprint(contacts["${name}"])`,
        phone,
        'Procura-se o telefone pela chave (o nome).',
      )
    },
    (c) => {
      const probe = c.pick(['Ana', 'Zeca'])
      return c.out(
        `contacts = ${code(PEOPLE.slice(0, 2))}\nprint(contacts.get("${probe}", "não existe"))`,
        probe === 'Ana' ? '900000001' : 'não existe',
        'get() devolve o valor por omissão se o nome não existe.',
      )
    },
    (c) => {
      const pairs = PEOPLE.slice(0, 3)
      const gone = c.pick(pairs)[0]
      return c.out(
        `contacts = ${code(pairs)}\ndel contacts["${gone}"]\nprint(len(contacts), "${gone}" in contacts)`,
        '2 False',
        'del apaga o par: ficam 2 contactos e o nome já não existe.',
      )
    },
    (c) => {
      const phone = '9000000' + String(c.int(10, 99))
      return c.out(
        `contacts = ${code(PEOPLE.slice(0, 2))}\ncontacts["Ana"] = "${phone}"\nprint(contacts["Ana"], len(contacts))`,
        `${phone} 2`,
        'A chave já existia: o telefone foi substituído e o tamanho não mudou.',
      )
    },
    (c) => {
      const pairs = PEOPLE.slice(0, c.int(2, 4))
      return c.out(
        `def add(name, phone):\n    contacts[name] = phone\n\ncontacts = {}\n${pairs.map(([name, phone]) => `add("${name}", "${phone}")`).join('\n')}\nprint(len(contacts))`,
        String(pairs.length),
        'Cada chamada de add junta um contacto novo.',
      )
    },
    (c) => {
      const pairs = PEOPLE.slice(0, 3)
      return c.out(
        `contacts = ${code(pairs)}\nfor name in contacts:\n    print(name)`,
        pairs.map(([name]) => name).join('\n'),
        'Um for sobre o dicionário dá os nomes, as chaves.',
      )
    },
    (c) =>
      c.ask(
        'Qual é a diferença entre del contacts["Ana"] e contacts.pop("Ana", None)?',
        'O pop não dá erro se Ana não existir; o del dá KeyError.',
        ['Nenhuma: os dois dão sempre KeyError.', 'O del devolve o telefone; o pop não.'],
        'pop aceita um valor por omissão para o caso de a chave não existir.',
      ),
    (c) =>
      c.fill(
        'def find(name):\n    return contacts.___(name, "não existe")',
        [['get']],
        'get() lê sem dar erro.',
        'Completa com o método que procura sem dar erro.',
      ),
    (c) =>
      c.order(
        'Ordena as linhas que definem add e a usam.',
        [
          'def add(name, phone):',
          '    contacts[name] = phone',
          'add("Ana", "900000001")',
          'print(len(contacts))',
        ],
        'Define-se a função, chama-se e depois mostra-se o resultado.',
      ),
    (c) =>
      c.decide(
        [
          'O programa de contactos guarda o telefone numa lista de dois valores [nome, telefone] por cada contacto.',
          'Para procurar a Luzia, o programa percorre a lista toda de cada vez.',
        ],
        [
          {
            text: 'Guardar num dicionário nome: telefone e procurar por contacts.get(nome).',
            consequence: 'A procura é direta e o código fica mais curto.',
          },
          {
            text: 'Ordenar a lista de dois em dois minutos.',
            consequence: 'Mais trabalho para o mesmo resultado.',
          },
          { text: 'Guardar só os nomes.', consequence: 'Sem telefone, o programa deixa de servir.' },
        ],
        0,
        'Qual é a melhor estrutura?',
      ),
  ],
})
