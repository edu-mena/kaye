import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { StatBlock } from '../../components/DetailLayout'
import { InterestGate } from '../../components/InterestGate'
import { CAREER_SUMMARIES } from '../../data/demo/careers'
import { GROUP_AREAS } from '../../data/types'
import { getUser } from '../../state/userStore'
import { renderWithApp } from '../../test/render'
import { seedUser } from '../../test/user'
import { listCompanies } from '../../data/source'
import CareersPage from '../careers/CareersPage'
import CompaniesPage from '../companies/CompaniesPage'
import CompanyPage from '../companies/CompanyPage'
import SearchPage from '../search/SearchPage'
import { InterestSettings } from '../settings/InterestSettings'

const careersIn = (area: 'health' | 'technology') =>
  CAREER_SUMMARIES.filter((career) => GROUP_AREAS[career.group] === area).length

const COMPANIES = await listCompanies()

describe('a list shows what has to do with the person', () => {
  it('hides what has no relation, says so, and shows everything on "Ver outras áreas" for this list only', async () => {
    seedUser({ interestAreas: ['health'] })
    renderWithApp(<CareersPage />)

    expect(
      await screen.findByText(`${careersIn('health')} profissões`, { selector: 'output' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/^A mostrar o que tem a ver contigo\./)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Analista de Cibersegurança/ })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Ver outras áreas' }))
    expect(
      screen.getByText(`${CAREER_SUMMARIES.length} profissões`, { selector: 'output' }),
    ).toBeInTheDocument()
    expect(screen.getByText('A mostrar tudo, também as outras áreas.')).toBeInTheDocument()
    // Remembered for this list only.
    expect(localStorage.getItem('kaye.others.careers')).toBe('1')
    expect(localStorage.getItem('kaye.others.companies')).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: 'Só o que tem a ver comigo' }))
    expect(localStorage.getItem('kaye.others.careers')).toBe('0')
  })

  it('does not hide an area the person chose in the list itself', async () => {
    seedUser({ interestAreas: ['health'] })
    renderWithApp(<CareersPage />, { route: '/carreiras?area=desenvolvimento' })
    expect(await screen.findAllByRole('link', { name: /Desenvolvedor/ })).not.toHaveLength(0)
  })

  it('shows every company before the person has any area, with no notice', async () => {
    renderWithApp(<CompaniesPage />)
    expect(await screen.findByRole('heading', { name: 'Todas as empresas' })).toBeInTheDocument()
    expect(screen.queryByText(/A mostrar o que tem a ver contigo/)).not.toBeInTheDocument()
  })

  it('hides the companies of other areas and keeps a saved one', async () => {
    const outside = COMPANIES.filter(
      (company) => !company.areas.some((group) => GROUP_AREAS[group] === 'health'),
    )
    expect(outside.length).toBeGreaterThan(1)
    const [saved, other] = outside
    seedUser({ interestAreas: ['health'], savedCompanies: [saved!.id] })
    renderWithApp(<CompaniesPage />)

    const inArea = COMPANIES.filter(
      (company) => company.areas.some((group) => GROUP_AREAS[group] === 'health') || company.id === saved!.id,
    )
    expect(await screen.findByText(`${inArea.length} empresas`, { selector: 'output' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: other!.name })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Ver outras áreas' }))
    expect(screen.getByText(`${COMPANIES.length} empresas`, { selector: 'output' })).toBeInTheDocument()
  })
})

describe('search finds everything but marks what is outside the areas', () => {
  it('puts the relevant first and marks the rest "Fora das tuas áreas"', async () => {
    seedUser({ interestAreas: ['health'] })
    renderWithApp(<SearchPage />, { route: '/pesquisa?q=dados' })
    const careers = await screen.findByRole('region', { name: /Profissões|Carreiras/ })
    expect(within(careers).getAllByText('Fora das tuas áreas').length).toBeGreaterThan(0)
    // Nothing was hidden: the career of the other area is there.
    expect(within(careers).getByRole('link', { name: /Analista de Dados/ })).toBeInTheDocument()
  })

  it('marks nothing when the result is in the person’s area', async () => {
    seedUser({ interestAreas: ['technology'] })
    renderWithApp(<SearchPage />, { route: '/pesquisa?q=dados&tipo=carreiras' })
    expect(await screen.findByRole('link', { name: /Analista de Dados/ })).toBeInTheDocument()
    expect(screen.queryByText('Fora das tuas áreas')).not.toBeInTheDocument()
  })

  it('marks nothing without a profile', async () => {
    renderWithApp(<SearchPage />, { route: '/pesquisa?q=dados' })
    expect(await screen.findByText(/resultados? para/)).toBeInTheDocument()
    expect(screen.queryByText('Fora das tuas áreas')).not.toBeInTheDocument()
  })
})

describe('the question at the entrance', () => {
  it('asks the areas on one screen and keeps the choice', async () => {
    renderWithApp(<InterestGate />)
    expect(screen.getByRole('dialog', { name: 'Que áreas te interessam?' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: 'Saúde' }))
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(getUser().interestAreas).toEqual(['health'])
  })

  it('"Saltar" keeps everything visible and is not asked again', async () => {
    renderWithApp(<InterestGate />)
    await userEvent.click(screen.getByRole('button', { name: 'Saltar' }))
    expect(getUser().interestAreas).toEqual([])
  })

  it('does not ask whoever answered before', () => {
    seedUser({ interestAreas: [] })
    renderWithApp(<InterestGate />)
    expect(screen.queryByRole('dialog', { name: 'Que áreas te interessam?' })).not.toBeInTheDocument()
  })
})

describe('the interest profile in the settings', () => {
  it('shows the areas chosen and edits them', async () => {
    seedUser({ interestAreas: ['health'] })
    renderWithApp(<InterestSettings />)
    expect(screen.getByRole('button', { name: 'Saúde', pressed: true })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Direito' }))
    expect(getUser().interestAreas).toEqual(['health', 'legal'])
    await userEvent.click(screen.getByRole('button', { name: 'Saúde' }))
    expect(getUser().interestAreas).toEqual(['legal'])
  })
})

describe('the company page', () => {
  it('shows the quotes of its leaders with who, when and where', async () => {
    renderWithApp(<CompanyPage />, { route: '/empresas/bai', path: '/empresas/:id' })
    expect(await screen.findByRole('heading', { name: 'Os líderes disseram' })).toBeInTheDocument()
    expect(
      screen.getByText(/Os líderes do futuro não podem descurar as competências técnicas/),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Forbes África Lusófona/ })).toBeInTheDocument()
  })

  it('shows no quotes block for a company with none', async () => {
    renderWithApp(<CompanyPage />, { route: '/empresas/bfa', path: '/empresas/:id' })
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Os líderes disseram' })).not.toBeInTheDocument()
  })
})

describe('an empty field', () => {
  it('says "Perfil em construção", never a bare dash', () => {
    renderWithApp(
      <StatBlock
        items={[
          { label: 'Sede', value: '' },
          { label: 'Fundação', value: '—' },
          { label: 'Setor', value: 'Banca' },
        ]}
      />,
    )
    expect(screen.getAllByText('Perfil em construção')).toHaveLength(2)
    expect(screen.queryByText('—')).not.toBeInTheDocument()
    expect(screen.getByText('Banca')).toBeInTheDocument()
  })
})
