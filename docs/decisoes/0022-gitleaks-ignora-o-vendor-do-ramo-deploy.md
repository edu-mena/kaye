# 0022. O Gitleaks ignora o `vendor/` do ramo `deploy`

20 de novembro de 2026 · Estado: Aceite

## Contexto

- O Gitleaks corre no CI sobre **todo o histórico e todos os ramos** ([engenharia](../engenharia.md)).
- No primeiro deploy real, o workflow `Deploy` criou o ramo `deploy`, que leva o site já construído, incluindo `vendor/` (a Hostinger não tem Composer à altura; [infraestrutura](../infraestrutura.md)).
- O `vendor/` tem código de terceiros com chaves de exemplo em READMEs e no código (`firebase/php-jwt`, `phpseclib`, `web-token/jwt-library`) e uma lista de tipos de ficheiro em `symfony/mime` que parece uma chave. O Gitleaks deu 5 alarmes, todos falsos, e a verificação passou a falhar em todos os PRs.
- No `main` o `vendor/` não está no Git.

## Decisão

- Um `.gitleaks.toml` na raiz mantém as regras normais e ignora só o caminho `^vendor/`.
- Não se ignora o ramo `deploy` inteiro, nem se baixa a sensibilidade de nenhuma regra.

## Consequências

- Tudo o que escrevemos (o `main`, `apps/`, `docs/`, `scripts/`, `.github/`) continua verificado. Uma chave colada fora de `vendor/` ainda falha o CI; está provado por um teste feito uma vez (abaixo).
- Um segredo posto à mão dentro de `vendor/` no ramo `deploy` não seria apanhado. O `deploy` é escrito só pelo workflow, e o pacote é construído a partir do `main` (`scripts/package-release.sh` exclui `.env*`), por isso o risco é baixo. A Trivy e a revisão das dependências (Dependabot) cobrem o código de terceiros.
- Se um dia o `vendor/` deixar de ir para o Git (deploy por outro meio), este ADR e o ficheiro saem.

## Falsos positivos no nosso código (25/11/2026)

O teste do filtro do Sentry (`ErrorTrackingTest`) tinha um token falso (`token=…`), escrito de propósito para provar que o filtro o retira. O Gitleaks lê o histórico de todos os ramos, por isso o alarme aparecia em todos os PRs, mesmo depois de o valor mudar. Fica em `.gitleaksignore` **só esse achado exato** (commit, ficheiro, regra e linha). A regra continua ativa para tudo o resto, incluindo o mesmo ficheiro noutra linha ou noutro commit. Os testes passaram a usar valores que não parecem segredos.

## Como se confirmou

Com o Gitleaks 8.30.1 (a versão do CI), num repositório de teste e no repositório real com todos os ramos:

- Uma chave privada falsa só em `vendor/`, com o `.gitleaks.toml`: passa.
- A mesma chave em `apps/api/`, com o `.gitleaks.toml`: **falha** (o controlo continua a funcionar).
- O repositório real, todos os ramos, com o `.gitleaks.toml`: passa.
- O repositório real, todos os ramos, sem o `.gitleaks.toml`: falha (os 5 alarmes).
