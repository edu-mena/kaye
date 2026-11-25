<?php

namespace App\Models;

use App\Enums\Locale;
use App\Enums\StaffRole;
use App\Models\Contracts\ReceivesNotices;
use Database\Factories\UserFactory;
use Filament\Auth\MultiFactor\App\Concerns\InteractsWithAppAuthentication;
use Filament\Auth\MultiFactor\App\Concerns\InteractsWithAppAuthenticationRecovery;
use Filament\Auth\MultiFactor\App\Contracts\HasAppAuthentication;
use Filament\Auth\MultiFactor\App\Contracts\HasAppAuthenticationRecovery;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;
use NotificationChannels\WebPush\HasPushSubscriptions;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email', 'avatar_url', 'birth_year', 'province', 'current_education_level', 'locale'])]
#[Hidden(['google_sub', 'apple_sub', 'password', 'remember_token'])]
class User extends Authenticatable implements FilamentUser, HasAppAuthentication, HasAppAuthenticationRecovery, ReceivesNotices
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasPushSubscriptions, HasRoles, InteractsWithAppAuthentication, InteractsWithAppAuthenticationRecovery, Notifiable, SoftDeletes;

    /** Under this age a person is a minor (docs/arquitetura.md, 8). */
    public const ADULT_AGE = 18;

    protected $attributes = [
        'locale' => 'pt',
        'xp' => 0,
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'locale' => Locale::class,
            'birth_year' => 'integer',
            'xp' => 'integer',
            'last_login_at' => 'datetime',
            'plus_until' => 'datetime',
        ];
    }

    /**
     * Two locks (docs/seguranca.md): a staff role **and** the email in ADMIN_EMAILS. The panel then asks for the
     * second factor (TOTP) before anything else.
     */
    public function canAccessPanel(Panel $panel): bool
    {
        return $this->isStaff()
            && in_array(Str::lower($this->email), Config::array('kaye.admin_emails'), true);
    }

    /** Has one of the team's roles (admin, editor, reviewer). */
    public function isStaff(): bool
    {
        return $this->hasAnyRole(StaffRole::values());
    }

    /**
     * @return HasOne<UserData, $this>
     */
    public function userData(): HasOne
    {
        return $this->hasOne(UserData::class);
    }

    /**
     * @return HasMany<Consent, $this>
     */
    public function consents(): HasMany
    {
        return $this->hasMany(Consent::class);
    }

    /**
     * @return HasMany<MessageDelivery, $this>
     */
    public function deliveries(): HasMany
    {
        return $this->hasMany(MessageDelivery::class);
    }

    /** Known to be under 18. The age is computed from the birth year, never stored. */
    public function isMinor(): bool
    {
        return $this->birth_year !== null && $this->age() < self::ADULT_AGE;
    }

    /** Known to be 18 or older. Without a birth year a person is not: the rules below fail closed. */
    public function isAdult(): bool
    {
        return $this->birth_year !== null && $this->age() >= self::ADULT_AGE;
    }

    /** Kayé Plus is active (ADR 0024). Nothing charges it yet: it is set by hand until payment exists. */
    public function hasPlus(): bool
    {
        return $this->plus_until !== null && $this->plus_until->isFuture();
    }

    public function canReceiveMarketing(): bool
    {
        return $this->isAdult();
    }

    public function canHavePublicProfile(): bool
    {
        return $this->isAdult();
    }

    public function canReportSalaries(): bool
    {
        return $this->isAdult();
    }

    public function noticeRecipient(): string
    {
        return 'user:'.$this->id;
    }

    public function noticeEmail(): ?string
    {
        return $this->email;
    }

    public function noticeLocale(): string
    {
        return $this->locale->value;
    }

    private function age(): int
    {
        return (int) now()->year - (int) $this->birth_year;
    }
}
