<?php

namespace App\Filament\Actions;

use App\Models\AiTask;
use App\Models\User;
use App\Support\AiTasks;
use App\Support\ContentTypes;
use App\Support\InvalidProposal;
use Filament\Actions\Action;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

/**
 * "Pesquisar com IA" on a type (the list's header), or on one row (each row of the catalogue lists and its edit
 * page): the task goes to the queue; what it finds becomes proposals in the "Caixa da IA".
 */
final class ResearchWithAi
{
    public static function make(?string $type = null, ?string $slug = null): Action
    {
        return Action::make('researchWithAi')
            ->label('Pesquisar com IA')
            ->icon(Heroicon::Sparkles)
            ->authorize(fn (): bool => Auth::user()?->can('create', AiTask::class) ?? false)
            ->schema([
                Select::make('type')->label('Tipo')->required()->default($type)->disabled($type !== null)
                    ->options(array_combine(ContentTypes::keys(), array_map(ContentTypes::label(...), ContentTypes::keys()))),
                TextInput::make('slug')->label('Registo (slug)')
                    ->default(fn (?Model $record): ?string => $slug ?? self::slugOf($record))
                    ->disabled(fn (?Model $record): bool => $slug !== null || $record !== null)
                    ->helperText('Vazio: a IA escolhe os registos a que faltam dados.'),
                Textarea::make('prompt')->label('O que pesquisar')->required()->rows(4)->minLength(5)->maxLength(2000)
                    ->placeholder('Completa os contactos das universidades de Luanda.'),
            ])
            ->action(function (array $data, ?Model $record) use ($type, $slug): void {
                $user = Auth::user();
                if (! $user instanceof User) {
                    return;
                }
                try {
                    $task = AiTasks::request(
                        $user,
                        $type ?? (is_string($data['type'] ?? null) ? $data['type'] : ''),
                        $slug ?? self::slugOf($record) ?? (is_string($data['slug'] ?? null) && $data['slug'] !== '' ? $data['slug'] : null),
                        is_string($data['prompt'] ?? null) ? $data['prompt'] : '',
                    );
                    Notification::make()->title("Pesquisa #{$task->id} na fila")->body('O resultado aparece na "Caixa da IA".')->success()->send();
                } catch (InvalidProposal $refused) {
                    Notification::make()->title('Não foi possível')->body($refused->getMessage())->danger()->send();
                }
            });
    }

    private static function slugOf(?Model $record): ?string
    {
        $slug = $record?->getAttribute('slug');

        return is_string($slug) ? $slug : null;
    }
}
