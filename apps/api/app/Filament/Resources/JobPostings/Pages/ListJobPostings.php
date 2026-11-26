<?php

namespace App\Filament\Resources\JobPostings\Pages;

use App\Filament\Content\Pages\ListContent;
use App\Filament\Resources\JobPostings\JobPostingResource;

class ListJobPostings extends ListContent
{
    protected static string $resource = JobPostingResource::class;
}
