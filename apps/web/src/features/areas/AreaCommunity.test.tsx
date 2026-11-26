import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Membership } from '../../data/account'
import type { AccountState } from '../../state/accountSync'
import { renderWithApp } from '../../test/render'
import { AreaCommunity } from './AreaCommunity'

const mocks = vi.hoisted(() => ({
  count: null as number | null,
  membership: { level: null, pioneerNumber: null } as Membership,
  account: { status: 'signedIn', me: { consents: [], minor: false } } as unknown as AccountState,
  setMembership: vi.fn<(area: string, level: string) => Promise<Membership>>(),
  giveConsent: vi.fn<(kind: string) => Promise<unknown>>(),
}))

vi.mock('../../data/account', async (original) => ({
  ...(await original<typeof import('../../data/account')>()),
  ACCOUNTS: true,
  getCommunityCount: () => Promise.resolve(mocks.count),
  getMembership: () => Promise.resolve(mocks.membership),
  setMembership: mocks.setMembership,
  giveConsent: mocks.giveConsent,
}))
vi.mock('../../state/accountSync', () => ({
  useAccount: () => mocks.account,
  beginSignIn: vi.fn<(next?: string) => void>(),
}))

beforeEach(() => {
  mocks.count = null
  mocks.membership = { level: null, pioneerNumber: null }
  mocks.account = { status: 'signedIn', me: { consents: [], minor: false } } as unknown as AccountState
  mocks.setMembership.mockReset()
  mocks.giveConsent.mockReset().mockResolvedValue({})
})

describe('AreaCommunity', () => {
  it('says the community is being born under 50, with no number', async () => {
    renderWithApp(<AreaCommunity area="business" />)
    expect(await screen.findByText('A comunidade está a nascer.')).toBeInTheDocument()
    expect(screen.queryByText(/pessoas na comunidade/)).not.toBeInTheDocument()
    expect(screen.getByText('É o que tu dizes: o Kayé não verifica.')).toBeInTheDocument()
  })

  it('shows the count once the server gives one', async () => {
    mocks.count = 73
    renderWithApp(<AreaCommunity area="business" />)
    expect(await screen.findByText(/73 pessoas na comunidade de/)).toBeInTheDocument()
  })

  it('asks the level, then shows the pioneer seal the server gives', async () => {
    mocks.setMembership.mockResolvedValue({ level: 'graduate', pioneerNumber: 4 })
    renderWithApp(<AreaCommunity area="business" />)
    await userEvent.click(await screen.findByRole('radio', { name: 'Licenciado' }))
    expect(mocks.setMembership).toHaveBeenCalledWith('business', 'graduate')
    expect(await screen.findByText(/Pioneiro #4 · /)).toBeInTheDocument()
    expect(screen.queryByText(/Primeiro/)).not.toBeInTheDocument()
  })

  it('counts the person only after their own consent', async () => {
    mocks.membership = { level: 'student', pioneerNumber: null }
    renderWithApp(<AreaCommunity area="business" />)
    await userEvent.click(await screen.findByRole('checkbox'))
    expect(mocks.giveConsent).toHaveBeenCalledWith('community_count', expect.any(String))
  })

  it('shows no seal without a number and warns when saving fails', async () => {
    mocks.setMembership.mockRejectedValue(new Error('x'))
    renderWithApp(<AreaCommunity area="business" />)
    await userEvent.click(await screen.findByRole('radio', { name: 'Estudante' }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    expect(screen.queryByText(/Pioneiro/)).not.toBeInTheDocument()
  })

  it('asks to sign in when there is no session, and a minor can only be a student', async () => {
    mocks.account = { status: 'signedOut', me: null } as unknown as AccountState
    const first = renderWithApp(<AreaCommunity area="business" />)
    expect(
      await screen.findByRole('button', { name: 'Entra para dizer como te identificas' }),
    ).toBeInTheDocument()
    first.unmount()

    mocks.account = { status: 'signedIn', me: { consents: [], minor: true } } as unknown as AccountState
    renderWithApp(<AreaCommunity area="business" />)
    expect(await screen.findByRole('radio', { name: 'Profissional' })).toBeDisabled()
    expect(screen.getByRole('radio', { name: 'Estudante' })).toBeEnabled()
  })
})
