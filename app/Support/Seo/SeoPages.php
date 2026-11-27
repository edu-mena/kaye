<?php

namespace App\Support\Seo;

use App\Enums\ContentStatus;
use App\Models\Area;
use App\Models\Career;
use App\Models\Company;
use App\Models\Course;
use App\Models\CourseOffer;
use App\Models\Dataset;
use App\Models\Institution;
use App\Models\Internship;
use App\Models\Kurso;
use App\Models\News;
use App\Models\Scholarship;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Str;

/**
 * What a search engine gets for each page of the app (docs/seo.md): the title, the description, the canonical
 * address, the structured data (schema.org) and the page's main content as plain HTML, built on the server from the
 * same published rows the API serves. The React app replaces that content when it starts; crawlers and link
 * previews read it without running JavaScript.
 *
 * @phpstan-type Item array<string, string>
 * @phpstan-type Section array<string, mixed>
 * @phpstan-type Page array{status: int, index: bool, title: string, description: string, path: string, type: string,
 *     image: ?string, jsonLd: list<array<string, mixed>>, breadcrumbs: list<array{label: string, href: string}>,
 *     h1: string, lead: ?string, facts: list<array{label: string, value: string}>, sections: list<Section>}
 */
final class SeoPages
{
    private const string BRAND = 'Kayé';

    /**
     * Pages that belong to one person (an account, a plan, a CV being written): never in search results.
     */
    private const array PRIVATE = [
        'entrar', 'perfil', 'plano', 'configuracoes', 'notificacoes', 'familia', 'cv/editar', 'cv/cartao',
        'teste/resultado', 'teste/valencias', 'cursos/comparar', 'prazos',
    ];

    /**
     * The other pages of the app, with no row behind them: a title and a description each.
     *
     * @var array<string, array{0: string, 1: string}>
     */
    private const array STATIC = [
        'oportunidades' => ['Oportunidades para jovens em Angola: bolsas, estágios e concursos', 'Bolsas de estudo, estágios, concursos públicos e programas para jovens em Angola, com prazos e requisitos. Grátis.'],
        'sem-universidade' => ['Carreiras sem universidade em Angola: profissões com formação técnica', 'Profissões que se aprendem com cursos técnicos, médios e profissionais em Angola, sem licenciatura: o que fazem e onde aprender.'],
        'exames-de-acesso' => ['Exames de acesso ao ensino superior em Angola: perguntas e treino', 'Treina para os exames de acesso às universidades e institutos de Angola com perguntas de Matemática, Português, Física, Química e mais.'],
        'simulacoes' => ['Simulações de profissões: experimenta um dia de trabalho', 'Experimenta como é o trabalho de várias profissões em Angola com situações reais, antes de escolher o curso.'],
        'mentores' => ['Mentores: conversa com quem já trabalha na profissão', 'Profissionais angolanos que aceitam conversar com jovens sobre a sua carreira, o curso e o primeiro emprego.'],
        'testes' => ['Testes vocacionais e de aptidão grátis', 'Testes grátis para descobrires as tuas forças, interesses e as carreiras que combinam contigo, pensados para jovens em Angola.'],
        'teste' => ['Teste vocacional grátis: que carreira combina contigo?', 'Responde a perguntas sobre o que gostas de fazer e descobre as carreiras e os cursos que combinam contigo em Angola.'],
        'treino' => ['Treino de entrevistas e testes psicotécnicos', 'Pratica entrevistas de emprego e testes psicotécnicos usados nos recrutamentos em Angola.'],
        'entrevistas' => ['Perguntas de entrevista de emprego e como responder', 'As perguntas mais comuns nas entrevistas de emprego em Angola e como prepares boas respostas.'],
        'cv' => ['Como fazer um currículo (CV) em Angola: modelos e exemplos', 'Faz o teu CV grátis com modelos e exemplos por profissão, pensados para as empresas e recrutadores em Angola.'],
        'cv/passo-a-passo' => ['Currículo passo a passo: como escrever cada parte do CV', 'Um guia passo a passo para escreveres cada parte do teu currículo, com exemplos para quem procura o primeiro emprego em Angola.'],
        'pesquisa' => ['Pesquisar carreiras, cursos e instituições em Angola', 'Pesquisa profissões, cursos, universidades, empresas e bolsas em Angola num só sítio.'],
        'plus' => ['Kayé Plus', 'Kursos sem limite diário e certificados com o Kayé Plus.'],
        'suporte' => ['Ajuda e contactos', 'Fala com a equipa do Kayé.'],
        'privacidade' => ['Política de privacidade', 'Como o Kayé trata os teus dados.'],
        'termos' => ['Termos de utilização', 'As regras de utilização do Kayé.'],
    ];

    /**
     * The address of every page that should be in the sitemap.
     *
     * @return list<string>
     */
    public function paths(): array
    {
        $paths = ['/', '/carreiras', '/cursos', '/academias', '/empresas', '/areas', '/novidades', '/bolsas', '/estagios', '/mercado', '/kursos'];
        foreach (array_keys(self::STATIC) as $path) {
            if (! in_array($path, ['plus', 'suporte'], true)) {
                $paths[] = '/'.$path;
            }
        }

        foreach ([
            '/areas/' => Area::class, '/carreiras/' => Career::class, '/cursos/curso/' => Course::class,
            '/academias/' => Institution::class, '/empresas/' => Company::class, '/novidades/' => News::class,
            '/kursos/' => Kurso::class,
        ] as $prefix => $model) {
            foreach (self::published($model)->pluck('slug') as $slug) {
                $paths[] = $prefix.(is_scalar($slug) ? (string) $slug : '');
            }
        }

        return $paths;
    }

    /**
     * @return Page
     */
    public function page(string $path): array
    {
        $path = trim($path, '/');
        $parts = $path === '' ? [] : explode('/', $path);

        if (in_array($path, self::PRIVATE, true) || ($parts[0] ?? null) === 'c'
            || (($parts[0] ?? null) === 'kursos' && count($parts) > 2)) {
            return $this->private($path);
        }

        return match (true) {
            $parts === [] => $this->home(),
            $parts === ['carreiras'] => $this->careers(),
            $parts === ['cursos'] => $this->courses(),
            $parts === ['academias'] => $this->institutions(),
            $parts === ['empresas'] => $this->companies(),
            $parts === ['areas'] => $this->areas(),
            $parts === ['novidades'] => $this->newsList(),
            $parts === ['bolsas'] => $this->scholarships(),
            $parts === ['estagios'] => $this->internships(),
            $parts === ['mercado'] => $this->market(),
            $parts === ['kursos'] => $this->kursos(),
            count($parts) === 2 && $parts[0] === 'carreiras' => $this->career($parts[1]),
            count($parts) === 3 && $parts[0] === 'cursos' && $parts[1] === 'curso' => $this->course($parts[2]),
            count($parts) === 2 && $parts[0] === 'cursos' => $this->careerCourse($parts[1]),
            count($parts) === 2 && $parts[0] === 'academias' => $this->institution($parts[1]),
            count($parts) === 2 && $parts[0] === 'empresas' => $this->company($parts[1]),
            count($parts) === 2 && $parts[0] === 'areas' => $this->area($parts[1]),
            count($parts) === 2 && $parts[0] === 'novidades' => $this->news($parts[1]),
            count($parts) === 2 && $parts[0] === 'kursos' => $this->kurso($parts[1]),
            isset(self::STATIC[$path]) => $this->static($path),
            default => $this->generic('/'.$path),
        };
    }

