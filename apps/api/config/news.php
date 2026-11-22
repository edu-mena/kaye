<?php

/*
|--------------------------------------------------------------------------
| Collected news (docs/fontes-de-noticias.md)
|--------------------------------------------------------------------------
|
| `php artisan kaye:fetch-news` reads these feeds every 2 hours. Only a source whose robots.txt and terms were
| read and allow it is listed; the others stay out, with the reason, in the doc.
*/

return [

    /** Request limits: seconds per request, items read from each source and kept per run, bytes per answer. */
    'timeout' => 15,
    'max_items_per_source' => 40,
    'max_new_per_run' => 60,
    'max_bytes' => 2_000_000,
    'pause_seconds' => 3,

    /** The robot's name, as the scrapers' (scrapers/jobs/http.py). */
    'user_agent' => 'KayeBot/1.0 (+https://github.com/edu-mena/kaye)',

    /** @var list<array{id: string, name: string, type: 'rss'|'sitemap', url: string}> */
    'sources' => [
        ['id' => 'novo-jornal', 'name' => 'Novo Jornal', 'type' => 'sitemap', 'url' => 'https://novojornal.co.ao/google_news.ashx'],
        ['id' => 'expansao', 'name' => 'Expansão', 'type' => 'sitemap', 'url' => 'https://expansao.co.ao/google_news.ashx'],
        ['id' => 'o-telegrama', 'name' => 'O Telegrama', 'type' => 'rss', 'url' => 'https://otelegrama.com/feed'],
        ['id' => 'maptss', 'name' => 'MAPTSS', 'type' => 'rss', 'url' => 'https://maptss.gov.ao/feed'],
    ],

    /**
     * Words that make a piece about training, work, grants, public competitions or careers (no accents, lowercase).
     * Matched as whole words or phrases.
     *
     * @var list<string>
     */
    'topics' => [
        'bolsa de estudo', 'bolsas de estudo', 'bolsas', 'concurso publico', 'concursos publicos',
        'emprego', 'empregos', 'desemprego', 'vagas', 'recrutamento', 'estagio', 'estagios', 'formacao profissional',
        'formacao', 'ensino superior', 'universidade', 'universidades', 'instituto superior', 'politecnico', 'curso',
        'cursos', 'exame de acesso', 'exames de acesso', 'ano lectivo', 'ano letivo', 'primeiro emprego',
        'empreendedorismo', 'carreira', 'carreiras', 'qualificacao', 'competencias',
    ],

    /**
     * Words of each area of the catalogue (slugs as in `areas`), no accents, lowercase.
     *
     * @var array<string, list<string>>
     */
    'area_keywords' => [
        'technology' => ['tecnologia', 'informatica', 'software', 'programacao', 'ciberseguranca', 'inteligencia artificial', 'telecomunicacoes', 'digital'],
        'engineering' => ['engenharia', 'engenheiro', 'engenheiros', 'construcao civil', 'electricidade', 'eletricidade'],
        'oil_mining' => ['petroleo', 'petrolifero', 'gas natural', 'mineracao', 'diamantes', 'sonangol'],
        'health' => ['saude', 'medico', 'medicos', 'enfermagem', 'enfermeiro', 'enfermeiros', 'hospital', 'hospitais', 'farmacia'],
        'education' => ['educacao', 'professores', 'professor', 'escola', 'escolas', 'ensino', 'alunos', 'estudantes'],
        'business' => ['economia', 'gestao', 'contabilidade', 'banca', 'banco', 'bancos', 'financas', 'seguros', 'comercio'],
        'legal' => ['direito', 'juridico', 'tribunal', 'advocacia', 'advogado', 'advogados', 'justica'],
        'public' => ['administracao publica', 'funcao publica', 'concurso publico', 'concursos publicos', 'servico publico'],
        'communication' => ['comunicacao social', 'jornalismo', 'jornalista', 'marketing', 'publicidade', 'audiovisual'],
        'agriculture' => ['agricultura', 'agricola', 'agro', 'pecuaria', 'pescas', 'agropecuaria'],
        'hospitality' => ['turismo', 'hotelaria', 'hotel', 'hoteis', 'restauracao', 'gastronomia'],
        'logistics' => ['logistica', 'transportes', 'transporte', 'portos', 'aviacao', 'caminho de ferro'],
        'sciences' => ['ciencia', 'ciencias', 'investigacao cientifica', 'investigadores', 'biologia', 'quimica'],
    ],

];
