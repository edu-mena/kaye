import type { Company } from '../types'

// The official site and own social pages of each company, read from the site itself on 20/11/2026
// (docs/recolha-de-dados.md, "Empresas"). Group pages of multinationals are left out of the socials.
export const LINKS: Record<string, Pick<Company, 'website' | 'socials'>> = {
  'agencia-angolana-de-regulacao-e-supervisao-de-seguros-arseg': {
    website: 'https://www.arseg.ao',
    socials: {
      facebook: 'https://www.facebook.com/arseg.ao',
      instagram: 'https://www.instagram.com/arseg_ao',
      linkedin: 'https://www.linkedin.com/company/arseg',
    },
  },
  'agencia-nacional-de-petroleo-gas-e-biocombustiveis-anpg': {
    website: 'https://anpg.co.ao',
    socials: {
      facebook: 'https://www.facebook.com/ANPGAngola',
      linkedin: 'https://www.linkedin.com/company/anpg-angola',
    },
  },
  'angola-lng': { website: 'https://www.angolalng.com' },
  'assembleia-nacional': { website: 'https://www.parlamento.ao' },
  'azule-energy': {
    website: 'https://www.azule-energy.com',
    socials: {
      instagram: 'https://www.instagram.com/azuleenergy',
      linkedin: 'https://www.linkedin.com/company/86585154',
    },
  },
  'banco-de-poupanca-e-credito-bpc': {
    website: 'https://www.bpc.ao',
    socials: {
      facebook: 'https://facebook.com/share/j2n7NZqDA2sDYqeJ',
      instagram: 'https://www.instagram.com/bancobpc.ao',
    },
  },
  'banco-nacional-de-angola-bna': { website: 'https://www.bna.ao' },
  'banco-sol': {
    website: 'https://www.bancosol.ao',
    socials: {
      facebook: 'https://www.facebook.com/profile.php?id=61592801581079',
      instagram: 'https://www.instagram.com/bancosol.angola',
      linkedin: 'https://www.linkedin.com/company/bancosol',
    },
  },
  bci: { website: 'https://www.bci.ao' },
  'bolsa-de-divida-e-valores-de-angola-bodiva': { website: 'https://www.bodiva.ao' },
  'clinica-girassol': {
    website: 'https://clinicagirassol.co.ao',
    socials: { instagram: 'https://www.instagram.com/clinicagirassol.saude' },
  },
  'clinica-multiperfil': { website: 'https://www.multiperfil.co.ao' },
  'clinica-sagrada-esperanca': {
    website: 'https://clinicasagradaesperanca.co.ao',
    socials: {
      facebook: 'https://facebook.com/clinicasagradaesperanca',
      instagram: 'https://www.instagram.com/clinicasagradaesperanca.ao',
      linkedin: 'https://linkedin.com/company/clinicasagradaesperanca',
    },
  },
  'comissao-nacional-eleitoral-cne': {
    website: 'https://www.cne.ao',
    socials: {
      facebook: 'https://www.facebook.com/CNE.AO',
      instagram: 'https://www.instagram.com/cne_angola',
    },
  },
  'dp-world-luanda': { website: 'https://www.dpworld.com/en/about-us/our-locations/angola' },
  emis: {
    website: 'https://emis.ao',
    socials: { linkedin: 'https://www.linkedin.com/company/emis---empresa-interbanc-ria-de-servi-os' },
  },
  endiama: { website: 'https://www.endiama.co.ao' },
  'ensa-seguros': {
    website: 'https://www.ensa.co.ao',
    socials: {
      facebook: 'https://www.facebook.com/ENSASegurosAngola',
      instagram: 'https://www.instagram.com/ensasegurosdeangola',
      linkedin: 'https://www.linkedin.com/company/ensasegurosangola',
    },
  },
  'ensis-angola': { website: 'https://www.ensis.co.ao' },
  'grupo-omatapalo': {
    website: 'https://www.omatapalo.com',
    socials: {
      facebook: 'https://www.facebook.com/grupoomatapalo',
      instagram: 'https://www.instagram.com/grupoomatapalo',
      linkedin: 'https://www.linkedin.com/company/grupo-omatapalo',
    },
  },
  'instituto-nacional-de-emprego-e-formacao-profissional-inefop': { website: 'https://www.inefop.gov.ao' },
  'instituto-nacional-de-estatistica-ine': {
    website: 'https://www.ine.gov.ao',
    socials: {
      facebook: 'https://www.facebook.com/INE-Angola-917797135010576',
      instagram: 'https://www.instagram.com/ine_angola',
    },
  },
  'jornal-de-angola-edicoes-novembro': { website: 'https://jornaldeangola.ao' },
  'kpmg-angola': {
    website: 'https://kpmg.com/ao',
    socials: { linkedin: 'https://www.linkedin.com/company/kpmg-angola' },
  },
  'minea-reclima': {
    website: 'https://minea.gov.ao',
    socials: { instagram: 'https://www.instagram.com/minea_angola' },
  },
  'ministerio-da-accao-social-familia-e-promocao-da-mulher-masfamu': {
    website: 'https://masfamu.gov.ao',
    socials: { facebook: 'https://www.facebook.com/masfamu' },
  },
  'ministerio-da-administracao-do-territorio-mat': {
    website: 'https://mat.gov.ao',
    socials: { instagram: 'https://www.instagram.com/mat_gov_ao' },
  },
  'ministerio-da-agricultura-e-florestas-minagrif': {
    website: 'https://minagrif.gov.ao',
    socials: { instagram: 'https://www.instagram.com/minagrif_gov_ao' },
  },
  'ministerio-da-cultura': {
    website: 'https://mincult.gov.ao',
    socials: { instagram: 'https://www.instagram.com/mincult.gov.ao' },
  },
  'ministerio-da-educacao-med': {
    website: 'https://med.gov.ao',
    socials: { instagram: 'https://www.instagram.com/med.gov.ao' },
  },
  'ministerio-da-energia-e-aguas-minea': {
    website: 'https://minea.gov.ao',
    socials: { instagram: 'https://www.instagram.com/minea_angola' },
  },
  'ministerio-da-justica-e-dos-direitos-humanos': {
    website: 'https://minjusdh.gov.ao',
    socials: { instagram: 'https://www.instagram.com/minjusdh_angola' },
  },
  'ministerio-das-financas': { website: 'https://www.minfin.gov.ao' },
  'ministerio-das-obras-publicas-urbanismo-e-habitacao-minopuh': {
    website: 'https://minopuh.gov.ao',
    socials: { instagram: 'https://www.instagram.com/ministerio_das_obras_publicas' },
  },
  'ministerio-das-pescas-e-recursos-marinhos-minpermar': { website: 'https://minpermar.gov.ao' },
  'ministerio-do-ensino-superior-ciencia-tecnologia-e-inovacao-mescti': {
    website: 'https://mescti.gov.ao',
    socials: {
      instagram: 'https://www.instagram.com/mescti.gov.ao',
      linkedin:
        'https://www.linkedin.com/company/minist%C3%A9rio-do-ensino-superior-ci%C3%AAncia-tecnologia-e-inova%C3%A7%C3%A3o',
    },
  },
  'ministerio-do-interior': {
    website: 'https://minint.gov.ao',
    socials: { instagram: 'https://www.instagram.com/ministerio_do_interior_' },
  },
  'ministerio-dos-recursos-minerais-petroleo-e-gas-mirempet': {
    website: 'https://mirempet.gov.ao',
    socials: { instagram: 'https://www.instagram.com/mirempet_angola' },
  },
  'ministerio-dos-transportes-mintrans': {
    website: 'https://mintrans.gov.ao',
    socials: { linkedin: 'https://www.linkedin.com/company/lobito-atlantic-railway' },
  },
  movicel: { website: 'https://www.movicel.com' },
  'pnud-angola': {
    website: 'https://www.undp.org/pt/angola',
    socials: {
      facebook: 'https://www.facebook.com/PnudAngola',
      instagram: 'https://www.instagram.com/undpangola',
      linkedin: 'https://www.linkedin.com/company/undpangola',
    },
  },
  'empresa-publica-de-producao-de-electricidade-prodel': {
    website: 'https://www.prodel.co.ao',
    socials: {
      facebook: 'https://www.facebook.com/ProdelAngola',
      linkedin: 'https://www.linkedin.com/company/prodel-angola',
    },
  },
  'provedor-de-justica': {
    website: 'https://provedordejustica.ao',
    socials: {
      facebook: 'https://www.facebook.com/provjus',
      instagram: 'https://www.instagram.com/provedordejustica',
      linkedin: 'https://www.linkedin.com/company/provedoria-de-justi%C3%A7a-de-angola',
    },
  },
  'radio-nacional-de-angola-rna': {
    website: 'https://rna.ao',
    socials: {
      facebook: 'https://www.facebook.com/rnangola',
      instagram: 'https://www.instagram.com/rnangola',
    },
  },
  refriango: {
    website: 'https://www.refriango.com',
    socials: { linkedin: 'https://www.linkedin.com/company/refriangoangola/mycompany' },
  },
  'sana-hotels': {
    website: 'https://www.sanahotels.com/pt',
    socials: {
      facebook: 'https://www.facebook.com/sanahotels',
      instagram: 'https://www.instagram.com/sanahotels',
      linkedin: 'https://www.linkedin.com/company/sana-hotels',
    },
  },
  'shoprite-angola': { website: 'https://www.shoprite.co.ao' },
  'sociedade-mineira-de-catoca': {
    website: 'https://www.catoca.com',
    socials: {
      facebook: 'https://www.facebook.com/catoca.oficial',
      instagram: 'https://www.instagram.com/sociedade_mineira_de_catoca',
      linkedin: 'https://www.linkedin.com/company/catoca',
    },
  },
  taag: { website: 'https://flytaag.com/en' },
  'tribunal-constitucional': {
    website: 'https://www.tribunalconstitucional.ao',
    socials: { facebook: 'https://www.facebook.com/tribunalconstiticionalangola.ao' },
  },
  'tribunal-supremo': {
    website: 'https://tribunalsupremo.ao',
    socials: {
      facebook: 'https://www.facebook.com/tribunalsupremodeangola',
      instagram: 'https://www.instagram.com/tribunal_supremo',
    },
  },
  'tv-cabo': {
    website: 'https://tvcabo.ao/pt/residencial',
    socials: {
      facebook: 'https://www.facebook.com/TVCABOAngola',
      instagram: 'https://www.instagram.com/tvcabo_angola',
      linkedin: 'https://www.linkedin.com/company/tvcabo-angola',
    },
  },
  'unicef-angola': {
    website: 'https://www.unicef.org/angola',
    socials: {
      facebook: 'https://www.facebook.com/unicef',
      instagram: 'https://www.instagram.com/unicef',
      linkedin: 'https://www.linkedin.com/company/unicef',
    },
  },
  zap: { website: 'https://zap.co.ao' },
  bai: {
    website: 'https://www.bancobai.ao',
    socials: {
      facebook: 'https://www.facebook.com/bai.angola',
      instagram: 'https://www.instagram.com/bai.ao',
      linkedin: 'https://www.linkedin.com/company/banco-bai',
    },
  },
  bfa: {
    website: 'https://www.bfa.ao',
    socials: {
      facebook: 'https://www.facebook.com/Banco.BFA',
      instagram: 'https://www.instagram.com/bancofomentoangola',
      linkedin: 'https://www.linkedin.com/company/bfa',
    },
  },
  'banco-bic': {
    website: 'https://www.bancobic.ao',
    socials: {
      facebook: 'https://www.facebook.com/Banco-BIC-Angola-105885061390924',
      instagram: 'https://www.instagram.com/bancobic.angola',
      linkedin: 'https://www.linkedin.com/company/banco-bic-angola',
    },
  },
  atlantico: {
    website: 'https://www.atlantico.ao',
    socials: {
      facebook: 'https://www.facebook.com/bancomillenniumatlantico',
      instagram: 'https://www.instagram.com/atlantico.ao',
      linkedin: 'https://www.linkedin.com/company/bancomillenniumatlantico',
    },
  },
  sonangol: {
    website: 'https://www.sonangol.co.ao',
    socials: {
      facebook: 'https://facebook.com/sonangoloficial',
      instagram: 'https://instagram.com/sonangoloficial',
      linkedin: 'https://www.linkedin.com/company/sonangoloficial',
    },
  },
  africell: {
    website: 'https://www.africell.ao',
    socials: {
      facebook: 'https://www.facebook.com/AfricellAngola',
      instagram: 'https://www.instagram.com/africell.ao',
      linkedin: 'https://www.linkedin.com/company/africell-angola',
    },
  },
  'comissao-do-mercado-de-capitais-cmc': {
    website: 'https://www.cmc.ao',
    socials: {
      facebook: 'https://www.facebook.com/cmcangola',
      instagram: 'https://www.instagram.com/cmc_ao',
      linkedin: 'https://www.linkedin.com/company/comissaodomercadodecapitais',
    },
  },
  'governo-provincial-do-huambo': {
    website: 'https://huambo.gov.ao',
    socials: {
      facebook: 'https://www.facebook.com/GovernoProvincialdoHuambo',
      instagram: 'https://www.instagram.com/governo_provincial_do_huambo',
    },
  },
  'agencia-nacional-de-residuos': { website: 'https://anr.gov.ao' },
  'entidade-reguladora-da-comunicacao-social-de-angola-erca': { website: 'https://erca.ao' },
  'instituto-de-desenvolvimento-agrario-ida': { website: 'https://ida.gov.ao' },
  'servico-de-investigacao-criminal-sic': { website: 'https://sic.gov.ao' },
  'ministerio-das-relacoes-exteriores-mirex': { website: 'https://mirex.gov.ao' },
  'ministerio-das-telecomunicacoes-tecnologias-de-informacao-e-comunicacao-social-minttics': {
    website: 'https://minttics.gov.ao',
  },
  totalenergies: { website: 'https://totalenergies.com' },
  halliburton: { website: 'https://www.halliburton.com' },
}
