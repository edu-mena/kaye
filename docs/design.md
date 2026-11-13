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
| `gold-soft` | `#FFE7A3` | Fundo amarelo-claro por baixo de texto escuro: o texto selecionado e as palavras encontradas na Pesquisa | Quase-preto em cima: 14,7 |
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
- **Ilustrações da página de entrada:** seguem as regras acima, sem paleta própria. São feitas com as peças da app (cartões, hexágono, anel da pontuação, barras, `PathMark`, o guia) em `paper`, branco, `ash`, `coal`, `night` e amarelo, para quem visita ver o que vai encontrar.
- **Cor nova:** acrescenta-a como token em `index.css`, mede o contraste e acrescenta-a a esta tabela.

## Letras

- **Uma só família para títulos e texto:** Bricolage Grotesque, variável, com o eixo de tamanho ótico (`opsz`). O browser ajusta o desenho ao tamanho, por isso o texto pequeno continua legível e os títulos ganham carácter.
- Vem com a app (`@fontsource-variable/bricolage-grotesque/opsz.css`), só com os caracteres latinos (cerca de 77 KB). Não depende do Google Fonts nem da rede.
- **Algarismos simples nas páginas de números (`font-figures`):** no Mercado, os algarismos e o "%" usam a Inter (`@fontsource-variable/inter`, só o ficheiro latino, cerca de 48 KB); as letras à volta continuam em Bricolage. Faz-se com um `@font-face` próprio ("Kaye Figures") limitado a esses caracteres (`unicode-range`) em `src/index.css`, por isso o browser só descarrega a fonte quando uma página a usa. Os números grandes vão a `font-semibold`.
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
| `Button`, `ButtonLink` | Ações e ligações com aspeto de botão | Variantes `primary` (o azul principal: a ação principal do ecrã), `secondary` (contorno), `ghost`, `danger` (como `ghost`, em coral: tirar ou apagar; uma cor de texto passada em `className` perde para a da variante), `onDark` (branco, para fundos escuros) e `onDarkOutline` (a segunda ação ao lado de um `onDark`: contorno e texto brancos). Tamanhos `sm` (36 px), `md` (44 px, o mínimo para o dedo), `lg` (52 px) |
| `Card` | Agrupar conteúdo | Tons `surface`, `gray` (blocos dentro de um cartão branco), `coal` (bloco escuro, com texto branco), `notice` (aviso com contorno azul, fundo branco). `as="section"` ou `"article"` quando tem título |
| `Chip` | Etiquetas curtas: procura, encaixe, razões | Contorno fino, sem fundo. Tons `neutral`, `night` (cheio), `success` e `coral` (com um ponto da cor); `white` e `onDark` em fundos escuros |
| `ProgressBar` | Progresso (teste, CV, conquistas) | É um `<progress>` nativo. Azul principal em fundo claro; `gold` ou `white` em fundo escuro |
| `BarList` | Gráfico de barras horizontais | Ver [Gráficos](#gráficos). `columns={2}`: duas colunas a partir de sm, para listas longas num bloco largo |
| `Dialog` | Confirmações, listas e o menu do telemóvel | É um `<dialog>` nativo e fecha com Esc. `variant="sheet"`: clara, abre de baixo no telemóvel. `variant="drawer"`: preta, abre da direita (o menu hamburger) |
| `Tabs`, `TabPanel` | Partes de um ecrã, uma de cada vez | Padrão WAI-ARIA: setas, Home e End mudam de separador. A linha desliza para o lado no telemóvel e mantém o ativo à vista. Texto em `text-sm font-light`, como a barra lateral. O ativo é quase preto, em `font-normal`, com o ícone amarelo. O painel é um cartão branco com padding, e os blocos lá dentro usam o fundo papel |
| `Pagination` | Mudar de página numa lista longa | `nav` com nome, botões com "Página N" para os leitores de ecrã. Não aparece com uma só página |
| `CardRow` | Cartões lado a lado numa fila | Uma `<ol>` com deslizamento nativo e pontos de paragem; setas "Anterior" e "Seguinte" em círculos `coal` com o ícone `gold`, a cor de destaque das ações secundárias (desativadas e esbatidas nas pontas) |
| `Segmented` | Escolher uma opção (filtros, separadores) | `fieldset` com `legend` e botões com `aria-pressed`. `clearable` deixa desmarcar |
| `TextField`, `TextAreaField`, `SelectField`, `CheckboxField` | Formulários | O erro e a dica ficam ligados ao campo (`aria-describedby`, `aria-invalid`) |
| `PageHeader`, `SectionHeading` | Título do ecrã (com "voltar") e das secções | O título de secção pode levar um ícone num círculo azul (`icon`), como na página de carreira. `compact` (painéis e definições: Mercado, Novidades, Configurações): título em `text-2xl` e 16 px até ao conteúdo |
| `Panel` | Um bloco de um painel (Mercado, Novidades) | Cartão branco `rounded-2xl` com `p-4` (`p-5` a partir de sm), título pequeno (`text-sm`, ícone num círculo azul de 24 px) e uma ação à direita ("Ver todas", `Soon`). `tone="muted"`: cinzento e sem sombra, para o que ainda não existe |
| `Hexagon` | Código RIASEC e conquistas | Tons `dark`, `gold`, `locked` |
| `Rows`, `Soon` | Uma ficha (etiqueta à esquerda, valor à direita) e a etiqueta "Em breve" | `Rows` é uma `<dl>` com uma linha por dado, dentro de um contorno. `Soon` diz que a app ainda não faz aquilo, sem fingir |

Peças de produto em `src/components`:
- `CareerCard` (nome forte, área por baixo, duas linhas de resumo e um rodapé com o salário (mediano ou, nas carreiras do Estado, de entrada: `salaryKind`) e a procura), `DemandMeter` (a procura em 3 barras azuis, sempre com a palavra ao lado), `ScoreBadge`, `PathMark`;
- `InstitutionLogo` (logótipo ou iniciais num círculo branco; em fundo branco leva `ring-1 ring-line`), `ScoreRing`;
- `QueryState` (a carregar, erro), `RequireProfile`;
- `Navigation` (`BottomNav`, `SideNav`, `TopBar`);
- `Icon`: um só componente, com os desenhos em `icons.tsx`.

## Navegação

- **Computador:** a barra lateral é preta e flutua a 12 px das margens, com cantos de 28 px. Tem os grupos "Explorar" e "Para ti", e Suporte e Configurações em baixo. O fundo é quase preto absoluto (`coal`), o texto é branco (espessura leve) e os ícones são amarelos. O item ativo tem uma pílula um pouco mais clara. Minimiza-se só com ícones (o nome aparece ao passar o rato e continua para os leitores de ecrã), e a escolha fica guardada no aparelho.
- **Barra de cima:** é um cartão branco flutuante, com a mesma margem (12 px) e os mesmos cantos (28 px) da barra lateral. Fica presa ao topo, esconde-se ao descer e volta ao subir. Diz às barras presas por baixo (os separadores) onde se encostarem, através da variável `--topbar-space`. No computador tem a pesquisa (lupa branca num círculo escuro), as notificações e o perfil (círculo `coal` com o ícone amarelo). No telemóvel tem o logótipo, as notificações e o menu.
- **Telemóvel:** a barra de baixo é branca, flutua e tem 5 destinos (Início, Pesquisa, Carreiras, Cursos, CV). O ativo fica num círculo preto com o ícone branco, e os inativos têm o ícone preto, sempre com o nome por baixo.
- **Secções sem dados ainda:** um ecrã "Em breve" desenhado (`SoonPage`), que diz o que lá vai estar.
- **Configurações (`/configuracoes`):** como as definições de um telemóvel. Cada grupo tem um título pequeno (`text-sm`, ícone num círculo azul de 24 px) sobre um só cartão branco, com as linhas separadas por traços: o nome, uma linha de explicação e a ação. Sem explicação, a ação fica à direita; com explicação, fica por baixo. Grupos: Idioma, Internet (o interruptor Poupar dados, `DataSaverSwitch`, um `role="switch"`; se está ligado por causa do telemóvel, di-lo), Os teus dados (descarregar, apagar; a lei e o modo de demonstração em nota por baixo), Termos e privacidade, Notificações (Em breve) e Sobre o Kayé. Duas colunas a partir de `lg`. As peças que fazem o trabalho (`LanguagePicker`, `ExportButton`, `EraseButton`, `ServiceStatus`, `LegalLinks`, em `features/settings/SettingsParts.tsx`) também servem os separadores Conta e Privacidade do Perfil, que as mostram em secções grandes. Depois de apagar, uma mensagem em `<output>` diz que está feito. Apagar é um botão `danger` com contorno (`border border-line`).
- **Termos e privacidade (`/termos`, `/privacidade`):** o título com a data da versão, um aviso de versão provisória (até o advogado rever), "Em poucas palavras" num bloco preto com os pontos principais e, por baixo, o índice (preso à esquerda no computador) e o texto completo, com as secções numeradas. O e-mail de contacto é uma ligação `mailto:`. No fim, uma ligação para o outro texto. No onboarding, as ligações ficam fora da etiqueta da caixa de aceitar (para não entrarem no nome dela) e abrem num separador novo, para não se perder o que já foi preenchido.
- **Pesquisa (`/pesquisa`):** compacta, para os resultados aparecerem sem scroll (no telemóvel o primeiro começa a ~320 px do topo): o título em `text-2xl`, 12 px até ao campo, 16 px entre os blocos, e a linha de ajuda só antes de escrever. Um só campo grande (`HeroField`, 56 px), pronto a escrever quando se chega (menos quando o endereço já traz uma pesquisa). O campo guarda o que se escreve e o endereço vai atrás (`?q=`); o campo só lê o endereço quando ele muda de fora (o "voltar", uma ligação para a Pesquisa), para não perder letras escritas depressa. Sem pesquisa: as pesquisas recentes (botões com um relógio e "Limpar") e "Explorar", as quatro secções em linhas. Com pesquisa: o tipo num `Segmented` com contagens ("Tudo · 10", "Carreiras · 7"; um tipo sem resultados não aparece), a contagem em `<output>` e, em "Tudo", até 4 de cada tipo com "Ver todos (N)"; num só tipo (`?tipo=`), 12 por página. Cada resultado é uma linha branca (`LIST_ROW`): a carreira com o ícone da área, o resto com o logótipo, o nome com as palavras marcadas a amarelo esbatido, e uma linha com o que é. No computador, a pesquisa da barra de cima esconde-se nesta página. Uma pesquisa fica nas recentes quando se carrega em Enter ou se abre um resultado (no aparelho, com os outros dados da pessoa). Nada encontrado: diz-o, sugere menos palavras e mostra "Explorar".
- **Mercado (`/mercado`):** cada área de ponta a ponta, com dados reais e sem veredictos: as vagas dos sites de emprego angolanos nos últimos 12 meses (contadas, nunca mostradas), os concursos públicos e os diplomados por curso do anuário do Ensino Superior mais recente (2023/24). Mostra factos lado a lado para ajudar a escolher, nunca "formação a mais" ou "falta formação", e não mostra salários enquanto forem de exemplo. Largura toda (`handle: { wide: true }`), só o título (`PageHeader compact`) e cinco separadores numa barra branca presa ao topo, como no Perfil (`?secao=`; os painéis usam `TabPanel variant="bare"`, sem cartão à volta, porque têm os seus). **Resumo:** um layout calmo, com muito espaço em branco. A apresentação (título, subtítulo e uma frase) ocupa as duas primeiras casas de uma grelha de 4 colunas (2 no telemóvel); depois vêm até seis quadrados cinzentos (`bg-ash-100`, cantos retos, sem sombra) com marcas de corte em dois cantos, uma grelha de pontos que se esbate atrás do ícone (num círculo cor de papel, amarelo-claro ao passar), o número grande, uma frase e o separador onde está o detalhe (vagas, quantas aceitam quem não tem experiência, área, concursos, diplomados, carreira de tecnologia). Por baixo, as fontes. **Vagas:** o destaque escuro (as carreiras de tecnologia com mais vagas; a primeira com a foto, a área por cima e as vagas a amarelo), Vagas nos últimos 12 meses (o total, os sites, a data e `PostingsChart` em blocos de 3 meses, `span={3}`, porque as datas da Jobartis são estimadas), Vagas por área (`BarList` em duas colunas), Onde estão as vagas, Quem mais recruta (parede de 6 empregadores, com o logótipo e a página quando a empresa está no Kayé; as agências de recrutamento ficam numa linha à parte, com a sua percentagem) O que pedem as vagas (três `BarList` lado a lado: habilitações mínimas pela ordem da escala, experiência pedida e a área do curso pedido, em percentagem das vagas que o dizem) e Desemprego por idade (INE: a taxa de cada grupo de idade, os jovens dos 15 aos 24 na cidade e no campo, os que não trabalham nem estudam, e a fonte). **Estado:** Concursos públicos (os lugares anunciados, quantos concursos e quantos dizem o número) e Lugares por área; Quem abre mais lugares e Concursos por província e Confirmados no Diário da República (cada órgão com despacho: o ícone da área, os lugares, quantos despachos e a data; por baixo, a fonte e a ligação à ENAPP, que conduz os concursos da Entidade Recrutadora Única). **Formação:** Diplomados por curso (os 8 maiores) ao lado de Entrar no ensino superior (candidatos, quantos entraram pela primeira vez e quantos estudam, em números grandes); A estudar agora, por curso (os 8 com mais estudantes: os diplomados dos próximos anos) ao lado de Diplomados por ano (com as fontes); Programas para jovens e Trabalhar no estrangeiro ("Em breve"). As duas listas de cursos usam o mesmo `CourseBars`. **Por área:** "Como ler" num bloco cinzento, depois uma tabela com a área, as vagas (sobretudo do privado), os lugares em concursos públicos (como o Estado contrata), os diplomados e os estudantes a estudar agora, cada célula com o número e a percentagem; abaixo de `lg` é uma lista de cartões, uma por área, para nada deslizar para o lado (uma região com scroll teria de ser focável pelo teclado); por baixo, o aviso de que as vagas online são sobretudo do setor privado, as fontes com ligação e o ano dos números por curso. Os dados vêm de `data/market/jobs.json` e `education.json` (gerados em `scrapers/`, carregados só ao abrir o Mercado); as contas estão em `domain/market.ts`.
- **Novidades (`/novidades`):** cabeçalho `compact`, o tipo num `Segmented` com contagens (Tudo, Para ti, Do Kayé, Cursos e academias, Empresas; `?tipo=`) e, a partir de `lg`, a lista à esquerda e uma coluna de 18 rem presa à direita (Para ti, Notificações com ligação, Mercado). Cada novidade é um cartão branco: o tipo (ícone amarelo num círculo escuro) e a data, "Para ti" (preto) quando é sobre uma carreira guardada ou o destino, "Exemplo" quando é inventada, o título como ligação para a página a que se refere, uma linha e a fonte. "Para ti" só aparece como filtro quando há alguma.
- **Notificações (`/notificacoes`):** o que é sobre a pessoa. Em cima, o próximo passo do caminho (o mesmo do Perfil, `domain/path.ts`) num cartão preto com o botão; depois as novidades sobre as carreiras guardadas ou o destino, com o `NewsCard` das Novidades e "Nova" nas que ainda não viu. Abrir a página marca-as como vistas (`notificationsSeenAt`), mas a visita mostra quais eram novas. O sino da barra de cima ganha um ponto amarelo e diz quantas há por ver. À direita, como funcionam e as notificações no telemóvel ("Em breve"). Sem carreiras guardadas, explica como as ter.
- **Suporte (`/suporte`):** perguntas frequentes em quatro grupos (`Panel`: o Kayé, a conta e os dados, o teste, o Mercado), cada uma um `<details>` que abre a resposta, escrita como a app funciona hoje. À direita, atalhos (teste, CV, comparar cursos, os teus dados), Falar connosco ("Em breve": não há contacto inventado) e os Termos e a Política de privacidade (`LegalLinks`).

## Primeira visita

- **Página de entrada (`/`, sem conta):** inspirada no Brilliant, com mais ilustração do que texto. Hero em duas colunas: título, frase e um só botão (para `/entrar`) à esquerda; à direita, o bloco escuro com o caminho do logótipo e o guia, e por cima um cartão de carreira real do catálogo e um curso com o anel da pontuação (`HeroScene`). Depois, a frase sobre saber para onde se vai, quatro funcionalidades com imagem e texto alternados (em `features/landing/scenes.tsx`, cada uma a lembrar o ecrã da funcionalidade: o resultado do teste com o hexágono e as barras RIASEC, as etapas do caminho com a atual a amarelo, os números do catálogo com as áreas em barras e uma folha de CV), as áreas, o manifesto num bloco `coal` e o desenvolvedor com a caixa de contacto. Sem testemunhos enquanto não houver reais. A caixa de contacto não guarda nada: abre o WhatsApp ou o email de quem escreve, com a mensagem já escrita. As ilustrações sobem ao entrar no ecrã (`reveal`, só em CSS; onde não há suporte ficam paradas).
- **Onboarding (`/entrar`):** inspirado no Brilliant, com a identidade do Kayé. Fora da navegação da app, em fundo branco, um passo de cada vez. Em cima: voltar, a barra de progresso em 3 partes (começar, áreas, tu) e o altifalante. Em baixo: o botão preso ao alcance do polegar. A pergunta e as opções ficam ao centro do espaço entre os dois (em tablets na vertical não fica um vazio grande entre a última opção e o botão); se não couberem, começam no topo e rolam.
- **O guia (`Guide`):** o hexágono do modelo de Holland com olhos e o caminho do logótipo como sorriso. Plano (2D) e decorativo: tudo o que diz está escrito. Pisca, flutua, salta a cada resposta e mexe a boca quando fala.
- **Respostas (`OptionGrid`):** cartões `rounded-card` em duas colunas no telemóvel (três a partir de `sm` quando são mais de 6). Em repouso, fundo `paper` com o ícone amarelo num círculo escuro; o escolhido fica preto, com o círculo branco e um visto amarelo. Só ícones 2D do conjunto `Icon`, ou `LevelBars` para níveis.
- **Perguntas por área:** o que chama mais (os grupos reais da área, até 2), a experiência e uma profissão real com foto, para responder "Não", "Talvez" ou "Sim". O cartão sai a voar para o lado da resposta. Uma pergunta com uma só resposta possível não se faz. Quem ainda anda na escola não vê "Já trabalho nisto".
- **Voz:** o guia lê o título e a dica de cada passo com áudio gravado de antemão (`useVoice`, ADR 0013). Em português há Raquel e Duarte (Portugal), Francisca e António (Brasil). Nunca lê o nome da pessoa.
- **Animações:** `animate-step-in`, `-pop`, `-hop`, `-float`, `-blink`, `-talk`, `-draw`, `-grow` e `-fly-*`, em `index.css`. Param com `prefers-reduced-motion`.

## Padrões

| Situação | Como se faz |
|---|---|
| Filtros, ordenação e separador aberto | No URL, com `useUrlFilters` (`src/lib`): o "voltar" e as ligações partilhadas mantêm-nos (ex.: `?secao=path`) |
| Topo de uma página de detalhe (carreira) | Hero de altura fixa (288 px no telemóvel, 384 px no computador), com a foto e um gradiente azul-marinho (sem foto, mostra o caminho da marca). Ao lado do título ficam só ícones: a área, a procura e um "i", que abre numa janela a descrição com a área e a procura por extenso. As ações (destino e guardar) ficam no hero. Os 3 números principais (salário, procura, tempo até lá) ficam numa só linha dentro do hero, entre o título e as ações, com ícones amarelos e sem blocos à parte. Os gráficos com o detalhe ficam nos separadores (Mercado, Como lá chegar). Depois vêm os separadores e, no fim, "O meu encaixe", que se pode minimizar. A rota pede `handle: { wide: true }`: a largura toda no computador (margem de 10 px) |
| Topo de uma lista (Carreiras, Cursos) | `ListHero`: bloco branco com o título grande, a pergunta principal num controlo branco de 56 px com contorno e o ícone branco num círculo escuro (`HeroField`), e os números em pílulas cinzento-claro (ícone amarelo num círculo escuro). As fotos ficam no topo no telemóvel e à direita no computador. A rota pede `handle: { wide: true }` |
| Mosaicos de filtro (áreas, níveis) | `FilterTiles`: ícone amarelo num círculo escuro à esquerda, o nome e a contagem à direita. O ativo fica preto |
| Filtros de uma lista | `FilterBar` por baixo do título da lista: um seletor por filtro (Carreiras: área, procura, salário, página; Cursos: província, duração, preço, horário, instituição), escuro quando filtra, e "Limpar filtros" quando há algum. Listas com mais de 8 opções (cursos, áreas, províncias) são uma caixa para escrever, com as opções que batem certo (sem contar acentos) por baixo enquanto se escreve; setas e Enter escolhem, Esc fecha. No telemóvel, para a fila não crescer em altura, só aparece o botão "Filtros" (com quantos estão ativos), que abre os filtros numa janela por baixo, com "Ver resultados". Os escalões (salário, preço, duração) estão em `domain/bands.ts`. Tudo no URL |
| Áreas das Carreiras | Uma área do catálogo de cada vez: uma linha de botões com as áreas (`Segmented`, `market.area_*`; no telemóvel, uma caixa de selecção) e, por baixo, os cartões dos grupos da área escolhida (`FilterTiles`). Abre na área do grupo filtrado ou na primeira; um grupo escolhido no filtro da lista traz a sua área. Todas as áreas abertas ocupavam vários ecrãs. As áreas seguem a ordem das áreas do Mercado (`MARKET_AREAS`): Tecnologia e telecomunicações, Engenharia e construção, Petróleo, gás e minas, Saúde, Educação, Gestão, finanças e comércio, Direito, Administração pública e segurança, Comunicação e artes, Agricultura e ambiente, Turismo e hotelaria, Logística e transportes e Ciências e humanidades (a quarta e a quinta áreas do catálogo repartem os seus grupos por várias destas). Cada grupo pertence a uma área (`GROUP_AREAS`, ADR 0009) |
| Listas longas | 12 por página, com a página no URL (`?pagina=2`). Uma pesquisa, área ou ordem nova volta à página 1 (`setParam(chave, valor, ['pagina'])`). `Pagination`: anterior, números (com `…` a partir de 8 páginas) e seguinte; a atual é preta, com `aria-current` |
| O encaixe num cartão de profissão | No fundo do cartão, numa faixa cinzenta: o ícone de alvo azul, "Combina muito/em parte/pouco" e 3 traços azuis. Nas listas longas o cartão vai sem a descrição (`brief`) |
| Cartões com foto (profissões, cursos) | Pequenos: dois lado a lado no telemóvel. A foto no topo (decorativa: `alt=""`). Profissão: o ícone da área em amarelo sobre a foto; num cartão estreito (`@container`) ficam só a foto, o nome e a procura (sem área nem salário). Curso: a posição em amarelo e o anel da pontuação sobre a foto, o nome, a instituição (logótipo pequeno), a duração (o preço a partir de sm), e por baixo "Comparar" com um olho ao lado. Todo o cartão abre a página do curso: o nome é a ligação e estende-se por cima do cartão; "Comparar" fica por cima dela |
| Os melhores de uma classificação | Uma fila que desliza (`CardRow`): dois cartões por ecrã no telemóvel, três a partir de md, quatro a partir de xl, com setas que avançam um ecrã de cada vez. O 1.º cartão é escuro |
| Listas de profissões | Grelha de duas colunas no telemóvel, três a partir de xl, 12 por página |
| Página de um curso (`/cursos/:id`) | O endereço é o de uma oferta (a de uma instituição). Hero com a foto sob um gradiente escuro, o nível, quantas instituições o oferecem e o nome do curso. Depois, a oferta escolhida em detalhe (com "Comparar") e, ao lado (por baixo no telemóvel), "Profissões a que leva" e, a seguir, "Instituições que oferecem este curso". Nas duas listas, o primeiro vem com foto e o resto em linhas simples; nas instituições o primeiro é a oferta aberta ("A ver"). Com `?carreira=`, todas as ligações a mantêm e o resumo diz que passo dessa carreira o curso serve. As ofertas são as de exemplo (ADR 0005) |
| Catálogo de cursos (em Cursos) | Logo a seguir ao topo: os cursos **reais** (ADR 0011), uma área de cada vez ou todas (`AreaPicker`: uma caixa para escrever com as áreas como sugestões; `?area=`), o nível (`?grau=`) e uma pesquisa (`?q=`), 12 por página (`?pagina=`). Cartões em 2 colunas a partir de `sm` (3 a partir de `xl`): os níveis, o nome, as áreas, quantas instituições e estudantes e "Plano de estudos" quando algum existe; o cartão todo abre a página do curso. A escolha de profissão do topo também filtra o catálogo |
| Página de um curso real (`/cursos/curso/:id`) | Topo preto com "Cursos", os níveis, o nome, as áreas e os números (instituições, estudantes, diplomados). Depois duas colunas: à esquerda "Onde estudar" (cartões em 2 colunas; com `?academia=`, essa instituição primeiro, com contorno e "A ver"; o cartão abre a instituição) e "Plano de estudos" (o da instituição escolhida, ou o primeiro; uma lista para mudar de instituição; cada período num bloco, com o decreto que o aprovou; sem plano, a frase que o diz); à direita "Profissões a que leva" e os decretos |
| Contagem de resultados | `<output>` por baixo do título da lista: os leitores de ecrã ouvem-na quando os filtros mudam |
| Academias (`/academias`) | Instituições **reais**, só com factos de fontes públicas (`data/demo/academies.ts`, a partir de [recolha-de-dados.md](recolha-de-dados.md)); sem preços nem pontuações, que ficam com as instituições "Exemplo" de Cursos. Hero do tamanho e com as letras do `ListHero`, mas com a foto de fundo a cobrir tudo, uma camada escura e o texto centrado; a pergunta "Que curso queres estudar?" (`?curso=`) e os números em pílulas. Tudo no `FilterBar`, com o tipo primeiro (`?tipo=`). Os outros filtros mudam com o tipo: Faculdade só nas universidades, Área só nos institutos médios e centros de formação, Nível só quando há mais de uma opção; província e gestão sempre. Mudar o tipo limpa a área, a faculdade e o nível. A área vem das carreiras para que cada curso prepara (ligação editorial em `academies.ts`). Cartões em 2 colunas no telemóvel: o banner (ou uma faixa escura), o logótipo sobre a borda (ou as iniciais), tipo · gestão ("Gestão por confirmar" quando não há fonte), local e "A partir dos N anos" quando a fonte o diz; o cartão todo abre a página da instituição. O resumo, os cursos e as fontes ficam nessa página. Logótipos e banners vêm dos sites oficiais e precisam de autorização antes de publicar. No fim, um bloco preto explica de onde vêm os dados. As instituições que ensinam saúde vêm do anuário do Ensino Superior (`data/demo/healthCatalog.ts`): as já curadas recebem os cursos de saúde, as outras entram com um resumo factual (natureza, província e estudantes). Cada curso mostra os estudantes e diplomados do ano |
| Instituição (`/academias/:id`) | Como a página de curso: em cima, o banner sob um gradiente escuro, "Voltar às academias", o logótipo, tipo · gestão e o nome. Depois duas colunas. À esquerda: "Sobre" (o resumo e os dados em lista), "Cursos e ofertas curriculares" (cartões em 2 colunas a partir de `sm`: o nível, a faculdade, o nome, os estudantes e as marcas "Plano de estudos" e "Reconhecimento oficial"; o cartão todo abre uma janela com a oferta: preço, duração e horário "Por confirmar", o decreto, o plano de estudos dessa instituição ou a frase que diz que ainda não o temos, as carreiras a que leva e "Ver mais sobre o curso", que leva a `/cursos/curso/:id?academia=`). À direita: Contactos (o site oficial), "Antes de te inscreveres" (nas universidades, um bloco preto sobre a acreditação), Avaliações e Novidades e promoções (Em breve) e as Fontes. Nada sem fonte é mostrado como facto. Endereço desconhecido: `NotFoundState` |
| Peças dos diretórios (Academias, Empresas) | `CoverHero` (o topo com a foto de fundo, a camada escura, o texto centrado, a pergunta num seletor e os números), `EntityCard` (o banner; sem banner, o logótipo grande numa faixa clara, ou numa escura se o logótipo for branco (`logoOnDark`); sem nenhum, uma faixa escura; o logótipo sobre a borda ou as iniciais, nome que abre a página, uma linha de tipo/setor, local e uma etiqueta dourada opcional) e `DetailParts` (`DetailHero`, `DetailBlock`, `SoonBlock` com "Em breve", `FactList`, `ContactsBlock`, `SourcesBlock`, `CareerPills`, `ExternalLink` com `noopener`). Uma página nova deste tipo usa estas peças em vez de copiar. As duas listas mostram 12 de cada vez com `Pagination` (`?pagina=`, como Carreiras), e qualquer filtro volta à primeira página |
| Empresas (`/empresas`) | Como Academias. Empresas **reais**, só com factos de fontes públicas (`data/demo/companies.ts`); sem salários nem vagas inventados. Hero com a foto de Luanda (David Stanley, CC BY 2.0) e a pergunta "Que profissão procuras?" (`?profissao=`). Filtros no `FilterBar`, com o setor primeiro: Área (das carreiras que cada empresa contrata) e "Programas para jovens" só aparecem quando o setor escolhido tem opções, e mudar o setor limpa-os; a província só aparece com mais de uma. Cartões com o setor, o local e a etiqueta "Programas para jovens". O sector Saúde junta os hospitais e institutos nacionais e os organismos e clínicas com fonte (`healthCatalog.ts`) |
| Empresa (`/empresas/:id`) | Como a página de instituição. À esquerda: Sobre, "Profissões que contrata" (diz se vem de uma fonte ou se é a nossa leitura do setor), "Programas para jovens" (com a fonte) e Vagas abertas (Em breve). À direita: Contactos, "Parcerias com academias" (ligações às academias), Salários e Avaliações (Em breve) e as Fontes |
| Perfil (`/perfil`) | O centro da pessoa. Em cima, um cartão branco com a imagem de capa no topo e a foto de perfil (ou a inicial amarela num círculo escuro) com o meio sobre o fundo da capa; as duas mudam-se com o botão de câmara e ficam só no aparelho, reduzidas a JPEG pequeno (`resizeImage`). Depois o nome grande, idade · província · escolaridade, etiquetas ("Perfil privado" para menores, "Guardado neste aparelho") e os números em pílulas; ao lado, "O teu caminho" num bloco preto com o texto branco e a barra de progresso branca e os passos feitos no azul principal: 6 passos e o botão para o próximo. Depois, separadores no URL (`?secao=`): Resumo, Percurso (o histórico, com data e ligação de volta), Dados pessoais (com Editar), Conta e acesso, Instituições, Documentos e Privacidade. O que ainda não existe (conta segura, documentos, candidaturas, notificações) mostra-se e diz "Em breve", nunca é inventado. Sem perfil, só Conta e acesso e Privacidade |
| Fotos | Cada profissão e cada curso tem a sua (sem repetir pessoas). Do Wikimedia Commons, de preferência da Wiki Loves Africa 2017 ("pessoas a trabalhar"), nunca uma foto que nomeie uma pessoa real com outra profissão. Por agora ficam só no ambiente local e as páginas não mostram os créditos; o autor, a licença e a ligação ficam em `data/demo/images.ts`, porque publicar as fotos obriga a mostrá-los outra vez. WebP em 800 e 1600 px (`srcSet`) |
| A carregar ou com erro | `QueryState` com um esqueleto na forma da página (`ListSkeleton` nas listas, `DetailSkeleton` nos detalhes, `CardsSkeleton` e `RowsSkeleton` dentro de secções), anunciado uma só vez ("A carregar…"). Se falhar: `ErrorState`, um cartão com o ícone de sinal, "Não foi possível carregar", "Tentar outra vez" e "Ir para o início" (em secções, a versão `compact`). Uma ligação para algo que não existe: `NotFoundState`, com o caminho de volta à lista. Nunca um ecrã em branco |
| Carregar uma imagem (foto de perfil, capa) | Primeiro verifica-se (só JPG, PNG ou WebP, até 15 MB); depois abre o `ImageCropper` com a forma do sítio onde vai ficar (círculo para a foto, faixa 3:1 para a capa): arrastar com o rato, o dedo ou as setas, zoom com o controlo deslizante ou + e −, nunca com espaços vazios. Só se guarda o que está dentro da moldura, ao tamanho em que se mostra (320 px a foto, 1500 × 500 a capa), em WebP (JPEG onde o navegador não escreve WebP) |
| Fotos nas páginas | `PhotoImg`: as três larguras (400, 800, 1600 px) com `sizes`, para o navegador escolher a mais pequena que fica nítida. Fora do ecrã esperam (`loading="lazy"`) e são descodificadas sem bloquear (`decoding="async"`); a foto principal da página vai primeiro (`priority`) |
| Poupar dados | `useDataSaver()` (`lib/useDataSaver.ts`): ligado pelo interruptor das Configurações ou, enquanto a pessoa não escolhe, pelo "poupar dados" do telemóvel (`navigator.connection.saveData`). Com ele, `PhotoImg`, `CoverHero` e a foto de Cursos usam só o ficheiro de 400 px (sem `srcSet`); as fotos de listas (`PhotoImg` sem `priority`, banner do `EntityCard`) não carregam e mostram um botão "Ver foto" (`TapToLoad`). Os logos ficam |
| Ecrã que precisa de conta | Todos, com `page()` no `router.tsx`: leva à landing (`/?next=…`) com o bloco "Entra para ver isto", depois a `/entrar?next=…`, e volta ao mesmo endereço, com filtros e `#` (`safeNext` só aceita caminhos da própria app). Assim um link partilhado no WhatsApp abre direto. Só a entrada, os termos e a privacidade ficam de fora (`publicPage()`), sem a navegação da app |
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
- **Pesos de um cálculo** ("Como calculamos", num bloco escuro): uma barra branca por critério, do tamanho real do peso (40% da faixa para 40% da pontuação), com a percentagem escrita. Um critério ainda sem dados fica mais apagado, com a nota a dizer quando entra.
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
