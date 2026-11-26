import { ACC, credit, debit, defineTopic, kz } from './kit'

// Topic 3: what goes into the cost of a fixed asset bought from a supplier.

export default defineTopic({
  id: 't03',
  intro: [
    'Um imobilizado (uma máquina, um carro, um computador) regista-se pelo custo de aquisição. Esse custo não é só o preço da fatura: inclui tudo o que foi preciso gastar para o bem ficar no local e pronto a trabalhar.',
    'Entram o preço (já sem descontos comerciais), o transporte, os direitos de importação, a instalação e a montagem. Não entram os custos de administração geral, a formação do pessoal nem o IVA dedutível, que se recupera através do IVA.',
  ],
  rule: 'Custo do imobilizado = preço sem desconto + transporte + instalação e montagem + direitos. Fora: IVA dedutível, formação e custos gerais.',
  extra: [
    {
      type: 'table',
      caption: 'O que entra e o que não entra no custo.',
      head: ['Entra no custo', 'Não entra no custo'],
      rows: [
        ['Preço líquido de descontos comerciais', 'IVA dedutível'],
        ['Transporte até à empresa', 'Formação do pessoal que vai usar o bem'],
        ['Instalação e montagem', 'Custos administrativos gerais'],
        ['Direitos de importação', 'Reparações depois de começar a usar'],
      ],
    },
  ],
  points: [
    'O imobilizado entra pelo custo de aquisição, não só pelo preço da fatura.',
    'Transporte, instalação, montagem e direitos juntam-se ao custo.',
    'O IVA dedutível e a formação do pessoal ficam de fora.',
  ],
  quiz: [
    {
      prompt: 'O transporte de uma máquina até à fábrica faz parte do custo do imobilizado?',
      options: ['Sim', 'Não', 'Só se for caro'],
      answer: 0,
    },
    {
      prompt: 'Que custo não entra no valor do imobilizado?',
      options: ['A formação do pessoal', 'A instalação', 'O transporte'],
      answer: 0,
    },
    {
      prompt: 'O IVA dedutível de uma compra de equipamento entra no custo do equipamento?',
      options: ['Não, é uma conta à parte', 'Sim, sempre', 'Só nas compras a crédito'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const price = c.int(100, 400) * 1000
      const transport = c.base(5, 30)
      const install = c.base(5, 30)
      return c.num(
        `Compraste uma máquina por ${kz(price)} (sem IVA). O transporte custou ${kz(transport)} e a instalação ${kz(install)}. Qual é o custo do imobilizado?`,
        price + transport + install,
        `${price} + ${transport} + ${install}.`,
      )
    },
    (c) => {
      const price = c.int(100, 400) * 1000
      const percent = c.pick([5, 10, 20])
      const transport = c.base(5, 30)
      const net = (price * (100 - percent)) / 100
      return c.num(
        `A fatura da máquina é de ${kz(price)}, com ${percent}% de desconto comercial. O transporte foi ${kz(transport)}. Qual é o custo do imobilizado?`,
        net + transport,
        `Preço líquido (${net}) + transporte (${transport}).`,
      )
    },
    (c) => {
      const price = c.int(100, 400) * 1000
      const iva = (price * 14) / 100
      const transport = c.base(5, 30)
      return c.entry(
        `Compraste a crédito um equipamento de ${kz(price)} mais IVA de 14%. Pagaste ${kz(transport)} de transporte em dinheiro (ignora o IVA do transporte). Faz o lançamento.`,
        [
          debit(ACC.imobilizado, price + transport),
          debit(ACC.ivaDed, iva),
          credit(ACC.fornecImob, price + iva),
          credit(ACC.caixa, transport),
        ],
        'O transporte soma-se ao custo; o IVA dedutível fica na sua conta; a dívida é o total da fatura.',
        [ACC.fornecedores, ACC.bancos],
      )
    },
    (c) =>
      c.ask(
        'Qual destes custos NÃO entra no valor de um imobilizado?',
        'A formação do pessoal que vai usá-lo',
        ['O transporte até à empresa', 'A montagem', 'Os direitos de importação'],
        'A formação é um custo do período, não um custo do bem.',
      ),
    (c) =>
      c.ask(
        'Qual destes custos entra no valor de um imobilizado?',
        'A instalação feita para o bem funcionar',
        ['O salário do gerente', 'A renda do escritório', 'A publicidade da empresa'],
        'Entra o que foi preciso para o bem ficar pronto a usar.',
      ),
    (c) => {
      const price = c.int(100, 400) * 1000
      const iva = (price * 14) / 100
      return c.num(
        `Um computador custa ${kz(price)} mais IVA dedutível de 14%. Pelo total da fatura, quanto se paga ao fornecedor?`,
        price + iva,
        `${price} + IVA ${iva}. Mas só ${price} é custo do imobilizado.`,
      )
    },
    (c) =>
      c.fill(
        'O imobilizado regista-se pelo custo de ___; o IVA ___ não entra nesse custo.',
        [['aquisição', 'compra'], ['dedutível']],
        'Custo de aquisição sem o IVA que se recupera.',
      ),
    (c) =>
      c.order(
        'Põe por ordem o cálculo do custo de uma máquina comprada com desconto.',
        [
          'Partir do preço da fatura',
          'Tirar o desconto comercial',
          'Somar o transporte',
          'Somar a instalação e a montagem',
        ],
        'Primeiro o preço líquido; depois os custos de pôr o bem a trabalhar.',
      ),
    (c) =>
      c.decide(
        [
          'A Gráfica Nova comprou uma impressora e gastou dinheiro na formação de dois colegas para a usar.',
          'O contabilista pergunta se a formação entra no valor da impressora.',
        ],
        [
          {
            text: 'Sim, soma-se ao custo da impressora',
            consequence: 'Inflaciona o imobilizado e a amortização.',
          },
          {
            text: 'Não, é um custo do período',
            consequence: 'A formação não torna o bem mais valioso nem o põe a funcionar.',
          },
        ],
        1,
        'Entra ou não?',
      ),
  ],
})
