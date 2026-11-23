import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { getUser } from '../../state/userStore'
import { renderWithApp } from '../../test/render'
import { savedCv, seedUser } from '../../test/user'
import CvPage from './CvPage'
import CvWizardPage from './CvWizardPage'

const FRONTEND = { targetCareer: 'desenvolvedor-frontend' }

/** Opens the guide and waits for the CV to start from what the app knows. */
async function openWizard(change: Parameters<typeof seedUser>[0] = FRONTEND) {
  seedUser(change)
  renderWithApp(<CvWizardPage />)
  await waitFor(() => expect(getUser().cvs[0]?.autofilled).toBe(true))
}

async function next(times = 1) {
  for (let step = 0; step < times; step += 1) {
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }))
  }
}

const question = (name: string) => screen.getByRole('heading', { level: 1, name })
const section = (name: string) =>
  within(screen.getByRole('list', { name: 'Organização das secções' }))
    .getByText(name)
    .closest('li')!
const strength = () =>
  Number(/(\d+)%/.exec(screen.getByText(/O teu CV está \d+% forte/).textContent ?? '')?.[1])

describe('CvWizardPage: a CV that starts made', () => {
  it('opens filled with what the app knows, and says so', async () => {
    await openWizard({
      ...FRONTEND,
      skills: { javascript: 'domino' },
    })
    const { cv } = getUser().cvs[0]!
    expect(cv.name).toBe('Joana')
    expect(cv.headline).toMatch(/Frontend/)
    expect(cv.education.map((entry) => entry.title)).toEqual(['Ensino médio técnico (13.ª classe)'])
    expect(cv.summary).toMatch(/Frontend/)
    expect(await screen.findByText(/Já preenchemos o que sabemos de ti/)).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toHaveValue('Joana')
    // The person only confirms: the preview already shows the CV.
    expect(screen.getAllByText('Joana').length).toBeGreaterThan(0)
  })

  it('starts the CV once: what the person erases does not come back', async () => {
    await openWizard()
    await userEvent.click(screen.getByLabelText('Nome'))
    await userEvent.clear(screen.getByLabelText('Nome'))
    expect(getUser().cvs[0]!.cv.name).toBe('')
    // Opened again later, the guide does not fill it a second time.
    renderWithApp(<CvWizardPage />)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(getUser().cvs[0]!.cv.name).toBe('')
  })

  it('never replaces what the person already wrote', async () => {
    seedUser({
      ...FRONTEND,
      cvs: [savedCv({ name: 'Joana Manuel', headline: 'Designer', summary: 'O meu resumo.' })],
    })
    renderWithApp(<CvWizardPage />)
    await waitFor(() => expect(getUser().cvs[0]?.autofilled).toBe(true))
    expect(getUser().cvs[0]!.cv).toMatchObject({
      name: 'Joana Manuel',
      headline: 'Designer',
      summary: 'O meu resumo.',
    })
  })

  it('does not count the points of what it filled in as the first reward', async () => {
    await openWizard()
    await next()
    expect(screen.getByText('Sem stress: podes voltar a isto quando quiseres.')).toBeInTheDocument()
  })

  it('starts from the profile even when the device is offline and the catalogue never came', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () => Response.error()),
    )
    seedUser(FRONTEND)
    renderWithApp(<CvWizardPage />)
    await waitFor(() => expect(getUser().cvs[0]?.autofilled).toBe(true))
    expect(getUser().cvs[0]!.cv.name).toBe('Joana')
    expect(screen.getByLabelText('Nome')).toHaveValue('Joana')
  })

  it('works for a person with no career chosen yet', async () => {
    await openWizard({})
    expect(getUser().cvs[0]!.cv.headline).toBe('')
    expect(question('Como te chamas?')).toBeInTheDocument()
  })
})

