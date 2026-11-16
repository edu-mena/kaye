<?php

use App\Http\Controllers\Api\AccessExamController;
use App\Http\Controllers\Api\AdmissionController;
use App\Http\Controllers\Api\AreaController;
use App\Http\Controllers\Api\AssessmentController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\CvExampleController;
use App\Http\Controllers\Api\DatasetController;
use App\Http\Controllers\Api\FigureController;
use App\Http\Controllers\Api\FreeCourseController;
use App\Http\Controllers\Api\InstitutionController;
use App\Http\Controllers\Api\InternshipController;
use App\Http\Controllers\Api\InterviewQuestionController;
use App\Http\Controllers\Api\KursoController;
use App\Http\Controllers\Api\MentorController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\OccupationController;
use App\Http\Controllers\Api\ProgramController;
use App\Http\Controllers\Api\ScholarshipController;
use App\Http\Controllers\Api\SkillController;
use App\Http\Controllers\Api\SupportProgramController;
use App\Http\Controllers\Api\TestimonialController;
use App\Http\Controllers\Api\VideoStoryController;
use App\Http\Controllers\HealthController;
use Illuminate\Support\Facades\Route;

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
