<?php

namespace App\Http\Controllers\Api;

use App\Support\WeeklyJobs;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * GET /market/week: the job posts of the last 7 days and who posted most, counted live from `job_postings`
 * (WeeklyJobs), with the public reads' 5-minute cache and ETag.
 */
class MarketWeekController extends PublicController
{
    public function show(Request $request): Response
    {
        return $this->content->respond($request, fn (): array => WeeklyJobs::summary());
    }
}
