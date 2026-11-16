import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getUser } from '../../state/userStore'
import { renderWithApp } from '../../test/render'
import { seedUser } from '../../test/user'
import OnboardingPage from './OnboardingPage'

const year = new Date().getFullYear()
const SLOW = { timeout: 20000 }

const choose = async (name: string | RegExp) => userEvent.click(await screen.findByRole('button', { name }))
const proceed = () => userEvent.click(screen.getByRole('button', { name: 'Continuar' }))

/** The launch contact, asked right after the welcome: an email and the consent to keep it. */
async function leaveContact() {
  await userEvent.type(await screen.findByLabelText('Email'), 'edson@exemplo.ao')
  await userEvent.click(screen.getByLabelText(/Aceito que o Kayé guarde este contacto/))
  await proceed()
}

/** From the welcome to the first area, as someone looking for work. */
async function startConversation(situation = 'Procuro trabalho') {
  await choose('Vamos lá')
  await leaveContact()
  await screen.findByRole('heading', { name: 'Como queres que eu soe?' })
  await proceed()
  await choose(situation)
  await proceed()
  await choose('Escolher um curso')
  await proceed()
  await proceed()
}

/** The three questions of an area with more than one group, saying yes to the career. */
async function answerArea(level = 'Estudo isto') {
  const groups = await screen.findByRole('group')
  await userEvent.click(within(groups).getAllByRole('button')[0] as HTMLElement)
  await proceed()
  await choose(level)
  await proceed()
  await choose('Sim')
}

async function aboutYou(birthYear: number) {
  await userEvent.type(await screen.findByLabelText('Como te chamas?'), '  Edson  ')
  await proceed()
  await userEvent.selectOptions(await screen.findByLabelText('Ano em que nasceste'), String(birthYear))
  await userEvent.selectOptions(screen.getByLabelText('Província'), 'Huíla')
  await proceed()
  await choose('Licenciatura')
  await proceed()
}

const google = () => screen.findByRole('button', { name: 'Continuar com o Google' }, { timeout: 6000 })

/** The waiting list (apps/web/api/waitlist): answered as the server does. */
const waitlist = vi.fn<() => Promise<Response>>(async () => Response.json({ ok: true }))

beforeEach(() => {
  vi.stubGlobal('fetch', waitlist)
})

describe('OnboardingPage', () => {
  it('goes from the welcome to the plan, saving what the person said', SLOW, async () => {
    renderWithApp(<OnboardingPage />, { route: '/entrar' })
    expect(await screen.findByRole('heading', { name: 'Olá! Sou o Kayé.' })).toBeInTheDocument()

    await startConversation()
    await choose(/^Saúde/)
    await proceed()
    await answerArea()
    await aboutYou(year - 20)

    await userEvent.click(await google())
    expect(getUser().profile).toBeNull()
    await userEvent.click(screen.getByLabelText(/Aceito os termos/))
    await userEvent.click(await google())

    expect(
      await screen.findByRole('heading', { name: 'O teu plano, Edson' }, { timeout: 3000 }),
    ).toBeVisible()
    expect(screen.getByRole('link', { name: /Entrar no Kayé/ })).toHaveAttribute('href', '/novidades')
    expect(getUser().profile).toEqual({
      name: 'Edson',
      birthYear: year - 20,
      province: 'Huíla',
      education: 'licenciatura',
      guardianInformed: false,
    })
    expect(getUser().discovery).toMatchObject({ goal: 'course', areas: ['health'] })
    expect(getUser().savedCareers).toHaveLength(1)
  })

  it('asks for a launch contact before anything else, and sends it on', async () => {
    renderWithApp(<OnboardingPage />, { route: '/entrar' })
    await choose('Vamos lá')
    expect(
      await screen.findByRole('heading', { name: 'Antes de começarmos, como te avisamos do lançamento?' }),
    ).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('Email'), 'edson@exemplo.ao')
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled()

    await userEvent.click(screen.getByLabelText(/Aceito que o Kayé guarde este contacto/))
    await proceed()
    expect(await screen.findByRole('heading', { name: 'Como queres que eu soe?' })).toBeInTheDocument()
    expect(waitlist).toHaveBeenCalledOnce()
  })

  it('suggests the areas to who does not know which to choose', SLOW, async () => {
    renderWithApp(<OnboardingPage />, { route: '/entrar' })
    await startConversation()
    await choose('Ainda não sei')
    await proceed()
    await choose('Criar e imaginar')

    expect(await screen.findByText('Vamos ver estas áreas:')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeEnabled()
  })

  it('does not ask who is at school whether they work in the area', SLOW, async () => {
    renderWithApp(<OnboardingPage />, { route: '/entrar' })
    await startConversation('Estou no ensino secundário')
    await choose(/^Saúde/)
    await proceed()
    const groups = await screen.findByRole('group')
    await userEvent.click(within(groups).getAllByRole('button')[0] as HTMLElement)
    await proceed()

    expect(await screen.findByRole('button', { name: 'Estudo isto' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Já trabalho nisto' })).not.toBeInTheDocument()
  })

  it('stops a minor until they confirm that their guardian knows', SLOW, async () => {
    renderWithApp(<OnboardingPage />, { route: '/entrar' })
    await startConversation()
    await choose(/^Saúde/)
    await proceed()
    await answerArea()
    await aboutYou(year - 15)

    expect(await screen.findByText('Tens menos de 18 anos', {}, { timeout: 6000 })).toBeInTheDocument()
    await userEvent.click(screen.getByLabelText(/Aceito os termos/))
    await userEvent.click(await google())
    expect(screen.getByLabelText('O meu encarregado de educação sabe que uso o Kayé')).toBeInvalid()

    await userEvent.click(screen.getByLabelText('O meu encarregado de educação sabe que uso o Kayé'))
    await userEvent.click(await google())
    await screen.findByRole('heading', { name: 'O teu plano, Edson' }, { timeout: 3000 })
    expect(getUser().profile).toMatchObject({ guardianInformed: true })
  })

  it('leaves right away when there is already an account, but never outside the app', async () => {
    seedUser()
    renderWithApp(<OnboardingPage />, { route: '/entrar?next=%2Fcv%2Feditar', path: '/entrar' })
    expect(await screen.findByTestId('location')).toHaveTextContent('/cv/editar')
  })
})
