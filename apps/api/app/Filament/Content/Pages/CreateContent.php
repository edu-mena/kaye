<?php

namespace App\Filament\Content\Pages;

use App\Filament\Content\ContentSaver;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;

/**
 * A new catalogue row: a draft until a reviewer publishes it, kept in the row's history.
 */
abstract class CreateContent extends CreateRecord
{
    /**
     * @param  array<string, mixed>  $data
     */
    protected function handleRecordCreation(array $data): Model
    {
        return ContentSaver::save(new ($this->getModel()), $data);
    }
}
