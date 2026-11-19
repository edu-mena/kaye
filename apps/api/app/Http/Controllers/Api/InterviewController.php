<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Interview;
use App\Support\Contact;
use App\Support\Submission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Throwable;

/**
 * POST /interviews: an interview practice sent for review (value offer, 2.2.1). The Kayé team reads it and gets
 * in touch; there is no result in the app yet. Unknown fields are dropped.
 */
class InterviewController extends Controller
{
    private const MAX_BODY = 60_000;

    private const MAX_ANSWER = 4_000;

    private const MAX_ANSWERS = 12;

    public function store(Request $request): JsonResponse
    {
        $body = Submission::read($request, self::MAX_BODY);
        $interview = $body === null ? null : self::clean($body);
        if ($interview === null) {
            return Submission::invalid();
        }
        $saved = Interview::query()->create([...$interview, 'public_id' => Submission::randomId()]);

        return Submission::json(['id' => $saved->public_id], 201);
    }

    /**
     * @param  array<string, mixed>  $body
     * @return array{area: string, career_slug: ?string, career_name: ?string, locale: string, started_at: Carbon, candidate: array<string, mixed>, answers: list<array<string, mixed>>}|null
     */
    private static function clean(array $body): ?array
    {
        $area = $body['area'] ?? null;
        $locale = $body['locale'] ?? null;
        if (! Submission::text($area, 30) || preg_match('/^[a-z_]{2,30}$/', $area) !== 1) {
            return null;
        }
        if (! Submission::text($locale, 2) || preg_match('/^(pt|en|fr)$/', $locale) !== 1) {
            return null;
        }
        $startedAt = self::date($body['startedAt'] ?? null);
        $career = self::career($body['career'] ?? null);
        $candidate = self::candidate($body['candidate'] ?? null);
        $answers = self::answers($body['answers'] ?? null);
        if ($startedAt === null || $career === false || $candidate === null || $answers === null) {
            return null;
        }

        return [
            'area' => $area,
            'career_slug' => $career['slug'] ?? null,
            'career_name' => $career['name'] ?? null,
            'locale' => $locale,
            'started_at' => $startedAt,
            'candidate' => $candidate,
            'answers' => $answers,
        ];
    }

    private static function date(mixed $value): ?Carbon
    {
        if (! Submission::text($value, 40)) {
            return null;
        }
        try {
            return Carbon::parse($value);
        } catch (Throwable) {
            return null;
        }
    }

    /**
     * The profession, when the interview was built from one: null if absent, false if invalid.
     *
     * @return array{slug: string, name: string}|false|null
     */
    private static function career(mixed $value): array|false|null
    {
        if ($value === null) {
            return null;
        }
        if (! is_array($value)) {
            return false;
        }
        $slug = $value['slug'] ?? null;
        $name = $value['name'] ?? null;

        return Submission::text($slug, 120) && preg_match('/^[a-z0-9-]+$/', $slug) === 1 && Submission::text($name, 120)
            ? ['slug' => $slug, 'name' => $name]
            : false;
    }

    /**
     * Who to contact: a name, a birth year (never the date), an email or a number, and whether a guardian knows.
     *
     * @return array<string, mixed>|null
     */
    private static function candidate(mixed $value): ?array
    {
        if (! is_array($value)) {
            return null;
        }
        $name = $value['name'] ?? null;
        $contact = $value['contact'] ?? null;
        $birthYear = $value['birthYear'] ?? null;
        $province = $value['province'] ?? null;
        $education = $value['education'] ?? null;
        $guardianInformed = $value['guardianInformed'] ?? null;
        if (! Submission::text($name, 80) || ! Submission::text($contact, 120)) {
            return null;
        }
        if (! Contact::isEmail($contact) && ! Contact::isPhone((string) preg_replace('/[\s-]/', '', $contact))) {
            return null;
        }
        if (! is_int($birthYear) || $birthYear < 1000 || $birthYear > 9999) {
            return null;
        }
        if (! Submission::optionalText($province, 60) || ! Submission::optionalText($education, 40) || ! is_bool($guardianInformed)) {
            return null;
        }

        return array_filter([
            'name' => trim($name),
            'birthYear' => $birthYear,
            'province' => $province,
            'education' => $education,
            'contact' => trim($contact),
            'guardianInformed' => $guardianInformed,
        ], fn (mixed $field): bool => $field !== null);
    }

    /**
     * @return list<array<string, mixed>>|null
     */
    private static function answers(mixed $value): ?array
    {
        if (! is_array($value) || ! array_is_list($value) || $value === [] || count($value) > self::MAX_ANSWERS) {
            return null;
        }
        $answers = [];
        foreach ($value as $item) {
            $answer = self::answer($item);
            if ($answer === null) {
                return null;
            }
            $answers[] = $answer;
        }

        return $answers;
    }

    /**
     * @return array{questionId: string, question: string, answer: string, seconds: int, dictated: bool}|null
     */
    private static function answer(mixed $value): ?array
    {
        if (! is_array($value)) {
            return null;
        }
        $questionId = $value['questionId'] ?? null;
        $question = $value['question'] ?? null;
        $answer = $value['answer'] ?? null;
        $seconds = $value['seconds'] ?? null;
        $dictated = $value['dictated'] ?? null;
        if (! Submission::text($questionId, 40) || ! Submission::text($question, 300)) {
            return null;
        }
        if (! is_string($answer) || mb_strlen($answer) > self::MAX_ANSWER) {
            return null;
        }
        if (! is_int($seconds) && ! is_float($seconds) || $seconds < 0 || $seconds > 600 || ! is_bool($dictated)) {
            return null;
        }

        return [
            'questionId' => $questionId,
            'question' => $question,
            'answer' => $answer,
            'seconds' => (int) round($seconds),
            'dictated' => $dictated,
        ];
    }
}
