# Apresentação do Kayé: roteiro de 10 minutos

Para o Eduardo mostrar o Kayé a uma pessoa de fora (um parceiro, uma escola, um investidor, um júri). Tudo corre em `https://kayeangola.com`, no telemóvel, sem conta, a não ser onde está dito.

Verificado a 24 de novembro de 2026 contra o endereço de produção: as páginas deste roteiro abrem sem erros na consola, sem violações da política de segurança (CSP) e sem pedidos falhados. O teste que o confirma é `apps/web/e2e/showcase.spec.ts` (só lê; corre em produção com `E2E_BASE_URL=https://kayeangola.com npx playwright test showcase`).

## Dez minutos antes

1. Abre `https://kayeangola.com/api/v1/health`: tem de dizer `"status": "ok"` e `"cron": "ok"`.
2. Abre o site no telemóvel, **com os dados móveis** (não com o wifi da sala): é assim que a maioria das pessoas o vai usar e mostra a velocidade a sério.
3. Entra uma vez com a tua conta Google, para teres a certeza de que o login funciona neste telemóvel, e **sai** outra vez: a demonstração começa sem conta.
4. Se já usaste o site neste telemóvel, apaga os dados: Perfil → separador **Privacidade** → **Apagar os meus dados**. Assim a pessoa vê a primeira visita de verdade.

## A pessoa de exemplo

**A Joana**, 17 anos, Luanda, acabou o ensino médio técnico de Informática. Gosta de computadores, mas não sabe que profissões existem nem o que estudar. Não tem dinheiro para tentar e falhar. Todo o roteiro segue a Joana: o que fazer com o que se sabe, onde estudar, quem contrata, como candidatar-se.

Como a Joana é menor, repara que o Kayé lhe pede só o ano de nascimento, não mostra o perfil dela a ninguém e não tem relatos de salário para ela. Diz isto à pessoa: é uma das razões de confiança.

## O roteiro

| Minutos | O que mostras | Onde | O que dizes |
|---|---|---|---|
| 0:00–1:00 | A página inicial e o problema | `/` | "Os jovens angolanos escolhem curso e emprego sem saber o que cada profissão exige. O Kayé diz-lhes, de graça, com a fonte de cada número." Toca em **Só quero ver**: não há muro de registo. |
| 1:00–3:00 | O teste de orientação, a Joana a responder | `/teste` | Responde ao teste como a Joana (gosta de resolver problemas e de máquinas, não gosta de vender). Mostra o resultado e as profissões recomendadas. "Não é opinião nossa: pesa-se o que ela gosta contra o que cada profissão pede." |
| 3:00–4:30 | Uma profissão por dentro | `/carreiras/analista-de-ciberseguranca` | O dia a dia, o salário típico, o que se pede, o caminho (curso médio → licenciatura → certificação). "Cada profissão diz de onde vem o número." |
| 4:30–6:00 | Onde estudar | `/academias/isptec` e depois `/academias/itel` | A Joana vê o ISPTEC (superior) e o ITEL (médio técnico, o mais perto do que ela já fez). Cursos, propinas, contactos. |
| 6:00–7:30 | Quem contrata e como lá chegar | `/empresas/unitel` | Os postos de trabalho que a Unitel oferece, o que se pede para cada um, as escolas de onde vêm as pessoas. Mostra o programa de estágios com o INEFOP, com fonte. |
| 7:30–8:30 | Um dia de trabalho a sério | `/simulacoes/um-dia-como-enfermeiro` | A simulação: a Joana decide como se estivesse lá. "Experimentar a profissão antes de pagar o curso." |
| 8:30–9:30 | O CV feito em minutos | `/cv` | O CV passo a passo, a partir do que a Joana já deu, e o PDF no telemóvel. Funciona sem rede. |
| 9:30–10:00 | O mercado e fecho | `/mercado` e `/novidades` | As vagas contadas dos sites angolanos e as notícias de formação e emprego, que entram sozinhas. Fecha com a lista de espera. |

Se a pessoa quiser **entrar com o Google** ou **comentar**: o login leva ao Google e volta ao `kayeangola.com`; para comentar é preciso estar com a conta. Só faz isto se tiveres a certeza, no telemóvel, nos 10 minutos antes (ponto 3 acima). Sem conta, o servidor recusa o comentário com um erro limpo, e o teste confirma-o.

## Cinco empresas seguras para abrir

Têm logótipo, capa, site oficial, profissões ligadas e fontes. Todas passam no teste `showcase.spec.ts`.

| Empresa | Endereço | Porquê |
|---|---|---|
| Unitel | `/empresas/unitel` | A que toda a gente conhece; 14 profissões ligadas; estágios com o INEFOP (com fonte) |
| Banco Sol | `/empresas/banco-sol` | 20 profissões ligadas; um dos poucos com testemunhos de entrevistas |
| Banco BAI | `/empresas/bai` | Anos de experiência pedidos por área, publicados |
| Banco de Poupança e Crédito (BPC) | `/empresas/banco-de-poupanca-e-credito-bpc` | 17 profissões; página completa |
| Sociedade Mineira de Catoca | `/empresas/sociedade-mineira-de-catoca` | Mostra que o Kayé não é só tecnologia: minas e indústria |

