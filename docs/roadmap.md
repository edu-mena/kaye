# Kayé — Roadmap

Versão 1 · 19 de outubro de 2026 · Equipa: Eduardo + Claude

Este roadmap não tem datas: cada fase termina quando cumpre o seu **critério de saída**. A arquitetura está em [arquitetura.md](arquitetura.md).

## Decisões de produto

- **Começar só pela tecnologia** ("Kayé Tech"), em Luanda. Os outros setores entram depois, escolhidos com dados.
- **Tudo grátis no início.** Primeiro as funcionalidades, depois os pagamentos.
- **Parcerias só depois** de haver tração.
- **Transparência total:** cada número diz de onde vem e quando foi atualizado.
- **As instituições nunca recebem dados individuais** de estudantes.
- **Os utilizadores ajudam a construir os dados:** salários anónimos, vagas, correções.
- **CV:** pré-visualização sempre grátis; download grátis agora, pago no futuro.
- **Plataformas:** web + Android primeiro; iOS depois.

## Visão geral

| Fase | Nome | Objetivo | Critério de saída |
|---|---|---|---|
| 0 | Fundações | Base técnica e dados de tecnologia | 25+ profissões publicadas com caminho completo; 30+ instituições com cursos e preços; 4+ semanas seguidas de vagas recolhidas |
| 1 | MVP "Kayé Tech" | Primeiro valor real para os jovens | 100 utilizadores registados; as 5 métricas medidas durante 4 semanas |
| 2 | Voltar sempre | Fazer as pessoas voltar e dar-lhes identidade profissional | Retenção semanal a subir (alvo definido com os números da Fase 1) |
| 3 | Monetização | Premium e pagamentos | Primeiras assinaturas pagas; taxa de conversão medida |
| 4 | Marketplace e parcerias | Mentores e instituições | Primeiros mentores e instituições ativos |
| 5 | Kayé Verificado | Profissionais comprovados | Primeiras certificações com um centro de formação |

## Fase 0 — Fundações

### 0.1 Base técnica
- [x] Repositório único (`apps/api`, `apps/web`, `scrapers`, `docs`) em `C:\Projects\kaye`
- [x] Laravel + MySQL local, com o Filament instalado
- [x] React + TypeScript + Vite + Tailwind + i18n (pt/en/fr) + Capacitor Android (projeto Android criado; falta compilar no Android Studio)
- [x] Metodologia DevOps ([engenharia.md](engenharia.md)):
  - portões de qualidade, Definição de Pronto e hooks do git;
  - documentação de código, base de dados, segurança, observabilidade e infraestrutura.
- [x] Testes: PHPUnit (MySQL real), Vitest com 100% de cobertura, E2E com Playwright e axe
- [x] Segurança base:
  - cabeçalhos e CSP;
  - limite de pedidos;
  - CORS;
  - painel com papel e lista de emails;
  - `kaye:check-production`.
- [x] Observabilidade base: logs JSON com `request_id`, saúde com base de dados, Sentry na API (falta a conta e o DSN)
- [x] Containers: imagem de produção + `compose.yaml`, testados com o teste de fumo e o E2E
- [x] CI no GitHub Actions: qualidade, testes, container, segurança e pacote de release (corre quando o repositório estiver no GitHub)
- [ ] Repositório no GitHub, com proteção do `main`
- [ ] Login Google de ponta a ponta (web com cookie, Android com token)
- [ ] Hostinger: staging e produção, cron, HTTPS, Cloudflare, workflow de deploy
- [ ] Sentry: conta, DSN e Sentry na app React
- [ ] Monitor de disponibilidade (UptimeRobot ou Better Stack)

### 0.2 Recolha de vagas (cedo: o histórico só se ganha com tempo)
- [ ] Levantar as fontes: sites de emprego angolanos e canais/páginas de WhatsApp com vagas tech; verificar termos e `robots.txt`
- [ ] Scraper para 1–2 sites, semanal, a guardar o bruto
- [ ] `/ingest/jobs`, normalização e remoção de duplicados
- [ ] "Colar vaga" no admin (para o WhatsApp)

### 0.3 Modelo de dados e taxonomia
- [ ] Migrações: taxonomia, formação, mercado, utilizadores
- [ ] Importar da ESCO as profissões tech (grupos ISCO 133, 25, 35, 2153, 2166, 2356, 2434) e as suas competências, em pt/en/fr

