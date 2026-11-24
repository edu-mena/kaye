# Kayé — Roadmap

Versão 2 · 23 de outubro de 2026 (v1: 19 de outubro) · Equipa: Eduardo + Claude

Este roadmap não tem datas: cada fase termina quando cumpre o seu **critério de saída**. A arquitetura está em [arquitetura.md](arquitetura.md).

## Decisões de produto

- **Orientação, não emprego.** O Kayé é uma app de orientação vocacional e profissional, não um site de emprego. Mostra:
  - o que cada profissão faz e exige;
  - as características de quem a exerce;
  - o caminho até lá: percurso académico, formação profissional e histórico profissional;
  - onde estudar;
  - o encaixe da pessoa com cada área.

  As vagas servem só como dados agregados e nunca são publicadas.
- **Começar só pela tecnologia** ("Kayé Tech"), em Luanda. Os outros setores entram depois, escolhidos com dados.
- **Tudo grátis no início.** Primeiro as funcionalidades, depois os pagamentos.
- **Parcerias só depois** de haver tração.
- **Transparência total:** cada número diz de onde vem e quando foi atualizado.
- **As instituições nunca recebem dados individuais** de estudantes.
- **Os utilizadores ajudam a construir os dados:** salários anónimos, vagas (só como dados), avaliações de cursos, correções.
- **CV:** pré-visualização sempre grátis; download grátis agora, pago no futuro.
- **Plataformas:** web + Android primeiro; iOS depois.

## Visão geral

