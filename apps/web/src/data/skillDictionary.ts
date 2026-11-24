// The skills the CV reader looks for (docs/decisoes/0025). It starts with the four areas of the Kursos.
// `id` is the catalogue's own skill id wherever the career data already has the skill (a test checks that
// enough of them do; the name is the short one a CV carries), so this is not a second list. `terms` name it in Portuguese
// and English, already without accents and in lower case (a test checks that too).

export type DictionaryArea = 'programacao' | 'contabilidade' | 'financas' | 'gestao'

export type DictionarySkill = { id: string; name: string; area: DictionaryArea; terms: string[] }

export const SKILL_DICTIONARY: DictionarySkill[] = [
  // Programação
  { id: 'python', name: 'Python', area: 'programacao', terms: ['python'] },
  { id: 'javascript', name: 'JavaScript', area: 'programacao', terms: ['javascript', 'ecmascript'] },
  { id: 'typescript', name: 'TypeScript', area: 'programacao', terms: ['typescript'] },
  { id: 'java', name: 'Java', area: 'programacao', terms: ['java'] },
  { id: 'php', name: 'PHP', area: 'programacao', terms: ['php', 'laravel'] },
  { id: 'html-css', name: 'HTML e CSS', area: 'programacao', terms: ['html', 'css', 'html5', 'css3'] },
  { id: 'react', name: 'React', area: 'programacao', terms: ['react', 'reactjs', 'react.js'] },
  {
    id: 'sql',
    name: 'SQL',
    area: 'programacao',
    terms: ['sql', 'mysql', 'postgresql', 'bases de dados', 'base de dados', 'databases'],
  },
  { id: 'git', name: 'Git', area: 'programacao', terms: ['git', 'github', 'gitlab'] },
  {
    id: 'apis-rest',
    name: 'Consumir APIs REST',
    area: 'programacao',
    terms: ['api rest', 'apis rest', 'rest api', 'restful'],
  },
  { id: 'linux', name: 'Linux', area: 'programacao', terms: ['linux', 'ubuntu'] },
  {
    id: 'algoritmos',
    name: 'Algoritmos',
    area: 'programacao',
    terms: ['algoritmos', 'algorithms', 'estruturas de dados', 'data structures'],
  },
  {
    id: 'testes-software',
    name: 'Testes de software',
    area: 'programacao',
    terms: ['testes de software', 'testes unitarios', 'unit testing', 'software testing'],
  },

  // Contabilidade
  {
    id: 'excel-cv',
    name: 'Excel',
    area: 'contabilidade',
    terms: ['excel', 'folha de calculo', 'folhas de calculo', 'spreadsheet', 'spreadsheets'],
  },
  {
    id: 'lancamentos',
    name: 'Lançamentos contabilísticos',
    area: 'contabilidade',
    terms: ['lancamentos contabilisticos', 'lancamentos', 'journal entries', 'bookkeeping', 'escrituracao'],
  },
  {
    id: 'balancete',
    name: 'Balancetes e balanços',
    area: 'contabilidade',
    terms: ['balancete', 'balancetes', 'balanco', 'balancos', 'trial balance', 'balance sheet'],
  },
  {
    id: 'plano-geral-contas',
    name: 'Plano Geral de Contabilidade',
    area: 'contabilidade',
    terms: ['pgc', 'plano geral de contabilidade', 'plano de contas', 'chart of accounts'],
  },
  {
    id: 'impostos',
    name: 'Impostos (IVA, IRT, Imposto Industrial)',
    area: 'contabilidade',
    terms: ['iva', 'irt', 'imposto industrial', 'imposto de consumo', 'impostos', 'fiscalidade', 'taxation'],
  },
  {
    id: 'faturacao',
    name: 'Faturação',
    area: 'contabilidade',
    terms: ['faturacao', 'facturacao', 'faturas', 'invoicing', 'billing'],
  },
  {
    id: 'contas-pagar-receber',
    name: 'Contas a pagar e a receber',
    area: 'contabilidade',
    terms: ['contas a pagar', 'contas a receber', 'accounts payable', 'accounts receivable'],
  },
  {
    id: 'reconciliacao-bancaria',
    name: 'Reconciliação bancária',
    area: 'contabilidade',
    terms: ['reconciliacao bancaria', 'conciliacao bancaria', 'bank reconciliation'],
  },
  { id: 'auditoria', name: 'Auditoria', area: 'contabilidade', terms: ['auditoria', 'audit', 'auditing'] },
  {
    id: 'software-contabilidade',
    name: 'Software de contabilidade',
    area: 'contabilidade',
    terms: ['primavera erp', 'sage 50', 'phc', 'quickbooks', 'saft', 'saf-t'],
  },

  // Finanças
  {
    id: 'analise-investimentos',
    name: 'Análise de investimentos',
    area: 'financas',
    terms: ['analise de investimentos', 'investment analysis', 'investimentos', 'valor atual liquido', 'npv'],
  },
  {
    id: 'analise-financeira',
    name: 'Análise financeira',
    area: 'financas',
    terms: ['analise financeira', 'financial analysis', 'racios financeiros', 'financial ratios'],
  },
  {
    id: 'fluxo-caixa',
    name: 'Fluxo de caixa',
    area: 'financas',
    terms: ['fluxo de caixa', 'fluxos de caixa', 'cash flow', 'tesouraria', 'treasury'],
  },
  {
    id: 'orcamentos',
    name: 'Orçamentos',
    area: 'financas',
    terms: ['orcamento', 'orcamentos', 'budget', 'budgeting', 'forecast'],
  },
  {
    id: 'credito',
    name: 'Crédito e juros',
    area: 'financas',
    terms: ['credito', 'juros', 'emprestimos', 'microcredito', 'credit analysis', 'loans'],
  },
  { id: 'estatistica', name: 'Estatística básica', area: 'financas', terms: ['estatistica', 'statistics'] },
  { id: 'power-bi', name: 'Power BI', area: 'financas', terms: ['power bi', 'powerbi'] },

  // Gestão de Empresas
  {
    id: 'lideranca-equipas',
    name: 'Liderança de equipas',
    area: 'gestao',
    terms: ['lideranca', 'lideranca de equipas', 'team leadership', 'leadership', 'chefia de equipas'],
  },
  { id: 'negociacao', name: 'Negociação', area: 'gestao', terms: ['negociacao', 'negotiation'] },
  {
    id: 'gestao-riscos-projecto',
    name: 'Gestão de riscos',
    area: 'gestao',
    terms: ['gestao de riscos', 'risk management'],
  },
  {
    id: 'planeamento-cronogramas',
    name: 'Planeamento e cronogramas',
    area: 'gestao',
    terms: ['planeamento', 'cronograma', 'cronogramas', 'scheduling'],
  },
  {
    id: 'gestao-projetos',
    name: 'Gestão de projetos',
    area: 'gestao',
    terms: ['gestao de projetos', 'gestao de projectos', 'project management', 'scrum', 'kanban'],
  },
  {
    id: 'apresentacao',
    name: 'Comunicação e apresentação',
    area: 'gestao',
    terms: ['apresentacoes', 'comunicacao e apresentacao', 'public speaking', 'presentations'],
  },
  {
    id: 'ingles-negocios',
    name: 'Inglês de trabalho',
    area: 'gestao',
    terms: ['ingles de negocios', 'ingles profissional', 'business english'],
  },
  {
    id: 'atendimento-cliente',
    name: 'Atendimento ao cliente',
    area: 'gestao',
    terms: ['atendimento ao cliente', 'apoio ao cliente', 'customer service', 'customer support'],
  },
  { id: 'vendas', name: 'Vendas', area: 'gestao', terms: ['vendas', 'sales', 'prospecao'] },
  {
    id: 'recursos-humanos',
    name: 'Recursos humanos',
    area: 'gestao',
    terms: ['recursos humanos', 'human resources', 'recrutamento', 'recruitment'],
  },
  {
    id: 'planeamento-estrategico',
    name: 'Planeamento estratégico',
    area: 'gestao',
    terms: [
      'planeamento estrategico',
      'estrategia empresarial',
      'strategic planning',
      'business plan',
      'plano de negocios',
    ],
  },
]
