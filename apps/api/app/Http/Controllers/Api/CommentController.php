<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Company;
use App\Models\News;
use App\Models\User;
use App\Support\CommentFilter;
use App\Support\Submission;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

/**
 * Comments on news, companies and simulations. Reading is public (no cookie, nothing personal: the author is a
 * name, the first one only for minors); writing, reporting and deleting need an account.
 *
 * GET /comments?type=&id= | POST /comments | POST /comments/{comment}/report | DELETE /comments/{comment} | GET /me/comments
 */
class CommentController extends Controller
{
    private const int PAGE = 50;

    public function index(Request $request): JsonResponse
    {
        $subject = self::subject($request->query('type'), $request->query('id'));
        if ($subject === null) {
            return Submission::invalid();
        }

        $comments = Comment::query()->visible()->with('user:id,name,birth_year')
            ->where('subject_type', $subject[0])->where('subject_id', $subject[1])
            ->latest('id')->limit(self::PAGE)->get();

        return response()->json($comments->map(self::shape(...))->all());
    }

    public function store(Request $request): JsonResponse
    {
        $user = MeController::user($request);
        $subject = self::subject($request->input('type'), $request->input('id'));
        $body = $request->input('body');
        if ($subject === null || ! is_string($body)) {
            return Submission::invalid();
        }
        $reason = CommentFilter::refusal($body);
        if ($reason !== null) {
            return Submission::json(['error' => 'refused', 'reason' => $reason], 422);
        }

        $comment = Comment::query()->create([
            'user_id' => $user->id,
            'subject_type' => $subject[0],
            'subject_id' => $subject[1],
            'body' => trim($body),
        ]);
        $comment->setRelation('user', $user);

        return Submission::json(self::shape($comment), 201);
    }

    public function report(Request $request, Comment $comment): JsonResponse
    {
        $user = MeController::user($request);
        if ($comment->user_id === $user->id || $comment->hidden_at !== null) {
            return Submission::json(['ok' => true]);
        }

        try {
            DB::transaction(function () use ($comment, $user): void {
                DB::table('comment_reports')->insert(['comment_id' => $comment->id, 'user_id' => $user->id, 'created_at' => now(), 'updated_at' => now()]);
                $count = DB::table('comment_reports')->where('comment_id', $comment->id)->count();
                $comment->forceFill(['reports_count' => $count, 'hidden_at' => $count >= Comment::HIDING_REPORTS ? now() : null])->save();
            });
        } catch (UniqueConstraintViolationException) {
            // The same person reporting twice counts once.
        }

        return Submission::json(['ok' => true]);
    }

    public function destroy(Request $request, Comment $comment): Response|JsonResponse
    {
        if ($comment->user_id !== MeController::user($request)->id) {
            return Submission::json(['error' => 'forbidden'], 403);
        }
        $comment->delete();

        return response()->noContent();
    }

    /**
     * The ids of the person's own comments, so the app shows "apagar" on them.
     */
    public function mine(Request $request): JsonResponse
    {
        return response()->json(Comment::query()->where('user_id', MeController::user($request)->id)->pluck('id')->all());
    }

    /**
     * The kind and the id, when the thing exists: news and companies must be published; a simulation is the slug
     * of the test or exam.
     *
     * @return array{string, string}|null
     */
    private static function subject(mixed $type, mixed $id): ?array
    {
        if (! is_string($type) || ! in_array($type, Comment::SUBJECTS, true) || ! is_string($id) || preg_match('/^[a-z0-9][a-z0-9-]{0,150}$/', $id) !== 1) {
            return null;
        }
        $exists = match ($type) {
            'news' => News::query()->published()->where('slug', $id)->exists(),
            'company' => Company::query()->published()->where('slug', $id)->exists(),
            default => true,
        };

        return $exists ? [$type, $id] : null;
    }

    /**
     * @return array{id: int, type: string, subject: string, author: string, body: string, at: string}
     */
    private static function shape(Comment $comment): array
    {
        return [
            'id' => $comment->id,
            'type' => $comment->subject_type,
            'subject' => $comment->subject_id,
            'author' => self::displayName($comment->user),
            'body' => $comment->body,
            'at' => $comment->created_at->toIso8601String(),
        ];
    }

    /**
     * Adults show the name they signed in with; minors, and anyone whose age is unknown, only the first name.
     */
    private static function displayName(?User $user): string
    {
        $name = trim($user->name ?? '');
        if ($user === null || $name === '') {
            return 'Utilizador';
        }

        return $user->isAdult() ? $name : explode(' ', $name)[0];
    }
}
