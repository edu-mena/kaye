<?php

namespace App\Filament\Resources\Activities;

use App\Enums\StaffPermission;
use App\Filament\Resources\Activities\Pages\ListActivities;
use App\Support\AuditLog;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Resources\Resource;
use Filament\Support\Enums\Width;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\HtmlString;
use Spatie\Activitylog\Models\Activity;
use UnitEnum;

/**
 * "Auditoria" (docs/seguranca.md): who changed what and when (`activity_log`): every change to the catalogue and
 * the messages, the logins and failed logins, and the team's actions in the panel. Read only; it never holds
 * personal data (AuditLog), and it is kept for a year.
 *
 * @extends resource<Activity>
 */
class ActivityResource extends Resource
{
    protected static ?string $model = Activity::class;

    protected static ?string $slug = 'auditoria';

    protected static string|BackedEnum|null $navigationIcon = Heroicon::ClipboardDocumentList;

    protected static string|UnitEnum|null $navigationGroup = 'Sistema';

    protected static ?int $navigationSort = 2;

    protected static ?string $modelLabel = 'registo';

    protected static ?string $pluralModelLabel = 'auditoria';

    protected static ?string $navigationLabel = 'Auditoria';

    private const LOGS = [AuditLog::AUTH => 'Logins', AuditLog::ADMIN => 'Ações da equipa', 'default' => 'Conteúdo'];

    public static function canViewAny(): bool
    {
        return Auth::user()?->can(StaffPermission::AuditView->value) ?? false;
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('id', 'desc')
            ->columns([
                TextColumn::make('created_at')->label('Quando')->dateTime('d/m/Y H:i:s')->sortable(),
                TextColumn::make('log_name')->label('Registo')->badge()->formatStateUsing(fn (?string $state): string => self::LOGS[$state ?? 'default'] ?? (string) $state),
                TextColumn::make('event')->label('O quê')->searchable(),
                TextColumn::make('subject')->label('Em')->state(fn (Activity $record): string => $record->subject_type === null
                    ? '—' : class_basename($record->subject_type).' #'.$record->subject_id),
                TextColumn::make('causer')->label('Quem')->state(fn (Activity $record): string => self::causer($record)),
            ])
            ->filters([
                SelectFilter::make('log_name')->label('Registo')->options(self::LOGS),
                SelectFilter::make('event')->label('O quê')->options(
                    fn (): array => Activity::query()->distinct()->orderBy('event')->limit(100)->pluck('event', 'event')->filter()->all(),
                ),
                SelectFilter::make('subject_type')->label('Em')->options(
                    fn (): array => Activity::query()->whereNotNull('subject_type')->distinct()->orderBy('subject_type')->pluck('subject_type')
                        ->mapWithKeys(fn (mixed $type): array => is_string($type) ? [$type => class_basename($type)] : [])->all(),
                ),
            ])
            ->recordActions([
                Action::make('details')->label('Detalhe')->icon(Heroicon::Eye)
                    ->modalWidth(Width::FourExtraLarge)
                    ->modalSubmitAction(false)->modalCancelActionLabel('Fechar')
                    // Escaped: a changed value is data, never HTML.
                    ->modalContent(fn (Activity $record): HtmlString => new HtmlString('<pre class="text-sm whitespace-pre-wrap break-words">'
                        .e((string) json_encode($record->properties, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)).'</pre>')),
            ]);
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canEdit(Model $record): bool
    {
        return false;
    }

    public static function canDelete(Model $record): bool
    {
        return false;
    }

    public static function getPages(): array
    {
        return [
            'index' => ListActivities::route('/'),
        ];
    }

    private static function causer(Activity $record): string
    {
        $causer = $record->causer;
        $name = $causer instanceof Model ? $causer->getAttribute('name') : null;

        return is_string($name) ? $name : ($record->causer_id === null ? 'Sistema' : '#'.$record->causer_id);
    }
}
