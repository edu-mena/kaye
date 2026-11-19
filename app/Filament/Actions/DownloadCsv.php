<?php

namespace App\Filament\Actions;

use App\Support\ListExport;
use Filament\Actions\Action;
use Filament\Support\Icons\Heroicon;

/**
 * "Descarregar CSV" on a list page of the panel: the same file as GET /api/v1/waitlist/export.
 */
final class DownloadCsv
{
    public static function make(string $kind): Action
    {
        return Action::make('downloadCsv')
            ->label('Descarregar CSV')
            ->icon(Heroicon::ArrowDownTray)
            ->action(fn () => ListExport::download($kind));
    }
}
