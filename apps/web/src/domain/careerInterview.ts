import { GENERAL_QUESTIONS, type InterviewQuestion } from '../data/demo/interviews'
import type { Career, SkillLevel } from '../data/types'
import { careerFit } from './fit'
import { formatKz } from './format'
import { seeded, shuffle } from './psychotech'

// An interview for one profession, built from its page: the essential skills and what the
// person's fit ("O meu encaixe") says is missing, the day-to-day work, the work styles, the career
// stages for the goals and the market salaries for the salary question. Written in Portuguese like
// the rest of the question bank. Technical questions get more time to answer.

const TECHNICAL_SECONDS = 180

const lower = (text: string) => text.charAt(0).toLowerCase() + text.slice(1)
/** "Visualização de dados" → "visualização de dados", but "SQL" and "Power BI" stay. */
const skillName = (name: string) => (/^\p{Lu}\p{Ll}/u.test(name) ? lower(name) : name)
const roundTo = (amount: number, step = 5_000) => Math.round(amount / step) * step

/** What a person starting in this career earns a month, from the most specific figure there is. */
function entrySalary(career: Career): number | null {
  const stage = career.market.salaryByStage.find(
    (item) => item.level === 'estagio' || item.level === 'junior',
  )
  return stage?.median ?? career.market.salary?.p25 ?? career.salaryMedian
}

function motivation(career: Career): InterviewQuestion {
  return {
    id: `c-why-${career.slug}`,
    kind: 'motivation',
    text: `Porque escolheste a profissão de ${career.name}?`,
    goal: 'Se a escolha é tua, se sabes como é o trabalho real e se a motivação aguenta os dias difíceis.',
    model: `Interessei-me por esta área num projeto do curso em que tive de ${lower(career.dayToDay[0] ?? 'resolver um problema real')}, e percebi que gostava do resultado. Sei que o dia a dia também tem partes difíceis, como ${lower(career.dayToDay[2] ?? career.dayToDay[1] ?? 'trabalhar sob pressão')}, e é por isso que quero começar onde possa aprender com quem já faz bem.`,
    mistakes: [
      '"Porque dá dinheiro" e mais nada.',
      'Uma resposta que serviria para qualquer profissão.',
      'Não conhecer o que se faz no dia a dia.',
    ],
  }
}

function skillExperience(career: Career, skill: string): InterviewQuestion {
  return {
    id: `c-skill-${career.slug}-${skill}`,
    kind: 'technical',
    answerSeconds: TECHNICAL_SECONDS,
    text: `Fala-me da tua experiência com ${skill}. Onde a usaste e com que resultado?`,
    goal: `Se sabes mesmo ${skill}, na prática, e se consegues explicar o que fizeste tu.`,
    model: `No projeto final do curso tive de usar ${skill} num trabalho a sério. Primeiro percebi o que era preciso, depois fiz uma primeira versão e pedi ao professor que a revisse. Corrigi o que ele apontou e o trabalho teve boa nota. Ainda tenho muito para aprender, mas já sei por onde começar.`,
    mistakes: [
      'Dizer que dominas sem dar um exemplo.',
      'Falar de teoria e não do que fizeste.',
      'Não saber explicar os passos que seguiste.',
    ],
  }
}

function skillGap(career: Career, skill: string): InterviewQuestion {
  return {
    id: `c-gap-${career.slug}-${skill}`,
    kind: 'technical',
    answerSeconds: TECHNICAL_SECONDS,
    text: `Esta função pede ${skill}, que ainda não dominas. Como vais aprender nos primeiros três meses?`,
    goal: 'Se és honesto sobre o que falta e se tens um plano concreto para aprender.',
    model: `É verdade que ${skill} é o meu ponto mais fraco. Já comecei um curso gratuito online e faço exercícios ao fim do dia. Nos primeiros meses quero aprender com a equipa, pedir revisão do que faço e, ao fim de três meses, conseguir fazer sozinho as tarefas simples.`,
    mistakes: [
      'Fingir que já sabes.',
      '"Aprendo depressa" sem dizer como.',
      'Pôr a responsabilidade toda na empresa.',
    ],
  }
}

function dayToDay(career: Career, task: string): InterviewQuestion {
  return {
    id: `c-task-${career.slug}-${task.slice(0, 24)}`,
    kind: 'technical',
    answerSeconds: TECHNICAL_SECONDS,
    text: `Nesta função vais ter de ${lower(task)}. Como farias isso, passo a passo?`,
    goal: 'Se percebes o trabalho real e tens método, mesmo sem experiência.',
    model: `Começava por perceber o objetivo e quem vai usar o resultado. Depois via como a equipa já faz isto e que ferramentas usa. Fazia uma primeira versão pequena, pedia a opinião de alguém mais experiente e só depois a terminava. No fim confirmava se resolveu mesmo o que era preciso.`,
    mistakes: [
      'Saltar logo para a ferramenta sem perceber o objetivo.',
      'Não dizer como verificas que ficou bem feito.',
      'Uma resposta tão vaga que serve para qualquer tarefa.',
    ],
  }
}

