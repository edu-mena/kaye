<?php

namespace App\Support;

use App\Models\Career;
use App\Models\Company;
use App\Models\FreeCourse;
use App\Models\Institution;
use App\Models\Internship;
use App\Models\Scholarship;
use App\Models\SupportProgram;
use BackedEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Rule;

/**
 * The catalogue types the AI and the panel can change, and the rules of each field: the only place for them
 * (docs/ia.md). The MCP tools, the queued research and the panel's forms all validate here.
 *
 * Field kinds: `text:N` (up to N characters), `translated:N` (`{"pt": …, "en": …, "fr": …}`, pt required), `url`,
 * `email`, `phone`, `integer:MIN:MAX`, `number`, `boolean`, `date`, `choice` (one of the values the column already
 * has, so a new spelling never sneaks in), `image` (only through attach_image).
 */
final class ContentTypes
{
    /**
     * `create`: the fields a new row needs (null: the AI cannot create this type). `defaults`: the values a new row
     * starts with, for the columns that cannot be empty.
     *
     * @var array<string, array{model: class-string<Model>, label: string, fields: array<string, string>, create: list<string>|null, defaults: array<string, mixed>, important: list<string>}>
     */
    private const TYPES = [
        'institution' => [
            'model' => Institution::class,
            'label' => 'Instituição de ensino',
            'fields' => [
                'name' => 'text:191', 'type' => 'choice', 'ownership' => 'choice', 'province' => 'text:64', 'place' => 'text:191',
                'summary' => 'translated:600', 'website' => 'url', 'phone' => 'phone', 'email' => 'email', 'address' => 'text:191',
                'maps_url' => 'url', 'min_age' => 'integer:10:40', 'logo' => 'image', 'banner' => 'image',
            ],
            'create' => ['name', 'type', 'province', 'place', 'summary'],
            'defaults' => ['sources' => []],
            'important' => ['website', 'phone', 'email', 'address', 'logo'],
        ],
        'company' => [
            'model' => Company::class,
            'label' => 'Empresa',
            'fields' => [
                'name' => 'text:191', 'sector' => 'choice', 'province' => 'text:64', 'place' => 'text:191',
                'summary' => 'translated:600', 'website' => 'url', 'logo' => 'image', 'banner' => 'image',
            ],
            'create' => ['name', 'sector', 'province', 'place', 'summary'],
            'defaults' => ['groups' => [], 'programs' => [], 'sources' => []],
            'important' => ['website', 'logo', 'banner'],
        ],
        'career' => [
            'model' => Career::class,
            'label' => 'Carreira',
            'fields' => [
                'summary' => 'translated:400', 'description' => 'translated:4000', 'demand' => 'choice', 'salary_median' => 'integer:0:100000000',
            ],
            // A new career belongs to a group and an area: an editorial decision, never the AI's.
            'create' => null,
            'defaults' => [],
            'important' => ['description', 'salary_median'],
        ],
        'scholarship' => [
            'model' => Scholarship::class,
            'label' => 'Bolsa de estudo',
            'fields' => [
                'name' => 'translated:191', 'provider' => 'text:191', 'kind' => 'choice', 'destination' => 'choice',
                'min_age' => 'integer:10:60', 'max_age' => 'integer:10:60', 'deadline' => 'date', 'recurring' => 'boolean', 'url' => 'url',
            ],
            'create' => ['name', 'provider', 'kind', 'destination', 'url'],
            'defaults' => ['levels' => [], 'areas' => [], 'covers' => [], 'requirements' => [], 'sources' => []],
            'important' => ['deadline', 'url'],
        ],
        'internship' => [
            'model' => Internship::class,
            'label' => 'Estágio',
            'fields' => [
                'name' => 'translated:191', 'provider' => 'text:191', 'kind' => 'choice', 'province' => 'text:64', 'paid' => 'boolean',
                'duration_months' => 'integer:1:36', 'deadline' => 'date', 'recurring' => 'boolean', 'url' => 'url',
            ],
            'create' => ['name', 'provider', 'kind', 'url'],
            'defaults' => ['areas' => [], 'audience' => [], 'requirements' => [], 'sources' => []],
            'important' => ['deadline', 'paid', 'duration_months'],
        ],
        'free_course' => [
            'model' => FreeCourse::class,
            'label' => 'Curso grátis online',
            'fields' => [
                'name' => 'text:191', 'provider' => 'text:191', 'level' => 'choice', 'hours' => 'number', 'certificate' => 'choice', 'url' => 'url',
            ],
            'create' => ['name', 'provider', 'level', 'url'],
            'defaults' => ['languages' => [], 'areas' => [], 'sources' => []],
            'important' => ['hours', 'certificate'],
        ],
        'support_program' => [
            'model' => SupportProgram::class,
            'label' => 'Apoio para trabalhar por conta própria',
            'fields' => [
                'name' => 'translated:191', 'provider' => 'text:191', 'kind' => 'choice', 'min_age' => 'integer:10:60', 'url' => 'url',
            ],
            'create' => ['name', 'provider', 'kind', 'url'],
            'defaults' => ['audience' => [], 'sources' => []],
            'important' => ['min_age'],
        ],
    ];

