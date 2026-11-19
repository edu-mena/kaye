<?php

namespace App\Models;

use App\Models\Concerns\BelongsToUser;
use Database\Factories\FeedbackFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * A critique, an idea or a bug sent from the landing page or the support page.
 *
 * @property string $kind
 * @property string $message
 * @property string $page
 * @property string $locale
 * @property string $status
 * @property Carbon $created_at
 */
#[Guarded(['id'])]
#[Table('feedback')]
class Feedback extends Model
{
    /** @use HasFactory<FeedbackFactory> */
    use BelongsToUser, HasFactory;

    public const KINDS = ['critique', 'idea', 'bug'];

    public const PAGES = ['landing', 'support'];

    protected $attributes = [
        'status' => 'new',
    ];
}
