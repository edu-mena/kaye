<?php

namespace App\Models;

use App\Enums\Locale;
use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'avatar_url', 'birth_year', 'province', 'current_education_level', 'locale'])]
#[Hidden(['google_sub', 'apple_sub', 'password', 'remember_token'])]
class User extends Authenticatable implements FilamentUser
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * Same defaults as the migration, so new models have them before a reload.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'role' => 'user',
        'locale' => 'pt',
        'xp' => 0,
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'role' => UserRole::class,
            'locale' => Locale::class,
            'birth_year' => 'integer',
            'xp' => 'integer',
        ];
    }

    /**
     * Two independent checks: the role and the ADMIN_EMAILS allowlist.
     */
    public function canAccessPanel(Panel $panel): bool
    {
        return $this->role->canAccessAdmin()
            && in_array(Str::lower($this->email), Config::array('kaye.admin_emails'), true);
    }

    public function isMinor(): bool
    {
        return $this->birth_year !== null && (int) now()->year - $this->birth_year < 18;
    }
}
