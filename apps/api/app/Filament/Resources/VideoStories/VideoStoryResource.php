<?php

namespace App\Filament\Resources\VideoStories;

use App\Filament\Content\ContentResource;
use App\Filament\Resources\VideoStories\Pages\CreateVideoStory;
use App\Filament\Resources\VideoStories\Pages\EditVideoStory;
use App\Filament\Resources\VideoStories\Pages\ListVideoStories;
use App\Models\VideoStory;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/**
 * "O meu dia como…" videos, with the consent of the person filmed.
 */
class VideoStoryResource extends ContentResource
{
    protected static ?string $model = VideoStory::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::VideoCamera;

    protected static string|UnitEnum|null $navigationGroup = 'Carreiras';

    protected static ?int $navigationSort = 8;

    protected static ?string $modelLabel = 'vídeo "O meu dia"';

    protected static ?string $pluralModelLabel = 'vídeos "O meu dia"';

    protected static ?string $areaRelation = 'career.group.area';

    protected static array $tableColumns = ['platform'];

    public static function previewPath(Model $record): ?string
    {
        return '/carreiras/'.static::slugOf($record->getRelationValue('career'));
    }

    public static function getPages(): array
    {
        return [
            'index' => ListVideoStories::route('/'),
            'create' => CreateVideoStory::route('/create'),
            'edit' => EditVideoStory::route('/{record}/edit'),
        ];
    }
}
