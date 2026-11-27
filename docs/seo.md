# SEO: aparecer nas pesquisas

O objetivo é o Kayé aparecer quando alguém em Angola pesquisa uma profissão, um curso, uma universidade, uma empresa, bolsas, estágios ou dados do emprego, e não só quando pesquisa "Kayé".

## Como funciona

A app é React e o conteúdo chega por JavaScript. Os motores de busca nem sempre correm JavaScript, e as pré-visualizações do WhatsApp e do Facebook nunca o correm. Por isso o Laravel (`SpaController`) entrega cada página já com:

- **título e descrição próprios**, escritos para as pesquisas reais ("Cardiopneumologista: o que faz, salário e onde estudar em Angola");
- **endereço canónico**, `robots` e etiquetas **Open Graph** e Twitter (imagem da carreira ou da notícia, quando existe);
- **dados estruturados** (schema.org, JSON-LD), na tabela abaixo;
- **o conteúdo principal em HTML simples**, dentro do `<div id="root">`: título, resumo, factos (salário, província…), secções e ligações para as páginas relacionadas. A app React substitui-o quando arranca, com o mesmo conteúdo.

Tudo é construído a partir das mesmas linhas publicadas que a API serve (`App\Support\Seo\SeoPages`), e guardado na cache em ficheiros com as respostas da API ([ADR 0029](decisoes/0029-cache-em-ficheiros.md)). Uma alteração no painel apaga essa cache.

| Página | Título (exemplo) | Dados estruturados |
|---|---|---|
| `/` | Kayé: carreiras, cursos, universidades, bolsas e emprego em Angola | `Organization` (com as redes sociais em `sameAs`), `WebSite` (com a caixa de pesquisa) |
| `/carreiras/{slug}` | {Profissão}: o que faz, salário e onde estudar em Angola | `Occupation` (salário mediano em AOA, competências, formação), `BreadcrumbList` |
| `/cursos/curso/{slug}` | {Curso} em Angola: onde estudar | `Course` (com as instituições em `provider`), `BreadcrumbList` |
| `/academias/{slug}` | {Instituição}: cursos, propinas e contactos | `CollegeOrUniversity` ou `EducationalOrganization` (cursos em `hasOfferCatalog`) |
| `/empresas/{slug}` | Trabalhar na {Empresa}: carreiras e como entrar | `Organization` |
| `/novidades/{slug}` | o título da notícia | `NewsArticle` |
| `/kursos/{slug}` | {Kurso}: curso online grátis | `Course` |
| `/mercado` | Mercado de trabalho em Angola: vagas, profissões procuradas e desemprego | três `Dataset` (anúncios de emprego, desemprego do INE, ensino superior), com as fontes |
| `/carreiras`, `/cursos`, `/academias`, `/empresas`, `/areas`, `/areas/{slug}`, `/bolsas`, `/estagios`, `/novidades`, `/kursos` | listas com ligação a cada página | `BreadcrumbList` nas áreas |

**Regras:**

- Uma carreira, um curso, uma instituição, uma empresa, uma notícia ou um Kurso que não existe, ou que está em rascunho, responde **404**, com `noindex`. A app aparece na mesma, com "não encontrado".
- As páginas de uma pessoa ficam com `noindex`, sem endereço canónico: entrar, perfil, plano, definições, notificações, família, o CV a ser escrito, os cartões públicos (`/c/…`), os resultados dos testes, as lições e os exames dos Kursos e os prazos.
- O JSON da API leva `X-Robots-Tag: noindex`. O `/api` **não** está bloqueado no `robots.txt`: o Google corre a app, e a app vai buscar o conteúdo à API. Bloqueada, o Google veria as páginas vazias.
- O staging tem `noindex` em todas as respostas.
- O texto vindo do catálogo é sempre escapado. No JSON-LD, o `<` sai como `<`, por isso um nome nunca consegue fechar o `<script>` (`SeoTest`).

**Ficheiros:**

| Ficheiro | O que faz |
|---|---|
| `app/Support/Seo/SeoPages.php` | O título, a descrição, os dados estruturados e o conteúdo de cada página; a lista do sitemap |
| `app/Support/Seo/SeoDocument.php` | Põe a página no `index.html`: troca as etiquetas do `<head>` e enche o `<div id="root">` |
| `resources/views/seo/` | `head`, `body` (com o rodapé de navegação e as redes sociais) e `sitemap` |
| `GET /sitemap.xml` | Todas as páginas públicas (cerca de 1200 em novembro de 2026) |
| `public/robots.txt` | Aponta para o sitemap; bloqueia só `/admin` e `/auth/` |
| `public/google968e73977fec3650.html` | Verificação do Google Search Console. O Google volta a verificá-lo: não apagar |
| `public/BingSiteAuth.xml` | Verificação do Bing Webmaster Tools. Também não apagar |
| `config/kaye.php` (`socials`) e `apps/web/src/lib/socials.ts` | Os perfis oficiais: YouTube, TikTok e Facebook. As duas listas têm de ser iguais |

## O que só o Eduardo pode fazer (uma vez)

1. **Google Search Console** (search.google.com/search-console): *Adicionar propriedade* → *Domínio* → `kayeangola.com`. O Google dá um registo **TXT**; põe-no no hPanel em *Domínios → kayeangola.com → DNS*. Depois de verificado: *Sitemaps* → `sitemap.xml` → *Enviar*. Em *Inspeção de URL*, pede a indexação de `/`, `/carreiras`, `/mercado` e `/bolsas`.
2. **Bing Webmaster Tools** (bing.com/webmasters): *Importar do Google Search Console*. Serve também ao Yahoo e ao DuckDuckGo.
3. **Redes sociais:** na bio do YouTube, do TikTok e do Facebook, o link para `https://kayeangola.com`. Com o `sameAs` do site, isto liga os perfis ao site (o painel com o logo e as redes nos resultados do Google).
4. **Ligações de outros sites** (o que mais pesa no Google): pedir às universidades, às escolas e às empresas que aparecem no Kayé um link para a sua página no Kayé (por exemplo, `kayeangola.com/academias/isptec`), e partilhar as páginas (não só a home) nos vídeos e nas publicações.

## Como verificar

- **Uma página como o Google a vê:** Search Console → *Inspeção de URL* → *Testar URL publicado* → *Ver página testada*.
- **Dados estruturados:** search.google.com/test/rich-results com o endereço de uma carreira, de uma universidade ou do `/mercado`.
- **Pré-visualização no WhatsApp:** colar o link de uma carreira numa conversa. Aparecem o título, a descrição e a imagem dessa carreira.
- **Por linha de comandos:** `curl -s https://kayeangola.com/carreiras/enfermeiro | grep -E "<title>|canonical|ld\+json"`.

## Expectativa

Um domínio novo demora **semanas a meses** a subir nas pesquisas genéricas ("enfermeiro salário angola"). As pesquisas mais específicas, como "cardiopneumologista angola onde estudar" ou "ISPTEC cursos", costumam aparecer primeiro. O Search Console mostra, para cada pesquisa, quantas vezes o Kayé apareceu e em que posição: é aí que se vê o progresso e que páginas reforçar.
