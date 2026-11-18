<?php

namespace Tests\Feature;

use App\Enums\ConsentKind;
use App\Enums\MessageChannel;
use App\Enums\MessageTemplate;
use App\Mail\MessageMail;
use App\Models\Admission;
use App\Models\Institution;
use App\Models\Message;
use App\Models\Scholarship;
use App\Models\User;
use App\Models\UserData;
use App\Support\Consents;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * The reminders of the deadlines people saved ("Lembrar-me"), 3 days before they close: a service notice, so a
 * minor gets it too; once per deadline and person, however many times the task runs.
 */
class DeadlineRemindersTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow('2026-11-18 08:00:00');
    }

    /**
     * @param  list<string>  $reminded
     */
    private function saving(array $reminded, ?User $user = null): User
    {
        $user ??= User::factory()->create();
        Consents::grant($user, ConsentKind::EmailService, '2026-11-12', 'app', null);
        $data = new UserData;
        $data->user()->associate($user);
        $data->setDocument((object) ['remindedDeadlines' => $reminded]);
        $data->save();

        return $user;
    }

    private function remind(): void
    {
        $this->assertSame(0, Artisan::call('kaye:deadline-reminders'));
        $this->assertSame(0, Artisan::call('kaye:send-messages'));
    }

    public function test_a_saved_scholarship_is_remembered_three_days_before_in_the_persons_language(): void
    {
        Mail::fake();
        Scholarship::factory()->create(['slug' => 'bolsa-inagbe', 'status' => 'published', 'deadline' => '2026-11-21', 'name' => ['pt' => 'Bolsa INAGBE', 'en' => 'INAGBE grant']]);
        $ana = $this->saving(['bolsa-inagbe'], User::factory()->create(['locale' => 'en']));
        $this->saving(['another-one']);

        $this->remind();

        Mail::assertSentCount(1);
        Mail::assertSent(MessageMail::class, function (MessageMail $mail) use ($ana): bool {
            $mail->assertHasSubject('3 days left: INAGBE grant');
            $mail->assertSeeInHtml('INAGBE grant closes on November 21, 2026');

            return $mail->hasTo($ana->email) && $mail->message->template === MessageTemplate::Deadline;
        });
    }

    public function test_a_minor_gets_the_reminder_it_asked_for(): void
    {
        Mail::fake();
        Scholarship::factory()->create(['slug' => 'bolsa-x', 'status' => 'published', 'deadline' => '2026-11-21']);
        $minor = $this->saving(['bolsa-x'], User::factory()->minor()->create());

        $this->remind();

        Mail::assertSent(MessageMail::class, fn (MessageMail $mail): bool => $mail->hasTo($minor->email));
    }

    public function test_the_access_application_and_each_exam_of_an_admission_have_their_ids(): void
    {
        Mail::fake();
        $isptec = Institution::factory()->create(['name' => 'ISPTEC']);
        Admission::factory()->create([
            'slug' => 'isptec-2027', 'status' => 'published', 'institution_id' => $isptec->id,
            'registration_end' => '2026-11-21', 'exam_dates' => ['2026-11-10', '2026-11-21'],
        ]);
        $this->saving(['isptec-2027-acesso']);
        $this->saving(['isptec-2027-exame-1']);
        $this->saving(['isptec-2027-exame-0']);

        $this->remind();

        Mail::assertSentCount(2);
        $this->assertSame(
            ['deadline:isptec-2027-acesso:2026-11-21:email', 'deadline:isptec-2027-exame-1:2026-11-21:email'],
            Message::query()->where('channel', MessageChannel::Email)->orderBy('key')->pluck('key')->all(),
        );
    }

    public function test_running_again_reminds_nobody_twice_and_adds_who_saved_it_since(): void
    {
        Mail::fake();
        Scholarship::factory()->create(['slug' => 'bolsa-x', 'status' => 'published', 'deadline' => '2026-11-21']);
        $this->saving(['bolsa-x']);

        $this->remind();
        $this->remind();
        Mail::assertSentCount(1);

        $this->saving(['bolsa-x']);
        $this->remind();

        Mail::assertSentCount(2);
    }

    public function test_a_draft_or_another_day_is_not_reminded(): void
    {
        Mail::fake();
        Scholarship::factory()->create(['slug' => 'draft', 'status' => 'draft', 'deadline' => '2026-11-21']);
        Scholarship::factory()->create(['slug' => 'later', 'status' => 'published', 'deadline' => '2026-11-25']);
        $this->saving(['draft', 'later']);

        $this->remind();

        Mail::assertNothingSent();
        $this->assertSame(0, Message::query()->count());
    }
}
