<?php

namespace App\Filament\Resources\JobPostings\Pages;

use App\Filament\Content\Pages\CreateContent;
use App\Filament\Resources\JobPostings\JobPostingResource;

class CreateJobPosting extends CreateContent
{
    protected static string $resource = JobPostingResource::class;
}
