# 0025. Kursos diários: um tópico por dia na conta grátis, e o fim do "tudo grátis"

24 de novembro de 2026 · Estado: Aceite

## Contexto

- O [ADR 0015](0015-catalogo-largo.md) dizia que o Kayé é grátis no MVP, e o [ADR 0024](0024-plano-kaye-plus.md) manteve a promessa para tudo o que não fosse o Plus. O Eduardo decidiu que não é viável sustentar o Kayé assim: quem quer o Kayé todos os dias paga.
- O que prende as pessoas é o hábito diário de praticar a sua área. Os Kursos ([ADR 0016](0016-kursos-livro-tecnico.md)) já têm lições, revisão, exame e banco de perguntas; falta torná-los um hábito diário e dar-lhes um limite grátis.
- Há servidor na Hostinger ([ADR 0019](0019-backend-e-migracao-dos-dados.md)), por isso o limite pode ser real, e não só uma regra no aparelho.

## Decisão

**O que continua grátis.** Descobrir (carreiras, áreas, cursos, institutos, empresas, mercado, notícias, prazos, bolsas, estágios), o feed da home, a sequência, o desafio do dia e o teste vocacional, sem subscrever nada. É o que traz as pessoas, e o ADR 0024 já o protegia. O que acaba é a promessa de que **tudo** é grátis: o texto da landing, dos Termos e do CLAUDE.md passa a dizer que *explorar* é grátis.

**O que passa a ser do Plus: o que é personalizado.** Descobrir é para toda a gente; o que o Kayé faz *por ti, ao longo do tempo* é pago. Entram aqui as subscrições e os lembretes (alertas de prazos por email e Web Push, "Lembrar-me", campanhas por área) e o acompanhamento pessoal (**"O meu plano"**). A lista exata fecha-se na tarefa da landing e no código, e qualquer item novo entra num ADR. Menores continuam sem promoção do Plus; para eles, o que era personalizado fica como estava até haver o fluxo do encarregado de educação.

**Kursos na conta grátis:**

- **Um tópico por dia.** O dia conta quando a pessoa **conclui** o tópico, não quando o abre. O dia é o dia local da pessoa (o mesmo cálculo da sequência: `streak.ts`).
- A lista de todos os tópicos do Kurso é visível, e os tópicos que ainda não se podem fazer hoje aparecem **com cadeado**, com a mensagem "Amanhã abre o próximo. No Kayé Plus fazes quantos quiseres." Sem urgência falsa e sem culpa.
- **O certificado não se revela às contas grátis.** Mostra-se **bloqueado** ("Disponível no Kayé Plus"), nunca escondido. Quem acabou o Kurso sem Plus não recebe o PDF.
- O exame final e o banco de perguntas completo são do Plus.

**Kayé Plus (1.999 Kz por mês, ADR 0024):** Kursos sem limite diário, certificado, exame final e as funcionalidades já previstas no 0024. Outros planos e preços ficam para uma conversa própria.

**Limite real, no servidor.** A conta grava os tópicos concluídos com a data; o servidor recusa um segundo tópico no mesmo dia para contas grátis. Mudar a hora do telemóvel ou apagar os dados do aparelho não contorna o limite. Até o servidor estar ligado, vale um limite "mole" no aparelho, e o ecrã não promete mais do que isso.

**Menores (14–17):**

- Ficam na versão grátis: um tópico por dia, **sem certificado**, até haver o fluxo com o encarregado de educação (em aberto desde o ADR 0024).
- Nenhuma promoção do Plus lhes aparece. O cadeado diz só "Amanhã abre o próximo", sem preço nem botão de compra.
- Não se cobra nada a menores.

**Exercícios.** Cada tópico acaba com exercícios que se corrigem sozinhos e não são só pergunta e resposta:

| Área | Tipos de exercício |
|---|---|
| Contabilidade | lançamentos (débito e crédito), classificação de contas, balancete |
| Finanças | cálculos (juros, prestações, valor atual) com tolerância na resposta |
| Gestão de Empresas | casos com decisões e consequências |
| Programação | "o que imprime", completar e ordenar linhas; o código **não corre** na página (CSP estrita, ADR 0016) |

