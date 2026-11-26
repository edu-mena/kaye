<?php

namespace App\Filament\Resources\Revisions;

use App\Enums\RevisionStatus;
use App\Filament\Content\ContentLabels;
use App\Filament\Resources\Revisions\Pages\ListRevisions;
use App\Models\Revision;
use App\Models\User;
use App\Support\ContentTypes;
use App\Support\InvalidProposal;
use App\Support\Revisions;
use App\Support\TextDiff;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Forms\Components\Textarea;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Support\Enums\Width;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\HtmlString;
use UnitEnum;

/**
 * "Caixa da IA" (docs/ia.md): the proposals of the AI and of the team, each with the values before and after side
 * by side (the words that change are marked), the source and the note; approve (applies and publishes) or reject
 * (with the reason). The changes saved directly in the panel are here too, as `edited`: filtering by slug gives a
 * row's whole history.
 *
 * @extends resource<Revision>
 */
class RevisionResource extends Resource
{
    protected static ?string $model = Revision::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::Inbox;

    protected static string|UnitEnum|null $navigationGroup = 'Caixa da IA';

    protected static ?int $navigationSort = 1;

    protected static ?string $modelLabel = 'proposta';

    protected static ?string $pluralModelLabel = 'propostas';

    protected static ?string $navigationLabel = 'Propostas a rever';

    private const STATES = [
        'pending' => 'À espera',
        'approved' => 'Aprovadas',
        'rejected' => 'Rejeitadas',
        'edited' => 'Editadas no painel',
    ];

    public static function getNavigationBadge(): ?string
    {
        $pending = Revision::query()->pending()->count();

        return $pending > 0 ? (string) $pending : null;
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('id', 'desc')
            ->columns([
                TextColumn::make('created_at')->label('Data')->dateTime('d/m/Y H:i')->sortable(),
                TextColumn::make('content_type')->label('Tipo')->formatStateUsing(fn (string $state): string => self::typeLabel($state)),
                TextColumn::make('slug')->label('Registo')->searchable()->description(fn (Revision $record): string => $record->isNewRow() ? 'novo' : ''),
                TextColumn::make('changes')->label('Campos')->state(fn (Revision $record): string => implode(', ', array_map(ContentLabels::column(...), array_keys($record->changes))))->wrap(),
                TextColumn::make('source_url')->label('Fonte')->limit(40)->url(fn (Revision $record): string => $record->source_url, shouldOpenInNewTab: true),
                TextColumn::make('author')->label('De')->state(fn (Revision $record): string => self::author($record)),
                TextColumn::make('status')->label('Estado')->badge()
                    ->formatStateUsing(fn (RevisionStatus $state): string => self::STATES[$state->value])
                    ->color(fn (RevisionStatus $state): string => match ($state) {
                        RevisionStatus::Pending => 'warning',
                        RevisionStatus::Approved, RevisionStatus::Edited => 'success',
                        RevisionStatus::Rejected => 'danger',
                    }),
            ])
            ->filters([
                SelectFilter::make('status')->label('Estado')->default(RevisionStatus::Pending->value)->options(self::STATES),
                SelectFilter::make('content_type')->label('Tipo')->options(
                    fn (): array => Revision::query()->distinct()->orderBy('content_type')->pluck('content_type')
                        ->mapWithKeys(fn (mixed $type): array => is_string($type) ? [$type => self::typeLabel($type)] : [])->all(),
                ),
            ])
            ->recordActions([
                Action::make('diff')->label('Ver diferença')->icon(Heroicon::Eye)
                    ->modalHeading(fn (Revision $record): string => self::typeLabel($record->content_type).': '.$record->slug)
                    ->modalWidth(Width::SevenExtraLarge)
                    ->modalSubmitAction(false)->modalCancelActionLabel('Fechar')
                    ->modalContent(fn (Revision $record): HtmlString => self::diff($record)),
                Action::make('approve')->label('Aprovar e publicar')->icon(Heroicon::Check)->color('success')
                    ->requiresConfirmation()
                    ->modalDescription('Os valores entram no registo, com a fonte, e o registo fica publicado.')
                    ->visible(fn (Revision $record): bool => self::reviewer()?->can('review', $record) === true && $record->status === RevisionStatus::Pending)
                    ->action(function (Revision $record): void {
                        self::review(fn (User $reviewer) => app(Revisions::class)->approve($record, $reviewer), 'Aprovada e publicada.');
                    }),
                Action::make('reject')->label('Rejeitar')->icon(Heroicon::XMark)->color('danger')
                    ->schema([Textarea::make('reason')->label('Porquê')->helperText('A IA aprende com o motivo.')->required()->rows(3)->maxLength(2000)])
                    ->visible(fn (Revision $record): bool => self::reviewer()?->can('review', $record) === true && $record->status === RevisionStatus::Pending)
                    ->action(function (Revision $record, array $data): void {
                        $reason = is_string($data['reason'] ?? null) ? $data['reason'] : '';
                        self::review(fn (User $reviewer) => app(Revisions::class)->reject($record, $reviewer, $reason), 'Rejeitada.');
                    }),
            ]);
    }

    /**
     * @return Builder<Revision>
     */
    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->with(['author:id,name']);
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function getPages(): array
    {
        return [
            'index' => ListRevisions::route('/'),
        ];
    }

    /**
     * The fields side by side, the words that change marked, all escaped: the AI's text is data, never HTML.
     */
    public static function diff(Revision $revision): HtmlString
    {
        $fields = [];
        foreach ($revision->changes as $field => $after) {
            $fields[] = [
                'label' => ContentLabels::column($field),
                ...TextDiff::words(self::show($revision->original[$field] ?? null), self::show($after)),
            ];
        }

        return new HtmlString(view('filament.revisions.diff', [
            'fields' => $fields,
            'revision' => $revision,
            'states' => self::STATES,
            'author' => self::author($revision),
        ])->render());
    }

    private static function typeLabel(string $type): string
    {
        return ContentTypes::exists($type) ? ContentTypes::label($type) : ContentLabels::column($type);
    }

    private static function author(Revision $record): string
    {
        return $record->ai_task_id !== null ? 'IA (pesquisa #'.$record->ai_task_id.')' : ($record->author->name ?? 'IA (MCP)');
    }

    private static function show(mixed $value): string
    {
        return match (true) {
            $value === null => '',
            is_bool($value) => $value ? 'sim' : 'não',
            is_string($value) && str_starts_with($value, Revisions::IMAGE_PREFIX) => '(imagem nova, à espera de aprovação)',
            is_scalar($value) => (string) $value,
            default => (string) json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT),
        };
    }

    private static function reviewer(): ?User
    {
        $user = Auth::user();

        return $user instanceof User ? $user : null;
    }

    /**
     * @param  callable(User): mixed  $work
     */
    private static function review(callable $work, string $done): void
    {
        $reviewer = self::reviewer();
        if ($reviewer === null) {
            return;
        }
        try {
            $work($reviewer);
            Notification::make()->title($done)->success()->send();
        } catch (InvalidProposal $refused) {
            Notification::make()->title('Não foi possível')->body($refused->getMessage())->danger()->send();
        }
    }
}
