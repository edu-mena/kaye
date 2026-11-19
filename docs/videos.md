# Vídeos "O meu dia como…"

Vídeos de 60 a 90 segundos em que um profissional angolano mostra o seu dia de trabalho. Aparecem na página da carreira (bloco "O meu dia como…", no separador Visão geral) e, os três mais recentes, em "Histórias novas" no início e nas Novidades. Enquanto a lista estiver vazia, nada disto aparece.

O vídeo fica no YouTube, no TikTok ou no Instagram do Kayé. A app não o mostra lá dentro (a CSP não deixa iframes): mostra uma capa guardada na própria app e um botão "Ver vídeo" que abre a plataforma, com o aviso de que gasta dados.

## Quem pode aparecer

- Só adultos (18 anos ou mais). Nunca menores, nem em segundo plano, a não ser com autorização escrita dos pais ou encarregados **e** da pessoa.
- Só com o consentimento assinado (modelo abaixo). A data da assinatura vai para o campo `consentAt`.
- Colegas, clientes ou doentes que apareçam também assinam, ou não aparecem (cortar ou desfocar).
- Nada pago: uma empresa não compra um vídeo para a sua carreira.

## Como gravar com o telemóvel

**Antes**
- Telemóvel na vertical (9:16), câmara de trás, lente limpa. 1080p a 30 fps chega.
- Modo avião ou "não incomodar", para não haver chamadas a meio.
- Combina com a pessoa um sítio de trabalho real e pede autorização ao responsável do local.

**Luz**
- De frente para a pessoa: uma janela ou a porta aberta atrás de quem grava. Nunca a pessoa de costas para a janela.
- Sombra a meio do dia ao ar livre; evita o sol direto na cara.

**Som**
- Perto: no máximo um braço de distância. Um microfone de lapela barato (com fio, ligado ao telemóvel) faz a maior diferença.
- Longe do gerador, do ar condicionado e da estrada. Grava 5 segundos de silêncio antes de começar, para testar.

**Imagem**
- Mão firme ou apoiada; planos de 3 a 5 segundos. Mistura a pessoa a falar com as mãos a trabalhar, as ferramentas e o local.
- Sem logótipos de terceiros em destaque, sem ecrãs com dados de clientes, sem matrículas.

## As 5 perguntas-guia

A pessoa responde em frases curtas, como se falasse com um primo de 16 anos.

1. Como te chamas, o que fazes e onde?
2. Como é um dia normal teu, do início ao fim?
3. Que curso ou formação fizeste para chegar aqui, e quanto tempo levou?
4. O que é mais difícil, e o que é melhor, nesta profissão?
5. Que conselho dás a quem está agora a escolher?

Grava as respostas em separado e monta 60 a 90 segundos com o CapCut (gratuito). Legendas em português sempre (muita gente vê sem som).

## Modelo de consentimento

> Eu, ______________________ (nome), portador(a) do BI n.º ______________, autorizo o Kayé a gravar, editar e publicar o vídeo "O meu dia como ______________", gravado a ___/___/______, no YouTube, TikTok, Instagram e na app e site do Kayé, com o meu nome, cargo e, se eu indicar, a empresa: ______________ (sim / não).
>
> Declaro que tenho 18 anos ou mais e que o meu empregador autoriza a gravação no local de trabalho. Sei que é gratuito e que não recebo nem pago nada.
>
> Posso retirar esta autorização a qualquer momento, por email ou WhatsApp para o Kayé; o vídeo sai da app em 7 dias e das redes em 30.
>
> Assinatura: ______________________  Data: ___/___/______  Contacto: ______________

Guarda a folha digitalizada numa pasta privada (nunca no repositório). Se a pessoa retirar a autorização, apaga a linha nos dados e o vídeo nas redes.

## Onde pôr os ficheiros

1. Publica o vídeo na conta do Kayé e copia o link.
2. Tira uma capa (um fotograma bom), corta-a em 16:9 e guarda-a em WebP com até 80 KB em `apps/web/src/assets/videos/<id>.webp`.
3. Acrescenta uma linha em `apps/web/src/data/demo/videoStories.ts`:

```ts
{
  id: 'ana-tecnica-de-redes',
  careerSlug: 'tecnico-de-redes', // o slug da carreira, como no endereço /carreiras/<slug>
  name: 'Ana Silva',
  role: 'Técnica de redes',
  company: 'Unitel', // só se a pessoa autorizou
  title: 'Um dia a ligar o Talatona à fibra',
  url: 'https://www.youtube.com/shorts/…',
  platform: 'youtube', // 'youtube' | 'tiktok' | 'instagram'
  durationSeconds: 75,
  thumbnail: 'ana-tecnica-de-redes.webp',
  consentAt: '2026-12-01',
  recordedAt: '2026-12-01',
},
```

4. Publica (deploy). Os blocos aparecem sozinhos.