- **Variantes por parâmetros:** o mesmo enunciado com números diferentes, escolhidos por uma semente (a data e a pessoa), e a resposta certa é **calculada por código**, não escrita à mão. Cada gerador tem testes, incluindo o caso de falha, porque uma fórmula errada ensina errado.
- **Fontes:** exercícios públicos e livres, reescritos em várias variantes; os livros só dão os temas. O ADR 0016 mantém-se: só domínio público, CC BY e CC BY-SA, com a fonte nos créditos.

**Dados só para o Kayé.** Os utilizadores não publicam nada. O Kayé guarda, por pergunta, só "certo ou errado" e, se a pessoa quiser, uma nota privada sobre o que achou difícil (só 18+, com o aviso de não escrever dados pessoais). O Eduardo usa isto para melhorar os Kursos. A nota nunca é pública e nunca vai para o Sentry.

**Identificação e comunidades.** A pessoa diz como se identifica em cada área: **Estudante, Aspirante, Licenciado ou Profissional**. É autodeclarado, e o ecrã diz isso. As comunidades não interagem entre si; o Kayé só mostra o **número** de pessoas por área, a partir de um mínimo (50), e antes disso diz que a comunidade está a nascer, sem inventar números. Os menores entram só como Estudante e só contam nos números agregados.

**Selos de pioneiro.** "Pioneiro #N · Contabilidade" (a ordem de entrada na comunidade da área), atribuído depois do primeiro tópico concluído. O nome nunca é um título profissional ("Contabilista" é regulado). Selo de pioneiro **não** é verificação: o "Verificado" da Fase 5 exige prova.

**Palavras-chave do CV.** Um motor lê o CV da pessoa (PDF, no aparelho, com o texto do CV a nunca sair de lá) e extrai só palavras-chave, a partir de um dicionário de competências por área (sinónimos em pt e en, sem acentos), reaproveitando as competências que o Kayé já tem. A pessoa confirma as etiquetas encontradas, e é essa lista que serve de base ao CV feito no Kayé. Fica para depois do motor de exercícios (ADR próprio).

**Áreas e ordem.** Primeiro duas bem feitas, **Programação** e **Contabilidade**, com 30 tópicos ou mais cada. Só depois **Finanças** e **Gestão de Empresas**. Cada Kurso só abre com o mínimo de tópicos, porque um limite de "um por dia" com 6 tópicos acaba numa semana.

## Plano

1. Este ADR, a revisão do CLAUDE.md, do roadmap e dos textos da landing e dos Termos.
2. **Motor de exercícios** (frontend, com testes): tipos de exercício, geradores com semente, correção, tolerância, e um teste de integridade do banco (uma resposta certa, fonte preenchida, sem duplicados).
3. **Tópico diário** no Kurso: conclusão, cadeado, mensagem, limite mole no aparelho.
4. **Backend:** tópicos concluídos por conta, limite diário, certificado verificável, comunidades, selos, permissão `kursos.unlimited` do Plus.
5. Conteúdo: Programação e Contabilidade (30+ tópicos cada), depois Finanças e Gestão de Empresas.
6. Vista de administração com as perguntas mais falhadas.
7. Motor de palavras-chave do CV.

## Consequências

- A landing (`home.freeBadge`), os Termos e a política de privacidade precisam de revisão antes de a flag `VITE_PLUS_ENABLED` ser ligada; a revisão passa a incluir o limite diário, o certificado e os dados guardados.
- O ADR 0016 mantém-se (livro técnico, fontes livres, certificado em PDF gerado no aparelho); só muda **quem** recebe o certificado. Com o servidor, o certificado passa a ter verificação, e a faixa "Versão de teste" e a marca de água saem numa nota própria.
- O progresso dos Kursos deixa de viver só no aparelho: sobe para a conta, e "Apagar os meus dados" apaga também a cópia do servidor.
- Os números das comunidades e os selos dependem do servidor e do login Google (em espera, ver o roadmap).
- Nada pago influencia recomendações, a ordem do feed nem a ordem das áreas (regra do ADR 0024).
- Em aberto: o meio de pagamento, o fluxo do encarregado de educação para menores, e os outros planos e preços.