    /**
     * @return Page
     */
    private function home(): array
    {
        $areas = self::published(Area::class)->get();
        $careers = self::published(Career::class)->where('detailed', true)->limit(30)->get();
        $institutions = self::published(Institution::class)->whereIn('type', ['universidade', 'instituto_superior'])->limit(20)->get();
        $url = $this->url('/');

        return $this->make(
            path: '/',
            title: 'Kayé: carreiras, cursos, universidades, bolsas e emprego em Angola',
            description: 'O que faz cada profissão, quanto se ganha, onde estudar e como lá chegar em Angola: carreiras, cursos, universidades, bolsas, estágios e dados do emprego. Grátis, para jovens dos 14 aos 30.',
            h1: 'Carreiras, cursos e emprego em Angola',
            lead: 'Todo o jovem merece saber o próximo passo. O Kayé mostra o que faz cada profissão, quanto se ganha, onde estudar, que bolsas e estágios há e o que as empresas pedem, em todas as áreas.',
            sections: [
                ['heading' => 'Áreas', 'items' => $this->links($areas, '/areas/', 'name')],
                ['heading' => 'Carreiras', 'items' => [...$this->links($careers, '/carreiras/', 'name'), ['label' => 'Todas as carreiras', 'href' => '/carreiras']]],
                ['heading' => 'Universidades e institutos', 'items' => [...$this->links($institutions, '/academias/', 'name'), ['label' => 'Todas as instituições', 'href' => '/academias']]],
                ['heading' => 'Oportunidades', 'items' => [
                    ['label' => 'Bolsas de estudo', 'href' => '/bolsas'], ['label' => 'Estágios', 'href' => '/estagios'],
                    ['label' => 'Mercado de trabalho: vagas, salários e desemprego', 'href' => '/mercado'],
                    ['label' => 'Notícias e eventos', 'href' => '/novidades'], ['label' => 'Kursos grátis', 'href' => '/kursos'],
                ]],
            ],
            jsonLd: [
                $this->organization(),
                [
                    '@context' => 'https://schema.org', '@type' => 'WebSite', 'name' => self::BRAND, 'url' => $url,
                    'inLanguage' => 'pt-AO', 'publisher' => ['@id' => $url.'#organization'],
                    'potentialAction' => [
                        '@type' => 'SearchAction',
                        'target' => ['@type' => 'EntryPoint', 'urlTemplate' => $this->url('/pesquisa').'?q={search_term_string}'],
                        'query-input' => 'required name=search_term_string',
                    ],
                ],
            ],
            breadcrumbs: [],
        );
    }

    /**
     * @return Page
     */
    private function careers(): array
    {
        $sections = [];
        foreach (self::published(Area::class)->with(['groups.careers' => fn ($query) => $query->where('status', ContentStatus::Published->value)->orderBy('position')])->get() as $area) {
            $careers = self::rows($area, 'groups')->flatMap(fn (Model $group): Collection => self::rows($group, 'careers'));
            if ($careers->isNotEmpty()) {
                $sections[] = ['heading' => self::text($area, 'name'), 'items' => $this->links($careers, '/carreiras/', 'name')];
            }
        }

        return $this->make(
            path: '/carreiras',
            title: 'Profissões e carreiras em Angola: o que fazem, salários e onde estudar',
            description: 'Mais de '.self::published(Career::class)->count().' profissões em Angola, em todas as áreas: o que fazem, quanto ganham, o curso que precisas e onde estudar.',
            h1: 'Profissões e carreiras em Angola',
            lead: 'Escolhe uma profissão para veres o que faz, como é o dia a dia, quanto se ganha em Angola, o que estudar e onde.',
            sections: $sections,
        );
    }

    /**
     * @return Page
     */
    private function career(string $slug): array
    {
        $career = self::published(Career::class)->where('slug', $slug)
            ->with(['group.area', 'skills', 'companies' => fn ($query) => $query->where('status', ContentStatus::Published->value), 'courseOffers' => fn ($query) => $query->where('status', ContentStatus::Published->value)->with(['institution', 'course'])])
            ->first();
        if (! $career instanceof Career) {
            return $this->missing('/carreiras/'.$slug);
        }

        $name = self::text($career, 'name');
        $summary = self::text($career, 'summary');
        $description = self::text($career, 'description');
        $salary = is_int($career->getAttribute('salary_median')) ? $career->getAttribute('salary_median') : null;
        $group = $career->getRelation('group');
        $area = $group instanceof Model ? $group->getRelation('area') : null;
        $skills = self::rows($career, 'skills')->map(fn (Model $skill): string => self::pivotName($skill) ?? self::text($skill, 'name'))->filter()->values()->all();
        $offers = self::offers($career, 'courseOffers');
        $siblings = $group instanceof Model
            ? self::published(Career::class)->where('career_group_id', $group->getKey())->whereKeyNot($career->getKey())->limit(12)->get()
            : new Collection;

        $facts = [];
        if ($salary !== null) {
            $facts[] = ['label' => 'Salário mediano', 'value' => self::money($salary).' por mês'];
        }
        if ($area instanceof Model) {
            $facts[] = ['label' => 'Área', 'value' => self::text($area, 'name')];
        }

        $occupation = [
            '@context' => 'https://schema.org', '@type' => 'Occupation', 'name' => $name,
            'description' => $description !== '' ? $description : $summary,
            'occupationLocation' => [['@type' => 'Country', 'name' => 'Angola']],
            'url' => $this->url('/carreiras/'.$slug),
        ];
        if ($skills !== []) {
            $occupation['skills'] = implode(', ', $skills);
        }
        if ($salary !== null) {
            $occupation['estimatedSalary'] = [[
                '@type' => 'MonetaryAmountDistribution', 'name' => 'Salário mediano', 'currency' => 'AOA', 'duration' => 'P1M',
                'median' => $salary,
            ]];
        }
        if ($offers->isNotEmpty()) {
            $occupation['educationRequirements'] = implode('; ', $offers->map(fn (CourseOffer $offer): string => self::offerName($offer))->unique()->take(5)->all());
        }
        $image = $this->image($career->getAttribute('image'));
        if ($image !== null) {
            $occupation['image'] = $image;
        }

        $crumbs = [['label' => 'Carreiras', 'href' => '/carreiras']];
        if ($area instanceof Model) {
            $crumbs[] = ['label' => self::text($area, 'name'), 'href' => '/areas/'.self::slug($area)];
        }
        $crumbs[] = ['label' => $name, 'href' => '/carreiras/'.$slug];

        return $this->make(
            path: '/carreiras/'.$slug,
            title: $name.': o que faz, salário e onde estudar em Angola',
            description: Str::limit(trim($summary.($salary !== null ? ' Salário mediano em Angola: '.self::money($salary).' por mês.' : '').' O que estudar e onde.'), 300),
            h1: $name,
            lead: $summary,
            facts: $facts,
            sections: array_values(array_filter([
                $description !== '' ? ['heading' => 'O que faz', 'text' => $description] : null,
                self::listSection('Um dia de trabalho', $career->getTranslation('day_to_day', 'pt')),
                $skills !== [] ? ['heading' => 'Competências', 'items' => array_map(fn (string $skill): array => ['label' => $skill], $skills)] : null,
                $offers->isNotEmpty() ? ['heading' => 'Onde estudar em Angola', 'items' => $offers->map(fn (CourseOffer $offer): array => $this->offerItem($offer, withInstitution: true))->values()->all()] : null,
                self::rows($career, 'companies')->isNotEmpty() ? ['heading' => 'Empresas onde trabalhar', 'items' => $this->links(self::rows($career, 'companies'), '/empresas/', 'name')] : null,
                $siblings->isNotEmpty() ? ['heading' => 'Carreiras parecidas', 'items' => $this->links($siblings, '/carreiras/', 'name')] : null,
            ])),
            jsonLd: [$occupation, $this->breadcrumbList($crumbs)],
            breadcrumbs: $crumbs,
            image: $image,
        );
    }

