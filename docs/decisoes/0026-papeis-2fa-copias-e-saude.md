# 0026. Papéis da equipa, 2FA no painel, cópias fora da Hostinger e saúde com token

25 de novembro de 2026 · Estado: Aceite

## Contexto

- Antes de abrir o Kayé ao público, o painel tinha dois papéis numa coluna (`users.role`: `admin`, `moderator`), sem permissões finas nem segundo fator, e a auditoria só cobria duas tabelas.
- O `/api/v1/health` era público e só verificava a base de dados e o cron. Não havia Pulse ("quando houver um VPS"), nem alerta de fila parada, nem cópias próprias testadas.
- A Hostinger partilhada não tem processos permanentes nem cria bases de dados por código.

## Decisão

1. **Papéis com `spatie/laravel-permission`:** `admin`, `editor` e `reviewer` (revisor), com permissões fixas no código (`App\Enums\StaffRole`) e escritas na base de dados por uma migração. A coluna `users.role` sai; `moderator` passa a `reviewer`. O painel continua com duas fechaduras (papel **e** `ADMIN_EMAILS`) e ganha uma terceira: **2FA por aplicação (TOTP) obrigatória**, com códigos de recuperação. Cada modelo tem uma *policy*; um teste falha se aparecer um modelo sem.
2. **Auditoria:** todo o conteúdo do catálogo e as mensagens gravam cada alteração em `activity_log`; logins, falhas de login e ações da equipa (CSV, envio de mensagens, papéis) também. Os dados pessoais nunca são copiados para lá: uma falha de login guarda um *hash* do email com a `APP_KEY` e o IP truncado.
3. **Lista de espera encriptada:** o email e o WhatsApp ficam cifrados com a `APP_KEY` (`encrypted`), com uma coluna *hash* (HMAC) para encontrar duplicados e procurar no painel. Procura-se o contacto inteiro, nunca um pedaço. O `user_data` **não** é cifrado agora: o envio por áreas filtra dentro do JSON (fica nas pendências).
4. **Saúde:** sem token, `/api/v1/health` diz só se o Kayé funciona (é o que a app usa). Com `HEALTH_TOKEN` mostra a base de dados, a fila, a idade do último batimento do cron e o espaço em disco, e dá 503 se algum falhar. A fila parada manda um email (no máximo um por hora), direto, sem passar pela fila.
5. **Pulse agora, com o driver `database`,** dentro do painel (`/admin/pulse`), só para quem tem `monitoring.view` e 2FA. Grava no fim de cada pedido; o cartão de servidores fica vazio (precisaria de `pulse:check` permanente, que a Hostinger não tem).
6. **Cópias com `spatie/laravel-backup`:** diárias pelo cron, para um bucket **S3 ou compatível** (AWS, Cloudflare R2, Backblaze B2), zip cifrado com AES-256, 30 dias. O Google Drive fica de fora: precisa de um token OAuth que expira e de mais um pacote. `kaye:backup-restore-test` repõe a cópia mais recente numa base de dados vazia **própria** (criada no hPanel) e compara as contagens com as que ficaram escritas na cópia; recusa-se a usar a base real.
7. **Sentry:** além de `send_default_pii=false`, um `before_send` fixo no código retira utilizador (menos o id), corpo do pedido, cookies, cabeçalhos com segredos, query string e qualquer email, telefone, IP ou token em mensagens, exceções e *breadcrumbs*.
8. **CI:** o scan **OWASP ZAP *baseline*** corre contra o container. As auditorias de dependências ficam como estavam, porque já são mais rigorosas do que o pedido: `composer audit` falha com qualquer aviso e `npm audit --audit-level=moderate` inclui as dependências de desenvolvimento.

## Consequências

- Quem entra no painel pela primeira vez tem de configurar o 2FA (Google Authenticator, Authy ou outra app TOTP) antes de ver qualquer coisa. Perder o telemóvel exige um código de recuperação.
- Rodar a `APP_KEY` passa a exigir recalcular os *hashes* da lista de espera (`APP_PREVIOUS_KEYS` só decifra os valores).
- O deploy precisa de novas variáveis para as cópias (`BACKUP_*`, `DB_RESTORE_*`) e para a saúde (`HEALTH_TOKEN`). Sem elas, as cópias ficam no disco local e o teste semanal de reposição não corre.
- O `activity_log` cresce com cada login. Fica um ano (`activitylog:clean`), e os logins de uma pessoa vão com a conta.
