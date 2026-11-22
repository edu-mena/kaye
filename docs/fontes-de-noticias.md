# Fontes de notícias

As Novidades de Angola entram sozinhas: o comando `kaye:fetch-news` corre no cron da Hostinger **de 2 em 2 horas** (`routes/console.php`) e lê os feeds da lista abaixo (`apps/api/config/news.php`).

## O que se guarda (e o que não)

- **Guardamos:** título, data, um resumo curto (a primeira frase do *lead* do feed, no máximo 200 caracteres; sem *lead*, só "Notícia publicada por <fonte>."), a imagem **só se o próprio feed a dá**, e a ligação para o original (`source`). Nunca se pede a página do artigo.
- **Não guardamos:** o corpo do artigo. Nada de copiar texto.
- **Limites por corrida:** 15 s por pedido, 40 entradas lidas por fonte, 60 notícias novas no total, respostas até 2 MB, 3 s de pausa entre fontes, `User-Agent` identificado (`KayeBot/1.0`).
- **Duplicados:** a mesma ligação (sem `http`/`https`, `www`, parâmetros e `/` final) ou o mesmo título (sem acentos, maiúsculas nem pontuação) não entra duas vezes, mesmo que a notícia apagada no painel volte ao feed.
- **Idade:** notícias com mais de 30 dias, ou com data no futuro, ficam de fora.
- **Uma fonte que falha** (erro, tempo esgotado, XML estragado) é registada no log e passa-se à seguinte.

## O que entra

Só entra o que fala de formação, emprego, bolsas, concursos públicos, empresas ou instituições do catálogo, ou carreiras (`NewsClassifier`):

1. palavras de tema (`news.topics`: "bolsas de estudo", "concurso público", "estágio", "formação profissional"…), ou
2. o nome de uma empresa, instituição ou carreira publicada (sem acentos, palavra inteira, nomes de 4 letras ou mais).

Cada notícia fica **ligada** às áreas (`area_news`: palavras por área em `news.area_keywords` e a área de cada carreira citada), empresas (`company_news`), instituições (`institution_news`) e carreiras (`career_news`). A API (`GET /news`) devolve `areas`, `institutions`, `companies` e `careers` quando há ligações: é com isto que o filtro das Novidades vai trabalhar. O tipo (`kind`) é `empresas` se cita uma empresa, `cursos` se só bate num tema, `analise` nos outros casos. Entram já publicadas; quem as quiser tirar apaga-as no painel e não voltam.

## Fontes avaliadas

Verificadas a 22 de novembro de 2026 (`robots.txt` e feeds lidos nesse dia). **Termos de uso:** onde se diz "sem página de termos" procurei na página inicial e não encontrei nenhuma; o Eduardo deve confirmar no browser antes de ligar o cron em produção. Nenhuma fonte listada **proíbe** a leitura no `robots.txt`.

| Fonte | Feed | `robots.txt` | Termos | Decisão |
|---|---|---|---|---|
| Novo Jornal (novojornal.co.ao) | Sitemap de notícias `/google_news.ashx` (título, data, ligação; sem *lead* nem imagem) | Permite tudo menos `/common/`, `/errors/`, `/admin/`, `/assets/`, `/search/`; indica este sitemap | Sem página de termos | **Entra** |
| Expansão (expansao.co.ao) | Sitemap de notícias `/google_news.ashx` | Igual ao Novo Jornal | Sem página de termos | **Entra** |
| O Telegrama (otelegrama.com) | RSS `/feed` | Só `/wp-admin/` fechado | Só política de privacidade | **Entra** |
| MAPTSS (maptss.gov.ao) | RSS `/feed` (WordPress) | Só `/wp-admin/` fechado | Sem página de termos; o portal do Governo autoriza reproduzir sem fins lucrativos citando a fonte ([governo.gov.ao/termos](https://governo.gov.ao/termos)) | **Entra** |
| ANGOP (angop.ao) | Sitemap indicado, mas responde 503 com um desafio de robôs e corta a ligação | `Crawl-delay: 5`, sitemaps indicados | — | **Fora**: bloqueia robôs; pedir autorização ou acesso ao feed |
| Jornal de Angola | Nenhum feed (a página `/rss` devolve o site) | `robots.txt` devolve o site, não um ficheiro | — | **Fora**: sem feed |
| TPA (tpa.ao) | — | Certificado do site inválido (`WRONG_PRINCIPAL`) | — | **Fora**: não dá para ler com segurança |
| TV Zimbo (tvzimbo.ao) | Sem feed (`/feed` dá erro do WordPress) | Permite tudo; sinal `ai-train=no` | — | **Fora**: sem feed; voltar a ver o sitemap |
| Ministério do Ensino Superior (mes.gov.ao) | — | O site não respondeu em 15 s | — | **Fora**: não responde |
| Ministério da Educação (med.gov.ao) | Sem RSS (`/feed` devolve o site) | Permite tudo | — | **Fora**: sem feed |
| Ministério da Juventude | — | O domínio testado não existe; endereço oficial por confirmar | — | **Fora** até haver endereço |
| INEFOP (inefop.gov.ao) | Site em JavaScript, sem feed nem `robots.txt` | — | — | **Fora**: sem feed |
| INAGBE (inagbe.gov.ao) | — | Certificado do site inválido | — | **Fora**: não dá para ler com segurança |

Rever a tabela de 6 em 6 meses, e sempre que uma fonte mude de feed ou de termos. Os canais do Ministério do Trabalho e do Ensino Superior no Facebook e no WhatsApp **não** se automatizam.

## Operação

- `php artisan kaye:fetch-news` corre à mão; imprime quantas entraram e que fontes não responderam.
- O cron da Hostinger já corre `schedule:run` a cada minuto ([guia-hostinger.md](guia-hostinger.md)); nada a configurar.
- Testes: `apps/api/tests/Feature/NewsCollectionTest.php`.
