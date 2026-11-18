import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getCareer } from '../../data/source'
import type { Career, CareerSummary, Program } from '../../data/types'
import { PROGRAM } from '../../test/programs'
import { getUser } from '../../state/userStore'
import { renderWithApp } from '../../test/render'
import { seedTested, seedUser } from '../../test/user'
import CareerPage from './CareerPage'

/**
 * The real catalogue today has no career still in curation, no salary survey by quartile, no job ads per month
 * and no ranked programs: those parts of the page are tested with made-up records added to the data source.
 */
const extra = vi.hoisted(() => ({
  careers: new Map<string, Career>(),
  summaries: [] as CareerSummary[],
  programs: [] as Program[],
}))

vi.mock('../../data/source', async (importOriginal) => {
  const real = await importOriginal<typeof import('../../data/source')>()
  return {
    ...real,
    getCareer: async (slug: string) => extra.careers.get(slug) ?? real.getCareer(slug),
    listCareers: async () => [...(await real.listCareers()), ...extra.summaries],
    listPrograms: async (career?: string) =>
      extra.programs.filter((program) => !career || program.careers.includes(career)),
  }
})

beforeEach(() => {
  extra.careers.clear()
  extra.summaries.length = 0
  extra.programs.length = 0
})

/** The frontend career with a salary survey by quartile, salaries by stage and job ads per month. */
async function careerWithSurvey(): Promise<Career> {
  const real = await getCareer('desenvolvedor-frontend')
  if (!real) throw new Error('desenvolvedor-frontend is missing')
  const career: Career = {
    ...real,
    slug: 'frontend-com-inquerito',
    salaryMedian: 350000,
    employerAsks: {
      postings: 58,
      skills: [
        { skillId: 'javascript', share: 0.86 },
        { skillId: 'react', share: 0.62 },
      ],
      education: [{ label: 'Licenciatura', share: 0.52 }],
      experienceYearsMedian: 2,
      certifications: [],
    },
    market: {
      ...real.market,
      demand: 'alta',
      trendPct: 12,
      salary: { p25: 250000, p50: 350000, p75: 500000, basis: 'Inquérito de exemplo' },
      salaryByStage: [
        { level: 'estagio', median: 120000 },
        { level: 'junior', median: 250000 },
      ],
      postingsByMonth: [
        { month: '2026-09', count: 42 },
        { month: '2026-10', count: 47 },
      ],
    },
  }
  extra.careers.set(career.slug, career)
  return career
}

const open = (slug: string) =>
  renderWithApp(<CareerPage />, { route: `/carreiras/${slug}`, path: '/carreiras/:slug' })

const openTab = async (name: string) => userEvent.click(await screen.findByRole('tab', { name }))

