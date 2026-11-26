<?php

namespace App\Filament\Pages;

use Filament\Pages\Dashboard as BaseDashboard;

/**
 * "Painel inicial": the waiting list, the deliveries, the AI's inbox and cost, the rows by state, the missing
 * fields by area and the system's health (the widgets in App\Filament\Widgets, each for who may see it).
 */
class Dashboard extends BaseDashboard
{
    protected static ?string $title = 'Painel inicial';

    protected static ?string $navigationLabel = 'Painel inicial';

    public function getColumns(): int|array
    {
        return 1;
    }
}
