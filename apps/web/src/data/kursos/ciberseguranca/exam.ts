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
  // U1 L1: palavra-passe forte
  c(
    'e01',
    'u1',
    'Qual é a palavra-passe mais forte?',
    ['Huambo2005', 'H@mb0!', 'girafa-lenta-bebe-café-frio'],
    2,
  ),
  c(
    'e02',
    'u1',
    'O que mais protege uma palavra-passe?',
    ['Ter um símbolo', 'Ser longa e única', 'Ter o teu nome'],
    1,
  ),
  c(
    'e03',
    'u1',
    'Quando deves trocar uma palavra-passe forte?',
    ['Todas as semanas', 'Quando houver sinal de que alguém a conhece', 'Nunca'],
    1,
  ),
  g('e04', 'u1', 'Uma palavra-passe feita de várias palavras chama-se frase-___.', ['passe']),
  // U1 L2: gestor de palavras-passe
  c(
    'e05',
    'u1',
    'O que faz um gestor de palavras-passe?',
    [
      'Cria, guarda e preenche palavras-passe',
      'Apaga as contas antigas',
      'Partilha as palavras-passe com os amigos',
    ],
    0,
  ),
  c(
    'e06',
    'u1',
    'Qual destes sítios é pior para guardar palavras-passe?',
    ['Gestor de palavras-passe', 'Foto na galeria', 'Gestor do navegador'],
    1,
  ),
  g('e07', 'u1', 'No gestor, só decoras a palavra-passe ___.', ['principal', 'mestra']),
  // U1 L3: verificação em dois passos
  c(
    'e08',
    'u1',
    'Qual é a forma do segundo passo mais segura?',
    ['Código por SMS', 'App autenticadora', 'Pergunta de segurança'],
    1,
  ),
  c(
    'e09',
    'u1',
    'A impressão digital é uma prova do tipo…',
    ['algo que sabes', 'algo que tens', 'algo que és'],
    2,
  ),
  c(
    'e10',
    'u1',
    'Porque é que o código por SMS é menos seguro?',
    ['Porque o número pode ser passado para outro cartão SIM', 'Porque é muito longo', 'Porque é grátis'],
    0,
  ),
  // U2 L1: phishing
  c(
    'e11',
    'u2',
    '“A sua conta será bloqueada em 1 hora, clique aqui.” Que sinal de alerta é este?',
    ['Pressa', 'Oferta boa demais', 'Nenhum'],
    0,
  ),
  c(
    'e12',
    'u2',
    'Uma mensagem diz que é do teu banco. Como confirmas?',
    ['Respondo à mensagem', 'Abro o link da mensagem', 'Ligo para o número no verso do cartão'],
    2,
  ),
  g('e13', 'u2', 'A burla em que alguém finge ser de confiança para tirar dados chama-se ___.', ['phishing']),
  // U2 L2: falso familiar e pedidos de código
  c(
    'e14',
    'u2',
    '“Olá mãe, mudei de número.” Antes de enviar dinheiro…',
    ['ligas para o número antigo', 'envias metade', 'pedes o PIN do filho'],
    0,
  ),
  c(
    'e15',
    'u2',
    'Alguém pede o código do WhatsApp que te chegou “por engano”. O que quer?',
    ['Ajudar-te', 'Ficar com a tua conta', 'Testar a rede'],
    1,
  ),
  c(
    'e16',
    'u2',
    'Quem diz ser do banco e pede o código do Multicaixa Express é…',
    ['um funcionário normal', 'um burlão', 'a polícia'],
    1,
  ),
  g('e17', 'u2', 'Códigos, PIN e palavras-passe não se partilham com ___.', ['ninguém']),
  // U2 L3: falsas ofertas de emprego e de bolsas
  c(
    'e18',
    'u2',
    'Uma oferta de emprego pede uma taxa para garantir a vaga. É…',
    ['sinal de burla', 'normal', 'sinal de empresa séria'],
    0,
  ),
  c(
    'e19',
    'u2',
    'Onde confirmas uma bolsa de estudo?',
    ['No grupo de WhatsApp onde apareceu', 'No site oficial da instituição', 'Nos comentários do anúncio'],
    1,
  ),
  c(
    'e20',
    'u2',
    'Deste os dados do cartão a um burlão. O primeiro passo é…',
    ['contactar o banco pelo número no verso do cartão', 'esperar uma semana', 'apagar a conversa'],
    0,
  ),
  g('e21', 'u2', 'Se caíste numa burla, guarda as ___ (capturas de ecrã, comprovativos).', ['provas']),
]

export default exam