describe('CareerPage', () => {
  it('opens with a photo and the key numbers: salary and trend only to adults, and only when known', async () => {
    seedUser()
    await careerWithSurvey()
    open('frontend-com-inquerito')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Desenvolvedor Frontend' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Programador a sorrir/ })).toHaveAttribute('srcset')
    const hero = screen.getByRole('banner')
    expect(hero).toHaveTextContent('Salário mediano: 350 mil Kz/mês')
    expect(hero).toHaveTextContent('Procura +12% em 3 meses')
    expect(hero).toHaveTextContent(/até lá/)
  })

  it('shows no salary to someone without an adult profile', async () => {
    await careerWithSurvey()
    open('frontend-com-inquerito')
    expect(await screen.findByRole('banner')).not.toHaveTextContent(/Kz\/mês/)
  })

  it('opens what the career is in a popup from the "i" next to the name', async () => {
    open('desenvolvedor-frontend')
    await userEvent.click(await screen.findByRole('button', { name: 'O que é esta profissão?' }))
    const about = screen.getByRole('dialog', { name: 'Desenvolvedor Frontend' })
    expect(about).toHaveTextContent('Constrói os ecrãs de sites e apps: o que as pessoas veem e tocam.')
    expect(about).toHaveTextContent('Desenvolvimento')
    expect(about).toHaveTextContent('Procura baixa')
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows one part at a time, each behind its tab', async () => {
    open('desenvolvedor-frontend')
    // "O que pedem" only shows with the job ads' numbers, which no career has yet.
    expect(await screen.findByRole('tab', { name: 'O que faz' })).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'O que pedem' })).not.toBeInTheDocument()
    const sections = [
      'O que faz',
      'Características',
      'Como lá chegar',
      'Onde estudar',
      'Mercado',
      'Como cheguei aqui',
      'CVs modelo',
    ]
    for (const section of sections) {
      await openTab(section)
      expect(screen.getByRole('tab', { name: section })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getAllByRole('tabpanel')).toHaveLength(1)
      expect(screen.getByRole('tabpanel')).toContainElement(
        screen.getByRole('heading', { level: 2, name: section }),
      )
    }
    // The open tab lives in the URL, so back and shared links keep it.
    expect(screen.getByTestId('location')).toHaveTextContent('/carreiras/desenvolvedor-frontend?secao=cvs')
  })

  it('moves between tabs with the arrow keys', async () => {
    open('desenvolvedor-frontend')
    await userEvent.click(await screen.findByRole('tab', { name: 'O que faz' }))
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Características' })).toHaveFocus()
    expect(screen.getByRole('tab', { name: 'Características' })).toHaveAttribute('aria-selected', 'true')
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(screen.getByRole('tab', { name: 'CVs modelo' })).toHaveAttribute('aria-selected', 'true')
    await userEvent.keyboard('{Home}')
    expect(screen.getByRole('tab', { name: 'O que faz' })).toHaveAttribute('aria-selected', 'true')
  })

  it('shows employer asks as aggregated numbers only', async () => {
    await careerWithSurvey()
    open('frontend-com-inquerito')
    await openTab('O que pedem')
    expect(screen.getByText('Vagas de exemplo analisadas').closest('div')).toHaveTextContent('58')
    expect(screen.getByRole('list', { name: 'Competências mais pedidas' })).toHaveTextContent('JavaScript86%')
    expect(screen.getByText('Só números agregados: o Kayé não publica vagas.')).toBeInTheDocument()
    expect(getUser().visitedCareers).toEqual(['frontend-com-inquerito'])
  })

  it('saves the career and makes it the destination', async () => {
    seedUser()
    open('analista-de-dados')
    await userEvent.click(await screen.findByRole('button', { name: 'Guardar' }))
    await userEvent.click(screen.getByRole('button', { name: 'Escolher como destino' }))
    expect(getUser()).toMatchObject({
      savedCareers: ['analista-de-dados'],
      targetCareer: 'analista-de-dados',
    })
    expect(screen.getByRole('button', { name: 'Guardada' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'O teu destino' }))
    expect(getUser().targetCareer).toBeNull()
  })

  it('does not save for someone without a profile: it asks for the account first', async () => {
    open('analista-de-dados')
    await userEvent.click(await screen.findByRole('button', { name: 'Guardar' }))
    expect(getUser().savedCareers).toEqual([])
  })

  it('draws the path with what is done, where the person is, and what is ahead', async () => {
    seedUser()
    open('desenvolvedor-frontend')
    await openTab('Como lá chegar')
    await userEvent.click(await screen.findByRole('button', { name: 'Via técnica' }))
    const path = screen.getByRole('heading', { name: 'Como lá chegar' }).closest('section')!
    expect(within(path).getAllByText(/· Feito/)).toHaveLength(2)
    expect(within(path).getByText(/· Estás aqui/)).toBeInTheDocument()
    const course = within(path).getByText('Curso profissional de desenvolvimento web').closest('li')!
    expect(course).toHaveTextContent('Opcional')
    expect(course).toHaveTextContent('Dá para aprender sozinho')
    expect(course).toHaveTextContent('O certificado é opcional')
    expect(within(path).getByText('3 projetos publicados').closest('li')).toHaveTextContent('Essencial')
    expect(within(path).getByText('Duração: 5 a 5,5 anos')).toBeInTheDocument()
  })

  it('ranks where to study with the same scores as the Cursos page', async () => {
    extra.programs.push(PROGRAM)
    open('desenvolvedor-frontend')
    await openTab('Onde estudar')
    const study = (await screen.findByRole('heading', { name: 'Onde estudar' })).closest('section')!
    expect(await within(study).findByText('Desenvolvimento Web com React')).toBeInTheDocument()
    expect(within(study).getByRole('link', { name: /Ver todos os cursos/ })).toHaveAttribute(
      'href',
      '/cursos?carreira=desenvolvedor-frontend',
    )
  })

  it('opens a career that is still being curated without inventing content', async () => {
    const real = await getCareer('desenvolvedor-frontend')
    if (!real) throw new Error('desenvolvedor-frontend is missing')
    extra.summaries.push({ ...real, slug: 'em-curadoria', name: 'Product Manager', detailed: false })
    open('em-curadoria')
    expect(await screen.findByRole('heading', { level: 1, name: 'Product Manager' })).toBeInTheDocument()
    expect(screen.getByText(/Estamos a preparar esta página/)).toBeInTheDocument()
    // A real photo of the work, but no sections with made-up content.
    expect(screen.getByRole('img', { name: /Programador a sorrir/ })).toBeInTheDocument()
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })

  it('says when a career does not exist', async () => {
    open('nao-existe')
    expect(
      await screen.findByText('Esta profissão não existe ou ainda não foi publicada.'),
    ).toBeInTheDocument()
  })
})

