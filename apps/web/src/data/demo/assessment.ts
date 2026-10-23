import type { AssessmentQuestion, RiasecKey } from '../types'

// DEMO DATA: 42 RIASEC statements, 7 per dimension, written for Kayé. Each one
// completes the prompt "Quanto gostas de…". Validation with real users is part
// of Fase 1 (roadmap, 1.2).
const ITEMS: Record<RiasecKey, string[]> = {
  R: [
    'montar ou reparar computadores e outros aparelhos',
    'instalar cabos e configurar uma rede de internet',
    'trabalhar com ferramentas e ver o resultado nas tuas mãos',
    'perceber como funciona uma máquina por dentro',
    'fazer trabalhos práticos fora de um escritório',
    'montar e testar antenas ou equipamentos de telecomunicações',
    'resolver uma avaria técnica na hora',
  ],
  I: [
    'resolver problemas de lógica e quebra-cabeças',
    'descobrir porque é que uma coisa não funciona',
    'analisar números para encontrar padrões',
    'aprender como funcionam as tecnologias novas',
    'fazer experiências para testar uma ideia',
    'ler e pesquisar sobre ciência e tecnologia',
    'escrever um programa que resolve um problema difícil',
  ],
  A: [
    'desenhar ou criar imagens e ilustrações',
    'escolher cores, letras e formas para algo ficar bonito',
    'criar vídeos, fotografias ou música',
    'inventar ideias novas e originais',
    'imaginar como uma app devia parecer',
    'escrever textos criativos ou histórias',
    'trabalhar com liberdade para criar, sem regras fixas',
  ],
  S: [
    'explicar uma coisa a alguém até essa pessoa perceber',
    'ajudar alguém com um problema no computador ou no telemóvel',
    'trabalhar em equipa num projeto',
    'ouvir as pessoas e perceber o que precisam',
    'dar aulas ou formações',
    'ajudar a tua comunidade a usar a tecnologia',
    'fazer as pessoas sentirem-se à vontade',
  ],
  E: [
    'liderar um grupo e tomar decisões',
    'convencer outras pessoas de uma ideia',
    'criar o teu próprio negócio',
    'vender um produto ou um serviço',
    'organizar um projeto e pôr toda a gente a trabalhar para o mesmo objetivo',
    'falar em público e apresentar ideias',
    'arriscar para conseguir algo maior',
  ],
  C: [
    'organizar informação em tabelas e listas',
    'seguir passos e procedimentos com cuidado',
    'verificar se os dados estão certos',
    'manter documentos e ficheiros arrumados',
    'trabalhar com regras claras e bem definidas',
    'planear o teu dia ao detalhe',
    'encontrar erros que mais ninguém viu',
  ],
}

const ORDER: RiasecKey[] = ['R', 'I', 'A', 'S', 'E', 'C']

/** Interleaved R, I, A, S, E, C so no dimension comes in a block. */
export const QUESTIONS: AssessmentQuestion[] = ITEMS.R.flatMap((_, round) =>
  ORDER.map((dimension) => ({
    id: `${dimension}${round + 1}`,
    dimension,
    text: ITEMS[dimension][round] ?? '',
  })),
)
