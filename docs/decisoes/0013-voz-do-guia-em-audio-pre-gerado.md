# 0013. A voz do guia é áudio gerado de antemão

Estado: Aceite (2026-11-02). Substitui a parte da voz da [0012](0012-conta-obrigatoria-e-onboarding-adaptativo.md).

## Contexto

A 0012 usava as vozes instaladas em cada aparelho (Web Speech API). Ao experimentar, o Eduardo só encontrou uma voz em português, e nada natural. O problema é de base: quem manda é o aparelho, e não o Kayé. A voz muda de telemóvel para telemóvel, e em muitos soaria a robô ou nem existiria.

## Decisão

- **As frases do guia gravam-se uma vez, com vozes neurais, e servem-se como ficheiros MP3** em `apps/web/public/voice/<voz>/`. Como são frases fixas, não é preciso servidor nem chave na app, e a Hostinger serve-as como qualquer imagem.
- **Vozes:** em português, Raquel e Duarte (Portugal), Francisca e António (Brasil). Em inglês e francês, duas de cada. Não há voz neural de Angola nos serviços que consultámos; a Raquel é a escolhida por omissão, por ser a pronúncia mais próxima.
- **Gerar:** `scripts/voice/sentences.ts` lista as frases a partir dos textos da app, e `scripts/voice/generate.py` grava as que faltam. Cada ficheiro tem o nome de um resumo da frase, por isso uma frase alterada nunca toca áudio antigo: fica em silêncio até se gerar outra vez.
- **Por agora, a gravação usa o `edge-tts`**, uma biblioteca não oficial que acede às vozes neurais da Microsoft sem conta. Serve para testar, mas as condições de uso não a cobrem para um produto publicado.

## Consequências

- **Antes de ir para produção, regravar com uma licença clara:** o Azure AI Speech tem as mesmas vozes e 500 mil caracteres grátis por mês, muito acima do que as frases do guia gastam. Falta criar a conta. Só muda quem grava, não a app.
- O nome da pessoa nunca é lido, porque não há gravação dele. As respostas também não saem do aparelho. Só os textos fixos passam pelo serviço de voz, no momento de gravar.
- A voz passa a funcionar igual em qualquer aparelho, incluindo a app Android, mas ocupa espaço: cerca de 40 frases por voz.
- Uma frase nova ou alterada exige correr os dois scripts.
