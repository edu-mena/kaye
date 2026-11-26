<?php

namespace App\Filament\Pages;

use App\Enums\StaffPermission;
use App\Models\User;
use App\Support\Settings;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Facades\Auth;
use UnitEnum;

/**
 * "Definições" (Sistema): the keys and limits of App\Support\Settings. A key is typed once and never shown again;
 * the page says where each value comes from (panel, .env or empty), who changed it and when. Admins only.
 */
class SettingsPage extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::Cog6Tooth;

    protected static string|UnitEnum|null $navigationGroup = 'Sistema';

    protected static ?int $navigationSort = 3;

    protected static ?string $navigationLabel = 'Definições';

    protected static ?string $title = 'Definições';

    protected static ?string $slug = 'definicoes';

    protected string $view = 'filament.pages.settings';

    public static function canAccess(): bool
    {
        return Auth::user()?->can(StaffPermission::StaffManage->value) ?? false;
    }

    /**
     * @return list<array{key: string, label: string, help: string, env: string, kind: string, source: string, value: string|null, updated_at: \Illuminate\Support\Carbon|null, updated_by: string|null}>
     */
    public function settings(): array
    {
        return Settings::overview();
    }

    public function changeAction(): Action
    {
        return Action::make('change')
            ->label('Mudar')
            ->icon(Heroicon::PencilSquare)
            ->modalHeading(fn (array $arguments): string => Settings::KEYS[self::key($arguments)][2] ?? 'Definição')
            ->modalDescription(fn (array $arguments): string => self::isSecret($arguments)
                ? 'Depois de gravada, a chave não volta a aparecer: nem aqui nem nos registos.'
                : 'O valor passa a valer em vez do .env.')
            ->schema(fn (array $arguments): array => [
                self::isSecret($arguments)
                    ? TextInput::make('value')->label('Novo valor')->password()->required()->maxLength(500)->autocomplete('new-password')
                    : TextInput::make('value')->label('Novo valor')->numeric()->minValue(0)->required(),
            ])
            ->authorize(fn (): bool => self::canAccess())
            ->action(function (array $data, array $arguments): void {
                $user = Auth::user();
                $key = self::key($arguments);
                if (! $user instanceof User || ! isset(Settings::KEYS[$key])) {
                    return;
                }
                Settings::save($key, is_scalar($data['value'] ?? null) ? (string) $data['value'] : '', $user);
                Notification::make()->title('Gravado.')->success()->send();
            });
    }

    public function forgetAction(): Action
    {
        return Action::make('forget')
            ->label('Voltar ao .env')
            ->icon(Heroicon::ArrowUturnLeft)
            ->color('gray')
            ->requiresConfirmation()
            ->authorize(fn (): bool => self::canAccess())
            ->action(function (array $arguments): void {
                $key = self::key($arguments);
                if (isset(Settings::KEYS[$key])) {
                    Settings::forget($key);
                    Notification::make()->title('Volta a valer o .env.')->success()->send();
                }
            });
    }

    /**
     * The setting an action is for (the row's argument).
     *
     * @param  array<mixed>  $arguments
     */
    private static function key(array $arguments): string
    {
        return is_string($arguments['key'] ?? null) ? $arguments['key'] : '';
    }

    /**
     * @param  array<mixed>  $arguments
     */
    private static function isSecret(array $arguments): bool
    {
        return (Settings::KEYS[self::key($arguments)][1] ?? '') === Settings::SECRET;
    }
}
