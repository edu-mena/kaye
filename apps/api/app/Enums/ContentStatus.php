<?php

namespace App\Enums;

/**
 * Where a piece of content is in the editorial flow. The public API only shows Published.
 */
enum ContentStatus: string
{
    case Draft = 'draft';
    case Review = 'review';
    case Published = 'published';
}
