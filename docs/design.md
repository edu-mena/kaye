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
| `gold` | `#FFC000` | Destaque: botão de ação, foco, "Estás aqui" | Texto `navy` em cima: 8,8 |
| `gold-soft` | `#FFF4CC` | Fundo das razões e das notas "Porque funciona" | Texto `gold-ink` em cima: 4,9 |
| `gold-ink` | `#8A6400` | Texto amarelo-escuro (o `gold` não serve para texto) | 5,4 no branco |
| `paper` | `#F7F4EE` | Fundo da app | |
| `surface` | `#FFFFFF` | Cartões e campos | |
| `muted` | `#5B6B82` | Texto secundário | 4,9 no papel, 5,4 no branco |
| `line` | `#E6E0D4` | Linhas e contornos | Decorativo |
| `track` | `#9AA6B8` | Barras de contexto nos gráficos | 2,5 no branco: só com o valor escrito ao lado |
| `success` / `success-soft` | `#1A7A50` / `#DCF2E6` | Feito, "Combina muito" | 4,5 |
| `coral` / `coral-soft` | `#B33A24` / `#FBE5DE` | Erros, apagar, "Combina pouco" | 4,9 (5,9 no branco) |

Regras:
- **Uma só cor de destaque por ecrã.** O amarelo marca a ação principal ou o sítio onde a pessoa está, nunca as duas coisas ao mesmo tempo.
- **Verde e coral só servem para estados** (feito, erro, encaixe) e vêm sempre com texto ou ícone.
- **Cor nova:** acrescenta-a como token em `index.css`, mede o contraste e acrescenta-a a esta tabela.

## Letras

| Uso | Fonte | Porquê |
|---|---|---|
| Títulos (`h1`–`h3`, números grandes) | Bricolage Grotesque, variável | Tem carácter e continua legível em tamanhos pequenos |
| Texto | Figtree, variável | Clara num ecrã pequeno |

- As duas vêm com a app (`@fontsource-variable`), só com os caracteres latinos (cerca de 61 KB). Não dependem do Google Fonts nem da rede.
- Os números alinhados (tabelas, barras) usam `tabular-nums`.

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
| `Button`, `ButtonLink` | Ações e ligações com aspeto de botão | Variantes `primary`, `accent` (amarelo), `secondary`, `ghost`. Tamanhos `sm` (36 px), `md` (44 px, o mínimo para o dedo), `lg` (52 px) |
| `Card` | Agrupar conteúdo | Tons `surface`, `navy`, `gold`. `as="section"` ou `"article"` quando tem título |
| `Chip` | Etiquetas curtas: procura, encaixe, razões | Tons `neutral`, `navy`, `gold`, `goldSoft`, `success`, `coral` |
| `ProgressBar` | Progresso (teste, CV) | É um `<progress>` nativo |
| `BarList` | Gráfico de barras horizontais | Ver [Gráficos](#gráficos) |
| `Dialog` | Confirmações e listas | É um `<dialog>` nativo. No telemóvel abre de baixo para cima. Fecha com Esc |
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
| Filtros e ordenação | No URL, com `useUrlFilters` (`src/lib`): o "voltar" e as ligações partilhadas mantêm-nos |
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
