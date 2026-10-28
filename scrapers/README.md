# Scrapers

Dados para o Mercado (Fase 0.2 do [roadmap](../docs/roadmap.md)): as vagas dos sites de emprego angolanos e os diplomados por curso dos anuários oficiais. Python 3, só com a biblioteca padrão (o anuário precisa também do `pdftotext`, do poppler).

| Comando (nesta pasta) | O que faz |
|---|---|
| `python -m jobs.collect` | Lê as fontes e guarda os factos de cada vaga em `data/postings.jsonl` (`--since AAAA-MM-DD` para só as novas, `--source id` para uma fonte) |
| `python -m jobs.details` | Abre a página de cada vaga da Jobartis dos últimos 60 dias ainda por ler (só as recentes: cada página leva 3 s) e guarda as habilitações mínimas, a área do curso pedido, o número de vagas e o prazo (que dá uma data melhor). Grava de 50 em 50: pode parar e recomeçar |
| `python -m jobs.summarize` | Conta os últimos 12 meses por mês e em blocos de 3 meses, área, setor, província, empresa (as agências de recrutamento à parte), carreira e fonte; o que as vagas pedem (habilitações, área do curso, experiência); e os concursos públicos por órgão, área e província. Escreve `apps/web/src/data/market/jobs.json` |
| `python -m jobs.official` | Lê no mapa do site do AngoLEX os despachos do Diário da República que abrem concursos de ingresso (ou dão lugares, província a província) e guarda, de cada um, o título, os lugares, o órgão, a área, a província e a data de assinatura em `data/competitions.jsonl`. Só lê as páginas novas |
| `python -m education.anuario` | Lê os diplomados por instituição e curso do anuário do Ensino Superior de 2023-2024 (MESCTI, publicado pelo INE), soma cada curso e escreve `apps/web/src/data/market/education.json`. Pára se os cursos não somarem o total de cada instituição |

## Fontes de vagas

| Fonte | Como se lê | Notas |
|---|---|---|
| AngoVagas, Ango Emprego, AngoRecruta | API pública do WordPress (`/wp-json/wp/v2/posts`) | Todo o histórico. Ficam de fora as dicas, as notícias e os resumos "Vagas do dia" (repetem vagas publicadas uma a uma) |
| Jobartis | Páginas da listagem, da mais recente para a mais antiga, e depois a página de cada vaga (`jobs.details`) | Sem data nos cartões: a data é estimada a partir do prazo de candidatura (`date_estimated`). A página de cada vaga tem a "Titulação mínima", o número de vagas e o prazo exato |
| Ver Angola Empregos | Feed RSS | Só as vagas mais recentes: o histórico cresce de semana para semana |

## Regras

- Decisão e limites: [ADR 0008](../docs/decisoes/0008-recolha-de-vagas-de-todos-os-sites.md). Respeitar o `robots.txt`, robô identificado, um pedido de cada vez com 3 s de pausa (`jobs/http.py`).
- Guardam-se só factos; o texto do anúncio é lido e descartado (`jobs/facts.py`). A app só recebe contagens.
- Habilitações: o nível mais baixo que o anúncio pede, na escala da app (`EDUCATION_LEVELS`), lido a partir de "Requisitos"/"Perfil" quando existem; e a área do primeiro curso nomeado ("Licenciatura em Contabilidade"), só quando uma regra de `areas.py` o conhece.
- Concursos públicos com despacho no Diário da República contam pelo número oficial (por órgão: os lugares que o despacho de abertura anuncia ou, se for maior, a soma dos lugares dados por província; nunca os dois). Os outros vêm das notícias. Ficam de fora os despachos de concursos internos e de acesso, os termos de referência, os calendários e as compras. A ENAPP só publica os anúncios em imagem, por isso fica como ligação.
- Concursos públicos nas notícias: cada concurso conta uma vez, mesmo que vários blogues o anunciem ou que a notícia volte meses depois; ficam de fora os concursos internos (promoções) e os de compras. A área vem do título ("professores") ou do órgão (Ministério da Saúde).
- Cada vaga tem um setor (`jobs/classify.py`) e, nas de tecnologia, a carreira do Kayé. Os setores e os cursos juntam-se nas mesmas áreas (`areas.py`), para comparar vagas com diplomados.

Mais tarde correm no GitHub Actions todas as semanas e enviam para `POST /api/v1/ingest/jobs` ([arquitetura, 5.2](../docs/arquitetura.md#52-recolha-e-tratamento-de-vagas)).
