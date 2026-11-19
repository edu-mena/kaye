import type { SourceLink } from '../../data/types'

// The official pages and the news behind each step of "Trabalhar por conta própria" and "Do informal ao formal"
// (docs/recolha-de-dados.md, "Sem universidade"). The texts are in the locales; only the sources live here.

const GUE: SourceLink = { label: 'Guiché Único da Empresa', url: 'https://www.gue.gov.ao' }
const AGT: SourceLink = {
  label: 'Portal do Contribuinte (AGT)',
  url: 'https://portaldocontribuinte.minfin.gov.ao',
}
const PREI_2025: SourceLink = {
  label: 'Ver Angola (06/2025): Governo reestrutura o PREI',
  url: 'https://www.verangola.net/va/pt/062025/Economia/44945/Governo-reestrutura-programa-de-reconversão-da-economia-informal.htm',
}
const PREI_CREDIT: SourceLink = {
  label: 'Expansão: nova roupagem do PREI privilegia acesso ao crédito',
  url: 'https://expansao.co.ao/angola/detalhe/nova-roupagem-do-prei-privilegia-acesso-ao-credito-66825.html',
}
const INSS: SourceLink = {
  label: 'Decreto Presidencial n.º 110/22: protecção social de quem trabalha sem contrato (lex.ao)',
  url: 'https://lex.ao/docs/presidente-da-republica/2022/decreto-presidencial-n-o-110-22-de-12-de-maio/',
}
const INEFOP: SourceLink = { label: 'INEFOP', url: 'https://www.inefop.gov.ao' }
const JOBE: SourceLink = {
  label: 'MAPTSS (02/2025): kits profissionais e microcréditos',
  url: 'https://www.maptss.gov.ao/2025/02/08/cerca-de-2-000-cidadaos-vao-beneficiar-de-kits-profissionais-microcreditos-e-estagios-profissionais/',
}

/** Starting on one's own, in order. */
export const OWN_STEPS = [
  { key: 'learn', source: INEFOP },
  { key: 'kit', source: JOBE },
  { key: 'clients', source: INEFOP },
  { key: 'register', source: GUE },
  { key: 'credit', source: PREI_CREDIT },
]

/** Leaving the informal economy, in order. */
export const FORMAL_STEPS = [
  { key: 'bue', source: GUE },
  { key: 'prei', source: PREI_2025 },
  { key: 'nif', source: AGT },
  { key: 'bank', source: PREI_CREDIT },
  { key: 'inss', source: INSS },
]
