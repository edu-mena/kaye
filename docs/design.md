# Design da app

Como a app do Kayé se vê e se comporta, e as regras para os ecrãs novos ficarem iguais aos que já existem.

Onde está cada coisa:
- os tokens (cores, letras, sombras, animações) em `apps/web/src/index.css`;
- as peças base em `apps/web/src/components/ui/`.

## Direção

- **A estrutura vem do NOVU**, uma plataforma de roteiros de carreira (Behance), escolhida como referência de UX. Vieram de lá:
  - cartões;
  - o roteiro com etapas;
  - as conquistas;
  - o teste com uma pergunta de cada vez;
  - a barra lateral no computador e a barra inferior no telemóvel.
- **A identidade é a do Kayé:**
  - azul-marinho e amarelo, em vez do roxo e dos gradientes do NOVU;
  - fundo cor de papel, quente, em vez de branco frio.
- **A assinatura é o caminho sinuoso do logótipo.** Aparece:
  - no roteiro de cada carreira (`CareerPath`);
  - como marca discreta nos cartões principais (`PathMark`).
- **O hexágono** é a forma do modelo de Holland (RIASEC). Mostra o código do teste e as conquistas (`Hexagon`).
- **Tom:** claro, caloroso e honesto. A app fala por "tu" ("Como te chamas?") e diz o que ainda não sabe ("Em curadoria", "Demonstração").

## Cores

O texto passa no nível AA da WCAG (pelo menos 4,5:1) em todas as combinações em uso. Os valores foram medidos, não estimados.

| Token | Valor | Para quê | Contraste |
|---|---|---|---|
| `navy` | `#1B2A43` | A cor da marca (logótipo, favicon). Já não é usada na interface | 13,1 no papel |
| `blue` / `blue-dark` | `#021D6D` / `#032A96` (ao passar o rato fica mais claro) | Só os botões de ação principais (`Button` primary): mais claro e forte do que o azul-marinho, destaca-se sem contorno em fundo claro e escuro | Branco em cima: 15,0; contra o papel: 13,7 |
| `gold` | `#FFC000` | Pouco e pequeno, porque chama a atenção: ícones da barra lateral, lupa e perfil da barra de cima, o ícone do separador ativo, o anel da pontuação em fundo escuro, o logótipo, o "Estás aqui" e o foco | Amarelo sobre `night`: 10,9 |
| `gold-ink` | `#8A6400` | Texto amarelo-escuro (o `gold` não serve para texto): rótulos "Dica" e "Porque funciona" | 5,4 no branco |
| `paper` | `#F7F4EE` | Fundo da app | |
| `surface` | `#FFFFFF` | Cartões e campos | |
| `night` | `#16171B` | Quase-preto: separador ativo, títulos, blocos fortes, hero, "O meu encaixe" | 17,9 no branco |
| `coal` | `#0A0A0B` | Mais perto do preto: barra lateral e menu do telemóvel | Amarelo em cima: 12,1 |
| `ash-100` … `ash-500` | `#EFEDE9` `#E2DFD9` `#CDC9C1` `#8A857C` | Cinzentos quentes: separadores inativos, blocos dentro de cartões, trilhos, números de ordem | `ash-500` só decorativo (3,7) |
| `copy` | `#45423C` | Texto corrido: parágrafos e listas | 10,0 no branco, 9,1 no papel |
| `muted` | `#66625B` | Texto secundário (cinzento quente) | 6,1 no branco, 5,5 no papel |
| `line` | `#E6E0D4` | Linhas e contornos | Decorativo |
| `track` | `#B5B0A6` | Barras de contexto nos gráficos | Só com o valor escrito ao lado |
| `success` | `#1A7A50` | Feito, "Combina muito", tendência a subir | 5,3 no branco |
| `coral` | `#B33A24` | Erros, apagar, "Combina pouco" | 5,9 no branco |

