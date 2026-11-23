<?php

namespace App\Import;

use App\Enums\ContentStatus;
use App\Models\AccessExamQuestion;
use App\Models\Admission;
use App\Models\Agent;
use App\Models\Area;
use App\Models\AssessmentQuestion;
use App\Models\Career;
use App\Models\CareerGroup;
use App\Models\Company;
use App\Models\Course;
use App\Models\CourseOffer;
use App\Models\CvExample;
use App\Models\Dataset;
use App\Models\Figure;
use App\Models\FreeCourse;
use App\Models\Institution;
use App\Models\Internship;
use App\Models\InterviewQuestion;
use App\Models\Kurso;
use App\Models\KursoExamQuestion;
use App\Models\KursoUnit;
use App\Models\Mentor;
use App\Models\News;
use App\Models\NewsEvent;
use App\Models\Pathway;
use App\Models\Program;
use App\Models\Scholarship;
use App\Models\Simulation;
use App\Models\Skill;
use App\Models\SupportProgram;
use App\Models\Testimonial;
use App\Models\TuitionFee;
use App\Models\VideoStory;
use Closure;
use Illuminate\Database\Eloquent\Model;
use LogicException;

/**
 * Every resource of `kaye:import`, in the order the links need: which export file each reads and the columns it
 * writes (docs/base-de-dados.md, "Nomes que mudam do frontend para a base de dados"). career-traits is not
 * imported: the API computes it from the careers.
 */
