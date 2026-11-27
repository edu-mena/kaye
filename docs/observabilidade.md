# Observabilidade

Observabilidade é conseguir responder a "o que se está a passar?" sem adivinhar. No alojamento partilhado não há Prometheus nem Grafana, por isso usamos peças gratuitas que funcionam lá.

| Pergunta | Sinal | Ferramenta |
|---|---|---|
| O Kayé está no ar? | Verificação de saúde | `/up` e `/api/v1/health` + monitor externo |
| A fila, o cron e o disco estão bem? | Verificação de saúde com token | `/api/v1/health` com `HEALTH_TOKEN` + email da fila parada |
| Houve erros? Quais e quantos? | Erros | Sentry |
| Que pedidos e consultas estão lentos? | Desempenho | Pulse (`/admin/pulse`) |
| O que aconteceu neste pedido? | Logs | Logs JSON com `request_id` |
| As pessoas usam o produto? | Métricas de produto | Tabela `events` (Fase 1) |

## Logs

- **Formato:** um objeto JSON por linha, com mensagem, nível, data e contexto. Fácil de filtrar com `grep` ou `jq`.
- **`request_id` em todas as linhas:** o middleware `AssignRequestId` dá um ID a cada pedido e devolve-o no cabeçalho `X-Request-Id`. Se a app mandar o seu próprio ID, ele é reutilizado (mas só se for seguro, para ninguém conseguir injetar texto nos logs).
- **Onde ficam:**

| Ambiente | Canal (`LOG_STACK`) | Onde ler |
|---|---|---|
| Local | `single` | `apps/api/storage/logs/laravel.log` |
| Hostinger | `json` | `storage/logs/kaye.json-AAAA-MM-DD.log`, um ficheiro por dia, guardados 14 dias |
| Container | `stderr_json` | `docker compose logs app` |

- **Níveis:** `error` (algo falhou e precisa de atenção), `warning` (estranho, mas tratado), `info` (acontecimentos importantes: deploy, tarefa agendada) e `debug` (só em desenvolvimento). Em produção, `LOG_LEVEL=info`.
- **Nunca registar:** emails, nomes, tokens, senhas, o corpo de pedidos com dados pessoais ou o conteúdo de CVs.

Exemplo, para seguir um pedido no servidor:

```sh
grep '"request_id":"07a6947d' storage/logs/kaye.json-*.log | jq .
```

## Erros (Sentry)

- Já está ligado na API (`sentry/sentry-laravel`). Sem `SENTRY_LARAVEL_DSN` não faz nada.
- **Não envia dados pessoais:** `send_default_pii` está fixo em `false` no código, não se muda por variável de ambiente. E um `before_send` (`App\Support\SentryScrubber`), também fixo, limpa cada evento antes de sair: fica só o id do utilizador; saem o corpo do pedido, os cookies, os cabeçalhos com segredos (`Authorization`, `Cookie`, IPs reencaminhados), a query string e o nome do servidor; e qualquer email, telefone, IP ou token no texto da mensagem, da exceção, dos *breadcrumbs* e dos extras passa a `[retirado]`. Testado em `ErrorTrackingTest`.
- Amostra de desempenho: 10% dos pedidos (`SENTRY_TRACES_SAMPLE_RATE=0.1`).
- **A app React** manda os erros que não conseguiu tratar (de um script, de uma promessa sem `catch`, ou do React, que desmonta o ecrã) para `POST /api/v1/client-errors`, e o Laravel envia-os ao mesmo projeto do Sentry, com a etiqueta `layer=web`. A app nunca fala com o Sentry diretamente: a CSP só deixa ligar ao próprio site, e assim cada erro passa pelo mesmo `SentryScrubber`. Vai só a mensagem, a pilha de chamadas (*stack*) e o caminho da página, sem *query string*; o endereço de um cartão público (`/c/…`) fica `/c/:slug`. No máximo 5 erros diferentes por carregamento da página e 30 por hora e por IP. Sem SDK do Sentry no browser: não pesa no download. Só o build servido pelo Laravel reporta, não os sites de demonstração. Código: `src/lib/errorReporting.ts` e `App\Support\ClientErrors`; testes: `errorReporting.test.ts` e `ClientErrorsTest`.
- No Sentry, filtra por `layer:web` para veres só os erros da app. A pilha vem com os nomes do código minificado (`index-Ab12.js:1:2345`): a mensagem e o caminho dizem quase sempre onde está o problema; para o resto, reproduz-se em local.
- O `kaye:check-production` não deixa ir para produção sem DSN.

**Para ativar (Eduardo):**

1. Cria uma conta gratuita em sentry.io.
2. Cria um projeto "Laravel" chamado `kaye-api`.
3. Copia o DSN para `SENTRY_LARAVEL_DSN` no `.env` de produção.
4. Ativa os alertas por email para erros novos.

## Saúde e disponibilidade

| Endpoint | Responde | Para quê |
|---|---|---|
| `GET /up` | 200 se o PHP e o Laravel arrancam | Saber se o processo está vivo; é o *healthcheck* do container |
| `GET /api/v1/health` | 200 com `checks.database: ok`, ou **503** com `down` | O que a app usa ("estado do serviço"). Nunca mostra detalhes do erro |
| `GET /api/v1/health` com `HEALTH_TOKEN` (cabeçalho `X-Health-Token`, `Authorization: Bearer` ou `?token=`) | Todas as verificações, e **503** se alguma falhar | O monitor externo |

