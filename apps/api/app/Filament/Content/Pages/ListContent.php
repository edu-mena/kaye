<?php

namespace App\Filament\Content\Pages;

use App\Filament\Actions\ResearchWithAi;
use App\Filament\Content\ContentResource;
use App\Support\ContentTypes;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

/**
 * The list of a catalogue table: create, and "Pesquisar com IA" for the types the AI writes.
 */
abstract class ListContent extends ListRecords
{
    protected function getHeaderActions(): array
    {
        $resource = static::getResource();
        $type = is_subclass_of($resource, ContentResource::class) ? ContentTypes::ofModel($resource::getModel()) : null;

        return $type === null ? [CreateAction::make()] : [CreateAction::make(), ResearchWithAi::make($type)];
    }
}
