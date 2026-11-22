<?php

use App\Http\Controllers\Api\AccessExamController;
use App\Http\Controllers\Api\AdmissionController;
use App\Http\Controllers\Api\AreaController;
use App\Http\Controllers\Api\AssessmentController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\ConsentController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\CvExampleController;
use App\Http\Controllers\Api\DatasetController;
use App\Http\Controllers\Api\FeedbackController;
use App\Http\Controllers\Api\FigureController;
use App\Http\Controllers\Api\FreeCourseController;
use App\Http\Controllers\Api\IngestJobsController;
use App\Http\Controllers\Api\InstitutionController;
use App\Http\Controllers\Api\InternshipController;
use App\Http\Controllers\Api\InterviewController;
use App\Http\Controllers\Api\InterviewQuestionController;
use App\Http\Controllers\Api\KursoController;
use App\Http\Controllers\Api\MeController;
use App\Http\Controllers\Api\MeDataController;
use App\Http\Controllers\Api\MentorController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\OccupationController;
use App\Http\Controllers\Api\ProgramController;
use App\Http\Controllers\Api\PublicCardController;
use App\Http\Controllers\Api\PushSubscriptionController;
use App\Http\Controllers\Api\ScholarshipController;
use App\Http\Controllers\Api\SkillController;
use App\Http\Controllers\Api\SupportProgramController;
use App\Http\Controllers\Api\TestimonialController;
use App\Http\Controllers\Api\VideoStoryController;
use App\Http\Controllers\Api\WaitlistController;
use App\Http\Controllers\Auth\GoogleTokenController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\HealthController;
use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

// Everything here is served under /api/v1 (see bootstrap/app.php). The public reads: docs/arquitetura.md, section 6.

Route::get('/health', HealthController::class);

Route::get('/areas', [AreaController::class, 'index']);
Route::get('/career-groups', [AreaController::class, 'groups']);

Route::get('/occupations', [OccupationController::class, 'index']);
Route::get('/occupations/{slug}', [OccupationController::class, 'show']);
Route::get('/occupations/{slug}/cv-examples', [CvExampleController::class, 'index']);
Route::get('/occupations/{slug}/testimonials', [TestimonialController::class, 'index']);
Route::get('/cv-examples', [CvExampleController::class, 'index']);
Route::get('/testimonials', [TestimonialController::class, 'index']);
Route::get('/skills', [SkillController::class, 'index']);
Route::get('/support-programs', [SupportProgramController::class, 'index']);
Route::get('/programs', [ProgramController::class, 'index']);

Route::get('/institutions', [InstitutionController::class, 'index']);
Route::get('/institutions/{slug}', [InstitutionController::class, 'show']);
Route::get('/courses', [CourseController::class, 'index']);
Route::get('/courses/{slug}', [CourseController::class, 'show']);
Route::get('/companies', [CompanyController::class, 'index']);
Route::get('/companies/{slug}', [CompanyController::class, 'show']);

Route::get('/market/jobs', [DatasetController::class, 'show'])->defaults('dataset', 'jobs');
Route::get('/market/education', [DatasetController::class, 'show'])->defaults('dataset', 'education');
Route::get('/market/employment', [DatasetController::class, 'show'])->defaults('dataset', 'employment');
Route::get('/psychotech', [DatasetController::class, 'show'])->defaults('dataset', 'psychotech');
Route::get('/provinces', [DatasetController::class, 'show'])->defaults('dataset', 'provinces');

Route::get('/news', [NewsController::class, 'index']);
Route::get('/comments', [CommentController::class, 'index']);
Route::get('/scholarships', [ScholarshipController::class, 'index']);
Route::get('/internships', [InternshipController::class, 'index']);
Route::get('/free-courses', [FreeCourseController::class, 'index']);
Route::get('/admissions', [AdmissionController::class, 'index']);
Route::get('/figures', [FigureController::class, 'index']);

Route::get('/assessment', [AssessmentController::class, 'index']);
Route::get('/access-exams', [AccessExamController::class, 'index']);
Route::get('/interview-questions', [InterviewQuestionController::class, 'index']);
Route::get('/mentors', [MentorController::class, 'index']);
Route::get('/video-stories', [VideoStoryController::class, 'index']);

Route::get('/kursos', [KursoController::class, 'index']);
Route::get('/kursos/{slug}/units/{unit}', [KursoController::class, 'unit']);
Route::get('/kursos/{slug}/exam', [KursoController::class, 'exam']);

// Writes without an account, moved from the Vercel functions with the same answers (docs/arquitetura.md, 6).
// Each has its own hourly limit per IP (docs/seguranca.md), on top of the general one.
Route::post('/waitlist', [WaitlistController::class, 'store'])->middleware('throttle:waitlist');
Route::get('/waitlist/export', [WaitlistController::class, 'export']);
// The scrapers' facts, with INGEST_TOKEN (docs/arquitetura.md, 5.2).
Route::post('/ingest/jobs', [IngestJobsController::class, 'store']);
Route::post('/feedback', [FeedbackController::class, 'store'])->middleware('throttle:feedback');
Route::post('/interviews', [InterviewController::class, 'store'])->middleware('throttle:interviews');
Route::post('/public-cards', [PublicCardController::class, 'store'])->middleware('throttle:public-cards');
Route::get('/public-cards/{slug}', [PublicCardController::class, 'show']);

// The public VAPID key for Web Push (null while push is off).
Route::get('/push/key', [PushSubscriptionController::class, 'key']);
Route::put('/public-cards/{slug}', [PublicCardController::class, 'update'])->middleware('throttle:public-cards');
Route::delete('/public-cards/{slug}', [PublicCardController::class, 'destroy']);

// Accounts (docs/arquitetura.md, 5.1 and 6). These routes, and only these, start the web session:
// the public reads above stay without cookies, so they can be cached.
Route::middleware(EnsureFrontendRequestsAreStateful::class)->group(function (): void {
    Route::post('/auth/google', GoogleTokenController::class)->middleware('throttle:login');

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('/auth/logout', LogoutController::class);
        Route::get('/me', [MeController::class, 'show']);
        Route::post('/comments', [CommentController::class, 'store'])->middleware('throttle:comments');
        Route::post('/comments/{comment}/report', [CommentController::class, 'report'])->middleware('throttle:comments');
        Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);
        Route::get('/me/comments', [CommentController::class, 'mine']);
        Route::delete('/me', [MeController::class, 'destroy']);
        Route::get('/me/export', [MeController::class, 'export']);
        Route::get('/me/data', [MeDataController::class, 'show']);
        Route::put('/me/data', [MeDataController::class, 'update']);
        Route::post('/me/data/merge', [MeDataController::class, 'merge']);
        Route::get('/me/consents', [ConsentController::class, 'index']);
        Route::post('/me/consents', [ConsentController::class, 'store']);
        Route::delete('/me/consents/{kind}', [ConsentController::class, 'destroy']);
        Route::post('/me/push-subscriptions', [PushSubscriptionController::class, 'store']);
        Route::delete('/me/push-subscriptions', [PushSubscriptionController::class, 'destroy']);
    });
});