Regras:
- **Sobre fundos escuros, só branco.** Botões, ícones, números e barras sobre `coal`, `night` ou fotos são brancos (botão `onDark`, barra `tone="white"`). O amarelo pequeno é a única exceção (ícones da navegação, o anel da pontuação). O caminho da marca (`PathMark`) é uma ilustração, não um controlo.
- **Não depender do azul.** O quase-preto (`night`) marca o que está ativo e os blocos fortes. Os cinzentos quentes (`ash`) fazem as superfícies e o que está inativo. O amarelo é um acento pequeno e raro (os ícones da navegação, o anel da pontuação em fundo escuro). Sem losangos nem outras formas decorativas. Em excesso compete com o azul pela atenção. O azul (`blue`, um azul profundo e mais saturado do que o azul-marinho) é a cor principal, guardada para os botões de ação principais de cada ecrã (por exemplo "Escolher como destino", "Marcar o que sei"). Nunca leva contorno. Ações secundárias sobre fundo escuro usam um círculo ou pílula `coal` com o ícone amarelo, como o perfil na barra de cima.
- **Amarelo sobre quase-preto, sim; amarelo sobre azul-marinho, não.**
- **Ícones em quadrado ou círculo:** fundo branco, contorno fino (`border-line`) e ícone azul-marinho. Nunca um quadrado colorido.
- **Sem fundos de cor translúcidos.** Etiquetas, avisos e dicas usam contorno (`border-line`, ou `border-navy` num aviso importante) e texto. Fundos claros de amarelo, verde ou vermelho parecem genéricos e foram retirados, incluindo os tokens.
- **Verde e coral só servem para estados** (feito, erro, encaixe) e vêm sempre com texto, ícone ou um ponto da mesma cor.
- **Cor nova:** acrescenta-a como token em `index.css`, mede o contraste e acrescenta-a a esta tabela.

## Letras

- **Uma só família para títulos e texto:** Bricolage Grotesque, variável, com o eixo de tamanho ótico (`opsz`). O browser ajusta o desenho ao tamanho, por isso o texto pequeno continua legível e os títulos ganham carácter.
- Vem com a app (`@fontsource-variable/bricolage-grotesque/opsz.css`), só com os caracteres latinos (cerca de 77 KB). Não depende do Google Fonts nem da rede.
- Os números alinhados (tabelas, barras) usam `tabular-nums`.

## Hierarquia

Cada secção tem 3 níveis, sempre pela mesma ordem:

1. **Título da secção:** `text-2xl`/`3xl`, `font-extrabold`, azul-marinho.
2. **Subtítulo:** `text-sm font-semibold`, em letra normal, com uma linha fina até ao fim (`Subheading`).
3. **Conteúdo:** o mesmo tamanho e espessura da barra lateral: `text-sm` (14 px) e `font-light` (300), em `text-copy`. Os nomes dos itens (um curso, uma etapa, um CV) ficam em `font-normal` (400). Só os títulos de secção e os subtítulos vão a negrito ou seminegrito.

**Sem efeitos de tipografia:** nada de maiúsculas forçadas (`uppercase`) nem de espaçamento entre letras (`tracking`) na interface. A hierarquia vem do tamanho e da espessura. A exceção são os modelos de CV, cujos títulos em maiúsculas fazem parte do formato.

- Os poucos números de que uma secção trata vão para blocos azul-marinho com o valor grande (`StatBlock`). É o bloco de cor forte que dá ritmo à leitura.
- Listas longas com linhas finas entre itens, sem um cartão para cada item. Números de ordem grandes (`01`, `02`) em `text-track`.
- O que a pessoa deve fazer ou ver primeiro tem o maior contraste: botão branco cheio sobre azul-marinho, ou um bloco azul-marinho sobre fundo claro. "O meu encaixe" é um bloco azul-marinho, e o hero tem um botão "Encaixe" que leva até ele.

## Espaçamento e cartões

**Espaçamento**
- **Grelha de 4 pontos:** margens e paddings em múltiplos de 4 (4, 8, 16, 24, 32 px). Tudo se divide ao meio sem frações.
- **Respiro:** não encher o cartão. O espaço vazio é o que deixa a hierarquia clara.
- **Agrupar o que está relacionado:** espaços pequenos dentro de um grupo, maiores entre secções. O espaço entre linhas de textos diferentes depende da relação entre eles:
  - um rótulo e o seu valor, ou um nome e a sua descrição: 4 px;
  - um valor e a sua nota: 8 px;
  - elementos de um grupo (cartões de uma lista, linhas de um gráfico): 16 px;
  - entre grupos de uma secção: 32 px; entre secções: 40 px.
- **Altura de linha:** pelo menos 1,5 vezes o tamanho da letra no texto corrido (WCAG 1.4.12). Está nos tokens: `text-xs` 1,5, `text-sm` e `text-base` 1,6. Os títulos grandes ficam mais justos.

**Cartões**
- **Contraste de importância:** o item principal é maior e mais forte (por exemplo, o valor ou o nome do curso em `text-base font-semibold`). O que é secundário (rótulos, notas, instituição) é menor e mais discreto (`text-xs font-light text-muted`). Um rótulo nunca é mais forte do que o seu conteúdo.
- **Sombras com moderação:** opacidade baixa e desfoque grande, em tom neutro (`shadow-card` 8%, `shadow-lift` 14%). Se a sombra é a primeira coisa que se nota, está forte demais.

