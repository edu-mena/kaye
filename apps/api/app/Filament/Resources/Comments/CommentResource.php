<?php

namespace App\Filament\Resources\Comments;

use App\Filament\Resources\Comments\Pages\ListComments;
use App\Models\Comment;
use App\Support\AuditLog;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use UnitEnum;

/**
 * Comments on news, companies and simulations (docs/base-de-dados.md, `comments`): the reported and the hidden
 * first, to hide, show again or delete. The author shows by first name only (many are minors), and the text never
 * changes here.
 *
 * @extends resource<Comment>
 */
class CommentResource extends Resource
{
    protected static ?string $model = Comment::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::ChatBubbleLeftEllipsis;

    protected static string|UnitEnum|null $navigationGroup = 'Moderação';

    protected static ?int $navigationSort = 1;

    protected static ?string $modelLabel = 'comentário';

    protected static ?string $pluralModelLabel = 'comentários';

    private const SUBJECTS = ['news' => 'Notícia', 'company' => 'Empresa', 'simulation' => 'Simulação'];

    public static function getNavigationBadge(): ?string
    {
        $hidden = Comment::query()->whereNotNull('hidden_at')->count();

        return $hidden > 0 ? (string) $hidden : null;
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('reports_count', 'desc')
            ->columns([
                TextColumn::make('created_at')->label('Data')->dateTime('d/m/Y H:i')->sortable(),
                TextColumn::make('subject')->label('Onde')
                    ->state(fn (Comment $record): string => (self::SUBJECTS[$record->subject_type] ?? $record->subject_type).': '.$record->subject_id),
                TextColumn::make('author')->label('Autor')
                    ->state(fn (Comment $record): string => self::firstName($record)),
                TextColumn::make('body')->label('Texto')->wrap()->searchable(),
                TextColumn::make('reports_count')->label('Denúncias')->sortable(),
                TextColumn::make('hidden_at')->label('Escondido')->since()->placeholder('Visível'),
            ])
            ->filters([
                Filter::make('reported')->label('Denunciados')->toggle()->query(fn (Builder $query): Builder => $query->where('reports_count', '>', 0)),
                Filter::make('hidden')->label('Escondidos')->toggle()->query(fn (Builder $query): Builder => $query->whereNotNull('hidden_at')),
                SelectFilter::make('subject_type')->label('Onde')->options(self::SUBJECTS),
            ])
            ->recordActions([
                Action::make('hide')->label('Esconder')->icon(Heroicon::EyeSlash)->color('danger')
                    ->requiresConfirmation()
                    ->visible(fn (Comment $record): bool => $record->hidden_at === null)
                    ->authorize(fn (Comment $record): bool => Auth::user()?->can('update', $record) ?? false)
                    ->action(function (Comment $record): void {
                        $record->update(['hidden_at' => now()]);
                        AuditLog::admin('comment_hidden', $record);
                    }),
                Action::make('show')->label('Mostrar outra vez')->icon(Heroicon::Eye)
                    ->requiresConfirmation()
                    ->modalDescription('O comentário volta a aparecer e as denúncias voltam a zero.')
                    ->visible(fn (Comment $record): bool => $record->hidden_at !== null)
                    ->authorize(fn (Comment $record): bool => Auth::user()?->can('update', $record) ?? false)
                    ->action(function (Comment $record): void {
                        $record->update(['hidden_at' => null, 'reports_count' => 0]);
                        AuditLog::admin('comment_shown', $record);
                    }),
                DeleteAction::make()->after(fn (Comment $record) => AuditLog::admin('comment_deleted', $record)),
            ]);
    }

    /**
     * @return Builder<Comment>
     */
    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->with(['user:id,name']);
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
            'index' => ListComments::route('/'),
        ];
    }

    /** The author as the app shows them to everyone: the first name. */
    private static function firstName(Comment $record): string
    {
        $name = $record->user->name ?? '';

        return $name === '' ? '(conta apagada)' : Str::before($name, ' ');
    }
}
