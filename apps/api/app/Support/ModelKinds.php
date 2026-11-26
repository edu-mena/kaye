<?php

namespace App\Support;

use App\Models;
use App\Policies\AiTaskPolicy;
use App\Policies\CommentPolicy;
use App\Policies\MessagePolicy;
use App\Policies\RevisionPolicy;
use App\Policies\UserPolicy;

/**
 * Every model, by the kind of data it keeps. It decides the policy (AppServiceProvider) and the audit log: content
 * is logged on each change; personal data is not copied into the log (a copy would outlive the deletion of the
 * account). A test fails when a model is in neither list.
 */
final class ModelKinds
{
    /** The catalogue and what the team writes: `ContentPolicy`, logged by `LogsContentChanges`. */
    public const CONTENT = [
        Models\AccessExamQuestion::class,
        Models\Admission::class,
        Models\Agent::class,
        Models\Area::class,
        Models\AssessmentQuestion::class,
        Models\Career::class,
        Models\CareerGroup::class,
        Models\Company::class,
        Models\Course::class,
        Models\CourseOffer::class,
        Models\CvExample::class,
        Models\Dataset::class,
        Models\Figure::class,
        Models\FreeCourse::class,
        Models\Institution::class,
        Models\Internship::class,
        Models\InterviewQuestion::class,
        Models\JobPosting::class,
        Models\Kurso::class,
        Models\KursoExamQuestion::class,
        Models\KursoQuestionStat::class,
        Models\KursoUnit::class,
        Models\Mentor::class,
        Models\News::class,
        Models\NewsEvent::class,
        Models\Pathway::class,
        Models\Program::class,
        Models\Scholarship::class,
        Models\Simulation::class,
        Models\Skill::class,
        Models\SupportProgram::class,
        Models\Testimonial::class,
        Models\TuitionFee::class,
        Models\VideoStory::class,
    ];

    /** Rows about one person: `PersonalDataPolicy`, not logged. */
    public const PERSONAL = [
        Models\AreaMembership::class,
        Models\Consent::class,
        Models\Feedback::class,
        Models\Interview::class,
        Models\KursoCompletion::class,
        Models\MessageDelivery::class,
        Models\PublicCard::class,
        Models\UserData::class,
        Models\WaitlistEntry::class,
    ];

    /**
     * Models with a policy of their own. `Message` is logged (what the team sends); `Comment` and `User` are not
     * (their changes are people's data; role changes are logged by `AuditLog`).
     *
     * @var array<class-string, class-string>
     */
    public const OWN_POLICY = [
        Models\Message::class => MessagePolicy::class,
        Models\Comment::class => CommentPolicy::class,
        Models\User::class => UserPolicy::class,
        // The proposals are the history themselves; the tasks keep their own record (cost, status).
        Models\Revision::class => RevisionPolicy::class,
        Models\AiTask::class => AiTaskPolicy::class,
    ];
}
