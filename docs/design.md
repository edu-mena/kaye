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
| `navy` | `#1B2A43` | Texto principal, botão principal, item ativo | 13,1 no papel |
| `navy-100` | `#E8ECF3` | Fundos suaves, trilho das barras | Texto `navy` em cima: 12,1 |
| `gold` | `#FFC000` | Detalhes e formas: losangos, a barra sob os títulos, a risca dos blocos, o ponto da mediana, a bandeira do caminho, o botão "Encaixe". Também o logótipo, o "Estás aqui" e o foco | Texto `night` em cima: 10,9; amarelo sobre `night`: 10,9 |
| `gold-ink` | `#8A6400` | Texto amarelo-escuro (o `gold` não serve para texto): rótulos "Dica" e "Porque funciona" | 5,4 no branco |
| `paper` | `#F7F4EE` | Fundo da app | |
| `surface` | `#FFFFFF` | Cartões e campos | |
| `night` | `#16171B` | Quase-preto: separador ativo, títulos, blocos fortes, hero, "O meu encaixe" | 17,9 no branco |
| `ash-100` … `ash-500` | `#EFEDE9` `#E2DFD9` `#CDC9C1` `#8A857C` | Cinzentos quentes: separadores inativos, blocos dentro de cartões, trilhos, números de ordem | `ash-500` só decorativo (3,7) |
| `copy` | `#45423C` | Texto corrido: parágrafos e listas | 10,0 no branco, 9,1 no papel |
| `muted` | `#66625B` | Texto secundário (cinzento quente) | 6,1 no branco, 5,5 no papel |
| `line` | `#E6E0D4` | Linhas e contornos | Decorativo |
| `track` | `#B5B0A6` | Barras de contexto nos gráficos | Só com o valor escrito ao lado |
| `success` | `#1A7A50` | Feito, "Combina muito", tendência a subir | 5,3 no branco |
| `coral` | `#B33A24` | Erros, apagar, "Combina pouco" | 5,9 no branco |

Regras:
- **Sobre azul-marinho, só branco.** Botões, ícones, números e barras em cima de azul-marinho são brancos (botão `onNavy`, barra `tone="white"`). O amarelo aparece sobre fundos claros. O caminho da marca (`PathMark`) é a exceção, porque é uma ilustração e não um controlo.
- **Não depender do azul.** O quase-preto (`night`) marca o que está ativo e os blocos fortes. Os cinzentos quentes (`ash`) fazem as superfícies e o que está inativo. O amarelo dá vida em detalhes e formas (o losango, que é a bandeira do caminho do logótipo). O azul-marinho fica para a marca e para os botões principais.
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
2. **Subtítulo:** pequeno, em maiúsculas, `text-muted`, com uma linha fina até ao fim (`Subheading`).
3. **Conteúdo:** texto corrido em `text-copy`. Os valores e os nomes que importam ficam a `font-semibold`/`bold` azul-marinho.

- A primeira frase de uma secção pode ser maior (`text-xl`, `font-medium`), como abertura.
- Os poucos números de que uma secção trata vão para blocos azul-marinho com o valor grande (`StatBlock`). É o bloco de cor forte que dá ritmo à leitura.
- Listas longas com linhas finas entre itens, sem um cartão para cada item. Números de ordem grandes (`01`, `02`) em `text-track`.
- O que a pessoa deve fazer ou ver primeiro tem o maior contraste: botão branco cheio sobre azul-marinho, ou um bloco azul-marinho sobre fundo claro. "O meu encaixe" é um bloco azul-marinho, e o hero tem um botão "Encaixe" que leva até ele.

## Forma, profundidade e movimento

- **Cantos:** `rounded-card` (1,25 rem) nos cartões e `rounded-xl` nos campos e botões.
- **Sombras:** `shadow-card` em repouso e `shadow-lift` quando se passa por cima ou se carrega.
- **Entrada dos ecrãs:** a classe `rise` (sobe 10 px e aparece) é desfasada 60 ms entre elementos com `--i`. Usa a ajuda `stagger(i)` de `src/lib/ui.ts`.
- **"Estás aqui":** só a etapa atual do roteiro pulsa (`animate-pulse-ring`).
- **Movimento reduzido:** quando o sistema pede menos movimento (`prefers-reduced-motion`), as animações param.
- **Testes:** os E2E esperam que as animações de entrada terminem antes de medir o contraste. Um texto a meio da entrada ainda está meio transparente.

## Peças base (`src/components/ui`)

