<?php

namespace App\Filament\Resources\Courses\Pages;

use App\Filament\Content\Pages\ListContent;
use App\Filament\Resources\Courses\CourseResource;

class ListCourses extends ListContent
{
    protected static string $resource = CourseResource::class;
}
