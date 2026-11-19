<?php

namespace App\Models;

use App\Models\Concerns\BelongsToUser;
use Database\Factories\PublicCardFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * The public page of a business card (ADR 0014): only the fields the person chose. The owner proves it with a
 * secret only their device keeps; the server keeps its SHA-256.
 *
 * @property string $slug
 * @property string $secret_hash
 * @property array<string, string> $card
 */
#[Guarded(['id'])]
#[Hidden(['secret_hash'])]
class PublicCard extends Model
{
    /** @use HasFactory<PublicCardFactory> */
    use BelongsToUser, HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'card' => 'array',
        ];
    }

    public static function hashSecret(string $secret): string
    {
        return hash('sha256', $secret);
    }

    /**
     * Whether $secret is this card's, compared in constant time.
     */
    public function isOwnedBy(string $secret): bool
    {
        return $secret !== '' && hash_equals($this->secret_hash, self::hashSecret($secret));
    }
}
