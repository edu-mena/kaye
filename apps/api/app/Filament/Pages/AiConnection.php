<?php

namespace App\Filament\Pages;

use App\Enums\StaffPermission;
use App\Http\Middleware\EnsureMcpToken;
use App\Models\User;
use App\Support\AuditLog;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Laravel\Sanctum\PersonalAccessToken;

/**
 * "Ligação à IA" (docs/ia.md): the MCP tokens of the person signed in. A token has only the `mcp` ability, expires
 * after MCP_TOKEN_DAYS and is shown once; revoking it cuts the AI off at once.
 */
class AiConnection extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::Key;

    protected static ?string $navigationLabel = 'Ligação à IA';

    protected static ?string $title = 'Ligação à IA (MCP)';

    protected string $view = 'filament.pages.ai-connection';

    public static function canAccess(): bool
    {
        return Auth::user()?->can(StaffPermission::ContentEdit->value) ?? false;
    }

    /**
     * @return Collection<int, PersonalAccessToken>
     */
    public function tokens(): Collection
    {
        $user = Auth::user();

        return $user instanceof User
            ? $user->tokens()->where('abilities', json_encode([EnsureMcpToken::ABILITY]))->latest('id')->get()
            : new Collection;
    }

    public function revoke(int $id): void
    {
        $user = Auth::user();
        if ($user instanceof User && $user->tokens()->whereKey($id)->delete() > 0) {
            AuditLog::admin('mcp_token_revoked', $user);
            Notification::make()->title('Token revogado.')->success()->send();
        }
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('createToken')->label('Criar token')->icon(Heroicon::Plus)
                ->schema([TextInput::make('name')->label('Para quê')->required()->maxLength(60)->placeholder('Claude Code no meu PC')])
                ->action(function (array $data): void {
                    $user = Auth::user();
                    if (! $user instanceof User || ! self::canAccess()) {
                        return;
                    }
                    $name = is_string($data['name'] ?? null) ? $data['name'] : 'MCP';
                    $token = $user->createToken($name, [EnsureMcpToken::ABILITY], now()->addDays(Config::integer('ai.mcp_token_days')));
                    AuditLog::admin('mcp_token_created', $user, ['days' => Config::integer('ai.mcp_token_days')]);
                    Notification::make()->title('Copia o token agora: não volta a aparecer.')
                        ->body($token->plainTextToken)->persistent()->success()->send();
                }),
        ];
    }
}
