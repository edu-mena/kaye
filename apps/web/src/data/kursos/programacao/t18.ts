import { defineTopic } from './kit'

// Topic 18: looping over dictionaries. Theme from the Python Programming Wikibook (Dictionaries); written from scratch.
// Names and grades are invented.

const NAMES = ['Ana', 'Paulo', 'Luzia', 'Kiala']

export default defineTopic({
  id: 't18',
  intro: [
    'Um for sobre um dicionário percorre as chaves. Com .values() percorres os valores e com .items() recebes cada par de uma vez: for chave, valor in d.items(). Assim imprimes ou somas tudo sem escrever cada chave à mão.',
    'Na vida real os dados vêm em listas de dicionários: cada dicionário é um registo (um aluno, um produto) e a lista é a tabela. Percorres a lista e, dentro, lês cada campo pela chave.',
  ],
  rule: 'for chave in d: percorre chaves; for v in d.values(): valores; for k, v in d.items(): pares. Uma lista de dicionários percorre-se com for registo in lista e registo["campo"].',
  code: {
    caption: 'Percorrer um dicionário e uma lista de registos.',
    lines: [
      'grades = {"Ana": 14, "Paulo": 9}',
      'for name, grade in grades.items():',
      '    print(name, grade)         # Ana 14, Paulo 9',
      'print(sum(grades.values()))    # 23',
      '',
      'students = [{"name": "Ana", "grade": 14}, {"name": "Paulo", "grade": 9}]',
      'for student in students:',
      '    print(student["name"])     # Ana, Paulo',
    ],
  },
  points: [
    'for k in d dá as chaves; .values() os valores; .items() os pares.',
    'sum(d.values()) soma os valores.',
    'Uma lista de dicionários é uma tabela: um dicionário por linha.',
  ],
  quiz: [
    {
      prompt: 'O que percorre for k in d, com d um dicionário?',
      options: ['Os valores', 'As chaves', 'Os pares'],
      answer: 1,
    },
    {
      prompt: 'Que método dá o par chave e valor de cada vez?',
      options: ['.keys()', '.values()', '.items()'],
      answer: 2,
    },
    {
      prompt: 'Com students = [{"name": "Ana"}], como se lê o nome do primeiro?',
      options: ['students["name"]', 'students[0]["name"]', 'students.name'],
      answer: 1,
    },
  ],
  exercises: [
    (c) => {
      const grades = NAMES.slice(0, 3).map((name) => [name, c.int(5, 20)] as const)
      const body = grades.map(([name, grade]) => `"${name}": ${grade}`).join(', ')
      return c.out(
        `grades = {${body}}\nfor name in grades:\n    print(name)`,
        grades.map(([name]) => name).join('\n'),
        'Um for sobre o dicionário dá as chaves.',
      )
    },
    (c) => {
      const grades = NAMES.slice(0, 3).map((name) => [name, c.int(5, 20)] as const)
      const body = grades.map(([name, grade]) => `"${name}": ${grade}`).join(', ')
      return c.out(
        `grades = {${body}}\nfor name, grade in grades.items():\n    print(name, grade)`,
        grades.map(([name, grade]) => `${name} ${grade}`).join('\n'),
        '.items() entrega o par de cada vez.',
      )
    },
    (c) => {
      const grades = NAMES.slice(0, 3).map((name) => [name, c.int(5, 20)] as const)
      const body = grades.map(([name, grade]) => `"${name}": ${grade}`).join(', ')
      return c.out(
        `grades = {${body}}\nprint(sum(grades.values()))`,
        String(grades.reduce((sum, [, grade]) => sum + grade, 0)),
        'sum soma os valores do dicionário.',
      )
    },
    (c) => {
      const grades = NAMES.map((name) => [name, c.int(5, 20)] as const)
      const body = grades.map(([name, grade]) => `"${name}": ${grade}`).join(', ')
      return c.out(
        `grades = {${body}}\ncount = 0\nfor grade in grades.values():\n    if grade >= 10:\n        count += 1\nprint(count)`,
        String(grades.filter(([, grade]) => grade >= 10).length),
        'Conta quantas notas são pelo menos 10 (aprovados).',
      )
    },
    (c) => {
      const students = NAMES.slice(0, 3).map((name) => [name, c.int(5, 20)] as const)
      const body = students.map(([name, grade]) => `{"name": "${name}", "grade": ${grade}}`).join(', ')
      return c.out(
        `students = [${body}]\nfor student in students:\n    print(student["name"])`,
        students.map(([name]) => name).join('\n'),
        'Cada student é um dicionário; lê-se o campo pela chave.',
      )
    },
    (c) => {
      const students = NAMES.map((name) => [name, c.int(5, 20)] as const)
      const body = students.map(([name, grade]) => `{"name": "${name}", "grade": ${grade}}`).join(', ')
      return c.out(
        `students = [${body}]\nbest = 0\nfor student in students:\n    if student["grade"] > best:\n        best = student["grade"]\nprint(best)`,
        String(Math.max(...students.map(([, grade]) => grade))),
        'best guarda a maior nota vista até ao momento.',
      )
    },
    (c) =>
      c.ask(
        'O que dá cada volta de for x in d.items()?',
        'Um par (chave, valor).',
        ['Só a chave.', 'Só o valor.'],
        'Por isso se escreve for k, v in d.items().',
      ),
    (c) =>
      c.fill(
        'for name, grade in grades.___():\n    print(name, grade)',
        [['items']],
        '.items() entrega chave e valor juntos.',
        'Completa com o método que dá os pares.',
      ),
    (c) =>
      c.order(
        'Ordena as linhas para somar todas as notas de um dicionário.',
        ['total = 0', 'for grade in grades.values():', '    total += grade', 'print(total)'],
        'Acumulador, ciclo sobre os valores, soma, resultado.',
      ),
  ],
})
