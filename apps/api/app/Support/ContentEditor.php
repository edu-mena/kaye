<?php

namespace App\Support;

use App\Enums\RevisionStatus;
use App\Models\AiTask;
use App\Models\Revision;
use App\Models\User;
use BackedEnum;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;
use Spatie\Translatable\HasTranslations;

/**
 * What the AI (through MCP or the queued research) and the panel do to the catalogue: search, read, find what is
 * missing, list the sources, and propose a change. Proposing never writes the row: it writes a pending revision,
 * with its source, that a reviewer approves or rejects (`Revisions`). docs/ia.md.
 */
final class ContentEditor
{
    private const SEARCH_LIMIT = 20;

    private const MISSING_LIMIT = 50;

    /**
     * @return list<array{slug: string, name: string, status: string, estimated: bool}>
     */
    public function search(string $type, string $text): array
    {
        $model = $this->model($type);
        $words = trim($text);

        return array_values($model::query()
            ->when($words !== '', fn ($query) => $query->where(fn ($query) => $query
                ->where('slug', 'like', '%'.$words.'%')->orWhere('name', 'like', '%'.$words.'%')))
            ->orderBy('slug')->limit(self::SEARCH_LIMIT)->get()
            ->map(fn (Model $record): array => $this->summary($record))->all());
    }

    /**
     * Every field the AI may change, with its value, plus the row's status, sources and pending proposals.
     *
     * @return array<string, mixed>
     */
    public function get(string $type, string $slug): array
    {
        $record = $this->find($type, $slug);
        $fields = [];
        foreach (ContentTypes::fields($type) as $field => $kind) {
            $fields[$field] = $kind === 'image' ? ($this->isEmpty($record, $field) ? null : '(imagem definida)') : $this->value($record, $field);
        }

        return [
            'type' => $type,
            'slug' => $slug,
            'status' => $this->status($record),
            'fields' => $fields,
            'source_url' => $record->getAttribute('source_url'),
            'sources' => $record->getAttribute('sources'),
            'pending_revisions' => Revision::query()->of($record)->pending()->get(['id', 'changes', 'source_url', 'created_at'])
                ->map(fn (Revision $revision): array => ['id' => $revision->id, 'fields' => array_keys($revision->changes), 'source_url' => $revision->source_url])
                ->all(),
        ];
    }

    /**
     * Rows with an important field empty, or marked as estimated: where research helps most.
     *
     * @return list<array{slug: string, name: string, missing: list<string>, estimated: bool}>
     */
    public function missing(string $type, int $limit = self::MISSING_LIMIT): array
    {
        $model = $this->model($type);
        $rows = [];
        foreach ($model::query()->orderBy('position')->orderBy('id')->lazy() as $record) {
            $missing = array_values(array_filter(ContentTypes::important($type), fn (string $field): bool => $this->isEmpty($record, $field)));
            $estimated = (bool) $record->getAttribute('estimated');
            if ($missing === [] && ! $estimated) {
                continue;
            }
            $rows[] = ['slug' => $this->slug($record), 'name' => $this->name($record), 'missing' => $missing, 'estimated' => $estimated];
            if (count($rows) >= min($limit, self::MISSING_LIMIT)) {
                break;
            }
        }

        return $rows;
    }

    /**
     * The sources the catalogue already uses for a type (or one row), the most used first: a place to start.
     *
     * @return list<array{url: string, uses: int}>
     */
    public function sources(string $type, ?string $slug = null): array
    {
        $model = $this->model($type);
        $records = $slug === null ? $model::query()->lazy() : [$this->find($type, $slug)];
        $counts = [];
        foreach ($records as $record) {
            $urls = [$record->getAttribute('source_url')];
            $sources = $record->getAttribute('sources');
            foreach (is_array($sources) ? $sources : [] as $source) {
                $urls[] = is_array($source) ? ($source['url'] ?? null) : null;
            }
            foreach (array_unique(array_filter($urls, is_string(...))) as $url) {
                $counts[$url] = ($counts[$url] ?? 0) + 1;
            }
        }
        arsort($counts);

        return array_map(fn (string $url, int $uses): array => ['url' => $url, 'uses' => $uses], array_keys(array_slice($counts, 0, 50, true)), array_slice($counts, 0, 50));
    }

