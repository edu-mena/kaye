<?php

namespace App\Filament\RelationManagers;

use App\Filament\Content\RelationManagers\ChildrenRelationManager;
use App\Filament\Resources\VideoStories\VideoStoryResource;

class VideoStoriesRelationManager extends ChildrenRelationManager
{
    protected static string $relationship = 'videoStories';

    protected static string $childResource = VideoStoryResource::class;
}