final class Catalog
{
    /**
     * @return list<Target>
     */
    public static function resources(): array
    {
        $catalog = new self;

        return [
            $catalog->flat('areas', Area::class, 'areas', fn (Record $r): array => ['name' => $r->t('name')]),
            $catalog->flat('career-groups', CareerGroup::class, 'career-groups', fn (Record $r, Importer $i): array => [
                'area_id' => $i->id(Area::class, $r->string('area'), "career-groups {$r->string('id')}"),
                'name' => $r->t('name'),
            ]),
            $catalog->flat('skills', Skill::class, 'skills', fn (Record $r): array => ['name' => $r->t('name')]),
            $catalog->flat('support-programs', SupportProgram::class, 'support-programs', fn (Record $r): array => [
                'name' => $r->t('name'), 'audience' => $r->t('audience'), 'provider' => $r->get('provider'),
                'kind' => $r->get('kind'), 'min_age' => $r->get('minAge'), 'url' => $r->get('url'),
            ] + self::sourced($r)),
            $catalog->careers(),
            $catalog->pathways(),
            $catalog->flat('institutions', Institution::class, 'institutions', fn (Record $r): array => [
                'name' => $r->get('name'), 'type' => $r->get('type'), 'ownership' => $r->get('ownership'),
                'province' => $r->get('province'), 'place' => $r->get('place'), 'summary' => $r->t('summary'),
                'min_age' => $r->get('minAge'), 'logo' => $r->get('logo'), 'banner' => $r->get('banner'),
                'website' => $r->get('website'), 'phone' => $r->get('phone'), 'email' => $r->get('email'),
                'address' => $r->get('address'), 'maps_url' => $r->get('mapsUrl'), 'social' => $r->get('social'),
                'founded' => $r->get('founded'), 'recognized_by' => $r->get('recognizedBy'), 'example' => false,
            ] + self::sourced($r)),
            $catalog->exampleInstitutions(),
            $catalog->flat('courses', Course::class, 'courses', fn (Record $r): array => ['name' => $r->t('name')]),
            $catalog->courseOffers(),
            $catalog->tuitionFees(),
            $catalog->flat('companies', Company::class, 'companies', fn (Record $r): array => [
                'name' => $r->get('name'), 'sector' => $r->get('sector'), 'province' => $r->get('province'),
                'place' => $r->get('place'), 'summary' => $r->t('summary'), 'logo' => $r->get('logo'),
                'banner' => $r->get('banner'), 'website' => $r->get('website'),
                'logo_on_dark' => (bool) $r->get('logoOnDark', false), 'careers_sourced' => (bool) $r->get('careersSourced', false),
                'groups' => $r->get('areas', []), 'programs' => $r->t('programs'), 'activities' => $r->t('activities'),
                'activities_source' => $r->get('activitiesSource'), 'founded' => $r->get('founded'),
                'employees' => $r->get('employees'), 'socials' => $r->get('socials'), 'roles' => $r->t('roles'),
                'people' => $r->get('people'), 'insights' => $r->get('insights'), 'quotes' => $r->get('quotes'),
                'headquarters' => $r->get('headquarters'),
            ] + self::sourced($r), fn (Record $r, Importer $i): Closure => fn (Company $company): bool => self::any(
                $i->sync($company->careers(), self::ordered($i->ids(Career::class, $r->strings('careers'), "companies {$r->string('id')}"))),
                $i->sync($company->partners(), self::ordered($i->ids(Institution::class, $r->strings('partners'), "companies {$r->string('id')} (partners)"))),
            )),
            $catalog->flat('scholarships', Scholarship::class, 'scholarships', fn (Record $r, Importer $i): array => [
                'name' => $r->t('name'), 'provider' => $r->get('provider'),
                'company_id' => $i->id(Company::class, $r->optionalString('companyId'), "scholarships {$r->string('id')}"),
                'kind' => $r->get('kind'), 'destination' => $r->get('destination'), 'levels' => $r->get('levels', []),
                'areas' => $r->get('areas', []), 'covers' => $r->get('covers', []), 'min_age' => $r->get('minAge'),
                'max_age' => $r->get('maxAge'),
            ] + self::opportunity($r)),
            $catalog->flat('internships', Internship::class, 'internships', fn (Record $r, Importer $i): array => [
                'name' => $r->t('name'), 'provider' => $r->get('provider'),
                'company_id' => $i->id(Company::class, $r->optionalString('companyId'), "internships {$r->string('id')}"),
                'kind' => $r->get('kind'), 'areas' => $r->get('areas', []), 'audience' => $r->get('audience', []),
                'min_age' => $r->get('minAge'), 'max_age' => $r->get('maxAge'), 'paid' => $r->get('paid'),
                'duration_months' => $r->get('durationMonths'), 'province' => $r->get('province'),
            ] + self::opportunity($r)),
            $catalog->flat('free-courses', FreeCourse::class, 'free-courses', fn (Record $r): array => [
                'name' => $r->get('name'), 'provider' => $r->get('provider'), 'languages' => $r->get('languages', []),
                'areas' => $r->get('areas', []), 'hours' => $r->get('hours'), 'certificate' => $r->get('certificate'),
                'credential' => $r->get('credential'), 'price_usd' => $r->get('priceUsd'), 'level' => $r->get('level'),
                'url' => $r->get('url'),
            ] + self::sourced($r), self::careerLinks('free-courses', 'careerSlugs')),
            $catalog->flat('admissions', Admission::class, 'admissions', fn (Record $r, Importer $i): array => [
                'institution_id' => $i->id(Institution::class, $r->optionalString('academyId'), "admissions {$r->string('id')}"),
                'academic_year' => $r->get('year'), 'registration_start' => $r->get('registration.start'),
                'registration_end' => $r->get('registration.end'), 'exam_dates' => $r->get('examDates', []),
                'subjects' => $r->t('subjects'), 'requirements' => $r->t('requirements'), 'vacancies' => $r->get('vacancies'),
                'min_grade' => $r->get('minGrade'), 'min_grade_year' => $r->get('minGradeYear'), 'fee_aoa' => $r->get('fee'),
                'url' => $r->get('url'),
            ] + self::sourced($r), fn (Record $r, Importer $i): Closure => fn (Admission $admission): bool => $i->sync(
                $admission->courses(),
                self::ordered($i->ids(Course::class, $r->strings('courseIds'), "admissions {$r->string('id')}")),
            )),
            $catalog->flat('programs', Program::class, 'programs', fn (Record $r, Importer $i): array => [
                'institution_id' => $i->id(Institution::class, $r->string('institution.id'), "programs {$r->string('id')}"),
                'course_id' => $i->id(Course::class, $r->string('course.id'), "programs {$r->string('id')}"),
                'name' => $r->get('name'), 'level' => $r->get('level'), 'duration_months' => $r->get('durationMonths'),
                'schedule' => $r->get('schedule', []), 'total_cost' => $r->get('totalCost'),
                'recognized' => (bool) $r->get('recognized', false), 'rating_average' => $r->get('rating.average'),
                'rating_count' => $r->get('rating.count'), 'image' => $r->get('image'),
            ], self::careerLinks('programs', 'careers'), example: true),
            $catalog->flat('news', News::class, 'news', fn (Record $r): array => [
                'date' => $r->get('date'), 'kind' => $r->get('kind'), 'title' => $r->t('title'), 'summary' => $r->t('summary'),
                'body' => $r->t('body'), 'image' => $r->get('image'), 'to' => $r->get('to'), 'source' => $r->get('source'),
                'source_url' => $r->get('source.url'), 'example' => (bool) $r->get('example', false),
            ], fn (Record $r, Importer $i): Closure => fn (News $news): bool => self::any(
                $i->sync($news->careers(), self::ordered($i->ids(Career::class, $r->strings('careers'), "news {$r->string('id')}"))),
                $i->sync($news->companies(), self::ordered($i->ids(Company::class, $r->strings('companies'), "news {$r->string('id')}"))),
            )),
            $catalog->events(),
            $catalog->flat('figures', Figure::class, 'figures', fn (Record $r): array => [
                'name' => $r->get('name'), 'role' => $r->t('role'), 'why' => $r->t('why'), 'follow' => $r->get('follow'),
                'source' => $r->get('source'), 'source_url' => $r->get('source.url'), 'photo' => $r->get('photo'),
            ], self::careerLinks('figures', 'careers')),
            $catalog->flat('cv-examples', CvExample::class, 'cv-examples', function (Record $r, Importer $i): array {
                $career = $i->id(Career::class, $r->string('careerSlug'), "cv-examples {$r->string('id')}");

                return [
                    'career_id' => $career,
                    'pathway_id' => $career === null ? null : $i->id(Pathway::class, Importer::key($career, $r->string('pathwayId')), "cv-examples {$r->string('id')} ({$r->string('careerSlug')})"),
                    'seniority' => $r->get('seniority'), 'template' => $r->get('template'), 'why' => $r->t('why'),
                    'cv' => $r->t('cv'), 'notes' => $r->t('notes'),
                ];
            }),
            $catalog->flat('testimonials', Testimonial::class, 'testimonials', fn (Record $r, Importer $i): array => [
                'career_id' => $i->id(Career::class, $r->string('careerSlug'), "testimonials {$r->string('id')}"),
                'company_id' => $i->id(Company::class, $r->optionalString('companyId'), "testimonials {$r->string('id')}"),
                'name' => $r->get('name'), 'role' => $r->t('role'), 'path' => $r->t('path'), 'tip' => $r->t('tip'),
                'place' => $r->get('place'), 'years' => $r->get('years'), 'source' => $r->get('source'),
                'source_url' => $r->get('source.url'), 'example' => (bool) $r->get('example', false),
            ]),
            $catalog->flat('mentors', Mentor::class, 'mentors', fn (Record $r): array => [
                'name' => $r->get('name'), 'role' => $r->get('role'), 'company' => $r->get('company'), 'bio' => $r->t('bio'),
                'languages' => $r->get('languages', []), 'photo' => $r->get('photo'), 'consent_at' => $r->get('consentAt'),
                'availability' => $r->get('availability'),
            ], self::careerLinks('mentors', 'careers')),
            $catalog->flat('agents', Agent::class, 'agents', fn (Record $r): array => [
                'name' => $r->get('name'), 'role' => $r->get('role'), 'area' => $r->get('area'),
                'verified_by' => $r->get('verifiedBy'), 'verified_at' => $r->get('verifiedAt'), 'company' => $r->get('company'),
                'photo' => $r->get('photo'), 'consent_at' => $r->get('consentAt'),
            ]),
            $catalog->flat('simulations', Simulation::class, 'simulations', fn (Record $r, Importer $i): array => [
                'career_id' => $i->id(Career::class, $r->string('careerSlug'), "simulations {$r->string('id')}"),
                'agent_id' => $i->id(Agent::class, $r->optionalString('agentId'), "simulations {$r->string('id')}"),
                'title' => $r->t('title'), 'intro' => $r->t('intro'), 'minutes' => $r->get('minutes'),
                'moments' => $r->t('moments'), 'asks' => $r->t('asks'), 'next_steps' => $r->t('next'),
                'example' => (bool) $r->get('example', false), 'languages' => $r->get('languages', ['pt']),
            ], keepExamples: true),
            $catalog->flat('video-stories', VideoStory::class, 'video-stories', fn (Record $r, Importer $i): array => [
                'career_id' => $i->id(Career::class, $r->string('careerSlug'), "video-stories {$r->string('id')}"),
                'name' => $r->get('name'), 'role' => $r->get('role'), 'company' => $r->get('company'), 'title' => $r->t('title'),
                'url' => $r->get('url'), 'platform' => $r->get('platform'), 'duration_seconds' => $r->get('durationSeconds'),
                'thumbnail' => $r->get('thumbnail'), 'consent_at' => $r->get('consentAt'), 'recorded_at' => $r->get('recordedAt'),
            ]),
            $catalog->flat('assessment-questions', AssessmentQuestion::class, 'assessment-questions', fn (Record $r): array => [
                'kind' => $r->get('kind', 'statement'), 'dimension' => $r->get('dimension'), 'context' => $r->get('context'),
                'text' => $r->t('text'), 'options' => $r->t('options'),
            ]),
            $catalog->flat('access-exam-questions', AccessExamQuestion::class, 'access-exam-questions', fn (Record $r): array => [
                'subject' => $r->get('subject'), 'topic' => $r->get('topic'), 'level' => $r->get('level'),
                'passage' => $r->get('passage'), 'text' => $r->get('text'), 'options' => $r->get('options', []),
                'answer' => $r->get('answer'), 'explanation' => $r->get('explanation'),
            ]),
            $catalog->flat('interview-questions', InterviewQuestion::class, 'interview-questions', fn (Record $r): array => [
                'area' => $r->get('area'), 'text' => $r->t('text'), 'goal' => $r->t('goal'), 'model' => $r->t('model'),
                'mistakes' => $r->t('mistakes'),
            ]),
            $catalog->kursos(),
            $catalog->kursoUnits(),
            $catalog->kursoExamQuestions(),
            $catalog->datasets(),
        ];
    }

