import catalog from '../catalog/sciences.json'
import { buildArea, type AreaData } from './areaCatalog'
import { CAREER_SUMMARIES } from './careers'

// Languages, communication and the arts, and the natural and exact sciences, from scrapers/catalog/sciences.json
// (python -m catalog.sciences): every higher education institution with the area's courses (MESCTI yearbook
// 2023-2024), the training of journalists, and the employers: the public media and the State's culture, media and
// science bodies, each with its source.

const SUMMARIES: Record<string, string> = {
  televisao:
    'A televisão pública: notícias, programas e desporto em vários canais, com jornalistas, realizadores e técnicos.',
  radio: 'A rádio pública, com emissoras nas províncias e programas nas línguas nacionais.',
  agencia:
    'A agência noticiosa do Estado: escreve as notícias que os jornais, as rádios e as televisões usam.',
  jornal:
    'O diário público, das Edições Novembro, que publicam também jornais de desporto, economia e cultura.',
  regulador:
    'Regula e fiscaliza a comunicação social: os jornais, as rádios, as televisões e os sites de notícias.',
  comunicacao_social:
    'Tutela a comunicação social, as telecomunicações e as tecnologias, com os órgãos públicos e o centro de formação de jornalistas.',
  cultura: 'As políticas da cultura: o património, os museus, as artes e o livro.',
  ciencia:
    'Tutela o ensino superior e a investigação científica: as universidades públicas, as bolsas de estudo e os centros de investigação.',
  investigacao_cientifica:
    'O centro de investigação do Estado, com laboratórios de química, biotecnologia, biomedicina e materiais.',
  espacial:
    'Gere o programa espacial e o satélite AngoSat-2, com imagens de satélite para mapas, agricultura e ambiente.',
  biodiversidade: 'Gere os parques e as reservas naturais e acompanha a fauna e a flora do país.',
}

export const SCIENCES = buildArea(catalog as AreaData, {
  // Design, Sistemas de Informação, Comércio Internacional and Línguas e Administração also lead to technology's
  // and business's careers.
  careers: CAREER_SUMMARIES,
  courses: 'línguas, comunicação, artes, ciências e desporto',
  courseCareers: [
    // Before /fisica/: "Educação Física e Desporto".
    [
      /desporto|deporto/,
      ['professor-de-educacao-fisica', 'treinador-desportivo', 'preparador-fisico', 'gestor-desportivo'],
    ],
    [/hidraulica/, ['tecnico-de-recursos-hidricos']],
    [/navegacao/, ['oficial-da-marinha-mercante']],
    [
      /sistemas de informacao/,
      ['analista-de-sistemas', 'administrador-de-sistemas', 'desenvolvedor-backend'],
    ],
    [
      /comercio internacional/,
      ['tecnico-de-comercio-internacional', 'tecnico-comercial', 'tecnico-de-compras'],
    ],
    [/comunicacao social e imagem/, ['editor-de-video', 'jornalista', 'gestor-de-redes-sociais']],
    [/comunicacao empresarial/, ['assessor-de-comunicacao', 'tecnico-de-relacoes-publicas', 'tradutor']],
    [/lingua portuguesa e comunicacao/, ['revisor-de-textos', 'jornalista', 'assessor-de-comunicacao']],
    [
      /comunicacao|jornalismo/,
      ['jornalista', 'assessor-de-comunicacao', 'tecnico-de-relacoes-publicas', 'gestor-de-redes-sociais'],
    ],
    [/linguas e administracao/, ['tradutor', 'interprete', 'secretario-executivo']],
    [/africanas/, ['linguista', 'revisor-de-textos']],
    [/lingua portuguesa/, ['revisor-de-textos', 'linguista', 'jornalista']],
    [/lingua/, ['tradutor', 'interprete', 'linguista']],
    [/cinema/, ['realizador', 'editor-de-video']],
    [/teatro/, ['actor', 'gestor-cultural']],
    [/musica/, ['musico', 'gestor-cultural']],
    [/artes visuais|desenho/, ['artista-plastico', 'designer-grafico', 'gestor-cultural']],
    [/moda/, ['designer-de-moda']],
    [/design/, ['designer-grafico', 'designer-ui-ux']],
    [/biotecnologia/, ['biotecnologo', 'investigador-cientifico']],
    [/biolog/, ['biologo', 'tecnico-de-conservacao-da-natureza', 'investigador-cientifico']],
    [/oceanografia/, ['oceanografo', 'investigador-cientifico']],
    [/meteorologia|metereologia/, ['meteorologista']],
    [/alimentos/, ['tecnico-de-qualidade-alimentar', 'quimico']],
    [/quimica/, ['quimico', 'investigador-cientifico']],
    [/fisica/, ['fisico', 'meteorologista', 'investigador-cientifico']],
    [/matematica/, ['matematico', 'estatistico', 'investigador-cientifico']],
    [/estatistica/, ['estatistico']],
  ],
  employs: [
    [/televisao/, ['jornalista', 'realizador', 'editor-de-video']],
    [/radio|angola press|jornal de angola/, ['jornalista', 'revisor-de-textos', 'editor-de-video']],
    [/reguladora/, ['assessor-de-comunicacao', 'jornalista']],
    [
      /ministerio das telecomunicacoes/,
      ['assessor-de-comunicacao', 'tecnico-de-relacoes-publicas', 'jornalista'],
    ],
    [/cultura/, ['gestor-cultural', 'artista-plastico', 'musico', 'linguista']],
    [/ensino superior/, ['investigador-cientifico', 'estatistico']],
    [/investigacao cientifica/, ['investigador-cientifico', 'quimico', 'biotecnologo', 'biologo']],
    [/espacial/, ['fisico', 'matematico', 'investigador-cientifico']],
    [/biodiversidade/, ['tecnico-de-conservacao-da-natureza', 'biologo']],
  ],
  fallback: ['jornalista'],
  sector: 'comunicacao',
  source: catalog.sources.education,
  describe: (employer) => SUMMARIES[employer.kind] ?? '',
})
