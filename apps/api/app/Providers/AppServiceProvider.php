<?php

namespace App\Providers;

use App\Enums\StaffPermission;
use App\Models\User;
use App\Policies\ContentPolicy;
use App\Policies\PersonalDataPolicy;
use App\Support\AuditLog;
use App\Support\ModelKinds;
use App\Support\Submission;
use Filament\Facades\Filament;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Spatie\Permission\Events\RoleAttachedEvent;
use Spatie\Permission\Events\RoleDetachedEvent;
use Spatie\Permission\Models\Role;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Writes without an account allowed per IP and per hour (docs/seguranca.md).
     *
     * @var array<string, int>
     */
    public const HOURLY_WRITES = [
        'waitlist' => 10,
        'feedback' => 10,
        'interviews' => 6,
        'public-cards' => 30,
    ];

    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureRateLimiting();
        $this->configurePolicies();
        $this->configureAudit();

        // Kursos without the daily limit, and the certificate: Plus, and never a minor (ADR 0025).
        Gate::define('kursos.unlimited', fn (User $user): bool => $user->hasPlus() && $user->isAdult());

        // Pulse, inside the panel: the panel's two locks, the second factor set up (Pulse is outside Filament's
        // middleware, which would ask for it), and the permission.
        Gate::define('viewPulse', fn (User $user): bool => $user->canAccessPanel(Filament::getPanel('admin'))
            && $user->getAppAuthenticationSecret() !== null
            && $user->can(StaffPermission::MonitoringView->value));
    }

    /**
     * A policy for every model (docs/seguranca.md, "Papéis e permissões"); a test fails when one has none.
     */
    private function configurePolicies(): void
    {
        foreach (ModelKinds::CONTENT as $model) {
            Gate::policy($model, ContentPolicy::class);
        }
        foreach (ModelKinds::PERSONAL as $model) {
            Gate::policy($model, PersonalDataPolicy::class);
        }
        foreach (ModelKinds::OWN_POLICY as $model => $policy) {
            Gate::policy($model, $policy);
        }
    }

    /**
     * Sign-ins with a session (the web's Google login and the panel's password) and the panel's failures; the
     * Android token and Google's failures are logged by their controllers. Role changes are logged too.
     */
    private function configureAudit(): void
    {
        Event::listen(Login::class, function (Login $event): void {
            if ($event->user instanceof User) {
                AuditLog::signedIn($event->user, request()->is('admin', 'admin/*', 'livewire*') ? 'panel' : 'web');
            }
        });
        Event::listen(Failed::class, function (Failed $event): void {
            $email = $event->credentials['email'] ?? null;
            AuditLog::signInFailed('panel', 'wrong_password', is_string($email) ? $email : null);
        });
        Event::listen(RoleAttachedEvent::class, fn (RoleAttachedEvent $event) => AuditLog::admin('role_given', $event->model, ['roles' => self::roleNames($event->rolesOrIds)]));
        Event::listen(RoleDetachedEvent::class, fn (RoleDetachedEvent $event) => AuditLog::admin('role_taken', $event->model, ['roles' => self::roleNames($event->rolesOrIds)]));
    }

    /**
     * @return list<string>
     */
    private static function roleNames(mixed $rolesOrIds): array
    {
        $items = $rolesOrIds instanceof Collection ? $rolesOrIds->all() : (is_array($rolesOrIds) ? $rolesOrIds : [$rolesOrIds]);
        $names = [];
        foreach ($items as $item) {
            $role = $item instanceof Role ? $item : Role::query()->find($item);
            if ($role instanceof Role) {
                $names[] = (string) $role->name;
            }
        }

        return $names;
    }

    /**
     * Request limits from docs/seguranca.md. Signed-in users are counted by
     * account, guests by IP address. Reads have a higher limit than writes:
     * each page of the app makes several, they come from the cache, and many
     * phones share one IP address behind the operator (CGNAT).
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('api', function (Request $request): Limit {
            $reads = $request->isMethodSafe();
            $who = $request->user()?->getAuthIdentifier() ?? $request->ip();

            return Limit::perMinute($reads ? 300 : 60)
                ->by(($reads ? 'read:' : 'write:').(is_int($who) || is_string($who) ? $who : 'unknown'));
        });

        RateLimiter::for('login', fn (Request $request): Limit => Limit::perMinute(10)->by('login:'.$request->ip()));

        // The routes opened by a secret (export, ingest, detailed health, switching off a public card): the
        // scrapers and monitors make a few requests a minute; guessing a secret takes millions.
        RateLimiter::for('secret', fn (Request $request): Limit => Limit::perMinute(30)->by('secret:'.$request->ip()));

        // The anonymous answer counters of the Kursos: an exam has a few dozen questions.
        RateLimiter::for('kurso-answers', function (Request $request): Limit {
            $who = $request->user()?->getAuthIdentifier() ?? $request->ip();

            return Limit::perHour(300)->by('kurso-answers:'.(is_int($who) || is_string($who) ? $who : 'unknown'));
        });

        // The links in the emails: a person clicks a few; guessing signatures takes many.
        RateLimiter::for('notice-links', fn (Request $request): Limit => Limit::perMinute(20)->by('notice-links:'.$request->ip()));

        // Comments and reports: 20 an hour per account.
        RateLimiter::for('comments', function (Request $request): Limit {
            $who = $request->user()?->getAuthIdentifier() ?? $request->ip();

            return Limit::perHour(20)
                ->by('comments:'.(is_int($who) || is_string($who) ? $who : 'unknown'))
                ->response(fn (Request $request, array $headers): JsonResponse => Submission::json(['error' => 'too_many'], 429)->withHeaders($headers));
        });

        // The writes without an account, per IP and per hour, as on the Vercel functions. Creating and changing a
        // public card share one count. The answer is the one the app knows: {"error": "too_many"}.
        foreach (self::HOURLY_WRITES as $name => $perHour) {
            RateLimiter::for($name, fn (Request $request): Limit => Limit::perHour($perHour)
                ->by("{$name}:".$request->ip())
                ->response(fn (Request $request, array $headers): JsonResponse => Submission::json(['error' => 'too_many'], 429)->withHeaders($headers)));
        }
    }
}
