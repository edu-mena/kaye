<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\WaitlistConfirmation;
use App\Models\WaitlistEntry;
use App\Support\AccessToken;
use App\Support\AuditLog;
use App\Support\Consents;
use App\Support\Contact;
use App\Support\ListExport;
use App\Support\Submission;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\HttpFoundation\Response;

/**
 * POST /waitlist (pre-launch: the contact asked on the landing page and at the start of the onboarding) and
 * GET /waitlist/export (the list or the feedback as CSV, with WAITLIST_EXPORT_TOKEN).
 */
class WaitlistController extends Controller
{
    private const MAX_BODY = 8_000;

    private const SOURCES = ['landing', 'onboarding', 'plus'];

    public function store(Request $request): JsonResponse
    {
        $body = Submission::read($request, self::MAX_BODY);
        if ($body === null) {
            return Submission::invalid();
        }
        if (Submission::isBot($body)) {
            return Submission::json(['ok' => true], 201);
        }
        $signup = self::clean($body);
        if ($signup === null) {
            return Submission::invalid();
        }
        if (WaitlistEntry::knows($signup['email'], $signup['whatsapp'])) {
            return Submission::json(['ok' => true, 'already' => true]);
        }

        try {
            $entry = WaitlistEntry::query()->create([...$signup, 'consent_at' => now()]);
        } catch (UniqueConstraintViolationException) {
            // The same contact sent twice at once: the other request kept it.
            return Submission::json(['ok' => true, 'already' => true]);
        }
        Consents::forWaitlist($entry, $request->ip());
        if ($entry->email !== null) {
            // The double opt-in: nothing else reaches this address until the link in this email is opened.
            Mail::to($entry->email)->queue(new WaitlistConfirmation($entry));
        }

        return Submission::json(['ok' => true], 201);
    }

    public function export(Request $request): Response
    {
        if (! AccessToken::allows($request, Config::string('kaye.waitlist_export_token'))) {
            return Submission::json(['error' => 'unauthorised'], 401);
        }
        $kind = $request->query('kind', 'waitlist');
        if (! is_string($kind) || ! in_array($kind, ListExport::KINDS, true)) {
            return Submission::invalid();
        }
        AuditLog::admin('csv_export', details: ['kind' => $kind, 'channel' => 'token']);

        return ListExport::download($kind);
    }

    /**
     * The signup if it is valid: consent given, at least an email or a number, each one well formed.
     *
     * @param  array<string, mixed>  $body
     * @return array{name: string, email: ?string, whatsapp: ?string, source: string, locale: string}|null
     */
    private static function clean(array $body): ?array
    {
        $name = $body['name'] ?? null;
        $email = $body['email'] ?? null;
        $whatsapp = $body['whatsapp'] ?? null;
        if (($body['consent'] ?? null) !== true) {
            return null;
        }
        if (! Submission::optionalText($name, 80) || ! Submission::optionalText($email, 120) || ! Submission::optionalText($whatsapp, 30)) {
            return null;
        }
        $mail = is_string($email) ? mb_strtolower(trim($email)) : '';
        if ($mail !== '' && ! Contact::isEmail($mail)) {
            return null;
        }
        $phone = is_string($whatsapp) && trim($whatsapp) !== '' ? Contact::normalisePhone($whatsapp) : '';
        if ($phone === null || $mail === '' && $phone === '') {
            return null;
        }
        $source = $body['source'] ?? null;

        return [
            'name' => is_string($name) ? trim($name) : '',
            'email' => $mail === '' ? null : $mail,
            'whatsapp' => $phone === '' ? null : $phone,
            'source' => is_string($source) && in_array($source, self::SOURCES, true) ? $source : 'landing',
            'locale' => Submission::locale($body['lang'] ?? null),
        ];
    }
}
