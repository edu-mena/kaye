import { ACC, credit, debit, defineTopic, kz, vat } from './kit'

// Topic 20: fixed assets. Theme from Wikipedia (Fixed asset; Capital expenditure); written from scratch.

const ITEMS: { text: string; fixed: boolean }[] = [
  { text: 'Um balcão frigorífico que vai durar 8 anos', fixed: true },
  { text: 'Um computador para a loja', fixed: true },
  { text: 'Uma carrinha para entregas', fixed: true },
  { text: 'Papel e canetas para o escritório', fixed: false },
  { text: 'A conta da eletricidade do mês', fixed: false },
  { text: 'Uma lâmpada para a montra', fixed: false },
]

export default defineTopic({
  id: 't20',
  intro: [
    'Imobilizado são os bens que a loja usa durante vários anos para trabalhar, e não para vender: o balcão, o computador, a carrinha. São ativo (meios fixos) e registam-se pelo custo de aquisição, que inclui o preço, o transporte e a instalação.',
    'Um gasto pequeno ou que se esgota depressa (papel, uma lâmpada, a eletricidade) é um custo do mês, não imobilizado. Regra prática: dura mais de um ano e tem valor relevante para a loja, é imobilizado.',
  ],
  rule: 'Imobilizado = bem usado vários anos, registado pelo custo de aquisição (preço + transporte + instalação). Gastos pequenos ou que se esgotam depressa são custos do mês.',
  extra: [
    {
      type: 'table',
      caption: 'Imobilizado ou custo do mês? (exemplos)',
      head: ['Gasto', 'Registo'],
      rows: [
        ['Computador da loja', 'Imobilizado (Equipamento)'],
        ['Papel para a impressora', 'Custo do mês'],
        ['Instalação do balcão frigorífico', 'Soma-se ao custo do balcão'],
        ['Conta da eletricidade', 'Custo do mês'],
      ],
    },
  ],
  points: [
    'Imobilizado dura vários anos e é usado, não vendido.',
    'Custo de aquisição = preço + transporte + instalação.',
    'Gastos pequenos ou correntes são custos do mês.',
  ],
  quiz: [
    {
      prompt: 'Qual destes é imobilizado?',
      options: ['Um computador da loja', 'O papel da impressora', 'A conta da luz'],
      answer: 0,
    },
    {
      prompt: 'A instalação de um equipamento…',
      options: ['Soma-se ao custo do equipamento', 'É sempre uma venda', 'Não se regista'],
      answer: 0,
    },
    {
      prompt: 'O imobilizado é registado pelo…',
      options: ['Custo de aquisição', 'Preço de venda esperado', 'Valor que o dono achar'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const item = c.pick(ITEMS)
      return c.ask(
        `«${item.text}»: é imobilizado ou custo do mês?`,
        item.fixed ? 'Imobilizado' : 'Custo do mês',
        [item.fixed ? 'Custo do mês' : 'Imobilizado', 'Proveito'],
        item.fixed ? 'Dura vários anos e é usado pela loja.' : 'Gasta-se depressa ou tem valor pequeno.',
      )
    },
    (c) => {
      const price = c.base(50, 300)
      const transport = c.int(2, 10) * 500
      const install = c.int(2, 10) * 1000
      return c.num(
        `Um balcão custa ${kz(price)}, mais ${kz(transport)} de transporte e ${kz(install)} de instalação (valores sem IVA). Qual é o custo de aquisição?`,
        price + transport + install,
        `${price} + ${transport} + ${install}.`,
      )
    },
    (c) => {
      const price = c.base(50, 300)
      return c.entry(
        `A loja compra equipamento por ${kz(price)} mais IVA a 14% e paga por transferência. Faz o lançamento.`,
        [debit(ACC.equip, price), debit(ACC.ivaDed, vat(price)), credit(ACC.bancos, price + vat(price))],
        'O equipamento entra pela base; o IVA é dedutível; sai o total do banco.',
        [ACC.caixa, ACC.fornecedores],
      )
    },
    (c) => {
      const price = c.base(100, 400)
      return c.entry(
        `A loja compra equipamento a crédito por ${kz(price)} (sem IVA, para simplificar). Faz o lançamento.`,
        [debit(ACC.equip, price), credit(ACC.fornecedores, price)],
        'Entra o bem (débito) e fica uma dívida (crédito).',
        [ACC.caixa, ACC.mercadorias],
      )
    },
    (c) => {
      const price = c.base(50, 200)
      const install = c.int(2, 10) * 1000
      return c.entry(
        `Compras um equipamento por ${kz(price)} e pagas ${kz(install)} pela instalação, tudo em dinheiro (sem IVA). Faz o lançamento.`,
        [debit(ACC.equip, price + install), credit(ACC.caixa, price + install)],
        'A instalação faz parte do custo do bem.',
        [ACC.fst, ACC.fornecedores],
      )
    },
    (c) => c.ask('O imobilizado é um…', 'Ativo', ['Custo', 'Proveito'], 'É um bem que a loja tem e usa.'),
    (c) =>
      c.ask(
        'Porque se regista a instalação junto com o custo do equipamento?',
        'Porque sem ela o equipamento não pode ser usado: é parte do custo de o pôr a funcionar',
        ['Porque a instalação é um proveito', 'Porque o Estado manda'],
        'O custo de aquisição inclui tudo o que é preciso para o bem começar a funcionar.',
      ),
    (c) =>
      c.fill(
        'Custo de aquisição = preço + transporte + ___',
        [['instalação', 'instalacao']],
        'Tudo o que é necessário para pôr o bem a funcionar.',
      ),
    (c) =>
      c.decide(
        [
          'A Ana comprou uma máquina de costura por 120.000 Kz, mais 6.000 Kz de transporte, e registou os 126.000 Kz como custo do mês.',
          'O resultado do mês ficou muito mau.',
        ],
        [
          {
            text: 'Corrigir: registar os 126.000 Kz como imobilizado (Equipamento) e amortizar ao longo dos anos.',
            consequence: 'O custo reparte-se pelos anos em que a máquina é usada.',
          },
          {
            text: 'Deixar assim: «é só uma compra».',
            consequence: 'O mês parece pior do que foi e o ativo não aparece nas contas.',
          },
          { text: 'Apagar a compra das contas.', consequence: 'A máquina existe mas ninguém o regista.' },
        ],
        0,
        'O que deve fazer?',
      ),
  ],
})
