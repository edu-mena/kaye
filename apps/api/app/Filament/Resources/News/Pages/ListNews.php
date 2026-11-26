<?php

namespace App\Filament\Resources\News\Pages;

use App\Filament\Content\Pages\ListContent;
use App\Filament\Resources\News\NewsResource;

class ListNews extends ListContent
{
    protected static string $resource = NewsResource::class;
}
