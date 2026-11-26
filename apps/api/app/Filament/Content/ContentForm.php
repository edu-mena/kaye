<?php

namespace App\Filament\Content;

use App\Models\Dataset;
use App\Support\ContentTypes;
use BackedEnum;
use Filament\Forms\Components\CodeEditor;
use Filament\Forms\Components\CodeEditor\Enums\Language;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Field;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Components\Component;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Components\Text;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOneOrMany;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

/**
 * The form of every catalogue table, built from its columns (ContentColumns): the content, one tab per language
 * (pt, en, fr), the lists in JSON, the images with their origin and the publication (status, source, estimated).
 * The rules of `App\Support\ContentTypes` apply to the types the AI also writes, so the panel and the AI never
 * disagree on what is valid (ADR 0027).
 */
final class ContentForm
{
    public const LOCALES = ['pt' => 'Português', 'en' => 'English', 'fr' => 'Français'];

    public const STATUSES = ['draft' => 'Rascunho', 'review' => 'Em revisão', 'published' => 'Publicado'];

    /** Where uploaded images go (served at /storage, ADR 0027). */
    public const DISK = 'public';

    /** Short texts: one line. */
    private const ONE_LINE = ['name', 'title', 'course_name', 'role', 'subtitle', 'provider', 'venue', 'city'];

    /**
     * Columns whose values are a fixed list the app knows (it has a label for each): chosen among the values in use,
     * so a new spelling never reaches the app. A table without values yet gets a text field.
     */
    private const CHOICES = [
        'kind', 'type', 'level', 'sector', 'ownership', 'basis', 'platform', 'availability', 'seniority', 'template',
        'destination', 'certificate', 'subject', 'topic', 'demand', 'salary_kind', 'lang', 'tone', 'area', 'dimension',
        'context', 'credential', 'province',
    ];

    /**
     * The upload fields' keys in the form state: never columns.
     */
    private const IMAGE_KEYS = ['uploads', 'origins', 'credits', 'licenses', 'alts', 'removes'];

    /** @var array<string, array<string, list<mixed>>> */
    private static array $typeRules = [];

    /**
     * @param  class-string<Model>  $model
     */
    public static function configure(Schema $schema, string $model): Schema
    {
        $columns = ContentColumns::of($model);
        $type = ContentTypes::ofModel($model);
        $parentKey = self::parentKey($schema);
        $table = (new $model)->getTable();

        $content = $data = $images = [];
        $translations = array_fill_keys(array_keys(self::LOCALES), []);
        foreach ($columns as $column) {
            if ($column->name === $parentKey || in_array($column->name, ContentColumns::COMMON, true)) {
                continue;
            }
            if ($column->kind === Column::TRANSLATABLE) {
                foreach (array_keys(self::LOCALES) as $locale) {
                    $translations[$locale][] = self::translated($column, $locale, $type);
                }
            } elseif ($column->kind === Column::JSON) {
                $data[] = self::json($column);
            } elseif ($column->isImage()) {
                $images[] = self::image($column, $table);
            } else {
                $content[] = self::field($column, $model, $type);
            }
        }

        $tabs = [];
        if ($content !== []) {
            $tabs[] = Tab::make('Conteúdo')->schema($content)->columns(2);
        }
        foreach (self::LOCALES as $locale => $name) {
            if ($translations[$locale] !== []) {
                $tabs[] = Tab::make($name)->schema([
                    ...($locale === 'pt' ? [] : [Text::make('Vazio: a app mostra o português. A IA pode propor a tradução ("Pesquisar com IA").')]),
                    ...$translations[$locale],
                ]);
            }
        }
        if ($data !== []) {
            $tabs[] = Tab::make('Listas e dados')->schema([Text::make('Em JSON, tal como a app os lê. Uma vírgula a mais e o registo não grava.'), ...$data]);
        }
        if ($images !== []) {
            $tabs[] = Tab::make('Imagens')->schema($images);
        }
        $publication = self::publication($model);
        if ($publication !== []) {
            $tabs[] = Tab::make('Publicação')->schema($publication)->columns(2);
        }

        return $schema->components([Tabs::make('Registo')->tabs($tabs)->columnSpanFull()]);
    }

