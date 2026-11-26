<?php

namespace App\Filament\Resources\Consents;

use App\Enums\ConsentKind;
use App\Filament\Resources\Consents\Pages\ListConsents;
use App\Models\Consent;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/**
 * The proof of each consent (Lei n.º 22/11, docs/legal.md): what was accepted, which version, where and when, and
 * whether it was withdrawn. Read only: a consent is given and withdrawn by the person. Who gave it shows as an
 * account or waiting-list number, never a contact.
 *
 * @extends resource<Consent>
 */
class ConsentResource extends Resource
{
    protected static ?string $model = Consent::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::ShieldCheck;

    protected static string|UnitEnum|null $navigationGroup = 'Comunicação';

    protected static ?int $navigationSort = 3;

    protected static ?string $modelLabel = 'consentimento';

    protected static ?string $pluralModelLabel = 'consentimentos';

    public const KINDS = [
        'terms' => 'Termos', 'privacy' => 'Privacidade', 'guardian_informed' => 'Encarregado informado',
        'email_service' => 'Email: avisos de serviço', 'email_marketing' => 'Email: novidades',
        'push_service' => 'Push: avisos de serviço', 'push_marketing' => 'Push: novidades',
        'whatsapp_marketing' => 'WhatsApp: novidades', 'community_count' => 'Contar na comunidade da área',
    ];

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('granted_at', 'desc')
            ->columns([
                TextColumn::make('granted_at')->label('Dado em')->dateTime('d/m/Y H:i')->sortable(),
                TextColumn::make('kind')->label('O quê')->formatStateUsing(fn (ConsentKind $state): string => self::KINDS[$state->value]),
                TextColumn::make('version')->label('Versão'),
                TextColumn::make('who')->label('Quem')->state(fn (Consent $record): string => $record->user_id !== null
                    ? "Conta #{$record->user_id}" : 'Lista de espera #'.$record->waitlist_id),
                TextColumn::make('source')->label('Onde')->placeholder('—'),
                TextColumn::make('confirmed_at')->label('Confirmado')->dateTime('d/m/Y')->placeholder('—'),
                TextColumn::make('revoked_at')->label('Retirado')->dateTime('d/m/Y')->placeholder('—'),
            ])
            ->filters([
                SelectFilter::make('kind')->label('O quê')->options(self::KINDS),
                TernaryFilter::make('active')->label('Em vigor')
                    ->queries(
                        true: fn (Builder $query): Builder => $query->whereNull('revoked_at'),
                        false: fn (Builder $query): Builder => $query->whereNotNull('revoked_at'),
                    ),
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

    public static function canDelete(Model $record): bool
    {
        return false;
    }

    public static function getPages(): array
    {
        return [
            'index' => ListConsents::route('/'),
        ];
    }
}
