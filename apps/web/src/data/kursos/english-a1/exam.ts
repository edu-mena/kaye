import type { ExamQuestion } from '../types'

// The final exam's bank: 20 questions are drawn from it each attempt (domain/kursos.ts).
// Only units 1 and 2 are written in this test version, so only they are asked.

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
  c('e01', 'u1', 'I ___ a student at ISUTIC.', ['am', 'is', 'are'], 0),
  c('e02', 'u1', 'My brothers ___ in Benguela.', ['is', 'am', 'are'], 2),
  c('e03', 'u1', 'Tenho 20 anos.', ['I have 20 years.', "I'm 20.", 'I am have 20.'], 1),
  c(
    'e04',
    'u1',
    'Negativa de "She is ready".',
    ["She isn't ready.", "She aren't ready.", 'She not ready.'],
    0,
  ),
  c('e05', 'u1', 'Negativa de "I am tired".', ["I amn't tired.", "I'm not tired.", "I isn't tired."], 1),
  c('e06', 'u1', 'Is Lukeny your friend? Yes, ___', ["he's.", 'he is.', 'is he.'], 1),
  c('e07', 'u1', '___ hot in Luanda today.', ['Its', "It's", 'Is'], 1),
  c('e08', 'u1', 'Where ___ you from?', ['is', 'am', 'are'], 2),
  c('e09', 'u1', 'A pergunta correta:', ['You are a nurse?', 'Are you a nurse?', 'Are a nurse you?'], 1),
  c('e10', 'u1', 'Are they at home? No, ___', ["they aren't.", "they isn't.", 'they not.'], 0),
  c(
    'e11',
    'u1',
    '"Estou no escritório."',
    ["I'm in the office.", 'Am in the office.', 'I is in the office.'],
    0,
  ),
  c('e12', 'u1', 'Kiala and I ___ colleagues.', ['am', 'is', 'are'], 2),
  g('e13', 'u1', 'My mother ___ a teacher.', ['is']),
  g('e14', 'u1', 'We ___ not late.', ['are']),
  g('e15', 'u1', 'How old ___ you?', ['are']),
  g('e16', 'u1', '___ your name Ana? (pergunta)', ['is']),
  g('e17', 'u1', 'I am → ___ (contraído)', ["I'm"]),
  g('e18', 'u1', 'they are not → ___ (contraído)', ["they aren't", "they're not"]),
  g('e19', 'u1', 'The banks ___ closed on Sunday.', ['are']),
  g('e20', 'u1', "Are you hungry? No, I'm ___.", ['not']),
  c('e21', 'u2', 'Teresa is with ___ father.', ['his', 'her', 'its'], 1),
  c('e22', 'u2', 'Paulo is with ___ sister.', ['his', 'her', 'their'], 0),
  c('e23', 'u2', 'Can you help ___? (a nós)', ['we', 'us', 'our'], 1),
  c('e24', 'u2', 'This bag is ___. (minha)', ['my', 'mine', 'me'], 1),
  c('e25', 'u2', 'O carro do Pedro.', ["Pedro's car", "car's Pedro", 'Pedro car'], 0),
  c('e26', 'u2', '___ phone is this?', ['Who', 'Whose', "Who's"], 1),
  c('e27', 'u2', 'The students and ___ teacher.', ['there', 'their', "they're"], 1),
  c('e28', 'u2', 'The company and ___ workers.', ["it's", 'its', 'his'], 1),
  c('e29', 'u2', '___ is my friend.', ['Her', 'She', 'Hers'], 1),
  c(
    'e30',
    'u2',
    'Os uniformes dos trabalhadores.',
    ["the workers' uniforms", "the worker's uniforms", 'the workers uniforms'],
    0,
  ),
  c('e31', 'u2', 'Is this pen ___? (tua)', ['your', 'yours', "your's"], 1),
  c('e32', 'u2', 'I call ___ every day. (a ela)', ['she', 'her', 'hers'], 1),
  g('e33', 'u2', 'I know ___. (o Sr. Neto)', ['him']),
  g('e34', 'u2', 'This message is for ___. (eles)', ['them']),
  g('e35', 'u2', 'We are a family. ___ house is in Cacuaco.', ['our']),
  g('e36', 'u2', "It's Ana's notebook. It's ___.", ['hers']),
  g('e37', 'u2', 'I am Rosa. ___ surname is Cassoma.', ['my']),
  g('e38', 'u2', "It's our classroom. It's ___.", ['ours']),
  g('e39', 'u2', '___ keys are these? (de quem)', ['whose']),
  g('e40', 'u2', 'Kiala and ___ wife are doctors. (dele)', ['his']),
]

export default exam
