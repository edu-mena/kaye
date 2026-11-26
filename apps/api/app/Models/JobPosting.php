<?php

namespace App\Models;

use App\Models\Concerns\LogsContentChanges;
use Database\Factories\JobPostingFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * The facts of a job post sent by the scrapers to /ingest/jobs. Only facts, never the text of the post, and never
 * shown as an announcement: they feed the Mercado counts. See `job_postings` in docs/base-de-dados.md.
 */
#[Guarded(['id'])]
class JobPosting extends Model
{
    /** @use HasFactory<JobPostingFactory> */
    use HasFactory, LogsContentChanges;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['date' => 'date', 'openings' => 'integer'];
    }
}
