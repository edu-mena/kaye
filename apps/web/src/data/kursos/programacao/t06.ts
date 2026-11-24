import { defineTopic } from './kit'

// Topic 6: string methods and f-strings. Theme from the Python Programming Wikibook (Strings); written from scratch.

const WORDS = ['luanda', 'huambo', 'kayé', 'python', 'escola', 'angola']

const title = (word: string) => word.charAt(0).toUpperCase() + word.slice(1)

export default defineTopic({
  id: 't06',
  intro: [
    'Um texto tem métodos: funções que se chamam com um ponto. texto.upper() devolve o texto em maiúsculas, texto.lower() em minúsculas, texto.strip() tira os espaços das pontas e texto.replace("a", "b") troca um pedaço por outro. Os métodos devolvem um texto novo: o original não muda.',
    'Para pôr variáveis dentro de um texto usa-se uma f-string: um f antes das aspas e as variáveis entre chavetas. f"Olá, {name}!" mostra o valor de name no sítio das chavetas.',
  ],
  rule: 'texto.upper(), .lower(), .strip(), .replace(velho, novo), .title(). Nada muda o texto original: guarda o resultado numa variável. f"…{variável}…" insere valores.',
  code: {
    caption: 'Métodos e f-string num exemplo só.',
    lines: [
      'name = "  kiala  "',
      'clean = name.strip()           # "kiala"',
      'print(clean.upper())           # KIALA',
      'print(clean.title())           # Kiala',
      'print(clean.replace("k", "c")) # ciala',
      'print(f"Olá, {clean}!")        # Olá, kiala!',
    ],
  },
  points: [
    'Os métodos de texto devolvem um texto novo; o original fica igual.',
    'strip() tira espaços das pontas, replace() troca pedaços.',
    'f"…{x}…" mete o valor de x dentro do texto.',
  ],
  quiz: [
    { prompt: 'O que imprime print("Kayé".upper())?', options: ['KAYÉ', 'kayé', 'Kayé'], answer: 0 },
    {
      prompt: 'name = "ana" e name.upper() sem guardar. Quanto vale name depois?',
      options: ['"ANA"', '"ana"', 'Erro'],
      answer: 1,
    },
    {
      prompt: 'Com n = 5, o que imprime print(f"Tens {n} anos")?',
      options: ['Tens 5 anos', 'Tens {n} anos', 'Tens n anos'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const word = c.pick(WORDS)
      return c.out(`print("${word}".upper())`, word.toUpperCase(), 'upper() passa tudo a maiúsculas.')
    },
    (c) => {
      const word = c.pick(WORDS)
      return c.out(`print("${word.toUpperCase()}".lower())`, word, 'lower() passa tudo a minúsculas.')
    },
    (c) => {
      const word = c.pick(WORDS)
      const spaces = ' '.repeat(c.int(1, 3))
      return c.out(
        `text = "${spaces}${word}${spaces}"\nprint(len(text.strip()))`,
        String([...word].length),
        'strip() tira os espaços das pontas; só ficam as letras.',
      )
    },
    (c) => {
      const word = c.pick(['banana', 'casa', 'escola', 'cacau'])
      const old = c.pick(['a', 'c'])
      const replacement = old === 'a' ? 'o' : 'k'
      return c.out(
        `print("${word}".replace("${old}", "${replacement}"))`,
        word.replaceAll(old, replacement),
        'replace() troca todas as ocorrências.',
      )
    },
    (c) => {
      const name = c.pick(['Nzinga', 'Paulo', 'Luzia', 'Kiala'])
      const n = c.int(14, 29)
      return c.out(
        `name = "${name}"\nage = ${n}\nprint(f"{name} tem {age} anos")`,
        `${name} tem ${n} anos`,
        'A f-string troca {name} e {age} pelos valores.',
      )
    },
    (c) => {
      const word = c.pick(WORDS)
      return c.out(`print("${word}".title())`, title(word), 'title() põe a primeira letra em maiúscula.')
    },
    (c) => {
      const word = c.pick(WORDS)
      return c.out(
        `text = "${word}"\ntext.upper()\nprint(text)`,
        word,
        'Os métodos não mudam o original; sem guardar o resultado, text fica igual.',
      )
    },
    (c) =>
      c.ask(
        'Qual é o prefixo que transforma um texto numa f-string?',
        'f antes das aspas: f"…"',
        ['$ antes das aspas: $"…"', 'Nenhum: as chavetas bastam'],
        'Sem o f, as chavetas ficam como texto.',
      ),
    (c) => {
      const word = c.pick(WORDS)
      return c.fill(
        `city = "${word}"\nprint(city.___())   # ${word.toUpperCase()}`,
        [['upper']],
        'upper() devolve o texto em maiúsculas.',
        'Completa com o método certo.',
      )
    },
  ],
})
