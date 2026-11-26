import { defineTopic, kz } from './kit'

// Topic 1: what accounting is for. Theme from Wikipedia (Accounting); written from scratch, the shop is invented.

export default defineTopic({
  id: 't01',
  intro: [
    'Contabilidade é o registo organizado do dinheiro de um negócio: o que entra, o que sai, o que se tem e o que se deve. Serve para responder a perguntas simples que a memória não aguenta: ganhei ou perdi este mês? Posso pagar ao fornecedor? Quanto devo ao banco?',
    'Faz três coisas: regista os factos que têm valor em dinheiro (uma venda, uma compra, um salário), resume-os em relatórios e usa esses relatórios para decidir. Quem precisa deles: o dono, o banco que empresta, o Estado que cobra impostos e os sócios.',
  ],
  rule: 'Contabilidade = registar os factos com valor em dinheiro, resumir em relatórios e decidir com base neles.',
  extra: [
    {
      type: 'table',
      caption: 'Quem usa as contas e para quê (exemplos).',
      head: ['Quem', 'O que quer saber'],
      rows: [
        ['O dono da loja', 'Estou a ganhar dinheiro? Posso contratar alguém?'],
        ['O banco', 'Esta loja consegue pagar um empréstimo?'],
        ['O Estado', 'Quanto imposto é devido?'],
        ['O fornecedor', 'Esta loja paga a tempo?'],
      ],
    },
  ],
  points: [
    'A contabilidade regista só o que tem valor em dinheiro.',
    'Os registos resumem-se em relatórios: balanço e demonstração de resultados.',
    'Serve ao dono, ao banco, ao Estado e aos fornecedores.',
  ],
  quiz: [
    {
      prompt: 'O que regista a contabilidade?',
      options: ['Factos com valor em dinheiro', 'Tudo o que acontece na loja', 'Só as vendas'],
      answer: 0,
    },
    {
      prompt: 'Quem pode querer ver as contas de uma loja?',
      options: ['Só o dono', 'O dono, o banco e o Estado', 'Ninguém além do contabilista'],
      answer: 1,
    },
    {
      prompt: 'Que pergunta a contabilidade ajuda a responder?',
      options: [
        'Estou a ganhar ou a perder dinheiro?',
        'Qual é a cor da fachada?',
        'Quantos clientes gostam de mim?',
      ],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const sales = c.base(50, 300)
      const costs = c.base(20, 40)
      return c.num(
        `A loja da Ana vendeu ${kz(sales)} este mês e gastou ${kz(costs)} (compras, renda e outros custos). Quanto ganhou (resultado)?`,
        sales - costs,
        `Resultado = o que entrou − o que se gastou = ${sales} − ${costs}.`,
      )
    },
    (c) => {
      const start = c.base(10, 50)
      const received = c.base(5, 30)
      const paid = c.base(2, 9)
      return c.num(
        `A caixa tinha ${kz(start)}, recebeu ${kz(received)} de vendas e pagou ${kz(paid)} ao fornecedor. Quanto tem agora?`,
        start + received - paid,
        `${start} + ${received} − ${paid}: as entradas somam-se e as saídas subtraem-se.`,
      )
    },
    (c) =>
      c.ask(
        'Qual destes factos regista a contabilidade?',
        `A loja comprou mercadorias por ${kz(c.base(10, 60))}.`,
        ['Um cliente gostou da montra.', 'Choveu o dia todo em Luanda.'],
        'Só se regista o que tem valor em dinheiro.',
      ),
    (c) =>
      c.ask(
        'Quem usa as contas de uma loja para decidir se lhe empresta dinheiro?',
        'O banco',
        ['O vizinho da loja', 'O cliente que passa na rua'],
        'O banco quer saber se a loja consegue pagar o empréstimo.',
      ),
    (c) =>
      c.ask(
        'Qual é o primeiro trabalho da contabilidade?',
        'Registar os factos com valor em dinheiro',
        ['Escolher os preços de venda', 'Fazer publicidade à loja'],
        'Sem registo não há nada para resumir nem para decidir.',
      ),
    (c) =>
      c.order(
        'Ordena os passos do trabalho contabilístico.',
        [
          'Acontece um facto (por exemplo, uma venda)',
          'Guarda-se o documento (a fatura)',
          'Regista-se no diário',
          'Resumem-se os números em relatórios',
        ],
        'Facto, documento, registo e relatório.',
      ),
    (c) =>
      c.fill(
        'A contabilidade ___ os factos, ___ os números em relatórios e ajuda a ___.',
        [['regista', 'registar'], ['resume', 'resumir'], ['decidir']],
        'Registar, resumir e decidir.',
      ),
    (c) =>
      c.ask(
        'Que relatório mostra se a loja ganhou ou perdeu no ano?',
        'A demonstração de resultados',
        ['O catálogo de preços', 'A fatura de um cliente'],
        'A demonstração de resultados compara proveitos e custos.',
      ),
    (c) =>
      c.decide(
        [
          'A Ana vende todos os dias mas não escreve nada. No fim do mês não sabe se ganhou ou perdeu.',
          'Quer começar a organizar-se.',
        ],
        [
          {
            text: 'Guardar as faturas e registar cada venda e cada despesa num caderno, todos os dias.',
            consequence: 'No fim do mês já tem números para somar e comparar.',
          },
          {
            text: 'Confiar na memória e contar o dinheiro da caixa no fim do mês.',
            consequence: 'A caixa não diz de onde veio o dinheiro nem o que ainda se deve.',
          },
          {
            text: 'Esperar que o banco lhe diga se está bem.',
            consequence: 'O banco só vê o que passa pela conta, não as dívidas nem o stock.',
          },
        ],
        0,
        'O que deve fazer a Ana?',
      ),
  ],
})
