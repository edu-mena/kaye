<?php

namespace App\Http\Controllers\Api;

use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Models\Kurso;
use App\Models\KursoCompletion;
use App\Models\KursoUnit;
use App\Models\User;
use App\Support\Communities;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * The Kursos on the account (ADR 0025): the topics finished (one a day without Plus, enforced here and
 * not only on the device), the certificate's data, and the anonymous per-question counters.
 */
class KursoAccountController extends Controller
{
    /** The exam's pass mark, the same as `EXAM_PASS` in the app. */
    private const EXAM_PASS = 0.7;

    public function progress(Request $request): JsonResponse
    {
        $user = MeController::user($request);

        return response()->json([
            'completions' => KursoCompletion::query()->where('user_id', $user->getKey())->oldest('id')->get()
                ->map(fn (KursoCompletion $done): array => [
                    'course' => $done->course,
                    'topic' => $done->topic,
                    'completedOn' => $done->completed_on->toDateString(),
                    'score' => $done->score,
                ])->all(),
        ]);
    }

    /**
     * `{day, score?}`: the person's local day. Without the Plus permission, a second topic on the same
     * day is refused with 409 `daily_limit` and the day it opens. Finishing a topic again is harmless.
     */
    public function complete(Request $request, string $course, string $topic): JsonResponse
    {
        $user = MeController::user($request);
        $request->validate([
            'day' => ['required', 'date_format:Y-m-d'],
            'score' => ['nullable', 'numeric', 'between:0,1'],
        ]);
        $score = $request->filled('score') ? $request->float('score') : null;
        $day = Carbon::createFromFormat('!Y-m-d', $request->string('day')->value()) ?: now();
        abort_unless($this->kursoExists($course) && $this->topicExists($course, $topic), 404);
        // A device's local day is at most a day away from the server's (time zones). The clock cannot
        // go back either: a day before the last one already finished is not a new day.
        abort_if(abs($day->diffInDays(now()->startOfDay(), false)) > 1, 422, 'The day is out of range.');
        $last = KursoCompletion::query()->where('user_id', $user->getKey())->max('completed_on');
        abort_if(is_string($last) && $day->toDateString() < substr($last, 0, 10), 422, 'The day is before the last one.');

        $existing = KursoCompletion::query()->where(['user_id' => $user->getKey(), 'course' => $course, 'topic' => $topic])->first();
        if ($existing instanceof KursoCompletion) {
            return response()->json(['completedOn' => $existing->completed_on->toDateString()]);
        }

        if ($topic === KursoCompletion::EXAM) {
            abort_unless($user->can('kursos.unlimited'), 403);
            abort_unless($score !== null && $score >= self::EXAM_PASS, 422, 'The exam was not passed.');
        } elseif (! $user->can('kursos.unlimited') && $this->finishedOn($user, $day) >= 1) {
            return response()->json(['code' => 'daily_limit', 'opensOn' => $day->copy()->addDay()->toDateString()], 409);
        }

        KursoCompletion::query()->create([
            'user_id' => $user->getKey(),
            'course' => $course,
            'topic' => $topic,
            'completed_on' => $day->toDateString(),
            'score' => $score,
        ]);

        Communities::afterTopic($user, $course);

        return response()->json(['completedOn' => $day->toDateString()]);
    }

    /** The certificate's data, never the PDF (made on the device). Plus, adult, exam passed. */
    public function certificate(Request $request, string $course): JsonResponse
    {
        $user = MeController::user($request);
        abort_unless($user->isAdult() && $user->can('kursos.unlimited'), 403);
        $kurso = Kurso::query()->where('slug', $course)->where('status', ContentStatus::Published->value)->firstOrFail();
        $exam = KursoCompletion::query()->where(['user_id' => $user->getKey(), 'course' => $course, 'topic' => KursoCompletion::EXAM])->first();
        if (! $exam instanceof KursoCompletion) {
            return response()->json(['code' => 'exam_not_passed'], 409);
        }

        return response()->json([
            'name' => $user->name,
            'course' => $kurso->getTranslation('title', $user->locale->value),
            'date' => $exam->completed_on->toDateString(),
            // Always the same for the same person and Kurso, and not guessable without the app key.
            'code' => strtoupper(substr(hash_hmac('sha256', $user->id.'|'.$course, config()->string('app.key')), 0, 12)),
        ]);
    }

    /** `{question_id, correct}` and nothing else: it raises two counters and keeps no trace of who. */
    public function answer(Request $request, string $course): JsonResponse
    {
        $request->validate([
            'question_id' => ['required', 'string', 'max:120'],
            'correct' => ['required', 'boolean'],
        ]);
        abort_unless($this->kursoExists($course), 404);

        $key = ['course' => $course, 'question_id' => $request->string('question_id')->value()];
        DB::table('kurso_question_stats')->insertOrIgnore($key + ['answered' => 0, 'correct' => 0]);
        DB::table('kurso_question_stats')->where($key)->update([
            'answered' => DB::raw('answered + 1'),
            'correct' => DB::raw('correct + '.($request->boolean('correct') ? 1 : 0)),
        ]);

        return response()->json(null, 204);
    }

    private function finishedOn(User $user, Carbon $day): int
    {
        return KursoCompletion::query()->where('user_id', $user->getKey())
            ->where('completed_on', $day->toDateString())->where('topic', '!=', KursoCompletion::EXAM)->count();
    }

    private function kursoExists(string $course): bool
    {
        return Kurso::query()->where('slug', $course)->where('status', ContentStatus::Published->value)->exists();
    }

    private function topicExists(string $course, string $topic): bool
    {
        return $topic === KursoCompletion::EXAM || KursoUnit::query()->where('slug', $topic)->where('status', ContentStatus::Published->value)
            ->whereHas('kurso', fn ($query) => $query->where('slug', $course))->exists();
    }
}