    /**
     * A pending revision with the changes that are valid and different from the row. A new row needs `slug` and
     * the type's required fields. Never touches the row itself.
     *
     * @param  array<string, mixed>  $changes
     *
     * @throws InvalidProposal
     */
    public function propose(string $type, ?string $slug, array $changes, string $sourceUrl, ?string $note, ?User $author, ?AiTask $task = null): Revision
    {
        $this->model($type);
        $problems = [];
        if (! self::isSource($sourceUrl)) {
            $problems[] = 'source_url is required: the public page (http or https) where each value can be checked.';
        }

        $creating = $slug === null || $slug === '';
        $record = null;
        if ($creating && ! ContentTypes::canCreate($type)) {
            throw new InvalidProposal(["A new {$type} is created by the team, not proposed: propose changes to an existing one."]);
        }
        if ($creating) {
            $newSlug = $changes['slug'] ?? null;
            unset($changes['slug']);
            $slug = is_string($newSlug) ? $newSlug : '';
            $class = ContentTypes::model($type);
            if (preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug) !== 1 || strlen($slug) > 191) {
                $problems[] = 'A new row needs changes.slug: lowercase words joined by dashes (for example universidade-x-luanda).';
            } elseif ($class::query()->withoutGlobalScopes()->where('slug', $slug)->exists()) {
                // withoutGlobalScopes: a deleted row keeps its slug.
                $problems[] = "There is already a {$type} with the slug {$slug}: propose a change to it instead.";
            }
        } else {
            $record = $this->find($type, $slug);
        }

        $allowed = array_keys(array_filter(ContentTypes::fields($type), fn (string $kind): bool => $kind !== 'image'));
        $unknown = array_diff(array_keys($changes), $allowed);
        if ($unknown !== []) {
            $problems[] = 'These fields cannot be changed here: '.implode(', ', $unknown).'. Allowed: '.implode(', ', $allowed).' (images: attach_image).';
        }
        $missing = $creating ? array_diff(ContentTypes::requiredOnCreate($type), array_keys($changes)) : [];
        if ($missing !== []) {
            $problems[] = 'A new row also needs: '.implode(', ', $missing).'.';
        }
        if ($problems !== []) {
            throw new InvalidProposal($problems);
        }

        $this->validate($changes, ContentTypes::rules($type, array_keys($changes), $creating));

        $original = [];
        if ($record !== null) {
            foreach (array_keys($changes) as $field) {
                $original[$field] = $this->value($record, $field);
            }
            $changes = array_filter($changes, fn (mixed $value, string $field): bool => $value !== $original[$field], ARRAY_FILTER_USE_BOTH);
            $original = array_intersect_key($original, $changes);
            if ($changes === []) {
                throw new InvalidProposal(['Nothing changes: every value is already the one in the catalogue.']);
            }
        }