| Fase | Nome | Objetivo | Critério de saída |
|---|---|---|---|
| 0 | Fundações | Base técnica e dados de tecnologia | 25+ profissões publicadas com caminho completo (percurso académico, formação profissional, etapas da carreira) e características; 30+ instituições com cursos, preços e reconhecimento oficial; CVs modelo para 10+ profissões; 4+ semanas seguidas de vagas recolhidas |
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
- [x] Repositório privado no GitHub ([edu-mena/kaye](https://github.com/edu-mena/kaye)), com o CI a correr nos PRs
- [ ] Proteção do `main` (exige GitHub Pro nos repositórios privados: Student Developer Pack)
- [ ] Login Google de ponta a ponta (web com cookie, Android com token): o servidor e a app web estão feitos e testados (16/11/2026); faltam os IDs de cliente OAuth e, no Android, o plugin nativo do Google
- [x] Hostinger no endereço temporário (20/11/2026): Git do hPanel ligado ao ramo `deploy`, `.env`, base de dados, cron a bater todos os minutos, segredos do GitHub e workflow `deploy.yml` a correr de ponta a ponta (build, publicação, `post-deploy.sh` por SSH e teste de fumo de fora, tudo verde). O guia [guia-hostinger.md](guia-hostinger.md) reflete o que o primeiro deploy real ensinou
- [ ] Hostinger: staging, domínio próprio e Cloudflare
- [x] Hostinger: a PWA no `.htaccess` e no `SecurityHeaders`: `worker-src 'self'` e `manifest-src 'self'` na CSP, `Cache-Control: no-cache` para `/spa/sw.js` e `/spa/manifest.webmanifest`, e `Service-Worker-Allowed: /` no `sw.js` (os ficheiros estão em `/spa/`, as páginas em `/`). No Vercel já está feito (`apps/web/vercel.json`)
- [ ] Sentry: conta, DSN e Sentry na app React
- [ ] Monitor de disponibilidade (UptimeRobot ou Better Stack)

### 0.2 Recolha de vagas, só como dados (cedo: o histórico só se ganha com tempo)
- [x] Primeiras 5 fontes avaliadas (`robots.txt`, feeds e termos): [fontes-de-vagas.md](fontes-de-vagas.md)
- [ ] Avaliar as outras fontes e os canais de WhatsApp; pedir autorização onde os termos o exigem
- [x] Primeira recolha (27/10/2026): AngoVagas, Ango Emprego, AngoRecruta, Jobartis e Ver Angola Empregos, só factos, em `scrapers/` ([ADR 0008](decisoes/0008-recolha-de-vagas-de-todos-os-sites.md))
- [x] Recolha automática (GitHub Actions) e envio para a API
  - [x] Recolha semanal no GitHub Actions (`market-data.yml`): os factos num artefacto de 90 dias, as contagens num pull request
  - [x] Corrida leve de 2 em 2 horas (só as primeiras páginas, só o que é novo) que envia os factos para `/ingest/jobs`; liga-se com o segredo `INGEST_TOKEN` (segredo de repositório, não de ambiente) e a variável `KAYE_API_URL`; verificado a 22/11/2026: 147 vagas enviadas à Hostinger, 146 guardadas
  - [x] Novidades de Angola a entrar sozinhas: `kaye:fetch-news` de 2 em 2 horas ([fontes-de-noticias.md](fontes-de-noticias.md))
  - [x] Comentários nas notícias, empresas e simulações (só com conta, filtro, denúncias)
- [x] `/ingest/jobs` e remoção de duplicados por `external_id` (a normalização e a classificação já vêm dos scrapers)
- [ ] "Colar vaga" no admin (para o WhatsApp)

### 0.3 Modelo de dados e taxonomia
- [ ] Migrações: taxonomia, formação, mercado, utilizadores
- [ ] Importar da ESCO as profissões tech (grupos ISCO 133, 25, 35, 2153, 2166, 2356, 2434) e as suas competências, em pt/en/fr

### 0.4 Curadoria (o trabalho mais importante desta fase)
- [ ] Fechar a lista de profissões do MVP (proposta no Anexo A)
- [ ] Para cada profissão:
  - descrição adaptada a Angola, dia a dia e contexto de trabalho;
  - características profissionais (perfil RIASEC e estilos de trabalho);
  - competências essenciais;
  - 1 a 3 caminhos, com o percurso académico e a formação profissional;
  - as etapas da carreira (estágio → júnior → pleno → sénior), com os anos típicos de cada uma.
- [ ] CVs modelo de pessoas fictícias para as 10 profissões mais procuradas: primeiro emprego e júnior, com notas que explicam cada parte
- [ ] Instituições de Luanda com cursos de TI (universidades, institutos médios técnicos, centros de formação), com:
  - preços e requisitos;
  - **reconhecimento oficial** (MESCTI, MED, INEFOP).

  Fontes: sites oficiais, telefonemas, visitas, listas do MESCTI e do INEFOP.
- [ ] 200+ aliases de títulos de vagas
- [ ] Classificar as vagas já recolhidas, com fila de revisão
- [ ] Primeiro cálculo de `market_stats`
- [ ] Dados de educação para o Mercado (`education_stats`): inscritos e diplomados por curso, área e província, do INE e do Anuário Estatístico do Ensino Superior (MESCTI), com o ano e a fonte
  - [x] Diplomados de 2018 por curso (INE, Anuário 2019) e os totais de 2014 e 2023/24 (Expansão), em `apps/web/src/data/market/education.json`
  - [x] Os anuários de 2022-2023 e 2023-2024 (MESCTI, publicados pelo INE em agosto de 2026): o Mercado usa os diplomados por curso de 2023/24 e os totais dos dois anos
  - [x] Estudantes por curso, candidatos e novos estudantes de 2023/24 (Quadros 5.7 e 1.2 do mesmo anuário)

### O que só tu podes fazer
- [x] 2FA no GitHub, Google, Hostinger e Cloudflare
- [x] Contas do Sentry e do UptimeRobot
- [x] Projeto no Google Cloud
- [ ] Pôr a chave SSH do Kayé no hPanel (a senha nunca vai para a conversa)
- [ ] Criar os IDs de cliente OAuth (web e Android) no Google Cloud
- [ ] Enviar o DSN do Sentry
- [ ] Ler os termos do angovagas no browser; enviar os pedidos de autorização ([modelo](fontes-de-vagas.md#pedido-de-autorização-modelo))
- [ ] Mandar o resto da lista de sites de emprego e os canais de WhatsApp
- [ ] Registar o domínio
- [ ] Recolher preços, requisitos e reconhecimento oficial das instituições (telefonemas e visitas)

## Fase 1 — MVP "Kayé Tech: descobre o teu lugar na tecnologia"

| # | Bloco | Inclui |
|---|---|---|
| 1.1 | Entrada | Explorar sem conta, registo ao guardar (ADR 0021); login Google; onboarding com consentimentos; fluxo para menores |
| 1.2 | Teste vocacional | Duas partes, para todas as áreas ([ADR 0017](decisoes/0017-teste-vocacional-geral-com-valencias.md)). **1. O que gostas:** 42 frases RIASEC do dia a dia, em pt/en/fr, com progresso guardado. **2. O que já sabes** (opcional, 7 passos que se podem saltar): línguas, competências digitais, ofícios da área, competências transversais, o que já fez, como gosta de trabalhar e condições. Resultado: perfil nas 6 dimensões, 6 profissões de todas as áreas com razões (interesses, competências que já tem, caminho possível; pelo menos uma sem ensino superior), resumo das valências e "Leva para o teu CV". |
| 1.3 | Carreiras | A página completa de cada profissão ([arquitetura, 7](arquitetura.md#página-de-uma-carreira)): o que faz, características profissionais, o que os empregadores pedem em Angola, percurso académico, formação profissional, etapas da carreira, custo, mercado e salários com fonte. Rankings "mais procuradas" e "mais bem pagas". Guardar carreiras. |
| 1.4 | Encaixe | Em cada carreira: interesses (teste), formação (o que falta) e competências (a pessoa marca o que sabe). Mostra o que falta como próximos passos |
| 1.5 | Formação | Instituições e cursos com filtros; **as melhores instituições para cada curso**, com critérios públicos ([arquitetura, 5.7](arquitetura.md#57-as-melhores-instituições-para-cada-curso)); comparar até 3 cursos; custo total do caminho |
| 1.6 | CV | Editor por secções, 8 modelos visuais (com foto, duas colunas, minimalista, criativo, com destaque), pré-visualização, PDF grátis. **Vários CVs** com estilo próprio (fontes, tamanhos, margens, espaços, cores, caixas e separadores), igual no ecrã e no PDF. **Conselhos por área e destino**, com modelo sugerido a um clique. **Preenchimento com um clique** a partir do que a pessoa já disse, sempre com confirmação. **CVs modelo por profissão**, com notas, e "começar a partir deste modelo" |
| 1.7 | Contribuições | Testemunhos moderados, com nota para os cursos; reportar erro; partilhar vaga (só como dado); partilhar salário (18+, anónimo) |
| 1.8 | Gamificação leve | XP por ações úteis (terminar o teste, completar o perfil, contribuição aprovada), 6–8 badges, barra de progresso |
| 1.9 | Conta e privacidade | Exportar dados, apagar conta, política de privacidade e termos em pt/en/fr |
| 1.10 | Métricas | Eventos; painel das 5 métricas no admin; inquérito "Como te sentirias se o Kayé deixasse de existir?" após 2 semanas de uso |
| 1.11 | Lançamento | Web pública e instalável (PWA, abre sem rede); Android na Google Play |

**Atenção à Google Play.** As contas pessoais novas precisam de um teste fechado com pelo menos 12 testadores durante 14 dias seguidos antes de publicar. Convém começar este teste antes de a app estar "perfeita".

**Canais de instalação.** A Google Play é o canal principal. A PWA é a porta de entrada de quem chega por um link do WhatsApp: instala-se a partir do browser (no iPhone, com um guia curto "Partilhar → Adicionar ao ecrã principal"). Sem APK para descarregar (avisos de "fonte desconhecida") e sem App Store por agora (99 USD/ano, exige um Mac, poucos iPhones no público).

**Os dados também são o marketing.** Os números do próprio Kayé dão conteúdos para TikTok e Instagram ("As 5 profissões tech mais procuradas em Luanda esta semana", "Quanto custa tornar-se programador em Angola?"). Cada publicação leva à página de carreira correspondente.

**Critério de saída:** 100 utilizadores registados; as 5 métricas (Anexo B) medidas durante 4 semanas; pelo menos 30 respostas ao inquérito.

## Fase 2 — Voltar sempre

- "Guardar contacto" (vCard) na página pública. O cartão de visita (10 modelos, dados e aspeto editáveis), a página pública e o QR já existem no site de teste; falta passá-los para o Laravel ([ADR 0014](decisoes/0014-pagina-publica-do-cartao.md))
- [x] Kursos (`/kursos`): Inglês A1 em versão de teste, ao estilo de um livro técnico; unidades 1 e 2 escritas, exame final e certificado sem validade no aparelho (ADR 0016). Faltam as unidades 3 a 8
- [x] Kursos: Fundamentos da Gestão de Projetos em versão de teste (ADR 0016, nota de 13/11/2026); unidades 1 e 2 escritas, com exame e certificado. Faltam as unidades 3 a 6 (âmbito e EAP, cronograma, orçamento e riscos, acompanhar e fechar) e a revisão do conteúdo
- [x] Kursos: Fundamentos da Cibersegurança em versão de teste (ADR 0016, nota de 13/11/2026); unidades 1 e 2 escritas, com exame e certificado. Faltam as unidades 3 a 6 (o telemóvel seguro, redes e navegação, privacidade e redes sociais, carreiras em cibersegurança) e a revisão do conteúdo
- [x] Kursos: Fundamentos do Marketing Digital em versão de teste (ADR 0016, nota de 13/11/2026); unidades 1 e 2 escritas, com exame e certificado. Faltam as unidades 3 a 6 (conteúdo e calendário, anúncios pagos básicos, métricas, ética e lei) e a revisão do conteúdo
- [x] Kursos: Programação: Nível Iniciante (Python) em versão de teste (ADR 0016, nota de 13/11/2026); unidades 1 e 2 escritas, com exame e certificado. Faltam as unidades 3 a 6 (decisões, repetições, funções, listas e um pequeno projeto) e a revisão do conteúdo
- [x] Kursos: Fundamentos da Análise de Dados em versão de teste (ADR 0016, nota de 13/11/2026); unidades 1 e 2 escritas, com exame e certificado. Faltam as unidades 3 a 6 (resumir, gráficos, folha de cálculo, contar uma história com dados) e a revisão do conteúdo. Seguem-se, um de cada vez: Economia, Contabilidade
- [x] "Mostrar à família": na carreira, um PDF de uma página criado no telemóvel (o que faz, salários, procura, custo do curso, reconhecimento, como pagar, testemunho real e, se o jovem quiser, as razões do teste só com o primeiro nome), para enviar pelo WhatsApp ou imprimir. Falta a ficha do curso ("este curso, nesta instituição": propina, duração, exame de acesso), depois do 1A/1B
- [x] Modo para pais e encarregados: "Mostrar à família" oferece "Enviar link" e "PDF". O link abre `/familia`, pública, com o que o teste diz e até 3 carreiras (o que faz, procura, onde estudar, reconhecimento, custo, bolsas, caminho mais curto, "como podem ajudar"); os dados vão no `#` e nada fica no servidor; salários só para maiores ([ADR 0018](decisoes/0018-link-da-familia-com-dados-no-fragmento.md))
- Notificações push dos prazos (`/prazos`), mesmo com a app fechada: precisam de backend (guardar o token do telemóvel e um cron que envia)
- [x] Não perder um prazo e partilhar pelo WhatsApp, sem servidor (nota de 13/11/2026): "Adicionar ao calendário" (.ics com alarme 3 dias antes) nas bolsas, estágios, admissões (academia e curso), eventos das Novidades, passos do plano e `/prazos`; estrela "Lembrar-me" em cada prazo, que o junta a "Só para mim" e às Notificações a 14 dias ou menos (só no telemóvel, `remindedDeadlines`); botão "Partilhar" (folha de partilha do telemóvel ou `wa.me`) na carreira, no resultado do teste (só o código RIASEC e 3 carreiras, primeiro nome só se a pessoa quiser), na bolsa, estágio e admissão (com o prazo no texto), no curso, na academia, na empresa e na notícia; cada bolsa e estágio tem um link estável (`#opportunity-id`); quem abre um link sem conta vê a landing com "Entra para ver isto" e volta ao mesmo endereço depois de entrar; pré-visualização geral no WhatsApp (`og:*` e imagem 1200×630 com o texto atual). Falta, com o servidor: notificações push (acima) e pré-visualizações por página (título, texto e imagem da carreira, bolsa ou curso partilhado), que precisam de HTML gerado no servidor para os robôs do WhatsApp
- [x] Caminhos sem ensino superior (`/sem-universidade`, nota de 13/11/2026): 14 ofícios novos com guia completo e foto com licença (canalizador, serralheiro, pedreiro, carpinteiro, técnico de frio, instalação solar, mecânico auto e de motos, motorista profissional, costureiro, cabeleireiro, esteticista, cozinheiro, pasteleiro, agricultor e criador; o novo grupo "Beleza e cuidados pessoais"), 3 centros do INEFOP com fonte, e uma página com 4 blocos (aprender um ofício, onde aprender, trabalhar por conta própria, do informal ao formal). Filtro e selo "Sem licenciatura" nas carreiras; entradas no menu, no início (para quem disse no teste que precisa de trabalhar já ou quer estudar pouco) e no resultado do teste. Procura, duração e custo dos ofícios estimados (`estimated: true`). Falta: confirmar os cursos e as datas de cada centro do INEFOP, mais centros fora de Luanda e do Uíge, e as regras da carta de condução profissional
- [x] "O meu plano" (`/plano`, nota de 13/11/2026): escolher uma carreira e um caminho e seguir os passos (estudar, candidatar, aprender, preparar), com progresso, "Esta semana" e passos que se fecham sozinhos (CV a 100%, Kurso concluído, treino e entrevista feitos; prazo passado fica "perdido"). Só no telemóvel (`userStore`); os prazos a 7 dias ou menos entram nas Notificações e no sino ao abrir a app. Falta, com o servidor: lembretes push semanais, mesmo com a app fechada, e guardar o plano na conta
- Transição de carreira: para quem já trabalha noutra área, as competências e a experiência que já tem contra as que faltam (a ESCO já liga profissões e competências)
- Ligação ao mercado na classificação dos cursos (quem fez o curso e trabalha na área)
- Mais CVs modelo (nível experiente, todas as profissões)
- Gráficos de tendência semana a semana
- Páginas de carreira públicas que o Google consegue indexar (aquisição orgânica)
- Extração de vagas com IA a partir de texto livre; mais fontes
- iOS + "Iniciar sessão com a Apple"
- Segundo setor, escolhido com dados: o que os utilizadores mais pedem e a área forte mais comum fora da tech

**Critério de saída:** retenção semanal a subir face à base da Fase 1.

## Para fechar (13 de novembro de 2026)

Decisão: fechar o que já existe antes de abrir frentes novas. A primeira tarefa é o teste vocacional geral, para todas as áreas, que recolhe também as valências que vão para o CV. As ideias abaixo, aprovadas pelo Eduardo, guiam o fecho.

- [x] Teste vocacional geral, para todas as áreas, com as valências que vão para o CV ([ADR 0017](decisoes/0017-teste-vocacional-geral-com-valencias.md))

**Distribuição**
- **Programa para escolas** (ensino médio e institutos técnicos): uma sessão de orientação e o teste feito em turma. É o canal mais barato para chegar aos 14–18 anos; a privacidade forte do Kayé é o argumento para o diretor dizer sim.
- **WhatsApp como canal principal:** links partilháveis para tudo (resultado do teste, carreira, bolsa), com pré-visualização bonita. Os links e a pré-visualização geral estão feitos; a pré-visualização por página espera pelo servidor. As páginas públicas de carreira, indexáveis no Google, trazem visitas sem custo.
- **Embaixadores** em universidades e escolas, com o XP e os badges que já existem.

**Produto**
- [x] **"O meu plano"** (Fase 2): passa o Kayé de consulta pontual a acompanhamento. Feito a 13/11/2026, só no telemóvel.
- [x] **Alertas de prazos** de bolsas e candidaturas: calendário, estrela e Notificações feitos a 13/11/2026 (ver a Fase 2); o push com a app fechada precisa do servidor.
- [x] **Preparação para os exames de acesso** às universidades públicas (`/exames-de-acesso`, 15/11/2026): escolhe-se o curso e a instituição e veem-se as disciplinas, datas, vagas, taxa e fonte; treino com correção (10 perguntas) e simulação com tempo (30 perguntas em 60 minutos), notas por tema e explicação de cada erro. 260 perguntas originais de Matemática e Língua Portuguesa (ver `recolha-de-dados.md`); Física, Química, Biologia, História e Geografia ficam "em breve". Entradas: cartão em `/testes`, "Prepara-te para o exame" no curso e na academia, passo no "O meu plano".
- **Testemunhos curtos em vídeo** de jovens profissionais angolanos ("o meu dia como técnico de redes"). A interface está pronta e vazia desde 15/11/2026 (bloco "O meu dia como…" na carreira, "Histórias novas" no início e nas Novidades); falta gravar: ver [videos.md](videos.md).
- [x] **Caminhos sem ensino superior:** formação técnica, INEFOP, ofícios, autoemprego e economia informal. Feito a 13/11/2026: ver a Fase 2.
- [x] **Modo para pais e encarregados:** uma página que explica o resultado do filho, para além do PDF (`/familia`, ADR 0018).
- [x] **Simulações de trabalho** (23/11/2026): um dia de cada uma das 13 áreas, com decisões, autoria dos agentes Kayé ("Equipa Kayé" até haver agentes), marca "Exemplo", "gostei" a alimentar o perfil de interesse e comentários: ver [mentores.md](mentores.md#simulações-de-trabalho). Falta a revisão de cada uma por um agente e a tradução para en e fr.
- **Mentores** começados à mão, com 5 a 10 voluntários, antes de haver marketplace (Fase 4). A página `/mentores` e o pedido por WhatsApp ou email estão prontos e vazios desde 15/11/2026; falta aprovar os primeiros: ver [mentores.md](mentores.md).

- [x] **Fecho do frontend** (13/11/2026): revisão de coerência (texto "Kayé Tech" fora dos termos e da privacidade, menores sem salários em lado nenhum, links antigos só como redirecionamento), tutorial com os passos "Sem universidade" e "Exames de acesso", pesquisa com as pessoas das empresas e as páginas da app, fotos de 1600 px até 150 KB. Revisto a 15/11/2026, depois dos exames de acesso, vídeos e mentores: o passo "Exames de acesso" do tutorial leva agora a `/exames-de-acesso`; os blocos vazios de vídeos e mentores não aparecem.

**Receita, sem comprometer a neutralidade**
- **B2B e institucional:** escolas, governo provincial, INEFOP e programas de responsabilidade social dos bancos (como o Futuro BFA) pagam pelo serviço de orientação, com relatórios só agregados.
- **Instituições** pagam para gerir a sua página e os preços, sempre marcadas e fora das recomendações.
- **Financiamento de impacto:** UNICEF, PNUD, Banco Mundial e fundações de empregabilidade jovem.
- **Premium para o utilizador**, só depois e barato: modelos extra de CV, revisão humana do CV, simulação de entrevista com feedback.

### Espera pelo servidor

O frontend está fechado; o que falta precisa do Laravel na Hostinger:

- [ ] Login Google de ponta a ponta (web com cookie, Android com token): o servidor e a app web estão feitos e testados (16/11/2026); faltam os IDs de cliente OAuth e, no Android, o plugin nativo do Google
- [ ] Hostinger: staging e produção, cron, HTTPS e a PWA no `.htaccess` (Fase 0)
- [ ] Notificações push dos prazos e do plano, mesmo com a app fechada: os prazos guardados com "Lembrar-me" já têm lembrete por email e Web Push (18/11/2026, 3 dias antes); faltam os lembretes semanais do plano e o push nativo no Android (FCM)
- [ ] Pré-visualizações por página no WhatsApp (título, texto e imagem da carreira, bolsa ou curso), com HTML gerado no servidor
- [ ] Painel B2B só com dados agregados, para escolas, INEFOP e programas de responsabilidade social
- [ ] Páginas geridas pelas próprias instituições (preços e dados), sempre marcadas e fora das recomendações
- [ ] Premium (Fase 3)
- [ ] Mentores com marcação de sessões (Fase 4)

## Fecho do backend (15 de novembro de 2026)

O Laravel passa a servir tudo, sem perder nenhum dado do frontend ([ADR 0019](decisoes/0019-backend-e-migracao-dos-dados.md)); o modelo de dados está em [base-de-dados.md](base-de-dados.md#modelo-completo-adr-0019) e as rotas em [arquitetura.md, secção 6](arquitetura.md#6-api-v1). Um prompt de cada vez, por esta ordem, com os testes e os gates completos (`CLAUDE.md`).

- [x] 0. Decisão e modelo de dados: ADR 0019, tabelas e rotas
- [x] 1. Exportar os dados do frontend para JSON de paridade, com `manifest.json`
- [x] 2. Migrações, modelos e `kaye:import` idempotente: base de dados cheia
- [x] 3. API pública v1 com teste de paridade e o frontend a ler do Laravel (`VITE_DATA_SOURCE`)
- [x] 4. Contas: login Google de ponta a ponta, perfil e dados do aparelho fundidos no servidor (16/11/2026; para entrar a sério faltam os IDs de cliente OAuth e, no Android, o plugin nativo do Google)
- [x] 5. Lista de espera, críticas, entrevistas e cartões: das funções do Vercel para o Laravel, Redis migrado (18/11/2026; o comando `kaye:migrate-redis` está pronto, falta corrê-lo com as credenciais do Upstash)
- [x] 6. Comunicação: email e Web Push, só com consentimento (menores sem marketing), feito a 18/11/2026: confirmação dupla e "deixar de receber" assinados, campanhas em lotes no painel, lembretes dos prazos guardados, preferências nas Definições. Sem WhatsApp (o Eduardo manda à mão a partir do CSV) nem push nativo no Android (FCM), que ficam para depois
- [ ] 7. Segurança e observabilidade: revisão completa, cópias de segurança, monitor
- [ ] 8. Ligação à IA: servidor MCP e pesquisa com o Claude, só rascunhos com fonte; tradução do conteúdo para en e fr, também como rascunhos
- [ ] 9. Painel de administração completo, com o design do site
- [ ] 10. Ensaio geral em local (Docker igual à Hostinger) e passagem para a Hostinger

## UX da home, áreas e Kayé Plus (24 de novembro de 2026)

Sem commit até ao fim: tudo na branch `feat/web-home-for-you`, num só PR depois dos testes.

- [x] Menu completo e agrupado (Descobrir, Preparar-te, Oportunidades, Para ti), igual na barra lateral e no menu do telemóvel
- [x] Áreas (`/areas`, `/areas/:area`), `RelatedRail` e as ligações entre carreiras, cursos, institutos e empresas
- [x] Home «Para ti»: sequência, desafio do dia, novidades da área, feed e jornada
- [x] Kayé Plus atrás de uma flag desligada (ADR 0024): `PlusGate`, cartão, `/plus`, lista de espera própria
- [x] Testes de tudo o que ficou por testar (domínio puro, `RelatedRail`, `PlusGate`, acessibilidade da home, e2e do menu e da home) e corrigir os que partiram (24/11/2026)
- [ ] Escolher o meio de pagamento do Plus em Angola (Multicaixa Express, Unitel Money…) e ligar `isPlus` à conta
- [ ] Fluxo com o encarregado de educação para menores usarem o Plus (hoje ficam fora, com tudo aberto)
- [ ] Rever os Termos e a política de privacidade, e a landing (`home.freeBadge`: passa a dizer que *explorar* é grátis), antes de ligar `VITE_PLUS_ENABLED`

## Fase 3 — Monetização

O primeiro passo está decidido no [ADR 0024](decisoes/0024-plano-kaye-plus.md): Kayé Plus a 1.999 Kz/mês, atrás de uma flag, ainda sem cobrar.

- Decidir com dados o que é premium. Candidatos: download do CV e modelos extra, cartão QR personalizado, "O meu plano" com acompanhamento, histórico e comparações detalhadas.
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
| Quadro de vagas (lista, pesquisa, candidaturas, alertas) | O Kayé orienta, não recruta; as vagas servem só como dados |
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
| % que vê o seu encaixe numa carreira, abre um caminho ou cria um CV | As pessoas chegam ao que importa? |
| "Como te sentirias se o Kayé deixasse de existir?" | 40% ou mais a responder "muito desapontado" é sinal de que o produto encaixa no mercado |
