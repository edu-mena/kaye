import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../test/render'
import CompanyPage from './CompanyPage'

const open = (id: string) =>
  renderWithApp(<CompanyPage />, { route: `/empresas/${id}`, path: '/empresas/:id' })

describe('CompanyPage', () => {
  it('shows what a source confirms, the careers it hires for and what is still to come', async () => {
    open('bai')
    expect(await screen.findByRole('heading', { level: 1, name: 'Banco BAI' })).toBeInTheDocument()
    expect(screen.getByText('A nossa leitura do setor: ainda nenhuma fonte o confirma.')).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Analista de Sistemas e Negócio' })).toHaveAttribute(
      'href',
      '/carreiras/analista-de-sistemas',
    )
    expect(screen.getByRole('heading', { name: 'Programa de estágios' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Site oficial' })).toHaveAttribute(
      'href',
      'https://www.bancobai.ao',
    )
    expect(screen.getAllByText('Em breve')).toHaveLength(3)
  })

  it('says when a source names the careers, and links the academies it works with', async () => {
    open('sonangol')
    expect(await screen.findByRole('link', { name: 'ISPTEC' })).toHaveAttribute('href', '/academias/isptec')
    expect(screen.queryByRole('heading', { name: 'Programas para jovens' })).not.toBeInTheDocument()

    open('africell')
    expect(await screen.findByText('Segundo uma fonte pública.')).toBeInTheDocument()
  })

  it('answers an unknown company with a way back', async () => {
    open('nao-existe')
    expect(await screen.findByRole('heading', { name: 'Empresa não encontrada' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Voltar às empresas/ })).toHaveAttribute('href', '/empresas')
  })
})
