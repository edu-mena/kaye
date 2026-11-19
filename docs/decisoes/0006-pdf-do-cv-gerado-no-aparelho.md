# 0006. O PDF do CV gera-se no aparelho, por agora

24 de outubro de 2026 · Estado: Aceite

## Contexto

- A arquitetura ([5.5](../arquitetura.md#55-cv)) previa gerar o PDF no servidor (dompdf). A razão era que, quando o download for pago, não desse para o contornar.
- O servidor ainda não tem conteúdos ([ADR 0005](0005-frontend-primeiro-com-dados-de-demonstracao.md)), e o Eduardo quer ver e descarregar CVs já, incluindo os CVs modelo de cada profissão.
- Hoje o download é grátis para todos.

## Decisão

- O PDF gera-se no aparelho, com o **jsPDF**:
  - é JavaScript puro, sem `eval` nem WebAssembly, por isso a CSP fica igual (`script-src 'self'`);
  - só é descarregado quando alguém pede um PDF.
- O PDF tem **texto verdadeiro**, não uma imagem, para os sistemas de recrutamento o lerem.
- Há 3 modelos visuais conhecidos: Clássico (estilo Harvard), Moderno (duas colunas) e Europeu (estilo Europass). Cada um existe duas vezes:
  - em HTML (`features/cv/CvSheet.tsx`), para a pré-visualização e as miniaturas;
  - em PDF (`features/cv/cvPdf.ts`).
  As medidas são as mesmas nos dois.
- O ficheiro é entregue pela ajuda `saveFile`, a mesma do "Descarregar os meus dados", e não pelo `save()` do jsPDF, cujo comportamento muda entre ambientes.

**Atualização (2 de novembro de 2026):** os modelos deixaram de existir duas vezes. `features/cv/cvLayout.ts` desenha cada modelo uma só vez, em milímetros, e a pré-visualização (`CvSheet.tsx`, em SVG) e o PDF (`cvPdf.ts`) só pintam o resultado, com as mesmas fontes (`public/fonts/cv/`). Continua no aparelho, com o jsPDF e texto verdadeiro. A nota abaixo sobre manter duas versões já não se aplica.

## Consequências

- Os CVs modelo e o CV da pessoa descarregam-se já, sem servidor e sem rede.
- **Quando o download passar a pago**, o PDF do CV pessoal passa para o servidor (`POST /api/v1/cv/export`, com a permissão `cv.export`), e o gerador da app fica só para os CVs modelo.
- Cada modelo tem duas versões para manter iguais. Quem mudar um modelo muda os dois ficheiros, que estão lado a lado e têm um comentário a lembrá-lo.
- Na app Android, o download por link não funciona dentro da WebView. Quando se fizer a app nativa, o `saveFile` passa a usar os plugins Filesystem e Share do Capacitor. É o único sítio a mudar.
