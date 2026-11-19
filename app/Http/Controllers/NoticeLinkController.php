<?php

namespace App\Http\Controllers;

use App\Enums\ConsentKind;
use App\Mail\Welcome;
use App\Models\WaitlistEntry;
use App\Support\Consents;
use App\Support\NoticeLinks;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

/**
 * The links in the emails, without signing in. A link that was changed, or has expired, is refused before
 * anything else (docs/seguranca.md, "Avisos").
 *
 * GET /waitlist/confirm/{token}: the double opt-in of the waiting list's email; the first time, the welcome.
 * GET and POST /unsubscribe/{token}?kind=…: withdraws that consent. POST is the mail app's one-click button
 * (List-Unsubscribe-Post), so it answers plain text.
 */
class NoticeLinkController extends Controller
{
    public function confirm(Request $request, string $token): Response
    {
        if (! $request->hasValidSignature()) {
            return $this->page('invalid', 'pt', 403);
        }
        $entry = NoticeLinks::resolve($token);
        if (! $entry instanceof WaitlistEntry || $entry->email === null) {
            return $this->page('invalid', 'pt', 404);
        }

        $first = DB::transaction(function () use ($entry): bool {
            $pending = $entry->consents()->active()->where('kind', ConsentKind::EmailService)->whereNull('confirmed_at')->update(['confirmed_at' => now()]);
            if ($entry->confirmed_at === null) {
                $entry->forceFill(['confirmed_at' => now()])->save();
            }

            return $pending > 0;
        });
        if ($first) {
            Mail::to($entry->email)->queue(new Welcome($entry));
        }

        return $this->page('confirmed', $entry->locale);
    }

    public function unsubscribe(Request $request, string $token): Response
    {
        if (! $request->hasValidSignature()) {
            return $request->isMethod('POST') ? response('invalid', 403) : $this->page('invalid', 'pt', 403);
        }
        $person = NoticeLinks::resolve($token);
        $kind = ConsentKind::tryFrom($request->string('kind')->value());
        if ($person === null || $kind === null || ! $kind->isEmail()) {
            return $request->isMethod('POST') ? response('invalid', 404) : $this->page('invalid', 'pt', 404);
        }

        Consents::revoke($person, $kind);

        return $request->isMethod('POST')
            ? response('ok', 200, ['Content-Type' => 'text/plain; charset=utf-8'])
            : $this->page('unsubscribed', $person->noticeLocale());
    }

    private function page(string $state, string $locale, int $status = 200): Response
    {
        return response()->view('notices.page', ['state' => $state, 'locale' => $locale], $status, [
            'Cache-Control' => 'no-store',
            'X-Robots-Tag' => 'noindex, nofollow',
            'Referrer-Policy' => 'no-referrer',
        ]);
    }
}
