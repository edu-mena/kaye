<?php

namespace App\Providers\Filament;

use App\Filament\KayeTheme;
use App\Filament\Pages\Dashboard;
use Filament\Auth\MultiFactor\App\AppAuthentication;
use Filament\FontProviders\LocalFontProvider;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Navigation\NavigationGroup;
use Filament\Navigation\NavigationItem;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Icons\Heroicon;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Gate;
use Illuminate\View\Middleware\ShareErrorsFromSession;

/**
 * The admin panel (docs/design.md, "Painel"): the site's look (KayeTheme and resources/css/filament/admin), in
 * Portuguese, behind three locks: a staff role, the email in ADMIN_EMAILS and the second factor (ADR 0026).
 */
class AdminPanelProvider extends PanelProvider
{
    /** The sidebar's groups, in order: the catalogue first, then the team's work, then the system. */
    public const GROUPS = [
        'Carreiras', 'Formação', 'Oportunidades', 'Novidades', 'Testes e Kursos', 'Mercado',
        'Caixa da IA', 'Moderação', 'Comunicação', 'Pessoas', 'Sistema',
    ];

    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->login()
            // The second factor is required (docs/seguranca.md): an app code (TOTP), with recovery codes for a
            // lost phone. Until it is set up, the panel only shows the page that sets it up.
            ->multiFactorAuthentication([AppAuthentication::make()->recoverable()], isRequired: true)
            ->brandName('Kayé · Admin')
            ->brandLogo(asset('images/kaye-logo.png'))
            ->brandLogoHeight('2rem')
            ->favicon(asset('images/favicon.svg'))
            ->colors(KayeTheme::colors())
            // The site's font, bundled with the theme (no font service: the panel's CSP only allows our domain).
            ->font('Bricolage Grotesque Variable', provider: LocalFontProvider::class)
            ->viteTheme('resources/css/filament/admin/theme.css')
            ->darkMode()
            ->sidebarCollapsibleOnDesktop()
            ->maxContentWidth('full')
            ->unsavedChangesAlerts()
            ->navigationGroups(array_map(
                fn (string $group): NavigationGroup => NavigationGroup::make($group)->collapsed(! in_array($group, ['Caixa da IA', 'Moderação'], true)),
                self::GROUPS,
            ))
            // Pulse lives outside Filament, behind its own gate (AppServiceProvider, viewPulse).
            ->navigationItems([
                NavigationItem::make('Pulse')->url(fn (): string => url('/admin/pulse'))->icon(Heroicon::ChartBarSquare)
                    ->group('Sistema')->sort(4)->visible(fn (): bool => Gate::allows('viewPulse')),
            ])
            // The panel speaks Portuguese, whatever the browser asks.
            ->bootUsing(fn () => App::setLocale('pt'))
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\Filament\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\Filament\Pages')
            ->pages([
                Dashboard::class,
            ])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\Filament\Widgets')
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                PreventRequestForgery::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
            ]);
    }
}