    /** Every type may also say whether its values are estimated. */
    private const COMMON = ['estimated' => 'boolean'];

    /**
     * @return list<string>
     */
    public static function keys(): array
    {
        return array_keys(self::TYPES);
    }

    public static function exists(string $type): bool
    {
        return isset(self::TYPES[$type]);
    }

    /**
     * @return class-string<Model>
     */
    public static function model(string $type): string
    {
        return self::TYPES[$type]['model'];
    }

    public static function label(string $type): string
    {
        return self::TYPES[$type]['label'];
    }

    /** The type of a model class, if it has one. */
    public static function ofModel(string $class): ?string
    {
        foreach (self::TYPES as $key => $type) {
            if ($type['model'] === $class || (new $type['model'])->getMorphClass() === $class) {
                return $key;
            }
        }

        return null;
    }

    /**
     * Column => kind.
     *
     * @return array<string, string>
     */
    public static function fields(string $type): array
    {
        return self::TYPES[$type]['fields'] + self::COMMON;
    }

    /**
     * @return list<string>
     */
    public static function imageFields(string $type): array
    {
        return array_keys(array_filter(self::fields($type), fn (string $kind): bool => $kind === 'image'));
    }

    /**
     * The fields a new row must have (besides the slug).
     *
     * @return list<string>
     */
    public static function requiredOnCreate(string $type): array
    {
        return self::TYPES[$type]['create'] ?? [];
    }

    public static function canCreate(string $type): bool
    {
        return self::TYPES[$type]['create'] !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public static function defaults(string $type): array
    {
        return self::TYPES[$type]['defaults'];
    }

    /**
     * The fields whose absence makes a row incomplete (list_missing).
     *
     * @return list<string>
     */
    public static function important(string $type): array
    {
        return self::TYPES[$type]['important'];
    }

    /**
     * The validation rules of the given fields (images excluded: they only come through attach_image).
     *
     * @param  list<string>  $fields
     * @return array<string, list<mixed>>
     */
    public static function rules(string $type, array $fields, bool $creating): array
    {
        $kinds = self::fields($type);
        $rules = [];
        foreach ($fields as $field) {
            $kind = $kinds[$field] ?? null;
            if ($kind === null || $kind === 'image') {
                continue;
            }
            $required = $creating && in_array($field, self::requiredOnCreate($type), true);
            $presence = $required ? 'required' : 'nullable';
            [$name, $first, $second] = array_pad(explode(':', $kind), 3, null);

            if ($name === 'translated') {
                $rules[$field] = [$required ? 'required' : 'nullable', 'array:pt,en,fr'];
                $rules["{$field}.pt"] = ['required_with:'.$field, 'string', 'max:'.(int) $first];
                $rules["{$field}.en"] = ['nullable', 'string', 'max:'.(int) $first];
                $rules["{$field}.fr"] = ['nullable', 'string', 'max:'.(int) $first];

                continue;
            }

            $rules[$field] = match ($name) {
                'text' => [$presence, 'string', 'max:'.(int) $first],
                'url' => [$presence, 'string', 'max:2048', 'url:https,http'],
                'email' => [$presence, 'string', 'max:191', 'email:rfc'],
                'phone' => [$presence, 'string', 'max:40', 'regex:/^\+?[0-9 ()\/.-]{7,40}$/'],
                'integer' => [$presence, 'integer', 'min:'.(int) $first, 'max:'.(int) $second],
                'number' => [$presence, 'numeric', 'min:0', 'max:100000'],
                'boolean' => [$presence, 'boolean'],
                'date' => [$presence, 'date_format:Y-m-d'],
                'choice' => [$presence, 'string', Rule::in(self::choices($type, $field))],
                default => [$presence],
            };
        }

        return $rules;
    }

    /**
     * The values a choice column already has.
     *
     * @return list<string>
     */
    public static function choices(string $type, string $field): array
    {
        $model = self::model($type);

        /** @var list<string> $values */
        $values = $model::query()->withoutGlobalScopes()->whereNotNull($field)->distinct()->orderBy($field)->pluck($field)
            ->map(fn (mixed $value): string => $value instanceof BackedEnum ? (string) $value->value : (is_scalar($value) ? (string) $value : ''))
            ->filter()->values()->all();

        return $values;
    }
}
