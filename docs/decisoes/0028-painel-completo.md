# 0028. Painel completo: gerado das tabelas, edições protegidas do import e definições cifradas

25 de novembro de 2026 · Estado: Aceite

## Contexto

- O painel tinha só a lista de espera, as críticas, as mensagens, as propostas da IA e os tokens MCP. O catálogo (34 tabelas) só mudava pelo JSON do frontend ou pelas propostas da IA.
- O pedido era um *Resource* por tabela, gerado com `make:filament-resource --generate`. O gerador escreve 4 a 6 ficheiros quase iguais por tabela: mais de 150 ficheiros com o mesmo código, o que rebenta o limite de 3% de código duplicado (`npm run duplication`).
- O [ADR 0027](0027-ia-por-mcp-e-propostas.md) dizia: "uma alteração feita sem proposta continua a ser desfeita pelo JSON". Com o painel completo, cada edição da equipa seria desfeita no deploy seguinte, quando o `kaye:import` corre.
- As chaves (Anthropic, tokens da saúde, das vagas, do CSV) e os limites (orçamento da IA, emails por hora) só mudavam no `.env` do servidor, por SSH.

## Decisão

1. **Uma classe base em vez de código gerado.** `App\Filament\Content\ContentResource` lê as colunas de cada tabela da base de dados e do modelo (o mesmo que o `--generate` lê, feito uma vez) e monta o formulário e a lista: os campos comuns (estado, fonte, estimado, ordem), as traduções pt, en e fr em separadores, as listas em JSON, as imagens com origem e as regras de `ContentTypes` nos tipos que a IA escreve. Cada tabela tem um *Resource* de 20 a 60 linhas, só com o que é dela: os nomes, a página na app ("Ver na app"), como chega a uma área e as relações editáveis lá dentro.
2. **Uma edição no painel fica da base de dados.** Gravar um registo guarda uma revisão `edited` (quem, quando, antes e depois) e o `kaye:import` deixa de escrever essas colunas, como já fazia com as aprovadas. O mesmo para as ligações (as carreiras de uma empresa, as competências de uma carreira): são editadas do lado que o importador escreve, e uma ligação mudada no painel deixa de ser sincronizada pelo JSON. Uma alteração feita fora do painel (na base de dados, à mão) continua a ser desfeita, como antes.
3. **Definições cifradas na base de dados.** A tabela `settings` guarda, cifrados com a `APP_KEY`, as chaves e os limites que o painel muda (`App\Support\Settings`, só administradores). O valor gravado vale em vez do `.env`; "Voltar ao .env" apaga-o. Uma chave nunca volta a aparecer depois de gravada: nem na página, nem na auditoria (que guarda só o nome).
4. **"Colar vaga"** transforma um anúncio do WhatsApp nos factos de uma vaga (`job_postings`, `source = whatsapp`), como os dos scrapers. O texto nunca é guardado.

## Consequências

- Uma coluna nova numa tabela aparece no formulário sem código. Um tipo de campo que a leitura das colunas não conheça cai num texto livre: vale a pena olhar para o formulário depois de cada migração.
- O JSON do frontend deixa de ser a fonte de tudo: para um campo ou ligação mudado no painel, quem manda é a base de dados, e o JSON fica desatualizado. Para voltar ao valor do JSON, muda-se o campo no painel para esse valor.
- As revisões `edited` crescem com cada gravação; filtradas por registo, são o histórico dele.
- Rodar a `APP_KEY` obriga a gravar de novo as definições (um valor que não se decifra é ignorado e vale o `.env`).
- O tema do painel passa a ser compilado com Vite em `apps/api` (`npm run build`): o Docker e o pacote de release fazem-no, e o pacote recusa-se a sair sem ele.
