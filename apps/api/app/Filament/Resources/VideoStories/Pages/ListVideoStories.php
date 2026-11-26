<?php

namespace App\Filament\Resources\VideoStories\Pages;

use App\Filament\Content\Pages\ListContent;
use App\Filament\Resources\VideoStories\VideoStoryResource;

class ListVideoStories extends ListContent
{
    protected static string $resource = VideoStoryResource::class;
}