| Peça | Para quê | Notas |
|---|---|---|
| `Button`, `ButtonLink` | Ações e ligações com aspeto de botão | Variantes `primary` (azul-marinho), `secondary`, `ghost`, `onNavy` (branco, para fundos azul-marinho). Tamanhos `sm` (36 px), `md` (44 px, o mínimo para o dedo), `lg` (52 px) |
| `Card` | Agrupar conteúdo | Tons `surface`, `paper` (blocos dentro de um cartão branco), `navy`, `notice` (aviso com contorno azul-marinho, fundo branco). `as="section"` ou `"article"` quando tem título |
| `Chip` | Etiquetas curtas: procura, encaixe, razões | Contorno fino, sem fundo. Tons `neutral`, `navy` (cheio), `success` e `coral` (com um ponto da cor) |
| `ProgressBar` | Progresso (teste, CV) | É um `<progress>` nativo |
| `BarList` | Gráfico de barras horizontais | Ver [Gráficos](#gráficos) |
| `Dialog` | Confirmações e listas | É um `<dialog>` nativo. No telemóvel abre de baixo para cima. Fecha com Esc |
| `Tabs`, `TabPanel` | Partes de um ecrã, uma de cada vez | Padrão WAI-ARIA: setas, Home e End mudam de separador. A linha desliza para o lado no telemóvel e mantém o ativo à vista. O ativo é azul-marinho, com texto e ícone brancos. O painel é um cartão branco com padding, e os blocos lá dentro usam o fundo papel |
| `Segmented` | Escolher uma opção (filtros, separadores) | `fieldset` com `legend` e botões com `aria-pressed`. `clearable` deixa desmarcar |
| `TextField`, `TextAreaField`, `SelectField`, `CheckboxField` | Formulários | O erro e a dica ficam ligados ao campo (`aria-describedby`, `aria-invalid`) |
| `PageHeader`, `SectionHeading` | Título do ecrã (com "voltar") e das secções | |
| `Hexagon` | Código RIASEC e conquistas | Tons `navy`, `gold`, `locked` |

Peças de produto em `src/components`:
- `CareerCard`, `ScoreBadge`, `PathMark`;
- `QueryState` (a carregar, erro), `RequireProfile`;
- `Navigation` (`BottomNav`, `SideNav`, `DemoBanner`);
- `Icon`: um só componente, com os desenhos em `icons.tsx`.

## Padrões

| Situação | Como se faz |
|---|---|
| Filtros, ordenação e separador aberto | No URL, com `useUrlFilters` (`src/lib`): o "voltar" e as ligações partilhadas mantêm-nos (ex.: `?secao=path`) |
| Topo de uma página de detalhe (carreira) | Hero de altura fixa (288 px no telemóvel, 384 px no computador), com a foto e um gradiente azul-marinho (sem foto, mostra o caminho da marca). Ao lado do título ficam só ícones: a área, a procura e um "i", que abre numa janela a descrição com a área e a procura por extenso. As ações (destino e guardar) ficam no hero. Por baixo dele, os 3 números (salário, procura, tempo até lá), cada um com um mini-gráfico: uma lista curta no telemóvel e 3 cartões no computador. Depois vêm os separadores e, no fim, "O meu encaixe", que se pode minimizar. A rota pede `handle: { hideDemoBanner: true, wide: true }`: sem a faixa "Demonstração" e com a largura toda no computador (margem de 10 px) |
| Fotos | WebP em 800 e 1600 px (`srcSet`), com licença livre e o crédito visível com ligação ao original |
| A carregar ou com erro | `QueryState`, nunca um ecrã em branco |
| Ecrã que precisa de perfil | `withProfile()` no `router.tsx`. Leva a `/entrar?next=…` e volta depois (`safeNext` só aceita caminhos da própria app) |
| Apagar ou substituir algo da pessoa | Pede confirmação num `Dialog` e diz que não dá para desfazer |
| Dados que ainda não existem | Dizê-lo ("Em curadoria", "O PDF chega com o servidor"), nunca inventar |
| Dinheiro, percentagens, durações | `formatKz`, `formatPercent` (`src/domain/format.ts`), `useDuration` e `useRatingLabel` (`src/lib/useFormat.ts`) |
| Uma lista com uma ordem que importa | `<ol>` com `aria-label` |

## Gráficos

- **Barras horizontais, não radar.** O radar (o hexágono RIASEC desenhado como gráfico) é bonito mas difícil de ler: comparar áreas é mais difícil do que comparar comprimentos.
- **Uma só cor, com ênfase.** O que importa fica a `navy` (por exemplo, os 3 interesses mais fortes). O resto fica a `track`, para dar contexto.
- **O valor fica sempre escrito ao lado da barra.** Assim a informação nunca depende só da cor, e o contraste baixo do `track` não esconde nada.
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
