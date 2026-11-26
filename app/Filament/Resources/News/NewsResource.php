<?php

namespace App\Filament\Resources\News;

use App\Filament\Content\ContentResource;
use App\Filament\RelationManagers\LinkedAreasRelationManager;
use App\Filament\RelationManagers\LinkedCareersRelationManager;
use App\Filament\RelationManagers\LinkedCompaniesRelationManager;
use App\Filament\RelationManagers\LinkedInstitutionsRelationManager;
use App\Filament\Resources\News\Pages\CreateNews;
use App\Filament\Resources\News\Pages\EditNews;
use App\Filament\Resources\News\Pages\ListNews;
use App\Models\News;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/**
 * News, written by the team or collected from the feeds.
 */
class NewsResource extends ContentResource
{
    protected static ?string $model = News::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::Newspaper;

    protected static string|UnitEnum|null $navigationGroup = 'Novidades';

    protected static ?int $navigationSort = 1;

    protected static ?string $modelLabel = 'notícia';

    protected static ?string $pluralModelLabel = 'notícias';

    protected static ?string $areaRelation = 'areas';

    protected static array $tableColumns = ['date', 'kind'];

    public static function previewPath(Model $record): ?string
    {
        return '/novidades/'.static::slugOf($record);
    }

    public static function getRelations(): array
    {
        return [
            LinkedCareersRelationManager::class,
            LinkedCompaniesRelationManager::class,
            LinkedAreasRelationManager::class,
            LinkedInstitutionsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListNews::route('/'),
            'create' => CreateNews::route('/create'),
            'edit' => EditNews::route('/{record}/edit'),
        ];
    }
}