describe('Where to study', () => {
  it('opens a course in a popup: the institution, the offer and the step it serves', async () => {
    extra.programs.push(PROGRAM)
    open('desenvolvedor-frontend')
    await openTab('Onde estudar')
    await userEvent.click(await screen.findByRole('button', { name: /Desenvolvimento Web com React/ }))
    const popup = screen.getByRole('dialog', { name: 'Desenvolvimento Web com React' })
    expect(within(popup).getByRole('region', { name: 'Instituição' })).toHaveTextContent(
      'Academia Digital Exemplo',
    )
    expect(
      within(popup).getByRole('region', { name: 'Como te leva até Desenvolvedor Frontend' }),
    ).toHaveTextContent(
      /Curso profissional de desenvolvimento web» da via técnica.*Aprender HTML, CSS, JavaScript e React» da via autodidata/,
    )
    expect(within(popup).getByText('Custo total', { selector: 'dt' }).closest('div')).toHaveTextContent(
      '≈ 56.000 Kz por mês',
    )
    expect(within(popup).getByRole('region', { name: /^Como chega aos \d+ pontos$/ })).toHaveTextContent(
      /Avaliação de alunos · peso \d+%\d+ de \d+ pts/,
    )
    await userEvent.click(within(popup).getByRole('button', { name: 'Comparar' }))
    expect(getUser().compare).toEqual(['web-react'])
    expect(screen.getByTestId('location')).toHaveTextContent('/carreiras/desenvolvedor-frontend')
  })
})

describe('Market', () => {
  it('says what the salary numbers mean, by stage and over time', async () => {
    seedUser()
    await careerWithSurvey()
    open('frontend-com-inquerito')
    await openTab('Mercado')
    const panel = screen.getByRole('tabpanel')
    expect(within(panel).getByText('Entrada').closest('div')).toHaveTextContent(
      '250.000 Kz1 em cada 4 ganha menos',
    )
    expect(within(panel).getByText('Mediana').closest('div')).toHaveTextContent('350.000 Kz')
    expect(within(panel).getByText('Topo').closest('div')).toHaveTextContent('1 em cada 4 ganha mais')
    expect(
      within(panel).getByRole('list', { name: 'Salário mediano por mês, em cada etapa' }),
    ).toHaveTextContent(/Estagiário.*120.000 Kz/)
    expect(within(panel).getByRole('list', { name: 'Vagas de exemplo por mês' })).toHaveTextContent(
      '47 vagas em out',
    )
  })

  it('shows, for a career the State hires by competition, the competitions with their source instead of ads', async () => {
    seedUser()
    open('medico-pediatra')
    const hero = await screen.findByRole('banner')
    expect(hero).toHaveTextContent('Salário de entrada: 507 mil Kz/mês')
    expect(hero).not.toHaveTextContent(/em 3 meses/)
    await openTab('Mercado')
    const panel = screen.getByRole('tabpanel')
    expect(panel).toHaveTextContent('2 963 vagas de Médico-Geral/Interno de Especialidade')
    expect(within(panel).getByRole('link', { name: /despachos/ })).toHaveAttribute(
      'href',
      expect.stringContaining('angolex.com'),
    )
    expect(within(panel).queryByRole('list', { name: 'Vagas de exemplo por mês' })).not.toBeInTheDocument()
    expect(
      within(panel).getByRole('list', { name: 'Salário mediano por mês, em cada etapa' }),
    ).toHaveTextContent(/Chefe de Serviço.*615.247 Kz/)
  })

  it('warns that the nursing technical course is suspended and shows the nursing career', async () => {
    seedUser()
    open('tecnico-medio-enfermagem')
    expect(await screen.findByRole('banner')).toHaveTextContent('Salário de entrada: 145 mil Kz/mês')
    expect(screen.getByText(/o curso médio de Enfermagem não abre em Luanda/)).toBeInTheDocument()
    await openTab('Mercado')
    const panel = screen.getByRole('tabpanel')
    expect(panel).toHaveTextContent('95 vagas de Técnico Médio de Enfermagem')
    expect(within(panel).getByRole('link', { name: /Despacho Conjunto n.º 42\/26/ })).toHaveAttribute(
      'href',
      expect.stringContaining('angolex.com'),
    )
    expect(
      within(panel).getByRole('list', { name: 'Salário mediano por mês, em cada etapa' }),
    ).toHaveTextContent(/Técnico Médio de Enfermagem de 1.ª Classe.*168.891 Kz/)
  })

  it('shows the diagnosis and therapy career, which the State opened only to graduates in 2026', async () => {
    seedUser()
    open('tecnico-analises-clinicas')
    expect(await screen.findByRole('banner')).toHaveTextContent('Salário de entrada: 362 mil Kz/mês')
    await openTab('Mercado')
    const panel = screen.getByRole('tabpanel')
    expect(panel).toHaveTextContent(
      '588 vagas de Técnico Superior de Diagnóstico e Terapêutica e nenhuma de Técnico Médio',
    )
    expect(
      within(panel).getByRole('list', { name: 'Salário mediano por mês, em cada etapa' }),
    ).toHaveTextContent(/Técnico Especialista, com uma especialidade.*506.674 Kz/)
  })

  it('shows no salary for a career no State table names, and says what is known with its source', async () => {
    seedUser()
    open('medico-dentista')
    expect(await screen.findByRole('banner')).not.toHaveTextContent(/Kz\/mês/)
    await openTab('Mercado')
    const panel = screen.getByRole('tabpanel')
    expect(panel).toHaveTextContent('330 123 consultas de estomatologia')
    expect(
      within(panel).getByRole('link', { name: /Anuário Estatístico Sanitário 2023/ }),
    ).toBeInTheDocument()
    expect(
      within(panel).queryByRole('list', { name: 'Salário mediano por mês, em cada etapa' }),
    ).not.toBeInTheDocument()
  })
})

