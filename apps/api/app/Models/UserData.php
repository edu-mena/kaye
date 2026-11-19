<?php

namespace App\Models;

use App\Models\Concerns\BelongsToUser;
use Database\Factories\UserDataFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use stdClass;

/**
 * The person's `UserData` from the app (state/userStore.ts), as one JSON document with a version.
 *
 * The document is kept as JSON objects (stdClass), never as PHP arrays: `{}` and `[]` must come back
 * as they went in, or the app would get a list where it keeps a record (`answers`, `kursos`).
 */
#[Fillable(['version', 'schema_version'])]
class UserData extends Model
{
    /** @use HasFactory<UserDataFactory> */
    use BelongsToUser, HasFactory;

    protected $table = 'user_data';

    protected $attributes = [
        'version' => 0,
        'schema_version' => 1,
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'version' => 'integer',
            'schema_version' => 'integer',
        ];
    }

    public function document(): stdClass
    {
        $raw = $this->getAttributeValue('data');
        $decoded = is_string($raw) ? json_decode($raw, false, 512, JSON_THROW_ON_ERROR) : null;

        return $decoded instanceof stdClass ? $decoded : new stdClass;
    }

    public function setDocument(stdClass $document): void
    {
        $this->setAttribute('data', json_encode($document, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    }
}