    /**
     * /cursos/{career}: the studies that lead to one career.
     *
     * @return Page
     */
    private function careerCourse(string $slug): array
    {
        $career = self::published(Career::class)->where('slug', $slug)->first();
        if (! $career instanceof Career) {
            return $this->missing('/cursos/'.$slug);
        }
        $name = self::text($career, 'name');

        return $this->make(
            path: '/cursos/'.$slug,
            title: 'O que estudar para ser '.$name.' em Angola',
            description: 'Os cursos, a duração e as instituições em Angola para chegares a '.$name.'.',
            h1: 'Estudar para '.$name,
            lead: self::text($career, 'summary'),
            sections: [['heading' => 'A profissão', 'items' => [['label' => $name, 'href' => '/carreiras/'.$slug]]]],
        );
    }

    /**
     * @return Page
     */
    private function courses(): array
    {
        $courses = self::published(Course::class)->get()->sortBy(fn (Course $course): string => Str::ascii(self::text($course, 'name')));

        return $this->make(
            path: '/cursos',
            title: 'Cursos superiores, técnicos e profissionais em Angola',
            description: self::published(Course::class)->count().' cursos em Angola, de licenciaturas a cursos técnicos e profissionais: onde estudar cada um e a que carreiras levam.',
            h1: 'Cursos em Angola',
            lead: 'Licenciaturas, cursos médios e técnicos e formação profissional: escolhe um curso para veres onde o podes tirar e a que profissões leva.',
            sections: [['heading' => 'Todos os cursos', 'items' => $this->links($courses, '/cursos/curso/', 'name')]],
        );
    }

    /**
     * @return Page
     */
    private function course(string $slug): array
    {
        $course = self::published(Course::class)->where('slug', $slug)
            ->with(['offers' => fn ($query) => $query->where('status', ContentStatus::Published->value)->with(['institution', 'careers'])])
            ->first();
        if (! $course instanceof Course) {
            return $this->missing('/cursos/curso/'.$slug);
        }
        $name = self::text($course, 'name');
        $offers = self::offers($course, 'offers');
        $institutions = new Collection($offers->map(fn (CourseOffer $offer): mixed => $offer->getRelation('institution'))->filter(fn (mixed $institution): bool => $institution instanceof Institution)->unique(fn (Institution $institution): mixed => $institution->getKey())->values()->all());
        $careers = $offers->flatMap(fn (CourseOffer $offer): Collection => self::rows($offer, 'careers'))->filter(fn (Model $career): bool => $career->getAttribute('status') === ContentStatus::Published)->unique(fn (Model $career): mixed => $career->getKey());
        $where = $institutions->take(3)->map(fn (Institution $institution): string => self::text($institution, 'name'))->implode(', ');
        $crumbs = [['label' => 'Cursos', 'href' => '/cursos'], ['label' => $name, 'href' => '/cursos/curso/'.$slug]];

        $jsonCourse = [
            '@context' => 'https://schema.org', '@type' => 'Course', 'name' => $name,
            'description' => 'Curso de '.$name.' em Angola'.($where !== '' ? ': '.$where : '').'.',
            'url' => $this->url('/cursos/curso/'.$slug), 'inLanguage' => 'pt',
        ];
        if ($institutions->isNotEmpty()) {
            $jsonCourse['provider'] = $institutions->take(10)->map(fn (Institution $institution): array => [
                '@type' => 'EducationalOrganization', 'name' => self::text($institution, 'name'), 'url' => $this->url('/academias/'.self::slug($institution)),
            ])->values()->all();
        }

        return $this->make(
            path: '/cursos/curso/'.$slug,
            title: $name.' em Angola: onde estudar',
            description: Str::limit('Onde tirar o curso de '.$name.' em Angola'.($where !== '' ? ': '.$where.($institutions->count() > 3 ? ' e mais '.($institutions->count() - 3) : '') : '').'. A que profissões leva e o que esperar.', 300),
            h1: $name,
            lead: $institutions->isNotEmpty() ? 'Este curso existe em '.$institutions->count().' '.($institutions->count() === 1 ? 'instituição' : 'instituições').' em Angola.' : null,
            sections: array_values(array_filter([
                $offers->isNotEmpty() ? ['heading' => 'Onde estudar', 'items' => $offers->map(fn (CourseOffer $offer): array => $this->offerItem($offer, withInstitution: true))->values()->all()] : null,
                $careers->isNotEmpty() ? ['heading' => 'A que profissões leva', 'items' => $this->links($careers, '/carreiras/', 'name')] : null,
            ])),
            jsonLd: [$jsonCourse, $this->breadcrumbList($crumbs)],
            breadcrumbs: $crumbs,
        );
    }

    /**
     * @return Page
     */
    private function institutions(): array
    {
        $sections = [];
        $labels = ['universidade' => 'Universidades', 'instituto_superior' => 'Institutos e escolas superiores', 'instituto_medio' => 'Institutos médios', 'centro_formacao' => 'Centros de formação profissional'];
        $all = self::published(Institution::class)->get();
        foreach ($labels as $type => $label) {
            $rows = $all->where('type', $type);
            if ($rows->isNotEmpty()) {
                $sections[] = ['heading' => $label, 'items' => $rows->map(fn (Institution $institution): array => [
                    'label' => self::text($institution, 'name'), 'href' => '/academias/'.self::slug($institution),
                    'note' => self::scalar($institution->getAttribute('province')),
                ])->values()->all()];
            }
        }

        return $this->make(
            path: '/academias',
            title: 'Universidades, institutos e centros de formação em Angola',
            description: $all->count().' universidades, institutos superiores e médios e centros de formação em Angola: cursos, províncias, contactos e como entrar.',
            h1: 'Onde estudar em Angola',
            lead: 'Universidades públicas e privadas, institutos superiores e médios e centros de formação profissional, com os cursos de cada um.',
            sections: $sections,
        );
    }

