<?php

// The emails, the push notifications and the pages of the links in the emails. Portuguese is the source;
// en and fr have the same keys (tests/Feature/NoticeTextsTest.php).

return [
    'greeting' => 'Olá!',
    'greeting_name' => 'Olá, :name!',
    'signature' => 'A equipa do Kayé',
    'why' => 'Recebes este email porque o pediste no Kayé.',
    'unsubscribe' => 'Deixar de receber',

    'confirm' => [
        'subject' => 'Confirma o teu email no Kayé',
        'intro' => 'Pediste para te avisarmos quando o Kayé abrir. Confirma que este email é teu e que queres receber os nossos avisos.',
        'action' => 'Confirmar o email',
        'ignore' => 'Não foste tu? Ignora este email: sem confirmação, não te escrevemos mais.',
    ],

    'welcome' => [
        'subject' => 'Bem-vindo ao Kayé',
        'heading' => 'Está confirmado!',
        'intro' => 'Obrigado. Vamos avisar-te quando o Kayé abrir: carreiras, cursos, bolsas e prazos, tudo grátis e feito para Angola.',
        'action' => 'Conhecer o Kayé',
    ],

    'deadline' => [
        'heading' => 'Um prazo que guardaste está a chegar',
        'subject' => 'Faltam :days dias: :title',
        'body' => ':title fecha a :date. Ainda vais a tempo.',
        'action' => 'Ver os meus prazos',
    ],

    'digest' => [
        'heading' => 'Esta semana no Kayé',
        'empty' => 'Esta semana não houve notícias novas.',
        'action' => 'Ver as novidades',
    ],

    'notice' => [
        'action' => 'Abrir o Kayé',
    ],

    'feedback' => [
        'subject' => 'Resposta à tua mensagem',
        'original' => 'Escreveste-nos:',
    ],

    'pages' => [
        'site' => 'Ir para o Kayé',
        'confirmed_title' => 'Email confirmado',
        'confirmed_body' => 'Obrigado! Vamos avisar-te quando o Kayé abrir.',
        'unsubscribed_title' => 'Já não vais receber estes emails',
        'unsubscribed_body' => 'Retirámos o teu consentimento. Podes voltar a ligá-lo nas Definições da app, em "Avisos".',
        'invalid_title' => 'Este link não é válido',
        'invalid_body' => 'Pode ter expirado ou estar incompleto. Copia-o inteiro do email, ou inscreve-te de novo.',
    ],
];
