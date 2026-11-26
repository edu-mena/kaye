<?php

namespace App\Filament\Content;

use BackedEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * The panel's words for the catalogue: the label of each column (the panel speaks Portuguese, the columns English)
 * and the name of a row.
 */
final class ContentLabels
{
    /** The columns that name a row, in order of preference. */
    private const TITLES = ['name', 'title', 'course_name', 'text', 'prompt', 'external_id', 'question_id', 'academic_year'];

    private const LABELS = [
        'slug' => 'Identificador (slug)', 'status' => 'Estado', 'source_url' => 'Fonte principal', 'source_checked_at' => 'Confirmado em',
        'estimated' => 'Estimado', 'position' => 'Ordem', 'name' => 'Nome', 'title' => 'Título', 'subtitle' => 'Subtítulo',
        'summary' => 'Resumo', 'description' => 'Descrição', 'text' => 'Texto', 'body' => 'Texto completo', 'intro' => 'Introdução',
        'kind' => 'Tipo', 'type' => 'Tipo', 'level' => 'Nível', 'levels' => 'Níveis', 'area' => 'Área', 'areas' => 'Áreas',
        'area_id' => 'Área', 'career_group_id' => 'Grupo', 'career_id' => 'Carreira', 'company_id' => 'Empresa',
        'institution_id' => 'Instituição', 'course_id' => 'Curso', 'course_offer_id' => 'Oferta', 'pathway_id' => 'Caminho',
        'kurso_id' => 'Kurso', 'kurso_unit_id' => 'Unidade', 'news_id' => 'Notícia', 'agent_id' => 'Agente',
        'subject' => 'Disciplina', 'topic' => 'Tema', 'passage' => 'Texto de apoio', 'options' => 'Opções', 'answer' => 'Resposta certa',
        'answers' => 'Respostas certas', 'explanation' => 'Explicação', 'academic_year' => 'Ano letivo',
        'registration_start' => 'Inscrições: início', 'registration_end' => 'Inscrições: fim', 'exam_dates' => 'Datas dos exames',
        'subjects' => 'Disciplinas', 'requirements' => 'Requisitos', 'vacancies' => 'Vagas', 'min_grade' => 'Nota mínima',
        'min_grade_year' => 'Ano da nota mínima', 'fee_aoa' => 'Taxa (Kz)', 'url' => 'Ligação', 'sources' => 'Fontes',
        'source' => 'Fonte', 'role' => 'Função', 'verified_by' => 'Verificado por', 'verified_at' => 'Verificado em',
        'company' => 'Empresa', 'photo' => 'Fotografia', 'consent_at' => 'Consentimento em', 'context' => 'Contexto',
        'dimension' => 'Dimensão (RIASEC)', 'riasec' => 'Código RIASEC', 'demand' => 'Procura', 'salary_median' => 'Salário mediano (Kz)',
        'salary_kind' => 'Tipo de salário', 'detailed' => 'Tem guia completo', 'image' => 'Imagem', 'day_to_day' => 'O dia a dia',
        'work_context' => 'Ambiente de trabalho', 'work_styles' => 'Maneiras de trabalhar', 'employer_asks' => 'O que os empregadores pedem',
        'stages' => 'Etapas da carreira', 'market' => 'Mercado', 'cv_guide' => 'Guia do CV', 'self_employment' => 'Por conta própria',
        'sector' => 'Setor', 'province' => 'Província', 'place' => 'Local', 'logo' => 'Logótipo', 'banner' => 'Faixa (banner)',
        'website' => 'Site oficial', 'logo_on_dark' => 'Logótipo branco (fundo escuro)', 'careers_sourced' => 'Profissões com fonte',
        'groups' => 'Grupos de carreiras', 'programs' => 'Programas para jovens', 'activities' => 'Atividades',
        'activities_source' => 'Fonte das atividades', 'founded' => 'Fundação', 'employees' => 'Trabalhadores', 'socials' => 'Redes sociais',
        'social' => 'Redes sociais', 'roles' => 'Funções que contrata', 'people' => 'Pessoas', 'insights' => 'Destaques', 'quotes' => 'Citações',
        'headquarters' => 'Sede', 'course_name' => 'Nome do curso', 'faculty' => 'Faculdade', 'recognition' => 'Reconhecimento',
        'students' => 'Estudantes', 'graduates' => 'Diplomados', 'year' => 'Ano', 'duration_months' => 'Duração (meses)',
        'schedule' => 'Horário', 'curriculum' => 'Plano de estudos', 'seniority' => 'Experiência', 'template' => 'Modelo',
        'why' => 'Porquê', 'cv' => 'CV', 'notes' => 'Notas', 'data' => 'Dados', 'computed_at' => 'Calculado em', 'follow' => 'Onde seguir',
        'provider' => 'Quem oferece', 'languages' => 'Línguas', 'hours' => 'Horas', 'certificate' => 'Certificado',
        'credential' => 'Credencial', 'price_usd' => 'Preço (USD)', 'ownership' => 'Gestão', 'min_age' => 'Idade mínima',
        'max_age' => 'Idade máxima', 'phone' => 'Telefone', 'email' => 'Email', 'address' => 'Morada', 'maps_url' => 'Mapa',
        'recognized_by' => 'Reconhecido por', 'example' => 'Exemplo (inventado)', 'audience' => 'Para quem', 'paid' => 'Pago',
        'deadline' => 'Prazo', 'recurring' => 'Repete-se todos os anos', 'goal' => 'O que se avalia', 'model' => 'Resposta modelo',
        'mistakes' => 'Erros comuns', 'external_id' => 'Identificador externo', 'date' => 'Data', 'openings' => 'Vagas abertas',
        'career' => 'Carreira', 'lang' => 'Língua', 'icon' => 'Ícone', 'tone' => 'Tom', 'goals' => 'Objetivos', 'credits' => 'Créditos',
        'announced' => 'Anunciado (Em breve)', 'prompt' => 'Pergunta', 'course' => 'Kurso', 'question_id' => 'Pergunta',
        'answered' => 'Respondidas', 'correct' => 'Certas', 'number' => 'Número', 'outline' => 'Lições', 'content' => 'Conteúdo',
        'bio' => 'Apresentação', 'availability' => 'Disponibilidade', 'to' => 'Abre a página', 'starts_on' => 'Começa',
        'ends_on' => 'Acaba', 'time' => 'Hora', 'venue' => 'Sala ou recinto', 'city' => 'Cidade', 'formats' => 'Formatos', 'free' => 'Grátis',
        'price' => 'Preço', 'organizer' => 'Organizador', 'register' => 'Inscrição', 'unconfirmed' => 'Por confirmar', 'steps' => 'Passos',
        'total_cost_min' => 'Custo total: mínimo (Kz)', 'total_cost_max' => 'Custo total: máximo (Kz)', 'total_cost' => 'Custo total (Kz)',
        'recognized' => 'Reconhecido', 'rating_average' => 'Avaliação média', 'rating_count' => 'Avaliações', 'destination' => 'Destino',
        'covers' => 'O que cobre', 'minutes' => 'Minutos', 'moments' => 'Momentos', 'asks' => 'Perguntas', 'next_steps' => 'Próximos passos',
        'path' => 'Percurso', 'tip' => 'Dica', 'years' => 'Anos de experiência', 'monthly_aoa' => 'Propina mensal (Kz)', 'basis' => 'Base',
        'platform' => 'Plataforma', 'duration_seconds' => 'Duração (segundos)', 'thumbnail' => 'Miniatura', 'recorded_at' => 'Gravado em',
        'updated_at' => 'Atualizado', 'created_at' => 'Criado',
    ];