    /**
     * @return Page
     */
    private function institution(string $slug): array
    {
        $institution = self::published(Institution::class)->where('slug', $slug)
            ->with(['courseOffers' => fn ($query) => $query->where('status', ContentStatus::Published->value)->with('course')])
            ->first();
        if (! $institution instanceof Institution) {
            return $this->missing('/academias/'.$slug);
        }
        $name = self::text($institution, 'name');
        $summary = self::text($institution, 'summary');
        $province = self::scalar($institution->getAttribute('province'));
        $type = self::scalar($institution->getAttribute('type'));
        $typeLabel = ['universidade' => 'Universidade', 'instituto_superior' => 'Instituto superior', 'instituto_medio' => 'Instituto médio', 'centro_formacao' => 'Centro de formação'][$type] ?? null;
        $ownership = ['publica' => 'Pública', 'privada' => 'Privada', 'publico' => 'Pública', 'privado' => 'Privada'][self::scalar($institution->getAttribute('ownership'))] ?? null;
        $website = self::scalar($institution->getAttribute('website'));
        $offers = self::offers($institution, 'courseOffers');

        $facts = array_values(array_filter([
            $typeLabel !== null ? ['label' => 'Tipo', 'value' => $typeLabel.($ownership !== null ? ' ('.mb_strtolower($ownership).')' : '')] : null,
            $province !== '' ? ['label' => 'Província', 'value' => $province] : null,
            $offers->isNotEmpty() ? ['label' => 'Cursos', 'value' => (string) $offers->count()] : null,
        ]));

        $organization = [
            '@context' => 'https://schema.org',
            '@type' => in_array($type, ['universidade', 'instituto_superior'], true) ? 'CollegeOrUniversity' : 'EducationalOrganization',
            'name' => $name, 'url' => $this->url('/academias/'.$slug),
            'address' => array_filter(['@type' => 'PostalAddress', 'addressRegion' => $province !== '' ? $province : null, 'addressLocality' => self::scalar($institution->getAttribute('place')) ?: null, 'addressCountry' => 'AO']),
        ];
        if ($summary !== '') {
            $organization['description'] = $summary;
        }
        $sameAs = array_values(array_filter([$website, ...array_values(array_filter(Arr::wrap($institution->getAttribute('social')), 'is_string'))], fn (string $link): bool => str_starts_with($link, 'http')));
        if ($sameAs !== []) {
            $organization['sameAs'] = $sameAs;
        }
        if ($offers->isNotEmpty()) {
            $organization['hasOfferCatalog'] = ['@type' => 'OfferCatalog', 'name' => 'Cursos', 'itemListElement' => $offers->take(50)->map(fn (CourseOffer $offer): array => [
                '@type' => 'Offer', 'itemOffered' => ['@type' => 'Course', 'name' => self::offerName($offer)],
            ])->values()->all()];
        }
        $crumbs = [['label' => 'Instituições', 'href' => '/academias'], ['label' => $name, 'href' => '/academias/'.$slug]];

        return $this->make(
            path: '/academias/'.$slug,
            title: $name.': cursos, propinas e contactos',
            description: Str::limit(trim(($summary !== '' ? $summary.' ' : '').($offers->isNotEmpty() ? $offers->count().' cursos' : 'Cursos').($province !== '' ? ' em '.$province : '').', como entrar e contactos.'), 300),
            h1: $name,
            lead: $summary !== '' ? $summary : null,
            facts: $facts,
            sections: array_values(array_filter([
                $offers->isNotEmpty() ? ['heading' => 'Cursos', 'items' => $offers->map(fn (CourseOffer $offer): array => $this->offerItem($offer, withInstitution: false))->values()->all()] : null,
                $website !== '' ? ['heading' => 'Contactos', 'items' => [['label' => 'Site oficial', 'href' => $website]]] : null,
            ])),
            jsonLd: [$organization, $this->breadcrumbList($crumbs)],
            breadcrumbs: $crumbs,
        );
    }

    /**
     * @return Page
     */
    private function companies(): array
    {
        $companies = self::published(Company::class)->get()->sortBy(fn (Company $company): string => Str::ascii(self::text($company, 'name')));

        return $this->make(
            path: '/empresas',
            title: 'Empresas em Angola: onde trabalhar, carreiras e programas de estágio',
            description: $companies->count().' empresas em Angola: o que fazem, as carreiras que contratam, programas de trainees e estágios e como chegar lá.',
            h1: 'Empresas em Angola',
            lead: 'Onde trabalhar em Angola: o que cada empresa faz, as profissões que procura e os seus programas para jovens.',
            sections: [['heading' => 'Todas as empresas', 'items' => $companies->map(fn (Company $company): array => [
                'label' => self::text($company, 'name'), 'href' => '/empresas/'.self::slug($company), 'note' => self::scalar($company->getAttribute('province')),
            ])->values()->all()]],
        );
    }

    /**
     * @return Page
     */
    private function company(string $slug): array
    {
        $company = self::published(Company::class)->where('slug', $slug)
            ->with(['careers' => fn ($query) => $query->where('status', ContentStatus::Published->value)])
            ->first();
        if (! $company instanceof Company) {
            return $this->missing('/empresas/'.$slug);
        }
        $name = self::text($company, 'name');
        $summary = self::text($company, 'summary');
        $province = self::scalar($company->getAttribute('province'));
        $website = self::scalar($company->getAttribute('website'));
        $careers = self::rows($company, 'careers');
        $crumbs = [['label' => 'Empresas', 'href' => '/empresas'], ['label' => $name, 'href' => '/empresas/'.$slug]];

        $organization = [
            '@context' => 'https://schema.org', '@type' => 'Organization', 'name' => $name, 'url' => $this->url('/empresas/'.$slug),
            'address' => array_filter(['@type' => 'PostalAddress', 'addressRegion' => $province !== '' ? $province : null, 'addressCountry' => 'AO']),
        ];
        if ($summary !== '') {
            $organization['description'] = $summary;
        }
        $sameAs = array_values(array_filter([$website, ...array_values(array_filter(Arr::wrap($company->getAttribute('socials')), 'is_string'))], fn (string $link): bool => str_starts_with($link, 'http')));
        if ($sameAs !== []) {
            $organization['sameAs'] = $sameAs;
        }

        return $this->make(
            path: '/empresas/'.$slug,
            title: 'Trabalhar na '.$name.': carreiras e como entrar',
            description: Str::limit(trim(($summary !== '' ? $summary.' ' : '').'As carreiras que contrata'.($province !== '' ? ' em '.$province : '').' e como chegar lá.'), 300),
            h1: $name,
            lead: $summary !== '' ? $summary : null,
            facts: $province !== '' ? [['label' => 'Província', 'value' => $province]] : [],
            sections: array_values(array_filter([
                self::listSection('O que faz', $company->getTranslation('activities', 'pt')),
                $careers->isNotEmpty() ? ['heading' => 'Carreiras na empresa', 'items' => $this->links($careers, '/carreiras/', 'name')] : null,
                self::listSection('Programas para jovens', $company->getTranslation('programs', 'pt')),
                $website !== '' ? ['heading' => 'Contactos', 'items' => [['label' => 'Site oficial', 'href' => $website]]] : null,
            ])),
            jsonLd: [$organization, $this->breadcrumbList($crumbs)],
            breadcrumbs: $crumbs,
        );
    }

