<?php

namespace App\Support;

use App\Enums\ContentStatus;
use App\Enums\RevisionStatus;
use App\Models\Revision;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * The review of a proposed change (docs/ia.md). Approving applies the values, adds the source, publishes the row
 * and keeps who and when; the activity log records the change itself. Rejecting keeps the reason. Only a person
 * with `content.publish` reviews, and never their own proposal.
 */
final class Revisions
{
    /** The value of an image change: the private file waiting for approval. */
    public const IMAGE_PREFIX = 'ai-image:';

    public function __construct(private readonly ContentEditor $editor) {}

    /**
     * @throws InvalidProposal
     */
    public function approve(Revision $revision, User $reviewer): Model
    {
        $this->guard($revision, $reviewer);

        return DB::transaction(function () use ($revision, $reviewer): Model {
            $class = ContentTypes::model($revision->content_type);
            $record = $revision->isNewRow()
                ? (new $class)->forceFill(['slug' => $revision->slug, ...ContentTypes::defaults($revision->content_type)])
                : $class::query()->whereKey($revision->revisable_id)->lockForUpdate()->first();
            if (! $record instanceof Model) {
                throw new InvalidProposal(['The row of this revision no longer exists.']);
            }
            if ($revision->isNewRow() && $class::query()->withoutGlobalScopes()->where('slug', $revision->slug)->exists()) {
                throw new InvalidProposal(["A {$revision->content_type} with the slug {$revision->slug} was created meanwhile."]);
            }
            $this->ensureCurrent($revision, $record);

            foreach ($revision->changes as $field => $value) {
                $record->setAttribute($field, is_string($value) && str_starts_with($value, self::IMAGE_PREFIX)
                    ? $this->publishImage($revision, $field, substr($value, strlen(self::IMAGE_PREFIX)))
                    : $value);
            }
            $this->addSource($record, $revision->source_url);
            $record->setAttribute('status', ContentStatus::Published->value);
            $record->save();

            $revision->forceFill([
                'status' => RevisionStatus::Approved,
                'revisable_id' => $record->getKey(),
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
            ])->save();

            return $record;
        });
    }

    /**
     * @throws InvalidProposal
     */
    public function reject(Revision $revision, User $reviewer, string $reason): void
    {
        $this->guard($revision, $reviewer);
        if (trim($reason) === '') {
            throw new InvalidProposal(['Say why it is rejected: the AI learns from the reason.']);
        }

        foreach ($revision->changes as $value) {
            if (is_string($value) && str_starts_with($value, self::IMAGE_PREFIX)) {
                Storage::disk(RemoteImage::DISK)->delete(substr($value, strlen(self::IMAGE_PREFIX)));
            }
        }
        $revision->forceFill([
            'status' => RevisionStatus::Rejected,
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
            'rejection_reason' => mb_substr(trim($reason), 0, 2000),
        ])->save();
    }

    /**
     * @throws InvalidProposal
     */
    private function guard(Revision $revision, User $reviewer): void
    {
        if ($revision->status !== RevisionStatus::Pending) {
            throw new InvalidProposal(['This revision was already reviewed.']);
        }
        if ($reviewer->cannot('publish', new (ContentTypes::model($revision->content_type)))) {
            throw new InvalidProposal(['Only a reviewer (content.publish) approves or rejects.']);
        }
        if ($revision->author_id !== null && $revision->author_id === $reviewer->id) {
            throw new InvalidProposal(['A proposal is reviewed by someone other than its author.']);
        }
    }

    /**
     * A field changed since the proposal (by another approval or a person) would be overwritten without anyone
     * seeing it: the proposal has to be made again on the current values.
     *
     * @throws InvalidProposal
     */
    private function ensureCurrent(Revision $revision, Model $record): void
    {
        foreach ($revision->original ?? [] as $field => $before) {
            $changesImage = is_string($revision->changes[$field] ?? null) && str_starts_with($revision->changes[$field], self::IMAGE_PREFIX);
            if (! $changesImage && $this->editor->value($record, $field) !== $before) {
                throw new InvalidProposal(["The field {$field} changed after this proposal: reject it and propose again."]);
            }
        }
    }

    private function publishImage(Revision $revision, string $field, string $private): string
    {
        $extension = pathinfo($private, PATHINFO_EXTENSION);
        $public = 'catalogue/'.$revision->content_type.'/'.$revision->slug.'-'.$field.'-'.Str::lower(Str::random(8)).'.'.$extension;
        $bytes = Storage::disk(RemoteImage::DISK)->get($private);
        if ($bytes === null) {
            throw new InvalidProposal(['The image of this revision is no longer on the server: propose it again.']);
        }
        Storage::disk('public')->put($public, $bytes);
        Storage::disk(RemoteImage::DISK)->delete($private);

        return Storage::disk('public')->url($public);
    }

    /** The row's list of sources gets the revision's, once; `source_url` and the check date follow it. */
    private function addSource(Model $record, string $url): void
    {
        $sources = $record->getAttribute('sources');
        if (is_array($sources) && ! in_array($url, array_column($sources, 'url'), true)) {
            $sources[] = ['label' => (string) parse_url($url, PHP_URL_HOST), 'url' => $url];
            $record->setAttribute('sources', $sources);
        } elseif (! is_array($sources) && array_key_exists('sources', $record->getCasts())) {
            $record->setAttribute('sources', [['label' => (string) parse_url($url, PHP_URL_HOST), 'url' => $url]]);
        }
        $record->setAttribute('source_url', $url);
        $record->setAttribute('source_checked_at', now()->toDateString());
    }
}
