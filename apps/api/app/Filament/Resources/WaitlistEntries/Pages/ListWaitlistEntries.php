<?php

namespace App\Filament\Resources\WaitlistEntries\Pages;

use App\Filament\Actions\DownloadCsv;
use App\Filament\Resources\WaitlistEntries\WaitlistEntryResource;
use Filament\Resources\Pages\ListRecords;

class ListWaitlistEntries extends ListRecords
{
    protected static string $resource = WaitlistEntryResource::class;

    protected function getHeaderActions(): array
    {
        return [DownloadCsv::make('waitlist')];
    }
}