### 0.4 Curadoria (o trabalho mais importante desta fase)
- [ ] Fechar a lista de profissões do MVP (proposta no Anexo A)
- [ ] Para cada profissão: descrição adaptada a Angola, dia a dia, perfil RIASEC, competências essenciais e 1–3 caminhos de formação
- [ ] Instituições de Luanda com cursos de TI (universidades, institutos médios técnicos, centros de formação), com preços e requisitos. Fontes: sites oficiais, telefonemas, visitas, listas do MESCTI e do INEFOP.
- [ ] 200+ aliases de títulos de vagas
- [ ] Classificar as vagas já recolhidas, com fila de revisão
- [ ] Primeiro cálculo de `market_stats`

### O que só tu podes fazer
- Ativar a autenticação de dois fatores (2FA) no GitHub, Google, Hostinger e Cloudflare
- Criar as contas gratuitas do Sentry e do UptimeRobot
- Listar os sites de emprego e os canais de WhatsApp que conheces
- Confirmar o plano da Hostinger: acesso SSH, PHP 8.4 ou mais recente (o Laravel 13 exige), data center
- Registar o domínio
- Criar o projeto no Google Cloud (credenciais do login Google)
- Recolher preços e requisitos das instituições (telefonemas e visitas)

## Fase 1 — MVP "Kayé Tech: descobre o teu lugar na tecnologia"

| # | Bloco | Inclui |
|---|---|---|
| 1.1 | Entrada | Explorar sem conta; login Google; onboarding com consentimentos; fluxo para menores |
| 1.2 | Teste vocacional | 42 perguntas RIASEC em pt/en/fr, com progresso guardado. Resultado: perfil nas 6 dimensões, top 5 profissões com razões, e a área forte fora da tech marcada "em breve". |
| 1.3 | Carreiras | Página completa: o que faz, dia a dia, competências, faixa salarial com fonte, procura, empresas que contratam, vagas recentes, caminhos, instituições. Rankings "mais procuradas" e "mais bem pagas". Guardar carreiras. |
| 1.4 | Formação | Instituições e cursos com filtros; comparar até 3 cursos; custo total do caminho |
| 1.5 | Vagas | Lista de vagas tech com filtros e link para a vaga original |
| 1.6 | CV | Editor por secções, 3 modelos, pré-visualização, download em PDF (grátis) |
| 1.7 | Contribuições | Testemunhos moderados; reportar erro; partilhar vaga; partilhar salário (18+, anónimo) |
| 1.8 | Gamificação leve | XP por ações úteis (terminar o teste, completar o perfil, contribuição aprovada), 6–8 badges, barra de progresso |
| 1.9 | Conta e privacidade | Exportar dados, apagar conta, política de privacidade e termos em pt/en/fr |
| 1.10 | Métricas | Eventos; painel das 5 métricas no admin; inquérito "Como te sentirias se o Kayé deixasse de existir?" após 2 semanas de uso |
| 1.11 | Lançamento | Web pública; Android na Google Play |

**Atenção à Google Play.** As contas pessoais novas precisam de um teste fechado com pelo menos 12 testadores durante 14 dias seguidos antes de publicar. Convém começar este teste antes de a app estar "perfeita".

**Os dados também são o marketing.** Os números do próprio Kayé dão conteúdos para TikTok e Instagram ("As 5 profissões tech mais procuradas em Luanda esta semana", "Quanto custa tornar-se programador em Angola?"). Cada publicação leva à página de carreira correspondente.

**Critério de saída:** 100 utilizadores registados; as 5 métricas (Anexo B) medidas durante 4 semanas; pelo menos 30 respostas ao inquérito.

## Fase 2 — Voltar sempre

- Página pública do profissional, cartão de visita com QR e "guardar contacto" (vCard)
- Alertas de vagas por profissão ou competência (email e push)
- "O meu plano": escolher uma carreira-alvo e seguir os passos, com progresso e sequências semanais
- Transição de carreira: as competências que já tens contra as que faltam para a profissão-alvo (a ESCO já liga profissões e competências)
- Gráficos de tendência semana a semana
- Páginas de carreira públicas que o Google consegue indexar (aquisição orgânica)
- Extração de vagas com IA a partir de texto livre; mais fontes
- iOS + "Iniciar sessão com a Apple"
- Segundo setor, escolhido com dados: o que os utilizadores mais pedem e a área forte mais comum fora da tech

