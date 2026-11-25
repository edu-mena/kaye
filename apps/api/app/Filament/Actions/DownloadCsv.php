<?php

namespace App\Filament\Actions;

use App\Models\WaitlistEntry;
use App\Support\AuditLog;
use App\Support\ListExport;
use Filament\Actions\Action;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Facades\Auth;

/**
 * "Descarregar CSV" on a list page of the panel: the same file as GET /api/v1/waitlist/export. Personal data:
 * only with `people.export`, and each download goes to the audit log.
 */
final class DownloadCsv
{
    public static function make(string $kind): Action
    {
        return Action::make('downloadCsv')
            ->label('Descarregar CSV')
            ->icon(Heroicon::ArrowDownTray)
            ->authorize(fn (): bool => Auth::user()?->can('export', WaitlistEntry::class) ?? false)
            ->action(function () use ($kind) {
                AuditLog::admin('csv_export', details: ['kind' => $kind, 'channel' => 'panel']);

                return ListExport::download($kind);
            });
    }
}