    /**
     * @return Page
     */
    private function areas(): array
    {
        $areas = self::published(Area::class)->get();

        return $this->make(
            path: '/areas',
            title: 'Áreas profissionais em Angola: saúde, engenharia, tecnologia e mais',
            description: 'As '.$areas->count().' áreas profissionais do Kayé: as carreiras de cada uma, onde estudar e as empresas que contratam em Angola.',
            h1: 'Áreas profissionais',
            lead: 'Escolhe uma área para veres as profissões, os cursos e as oportunidades.',
            sections: [['heading' => 'Todas as áreas', 'items' => $this->links($areas, '/areas/', 'name')]],
        );
    }

    /**
     * @return Page
     */
    private function area(string $slug): array
    {
        $area = self::published(Area::class)->where('slug', $slug)
            ->with(['groups.careers' => fn ($query) => $query->where('status', ContentStatus::Published->value)->orderBy('position')])
            ->first();
        if (! $area instanceof Area) {
            return $this->missing('/areas/'.$slug);
        }
        $name = self::text($area, 'name');
        $sections = [];
        foreach (self::rows($area, 'groups') as $group) {
            $careers = self::rows($group, 'careers');
            if ($careers->isNotEmpty()) {
                $sections[] = ['heading' => self::text($group, 'name'), 'items' => $this->links($careers, '/carreiras/', 'name')];
            }
        }
        $count = array_sum(array_map(fn (array $section): int => count($section['items']), $sections));
        $crumbs = [['label' => 'Áreas', 'href' => '/areas'], ['label' => $name, 'href' => '/areas/'.$slug]];

        return $this->make(
            path: '/areas/'.$slug,
            title: $name.' em Angola: profissões, cursos e emprego',
            description: $count.' profissões de '.mb_strtolower($name).' em Angola: o que fazem, quanto ganham, onde estudar e as empresas que contratam.',
            h1: $name,
            lead: $count.' profissões em Angola, com o que fazem, o salário, o curso e onde estudar.',
            sections: $sections,
            jsonLd: [$this->breadcrumbList($crumbs)],
            breadcrumbs: $crumbs,
        );
    }

    /**
     * @return Page
     */
    private function newsList(): array
    {
        $news = self::published(News::class)->reorder()->orderByDesc('date')->limit(60)->get();

        return $this->make(
            path: '/novidades',
            title: 'Notícias de educação, emprego e carreiras em Angola',
            description: 'As notícias e os eventos de formação, emprego, bolsas e carreiras em Angola, com a fonte de cada uma.',
            h1: 'Notícias e eventos',
            lead: 'Formação, emprego, bolsas e eventos para jovens em Angola.',
            sections: [['heading' => 'Últimas', 'items' => $news->map(fn (News $item): array => [
                'label' => self::text($item, 'title'), 'href' => '/novidades/'.self::slug($item), 'note' => self::date($item->getAttribute('date')),
            ])->values()->all()]],
        );
    }

    /**
     * @return Page
     */
    private function news(string $slug): array
    {
        $news = self::published(News::class)->where('slug', $slug)->first();
        if (! $news instanceof News) {
            return $this->missing('/novidades/'.$slug);
        }
        $title = self::text($news, 'title');
        $summary = self::text($news, 'summary');
        $body = self::text($news, 'body');
        $date = $news->getAttribute('date');
        $source = Arr::wrap($news->getAttribute('source'));
        $sourceUrl = is_string($source['url'] ?? null) ? $source['url'] : null;
        $image = $this->image($news->getAttribute('image'));
        $crumbs = [['label' => 'Notícias', 'href' => '/novidades'], ['label' => $title, 'href' => '/novidades/'.$slug]];

        $article = [
            '@context' => 'https://schema.org', '@type' => 'NewsArticle', 'headline' => Str::limit($title, 110, ''),
            'description' => $summary, 'url' => $this->url('/novidades/'.$slug), 'inLanguage' => 'pt',
            'publisher' => ['@type' => 'Organization', 'name' => self::BRAND, 'url' => $this->url('/')],
        ];
        if ($date instanceof DateTimeInterface) {
            $article['datePublished'] = $date->format('Y-m-d');
        }
        if ($image !== null) {
            $article['image'] = [$image];
        }
        if ($sourceUrl !== null) {
            $article['isBasedOn'] = $sourceUrl;
        }

        return $this->make(
            path: '/novidades/'.$slug,
            title: $title,
            description: Str::limit($summary !== '' ? $summary : $body, 300),
            h1: $title,
            lead: $summary !== '' ? $summary : null,
            facts: self::date($date) !== '' ? [['label' => 'Data', 'value' => self::date($date)]] : [],
            sections: array_values(array_filter([
                $body !== '' ? ['heading' => 'A notícia', 'text' => $body] : null,
                $sourceUrl !== null ? ['heading' => 'Fonte', 'items' => [['label' => is_string($source['label'] ?? null) ? $source['label'] : $sourceUrl, 'href' => $sourceUrl]]] : null,
            ])),
            jsonLd: [$article, $this->breadcrumbList($crumbs)],
            breadcrumbs: $crumbs,
            type: 'article',
            image: $image,
        );
    }

    /**
     * @return Page
     */
    private function scholarships(): array
    {
        $rows = self::published(Scholarship::class)->get();

        return $this->make(
            path: '/bolsas',
            title: 'Bolsas de estudo para angolanos '.now()->year.': em Angola e no estrangeiro',
            description: $rows->count().' bolsas de estudo para angolanos, em Angola e no estrangeiro: quem as dá, o que cobrem, requisitos e prazos de candidatura.',
            h1: 'Bolsas de estudo',
            lead: 'Bolsas de empresas, do Estado e de outros países para estudantes angolanos, com o que cobrem e quando te podes candidatar.',
            sections: [['heading' => 'Bolsas', 'items' => $rows->map(fn (Scholarship $row): array => $this->opportunityItem($row))->values()->all()]],
        );
    }