function workStyle(career: Career, style: string): InterviewQuestion {
  return {
    id: `c-style-${career.slug}-${style.slice(0, 24)}`,
    kind: 'technical',
    text: `Quem trabalha como ${career.name} precisa de ${lower(style)}. Dá um exemplo em que mostraste isso.`,
    goal: 'Se tens o modo de trabalhar que a profissão pede, provado com um caso real.',
    model: `No estágio tive de ${lower(career.dayToDay[3] ?? career.dayToDay[0] ?? 'entregar um trabalho com prazo apertado')}. Foi aí que se viu: (situação) o que se passava, (tarefa) o que me cabia, (ação) o que fiz e (resultado) como acabou, de preferência com um número.`,
    mistakes: ['Dizer só "sou assim".', 'Um exemplo sem resultado.', 'Contar o que a equipa fez e não tu.'],
  }
}

function goals(career: Career): InterviewQuestion {
  const [first, second] = career.stages
  const certification = career.employerAsks?.certifications[0]?.name
  const professional =
    first && second
      ? `passar de ${first.title} a ${second.title} (${lower(second.responsibilities[0] ?? 'mais autonomia')})`
      : 'ganhar autonomia e ter mais responsabilidade na equipa'
  return {
    id: `c-goals-${career.slug}`,
    kind: 'goals',
    text: 'Quais são os teus objetivos pessoais e profissionais para os próximos três anos, e como é que esta função te ajuda a chegar lá?',
    goal: 'Se tens um plano realista, se os teus objetivos pessoais combinam com a vaga e se pensas ficar.',
    model: `Profissionalmente quero ${professional}${certification ? ` e tirar a certificação ${certification}` : ''}. Pessoalmente quero ter estabilidade para ajudar a minha família e continuar a estudar à noite. Esta função dá-me a experiência e a formação para isso, e eu dou em troca dedicação e vontade de crescer aqui.`,
    mistakes: [
      'Objetivos que não têm nada a ver com a vaga.',
      'Dizer que queres sair em poucos meses.',
      'Só objetivos pessoais, ou só profissionais.',
    ],
  }
}

function salary(career: Career): InterviewQuestion {
  const entry = entrySalary(career)
  const model =
    entry === null
      ? `Pesquisei anúncios e falei com quem já trabalha como ${career.name}. Para um primeiro emprego, a minha pretensão está dentro do que se paga no mercado para esta função, e estou aberto a conversar sobre o pacote: formação, transporte e seguro de saúde também contam.`
      : career.salaryKind === 'entrada'
        ? `Sei que no Estado o salário de entrada está fixado na tabela, à volta de ${formatKz(entry)} por mês para esta categoria. Aceito a tabela e o que me interessa é a progressão na carreira e a formação.`
        : `Pelo que pesquisei, quem começa como ${career.name} em Angola ganha à volta de ${formatKz(entry)} por mês. Para um primeiro emprego, a minha pretensão está entre ${formatKz(roundTo(entry * 0.9))} e ${formatKz(roundTo(entry * 1.1))}, mas estou aberto a conversar sobre o pacote: formação, transporte e seguro de saúde também contam.`
  return {
    id: `c-salary-${career.slug}`,
    kind: 'salary',
    text: 'Qual é a tua pretensão salarial para esta função?',
    goal: 'Se conheces o mercado e se o que pedes cabe na vaga, sem te desvalorizares.',
    model,
    mistakes: [
      'Um valor ao acaso, muito alto ou muito baixo.',
      '"O que me quiserem dar."',
      'Falar só do salário e esquecer o resto do pacote.',
    ],
  }
}

/**
 * Eight questions for one profession: introduction and motivation, four technical ones (skills,
 * what the fit says is missing, the day-to-day work, a work style), the goals, the salary.
 */
export function buildCareerInterview(
  career: Career,
  skills: Record<string, SkillLevel>,
  seed: number,
): InterviewQuestion[] {
  const random = seeded(seed)
  const intro = GENERAL_QUESTIONS.find((question) => question.id === 'g-intro')
  const fit = careerFit(career, { profile: null, education: null, skills })
  // Only what the person said about their skills counts: without it, nothing is "missing".
  const marked = career.skills.some((skill) => skills[skill.id])
  const missing = new Set(marked ? fit.skills.missing.map((skill) => skill.id) : [])
  const essential = career.skills.filter((skill) => skill.importance === 'essencial')
  const known = shuffle(
    random,
    essential.filter((skill) => !missing.has(skill.id)),
  )
  const gaps = shuffle(
    random,
    essential.filter((skill) => missing.has(skill.id)),
  )
  const pool = shuffle(random, essential)
  const first = known[0] ?? pool[0]
  const gap = gaps.find((skill) => skill.id !== first?.id)
  const second = pool.find((skill) => skill.id !== first?.id)
  const task = shuffle(random, career.dayToDay)[0]
  const style = shuffle(random, career.workStyles)[0]

  const technical = [
    first && skillExperience(career, skillName(first.name)),
    gap ? skillGap(career, skillName(gap.name)) : second && skillExperience(career, skillName(second.name)),
    task && dayToDay(career, task),
    style && workStyle(career, style),
  ].filter((question): question is InterviewQuestion => Boolean(question))

  return [...(intro ? [intro] : []), motivation(career), ...technical, goals(career), salary(career)]
}
