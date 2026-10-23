# Scrapers

Recolha semanal de vagas tech de sites de emprego angolanos (Fase 0.2 do [roadmap](../docs/roadmap.md)).

- Python 3, um adaptador por site.
- Correm no GitHub Actions (`.github/workflows/scrape.yml`), nunca na Hostinger.
- Enviam o resultado para `POST /api/v1/ingest/jobs`, com assinatura HMAC.
- Regras de recolha: [arquitetura, secção 5.2](../docs/arquitetura.md#52-recolha-e-tratamento-de-vagas).

Ainda vazio: falta a lista de sites a recolher.
