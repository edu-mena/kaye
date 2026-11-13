import type { SupportProgram } from '../types'

/*
 * Real programmes that help a young Angolan start on their own (register a company, get a kit, credit, training or
 * incubation), checked on 5 November 2026 in official pages and Angolan news (Expansão, Ver Angola, Forbes África
 * Lusófona, MAPTSS). Only those with a 2025–2026 source; the discarded ones are in docs/recolha-de-dados.md.
 */

const CHECKED = '2026-11-05'

export const SUPPORT_PROGRAMS: SupportProgram[] = [
  {
    id: 'gue',
    name: 'Guiché Único da Empresa (GUE)',
    provider: 'Ministério da Justiça e dos Direitos Humanos',
    kind: 'registo',
    audience:
      'Quem quer criar empresa ou registar-se como empresário em nome individual, online ou num balcão',
    minAge: 18,
    url: 'https://www.gue.gov.ao',
    sources: [
      {
        label: 'Expansão (2026)',
        url: 'https://expansao.co.ao/empresas/detalhe/angolanos-criaram-mais-de-160-empresas-por-dia-no-i-trimestre-71554.html',
      },
      { label: 'Forbes África Lusófona (2025)', url: 'https://forbesafricalusofona.com/?p=154604' },
    ],
    checkedAt: CHECKED,
  },
  {
    id: 'inapem',
    name: 'Certificação e capacitação de MPME',
    provider: 'INAPEM',
    kind: 'formacao',
    audience: 'Micro, pequenas e médias empresas: certificado de MPME, formação e ligação a crédito bancário',
    url: 'https://www.inapem.gov.ao',
    sources: [
      {
        label: 'Ver Angola (04/2025)',
        url: 'https://www.verangola.net/va/pt/042025/Industria/44185/Já-são-conhecidas-as-empresas-vencedoras-da-1ª-edição-do-Prémio-Nacional-às-MPME.htm',
      },
      {
        label: 'Expansão',
        url: 'https://expansao.co.ao/empresas/detalhe/quase-metade-das-mpmes-certificadas-sao-do-comercio-71773.html',
      },
    ],
    checkedAt: CHECKED,
  },
  {
    id: 'empodera-ela',
    name: 'Empodera Ela',
    provider: 'INAPEM, com o Banco Atlântico (Crédito Mulher)',
    kind: 'formacao',
    audience: 'Mulheres empreendedoras: formação, formalização, apoio a startups e acesso a crédito',
    url: 'https://www.inapem.gov.ao',
    sources: [
      {
        label: 'Ver Angola (03/2026)',
        url: 'https://www.verangola.net/va/pt/032026/Industria/48217/‘Empodera-Ela’-projecto-de-empreendedorismo-feminino-vai-capacitar-3000-empreendedoras.htm',
      },
    ],
    checkedAt: CHECKED,
  },
  {
    id: 'jobe-inefop',
    name: 'JOBE: kits profissionais e microcrédito',
    provider: 'INEFOP (MAPTSS), com o Fundo Nacional de Emprego',
    kind: 'kit',
    audience: 'Jovens e mulheres, sobretudo quem acabou uma formação profissional do INEFOP',
    url: 'https://www.inefop.gov.ao',
    sources: [
      {
        label: 'MAPTSS (02/2025)',
        url: 'https://www.maptss.gov.ao/2025/02/08/cerca-de-2-000-cidadaos-vao-beneficiar-de-kits-profissionais-microcreditos-e-estagios-profissionais/',
      },
      {
        label: 'INEFOP',
        url: 'https://www.inefop.gov.ao/auth/informationDissemination-details/1bae4d71-6f74-429e-9875-b663f24a8b63',
      },
    ],
    checkedAt: CHECKED,
  },
  {
    id: 'facra',
    name: 'Capital de risco para startups e MPME',
    provider: 'FACRA (Fundo Activo de Capital de Risco Angolano)',
    kind: 'credito',
    audience: 'Startups e pequenas empresas com potencial de crescer; o fundo entra como sócio minoritário',
    minAge: 18,
    url: 'https://facra.gov.ao',
    sources: [
      {
        label: 'Ver Angola (01/2026)',
        url: 'https://www.verangola.net/va/pt/012026/Industria/47553/INAPEM-e-FACRA-juntam-se-para-facilitar-acesso-de-empresas-a-financiamento.htm',
      },
      { label: 'Forbes África Lusófona', url: 'https://forbesafricalusofona.com/?p=168112' },
    ],
    checkedAt: CHECKED,
  },
  {
    id: 'orange-corners-fundo',
    name: 'Fundo de Inovação Orange Corners',
    provider: 'Países Baixos, com a Development Workshop Angola e a KixiCrédito',
    kind: 'credito',
    audience:
      'Jovens empreendedores (Luanda, Bengo, Huíla, Namibe): subsídios e microcrédito até 5 milhões Kz',
    url: 'https://www.orangecorners.com/country/angola/',
    sources: [
      { label: 'Forbes África Lusófona (03/2026)', url: 'https://forbesafricalusofona.com/?p=169347' },
    ],
    checkedAt: CHECKED,
  },
  {
    id: 'orange-corners-acelera',
    name: 'Orange Corners Angola (incubação)',
    provider: 'Acelera Angola',
    kind: 'incubadora',
    audience: 'Jovens dos 18 aos 35 anos com uma ideia de negócio: formação, mentoria e incubação',
    minAge: 18,
    url: 'https://acelerangola.com',
    sources: [
      { label: 'Orange Corners', url: 'https://www.orangecorners.com/story-of-systematic-change/' },
      { label: 'Concours (2025)', url: 'https://concoursn.com/?p=428902' },
    ],
    checkedAt: CHECKED,
  },
  {
    id: 'sonajovem-spacium',
    name: 'Sonajovem 5.0: incubadora SPACIUM',
    provider: 'Sonangol, no ISPTEC (Luanda)',
    kind: 'incubadora',
    audience: 'Jovens com ideias selecionadas no Sonajovem: incubação no campus do ISPTEC',
    url: 'https://www.sonangol.co.ao/sonajovem-5-0-incubadora-em-funcionamento/',
    sources: [
      {
        label: 'Forbes África Lusófona (07/2025)',
        url: 'https://forbesafricalusofona.com/sonangol-inaugura-incubadora-para-acelerar-talentos-empreendedores-em-angola/',
      },
    ],
    checkedAt: CHECKED,
  },
]
