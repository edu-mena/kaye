import type { Academy, SourceLink } from '../types'

// Contacts and identity of the institutions, by their id, from what each one published (its site, its official
// Facebook or LinkedIn) or a decree. Never guessed: a phone, an email or an address no source shows stays empty
// (docs/recolha-de-dados.md, "Contactos").

type Entry = Pick<
  Academy,
  'website' | 'phone' | 'email' | 'address' | 'social' | 'founded' | 'recognizedBy'
> & {
  /** Confirms an ownership the catalogue had as "por confirmar". */
  ownership?: 'publica' | 'privada'
  /** When it was checked (ISO date). */
  checkedAt: string
  sources: SourceLink[]
}

const CHECKED = '2026-11-13'

const site = (label: string, url: string): SourceLink => ({
  label: `${label}, site oficial (13/11/2026)`,
  url,
})
const angolex = (label: string, path: string): SourceLink => ({
  label: `Decreto ${label} (angolex)`,
  url: `https://angolex.com/paginas/${path}.html`,
})
const MESCTI = 'MESCTI (Ministério do Ensino Superior)'

/** Created by the decree that authorised it: the year and the recognition come from the same text. */
const byDecree = (year: number, source: SourceLink): Pick<Entry, 'founded' | 'recognizedBy'> => ({
  founded: { year, source },
  recognizedBy: { name: MESCTI, source },
})

const DECREE_168_12 = angolex(
  'Presidencial 168/12',
  'decreto-presidencial/autoriza-a-criacao-de-varias-instituicoes-do-ensino-superior-privado-168a-12a',
)
const DECREE_173_17: SourceLink = {
  label: 'Decreto Presidencial 173/17 (lex.ao)',
  url: 'https://lex.ao/docs/presidente-da-republica/2017/decreto-presidencial-n-o-173-17-de-03-de-agosto/',
}

const ISPTEC_SITE = site('ISPTEC', 'https://isptec.co.ao')
const UCAN_SITE = site('UCAN', 'https://www.ucan.co.ao')
const BELAS_SITE = site('Unibelas', 'https://unibelas.online')