No servidor, `php artisan kaye:health` mostra as mesmas verificações sem precisar do token, e falha (código 1) se alguma não estiver bem. O deploy corre-o depois de cada versão, antes do teste de fumo: o cron é verificado em cada deploy, mesmo sem `HEALTH_TOKEN`.

Com o token, a resposta tem:

| Verificação | Campos | Falha quando |
|---|---|---|
| `database` | `ok` ou `down` | A base de dados não responde |
| `queue` | `status` (`ok`, `stuck`), `pending`, `oldest_seconds`, `failed` | Um trabalho espera há mais de `QUEUE_STUCK_MINUTES` (15) |
| `cron` | `status` (`ok`, `stale`, `unknown`), `last_beat_seconds` | O último batimento tem mais de 5 minutos, ou nunca houve |
| `disk` | `status` (`ok`, `low`), `free_percent`, `free_mb` | Menos de `DISK_MIN_FREE_PERCENT` (10%) livre na pasta `storage` |

Sem token (ou com um errado, ou com um `HEALTH_TOKEN` de menos de 16 caracteres) só aparece `database`. Testado em `MonitoringTest` e `HostingTest`.

**Monitor externo (Eduardo, gratuito):** UptimeRobot ou Better Stack, a verificar `https://<domínio>/api/v1/health?token=<HEALTH_TOKEN>` a cada 5 minutos (o Better Stack também manda o cabeçalho `X-Health-Token`, que não fica nos logs de acesso), com alerta por email (e Telegram, se quiseres) quando falha duas vezes seguidas. Como o `/health` com token dá 503 quando o cron pára, o monitor apanha também um cron morto.

**A fila parada manda um email:** `kaye:check-queue`, a cada 5 minutos, escreve para `ADMIN_EMAILS` quando um trabalho espera há mais de 15 minutos. O email sai diretamente (nunca pela fila, que é o que está parado) e no máximo uma vez por hora.

## Desempenho (Pulse)

O Laravel Pulse está em `/admin/pulse`, com o driver `database` (tabelas `pulse_*`, limpas ao fim de 7 dias): pedidos lentos, consultas lentas, tarefas da fila, exceções e quem faz mais pedidos. Grava no fim de cada pedido, sem processo permanente. O cartão "Servers" fica vazio: precisaria do `pulse:check` sempre ligado, que a Hostinger não tem.

Só abre para quem pode entrar no painel, tem o 2FA configurado e a permissão `monitoring.view` (os `admin`). Testado em `MonitoringTest`.

## Tarefas agendadas

O cron da Hostinger corre `php artisan schedule:run` a cada minuto. As tarefas estão em `routes/console.php` (hora de Angola):

| Quando | Tarefa |
|---|---|
| A cada minuto | Batimento do cron, fila (`queue:work --stop-when-empty`), envio de mensagens |
| A cada 5 minutos | `kaye:check-queue`: email se a fila estiver parada |
| A cada 2 horas | Recolha de notícias |
| Diário, 02:00 | Apagar os tokens da API expirados e as entrevistas com mais de 12 meses |
| Diário, 02:30 | `activitylog:clean`: a auditoria com mais de um ano |
| Diário, 03:00 a 04:00 | Cópia de segurança, limpeza das cópias com mais de 30 dias e verificação da idade da última ([infraestrutura.md](infraestrutura.md#cópias-de-segurança)) |
| Diário, 08:00 | Lembretes dos prazos |
| Domingo, 04:30 | `kaye:backup-restore-test`: repor a última cópia e comparar as contagens |

O agendador regista um batimento a cada minuto; o `/api/v1/health` com token dá 503 quando ele pára.

## Métricas de produto

As 5 métricas do MVP ([roadmap, Anexo B](roadmap.md#anexo-b--as-5-métricas-do-mvp)) vêm da tabela própria `events`, sem *trackers* de terceiros, e aparecem num painel no `/admin`. Implementação na Fase 1.

## O que fazer quando…

### O monitor diz que o Kayé está em baixo

1. Abre `https://<domínio>/up`. Se falha, o problema está no PHP ou no alojamento: vê o estado da Hostinger e os logs do dia.
2. Se o `/up` responde mas o `/api/v1/health` dá 503, a base de dados está em baixo: vê o hPanel (MySQL) e o Sentry.
3. Se foi logo a seguir a um deploy, volta à versão anterior (ver [infraestrutura.md](infraestrutura.md#voltar-atrás-rollback)).

### A fila encravou (chegou o email "a fila está parada")

1. Abre `/api/v1/health?token=…`: se o `cron` também está `stale`, o problema é o cron (hPanel → *Avançado → Cron Jobs*: a linha `schedule:run` tem de estar lá, a cada minuto).
2. Se o cron está `ok`, há um trabalho que falha ou demora: vê o Sentry e `failed_jobs` (`php artisan queue:failed`).
3. Depois de corrigir, `php artisan queue:retry all` volta a pôr os falhados na fila.

### Um utilizador reporta um erro

1. Pede a hora aproximada e o ecrã. Quando o ecrã de erro existir, vai mostrar o código do pedido (`X-Request-Id`).
2. Procura esse `request_id` nos logs e no Sentry.
3. Corrige com um teste que reproduz o erro.

## Mais tarde

- **Cartão de servidores do Pulse** (CPU, memória), quando houver um VPS com o `pulse:check` sempre ligado.
- **Web Vitals** na app (tempos de carregamento em telemóveis reais), enviados para a tabela `events`.