describe('CvWizardPage: one question at a time', () => {
  it('asks one question per screen, goes back and can skip', async () => {
    await openWizard()
    expect(question('Como te chamas?')).toHaveFocus()
    expect(screen.getByRole('progressbar', { name: 'Passo 1 de 11' })).toBeInTheDocument()

    await next()
    expect(question('Que profissão queres mostrar?')).toBeInTheDocument()
    expect(screen.queryByLabelText('Nome')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Saltar por agora' }))
    expect(question('Como te podem contactar?')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Voltar' }))
    expect(question('Que profissão queres mostrar?')).toBeInTheDocument()
  })

  it('fills the contact and the links', async () => {
    await openWizard()
    await next(2)
    // The province already starts the line.
    expect(screen.getByLabelText('Contacto')).toHaveValue('Luanda')
    await userEvent.clear(screen.getByLabelText('Contacto'))
    await userEvent.type(screen.getByLabelText('Contacto'), 'joana@exemplo.ao')
    await userEvent.type(screen.getByLabelText('Links'), 'github.com/joana, joana.dev')
    expect(getUser().cvs[0]!.cv).toMatchObject({
      contact: 'joana@exemplo.ao',
      links: ['github.com/joana', 'joana.dev'],
    })
  })

  it('offers the sentence about the career and puts it in the summary with one tap', async () => {
    await openWizard()
    await userEvent.clear(screen.getByLabelText('Nome'))
    await next(3)
    await userEvent.clear(screen.getByRole('textbox', { name: 'Resumo' }))
    await userEvent.click(screen.getByRole('button', { name: /^Juntar: .*Frontend/ }))
    expect(getUser().cvs[0]!.cv.summary).toMatch(/Frontend/)
  })

  it('leaves from the first screen to the CV studio', async () => {
    await openWizard()
    expect(screen.getByRole('link', { name: 'CV' })).toHaveAttribute('href', '/cv')
  })
})

describe('CvWizardPage: the strength of the CV', () => {
  it('shows how strong the CV is, what is missing, and rewards what is added', async () => {
    await openWizard({})
    const before = strength()
    expect(screen.getByText('Para chegares aos 100%, falta:')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Força do CV' })).toHaveValue(before)

    await next()
    await userEvent.type(screen.getByLabelText('Título profissional'), 'Designer UI/UX')
    expect(strength()).toBe(before + 10)

    await next()
    expect(screen.getByText('Boa! +10 pontos no teu CV.')).toBeInTheDocument()
  })

  it('tells the person, without pressure, when a step added nothing', async () => {
    await openWizard({})
    await next(2)
    expect(screen.getByText('Sem stress: podes voltar a isto quando quiseres.')).toBeInTheDocument()
  })

  it('takes the person to the part that is missing', async () => {
    await openWizard({})
    await userEvent.click(screen.getByRole('button', { name: /^experiência ou projetos · \+20$/ }))
    expect(question('O que já fizeste?')).toBeInTheDocument()
  })

  it('reaches 100 and says the CV is ready to send', async () => {
    seedUser({
      cvs: [
        savedCv({
          name: 'Joana',
          headline: 'Designer',
          contact: 'joana@exemplo.ao',
          links: ['joana.dev'],
          summary: 'Estudante de design, procuro o meu primeiro estágio em interfaces para telemóvel.',
          education: [{ id: 'e', title: 'Médio', place: '', period: '', description: '' }],
          experience: [{ id: 'x', title: 'Cartaz', place: '', period: '', description: 'Fiz um cartaz' }],
          skills: ['Figma', 'Canva', 'Excel', 'Word', 'Photoshop'],
          languages: ['Português'],
        }),
      ],
    })
    renderWithApp(<CvWizardPage />)
    expect(await screen.findByText('O teu CV está nos 100%. Está pronto a enviar!')).toBeInTheDocument()
    expect(screen.queryByText('Para chegares aos 100%, falta:')).not.toBeInTheDocument()
  })
})

describe('CvWizardPage: a CV for someone with no experience', () => {
  it('offers projects, volunteering and informal work for the career, one tap each', async () => {
    await openWizard()
    await next(5)
    expect(question('O que já fizeste?')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Juntar: Voluntariado' }))
    await userEvent.click(screen.getByRole('button', { name: 'Juntar: Projeto da escola' }))
    const { experience } = getUser().cvs[0]!.cv
    expect(experience.map((entry) => entry.title)).toEqual(['Voluntariado', 'Projeto da escola'])
    expect(experience[1]!.description).toMatch(/Frontend/)
    // What is already on the CV is not offered again, and can be edited like any entry.
    expect(screen.queryByRole('button', { name: 'Juntar: Voluntariado' })).not.toBeInTheDocument()
    const group = screen.getByRole('group', { name: 'Experiência' })
    expect(within(group).getAllByLabelText('Título')[0]).toHaveValue('Voluntariado')
  })

  it('offers the projects of the model CVs of the career', async () => {
    await openWizard()
    await next(5)
    await userEvent.click(await screen.findByRole('button', { name: 'Juntar: Kitanda Online' }))
    expect(getUser().cvs[0]!.cv.projects.map((entry) => entry.title)).toEqual(['Kitanda Online'])
  })

  it('offers the skills the career asks for, and the person adds one with a tap', async () => {
    await openWizard()
    await next(6)
    expect(question('O que sabes fazer?')).toBeInTheDocument()
    const offered = await screen.findByRole('button', { name: 'Juntar: React' })
    await userEvent.click(offered)
    expect(getUser().cvs[0]!.cv.skills).toContain('React')
    expect(screen.getByRole('textbox', { name: 'Competências' })).toHaveValue('React')
    expect(screen.queryByRole('button', { name: 'Juntar: React' })).not.toBeInTheDocument()
    await userEvent.type(screen.getByRole('textbox', { name: 'Competências' }), ', Git')
    expect(getUser().cvs[0]!.cv.skills).toEqual(['React', 'Git'])
  })

  it('offers the languages of the country', async () => {
    await openWizard()
    await next(7)
    await userEvent.click(screen.getByRole('button', { name: 'Juntar: Umbundu' }))
    await userEvent.click(screen.getByRole('button', { name: 'Juntar: Português (nativo)' }))
    expect(getUser().cvs[0]!.cv.languages).toEqual(['Umbundu', 'Português (nativo)'])
  })

  it('adds the education by hand', async () => {
    await openWizard({})
    await next(4)
    const group = screen.getByRole('group', { name: 'Formação' })
    await userEvent.click(within(group).getByRole('button', { name: 'Acrescentar' }))
    await userEvent.type(within(group).getAllByLabelText('Título')[1]!, 'Curso de Excel')
    expect(getUser().cvs[0]!.cv.education.map((entry) => entry.title)).toContain('Curso de Excel')
  })
})

describe('CvWizardPage: organising the CV', () => {
  it('hides a section, moves it and changes how a list is shown', async () => {
    await openWizard({
      cvs: [savedCv({ name: 'Joana', skills: ['Excel', 'Word'], languages: ['Português'] })],
    })
    await next(8)
    expect(question('Organiza o teu CV')).toBeInTheDocument()

    await userEvent.click(within(section('Competências')).getByRole('button', { name: 'Com pontos' }))
    expect(getUser().cvs[0]!.arrangement?.formats?.skills).toBe('bullets')

    await userEvent.click(within(section('Resumo')).getByRole('button', { name: 'Descer Resumo' }))
    expect(getUser().cvs[0]!.arrangement?.order?.slice(0, 2)).toEqual(['experience', 'summary'])

    await userEvent.click(screen.getByRole('switch', { name: 'Mostrar Línguas' }))
    expect(getUser().cvs[0]!.arrangement?.hidden).toEqual(['languages'])
    expect(
      within(section('Línguas')).queryByRole('button', { name: 'Subir Línguas' }),
    ).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Repor a organização do modelo' }))
    expect(getUser().cvs[0]!.arrangement).toEqual({})
  })

  it('turns the faded example off and on', async () => {
    await openWizard({})
    await next(8)
    expect(screen.getByRole('switch', { name: 'Mostrar um exemplo nas partes vazias' })).toBeChecked()
    await userEvent.click(screen.getByRole('switch', { name: 'Mostrar um exemplo nas partes vazias' }))
    expect(getUser().cvs[0]!.arrangement?.sample).toBe(false)
  })

  it('fills the CV with a faded example, so the sheet never looks empty', async () => {
    await openWizard({})
    // Nothing of the person yet in these sections, and the sheet already shows them.
    expect(getUser().cvs[0]!.cv.experience).toEqual([])
    const preview = screen.getByRole('heading', { name: 'Pré-visualização' }).parentElement!
    expect(within(preview).getByText('EXPERIÊNCIA')).toBeInTheDocument()
    expect(getUser().cvs[0]!.cv.experience).toEqual([])
  })

  it('moves a short list to the side column in a model that has one', async () => {
    await openWizard({ cvs: [{ ...savedCv({ name: 'Joana', skills: ['Excel'] }), template: 'moderno' }] })
    await next(8)
    const skills = within(screen.getByRole('list', { name: 'Organização das secções' }))
      .getByText('Competências')
      .closest('li')!
    await userEvent.click(within(skills).getByRole('button', { name: 'Coluna principal' }))
    expect(getUser().cvs[0]!.arrangement?.side).not.toContain('skills')
    await userEvent.click(within(skills).getByRole('button', { name: 'Coluna do lado' }))
    expect(getUser().cvs[0]!.arrangement?.side).toContain('skills')
  })

  it('tells that the links of a model stay under the name', async () => {
    await openWizard({})
    await next(8)
    expect(screen.getByText('Neste modelo os links ficam por baixo do nome.')).toBeInTheDocument()
  })
})

describe('CvWizardPage: the model and the PDF', () => {
  it('shows the CV of the person in four models and changes with a tap', async () => {
    await openWizard()
    await next(9)
    expect(question('Escolhe o modelo')).toBeInTheDocument()
    const models = screen.getAllByRole('button', { pressed: false })
    expect(models.length).toBeGreaterThanOrEqual(3)
    expect(screen.getByRole('button', { name: /Clássico/, pressed: true })).toBeInTheDocument()
    // Each model is the person's own CV, not a stand-in.
    expect(screen.getAllByText('Joana').length).toBeGreaterThanOrEqual(5)

    await userEvent.click(screen.getByRole('button', { name: /Moderno/ }))
    expect(getUser().cvs[0]!.template).toBe('moderno')
    expect(screen.getByRole('button', { name: /Moderno/, pressed: true })).toBeInTheDocument()
    // The content stays.
    expect(getUser().cvs[0]!.cv.name).toBe('Joana')
  })

  it('ends with the PDF, the business card and the full editor', async () => {
    const createObjectURL = vi.fn<(blob: Blob) => string>(() => 'blob:kaye')
    vi.stubGlobal(
      'URL',
      Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn<(url: string) => void>() }),
    )
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    await openWizard()
    await next(10)
    expect(question('O teu CV está pronto')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Continuar' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Fazer o cartão de visita' })).toHaveAttribute(
      'href',
      '/cv/cartao',
    )
    expect(screen.getByRole('link', { name: 'Editar tudo de uma vez' })).toHaveAttribute('href', '/cv/editar')

    await userEvent.click(screen.getByRole('button', { name: 'Descarregar PDF' }))
    await waitFor(() => expect(createObjectURL).toHaveBeenCalledTimes(1))
    expect(createObjectURL.mock.calls[0]?.[0].type).toBe('application/pdf')
  })

  it('works without a network: nothing is fetched while the person goes through the steps', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => Response.error())
    vi.stubGlobal('fetch', fetchMock)
    await openWizard()
    await next(10)
    expect(question('O teu CV está pronto')).toBeInTheDocument()
    // Only the CV fonts, which the app keeps on the device: no API and no outside site.
    const urls = fetchMock.mock.calls.map(([input]) => String(input))
    expect(urls.every((url) => url.startsWith('/fonts/cv/'))).toBe(true)
  })
})

describe('the CV studio', () => {
  it('starts a new CV in the step-by-step guide', async () => {
    seedUser()
    renderWithApp(<CvPage />)
    await userEvent.click(screen.getByRole('button', { name: 'Criar novo CV' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/cv/passo-a-passo')
    expect(getUser().cvs).toHaveLength(1)
  })
})
