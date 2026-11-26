<?php

namespace App\Filament\Resources\Staff;

use App\Enums\StaffRole;
use App\Filament\Resources\Staff\Pages\ListStaff;
use App\Models\User;
use App\Support\AuditLog;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Forms\Components\Select;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Str;
use UnitEnum;

/**
 * "Equipa e papéis" (Sistema): who works in the panel and with which role (docs/seguranca.md, "Papéis e
 * permissões"). Give or change a role, take someone out of the team, give a new password or make them set up the
 * second factor again. Nobody changes their own account here. A role alone does not open the panel: the email must
 * also be in ADMIN_EMAILS, and the list says whether it is.
 *
 * @extends resource<User>
 */
class StaffResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $slug = 'equipa';

    protected static string|BackedEnum|null $navigationIcon = Heroicon::UserCircle;

    protected static string|UnitEnum|null $navigationGroup = 'Sistema';

    protected static ?int $navigationSort = 1;

    protected static ?string $modelLabel = 'membro da equipa';

    protected static ?string $pluralModelLabel = 'equipa';

    protected static ?string $navigationLabel = 'Equipa e papéis';

    public const ROLES = [
        'admin' => 'Administrador (tudo)',
        'editor' => 'Editor (escreve conteúdo e mensagens)',
        'reviewer' => 'Revisor (publica e modera)',
    ];

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('name')
            ->columns([
                TextColumn::make('name')->label('Nome')->searchable(),
                TextColumn::make('email')->label('Email')->searchable(),
                TextColumn::make('role')->label('Papel')->badge()
                    ->state(fn (User $record): string => self::ROLES[self::roleOf($record) ?? ''] ?? '—'),
                IconColumn::make('allowlisted')->label('Em ADMIN_EMAILS')->boolean()
                    ->state(fn (User $record): bool => in_array(Str::lower((string) $record->email), Config::array('kaye.admin_emails'), true)),
                IconColumn::make('second_factor')->label('2FA')->boolean()
                    ->state(fn (User $record): bool => $record->getAppAuthenticationSecret() !== null),
                TextColumn::make('last_login_at')->label('Último login')->since()->placeholder('—'),
            ])
            ->headerActions([
                Action::make('add')->label('Dar um papel')->icon(Heroicon::UserPlus)
                    ->modalDescription('A pessoa entra primeiro na app com o Google (para ter conta); depois escolhe-a aqui. Põe também o email dela em ADMIN_EMAILS no servidor.')
                    ->schema([
                        Select::make('user')->label('Conta')->required()->searchable()
                            ->getSearchResultsUsing(fn (string $search): array => User::query()->where('email', $search)->pluck('email', 'id')->all())
                            ->getOptionLabelUsing(function (mixed $value): ?string {
                                $email = User::query()->whereKey($value)->value('email');

                                return is_string($email) ? $email : null;
                            })
                            ->helperText('O email completo da conta.'),
                        Select::make('role')->label('Papel')->options(self::ROLES)->required(),
                    ])
                    ->authorize(fn (): bool => Auth::user()?->can('viewAny', User::class) ?? false)
                    ->action(function (array $data): void {
                        $user = User::query()->find(is_numeric($data['user'] ?? null) ? (int) $data['user'] : 0);
                        if (! $user instanceof User || ! (Auth::user()?->can('update', $user) ?? false)) {
                            Notification::make()->title('Não podes mudar esta conta.')->danger()->send();

                            return;
                        }
                        self::giveRole($user, is_string($data['role'] ?? null) ? $data['role'] : '');
                        if ($user->getAttribute('password') === null) {
                            self::newPassword($user);
                        }
                    }),
            ])
            ->recordActions([
                Action::make('role')->label('Mudar papel')->icon(Heroicon::ShieldCheck)
                    ->schema([Select::make('role')->label('Papel')->options(self::ROLES)->required()->default(fn (User $record): ?string => self::roleOf($record))])
                    ->authorize(fn (User $record): bool => Auth::user()?->can('update', $record) ?? false)
                    ->action(fn (User $record, array $data) => self::giveRole($record, is_string($data['role'] ?? null) ? $data['role'] : '')),
                Action::make('resetTotp')->label('Repor o 2FA')->icon(Heroicon::DevicePhoneMobile)->color('gray')
                    ->requiresConfirmation()
                    ->modalDescription('No próximo login, a pessoa volta a configurar a app de códigos (perdeu o telemóvel, por exemplo).')
                    ->authorize(fn (User $record): bool => Auth::user()?->can('update', $record) ?? false)
                    ->action(function (User $record): void {
                        $record->forceFill(['app_authentication_secret' => null, 'app_authentication_recovery_codes' => null])->save();
                        AuditLog::admin('staff_totp_reset', $record);
                        Notification::make()->title('O 2FA volta a ser configurado no próximo login.')->success()->send();
                    }),
                Action::make('remove')->label('Tirar da equipa')->icon(Heroicon::UserMinus)->color('danger')
                    ->requiresConfirmation()
                    ->modalDescription('A conta fica (é a da app), mas sem papel, sem senha do painel e sem 2FA.')
                    ->authorize(fn (User $record): bool => Auth::user()?->can('update', $record) ?? false)
                    ->action(function (User $record): void {
                        $record->syncRoles([]);
                        $record->forceFill(['password' => null, 'app_authentication_secret' => null, 'app_authentication_recovery_codes' => null])->save();
                        AuditLog::admin('staff_removed', $record);
                        Notification::make()->title('Saiu da equipa.')->success()->send();
                    }),
                Action::make('password')->label('Nova senha')->icon(Heroicon::Key)->color('gray')
                    ->requiresConfirmation()
                    ->modalDescription('Gera uma senha nova para o painel e mostra-a uma vez. A antiga deixa de servir.')
                    ->authorize(fn (User $record): bool => Auth::user()?->can('update', $record) ?? false)
                    ->action(fn (User $record) => self::newPassword($record)),
            ]);
    }

    /** The panel's password (the app itself only signs in with Google), shown once. */
    private static function newPassword(User $user): void
    {
        $password = Str::password(20, symbols: false);
        $user->forceFill(['password' => $password])->save();
        AuditLog::admin('staff_password_reset', $user);
        Notification::make()->title('Senha do painel: dá-a à pessoa agora, não volta a aparecer.')->body($password)->persistent()->success()->send();
    }

    /**
     * @return Builder<User>
     */
    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->whereHas('roles')->with('roles');
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canEdit(Model $record): bool
    {
        return false;
    }

    public static function getPages(): array
    {
        return [
            'index' => ListStaff::route('/'),
        ];
    }

    /** One role per person; the change is logged by the role events (AppServiceProvider). */
    private static function giveRole(User $user, string $role): void
    {
        if (StaffRole::tryFrom($role) === null) {
            return;
        }
        $user->syncRoles([$role]);
        Notification::make()->title("{$user->name}: ".self::ROLES[$role])->success()->send();
    }

    private static function roleOf(User $record): ?string
    {
        $role = $record->roles->first()?->getAttribute('name');

        return is_string($role) ? $role : null;
    }
}
