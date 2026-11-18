<?php

namespace App\Filament\Resources\WaitlistEntries;

use App\Filament\Resources\WaitlistEntries\Pages\ListWaitlistEntries;
use App\Models\WaitlistEntry;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

/**
 * The waiting list, to read and download. Nobody edits it by hand: people join from the site.
 *
 * @extends resource<WaitlistEntry>
 */
class WaitlistEntryResource extends Resource
{
    protected static ?string $model = WaitlistEntry::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::InboxStack;

    protected static ?string $modelLabel = 'inscrição';

    protected static ?string $pluralModelLabel = 'lista de espera';

    protected static ?string $navigationLabel = 'Lista de espera';

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                TextColumn::make('created_at')->label('Data')->dateTime('d/m/Y H:i')->sortable(),
                TextColumn::make('name')->label('Nome')->searchable(),
                TextColumn::make('email')->label('Email')->searchable(),
                TextColumn::make('whatsapp')->label('WhatsApp')->searchable(),
                TextColumn::make('source')->label('Origem')->badge(),
                TextColumn::make('locale')->label('Língua'),
            ]);
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
            'index' => ListWaitlistEntries::route('/'),
        ];
    }
}
