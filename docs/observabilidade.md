# Observabilidade

Observabilidade é conseguir responder a "o que se está a passar?" sem adivinhar. No alojamento partilhado não há Prometheus nem Grafana, por isso usamos peças gratuitas que funcionam lá.

| Pergunta | Sinal | Ferramenta |
|---|---|---|
| O Kayé está no ar? | Verificação de saúde | `/up` e `/api/v1/health` + monitor externo |
| Houve erros? Quais e quantos? | Erros | Sentry |
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
- **Não envia dados pessoais:** `send_default_pii` está fixo em `false` no código, não se muda por variável de ambiente.
- Amostra de desempenho: 10% dos pedidos (`SENTRY_TRACES_SAMPLE_RATE=0.1`).
- A app React liga-se ao Sentry quando houver DSN. Vai ser carregada à parte, para não pesar no primeiro download.
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
| `GET /api/v1/health` | 200 com `checks.database: ok`, ou **503** com `down` | Saber se o Kayé funciona de ponta a ponta; nunca mostra detalhes do erro |

**Monitor externo (Eduardo, gratuito):** UptimeRobot ou Better Stack, a verificar `https://<domínio>/api/v1/health` a cada 5 minutos, com alerta por email (e Telegram, se quiseres) quando falha duas vezes seguidas.

## Tarefas agendadas

O cron da Hostinger corre `php artisan schedule:run` a cada minuto. As tarefas estão em `routes/console.php` (hora de Angola):

| Quando | Tarefa |
|---|---|
| Diário, 02:00 | Apagar os tokens da API expirados |

Quando houver tarefas críticas (scrapers, estatísticas semanais), cada uma regista um "sinal de vida" no fim. O `/api/v1/health` vai passar a avisar se uma tarefa não corre há demasiado tempo.

## Métricas de produto

As 5 métricas do MVP ([roadmap, Anexo B](roadmap.md#anexo-b--as-5-métricas-do-mvp)) vêm da tabela própria `events`, sem *trackers* de terceiros, e aparecem num painel no `/admin`. Implementação na Fase 1.

## O que fazer quando…

### O monitor diz que o Kayé está em baixo

1. Abre `https://<domínio>/up`. Se falha, o problema está no PHP ou no alojamento: vê o estado da Hostinger e os logs do dia.
2. Se o `/up` responde mas o `/api/v1/health` dá 503, a base de dados está em baixo: vê o hPanel (MySQL) e o Sentry.
3. Se foi logo a seguir a um deploy, volta à versão anterior (ver [infraestrutura.md](infraestrutura.md#voltar-atrás-rollback)).

### Um utilizador reporta um erro

1. Pede a hora aproximada e o ecrã. Quando o ecrã de erro existir, vai mostrar o código do pedido (`X-Request-Id`).
2. Procura esse `request_id` nos logs e no Sentry.
3. Corrige com um teste que reproduz o erro.

## Mais tarde

- **Laravel Pulse** (pedidos lentos, consultas lentas, uso), quando houver um VPS.
- **Web Vitals** na app (tempos de carregamento em telemóveis reais), enviados para a tabela `events`.
