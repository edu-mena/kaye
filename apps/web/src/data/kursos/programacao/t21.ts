import { defineTopic } from './kit'

// Topic 21: text files. Theme from the Python Programming Wikibook (Files); written from scratch.
// The page never runs code and never touches a file: the exercises say what the listing would show.

const NAMES = ['Ana', 'Paulo', 'Luzia', 'Kiala', 'Nzinga']

/** Python lines that write each name followed by a newline (the \n is Python's escape, written out). */
const writes = (names: string[]) => names.map((name) => `    file.write("${name}\\n")`).join('\n')

export default defineTopic({
  id: 't21',
  intro: [
    'Para guardar dados depois de o programa acabar, escreve-se num ficheiro. open("nome.txt", modo) abre o ficheiro: "r" para ler (é o modo por omissão), "w" para escrever (apaga o que lá estava) e "a" para acrescentar ao fim.',
    'Usa sempre with open(…) as file: o ficheiro fecha-se sozinho no fim do bloco. file.write(texto) escreve (e o \\n muda de linha), file.read() devolve tudo num texto e um for sobre o ficheiro dá uma linha de cada vez, com o \\n no fim: line.strip() tira-o. Abrir para ler um ficheiro que não existe dá FileNotFoundError.',
  ],
  rule: 'with open("f.txt", "w") as file: escreve; "a" acrescenta; "r" lê. "w" apaga o conteúdo anterior. file.write não muda de linha sozinho: acrescenta "\\n".',
  code: {
    caption: 'Escrever e voltar a ler um ficheiro de nomes.',
    lines: [
      'with open("names.txt", "w") as file:',
      '    file.write("Ana\\n")',
      '    file.write("Paulo\\n")',
      '',
      'with open("names.txt") as file:',
      '    for line in file:',
      '        print(line.strip())    # Ana, Paulo',
    ],
  },
  points: [
    'Modos: "r" lê, "w" escreve (apaga), "a" acrescenta.',
    'with open(…) as file: fecha o ficheiro sozinho.',
    'write não muda de linha: junta \\n; line.strip() tira-o ao ler.',
    'Ler um ficheiro que não existe dá FileNotFoundError.',
  ],
  quiz: [
    { prompt: 'Que modo acrescenta ao fim sem apagar?', options: ['"r"', '"w"', '"a"'], answer: 2 },
    {
      prompt: 'O que acontece a um ficheiro existente aberto com "w"?',
      options: ['O conteúdo é apagado', 'Acrescenta ao fim', 'Dá erro'],
      answer: 0,
    },
    {
      prompt: 'Que erro dá abrir para ler um ficheiro que não existe?',
      options: ['KeyError', 'FileNotFoundError', 'ValueError'],
      answer: 1,
    },
  ],
  exercises: [
    (c) => {
      const names = NAMES.slice(0, c.int(2, 3))
      return c.out(
        `with open("names.txt", "w") as file:\n${writes(names)}\nwith open("names.txt") as file:\n    for line in file:\n        print(line.strip())`,
        names.join('\n'),
        'Escreve-se cada nome numa linha e volta-se a ler linha a linha.',
      )
    },
    (c) => {
      const names = NAMES.slice(0, c.int(2, 5))
      return c.out(
        `with open("names.txt", "w") as file:\n${writes(names)}\nwith open("names.txt") as file:\n    lines = file.readlines()\nprint(len(lines))`,
        String(names.length),
        'readlines() dá uma lista com uma entrada por linha.',
      )
    },
    (c) => {
      const names = NAMES.slice(0, 2)
      const total = names.reduce((sum, name) => sum + name.length + 1, 0)
      return c.out(
        `with open("names.txt", "w") as file:\n${writes(names)}\nwith open("names.txt") as file:\n    text = file.read()\nprint(len(text))`,
        String(total),
        'Cada linha tem as letras do nome mais o \\n do fim.',
      )
    },
    (c) => {
      const [first, second] = [c.pick(NAMES.slice(0, 2)), c.pick(NAMES.slice(2))]
      return c.out(
        `with open("names.txt", "w") as file:\n    file.write("${first}\\n")\nwith open("names.txt", "a") as file:\n    file.write("${second}\\n")\nwith open("names.txt") as file:\n    for line in file:\n        print(line.strip())`,
        `${first}\n${second}`,
        '"a" acrescenta: os dois nomes ficam no ficheiro.',
      )
    },
    (c) => {
      const [first, second] = [c.pick(NAMES.slice(0, 2)), c.pick(NAMES.slice(2))]
      return c.out(
        `with open("names.txt", "w") as file:\n    file.write("${first}\\n")\nwith open("names.txt", "w") as file:\n    file.write("${second}\\n")\nwith open("names.txt") as file:\n    for line in file:\n        print(line.strip())`,
        second,
        'A segunda abertura com "w" apagou o primeiro nome.',
      )
    },
    (c) => {
      const name = c.pick(NAMES)
      const grade = c.int(8, 18)
      return c.out(
        `with open("grades.txt", "w") as file:\n    file.write("${name},${grade}\\n")\nwith open("grades.txt") as file:\n    name, grade = file.readline().strip().split(",")\nprint(name, int(grade) + 1)`,
        `${name} ${grade + 1}`,
        'split(",") parte a linha em duas partes de texto; int() converte a nota antes de somar.',
      )
    },
    (c) =>
      c.ask(
        'O que acontece se abrires para ler, com open("lista.txt"), um ficheiro que não existe?',
        'Dá FileNotFoundError.',
        ['Cria o ficheiro vazio.', 'Devolve um texto vazio.'],
        'Só os modos "w" e "a" criam o ficheiro.',
      ),
    (c) =>
      c.ask(
        'Porque se usa with open(…) as file?',
        'Porque o ficheiro fecha-se sozinho no fim do bloco.',
        ['Porque é mais rápido a ler.', 'Porque sem with o ficheiro não abre.'],
        'Fechar o ficheiro garante que os dados ficam guardados.',
      ),
    (c) =>
      c.fill(
        'with open("log.txt", "___") as file:\n    file.write("novo\\n")   # acrescenta ao fim',
        [['a']],
        'O modo "a" (append) acrescenta sem apagar.',
        'Completa com o modo que acrescenta ao fim do ficheiro.',
      ),
    (c) =>
      c.fill(
        'with ___("data.txt") as file:\n    text = file.read()',
        [['open']],
        'open() abre o ficheiro.',
        'Completa com a função que abre um ficheiro.',
      ),
    (c) =>
      c.order(
        'Ordena as linhas para ler um ficheiro e mostrar cada linha sem o \\n do fim.',
        ['with open("names.txt") as file:', '    for line in file:', '        print(line.strip())'],
        'Abre-se, percorre-se e mostra-se.',
      ),
  ],
})
