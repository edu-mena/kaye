import { defineTopic, kz } from './kit'

// Topic 1: the PGC and the financial statements. Theme: Decreto n.º 82/01 and the structure of a set of accounts.

export default defineTopic({
  id: 't01',
  intro: [
    'O Plano Geral de Contabilidade (PGC) diz como as empresas angolanas registam as operações e como apresentam as contas no fim do ano. O resultado do trabalho são as demonstrações financeiras: sobretudo o balanço e a demonstração de resultados.',
    'O balanço é uma fotografia: mostra o que a empresa tem (ativo), o que deve (passivo) e o que é dos donos (capital próprio) numa data. A demonstração de resultados é um filme: soma os proveitos e tira os custos de um período, e o que sobra é o resultado.',
    'Estas contas servem a muita gente: o dono, o banco que decide um empréstimo, o Estado que cobra impostos, os trabalhadores e os fornecedores. A cada um interessa uma pergunta diferente, mas todos leem os mesmos números.',
  ],
  rule: 'Balanço: Ativo = Passivo + Capital próprio, numa data. Demonstração de resultados: Resultado = Proveitos − Custos, num período.',
  extra: [
    {
      type: 'table',
      caption: 'O que cada demonstração responde.',
      head: ['Demonstração', 'Mostra', 'Quando', 'Pergunta a que responde'],
      rows: [
        ['Balanço', 'Ativo, passivo e capital próprio', 'Numa data', 'O que tem e o que deve a empresa?'],
        [
          'Demonstração de resultados',
          'Proveitos, custos e resultado',
          'Num período',
          'Ganhou ou perdeu dinheiro?',
        ],
        [
          'Fluxos de caixa',
          'Entradas e saídas de dinheiro',
          'Num período',
          'De onde veio e para onde foi o dinheiro?',
        ],
      ],
    },
  ],
  points: [
    'O PGC (Decreto n.º 82/01) manda como se registam e se apresentam as contas.',
    'O balanço é a fotografia numa data; a demonstração de resultados é o filme de um período.',
    'As mesmas contas servem o dono, o banco, o Estado, os trabalhadores e os fornecedores.',
  ],
  quiz: [
    {
      prompt: 'Que demonstração mostra o património da empresa numa data?',
      options: ['O balanço', 'A demonstração de resultados', 'O diário'],
      answer: 0,
    },
    {
      prompt: 'Qual é a fórmula do resultado de um período?',
      options: ['Proveitos − Custos', 'Ativo − Passivo', 'Custos + Capital'],
      answer: 0,
    },
    {
      prompt: 'Um banco analisa um pedido de empréstimo. O que pede à empresa?',
      options: ['O balanço e a demonstração de resultados', 'Só o razão da Caixa', 'Só as faturas de um mês'],
      answer: 0,
    },
  ],
  exercises: [
    (c) =>
      c.ask(
        'Que demonstração mostra o que a empresa tem e deve numa data?',
        'O balanço',
        ['A demonstração de resultados', 'O balancete de um só mês', 'O diário'],
        'O balanço é a fotografia do património numa data.',
      ),
    (c) =>
      c.ask(
        'Que demonstração diz se a empresa ganhou ou perdeu dinheiro num ano?',
        'A demonstração de resultados',
        ['O balanço', 'O razão da Caixa', 'A lista de clientes'],
        'A demonstração de resultados soma os proveitos e tira os custos do período.',
      ),
    (c) => {
      const cash = c.base(20, 60)
      const bank = c.base(40, 120)
      const stock = c.base(30, 90)
      const debts = c.base(30, 80)
      return c.num(
        `Uma loja tem Caixa ${kz(cash)}, Bancos ${kz(bank)} e Mercadorias ${kz(stock)}. Deve ${kz(debts)} a fornecedores. Qual é o capital próprio?`,
        cash + bank + stock - debts,
        `Capital próprio = Ativo − Passivo = ${cash + bank + stock} − ${debts}.`,
      )
    },
    (c) => {
      const sales = c.base(200, 600)
      const services = c.base(20, 80)
      const cmv = c.base(100, 190)
      const staff = c.base(30, 60)
      const rent = c.base(10, 25)
      return c.num(
        `No ano, uma empresa teve vendas de ${kz(sales)} e serviços de ${kz(services)}. Os custos foram: mercadorias vendidas ${kz(cmv)}, pessoal ${kz(staff)} e rendas ${kz(rent)}. Qual é o resultado?`,
        sales + services - cmv - staff - rent,
        `Resultado = proveitos (${sales + services}) − custos (${cmv + staff + rent}).`,
      )
    },
    (c) => {
      const assets = c.base(300, 900)
      const equity = c.base(100, 250)
      return c.num(
        `O ativo de uma empresa é ${kz(assets)} e o capital próprio é ${kz(equity)}. Quanto é o passivo?`,
        assets - equity,
        `Passivo = Ativo − Capital próprio = ${assets} − ${equity}.`,
      )
    },
    (c) =>
      c.fill(
        'O balanço mostra o ___ numa data; a demonstração de resultados mostra o ___ de um período.',
        [['património'], ['resultado', 'lucro ou prejuízo']],
        'Fotografia (balanço) e filme (resultados).',
      ),
    (c) =>
      c.order(
        'Põe os passos do trabalho da contabilidade pela ordem em que acontecem.',
        [
          'Registar as operações no diário',
          'Passar os lançamentos ao razão',
          'Fazer o balancete e verificar os saldos',
          'Elaborar o balanço e a demonstração de resultados',
        ],
        'Primeiro regista-se, depois resume-se, depois verifica-se e só no fim se apresentam as contas.',
      ),
    (c) =>
      c.decide(
        [
          'A Mercearia Kunga quer um empréstimo de 5 milhões de Kz para uma câmara frigorífica.',
          'O gerente do banco pede informação financeira do último ano.',
        ],
        [
          {
            text: 'Entregar o balanço e a demonstração de resultados',
            consequence: 'O banco vê o que a loja tem e deve e se dá lucro: pode decidir.',
          },
          {
            text: 'Entregar só o balancete de um mês',
            consequence:
              'Um mês só não mostra o ano nem o resultado, e o balancete não é uma demonstração financeira.',
          },
          {
            text: 'Entregar as faturas de compras sem as somar',
            consequence: 'Sem resumo, o banco não consegue ler a situação da loja.',
          },
        ],
        0,
        'O que entregas?',
      ),
    (c) =>
      c.ask(
        'Qual destes é um utente da informação financeira de uma empresa?',
        'O banco que avalia um empréstimo',
        ['A conta Caixa', 'O lançamento no diário', 'O saldo do razão'],
        'Os utentes são as pessoas e as entidades que usam as contas para decidir: dono, banco, Estado, trabalhadores.',
      ),
  ],
})