**Critério de saída:** retenção semanal a subir face à base da Fase 1.

## Fase 3 — Monetização

- Decidir com dados o que é premium. Candidatos: download do CV e modelos extra, cartão QR personalizado, alertas avançados, histórico e comparações detalhadas.
- Testar o preço (entre 2.000 e 2.999 Kz/mês).
- Pagamento na web com Multicaixa Express ou referência, através de um gateway local.
- Nas lojas: escolher entre a faturação da Apple/Google ou o premium só na web, conforme as regras de cada loja.
- O servidor já verifica permissões (`cv.export` e outras): ativar o premium é mudar regras, não reescrever a app.

**Critério de saída:** primeiras assinaturas pagas e taxa de conversão medida.

## Fase 4 — Marketplace e parcerias

- **Mentores:** perfil, verificação, taxa para aparecer, preço livre, marcação de sessões. As sessões 1:1 ao vivo podem ser pagas fora da loja da Apple (regra 3.1.3(d)).
- **Instituições:**
  - reclamam a sua página e atualizam cursos e preços;
  - o aluno apresenta um código de referência Kayé na matrícula;
  - o conteúdo pago aparece sempre marcado "Patrocinado" e fica fora da fórmula de recomendação.
- **Publicidade:** sempre marcada e nunca com dados individuais.
- **Sites de emprego:** parcerias para receber as vagas diretamente, em vez de as recolher.

## Fase 5 — Kayé Verificado

- Quizzes por competência: banco de perguntas, ordem aleatória, tempo e tentativas limitados.
- Badges verificados no perfil público e no CV.
- Provas com centros de formação para quem já tem experiência, com certificado pago ao centro.
- Os salários de profissionais verificados passam a pesar mais nas estatísticas.

## Fora do âmbito por agora

| O quê | Porquê |
|---|---|
| Pagamentos | Primeiro as funcionalidades |
| Mentores e instituições | Sem tração, os parceiros ainda não ouvem |
| Fórum ou chat aberto | Moderação pesada e público com menores; os testemunhos moderados chegam |
| iOS | Custo anual e regras extra; o Android domina em Angola |
| Outros setores | Fazer bem a tecnologia primeiro |
| Testes de aptidão cognitiva | Caros de criar e validar |
| Automação de WhatsApp | Viola os termos do WhatsApp |
| LinkedIn | Proíbe scraping |

## Anexo A — Profissões do MVP (proposta)

| Grupo | Profissões |
|---|---|
| Desenvolvimento | Desenvolvedor Frontend, Desenvolvedor Backend, Desenvolvedor Full-stack, Desenvolvedor Mobile, Engenheiro de QA/Testes |
| Dados | Analista de Dados, Analista de BI, Cientista de Dados, Engenheiro de Dados, Administrador de Base de Dados |
| Infraestrutura | Administrador de Sistemas, Administrador de Redes, Engenheiro DevOps/Cloud, Técnico de Suporte (Helpdesk), Técnico de Manutenção de Hardware |
| Segurança | Analista de Cibersegurança |
| Telecomunicações | Técnico de Telecomunicações, Engenheiro de Telecomunicações |
| Design | Designer UI/UX, Designer Gráfico e Multimédia |
| Gestão e negócio | Analista de Sistemas/Negócio, Gestor de Projetos de TI, Product Manager, Gestor de TI, Comercial de TI |
| Educação | Formador de TIC |
| Digital | Gestor de Marketing Digital e Redes Sociais |

São 27 profissões, que cobrem os 6 perfis RIASEC.

## Anexo B — As 5 métricas do MVP

| Métrica | O que responde |
|---|---|
| Utilizadores registados | Chegámos aos 100? |
| % que termina o teste vocacional | O teste é bom ou cansativo? |
| % que volta na semana seguinte | O Kayé é útil ou só uma curiosidade? |
| % que abre um caminho de carreira ou cria um CV | As pessoas chegam ao que importa? |
| "Como te sentirias se o Kayé deixasse de existir?" | 40% ou mais a responder "muito desapontado" é sinal de que o produto encaixa no mercado |
