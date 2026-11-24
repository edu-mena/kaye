import { ACC as BASE, credit, debit, defineTopic as define, kz, type TopicSpec } from '../contabilidade/kit'
import { TOPICS } from './topics'

export { credit, debit, kz }

// Tools for the PGC course: the same engine as Contabilidade (kit of the Iniciante course), with its own topics, the
// extra accounts and its source line. Companies, people and amounts are invented; the book only gives themes.

const SOURCE =
  'Plano Geral de Contabilidade (Decreto n.º 82/01) e a organização de casos práticos do PGC só como tema; pergunta escrita de raiz pelo Kayé, empresas e valores inventados'

export const ACC = {
  ...BASE,
  imobilizado: 'Imobilizado corpóreo',
  fornecImob: 'Fornecedores de imobilizado',
  maisValias: 'Outros proveitos (mais-valias)',
  menosValias: 'Outros custos (menos-valias)',
  quebras: 'Custos por quebras de existências',
  provExist: 'Provisões para depreciação de existências',
  provEx: 'Provisões do exercício',
  reposicao: 'Reposição de provisões',
  provCliente: 'Provisões para cobranças duvidosas',
  imposto: 'Imposto sobre o rendimento',
  impostoPagar: 'Estado (imposto industrial a pagar)',
  pagConta: 'Estado (pagamentos por conta)',
  cambioDes: 'Diferenças de câmbio desfavoráveis',
  cambioFav: 'Diferenças de câmbio favoráveis',
  descObtidos: 'Descontos de pronto pagamento obtidos',
  socios: 'Sócios (capital a realizar)',
  reservaLegal: 'Reserva legal',
  dividendos: 'Sócios (dividendos a pagar)',
  resultadosTrans: 'Resultados transitados',
} as const

export const defineTopic = (spec: TopicSpec) => define(spec, TOPICS, SOURCE)
