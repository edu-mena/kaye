<?php

namespace App\Models;

use App\Models\Concerns\BelongsToUser;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Model;

/**
 * How a person says they relate to an area (self-declared, never verified) and their pioneer number (ADR 0025).
 *
 * @property string $area
 * @property string $level student, aspirant, graduate or professional
 * @property int|null $pioneer_number
 */
#[Guarded(['id'])]
class AreaMembership extends Model
{
    use BelongsToUser;
}
