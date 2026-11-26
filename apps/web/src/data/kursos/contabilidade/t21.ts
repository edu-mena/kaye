import { ACC, credit, debit, defineTopic, kz } from './kit'

// Topic 21: depreciation (straight line). Theme from Wikipedia (Depreciation). The tax rates and limits that apply to
// depreciation in Angola are not taught here. Written from scratch.

const LIVES = [4, 5, 8, 10]

export default defineTopic({
  id: 't21',
  intro: [
    'Um equipamento ajuda a vender durante vários anos. Por isso o seu custo não se lança todo no ano da compra: reparte-se pelos anos de uso. Essa repartição chama-se amortização (ou depreciação, nos livros de língua inglesa: depreciation).',
    'No método das quotas constantes (linha reta), a amortização anual é igual todos os anos: (custo − valor residual) ÷ anos de vida útil. O valor residual é o que se espera obter no fim; muitas vezes é zero. As taxas e os limites que a lei fiscal permite não são ensinados aqui.',
  ],
  rule: 'Amortização anual = (custo − valor residual) ÷ vida útil. Valor líquido = custo − amortizações acumuladas.',
  extra: [
    {
      type: 'table',
      caption: 'Um computador de 200.000 Kz, vida útil de 4 anos, sem valor residual (inventado).',
      head: ['Ano', 'Amortização do ano', 'Amortizações acumuladas', 'Valor líquido'],
      rows: [
        ['1', kz(50000), kz(50000), kz(150000)],
        ['2', kz(50000), kz(100000), kz(100000)],
        ['3', kz(50000), kz(150000), kz(50000)],
        ['4', kz(50000), kz(200000), kz(0)],
      ],
    },
  ],
  points: [
    'A amortização reparte o custo do bem pelos anos de uso.',
    'No método das quotas constantes, o valor anual é igual todos os anos.',
    'Valor líquido = custo − amortizações acumuladas.',
  ],
  quiz: [
    {
      prompt: 'Equipamento de 200.000 Kz, vida útil de 4 anos, sem residual. Amortização anual?',
      options: ['50.000 Kz', '200.000 Kz', '800.000 Kz'],
      answer: 0,
    },
    {
      prompt: 'Que conta se debita no lançamento da amortização do ano?',
      options: ['Amortizações do exercício', 'Equipamento', 'Caixa'],
      answer: 0,
    },
    {
      prompt: 'O valor líquido de um bem é…',
      options: ['Custo − amortizações acumuladas', 'Custo + amortizações', 'O preço de venda'],
      answer: 0,
    },
  ],
  exercises: [
    (c) => {
      const years = c.pick(LIVES)
      const annual = c.int(2, 20) * 5000
      return c.num(
        `Um equipamento custou ${kz(annual * years)}, tem vida útil de ${years} anos e valor residual zero. Qual é a amortização anual (quotas constantes)?`,
        annual,
        `${annual * years} ÷ ${years}.`,
      )
    },
    (c) => {
      const years = c.pick(LIVES)
      const annual = c.int(2, 20) * 5000
      const residual = c.int(1, 3) * 5000
      return c.num(
        `Um bem custou ${kz(annual * years + residual)}, vida útil de ${years} anos e valor residual de ${kz(residual)}. Qual é a amortização anual?`,
        annual,
        `(${annual * years + residual} − ${residual}) ÷ ${years}.`,
      )
    },
    (c) => {
      const annual = c.int(2, 20) * 5000
      return c.entry(
        `Regista a amortização do ano de um equipamento: ${kz(annual)}.`,
        [debit(ACC.amortEx, annual), credit(ACC.amortAc, annual)],
        'O custo do ano sobe a débito; as amortizações acumuladas, que reduzem o valor do bem, sobem a crédito.',
        [ACC.equip, ACC.caixa],
      )
    },
    (c) => {
      const years = c.pick(LIVES)
      const annual = c.int(2, 20) * 5000
      const passed = c.int(1, years - 1)
      return c.num(
        `Um equipamento custou ${kz(annual * years)} (vida útil de ${years} anos, sem residual). Qual é o seu valor líquido depois de ${passed} ${passed === 1 ? 'ano' : 'anos'}?`,
        annual * (years - passed),
        `Custo − ${passed} × ${annual}.`,
      )
    },
    (c) => {
      const annual = c.int(2, 20) * 6000
      const months = c.int(3, 9)
      return c.num(
        `Um equipamento amortiza ${kz(annual)} por ano. Foi comprado e começou a ser usado ${months} meses antes do fim do ano. Quanto se amortiza nesse primeiro ano?`,
        (annual * months) / 12,
        `${annual} × ${months} ÷ 12.`,
      )
    },
    (c) => {
      const annual = c.int(4, 20) * 5000
      const years = c.pick(LIVES)
      return c.num(
        `Um equipamento custou ${kz(annual * years)} e amortiza ${kz(annual)} por ano. Ao fim de quantos anos fica totalmente amortizado?`,
        years,
        `${annual * years} ÷ ${annual}.`,
        'anos',
        0.1,
      )
    },
    (c) =>
      c.ask(
        'Porque se amortiza um equipamento em vez de lançar o custo todo no ano da compra?',
        'Porque o equipamento ajuda a vender durante vários anos, e o custo reparte-se por eles',
        ['Porque o dono prefere pagar menos impostos', 'Porque o equipamento perde o valor no primeiro dia'],
        'Cada ano com o custo que lhe pertence: é o princípio da especialização.',
      ),
    (c) =>
      c.fill(
        'Amortização anual = (custo − valor ___) ÷ vida útil',
        [['residual']],
        'O valor residual é o que se espera obter no fim da vida útil.',
      ),
    (c) =>
      c.decide(
        [
          'A Ana comprou um computador por 180.000 Kz há 2 anos e nunca registou amortizações. O balanço mostra o computador por 180.000 Kz.',
          'O computador, com vida útil de 6 anos, já mostra sinais de desgaste.',
        ],
        [
          {
            text: 'Registar as amortizações dos anos passados e continuar a amortizar 30.000 Kz por ano.',
            consequence: 'O valor do computador no balanço fica realista (120.000 Kz).',
          },
          {
            text: 'Deixar o valor como está: ainda funciona.',
            consequence: 'O ativo está sobrevalorizado e o resultado também.',
          },
          { text: 'Tirar o computador das contas.', consequence: 'Perde-se um bem que ainda se usa.' },
        ],
        0,
        'O que deve fazer?',
      ),
  ],
})