    /**
     * A resource with one row per record of one file.
     *
     * @template TModel of Model
     *
     * @param  class-string<TModel>  $model
     * @param  Closure(Record, Importer): array<string, mixed>  $values
     * @param  (Closure(Record, Importer): (Closure(TModel): bool))|null  $links
     * @param  bool  $example  every record is made up: it stays a draft
     * @param  bool  $keepExamples  records marked `example` are published anyway (the app shows the mark): simulations
     */
    private function flat(string $name, string $model, string $file, Closure $values, ?Closure $links = null, bool $example = false, bool $keepExamples = false): Target
    {
        return new Target($name, $model, function (Importer $importer) use ($model, $file, $values, $links, $example, $keepExamples): iterable {
            foreach ($importer->files->records($file) as $record) {
                yield new Row(
                    self::common($record) + $values($record, $importer),
                    self::status($example || (! $keepExamples && $record->get('example') === true)),
                    $links === null ? null : self::on($model, $links($record, $importer)),
                );
            }
        });
    }

    /**
     * The careers list, with the curated guide of each (career-details) when it has one.
     */
    private function careers(): Target
    {
        return new Target('careers', Career::class, function (Importer $importer): iterable {
            $details = [];
            foreach ($importer->files->records('career-details') as $detail) {
                $details[$detail->string('slug')] = $detail;
            }
            $skillNames = [];
            foreach ($importer->files->records('skills') as $skill) {
                $skillNames[$skill->string('id')] = $skill->t('name')->stored();
            }
            foreach ($importer->files->records('careers') as $r) {
                $slug = $r->string('slug');
                $d = $details[$slug] ?? null;
                yield new Row(['slug' => $slug, 'position' => $r->get('position', 0),
                    'career_group_id' => $importer->id(CareerGroup::class, $r->string('group'), "careers {$slug}"),
                    'name' => $r->t('name'), 'summary' => $r->t('summary'), 'riasec' => $r->get('riasec'),
                    'demand' => $r->get('demand'), 'salary_median' => $r->get('salaryMedian'),
                    'salary_kind' => $r->get('salaryKind'), 'detailed' => (bool) $r->get('detailed', false),
                    'image' => $r->get('image'), 'description' => $d?->t('description'), 'day_to_day' => $d?->t('dayToDay'),
                    'work_context' => $d?->t('workContext'), 'work_styles' => $d?->t('workStyles'),
                    'employer_asks' => $d?->get('employerAsks'), 'stages' => $d?->t('stages'), 'market' => $d?->t('market'),
                    'cv_guide' => $d?->t('cvGuide'), 'self_employment' => $d?->t('selfEmployment'),
                ], self::status(false), self::on(Career::class, function (Career $career) use ($importer, $d, $slug, $skillNames): bool {
                    $skills = [];
                    foreach ($d?->children('skills') ?? [] as $position => $skill) {
                        $id = $importer->id(Skill::class, $skill->string('id'), "careers {$slug}");
                        $name = $skill->t('name')->stored();
                        if ($id !== null) {
                            // The career's own name for the skill, only when it is not the skill's name.
                            $skills[$id] = ['importance' => $skill->get('importance'), 'position' => $position,
                                'name' => $name === ($skillNames[$skill->string('id')] ?? null) ? null : json_encode($name, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
                            ];
                        }
                    }

                    return $importer->sync($career->skills(), $skills);
                }));
                unset($details[$slug]);
            }
            foreach (array_keys($details) as $slug) {
                $importer->problem("career-details {$slug} is not in careers.json");
            }
        });
    }

    private function pathways(): Target
    {
        return new Target('pathways', Pathway::class, function (Importer $importer): iterable {
            foreach ($importer->files->records('career-details') as $career) {
                $careerId = $importer->id(Career::class, $career->string('slug'), "pathways of {$career->string('slug')}");
                foreach ($career->children('pathways') as $position => $p) {
                    yield new Row(['career_id' => $careerId, 'slug' => $p->string('id'), 'position' => $position,
                        'estimated' => (bool) $p->get('estimated', false), 'name' => $p->t('name'),
                        'summary' => $p->t('summary'), 'steps' => $p->t('steps'),
                        'total_cost_min' => $p->get('totalCost.min'), 'total_cost_max' => $p->get('totalCost.max'),
                    ], self::status(false));
                }
            }
        }, ['career_id', 'slug']);
    }

    /**
     * The made-up "Exemplo" institutions the programs point to: drafts, never shown in production.
     */
    private function exampleInstitutions(): Target
    {
        return new Target('example-institutions', Institution::class, function (Importer $importer): iterable {
            $seen = [];
            foreach ($importer->files->records('programs') as $program) {
                $slug = $program->string('institution.id');
                if (isset($seen[$slug])) {
                    continue;
                }
                $seen[$slug] = true;
                yield new Row(['slug' => $slug, 'name' => $program->get('institution.name'),
                    'type' => $program->get('institution.type'), 'ownership' => $program->get('institution.ownership'),
                    'province' => $program->get('institution.province'), 'logo' => $program->get('institution.logo'),
                    'place' => $program->get('institution.province'), 'summary' => $program->t('institution.name'),
                    'sources' => [], 'example' => true,
                ], self::status(true));
            }
        });
    }

    private function courseOffers(): Target
    {
        return new Target('course-offers', CourseOffer::class, function (Importer $importer): iterable {
            $courseNames = [];
            foreach ($importer->files->records('courses') as $course) {
                $courseNames[$course->string('id')] = $course->t('name')->stored();
            }
            foreach ($importer->files->records('institutions') as $institution) {
                $institutionId = $importer->id(Institution::class, $institution->string('id'), "course-offers of {$institution->string('id')}");
                foreach ($institution->children('offers') as $position => $o) {
                    $slug = self::offerSlug($institution, $o);
                    $courseName = $o->t('course.name');
                    yield new Row(['slug' => $slug, 'position' => $position, 'institution_id' => $institutionId,
                        'course_id' => $importer->id(Course::class, $o->string('course.id'), "course-offers {$slug}"),
                        // Only when the institution names the course differently (null: the course's own name).
                        'course_name' => $courseName->stored() === ($courseNames[$o->string('course.id')] ?? null) ? null : $courseName,
                        'name' => $o->t('name'), 'level' => $o->get('level'), 'faculty' => $o->get('faculty'),
                        'recognition' => $o->get('recognition'), 'groups' => $o->get('areas', []),
                        'students' => $o->get('students'), 'graduates' => $o->get('graduates'), 'year' => $o->get('year'),
                        'curriculum' => $o->t('curriculum'), 'duration_months' => $o->get('durationMonths'),
                        'schedule' => $o->get('schedule'), 'estimated' => (bool) $o->get('estimated', false),
                    ], self::status(false), self::on(CourseOffer::class, fn (CourseOffer $offer): bool => $importer->sync(
                        $offer->careers(),
                        self::ordered($importer->ids(Career::class, $o->strings('careers'), "course-offers {$slug}")),
                    )));
                }
            }
        });
    }

    /**
     * A fee of one offer (basis course), or the average of an institution's licenciaturas (basis average),
     * which the export repeats on each of them: stored once, without an offer.
     */
    private function tuitionFees(): Target
    {
        return new Target('tuition-fees', TuitionFee::class, function (Importer $importer): iterable {
            foreach ($importer->files->records('institutions') as $institution) {
                $slug = $institution->string('id');
                $averages = [];
                foreach ($institution->children('offers') as $o) {
                    if (! $o->has('fee')) {
                        continue;
                    }
                    $average = $o->get('fee.basis') === 'average';
                    $offerId = $average ? null : $importer->id(CourseOffer::class, self::offerSlug($institution, $o), "tuition-fees {$slug}");
                    $row = ['institution_id' => $importer->id(Institution::class, $slug, "tuition-fees {$slug}"),
                        'course_offer_id' => $offerId, 'monthly_aoa' => $o->get('fee.monthly'), 'basis' => $o->get('fee.basis'),
                        'academic_year' => $o->get('fee.year'), 'source' => $o->get('fee.source'),
                    ];
                    if ($average) {
                        $averages[json_encode($row, JSON_THROW_ON_ERROR)] = $row;
                    } else {
                        yield new Row($row);
                    }
                }
                if (count($averages) > 1) {
                    $importer->problem("tuition-fees {$slug}: the average fee differs between offers");
                }
                foreach ($averages as $row) {
                    yield new Row($row);
                }
            }
        }, ['institution_id', 'course_offer_id', 'academic_year']);
    }

    private function events(): Target
    {
        return new Target('events', NewsEvent::class, function (Importer $importer): iterable {
            foreach ($importer->files->records('news') as $news) {
                if (! $news->has('event')) {
                    continue;
                }
                yield new Row([
                    'news_id' => $importer->id(News::class, $news->string('id'), "events {$news->string('id')}"),
                    'starts_on' => $news->get('event.starts'), 'ends_on' => $news->get('event.ends'),
                    'time' => $news->get('event.time'), 'venue' => $news->get('event.venue'), 'city' => $news->get('event.city'),
                    'formats' => $news->get('event.formats', []), 'free' => (bool) $news->get('event.free', false),
                    'price' => $news->get('event.price'), 'organizer' => $news->get('event.organizer'),
                    'register' => $news->get('event.register'), 'unconfirmed' => (bool) $news->get('event.unconfirmed', false),
                ]);
            }
        }, ['news_id']);
    }

    /**
     * The Kursos and the ones announced as "Em breve" (their body is the subtitle).
     */
    private function kursos(): Target
    {
        return new Target('kursos', Kurso::class, function (Importer $importer): iterable {
            foreach ($importer->files->records('kursos') as $r) {
                yield new Row(self::common($r) + ['title' => $r->t('title'), 'subtitle' => $r->t('subtitle'),
                    'audience' => $r->t('audience'), 'level' => $r->get('level'), 'lang' => $r->get('lang'),
                    'icon' => $r->get('icon'), 'tone' => $r->get('tone'), 'goals' => $r->t('goals'),
                    'credits' => $r->get('credits'), 'announced' => false,
                ], self::status(false));
            }
            foreach ($importer->files->records('kursos-announced') as $r) {
                yield new Row(self::common($r) + ['title' => $r->t('title'), 'subtitle' => $r->t('body'),
                    'icon' => $r->get('icon'), 'announced' => true,
                ], self::status(false));
            }
        });
    }

    private function kursoUnits(): Target
    {
        return new Target('kurso-units', KursoUnit::class, function (Importer $importer): iterable {
            foreach ($importer->files->records('kursos') as $kurso) {
                $kursoId = $importer->id(Kurso::class, $kurso->string('id'), "kurso-units of {$kurso->string('id')}");
                foreach ($kurso->children('units') as $position => $u) {
                    yield new Row(['kurso_id' => $kursoId, 'slug' => $u->string('id'), 'position' => $position,
                        'number' => $u->get('number'), 'title' => $u->get('title'), 'summary' => $u->get('summary'),
                        'outline' => $u->get('lessons'), 'content' => $u->get('content'),
                    ], self::status(false));
                }
            }
        }, ['kurso_id', 'slug']);
    }

    private function kursoExamQuestions(): Target
    {
        return new Target('kurso-exam-questions', KursoExamQuestion::class, function (Importer $importer): iterable {
            foreach ($importer->files->records('kursos') as $kurso) {
                $where = "kurso-exam-questions of {$kurso->string('id')}";
                $kursoId = $importer->id(Kurso::class, $kurso->string('id'), $where);
                foreach ($kurso->children('exam') as $position => $q) {
                    yield new Row(['kurso_id' => $kursoId, 'slug' => $q->string('id'), 'position' => $position,
                        'kurso_unit_id' => $kursoId === null ? null : $importer->id(KursoUnit::class, Importer::key($kursoId, $q->string('unit')), "{$where} ({$q->string('id')})"),
                        'kind' => $q->get('kind'), 'prompt' => $q->get('prompt'), 'options' => $q->get('options'),
                        'answer' => $q->get('answer'), 'answers' => $q->get('answers'),
                    ], self::status(false));
                }
            }
        }, ['kurso_id', 'slug']);
    }

    /**
     * The documents read whole: the Mercado figures, the psychotechnical lists and the provinces.
     */
    private function datasets(): Target
    {
        $files = ['jobs' => 'market-jobs', 'education' => 'market-education', 'employment' => 'market-employment',
            'psychotech' => 'psychotech', 'provinces' => 'provinces'];

        return new Target('datasets', Dataset::class, function (Importer $importer) use ($files): iterable {
            foreach (array_keys($files) as $position => $slug) {
                $data = $importer->files->document($files[$slug]);
                $updated = is_array($data) && is_string($data['updated'] ?? null) ? $data['updated'].' 00:00:00' : null;
                yield new Row(['slug' => $slug, 'position' => $position, 'data' => $data, 'computed_at' => $updated], self::status(false));
            }
        });
    }

    /**
     * @return Closure(Record, Importer): (Closure(FreeCourse|Program|Figure|Mentor): bool)
     */
    private static function careerLinks(string $name, string $field): Closure
    {
        return fn (Record $r, Importer $i): Closure => fn (FreeCourse|Program|Figure|Mentor $model): bool => $i->sync(
            $model->careers(),
            self::ordered($i->ids(Career::class, $r->strings($field), "{$name} {$r->string('id')}")),
        );
    }

    /**
     * @return array<string, mixed>
     */
    private static function common(Record $r): array
    {
        return ['slug' => $r->string('id'), 'position' => $r->get('position', 0), 'estimated' => (bool) $r->get('estimated', false)];
    }

    /**
     * @return array<string, mixed>
     */
    private static function sourced(Record $r): array
    {
        return [
            'sources' => $r->get('sources', []),
            'source_url' => $r->get('sources.0.url'),
            'source_checked_at' => $r->get('checkedAt'),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function opportunity(Record $r): array
    {
        return ['requirements' => $r->t('requirements'), 'deadline' => $r->get('deadline'),
            'recurring' => (bool) $r->get('recurring', false), 'url' => $r->get('url'),
        ] + self::sourced($r);
    }

    /**
     * @return array{status: ContentStatus}
     */
    private static function status(bool $example): array
    {
        return ['status' => $example ? ContentStatus::Draft : ContentStatus::Published];
    }

    /**
     * @param  list<int>  $ids
     * @return array<int, array{position: int}>
     */
    private static function ordered(array $ids): array
    {
        $ordered = [];
        foreach ($ids as $position => $id) {
            $ordered[$id] = ['position' => $position];
        }

        return $ordered;
    }

    /**
     * The links of one model: the row the importer saved is always of the resource's model.
     *
     * @template TModel of Model
     *
     * @param  class-string<TModel>  $model
     * @param  Closure(TModel): bool  $links
     * @return Closure(Model): bool
     */
    private static function on(string $model, Closure $links): Closure
    {
        return fn (Model $row): bool => $row instanceof $model
            ? $links($row)
            : throw new LogicException("Links for {$model} got a ".$row::class);
    }

    /**
     * True when any of the syncs changed something (all of them run).
     */
    private static function any(bool ...$changes): bool
    {
        return in_array(true, $changes, true);
    }

    private static function offerSlug(Record $institution, Record $offer): string
    {
        return "{$institution->string('id')}--{$offer->string('course.id')}--{$offer->string('level')}";
    }
}