        return Revision::query()->create([
            'content_type' => $type,
            'revisable_type' => (new (ContentTypes::model($type)))->getMorphClass(),
            'revisable_id' => $record?->getKey(),
            'slug' => $slug,
            'ai_task_id' => $task?->id,
            'author_id' => $author?->id,
            'changes' => $changes,
            'original' => $record === null ? null : $original,
            'source_url' => $sourceUrl,
            'note' => $note === null ? null : mb_substr(trim($note), 0, 2000),
            'status' => RevisionStatus::Pending,
        ]);
    }

    /**
     * An image for a row (logo, banner): downloaded and checked now (`RemoteImage`), kept privately, and only made
     * public when the revision is approved. `originUrl` is the page that shows the image and its licence or owner.
     *
     * @throws InvalidProposal
     */
    public function proposeImage(string $type, string $slug, string $field, string $imageUrl, string $originUrl, ?string $note, ?User $author, ?AiTask $task = null): Revision
    {
        $this->model($type);
        if (! in_array($field, ContentTypes::imageFields($type), true)) {
            throw new InvalidProposal(["A {$type} has no image field {$field}. Image fields: ".implode(', ', ContentTypes::imageFields($type)).'.']);
        }
        if (! self::isSource($originUrl)) {
            throw new InvalidProposal(['origin_url is required: the page where the image is published, with its owner or licence.']);
        }
        $record = $this->find($type, $slug);
        $path = app(RemoteImage::class)->fetch($imageUrl);

        return Revision::query()->create([
            'content_type' => $type,
            'revisable_type' => $record->getMorphClass(),
            'revisable_id' => $record->getKey(),
            'slug' => $slug,
            'ai_task_id' => $task?->id,
            'author_id' => $author?->id,
            'changes' => [$field => Revisions::IMAGE_PREFIX.$path],
            'original' => [$field => $this->isEmpty($record, $field) ? null : '(imagem definida)'],
            'source_url' => $originUrl,
            'note' => $note === null ? "Imagem de {$imageUrl}" : mb_substr(trim($note), 0, 2000),
            'status' => RevisionStatus::Pending,
        ]);
    }

    /**
     * @throws InvalidProposal
     */
    public function find(string $type, string $slug): Model
    {
        $record = $this->model($type)::query()->where('slug', $slug)->first();
        if (! $record instanceof Model) {
            throw new InvalidProposal(["There is no {$type} with the slug {$slug}. Use search_content to find it."]);
        }

        return $record;
    }

    /**
     * The framework's English messages (the AI's language; the app has no Portuguese validation texts), each with
     * its field.
     *
     * @param  array<string, mixed>  $values
     * @param  array<string, list<mixed>>  $rules
     *
     * @throws InvalidProposal
     */
    private function validate(array $values, array $rules): void
    {
        $translator = app('translator');
        $locale = $translator->getLocale();
        $translator->setLocale('en');
        try {
            $errors = Validator::make($values, $rules)->errors()->messages();
        } finally {
            $translator->setLocale($locale);
        }
        if ($errors !== []) {
            $problems = [];
            foreach ($errors as $field => $messages) {
                $problems[] = $field.': '.implode(' ', $messages);
            }
            throw new InvalidProposal($problems);
        }
    }

    public static function isSource(string $url): bool
    {
        return strlen($url) <= 2048 && filter_var($url, FILTER_VALIDATE_URL) !== false
            && in_array(parse_url($url, PHP_URL_SCHEME), ['http', 'https'], true);
    }

    /** A field's current value as the AI sees it: all the languages of a translated one. */
    public function value(Model $record, string $field): mixed
    {
        if ($this->isTranslatable($record, $field) && method_exists($record, 'getTranslations')) {
            $translations = $record->getTranslations($field);

            return $translations === [] ? null : $translations;
        }
        $value = $record->getAttribute($field);

        return match (true) {
            $value instanceof BackedEnum => $value->value,
            $value instanceof DateTimeInterface => $value->format('Y-m-d'),
            default => $value,
        };
    }

    public function isEmpty(Model $record, string $field): bool
    {
        $value = $this->value($record, $field);

        // A translated field counts as empty without its Portuguese text.
        return $value === null || $value === '' || $value === []
            || (is_array($value) && array_key_exists('pt', $value) && (! is_string($value['pt']) || trim($value['pt']) === ''));
    }

    /**
     * @return class-string<Model>
     *
     * @throws InvalidProposal
     */
    private function model(string $type): string
    {
        if (! ContentTypes::exists($type)) {
            throw new InvalidProposal(["Unknown type {$type}. Types: ".implode(', ', ContentTypes::keys()).'.']);
        }

        return ContentTypes::model($type);
    }

    /**
     * @return array{slug: string, name: string, status: string, estimated: bool}
     */
    private function summary(Model $record): array
    {
        return [
            'slug' => $this->slug($record),
            'name' => $this->name($record),
            'status' => $this->status($record),
            'estimated' => (bool) $record->getAttribute('estimated'),
        ];
    }

    private function name(Model $record): string
    {
        $name = $this->value($record, 'name');
        if (is_array($name)) {
            $name = $name['pt'] ?? reset($name);
        }

        return is_string($name) ? $name : $this->slug($record);
    }

    private function slug(Model $record): string
    {
        $slug = $record->getAttribute('slug');

        return is_string($slug) ? $slug : '';
    }

    private function status(Model $record): string
    {
        $status = $record->getAttribute('status');
        if ($status instanceof BackedEnum) {
            $status = $status->value;
        }

        return is_string($status) ? $status : '';
    }

    private function isTranslatable(Model $record, string $field): bool
    {
        return in_array(HasTranslations::class, class_uses_recursive($record), true)
            && property_exists($record, 'translatable') && in_array($field, (array) $record->translatable, true);
    }
}