const ACADEMY_CONTACTS: Record<string, Entry> = {
  uan: {
    phone: '+244 924 535 230',
    social: {
      facebook: 'https://www.facebook.com/people/Universidade-Agostinho-Neto/61554389360659/',
      linkedin: 'https://www.linkedin.com/school/universidade-agostinho-neto/',
    },
    checkedAt: CHECKED,
    sources: [site('UAN', 'https://uan.ao')],
  },
  isptec: {
    phone: '+244 226 690 323',
    email: 'geral@isptec.co.ao',
    address: 'Av. Luanda Sul, Rua Lateral Via S10, Talatona, Luanda',
    social: {
      facebook: 'https://www.facebook.com/IsptecAngola',
      instagram: 'https://www.instagram.com/isptec_angola/',
      linkedin: 'https://www.linkedin.com/company/isptec/',
    },
    ...byDecree(
      2011,
      angolex(
        'Executivo 111/11',
        'decreto-executivo/autoriza-a-empresa-pessoas-desenvolvimento-e-associados-a-criar-o-isptec-111a-11a',
      ),
    ),
    checkedAt: CHECKED,
    sources: [ISPTEC_SITE],
  },
  ucan: {
    phone: '+244 926 957 767',
    social: {
      facebook: 'https://www.facebook.com/share/17yfLaCVUW/',
      instagram: 'https://www.instagram.com/univ_catolica_de_angola/',
      linkedin: 'https://www.linkedin.com/in/universidade-cat%C3%B3lica-de-angola-ucan-56a99b100',
    },
    founded: { year: 1999, source: UCAN_SITE },
    checkedAt: CHECKED,
    sources: [UCAN_SITE],
  },
  uma: {
    address: 'Rua Reverendo Agostinho Pedro Neto, esquina com Nossa Senhora da Muxima, Kinaxixi, Luanda',
    checkedAt: CHECKED,
    sources: [site('UMA', 'https://universidademetodista.ao')],
  },
  itel: {
    phone: '+244 222 381 640',
    email: 'geral@itel.gov.ao',
    address: 'Bairro CTT, Km 7, Rangel, Luanda',
    social: {
      facebook: 'https://www.facebook.com/institutodetelecomunicacoes.Itel/',
      instagram: 'https://www.instagram.com/itel_angola/',
    },
    checkedAt: CHECKED,
    sources: [site('ITEL', 'https://itel.gov.ao')],
  },
  isutic: {
    website: 'https://instic.uniluanda.ao',
    phone: '+244 222 041 728',
    email: 'instic2020@gmail.com',
    address: 'Bairro dos CTT, Km 7, Rangel, Luanda',
    social: { facebook: 'https://www.facebook.com/ISUTIC2020' },
    checkedAt: CHECKED,
    sources: [site('INSTIC', 'https://instic.uniluanda.ao')],
  },
  'universidade-de-luanda': {
    website: 'https://uniluanda.ao',
    phone: '+244 940 112 732',
    email: 'universidadedeluanda@gmail.com',
    address: 'Rua Direita da Sapu, Camama, Luanda',
    social: { facebook: 'https://www.facebook.com/uniluanda/' },
    checkedAt: CHECKED,
    sources: [site('Universidade de Luanda', 'https://uniluanda.ao')],
  },
  'universidade-independente-de-angola': {
    website: 'https://unia.ao',
    phone: '+244 930 225 361',
    address: 'Morro Bento, Luanda',
    social: {
      facebook: 'https://www.facebook.com/profile.php?id=61564106889773',
      instagram: 'https://www.instagram.com/unia_oficial/',
      linkedin: 'https://www.linkedin.com/company/universidade-independente-de-angola',
    },
    checkedAt: CHECKED,
    sources: [site('UNIA', 'https://unia.ao')],
  },
  'universidade-de-belas': {
    website: 'https://unibelas.online',
    phone: '+244 927 217 253',
    email: 'geral@unibelas.online',
    address: 'Av. Fidel de Castro (Via Expressa), Benfica-Kilamba, Luanda',
    social: {
      facebook: 'https://www.facebook.com/universidade.unibelas/',
      linkedin: 'https://www.linkedin.com/company/unibelas2007/',
    },
    founded: { year: 2007, source: BELAS_SITE },
    checkedAt: CHECKED,
    sources: [BELAS_SITE],
  },
  'escola-42-luanda': {
    phone: '+244 936 051 579',
    email: 'info@42luanda.com',
    address:
      'ISPTEC, Edifício dos Laboratórios Profissionalizantes, Piso 2, Av. Luanda Sul, Talatona, Luanda',
    social: {
      facebook: 'https://www.facebook.com/42luanda/',
      instagram: 'https://www.instagram.com/42luanda/',
      linkedin: 'https://www.linkedin.com/school/42luanda/',
    },
    checkedAt: CHECKED,
    sources: [site('42 Luanda', 'https://42luanda.com')],
  },
  'universidades-jean-piaget': {
    website: 'https://unipiaget-angola.org',
    phone: '+244 929 815 107',
    email: 'info@unipiaget-angola.org',
    address: 'Bairro Capalanca, Viana, Luanda',
    social: {
      facebook: 'https://www.facebook.com/unipiagetAngola/',
      instagram: 'https://www.instagram.com/unipiaget',
      linkedin: 'https://www.linkedin.com/company/universidade-jean-piaget-de-angola/',
    },
    ...byDecree(
      2001,
      angolex('Presidencial 44/01', 'decreto-presidencial/cria-universidade-jean-piaget-angola-44a-01a'),
    ),
    checkedAt: CHECKED,
    sources: [site('Universidade Jean Piaget', 'https://unipiaget-angola.org')],
  },
  'instituto-superior-politecnico-kalandula-de-angola': {
    website: 'https://ispeka.ao',
    social: { facebook: 'https://www.facebook.com/KAlandul/' },
    ...byDecree(2012, DECREE_168_12),
    checkedAt: CHECKED,
    sources: [site('ISPEKA', 'https://ispeka.ao')],
  },
  'instituto-superior-politecnico-internacional-de-angola': {
    ...byDecree(2012, DECREE_168_12),
    checkedAt: CHECKED,
    sources: [],
  },
  'instituto-superior-politecnico-intercontinental-de-luanda': {
    ...byDecree(2017, DECREE_173_17),
    checkedAt: CHECKED,
    sources: [],
  },
  'instituto-superior-politecnico-privado-do-kilamba': {
    ...byDecree(2017, DECREE_173_17),
    checkedAt: CHECKED,
    sources: [],
  },
  utanga: {
    ...byDecree(
      2007,
      angolex(
        'Presidencial 29/07',
        'decreto-presidencial/autoriza-a-empresa-sapanguele-a-abrir-a-universidade-tecnica-de-angola-29a-07a',
      ),
    ),
    checkedAt: CHECKED,
    sources: [],
  },
  'universidade-privada-de-angola': {
    ...byDecree(
      2007,
      angolex(
        'Presidencial 28/07',
        'decreto-presidencial/autoriza-a-empresa-crea-a-abrir-a-universidade-privada-de-angola-28a-07a',
      ),
    ),
    checkedAt: CHECKED,
    sources: [],
  },
  'universidade-gregorio-semedo': {
    ...byDecree(
      2007,
      angolex(
        'Presidencial 23/07',
        'decreto-presidencial/autoriza-a-empresa-intelectus-a-abrir-a-universidade-gregorio-semedo-23a-07a',
      ),
    ),
    checkedAt: CHECKED,
    sources: [],
  },
  'escola-de-formacao-de-tecnicos-de-saude-de-luanda': {
    phone: '+244 2 357879',
    address: 'Rua da Samba, 13, Maianga, Luanda',
    checkedAt: CHECKED,
    sources: [],
  },
}

/** A Google Maps search for the name: it finds the place without coordinates of our own. */
const mapsSearch = (academy: Academy) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${academy.name}, ${academy.province}, Angola`)}`

/** Each academy with its contacts, its confirmed ownership and the sources of both; the map for every place. */
export function withContacts(academies: Academy[]): Academy[] {
  return academies.map((academy) => {
    const mapsUrl = academy.type === 'online' ? undefined : mapsSearch(academy)
    const entry = ACADEMY_CONTACTS[academy.id]
    const base = mapsUrl ? { ...academy, mapsUrl } : academy
    if (!entry) return base
    const { sources, ownership, ...facts } = entry
    const known = new Set(academy.sources.map((source) => source.url))
    const extra = [
      ...sources,
      ...[facts.founded?.source, facts.recognizedBy?.source].filter((s) => s !== undefined),
    ]
    return {
      ...base,
      ...facts,
      ownership: academy.ownership ?? ownership ?? null,
      sources: [
        ...academy.sources,
        ...extra.filter(
          (source, i) => !known.has(source.url) && extra.findIndex((o) => o.url === source.url) === i,
        ),
      ],
    }
  })
}
