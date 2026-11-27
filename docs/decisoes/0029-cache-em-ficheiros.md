# 0029. As leituras públicas da API não usam a base de dados: cache em ficheiros

27 de novembro de 2026 · Estado: Aceite

## Contexto

- No teste de carga de 26/11/2026, a produção deu erro 500 a quase metade dos pedidos às listas (cursos, academias, empresas) com 50 pedidos ao mesmo tempo. No ensaio de 27/11 no staging, direto à origem sem o CDN, foram 74 % a 80 % de erros 500 nas cinco listas.
- O erro era sempre `SQLSTATE[HY000] [2002] Operation not permitted`. Em carga, o alojamento partilhado recusa **abrir** novas ligações ao MySQL, mesmo abaixo do limite de 100 ligações por utilizador.
- Cada leitura pública abria uma ligação, mesmo com a resposta já pronta, por quatro motivos:
  1. a resposta guardada estava na cache em base de dados, com até 1,2 MB por linha;
  2. o contador do limite de pedidos estava na mesma cache;
  3. as definições do painel (ADR 0028) eram lidas dessa cache no arranque de cada pedido;
  4. o Pulse gravava uma linha por cada leitura da cache.
- A tabela `cache` tinha 1000 respostas antigas (149 MB), porque as versões antigas nunca eram apagadas.

## Decisão

1. **As respostas da API pública** (`App\Support\PublicContent`) ficam num armazenamento próprio em ficheiros, `content` (`storage/framework/cache/content`). A troca de versão quando o conteúdo muda continua igual. O agendador esvazia a pasta todos os dias às 04:45, e a próxima leitura volta a criar cada resposta.
2. **Os contadores dos limites de pedidos e a cópia em cache das definições do painel** ficam no armazenamento `local` (`storage/framework/cache/local`). Este usa a classe `App\Support\AtomicFileStore`: igual à cache em ficheiros do Laravel, mas a soma do contador é feita com um cadeado exclusivo no ficheiro. A versão do Laravel lê, soma e escreve em três passos, e perde contagens quando há pedidos ao mesmo tempo. Um teste com 4 processos em paralelo mostra que perde, e que a nova não perde. O limite de pedidos é um controlo de segurança, por isso tem de ficar exato.
3. **O Pulse deixa de registar as leituras da cache** (o gravador `CacheInteractions` fica desligado). Os pedidos lentos, os erros e as filas continuam registados.
4. **A cache por defeito continua na base de dados** (filas, locks do agendador, batimento do cron). Mudam só os três usos que estavam em todos os pedidos. O `CLAUDE.md` ("fila e cache no driver `database`") continua certo para o resto.
5. **Limpeza:**
   - uma migração apaga da tabela `cache` as respostas antigas;
   - o agendador apaga todos os dias às 04:50 as linhas expiradas dessa tabela, que antes ficavam lá para sempre.

## Consequências

- **Medido no staging**, direto à origem, com 200 pedidos por lista, 50 de cada vez: com o código antigo, 148 a 161 erros 500 por lista; com o novo, **0 erros** nas cinco listas, com p95 entre 0,29 s e 1,06 s.
- **Uma leitura pública já preparada não faz nenhuma consulta à base.** O `PublicContentStoreTest` verifica-o com a cache por defeito na base de dados, como em produção.
- **Só há um servidor**, por isso os ficheiros servem. Com dois servidores (um VPS com balanceador), esta cache teria de passar para o Redis.
- **O `post-deploy.sh` apaga a configuração em cache da release anterior antes do primeiro `artisan`.** Sem isso, uma chave de configuração nova (como `cache.limiter`) faltava no arranque e o `artisan` morria antes de a conseguir limpar. O ensaio no staging encontrou o problema antes da produção.
- **Os testes usam `array`** para os dois armazenamentos (`CONTENT_CACHE_STORE` e `LOCAL_CACHE_STORE` no `phpunit.xml`), para não partilharem ficheiros entre si.
