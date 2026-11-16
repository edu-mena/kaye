import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../test/render'
import CompanyPage from './CompanyPage'

const open = (id: string) =>
  renderWithApp(<CompanyPage />, { route: `/empresas/${id}`, path: '/empresas/:id' })

describe('CompanyPage', () => {
  it('shows what it does, its programmes for young people and its contacts', async () => {
    open('bai')
    expect(await screen.findByRole('heading', { level: 1, name: 'Banco BAI' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Programas para jovens' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Programa de estágios' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Site oficial' })).toHaveAttribute(
      'href',
      'https://www.bancobai.ao',
    )
  })

  it('says whether a source names the careers it hires for, in the Profissões tab', async () => {
    open('bai?secao=profissoes')
    expect(await screen.findByText(/^Segundo uma fonte pública\./)).toBeInTheDocument()
    expect(await screen.findByRole('article', { name: 'Gestor de Clientes Bancário' })).toBeInTheDocument()

    open('sonangol?secao=profissoes')
    expect(
      await screen.findByText(/A nossa leitura do setor: ainda nenhuma fonte o confirma\./),
    ).toBeInTheDocument()
    expect(await screen.findByRole('article', { name: 'Analista de Dados' })).toBeInTheDocument()
  })

  it('links the academies it works with, and leaves out programmes it does not have', async () => {
    open('sonangol')
    expect(
      await screen.findByRole('link', { name: 'Instituto Superior Politécnico de Tecnologias e Ciências' }),
    ).toHaveAttribute('href', '/academias/isptec')
    expect(screen.queryByRole('heading', { name: 'Programas para jovens' })).not.toBeInTheDocument()
  })

  it('answers an unknown company with a way back', async () => {
    open('nao-existe')
    expect(await screen.findByRole('heading', { name: 'Empresa não encontrada' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Voltar às empresas/ })).toHaveAttribute('href', '/empresas')
  })
})