## Cinco academias seguras para abrir

Têm logótipo, capa, site oficial, morada, contactos e o reconhecimento oficial, na maior parte.

| Academia | Endereço | Porquê |
|---|---|---|
| ISPTEC | `/academias/isptec` | Tecnologia, parceira da Unitel (liga com o fio da Joana); 13 cursos |
| Universidades Jean Piaget | `/academias/universidades-jean-piaget` | A mais completa; 17 cursos |
| Universidade de Belas | `/academias/universidade-de-belas` | 12 cursos; só falta mostrar o reconhecimento |
| Universidade de Luanda | `/academias/universidade-de-luanda` | A maior oferta (19 cursos) |
| ITEL | `/academias/itel` | Ensino médio técnico: o caminho para quem tem 14 a 17 anos |

## O que **não** abrir

O Kayé diz "A confirmar" onde não tem fonte, em vez de inventar. Mas uma página meio vazia à frente de um parceiro não ajuda.

- **Empresas sem capa**: Angola Cables, Azule Energy, Chevron, Halliburton, Grupo Castel, Teixeira Duarte, PwC, KPMG, Jornal de Angola, INEFOP, TIS Tech. **Sem logótipo**: ENDE, Kero, AGT.
- **Empresas sem site oficial** na ficha: Angola Telecom, Access Bank, Chevron, Baker Hughes, ENDE, Porto de Luanda, CFB, Grupo Castel, Mota-Engil, Teixeira Duarte, Kero, Fidelidade, Deloitte, PwC, EY, TPA, Angop, AGT, TIS Tech.
- **Quase todas as academias** fora das cinco acima: não têm telefone, email nem morada. Esses contactos são factos que ninguém publica e nunca se inventam: o Eduardo liga ou visita (lista em [recolha-de-dados.md](recolha-de-dados.md), "Contactos e identidade").
- Duração e horário dos cursos das academias, e os postos de trabalho das empresas e o que se pede para cada um, são **estimativas** (o Kayé marca-as como tal). Se perguntarem, diz isso com todas as letras: são o que é normal para aquele tipo de empresa ou escola, e vão sendo trocados por dados reais.

## O que dizer quando perguntarem pelo que falta

**"E o domínio próprio?"** Já está: `kayeangola.com`, com `https` e o `www` a redirecionar. Foi a 24 de novembro de 2026.

**"Há um painel para gerir isto?"** Há o essencial: um painel (Filament) onde se vê a lista de espera, as críticas dos utilizadores e as campanhas de email (por lotes, só com consentimento). O painel completo, com o design do site, é a próxima etapa ([roadmap.md](roadmap.md), «Fecho do backend», ponto 9). Até lá, os conteúdos mudam-se no código e entram por uma importação, com revisão.

**"E a inteligência artificial?"** Hoje as recomendações **não** usam IA: usam regras abertas, que se explicam (o que a pessoa gosta contra o que a profissão pede). É de propósito: um jovem tem de poder perguntar "porquê esta profissão?" e ter resposta. A IA entra a seguir, só do lado da equipa: o Claude ajuda a pesquisar e a propor rascunhos de conteúdo (e a tradução para inglês e francês), **sempre com fonte e sempre revistos por uma pessoa antes de publicar** ([roadmap.md](roadmap.md), ponto 8). Nada pago influencia as recomendações.

**"Quanto custa? Como ganham dinheiro?"** É grátis para o jovem. O Kayé Plus (ferramentas extra) existe atrás de um interruptor desligado; o meio de pagamento em Angola ainda não está escolhido. Escolas e empresas nunca recebem dados individuais.

**"E fora de Luanda?"** Luanda primeiro. O catálogo já cobre todas as áreas; o resto do país cresce com o que os utilizadores pedirem.

**"Os dados são atuais?"** As vagas e as notícias entram sozinhas, de 2 em 2 horas, e a página do mercado diz a data da última atualização. O que não entra sozinho (cursos, propinas, empresas) tem fonte e data, ou está marcado como estimativa.

**"E a segurança e a privacidade dos menores?"** Recolhe-se o mínimo (ano de nascimento, não a data), não há perfil público para menores nem relatos de salário, e o Sentry nunca recebe dados pessoais. Os Termos e a Política de privacidade estão completos, segundo a lei angolana ([legal.md](legal.md)). Ainda falta a revisão final de segurança e as cópias de segurança automáticas (roadmap, ponto 7): diz-o, se perguntarem.

## Se algo correr mal em direto

- **A página fica em branco ou demora**: recarrega uma vez. Se continuar, `https://kayeangola.com/api/v1/health` diz se o servidor está de pé.
- **Uma ficha aparece vazia**: não te desculpes, muda de página. Vai para a ISPTEC ou para a Unitel, que estão completas.
- **A pessoa quer ver o que não está lá**: "Isso entra quando os utilizadores o pedirem": é a regra do produto ([ADR 0015](decisoes/0015-catalogo-largo.md)), não uma desculpa.