## Forma, profundidade e movimento

- **Cantos:** `rounded-card` (1,75 rem, 28 px) em todos os cartões e nas barras, proporcional à barra lateral. `rounded-2xl`/`xl` nos blocos interiores, nos campos e nos botões.
- **Margens:** no telemóvel, o conteúdo e as barras flutuantes ficam a 12 px das bordas. No computador, as páginas largas ficam a 10 px.
- **Sombras:** `shadow-card` em repouso e `shadow-lift` quando se passa por cima ou se carrega.
- **Entrada dos ecrãs:** a classe `rise` (sobe 10 px e aparece) é desfasada 60 ms entre elementos com `--i`. Usa a ajuda `stagger(i)` de `src/lib/ui.ts`.
- **"Estás aqui":** só a etapa atual do roteiro pulsa (`animate-pulse-ring`).
- **Movimento reduzido:** quando o sistema pede menos movimento (`prefers-reduced-motion`), as animações param.
- **Testes:** os E2E esperam que as animações de entrada terminem antes de medir o contraste. Um texto a meio da entrada ainda está meio transparente.

## Peças base (`src/components/ui`)

| Peça | Para quê | Notas |
|---|---|---|
| `Button`, `ButtonLink` | Ações e ligações com aspeto de botão | Variantes `primary` (o azul principal: a ação principal do ecrã), `secondary` (contorno), `ghost`, `onDark` (branco, para fundos escuros) e `onDarkOutline` (a segunda ação ao lado de um `onDark`: contorno e texto brancos). Tamanhos `sm` (36 px), `md` (44 px, o mínimo para o dedo), `lg` (52 px) |
| `Card` | Agrupar conteúdo | Tons `surface`, `gray` (blocos dentro de um cartão branco), `coal` (bloco escuro, com texto branco), `notice` (aviso com contorno azul, fundo branco). `as="section"` ou `"article"` quando tem título |
| `Chip` | Etiquetas curtas: procura, encaixe, razões | Contorno fino, sem fundo. Tons `neutral`, `night` (cheio), `success` e `coral` (com um ponto da cor); `white` e `onDark` em fundos escuros |
| `ProgressBar` | Progresso (teste, CV, conquistas) | É um `<progress>` nativo. Azul principal em fundo claro; `gold` ou `white` em fundo escuro |
| `BarList` | Gráfico de barras horizontais | Ver [Gráficos](#gráficos) |
| `Dialog` | Confirmações, listas e o menu do telemóvel | É um `<dialog>` nativo e fecha com Esc. `variant="sheet"`: clara, abre de baixo no telemóvel. `variant="drawer"`: preta, abre da direita (o menu hamburger) |
| `Tabs`, `TabPanel` | Partes de um ecrã, uma de cada vez | Padrão WAI-ARIA: setas, Home e End mudam de separador. A linha desliza para o lado no telemóvel e mantém o ativo à vista. Texto em `text-sm font-light`, como a barra lateral. O ativo é quase preto, em `font-normal`, com o ícone amarelo. O painel é um cartão branco com padding, e os blocos lá dentro usam o fundo papel |
| `Pagination` | Mudar de página numa lista longa | `nav` com nome, botões com "Página N" para os leitores de ecrã. Não aparece com uma só página |
| `CardRow` | Cartões lado a lado numa fila | Uma `<ol>` com deslizamento nativo e pontos de paragem; setas "Anterior" e "Seguinte" (desativadas nas pontas) |
| `Segmented` | Escolher uma opção (filtros, separadores) | `fieldset` com `legend` e botões com `aria-pressed`. `clearable` deixa desmarcar |
| `TextField`, `TextAreaField`, `SelectField`, `CheckboxField` | Formulários | O erro e a dica ficam ligados ao campo (`aria-describedby`, `aria-invalid`) |
| `PageHeader`, `SectionHeading` | Título do ecrã (com "voltar") e das secções | O título de secção pode levar um ícone num círculo azul (`icon`), como na página de carreira | |
| `Hexagon` | Código RIASEC e conquistas | Tons `dark`, `gold`, `locked` |

Peças de produto em `src/components`:
- `CareerCard` (nome forte, área por baixo, duas linhas de resumo e um rodapé com o salário mediano e a procura), `DemandMeter` (a procura em 3 barras azuis, sempre com a palavra ao lado), `ScoreBadge`, `PathMark`;
- `InstitutionLogo` (logótipo ou iniciais num círculo branco; em fundo branco leva `ring-1 ring-line`), `ScoreRing`;
- `QueryState` (a carregar, erro), `RequireProfile`;
- `Navigation` (`BottomNav`, `SideNav`, `DemoBanner`);
- `Icon`: um só componente, com os desenhos em `icons.tsx`.

## Navegação

- **Computador:** a barra lateral é preta e flutua a 12 px das margens, com cantos de 28 px. Tem os grupos "Explorar" e "Para ti", e Suporte e Configurações em baixo. O fundo é quase preto absoluto (`coal`), o texto é branco (espessura leve) e os ícones são amarelos. O item ativo tem uma pílula um pouco mais clara. Minimiza-se só com ícones (o nome aparece ao passar o rato e continua para os leitores de ecrã), e a escolha fica guardada no aparelho.
- **Barra de cima:** é um cartão branco flutuante, com a mesma margem (12 px) e os mesmos cantos (28 px) da barra lateral. Fica presa ao topo, esconde-se ao descer e volta ao subir. Diz às barras presas por baixo (os separadores) onde se encostarem, através da variável `--topbar-space`. No computador tem a pesquisa (lupa branca num círculo escuro), as notificações e o perfil (círculo `coal` com o ícone amarelo). No telemóvel tem o logótipo, as notificações e o menu.
- **Telemóvel:** a barra de baixo é branca, flutua e tem 5 destinos (Início, Pesquisa, Carreiras, Cursos, CV). O ativo fica num círculo preto com o ícone branco, e os inativos têm o ícone preto, sempre com o nome por baixo.
- **Secções sem dados ainda:** um ecrã "Em breve" desenhado (`SoonPage`), que diz o que lá vai estar.

## Padrões

| Situação | Como se faz |
|---|---|
| Filtros, ordenação e separador aberto | No URL, com `useUrlFilters` (`src/lib`): o "voltar" e as ligações partilhadas mantêm-nos (ex.: `?secao=path`) |
| Topo de uma página de detalhe (carreira) | Hero de altura fixa (288 px no telemóvel, 384 px no computador), com a foto e um gradiente azul-marinho (sem foto, mostra o caminho da marca). Ao lado do título ficam só ícones: a área, a procura e um "i", que abre numa janela a descrição com a área e a procura por extenso. As ações (destino e guardar) ficam no hero. Os 3 números principais (salário, procura, tempo até lá) ficam numa só linha dentro do hero, entre o título e as ações, com ícones amarelos e sem blocos à parte. Os gráficos com o detalhe ficam nos separadores (Mercado, Como lá chegar). Depois vêm os separadores e, no fim, "O meu encaixe", que se pode minimizar. A rota pede `handle: { hideDemoBanner: true, wide: true }`: sem a faixa "Demonstração" e com a largura toda no computador (margem de 10 px) |
| Topo de uma lista (Carreiras, Cursos) | `ListHero`: bloco cinzento claro (`ash-200`), título grande, a pergunta principal num controlo branco de 56 px com o ícone branco num círculo escuro (`HeroField`), e os números em pílulas brancas (ícone amarelo num círculo escuro). As fotos ficam no topo no telemóvel e à direita no computador. A rota pede `handle: { hideDemoBanner: true, wide: true }` |
| Mosaicos de filtro (áreas, níveis) | `FilterTiles`: ícone amarelo num círculo escuro à esquerda, o nome e a contagem à direita. O ativo fica preto. Na barra da lista, um `FilterSelect` (área, província) ao lado da ordem |
| Listas longas | 12 por página, com a página no URL (`?pagina=2`). Uma pesquisa, área ou ordem nova volta à página 1 (`setParam(chave, valor, ['pagina'])`). `Pagination`: anterior, números (com `…` a partir de 8 páginas) e seguinte; a atual é preta, com `aria-current` |
| O encaixe num cartão de profissão | No fundo do cartão, numa faixa cinzenta: o ícone de alvo azul, "Combina muito/em parte/pouco" e 3 traços azuis. Nas listas longas o cartão vai sem a descrição (`brief`) |
| Cartões com foto (profissões, cursos) | Pequenos: dois lado a lado no telemóvel. A foto no topo (decorativa: `alt=""`). Profissão: o ícone da área em amarelo sobre a foto; o cartão adapta-se à largura que tem (`@container`). Curso: a posição em amarelo e o anel da pontuação sobre a foto, depois o nome, a instituição (logótipo pequeno), o custo e a duração, e "Comparar". O resto vê-se na vista do curso: todo o cartão a abre |
| Os melhores de uma classificação | Uma fila que desliza (`CardRow`): dois cartões por ecrã no telemóvel, três a partir de md, quatro a partir de xl, com setas que avançam um ecrã de cada vez. O 1.º cartão é escuro |
| Listas de profissões | Grelha de duas colunas no telemóvel, três a partir de xl, 12 por página |
| Ver os detalhes sem sair da página | Botão "Ver detalhes" (com o nome do curso no `aria-label`) que abre o `Dialog`. O resumo dá a posição pela pontuação, seja qual for a ordem da lista |
| Contagem de resultados | `<output>` por baixo do título da lista: os leitores de ecrã ouvem-na quando os filtros mudam |
| Fotos | Cada profissão e cada curso tem a sua (sem repetir pessoas). Do Wikimedia Commons, de preferência da Wiki Loves Africa 2017 ("pessoas a trabalhar"), nunca uma foto que nomeie uma pessoa real com outra profissão. `PhotoCredits` no fim da página dá o autor e a licença de cada uma. WebP em 800 e 1600 px (`srcSet`), com licença livre e o crédito visível com ligação ao original |
| A carregar ou com erro | `QueryState`, nunca um ecrã em branco |
| Ecrã que precisa de perfil | `withProfile()` no `router.tsx`. Leva a `/entrar?next=…` e volta depois (`safeNext` só aceita caminhos da própria app) |
| Apagar ou substituir algo da pessoa | Pede confirmação num `Dialog` e diz que não dá para desfazer |
| Dados que ainda não existem | Dizê-lo ("Em curadoria", "O PDF chega com o servidor"), nunca inventar |
| Dinheiro, percentagens, durações | `formatKz`, `formatPercent` (`src/domain/format.ts`), `useDuration`, `useRatingLabel` e `useRatingParts` (a avaliação em duas partes curtas, para cartões estreitos) (`src/lib/useFormat.ts`) |
| Uma lista com uma ordem que importa | `<ol>` com `aria-label` |

## Gráficos

- **Barras horizontais, não radar.** O radar (o hexágono RIASEC desenhado como gráfico) é bonito mas difícil de ler: comparar áreas é mais difícil do que comparar comprimentos.
- **Uma só cor, com ênfase.** O que importa fica a quase preto (`night`, por exemplo os 3 interesses mais fortes). O resto fica a `track`, para dar contexto.
- **O valor fica sempre escrito ao lado da barra.** Assim a informação nunca depende só da cor, e o contraste baixo do `track` não esconde nada.
- **Faixa salarial:** os números vêm primeiro, cada um com o seu significado: Entrada (1 em cada 4 ganha menos), Mediana e Topo (1 em cada 4 ganha mais). A barra por baixo só os coloca numa escala, com o valor escrito em cada ponto. A escala não começa no zero, para a faixa se ler.
- **Ao longo do tempo:** colunas por mês, com a última em destaque e o seu valor escrito. Todos os valores estão no texto para leitores de ecrã e aparecem ao passar o rato.
- **Pesos de um cálculo** ("Como calculamos"): uma barra por critério, do tamanho real do peso (40% da faixa para 40% da pontuação), azul e com a percentagem escrita em azul. Um critério ainda sem dados fica cinzento, com a nota a dizer quando entra.
- **Um só eixo.** Duas medidas diferentes vão para dois gráficos, nunca para um gráfico com dois eixos.
- O texto usa as cores do texto, nunca a cor da série.

## Acessibilidade

- **Elementos nativos primeiro:** `<dialog>`, `<progress>`, `<fieldset>`/`<legend>`, `<button>`, `<a>`. Só se usa ARIA quando não há elemento nativo.
- **Foco visível:** um contorno amarelo (`:focus-visible`).
- **"Saltar para o conteúdo"** é a primeira coisa do ecrã.
- **Idioma:** o `lang` do `<html>` segue o idioma escolhido.
- **Toque:** os alvos têm pelo menos 44 px (botão `md`).
- **Verificação automática:** cada teste E2E corre o axe (WCAG 2.1 AA) e falha com problemas sérios ou críticos. A mensagem diz que elemento corrigir.

## Textos

- O português (`src/locales/pt.ts`) é a fonte. O TypeScript obriga a ter as mesmas chaves em `en.ts` e `fr.ts`.
- Frases curtas e palavras do dia a dia. Termos técnicos (RIASEC, XP) vêm sempre com uma explicação ao lado.
- **Nada de ranking entre pessoas.** As conquistas medem o progresso de cada um. Muitos utilizadores são menores, e a comparação com os outros não ajuda a escolher uma carreira.