describe('Model CVs', () => {
  it('shows an ideal CV for each path, opened in a popup without leaving the career', async () => {
    open('desenvolvedor-frontend')
    await openTab('CVs modelo')
    expect(screen.getByRole('button', { name: /^Via técnica/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Via universitária/ })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /^Via autodidata/ }))

    const popup = screen.getByRole('dialog', { name: 'Via autodidata · Kelson Domingos' })
    expect(await within(popup).findByRole('region', { name: 'O que este CV precisa' })).toHaveTextContent(
      'Links do GitHub',
    )
    expect(screen.getByTestId('location')).toHaveTextContent('/carreiras/desenvolvedor-frontend')

    await userEvent.click(within(popup).getByRole('button', { name: 'Comparar' }))
    expect(within(popup).getAllByRole('figure')).toHaveLength(2)

    await userEvent.click(within(popup).getByRole('button', { name: 'Começar a partir deste modelo' }))
    expect(getUser().cvs[0]?.basedOn).toBe('frontend-autodidata')
    expect(screen.getByTestId('location')).toHaveTextContent('/cv/editar')
  })
})

describe('FitPanel', () => {
  it('comes after the tabs and can be minimized', async () => {
    open('desenvolvedor-frontend')
    const fit = await screen.findByRole('region', { name: 'O meu encaixe' })
    expect(screen.getByRole('tabpanel').compareDocumentPosition(fit)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    const toggle = within(fit).getByRole('button', { name: 'O meu encaixe' })
    expect(within(fit).getByText('Interesses')).toBeVisible()
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(within(fit).getByText('Interesses')).not.toBeVisible()

    // The hero's "Encaixe" button opens it again.
    await userEvent.click(screen.getByRole('button', { name: 'Encaixe' }))
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })

  it('invites the test and the profile when they are missing', async () => {
    open('designer-ui-ux')
    const fit = await screen.findByRole('region', { name: 'O meu encaixe' })
    expect(within(fit).getByRole('link', { name: 'Faz o teste vocacional para saber.' })).toHaveAttribute(
      'href',
      '/teste',
    )
    expect(
      within(fit).getByRole('link', { name: 'Diz-nos a tua escolaridade no perfil.' }),
    ).toBeInTheDocument()
  })

  it('updates the skills part as soon as the person marks what they know', async () => {
    seedTested()
    open('desenvolvedor-frontend')
    const fit = await screen.findByRole('region', { name: 'O meu encaixe' })
    // The profile needs the questions, which load like any API data.
    expect(await within(fit).findByText('Combina muito')).toBeInTheDocument()
    expect(within(fit).getByText('Faltam 2 passos, pela via técnica')).toBeInTheDocument()
    expect(within(fit).getByText('Já tens 0 de 6 essenciais')).toBeInTheDocument()

    await userEvent.click(within(fit).getByRole('button', { name: 'Marcar o que sei' }))
    const dialog = screen.getByRole('dialog', { name: 'O que já sabes?' })
    await userEvent.click(
      within(within(dialog).getByRole('group', { name: 'React' })).getByRole('button', { name: 'Sei fazer' }),
    )
    await userEvent.click(
      within(within(dialog).getByRole('group', { name: 'Git' })).getByRole('button', { name: 'A aprender' }),
    )
    await userEvent.click(
      within(within(dialog).getByRole('group', { name: 'Git' })).getByRole('button', { name: 'Ainda não' }),
    )
    await userEvent.click(within(dialog).getByRole('button', { name: 'Feito' }))

    expect(getUser().skills).toEqual({ react: 'sei' })
    expect(within(fit).getByText('Já tens 1 de 6 essenciais')).toBeInTheDocument()
  })
})