    /**
     * @return Page
     */
    private function internships(): array
    {
        $rows = self::published(Internship::class)->get();

        return $this->make(
            path: '/estagios',
            title: 'Estágios e programas de trainees em Angola',
            description: $rows->count().' programas de estágio e de trainees em empresas angolanas: requisitos, prazos e como te candidatares.',
            h1: 'Estágios e programas de trainees',
            lead: 'Programas para recém-formados e estudantes nas empresas em Angola.',
            sections: [['heading' => 'Programas', 'items' => $rows->map(fn (Internship $row): array => $this->opportunityItem($row))->values()->all()]],
        );
    }

    /**
     * /mercado: the numbers of the job market, education and unemployment, with their sources.
     *
     * @return Page
     */
    private function market(): array
    {
        $jobs = self::datasetData('jobs');
        $employment = self::datasetData('employment');
        $education = self::datasetData('education');
        $areaNames = self::published(Area::class)->get()->mapWithKeys(fn (Area $area): array => [self::slug($area) => self::text($area, 'name')]);
        $postings = is_int($jobs['postings'] ?? null) ? $jobs['postings'] : null;
        $from = self::scalar($jobs['from'] ?? null);
        $updated = self::scalar($jobs['updated'] ?? null);
        $unemployment = is_numeric($employment['unemployment'] ?? null) ? (float) $employment['unemployment'] : null;
        $youth = Arr::wrap($employment['youth'] ?? null);
        $youthRate = is_numeric($youth['unemployment'] ?? null) ? (float) $youth['unemployment'] : null;
        $graduates = is_int($education['total'] ?? null) ? $education['total'] : null;

        $facts = array_values(array_filter([
            $postings !== null ? ['label' => 'Anúncios de emprego analisados', 'value' => self::number($postings).($from !== '' ? ' (de '.self::date($from).' a '.self::date($updated).')' : '')] : null,
            $unemployment !== null ? ['label' => 'Desemprego em Angola ('.self::scalar($employment['year'] ?? null).')', 'value' => self::percent($unemployment)] : null,
            $youthRate !== null ? ['label' => 'Desemprego dos 15 aos 24 anos', 'value' => self::percent($youthRate)] : null,
            $graduates !== null ? ['label' => 'Licenciados ('.self::scalar($education['year'] ?? null).')', 'value' => self::number($graduates)] : null,
        ]));

        $count = fn (mixed $rows, string $key, ?callable $label = null): array => array_map(
            fn (array $row): array => ['label' => $label !== null ? $label(self::scalar($row[$key] ?? null)) : self::scalar($row[$key] ?? null), 'note' => self::number(is_int($row['postings'] ?? null) ? $row['postings'] : (is_int($row['graduates'] ?? null) ? $row['graduates'] : 0))],
            array_slice(array_values(array_filter(Arr::wrap($rows), 'is_array')), 0, 15),
        );
        $careerNames = self::published(Career::class)->pluck('name', 'slug');
        $careerRows = array_slice(array_values(array_filter(Arr::wrap($jobs['careers'] ?? null), 'is_array')), 0, 20);

        $sources = array_values(array_filter([
            ...array_map(fn (mixed $source): ?array => is_array($source) && is_string($source['url'] ?? null) ? ['label' => self::scalar($source['name'] ?? $source['url']), 'href' => $source['url']] : null, Arr::wrap($jobs['sources'] ?? null)),
            ...array_map(fn (mixed $source): ?array => is_array($source) && is_string($source['url'] ?? null) ? ['label' => self::scalar($source['label'] ?? $source['url']), 'href' => $source['url']] : null, [$employment['source'] ?? null, $education['source'] ?? null]),
        ]));

        $datasets = [];
        if ($postings !== null) {
            $datasets[] = $this->dataset('Anúncios de emprego em Angola', 'Os '.self::number($postings).' anúncios de vagas, estágios e concursos publicados em Angola de '.$from.' a '.$updated.', por mês, área, província, empresa e profissão, recolhidos pelo Kayé.', $from.'/'.$updated, ['vagas por mês', 'vagas por área', 'vagas por província', 'vagas por empresa', 'vagas por profissão']);
        }
        if ($unemployment !== null) {
            $source = Arr::wrap($employment['source'] ?? null);
            $datasets[] = $this->dataset('Desemprego em Angola por idade', 'A taxa de desemprego em Angola e dos jovens, segundo o INE ('.self::scalar($employment['year'] ?? null).').', self::scalar($employment['year'] ?? null), ['taxa de desemprego', 'desemprego por idade', 'jovens que não estudam nem trabalham'], is_string($source['url'] ?? null) ? $source['url'] : null);
        }
        if ($graduates !== null) {
            $source = Arr::wrap($education['source'] ?? null);
            $datasets[] = $this->dataset('Ensino superior em Angola: licenciados e acesso', 'Licenciados, inscritos, candidatos e vagas no ensino superior em Angola, por área e província ('.self::scalar($education['year'] ?? null).').', self::scalar($education['year'] ?? null), ['licenciados por área', 'licenciados por província', 'candidatos e vagas'], is_string($source['url'] ?? null) ? $source['url'] : null);
        }

        return $this->make(
            path: '/mercado',
            title: 'Mercado de trabalho em Angola: vagas, profissões procuradas e desemprego',
            description: 'Dados do emprego em Angola: '.($postings !== null ? self::number($postings).' anúncios de vagas analisados, ' : '').'as profissões e as províncias com mais vagas'.($unemployment !== null ? ', o desemprego ('.self::percent($unemployment).') e o dos jovens' : '').', com fontes.',
            h1: 'O mercado de trabalho em Angola',
            lead: 'Onde há vagas, que profissões as empresas procuram e como está o desemprego dos jovens, com os dados mais recentes e as suas fontes.',
            facts: $facts,
            sections: array_values(array_filter([
                $careerRows !== [] ? ['heading' => 'Profissões com mais vagas', 'items' => array_map(fn (array $row): array => [
                    'label' => self::text(null, null, $careerNames[$row['slug'] ?? ''] ?? null, self::scalar($row['slug'] ?? null)),
                    'href' => '/carreiras/'.self::scalar($row['slug'] ?? null),
                    'note' => self::number(is_int($row['postings'] ?? null) ? $row['postings'] : 0).' anúncios',
                ], $careerRows)] : null,
                ['heading' => 'Vagas por área', 'items' => $count($jobs['areas'] ?? null, 'area', fn (string $slug): string => $areaNames[$slug] ?? Str::ucfirst(str_replace('_', ' ', $slug)))],
                ['heading' => 'Vagas por província', 'items' => $count($jobs['provinces'] ?? null, 'province')],
                ['heading' => 'Empresas que mais anunciam', 'items' => $count($jobs['companies'] ?? null, 'name')],
                ['heading' => 'Licenciados por província', 'items' => $count($education['provinces'] ?? null, 'province')],
                $sources !== [] ? ['heading' => 'Fontes', 'items' => $sources] : null,
            ], fn (?array $section): bool => $section !== null && $section['items'] !== [])),
            jsonLd: $datasets,
        );
    }

