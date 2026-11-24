import { defineTopic, kz } from './kit'

// Topic 2: the patrimony (assets, liabilities, equity). Theme from Wikipedia (Balance sheet); written from scratch.

const ITEMS: { text: string; kind: string }[] = [
  { text: 'O dinheiro na caixa da loja', kind: 'Ativo' },
  { text: 'As mercadorias nas prateleiras', kind: 'Ativo' },
  { text: 'O computador da loja', kind: 'Ativo' },
  { text: 'O dinheiro que um cliente ainda deve à loja', kind: 'Ativo' },
  { text: 'A dívida a um fornecedor', kind: 'Passivo' },
  { text: 'O empréstimo do banco', kind: 'Passivo' },
  { text: 'Os salários do mês ainda por pagar', kind: 'Passivo' },
  { text: 'O dinheiro que o dono investiu no negócio', kind: 'Capital próprio' },
]
const KINDS = ['Ativo', 'Passivo', 'Capital próprio']

export default defineTopic({
  id: 't02',
  intro: [
    'O património é tudo o que o negócio tem e deve, em dinheiro. Divide-se em três partes. O ativo é o que a empresa possui ou tem a receber: dinheiro, mercadorias, equipamento, o que os clientes ainda devem. O passivo é o que ela deve a outros: fornecedores, bancos, salários por pagar.',
    'O capital próprio é o que pertence ao dono: o que ele investiu mais o que o negócio ganhou e ficou lá. Calcula-se por diferença: capital próprio = ativo − passivo.',
  ],
  rule: 'Ativo: o que tem e o que lhe devem. Passivo: o que deve. Capital próprio: o que sobra para o dono (ativo − passivo).',
  extra: [
    {
      type: 'table',
      caption: 'A loja da Ana (valores inventados).',
      head: ['Elemento', 'Tipo', 'Valor'],
      rows: [
        ['Caixa', 'Ativo', kz(100000)],
        ['Mercadorias', 'Ativo', kz(300000)],
        ['Dívida a fornecedores', 'Passivo', kz(150000)],
        ['Capital próprio', 'Ativo − Passivo', kz(250000)],
      ],
    },
  ],
  points: [
    'Ativo = bens e direitos; passivo = dívidas.',
    'Capital próprio = ativo − passivo.',
    'Uma dívida é sempre passivo, mesmo que seja pequena.',
  ],
  quiz: [
    {
      prompt: 'Uma dívida ao fornecedor é…',
      options: ['Ativo', 'Passivo', 'Capital próprio'],
      answer: 1,
    },
    {
      prompt: 'Como se calcula o capital próprio?',
      options: ['Ativo − passivo', 'Ativo + passivo', 'Passivo − ativo'],
      answer: 0,
    },
    {
      prompt: 'O dinheiro que um cliente ainda deve à loja é…',
      options: ['Passivo', 'Ativo', 'Capital próprio'],
      answer: 1,
    },
  ],
  exercises: [
    (c) => {
      const item = c.pick(ITEMS)
      return c.ask(
        `Classifica: «${item.text}».`,
        item.kind,
        KINDS.filter((kind) => kind !== item.kind),
        'Ativo é o que a empresa tem ou tem a receber; passivo é o que deve; capital próprio é do dono.',
      )
    },
    (c) => {
      const item = c.pick(ITEMS.filter((entry) => entry.kind !== 'Ativo'))
      return c.ask(
        `Classifica: «${item.text}».`,
        item.kind,
        KINDS.filter((kind) => kind !== item.kind),
        'Dívidas são passivo; o investimento do dono é capital próprio.',
      )
    },
    (c) => {
      const cash = c.base(10, 50)
      const stock = c.base(50, 200)
      const equipment = c.base(30, 100)
      return c.num(
        `Uma loja tem ${kz(cash)} em caixa, ${kz(stock)} em mercadorias e equipamento de ${kz(equipment)}. Qual é o total do ativo?`,
        cash + stock + equipment,
        `${cash} + ${stock} + ${equipment}.`,
      )
    },
    (c) => {
      const suppliers = c.base(20, 80)
      const loan = c.base(50, 150)
      return c.num(
        `A loja deve ${kz(suppliers)} a fornecedores e ${kz(loan)} ao banco. Qual é o total do passivo?`,
        suppliers + loan,
        `${suppliers} + ${loan}: somam-se todas as dívidas.`,
      )
    },
    (c) => {
      const assets = c.base(200, 500)
      const liabilities = c.base(50, 190)
      return c.num(
        `O ativo é ${kz(assets)} e o passivo é ${kz(liabilities)}. Qual é o capital próprio?`,
        assets - liabilities,
        `Capital próprio = ${assets} − ${liabilities}.`,
      )
    },
    (c) =>
      c.ask(
        'O que é o capital próprio?',
        'O que sobra do ativo depois de pagar todas as dívidas',
        ['Todo o dinheiro que está na caixa', 'O total das dívidas da empresa'],
        'Capital próprio = ativo − passivo.',
      ),
    (c) => {
      const loan = c.base(50, 300)
      return c.ask(
        `O banco empresta ${kz(loan)} à loja e o dinheiro entra na conta. O que aumenta?`,
        'O ativo e o passivo, por igual',
        ['Só o ativo', 'O capital próprio'],
        'Entra dinheiro (ativo) mas há uma nova dívida (passivo).',
      )
    },
    (c) =>
      c.fill(
        'Capital próprio = ___ − passivo',
        [['ativo']],
        'O que sobra depois de pagar as dívidas.',
        'Completa a fórmula.',
      ),
    (c) =>
      c.decide(
        [
          'O Paulo tem uma loja com ativo de 800.000 Kz. Deve 300.000 Kz ao banco e 100.000 Kz a fornecedores.',
          'Diz que a loja «vale 800.000 Kz» para o dono.',
        ],
        [
          {
            text: 'Corrige: para o dono sobram 400.000 Kz (800.000 − 400.000).',
            consequence: 'O capital próprio desconta as dívidas.',
          },
          {
            text: 'Concorda: o ativo é o que vale para o dono.',
            consequence: 'Esquece que parte do ativo serve para pagar dívidas.',
          },
          {
            text: 'Diz que o capital próprio é 1.200.000 Kz (somando as dívidas).',
            consequence: 'As dívidas subtraem-se, não se somam.',
          },
        ],
        0,
        'Quanto sobra para o dono?',
      ),
  ],
})