    /**
     * A form's state as the columns it names (a form's keys are always the fields' names).
     *
     * @param  array<array-key, mixed>  $data
     * @return array<string, mixed>
     */
    public static function state(array $data): array
    {
        return array_filter($data, 'is_string', ARRAY_FILTER_USE_KEY);
    }

    /**
     * The values the form shows: every language of a translated column, JSON as text.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public static function fill(Model $record, array $data): array
    {
        foreach (ContentColumns::of($record::class) as $column) {
            if ($column->kind === Column::TRANSLATABLE && method_exists($record, 'getTranslations')) {
                $translations = $record->getTranslations($column->name);
                $data[$column->name] = array_map(
                    fn (mixed $value): mixed => is_array($value) ? self::encode($value) : $value,
                    is_array($translations) ? $translations : [],
                );
            } elseif ($column->kind === Column::JSON) {
                $value = $record->getAttribute($column->name);
                $data[$column->name] = $value === null ? null : self::encode($value);
            } elseif ($column->kind === Column::PHOTO) {
                unset($data[$column->name]);
            }
        }

        return $data;
    }

    /**
     * The row's values from what the form sends: translations without the empty languages, JSON decoded and the
     * uploaded images in place, with their origin in the row's sources.
     *
     * @param  class-string<Model>  $model
     * @param  array<string, mixed>  $data
     * @return array{array<string, mixed>, string|null} the values, and the origin of a new image (for the history)
     */
    public static function save(string $model, array $data, ?Model $record): array
    {
        $images = [];
        foreach (self::IMAGE_KEYS as $key) {
            $images[$key] = is_array($data[$key] ?? null) ? $data[$key] : [];
            unset($data[$key]);
        }

        $origin = null;
        foreach (ContentColumns::of($model) as $column) {
            $name = $column->name;
            if ($column->kind === Column::TRANSLATABLE && array_key_exists($name, $data)) {
                $data[$name] = self::translations($data[$name], $column);
            } elseif (! $column->isImage() && $column->kind !== Column::JSON && $column->keepsValue() && array_key_exists($name, $data) && $data[$name] === null) {
                // A column that cannot be empty keeps its value (or gets its default) instead of breaking the save.
                unset($data[$name]);
            } elseif ($column->kind === Column::JSON && array_key_exists($name, $data)) {
                $data[$name] = self::decode($data[$name], $column);
            } elseif ($column->isImage()) {
                $upload = self::uploaded($images['uploads'][$name] ?? null);
                if ($upload !== null) {
                    $origin = self::string($images['origins'][$name] ?? null) ?? '';
                    $data[$name] = self::imageValue($column, $upload, $origin, $images, $name);
                    $data = self::withSource($model, $data, $record, $origin);
                } elseif (($images['removes'][$name] ?? false) === true && $column->nullable) {
                    $data[$name] = null;
                }
            }
        }

        return [$data, $origin];
    }

    /** The foreign key of the owner, when the form is inside one of its relation managers (it is implied). */
    private static function parentKey(Schema $schema): ?string
    {
        $livewire = $schema->getLivewire();
        if (! $livewire instanceof RelationManager) {
            return null;
        }
        $relation = $livewire->getRelationship();

        return $relation instanceof HasOneOrMany ? $relation->getForeignKeyName() : null;
    }