    public static function column(string $name): string
    {
        return self::LABELS[$name] ?? Str::ucfirst(str_replace('_', ' ', $name));
    }

    /** What a row is called: its name or title (in Portuguese), else its slug. */
    public static function of(Model $record): string
    {
        foreach (self::TITLES as $column) {
            $value = method_exists($record, 'getTranslation') && property_exists($record, 'translatable') && in_array($column, (array) $record->translatable, true)
                ? $record->getTranslation($column, 'pt', false)
                : $record->getAttribute($column);
            if (is_string($value) && trim($value) !== '') {
                return Str::limit(trim($value), 80);
            }
        }
        $slug = $record->getAttribute('slug');
        $key = $record->getKey();

        return is_string($slug) ? $slug : '#'.(is_scalar($key) ? (string) $key : '');
    }

    /**
     * The column a list shows as the row's name.
     *
     * @param  class-string<Model>  $class
     */
    public static function titleColumn(string $class): string
    {
        foreach (self::TITLES as $column) {
            if (ContentColumns::has($class, $column)) {
                return $column;
            }
        }

        return ContentColumns::has($class, 'slug') ? 'slug' : 'id';
    }

    public static function status(BackedEnum|string|null $status): string
    {
        $value = $status instanceof BackedEnum ? $status->value : $status;

        return match ($value) {
            'draft' => 'Rascunho',
            'review' => 'Em revisão',
            'published' => 'Publicado',
            default => (string) $value,
        };
    }
}
