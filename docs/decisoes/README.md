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
| [0005](0005-frontend-primeiro-com-dados-de-demonstracao.md) | Frontend primeiro, com dados de demonstração atrás de uma só porta | Aceite (a faixa "Demonstração" saiu com a 0007) |
| [0006](0006-pdf-do-cv-gerado-no-aparelho.md) | O PDF do CV gera-se no aparelho, por agora (jsPDF) | Aceite |
| [0007](0007-sem-faixa-de-demonstracao.md) | Sem a faixa "Demonstração" no topo dos ecrãs | Aceite |
| [0008](0008-recolha-de-vagas-de-todos-os-sites.md) | Recolha de vagas de todos os sites de emprego, só para estatística | Aceite |
| [0009](0009-catalogo-por-areas-a-comecar-pela-saude.md) | O catálogo cresce por áreas, a começar pela Saúde | Substituída por 0015 |
| [0010](0010-guias-completos-com-fontes-oficiais.md) | Guias completos das profissões com fontes oficiais, um grupo de cada vez | Aceite |
| [0011](0011-catalogo-de-cursos-e-planos-de-estudos.md) | Catálogo de cursos reais e planos de estudos dos decretos | Aceite |
| [0012](0012-conta-obrigatoria-e-onboarding-adaptativo.md) | Conta obrigatória e onboarding adaptativo com guia e voz | Aceite (a voz mudou com a 0013; a conta obrigatória, com a 0021) |
| [0013](0013-voz-do-guia-em-audio-pre-gerado.md) | A voz do guia é áudio gerado de antemão | Aceite |
| [0014](0014-pagina-publica-do-cartao.md) | A página pública do cartão guarda só o que a pessoa escolheu | Aceite |
| [0015](0015-catalogo-largo.md) | Catálogo largo: todas as áreas desde o MVP | Aceite |
| [0016](0016-kursos-livro-tecnico.md) | Kursos: cursos como livro técnico, progresso e certificado no aparelho | Aceite |
| [0017](0017-teste-vocacional-geral-com-valencias.md) | Teste vocacional geral com valências | Aceite |
| [0018](0018-link-da-familia-com-dados-no-fragmento.md) | Link para a família com os dados no fragmento (#) | Aceite |
| [0019](0019-backend-e-migracao-dos-dados.md) | Backend em Laravel e migração dos dados do frontend | Aceite |
| [0020](0020-cobertura-do-frontend-temporaria.md) | Cobertura do frontend abaixo de 90%, temporariamente, com calendário para voltar | Aceite |
| [0021](0021-explorar-sem-conta.md) | Explorar sem conta; o registo só aparece quando a pessoa guarda, comenta ou faz o plano | Aceite |
| [0022](0022-gitleaks-ignora-o-vendor-do-ramo-deploy.md) | O Gitleaks ignora o `vendor/` do ramo `deploy` (código de terceiros), e só isso | Aceite |

Modelo para um novo ADR:

```markdown
# NNNN. Título

Data · Estado: Proposta | Aceite | Substituída por NNNN

## Contexto
## Decisão
## Consequências
```