    /**
     * @param  class-string<Model>  $model
     */
    private static function field(Column $column, string $model, ?string $type): Field
    {
        $name = $column->name;
        $field = match ($column->kind) {
            // An empty yes/no ("pago?") means "we do not know": a toggle could only say no.
            Column::BOOLEAN => $column->nullable ? Select::make($name)->boolean('Sim', 'Não', 'Não se sabe') : Toggle::make($name),
            Column::DATE => DatePicker::make($name),
            Column::DATETIME => DateTimePicker::make($name),
            Column::INTEGER => TextInput::make($name)->integer()->minValue($column->unsigned ? 0 : null),
            Column::DECIMAL => TextInput::make($name)->numeric(),
            Column::BELONGS_TO => Select::make($name)
                ->relationship((string) $column->relation, 'slug')
                ->getOptionLabelFromRecordUsing(fn (Model $record): string => ContentLabels::of($record).' ('.self::slugOf($record).')')
                ->searchable(),
            Column::STRING => self::text($column, $model, $type),
            default => Textarea::make($name)->rows(3)->autosize()->maxLength(65535),
        };
        $field->label(ContentLabels::column($name))->required($column->required());
        if ($column->default !== null) {
            $field->default($column->kind === Column::BOOLEAN ? $column->default === '1' : $column->default);
        }
        if ($field instanceof TextInput && $column->kind === Column::STRING) {
            $field->maxLength($column->length ?? 191);
        }

        return self::withTypeRules($field, $type, $name);
    }

    /**
     * @param  class-string<Model>  $model
     */
    private static function text(Column $column, string $model, ?string $type): Field
    {
        $name = $column->name;
        $typed = $type !== null && (ContentTypes::fields($type)[$name] ?? null) === 'choice';
        if ($typed || in_array($name, self::CHOICES, true)) {
            $values = $type !== null && $typed ? ContentTypes::choices($type, $name) : self::valuesInUse($model, $name);
            if ($values !== []) {
                return Select::make($name)->options(array_combine($values, $values))->searchable();
            }
        }
        $input = TextInput::make($name);
        if (in_array($name, ['url', 'website', 'maps_url'], true) || str_ends_with($name, '_url')) {
            $input->url();
        }

        return $name === 'email' ? $input->email() : $input;
    }

    private static function translated(Column $column, string $locale, ?string $type): Field
    {
        $path = "{$column->name}.{$locale}";
        $field = in_array($column->name, self::ONE_LINE, true)
            ? TextInput::make($path)->maxLength(255)
            : Textarea::make($path)->rows(4)->autosize()->maxLength(65535)
                ->helperText(fn (?Model $record): ?string => self::isList($record, $column->name)
                    ? 'Uma lista: em JSON, tal como está no português.' : null);

        $field->label(ContentLabels::column($column->name))->required($locale === 'pt' && $column->required());

        return self::withTypeRules($field, $type, $path);
    }

    private static function json(Column $column): Field
    {
        return CodeEditor::make($column->name)
            ->label(ContentLabels::column($column->name))
            ->language(Language::Json)
            ->required($column->required())
            ->default($column->nullable ? null : '[]')
            ->rules(['json']);
    }

    private static function image(Column $column, string $table): Component
    {
        $name = $column->name;

        return Section::make(ContentLabels::column($name))
            ->columns(2)
            ->schema([
                Text::make(function (?Model $record) use ($name): string {
                    $value = $record?->getAttribute($name);
                    $url = is_array($value) ? ($value['large'] ?? $value['small'] ?? null) : $value;

                    return is_string($url) && $url !== '' ? 'Agora: '.(str_starts_with($url, 'data:') ? 'logótipo embutido' : $url) : 'Sem imagem.';
                })->columnSpanFull(),
                FileUpload::make("uploads.{$name}")
                    ->label('Carregar nova')
                    ->image()
                    ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                    ->maxSize(3072)
                    ->disk(self::DISK)
                    ->directory("catalogue/{$table}")
                    ->visibility('public')
                    ->columnSpanFull(),
                TextInput::make("origins.{$name}")
                    ->label('Origem da imagem')
                    ->helperText('Obrigatória: a página de onde vem (site oficial, Wikimedia Commons…). Fica nas fontes do registo.')
                    ->url()
                    ->maxLength(2048)
                    ->required(fn (Get $get): bool => filled($get("uploads.{$name}"))),
                TextInput::make("credits.{$name}")->label('Autor ou dono')->maxLength(191),
                ...($column->kind === Column::PHOTO ? [
                    TextInput::make("licenses.{$name}")->label('Licença')->maxLength(64)->placeholder('CC BY-SA 4.0'),
                    TextInput::make("alts.{$name}")->label('O que se vê (texto alternativo)')->maxLength(255),
                ] : []),
                ...($column->nullable ? [Toggle::make("removes.{$name}")->label('Tirar a imagem')] : []),
            ]);
    }

