# Registos de decisão (ADR)

Um ADR regista uma decisão difícil de desfazer: o contexto, o que se decidiu e as consequências. Serve para daqui a um ano se perceber **porquê**, e não só **o quê**.

- As 12 decisões iniciais estão na tabela de [arquitetura.md, secção 11](../arquitetura.md#11-decisões-registadas).
- As novas ficam aqui, numeradas por ordem. Um ADR não se apaga: se a decisão mudar, escreve-se outro que o substitui.

| # | Decisão | Estado |
|---|---|---|
| [0001](0001-metodologia-devops.md) | Metodologia DevOps com portões de qualidade obrigatórios | Aceite |
| [0002](0002-csp-do-painel-admin.md) | CSP mais permissiva só no painel de administração | Aceite |
| [0003](0003-sessao-web-em-cookie.md) | Sessão da app web em cookie `HttpOnly`, não em `localStorage` | Aceite |
| [0004](0004-containers-fora-de-producao.md) | Containers para desenvolvimento e CI, não na produção atual | Aceite |

Modelo para um novo ADR:

```markdown
# NNNN. Título

Data · Estado: Proposta | Aceite | Substituída por NNNN

## Contexto
## Decisão
## Consequências
```
