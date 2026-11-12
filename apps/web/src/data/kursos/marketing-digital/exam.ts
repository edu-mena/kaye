import type { ExamQuestion } from '../types'

// The final exam's bank: 20 questions are drawn from it each attempt (domain/kursos.ts).
// Only units 1 and 2 are written in this test version, so only they are asked (3 or 4 per lesson).

const c = (id: string, unit: string, prompt: string, options: string[], answer: number): ExamQuestion => ({
  id,
  unit,
  kind: 'choice',
  prompt,
  options,
  answer,
})
const g = (id: string, unit: string, prompt: string, answers: string[]): ExamQuestion => ({
  id,
  unit,
  kind: 'gap',
  prompt,
  answers,
})

const exam: ExamQuestion[] = [
  // U1 L1: o que é marketing
  c(
    'e01',
    'u1',
    'Marketing é…',
    [
      'só fazer anúncios',
      'perceber as necessidades dos clientes e oferecer uma solução',
      'baixar sempre os preços',
    ],
    1,
  ),
  c(
    'e02',
    'u1',
    '“Ter onde deixar o filho enquanto trabalha” é…',
    ['uma necessidade', 'um preço', 'uma promoção'],
    0,
  ),
  g('e03', 'u1', 'Quem compra ou usa o que ofereces é o ___.', ['cliente']),
  // U1 L2: proposta de valor
  c(
    'e04',
    'u1',
    'A proposta de valor responde a…',
    ['quanto custa?', 'porque é que devo escolher-te a ti?', 'qual é o horário?'],
    1,
  ),
  c(
    'e05',
    'u1',
    'Qual é a melhor proposta de valor para uma lavandaria?',
    [
      'A melhor lavandaria do país.',
      'Roupa lavada e passada em 24 horas, com recolha à porta no Kilamba.',
      'Venha experimentar.',
    ],
    1,
  ),
  c(
    'e06',
    'u1',
    'Uma proposta de valor deve prometer…',
    ['tudo o que o cliente quiser', 'só o que o negócio cumpre', 'ganhos de dinheiro'],
    1,
  ),
  // U1 L3: os 4 P
  c(
    'e07',
    'u1',
    'Quais são os 4 P?',
    ['Produto, preço, praça, promoção', 'Pessoas, papel, prazo, plano', 'Perfil, post, partilha, página'],
    0,
  ),
  c('e08', 'u1', 'Entregar ao domicílio é uma decisão de…', ['produto', 'praça', 'preço'], 1),
  c('e09', 'u1', 'Publicar fotos no Instagram é uma decisão de…', ['promoção', 'produto', 'praça'], 0),
  g('e10', 'u1', 'Em inglês, os 4 P chamam-se marketing ___.', ['mix']),
  // U2 L1: perfil de negócio
  c(
    'e11',
    'u2',
    'Para vender pelo WhatsApp, deves usar…',
    ['a conta pessoal', 'uma conta de negócio', 'a conta de um amigo'],
    1,
  ),
  c(
    'e12',
    'u2',
    'Em que plataformas deve estar o teu negócio?',
    ['Em todas', 'Onde estão os teus clientes', 'Em nenhuma'],
    1,
  ),
  c(
    'e13',
    'u2',
    'Porque é que o nome e a foto devem ser os mesmos em todas as plataformas?',
    ['Para os clientes te reconhecerem', 'Porque é obrigatório', 'Para pagar menos'],
    0,
  ),
  // U2 L2: descrição e catálogo
  c(
    'e14',
    'u2',
    'Qual é a melhor descrição?',
    ['O melhor salão de Angola!!!', 'Tranças em Viana e ao domicílio. Marcações por mensagem.', 'Salão.'],
    1,
  ),
  c(
    'e15',
    'u2',
    'No catálogo, cada produto deve ter…',
    ['foto real, nome claro e preço', 'só uma foto da internet', 'só o preço'],
    0,
  ),
  g('e16', 'u2', 'Uma boa descrição diz o quê, para quem, onde e como ___.', ['encomendar']),
  g('e17', 'u2', 'Para evitar a pergunta “quanto custa?”, o ___ deve estar visível.', ['preço']),
  // U2 L3: horário, respostas e confiança
  c(
    'e18',
    'u2',
    'Recebes mensagens fora do horário. O que ajuda?',
    ['Uma mensagem de ausência', 'Apagar as mensagens', 'Mudar de número'],
    0,
  ),
  c(
    'e19',
    'u2',
    'Qual destas frases é uma promessa a evitar?',
    [
      '“Respondemos de terça a sábado.”',
      '“Com as nossas aulas vais ganhar muito dinheiro.”',
      '“Entregamos às quartas.”',
    ],
    1,
  ),
  c(
    'e20',
    'u2',
    'Antes de partilhar a opinião de um cliente…',
    ['pedes autorização', 'mudas o texto', 'mostras o número dele'],
    0,
  ),
  g('e21', 'u2', 'As respostas guardadas para perguntas repetidas chamam-se respostas ___.', ['rápidas']),
]

export default exam
