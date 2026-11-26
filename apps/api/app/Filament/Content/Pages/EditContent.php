<?php

namespace App\Filament\Content\Pages;

use App\Filament\Actions\ResearchWithAi;
use App\Filament\Content\ContentColumns;
use App\Filament\Content\ContentForm;
use App\Filament\Content\ContentResource;
use App\Filament\Content\ContentSaver;
use App\Filament\Content\ContentTable;
use App\Models\Revision;
use App\Support\ContentTypes;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Actions\RestoreAction;
use Filament\Resources\Pages\EditRecord;
use Filament\Support\Icons\Heroicon;
use Illuminate\Contracts\View\View;
use Illuminate\Database\Eloquent\Model;

/**
 * Editing a catalogue row: every language in its tab, "Ver na app", "Pesquisar com IA" and the row's history
 * (the proposals of the AI and the changes saved here).
 */
abstract class EditContent extends EditRecord
{
    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function mutateFormDataBeforeFill(array $data): array
    {
        return ContentForm::fill($this->getRecord(), $data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    protected function handleRecordUpdate(Model $record, array $data): Model
    {
        return ContentSaver::save($record, $data);
    }

    protected function getHeaderActions(): array
    {
        /** @var class-string<ContentResource> $resource */
        $resource = static::getResource();
        $model = $resource::getModel();
        $type = ContentTypes::ofModel($model);

        return array_values(array_filter([
            ContentTable::preview($resource),
            $type === null ? null : ResearchWithAi::make($type),
            Action::make('history')
                ->label('Histórico')
                ->icon(Heroicon::Clock)
                ->color('gray')
                ->modalHeading('Histórico do registo')
                ->modalSubmitAction(false)
                ->modalCancelActionLabel('Fechar')
                ->modalContent(fn (Model $record): View => view('filament.content.history', [
                    'revisions' => Revision::query()->where('revisable_type', $record->getMorphClass())
                        ->where('revisable_id', $record->getKey())->with(['author:id,name'])->latest('id')->limit(30)->get(),
                ])),
            DeleteAction::make(),
            ContentColumns::softDeletes($model) ? RestoreAction::make() : null,
        ]));
    }
}
