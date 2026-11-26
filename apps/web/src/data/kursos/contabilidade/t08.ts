import { defineTopic, kz } from './kit'

// Topic 8: the trial balance. Theme from Wikipedia (Trial balance); written from scratch, the figures are invented.

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)

export default defineTopic({
  id: 't08',
  intro: [
    'O balancete é uma lista com o saldo de todas as contas do razão. Põem-se os saldos devedores numa coluna e os credores noutra. Se todos os lançamentos foram feitos com partidas dobradas, as duas colunas somam o mesmo.',
    'Se não somam o mesmo, há um erro para procurar. Mas atenção: um balancete que fecha não prova que tudo está certo. Pode haver um lançamento esquecido, uma conta errada com o valor certo, ou dois erros que se compensam.',
  ],
  rule: 'Balancete: total dos saldos devedores = total dos saldos credores. Se for igual, as partidas dobradas estão consistentes; se não, há um erro.',
  extra: [
    {
      type: 'table',
      caption: 'Um balancete que fecha (valores inventados).',
      head: ['Conta', 'Saldo devedor', 'Saldo credor'],
      rows: [
        ['Caixa', kz(150000), ''],
        ['Mercadorias', kz(250000), ''],
        ['Fornecedores', '', kz(100000)],
        ['Capital', '', kz(300000)],
        ['Total', kz(400000), kz(400000)],
      ],
    },
    {
      type: 'text',
      title: 'Uma pista para os erros de troca de algarismos',
      body: [
        'Se escreveste 5.400 em vez de 4.500, a diferença é 900. Quando duas colunas diferem por um número divisível por 9, desconfia de dois algarismos trocados.',
      ],
    },
  ],
  points: [
    'O balancete lista os saldos de todas as contas, em duas colunas.',
    'As duas colunas devem somar o mesmo.',
    'Fechar não prova que está tudo certo: erros que se compensam passam.',
  ],
  quiz: [
    {
      prompt: 'O que se compara num balancete?',
      options: [
        'O total dos saldos devedores e o dos credores',
        'As vendas de dois anos',
        'O stock e a caixa',
      ],
      answer: 0,
    },
    {
      prompt: 'O balancete fecha. Quer dizer que não há erros?',
      options: ['Não: alguns erros não se veem', 'Sim, sempre', 'Sim, mas só se for de caixa'],
      answer: 0,
    },
    {
      prompt: 'A diferença entre as colunas é 900. O que sugere?',
      options: ['Dois algarismos trocados', 'Que não houve vendas', 'Que o IVA está errado'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const cash = c.base(20, 80)
      const stock = c.base(100, 250)
      const customers = c.base(10, 60)
      return c.num(
        `Saldos devedores: Caixa ${kz(cash)}, Mercadorias ${kz(stock)}, Clientes ${kz(customers)}. Qual é o total da coluna dos devedores?`,
        cash + stock + customers,
        `${cash} + ${stock} + ${customers}.`,
      )
    },
    (c) => {
      const debitTotal = c.base(400, 900)
      const suppliers = c.base(50, 150)
      const capital = c.base(100, 250)
      return c.num(
        `O total dos saldos devedores é ${kz(debitTotal)}. Os credores são: Fornecedores ${kz(suppliers)}, Capital ${kz(capital)} e Vendas (falta o valor). Quanto tem de ser o saldo de Vendas para o balancete fechar?`,
        debitTotal - suppliers - capital,
        `${debitTotal} − ${suppliers} − ${capital}.`,
      )
    },
    (c) => {
      const [real, written] = c.pick([
        [4500, 5400],
        [1200, 2100],
        [3600, 6300],
        [7800, 8700],
        [2300, 3200],
      ] as const)
      return c.num(
        `Num lançamento escreveste ${kz(written)} em vez de ${kz(real)}. Qual é a diferença entre os dois valores (sem sinal)?`,
        Math.abs(written - real),
        `|${written} − ${real}|. A diferença é divisível por 9, pista de algarismos trocados.`,
      )
    },
    (c) =>
      c.ask(
        'O balancete fecha. Isso prova que todas as contas estão certas?',
        'Não: pode haver erros que se compensam ou lançamentos esquecidos',
        ['Sim, o balancete é a prova final', 'Sim, mas só quando é de caixa'],
        'O balancete só verifica a igualdade das colunas.',
      ),
    (c) => {
      const debits = c.base(300, 600)
      const diff = c.pick([200, 450, 900, 1350])
      return c.ask(
        `O balancete tem ${kz(debits)} em débitos e ${kz(debits - diff)} em créditos. Qual é o próximo passo?`,
        `Procurar a diferença de ${kz(diff)} nos lançamentos`,
        ['Pôr a diferença na conta Caixa', 'Apagar o balancete e começar outro'],
        'Procura-se o lançamento com esse valor, esquecido ou lançado de um só lado.',
      )
    },
    (c) =>
      c.fill(
        'No balancete, o total dos saldos ___ é igual ao total dos saldos ___.',
        [['devedores'], ['credores']],
        'É o resultado das partidas dobradas.',
      ),
    (c) => {
      const credits = [c.base(100, 200), c.base(50, 100), c.base(20, 60)]
      return c.num(
        `Saldos credores: Capital ${kz(credits[0] ?? 0)}, Fornecedores ${kz(credits[1] ?? 0)}, Vendas ${kz(credits[2] ?? 0)}. Quanto tem de somar a coluna dos devedores?`,
        sum(credits),
        'As duas colunas têm de ser iguais.',
      )
    },
    (c) =>
      c.ask(
        'Que erro um balancete NÃO apanha?',
        'Um lançamento feito na conta errada, com o valor certo',
        ['Um lançamento feito só a débito', 'Uma soma errada numa das colunas'],
        'Se a conta é errada mas as partidas estão equilibradas, as colunas somam o mesmo.',
      ),
    (c) =>
      c.decide(
        [
          'O balancete do mês da loja do Paulo não fecha: os débitos somam mais 2.000 Kz que os créditos.',
          'O Paulo está com pressa para entregar as contas.',
        ],
        [
          {
            text: 'Voltar a somar as colunas e comparar cada saldo com o razão.',
            consequence: 'Muitas vezes o erro é de soma ou de transcrição e aparece logo.',
          },
          {
            text: 'Pôr os 2.000 Kz numa conta «diversos» para fechar.',
            consequence: 'Esconde o erro e estraga o relatório.',
          },
          {
            text: 'Apagar a conta mais pequena.',
            consequence: 'Perde-se informação sem resolver o erro.',
          },
        ],
        0,
        'O que deve fazer?',
      ),
  ],
})
