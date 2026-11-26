<?php

namespace App\Filament\Resources\Interviews;

use App\Enums\StaffPermission;
use App\Filament\Resources\Interviews\Pages\ListInterviews;
use App\Models\Interview;
use App\Models\User;
use App\Support\AuditLog;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Resources\Resource;
use Filament\Support\Enums\Width;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Contracts\View\View;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use UnitEnum;

/**
 * Interview practices sent for review (value offer 2.2.1): read the answers, then mark them reviewed or
 * contacted. The candidate's contact only opens in the detail, and each opening goes to the audit log; a minor
 * shows whether the guardian knows. Gone after 12 months (`model:prune`).
 *
 * @extends resource<Interview>
 */
class InterviewResource extends Resource
{
    protected static ?string $model = Interview::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::Microphone;

    protected static string|UnitEnum|null $navigationGroup = 'Moderação';

    protected static ?int $navigationSort = 3;

    protected static ?string $modelLabel = 'entrevista';

    protected static ?string $pluralModelLabel = 'entrevistas';

    private const STATES = ['received' => 'Recebida', 'reviewed' => 'Revista', 'contacted' => 'Contactada'];

    public static function getNavigationBadge(): ?string
    {
        if (! static::canViewAny()) {
            return null;
        }
        $received = Interview::query()->where('status', 'received')->count();

        return $received > 0 ? (string) $received : null;
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                TextColumn::make('created_at')->label('Recebida')->dateTime('d/m/Y H:i')->sortable(),
                TextColumn::make('area')->label('Área'),
                TextColumn::make('career_name')->label('Profissão')->placeholder('—'),
                TextColumn::make('answers')->label('Respostas')->state(fn (Interview $record): int => count($record->answers)),
                TextColumn::make('minor')->label('Idade')->state(fn (Interview $record): string => self::isMinor($record) ? 'Menor' : 'Maior'),
                TextColumn::make('status')->label('Estado')->badge()->formatStateUsing(fn (string $state): string => self::STATES[$state] ?? $state),
            ])
            ->filters([
                SelectFilter::make('status')->label('Estado')->options(self::STATES)->default('received'),
            ])
            ->recordActions([
                Action::make('open')->label('Abrir')->icon(Heroicon::Eye)
                    ->modalHeading('Entrevista')
                    ->modalWidth(Width::FourExtraLarge)
                    ->modalSubmitAction(false)->modalCancelActionLabel('Fechar')
                    ->modalContent(function (Interview $record): View {
                        AuditLog::admin('interview_opened', $record);

                        return view('filament.interviews.show', ['interview' => $record, 'minor' => self::isMinor($record)]);
                    }),
                self::mark('reviewed', 'Marcar revista', Heroicon::Check),
                self::mark('contacted', 'Marcar contactada', Heroicon::Phone),
                DeleteAction::make()->after(fn (Interview $record) => AuditLog::admin('interview_deleted', $record)),
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

    public static function getPages(): array
    {
        return [
            'index' => ListInterviews::route('/'),
        ];
    }

    /**
     * Who sees personal data also records what was done with an interview (the answers and contact never change).
     */
    private static function mark(string $status, string $label, Heroicon $icon): Action
    {
        return Action::make($status)->label($label)->icon($icon)
            ->visible(fn (Interview $record): bool => $record->status !== $status)
            ->authorize(fn (): bool => Auth::user()?->can(StaffPermission::PeopleView->value) ?? false)
            ->action(function (Interview $record) use ($status): void {
                $user = Auth::user();
                $record->forceFill([
                    'status' => $status,
                    'reviewed_by' => $user instanceof User ? $user->id : null,
                    'reviewed_at' => now(),
                ])->save();
                AuditLog::admin('interview_'.$status, $record);
            });
    }

    private static function isMinor(Interview $record): bool
    {
        $year = $record->candidate['birthYear'] ?? null;

        return ! is_int($year) || (int) now()->year - $year < 18;
    }
}