    /**
     * @return Page
     */
    private function kursos(): array
    {
        $kursos = self::published(Kurso::class)->get();

        return $this->make(
            path: '/kursos',
            title: 'Kursos grátis: cursos curtos online para jovens em Angola',
            description: 'Cursos curtos e grátis no telemóvel, com exercícios e exame: análise de dados, contabilidade, marketing digital, programação, inglês e mais.',
            h1: 'Kursos',
            lead: 'Cursos curtos no telemóvel, um tema por dia, com exercícios e exame no fim.',
            sections: [['heading' => 'Todos os Kursos', 'items' => $kursos->map(fn (Kurso $kurso): array => [
                'label' => self::text($kurso, 'title'), 'href' => '/kursos/'.self::slug($kurso), 'note' => self::text($kurso, 'subtitle'),
            ])->values()->all()]],
        );
    }

    /**
     * @return Page
     */
    private function kurso(string $slug): array
    {
        $kurso = self::published(Kurso::class)->where('slug', $slug)->first();
        if (! $kurso instanceof Kurso) {
            return $this->missing('/kursos/'.$slug);
        }
        $title = self::text($kurso, 'title');
        $subtitle = self::text($kurso, 'subtitle');
        $crumbs = [['label' => 'Kursos', 'href' => '/kursos'], ['label' => $title, 'href' => '/kursos/'.$slug]];

        return $this->make(
            path: '/kursos/'.$slug,
            title: $title.': curso online grátis',
            description: Str::limit($subtitle.' Curso curto no telemóvel, com exercícios e exame.', 300),
            h1: $title,
            lead: $subtitle !== '' ? $subtitle : null,
            sections: array_values(array_filter([
                self::listSection('O que vais aprender', $kurso->getTranslation('goals', 'pt')),
                self::text($kurso, 'audience') !== '' ? ['heading' => 'Para quem', 'text' => self::text($kurso, 'audience')] : null,
            ])),
            jsonLd: [[
                '@context' => 'https://schema.org', '@type' => 'Course', 'name' => $title, 'description' => $subtitle,
                'url' => $this->url('/kursos/'.$slug), 'inLanguage' => 'pt',
                'provider' => ['@type' => 'Organization', 'name' => self::BRAND, 'sameAs' => array_values($this->socials())],
            ], $this->breadcrumbList($crumbs)],
            breadcrumbs: $crumbs,
        );
    }

    /**
     * @return Page
     */
    private function static(string $path): array
    {
        [$title, $description] = self::STATIC[$path];

        return $this->make(path: '/'.$path, title: $title, description: $description, h1: $title, lead: $description);
    }

    /**
     * A page of the app with nothing to describe (a new screen, or a path React will call "not found").
     *
     * @return Page
     */
    private function generic(string $path): array
    {
        return $this->make(
            path: $path,
            title: 'Kayé',
            description: 'Carreiras, cursos, bolsas e emprego em Angola, em todas as áreas. Grátis, para jovens dos 14 aos 30.',
            h1: self::BRAND,
            index: false,
        );
    }

    /**
     * @return Page
     */
    private function private(string $path): array
    {
        return [...$this->generic('/'.$path), 'index' => false];
    }

    /**
     * A detail page whose row does not exist or is not published: a real 404, so it never enters an index.
     *
     * @return Page
     */
    private function missing(string $path): array
    {
        return [...$this->generic($path), 'status' => 404, 'title' => 'Página não encontrada', 'h1' => 'Página não encontrada'];
    }

