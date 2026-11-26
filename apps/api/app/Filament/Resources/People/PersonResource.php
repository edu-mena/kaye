<?php

namespace App\Filament\Resources\People;

use App\Enums\StaffPermission;
use App\Filament\Resources\People\Pages\ListPeople;
use App\Models\User;
use App\Support\Accounts;
use App\Support\AuditLog;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;
use UnitEnum;

/**
 * "Pessoas": the accounts of the app, only to answer a request (Lei n.º 22/11): find the account by its exact
 * email or number, download its data or delete it. Only what that needs shows: the email half hidden, and for a
 * minor neither the name nor the province (docs/seguranca.md, "Dados pessoais e menores"). Each download and each
 * deletion goes to the audit log. The team's accounts are in "Equipa e papéis".
 *
 * @extends resource<User>
 */
class PersonResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $slug = 'pessoas';

    protected static string|BackedEnum|null $navigationIcon = Heroicon::Users;

    protected static string|UnitEnum|null $navigationGroup = 'Pessoas';

    protected static ?int $navigationSort = 1;

    protected static ?string $modelLabel = 'pessoa';

    protected static ?string $pluralModelLabel = 'pessoas';

    public static function canViewAny(): bool
    {
        return Auth::user()?->can(StaffPermission::PeopleView->value) ?? false;
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('id', 'desc')
            ->searchPlaceholder('Email completo ou número da conta')
            ->columns([
                TextColumn::make('id')->label('Conta')->prefix('#')
                    ->searchable(query: fn (Builder $query, string $search): Builder => self::find($query, $search)),
                TextColumn::make('name')->label('Nome')->state(fn (User $record): string => $record->isMinor() ? 'Menor: '.self::initials($record) : $record->name),
                TextColumn::make('email')->label('Email')->state(fn (User $record): string => self::masked((string) $record->email)),
                TextColumn::make('age')->label('Idade')->state(fn (User $record): string => match (true) {
                    $record->birth_year === null => 'Por saber',
                    $record->isMinor() => 'Menor',
                    default => 'Maior',
                }),
                TextColumn::make('province')->label('Província')->state(fn (User $record): string => $record->isMinor() ? '—' : ($record->province ?? '—')),
                TextColumn::make('created_at')->label('Conta desde')->date('d/m/Y')->sortable(),
                TextColumn::make('last_login_at')->label('Último login')->since()->placeholder('—'),
            ])
            ->filters([
                TernaryFilter::make('minor')->label('Menores')
                    ->queries(
                        true: fn (Builder $query): Builder => $query->where('birth_year', '>', now()->year - 18),
                        false: fn (Builder $query): Builder => $query->where('birth_year', '<=', now()->year - 18),
                    ),
            ])
            ->recordActions([
                Action::make('export')->label('Descarregar os dados')->icon(Heroicon::ArrowDownTray)
                    ->authorize(fn (): bool => Auth::user()?->can(StaffPermission::PeopleExport->value) ?? false)
                    ->action(function (User $record): StreamedResponse {
                        AuditLog::admin('account_exported', $record, ['channel' => 'panel']);
                        $json = (string) json_encode(app(Accounts::class)->export($record), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

                        return response()->streamDownload(fn () => print ($json), "kaye-conta-{$record->id}.json", ['Content-Type' => 'application/json']);
                    }),
                Action::make('erase')->label('Apagar a conta')->icon(Heroicon::Trash)->color('danger')
                    ->modalHeading('Apagar a conta e os dados')
                    ->modalDescription('Apaga a conta, os dados da app, os consentimentos e os logins. Não dá para desfazer.')
                    ->schema([TextInput::make('confirm')->label('Escreve APAGAR para confirmar')->required()->in(['APAGAR'])])
                    ->authorize(fn (User $record): bool => Auth::user()?->can('delete', $record) ?? false)
                    ->action(function (User $record): void {
                        $id = $record->id;
                        app(Accounts::class)->delete($record);
                        AuditLog::admin('account_deleted', details: ['account' => $id, 'channel' => 'panel']);
                        Notification::make()->title("Conta #{$id} apagada.")->success()->send();
                    }),
            ]);
    }

    /**
     * The people of the app, not the team.
     *
     * @return Builder<User>
     */
    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->whereDoesntHave('roles');
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
            'index' => ListPeople::route('/'),
        ];
    }

    /**
     * An account is found by its whole email or its number, never by a piece of a name: the list is for answering
     * a request, not for browsing people.
     *
     * @param  Builder<User>  $query
     * @return Builder<User>
     */
    private static function find(Builder $query, string $search): Builder
    {
        $search = trim($search);

        return str_contains($search, '@')
            ? $query->where('email', Str::lower($search))
            : $query->whereKey((int) ltrim($search, '#'));
    }

    private static function masked(string $email): string
    {
        [$name, $domain] = array_pad(explode('@', $email, 2), 2, '');

        return mb_substr($name, 0, 1).str_repeat('•', max(2, mb_strlen($name) - 1)).'@'.$domain;
    }

    private static function initials(User $record): string
    {
        return implode('', array_map(fn (string $part): string => mb_strtoupper(mb_substr($part, 0, 1)).'.', array_filter(explode(' ', $record->name)))) ?: '—';
    }
}
