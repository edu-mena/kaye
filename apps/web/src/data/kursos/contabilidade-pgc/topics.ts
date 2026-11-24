import type { TopicMeta } from '../topicCourse'

// The topics of "Contabilidade Angolana: PGC na Prática", in order. A short course for those who already know
// debit and credit (Contabilidade: Nível Iniciante): the cases of the PGC that come up most in a company's year.

export const TOPICS: TopicMeta[] = [
  { id: 't01', title: 'O PGC e as demonstrações financeiras', summary: 'O que se prepara e para quem.' },
  {
    id: 't02',
    title: 'Compras com descontos',
    summary: 'Desconto comercial e desconto de pronto pagamento.',
  },
  { id: 't03', title: 'O custo de um imobilizado', summary: 'O que entra no valor de um bem comprado.' },
  {
    id: 't04',
    title: 'Amortização: quotas constantes',
    summary: 'Valor residual, anos de vida e meses de uso.',
  },
  {
    id: 't05',
    title: 'Amortização: dígitos e produção',
    summary: 'Quotas degressivas e unidades produzidas.',
  },
  {
    id: 't06',
    title: 'Vender ou abater um imobilizado',
    summary: 'Valor líquido, mais-valias e menos-valias.',
  },
  { id: 't07', title: 'Custeio das existências', summary: 'FIFO, LIFO e custo médio ponderado.' },
  {
    id: 't08',
    title: 'Quebras e provisão em existências',
    summary: 'Quando o valor de venda fica abaixo do custo.',
  },
  {
    id: 't09',
    title: 'Devoluções e cobrança duvidosa',
    summary: 'Notas de crédito e provisão para clientes.',
  },
  { id: 't10', title: 'O Imposto Industrial', summary: 'Do resultado à matéria coletável e ao imposto.' },
  { id: 't11', title: 'Compras em moeda estrangeira', summary: 'Diferenças cambiais ao pagar.' },
  {
    id: 't12',
    title: 'Capital, reservas e dividendos',
    summary: 'Subscrever, realizar e distribuir o resultado.',
  },
]