    /**
     * @param  class-string<Model>  $model
     * @return list<Field>
     */
    private static function publication(string $model): array
    {
        $fields = [];
        if (ContentColumns::has($model, 'slug')) {
            $slug = TextInput::make('slug')
                ->label(ContentLabels::column('slug'))
                ->helperText('Aparece no endereço da app. Não muda depois de criado: o importador e as ligações usam-no.')
                ->required()
                ->maxLength(191)
                ->regex('/^[a-z0-9][a-z0-9_-]*$/')
                ->disabledOn('edit');
            $fields[] = ContentColumns::uniqueSlug($model) ? $slug->unique(ignoreRecord: true) : $slug;
        }
        if (ContentColumns::has($model, 'status')) {
            $fields[] = Select::make('status')
                ->label(ContentLabels::column('status'))
                ->options(self::STATUSES)
                ->default('draft')
                ->required()
                ->helperText('A app só mostra o que está publicado. Publica quem revê.')
                ->disabled(fn (): bool => ! (Auth::user()?->can('publish', new $model) ?? false));
        }
        if (ContentColumns::has($model, 'source_url')) {
            $fields[] = TextInput::make('source_url')->label(ContentLabels::column('source_url'))->url()->maxLength(2048);
        }
        if (ContentColumns::has($model, 'source_checked_at')) {
            $fields[] = DatePicker::make('source_checked_at')->label(ContentLabels::column('source_checked_at'));
        }
        if (ContentColumns::has($model, 'estimated')) {
            $fields[] = Toggle::make('estimated')->label('Estimado: a app diz que é uma estimativa');
        }
        if (ContentColumns::has($model, 'position')) {
            $fields[] = TextInput::make('position')->label(ContentLabels::column('position'))->integer()->minValue(0)->default(0);
        }

        return $fields;
    }

    /** Adds the rules of ContentTypes to a field of a type the AI writes. */
    private static function withTypeRules(Field $field, ?string $type, string $path): Field
    {
        if ($type === null) {
            return $field;
        }

        return $field->rules(fn (string $operation): array => self::typeRules($type, $operation === 'create')[$path] ?? []);
    }

    /**
     * @return array<string, list<mixed>>
     */
    private static function typeRules(string $type, bool $creating): array
    {
        $key = $type.($creating ? ':create' : ':edit');

        return self::$typeRules[$key] ??= ContentTypes::rules($type, array_keys(ContentTypes::fields($type)), $creating);
    }

    /**
     * @param  class-string<Model>  $model
     * @return list<string>
     */
    private static function valuesInUse(string $model, string $column): array
    {
        /** @var list<string> $values */
        $values = $model::query()->withoutGlobalScopes()->whereNotNull($column)->where($column, '!=', '')
            ->distinct()->orderBy($column)->limit(200)->pluck($column)
            ->map(fn (mixed $value): string => $value instanceof BackedEnum ? (string) $value->value : (is_scalar($value) ? (string) $value : ''))
            ->filter()->values()->all();

        if ($column === 'province') {
            $provinces = Dataset::query()->where('slug', 'provinces')->value('data');
            $values = array_values(array_unique([...$values, ...self::strings(is_string($provinces) ? json_decode($provinces, true) : $provinces)]));
            sort($values);
        }

        return $values;
    }