    /**
     * @param  list<array{label: string, href: string}>  $breadcrumbs
     * @param  list<array{label: string, value: string}>  $facts
     * @param  list<Section>  $sections
     * @param  list<array<string, mixed>>  $jsonLd
     * @return Page
     */
    private function make(string $path, string $title, string $description, string $h1, ?string $lead = null, array $facts = [],
        array $sections = [], array $jsonLd = [], array $breadcrumbs = [], string $type = 'website', ?string $image = null, bool $index = true): array
    {
        return [
            'status' => 200, 'index' => $index, 'title' => $title, 'description' => trim($description), 'path' => $path,
            'type' => $type, 'image' => $image, 'jsonLd' => $jsonLd, 'breadcrumbs' => $breadcrumbs, 'h1' => $h1,
            'lead' => $lead !== null && trim($lead) !== '' ? trim($lead) : null, 'facts' => $facts,
            'sections' => array_values(array_filter($sections, fn (array $section): bool => ($section['items'] ?? []) !== [] || ($section['text'] ?? '') !== '')),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function organization(): array
    {
        $url = $this->url('/');

        return [
            '@context' => 'https://schema.org', '@type' => 'Organization', '@id' => $url.'#organization', 'name' => self::BRAND,
            'alternateName' => 'Kaye Angola', 'url' => $url, 'logo' => $this->url('/spa/pwa-512.png'),
            'description' => 'Orientação de carreira grátis para jovens em Angola: profissões, cursos, instituições, bolsas, estágios e dados do emprego.',
            'areaServed' => ['@type' => 'Country', 'name' => 'Angola'],
            'email' => 'ola@kayeangola.com',
            'sameAs' => array_values($this->socials()),
        ];
    }

    /**
     * @return array<string, string>
     */
    public function socials(): array
    {
        /** @var array<string, string> $socials */
        $socials = array_filter(Arr::wrap(Config::get('kaye.socials')), 'is_string');

        return $socials;
    }

    /**
     * @param  list<array{label: string, href: string}>  $crumbs
     * @return array<string, mixed>
     */
    private function breadcrumbList(array $crumbs): array
    {
        $items = [['label' => 'Início', 'href' => '/'], ...$crumbs];

        return ['@context' => 'https://schema.org', '@type' => 'BreadcrumbList', 'itemListElement' => array_map(
            fn (array $crumb, int $index): array => ['@type' => 'ListItem', 'position' => $index + 1, 'name' => $crumb['label'], 'item' => $this->url($crumb['href'])],
            $items, array_keys($items),
        )];
    }

    /**
     * @param  list<string>  $measured
     * @return array<string, mixed>
     */
    private function dataset(string $name, string $description, string $coverage, array $measured, ?string $basedOn = null): array
    {
        $dataset = [
            '@context' => 'https://schema.org', '@type' => 'Dataset', 'name' => $name, 'description' => $description,
            'url' => $this->url('/mercado'), 'spatialCoverage' => ['@type' => 'Place', 'name' => 'Angola'],
            'temporalCoverage' => $coverage, 'variableMeasured' => $measured, 'inLanguage' => 'pt',
            'creator' => ['@type' => 'Organization', 'name' => self::BRAND, 'url' => $this->url('/')],
            'isAccessibleForFree' => true,
        ];
        if ($basedOn !== null) {
            $dataset['isBasedOn'] = $basedOn;
        }

        return $dataset;
    }

    public function url(string $path): string
    {
        return rtrim(Config::string('app.url'), '/').'/'.ltrim($path, '/');
    }

    /**
     * The address of a picture of the catalogue. They point at the web app's sources (/src/assets/…/x-800.webp);
     * the build put them in public/spa/assets with a hash in the name.
     */
    private function image(mixed $image): ?string
    {
        $source = Arr::wrap($image)['large'] ?? Arr::wrap($image)['small'] ?? null;
        if (! is_string($source) || $source === '') {
            return null;
        }
        if (str_starts_with($source, 'http')) {
            return $source;
        }
        $built = SeoImages::find(pathinfo($source, PATHINFO_FILENAME), pathinfo($source, PATHINFO_EXTENSION));

        return $built !== null ? $this->url($built) : null;
    }

    /**
     * @return Item
     */
    private function offerItem(CourseOffer $offer, bool $withInstitution): array
    {
        $institution = $offer->relationLoaded('institution') ? $offer->getRelation('institution') : null;
        $course = $offer->relationLoaded('course') ? $offer->getRelation('course') : null;
        $level = self::scalar($offer->getAttribute('level'));
        $levelLabel = ['licenciatura' => 'licenciatura', 'mestrado' => 'mestrado', 'doutoramento' => 'doutoramento', 'medio_tecnico' => 'médio técnico', 'certificacao' => 'certificação', 'profissional' => 'profissional', 'bacharelato' => 'bacharelato'][$level] ?? str_replace('_', ' ', $level);

        if ($withInstitution && $institution instanceof Institution) {
            return ['label' => self::offerName($offer).' — '.self::text($institution, 'name'), 'href' => '/academias/'.self::slug($institution), 'note' => $levelLabel];
        }

        return array_filter(['label' => self::offerName($offer), 'href' => $course instanceof Course ? '/cursos/curso/'.self::slug($course) : null, 'note' => $levelLabel]);
    }

    private static function offerName(CourseOffer $offer): string
    {
        $name = self::text($offer, 'name');
        if ($name !== '') {
            return $name;
        }
        $course = $offer->relationLoaded('course') ? $offer->getRelation('course') : null;

        return $course instanceof Course ? self::text($course, 'name') : self::text($offer, 'course_name');
    }

    /**
     * @return Item
     */
    private function opportunityItem(Scholarship|Internship $row): array
    {
        $deadline = self::date($row->getAttribute('deadline'));
        $provider = self::scalar($row->getAttribute('provider'));

        return array_filter([
            'label' => self::text($row, 'name').($provider !== '' ? ' — '.$provider : ''),
            'href' => str_starts_with(self::scalar($row->getAttribute('url')), 'http') ? self::scalar($row->getAttribute('url')) : null,
            'note' => $deadline !== '' ? 'prazo: '.$deadline : null,
        ]);
    }

    /**
     * @param  iterable<Model>  $rows
     * @return list<Item>
     */
    private function links(iterable $rows, string $prefix, string $attribute): array
    {
        $items = [];
        foreach ($rows as $row) {
            $items[] = ['label' => self::text($row, $attribute), 'href' => $prefix.self::slug($row)];
        }

        return $items;
    }

    /**
     * @return Section|null
     */
    private static function listSection(string $heading, mixed $lines): ?array
    {
        $items = array_values(array_filter(array_map(
            fn (mixed $line): string => is_string($line) ? trim($line) : (is_array($line) ? self::scalar($line['title'] ?? $line['name'] ?? $line['text'] ?? null) : ''),
            Arr::wrap($lines),
        )));
        if ($items === [] && is_string($lines) && trim($lines) !== '') {
            return ['heading' => $heading, 'text' => trim($lines)];
        }

        return $items === [] ? null : ['heading' => $heading, 'items' => array_map(fn (string $line): array => ['label' => $line], $items)];
    }

    /**
     * @template TModel of Model
     *
     * @param  class-string<TModel>  $model
     * @return Builder<TModel>
     */
    private static function published(string $model): Builder
    {
        /** @var Builder<TModel> $query */
        $query = $model::query();

        return $query->where($query->qualifyColumn('status'), ContentStatus::Published->value)->orderBy($query->qualifyColumn('position'));
    }

    /**
     * @return array<array-key, mixed>
     */
    private static function datasetData(string $slug): array
    {
        $dataset = self::published(Dataset::class)->where('slug', $slug)->first();

        return $dataset instanceof Dataset ? Arr::wrap($dataset->getAttribute('data')) : [];
    }

    /**
     * A translatable attribute in Portuguese, or a plain one; never null.
     */
    private static function text(?Model $model, ?string $attribute, mixed $raw = null, string $fallback = ''): string
    {
        if ($model !== null && $attribute !== null) {
            $translatable = property_exists($model, 'translatable') && is_array($model->translatable) ? $model->translatable : [];
            $raw = method_exists($model, 'getTranslation') && in_array($attribute, $translatable, true)
                ? $model->getTranslation($attribute, 'pt')
                : $model->getAttribute($attribute);
        }
        if (is_array($raw)) {
            $raw = $raw['pt'] ?? reset($raw);
        }

        return is_string($raw) && trim($raw) !== '' ? trim($raw) : $fallback;
    }

    /**
     * The rows of a relation (loaded when needed), always as models.
     *
     * @return Collection<int, Model>
     */
    private static function rows(Model $model, string $relation): Collection
    {
        $rows = $model->getRelationValue($relation);

        return new Collection($rows instanceof Collection ? array_values($rows->all()) : []);
    }

    /**
     * @return Collection<int, CourseOffer>
     */
    private static function offers(Model $model, string $relation): Collection
    {
        return new Collection(self::rows($model, $relation)->filter(fn (Model $row): bool => $row instanceof CourseOffer)->values()->all());
    }

    private static function pivotName(Model $model): ?string
    {
        $pivot = $model->getRelationValue('pivot');
        $name = $pivot instanceof Model ? $pivot->getAttribute('name') : null;

        return is_string($name) && $name !== '' ? $name : null;
    }

    private static function slug(Model $model): string
    {
        return self::scalar($model->getAttribute('slug'));
    }

    private static function scalar(mixed $value): string
    {
        return is_scalar($value) ? trim((string) $value) : '';
    }

    private static function money(int $amount): string
    {
        return number_format($amount, 0, ',', ' ').' Kz';
    }

    private static function number(int $value): string
    {
        return number_format($value, 0, ',', ' ');
    }

    private static function percent(float $rate): string
    {
        return number_format($rate * 100, 1, ',', ' ').' %';
    }

    private static function date(mixed $date): string
    {
        if (is_string($date) && $date !== '') {
            $date = date_create($date) ?: null;
        }
        if (! $date instanceof DateTimeInterface) {
            return '';
        }
        $months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

        return (int) $date->format('j').' de '.$months[(int) $date->format('n') - 1].' de '.$date->format('Y');
    }
}
