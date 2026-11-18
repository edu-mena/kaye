# 0012. Conta obrigatória e onboarding adaptativo com guia e voz

Estado: Aceite (2026-11-02). A parte da voz foi substituída pela [0013](0013-voz-do-guia-em-audio-pre-gerado.md) e a conta obrigatória pela [0021](0021-explorar-sem-conta.md).

## Contexto

O onboarding do MVP levava ao teste de 42 perguntas, pensado quando o Kayé só tinha tecnologia. Com mais de 200 profissões em 13 áreas, pedir 42 respostas antes de mostrar valor deixou de fazer sentido. O Eduardo pediu um início curto, animado e explicativo, inspirado no Brilliant, com perguntas que se adaptam às escolhas e no máximo 3 por área. Pediu também que ver os conteúdos passe a exigir login.

## Decisão

- **Conta obrigatória.** Sem conta só se vê a página de entrada, os termos e a política de privacidade. Isto substitui o "explorar sem conta" da arquitetura e do roteiro.
- **Onboarding como conversa com um guia.** Os passos saem das respostas (`features/onboarding/flow.ts`). Quem escolhe áreas responde a 3 perguntas por área, no máximo. Quem diz "Ainda não sei" indica o que gosta de fazer, e as áreas vêm do perfil RIASEC das profissões.
- **O login vem no fim**, depois de a pessoa ver para que serve, como no Brilliant. Até o servidor existir é simulado: o perfil fica só no aparelho, e o ecrã diz-o.
- **Nome pedido na conversa.** Quando o login for real, vem da conta do Google e esse passo sai.
- **O teste RIASEC continua**, opcional, para quem quer ir mais fundo. As recomendações usam o teste quando existe e, sem ele, as respostas do onboarding.
- **Voz só de saída, com a Web Speech API do navegador.** É grátis, não precisa de servidor e serve a Hostinger. Não há reconhecimento de voz: no Chrome o áudio seguiria para o Google, e muitos utilizadores são menores. O guia nunca lê o nome da pessoa, porque algumas vozes do navegador são remotas; as vozes instaladas no aparelho têm prioridade.
- **Sem campo de texto livre**, ao contrário do Brilliant: nada o usaria, e um menor poderia escrever lá dados pessoais.

## Consequências

- Quem chega por uma ligação ou pelo Google não vê conteúdo sem conta. Isto reduz o que os motores de busca indexam e afeta as páginas públicas previstas para a Fase 2; rever com a página de entrada.
- A voz depende do aparelho: a qualidade varia, e sem voz no idioma o passo diz-o e segue só com texto. Na app Android (WebView) o passo não aparece se a API faltar.
- O sotaque é o da voz instalada: `pt-AO` quando existe, depois `pt-PT`, depois qualquer português.