    private static function isList(?Model $record, string $column): bool
    {
        if ($record === null || ! method_exists($record, 'getTranslation')) {
            return false;
        }

        return is_array($record->getTranslation($column, 'pt', false));
    }

    /**
     * A translated column from its languages: an empty language is dropped (the app falls back to Portuguese), a
     * list arrives as JSON text.
     *
     * @return array<string, mixed>|null
     */
    private static function translations(mixed $value, Column $column): ?array
    {
        $translations = [];
        foreach (is_array($value) ? $value : [] as $locale => $text) {
            if (! is_string($locale) || ! isset(self::LOCALES[$locale])) {
                continue;
            }
            if (is_array($text)) {
                $translations[$locale] = $text;
            } elseif (is_string($text) && trim($text) !== '') {
                $trimmed = trim($text);
                $decoded = str_starts_with($trimmed, '[') || str_starts_with($trimmed, '{') ? json_decode($trimmed, true) : null;
                $translations[$locale] = is_array($decoded) ? $decoded : $trimmed;
            }
        }

        return $translations === [] && $column->nullable ? null : $translations;
    }

    /**
     * @return array<array-key, mixed>|null
     */
    private static function decode(mixed $value, Column $column): ?array
    {
        $decoded = is_string($value) && trim($value) !== '' ? json_decode($value, true) : (is_array($value) ? $value : null);

        return is_array($decoded) ? $decoded : ($column->nullable ? null : []);
    }

    /**
     * The value of an image column for an uploaded file: its URL, or the photo with its sizes and credit.
     *
     * @param  array<string, array<array-key, mixed>>  $images
     * @return string|array<string, mixed>
     */
    private static function imageValue(Column $column, string $path, string $origin, array $images, string $name): string|array
    {
        $url = Storage::disk(self::DISK)->url($path);
        if ($column->kind === Column::IMAGE) {
            return $url;
        }

        return [
            'thumb' => $url,
            'small' => $url,
            'large' => $url,
            'alt' => self::string($images['alts'][$name] ?? null) ?? '',
            'credit' => [
                'author' => self::string($images['credits'][$name] ?? null) ?? '',
                'license' => self::string($images['licenses'][$name] ?? null) ?? '',
                'url' => $origin,
            ],
        ];
    }

    /**
     * The origin of a new image joins the row's sources, once.
     *
     * @param  class-string<Model>  $model
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private static function withSource(string $model, array $data, ?Model $record, string $origin): array
    {
        if ($origin === '' || ! ContentColumns::has($model, 'sources')) {
            return $data;
        }
        $sources = $data['sources'] ?? $record?->getAttribute('sources') ?? [];
        $sources = is_array($sources) ? array_values($sources) : [];
        $urls = array_map(fn (mixed $source): mixed => is_array($source) ? ($source['url'] ?? null) : null, $sources);
        if (! in_array($origin, $urls, true)) {
            $sources[] = ['label' => 'Imagem: '.parse_url($origin, PHP_URL_HOST), 'url' => $origin];
        }
        $data['sources'] = $sources;

        return $data;
    }

    private static function uploaded(mixed $value): ?string
    {
        if (is_array($value)) {
            $value = reset($value);
        }

        return is_string($value) && $value !== '' ? $value : null;
    }

    private static function slugOf(Model $record): string
    {
        $slug = $record->getAttribute('slug');

        return is_string($slug) ? $slug : '';
    }

    private static function string(mixed $value): ?string
    {
        return is_string($value) && trim($value) !== '' ? trim($value) : null;
    }

    /**
     * @return list<string>
     */
    private static function strings(mixed $value): array
    {
        return array_values(array_filter(is_array($value) ? $value : [], 'is_string'));
    }

    private static function encode(mixed $value): string
    {
        return (string) json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
}
