<?php

namespace App\Support;

use App\Enums\RevisionStatus;
use App\Models\Revision;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\Config;

/**
 * What the team saves in the panel (ADR 0028) is kept as an `edited` revision: the row's history shows it next to
 * the proposals of the AI, and `kaye:import` no longer writes those columns or links. The frontend's export still
 * has the old values and would undo the edit on the next deploy.
 */
final class PanelEdits
{
    /** Columns that are bookkeeping, not content. */
    private const IGNORED = ['id', 'created_at', 'updated_at', 'deleted_at'];

    public function __construct(private readonly ContentEditor $editor) {}

    /**
     * The values before the save of every column about to change (call it before saving).
     *
     * @return array<string, mixed>
     */
    public function before(Model $record): array
    {
        $original = (clone $record)->setRawAttributes($record->getRawOriginal(), true);
        $before = [];
        foreach (array_diff(array_keys($record->getDirty()), self::IGNORED) as $column) {
            $before[$column] = $record->exists ? $this->editor->value($original, $column) : null;
        }

        return $before;
    }

    /**
     * Keeps a saved change. `$before` is what before() returned; nothing is kept when nothing changed.
     *
     * @param  array<string, mixed>  $before
     */
    public function record(Model $record, array $before, User $author, ?string $sourceUrl = null): ?Revision
    {
        $changes = [];
        foreach (array_keys($before) as $column) {
            $after = $this->editor->value($record, $column);
            if ($record->wasRecentlyCreated || $after !== $before[$column]) {
                $changes[$column] = $after;
            }
        }
        if ($changes === []) {
            return null;
        }

        return $this->keep($record, $changes, $record->wasRecentlyCreated ? null : array_intersect_key($before, $changes), $author, $sourceUrl);
    }

    /**
     * Keeps a change to a link table (the careers of a company, the skills of a career): the whole list after it,
     * by slug.
     */
    public function relation(Model $owner, string $relation, User $author): Revision
    {
        $links = $owner->{$relation}();
        $slugs = [];
        foreach ($links instanceof Relation ? $links->get() : [] as $model) {
            $slugs[] = self::slugOf($model);
        }

        return $this->keep($owner, [$relation => $slugs], null, $author, null);
    }

    /** A row's slug, or its number for the tables without one (fees, events, job posts). */
    private static function slugOf(mixed $record): string
    {
        $slug = $record instanceof Model ? $record->getAttribute('slug') : null;
        $key = $record instanceof Model ? $record->getKey() : null;

        return is_string($slug) ? $slug : (is_int($key) || is_string($key) ? (string) $key : '');
    }

    /** The type a revision of this model is filed under: the AI's type when it has one, else the table. */
    public static function type(Model $record): string
    {
        return ContentTypes::ofModel($record::class) ?? $record->getTable();
    }

    /**
     * @param  array<string, mixed>  $changes
     * @param  array<string, mixed>|null  $original
     */
    private function keep(Model $record, array $changes, ?array $original, User $author, ?string $sourceUrl): Revision
    {
        $ownSource = $record->getAttribute('source_url');

        return Revision::query()->create([
            'content_type' => self::type($record),
            'revisable_type' => $record->getMorphClass(),
            'revisable_id' => $record->getKey(),
            'slug' => self::slugOf($record),
            'author_id' => $author->id,
            'changes' => $changes,
            'original' => $original,
            // A change in the panel has no proposal behind it: its source is the row's own, or the panel.
            'source_url' => $sourceUrl ?? (is_string($ownSource) && $ownSource !== '' ? $ownSource : Config::string('app.url').'/admin'),
            'status' => RevisionStatus::Edited,
            'reviewed_by' => $author->id,
            'reviewed_at' => now(),
        ]);
    }
}
