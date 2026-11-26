<?php

namespace Tests\Feature;

use App\Enums\MessageStatus;
use App\Models\Career;
use App\Models\Comment;
use App\Models\Concerns\LogsContentChanges;
use App\Models\Message;
use App\Models\User;
use App\Models\WaitlistEntry;
use App\Support\ModelKinds;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Gate;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Roles and policies (docs/seguranca.md, "Papéis e permissões"): every model has a policy, and each role can do
 * exactly what its row of the table says.
 */
class StaffPermissionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_every_model_has_a_kind_a_policy_and_the_right_audit(): void
    {
        $listed = [...ModelKinds::CONTENT, ...ModelKinds::PERSONAL, ...array_keys(ModelKinds::OWN_POLICY)];
        $this->assertCount(count($listed), array_unique($listed), 'A model is in two lists of ModelKinds.');

        foreach (File::files(app_path('Models')) as $file) {
            $model = 'App\\Models\\'.$file->getFilenameWithoutExtension();
            $this->assertContains($model, $listed, "{$model} is in no list of App\\Support\\ModelKinds.");
            $this->assertNotNull(Gate::getPolicyFor($model), "{$model} has no policy.");

            $logged = in_array(LogsContentChanges::class, class_uses_recursive($model), true);
            $shouldLog = in_array($model, ModelKinds::CONTENT, true) || $model === Message::class;
            $this->assertSame($shouldLog, $logged, $shouldLog ? "{$model} changes are not audited." : "{$model} copies personal data into the audit log.");
        }
    }

    public function test_editors_write_reviewers_publish_and_only_admins_delete_content(): void
    {
        $career = Career::factory()->create();
        [$admin, $editor, $reviewer, $user] = [User::factory()->admin()->create(), User::factory()->editor()->create(), User::factory()->reviewer()->create(), User::factory()->create()];

        $this->assertSame([true, true, true, true], [$admin->can('update', $career), $admin->can('publish', $career), $admin->can('delete', $career), $admin->can('viewAny', Career::class)]);
        $this->assertSame([true, false, false, true], [$editor->can('update', $career), $editor->can('publish', $career), $editor->can('delete', $career), $editor->can('viewAny', Career::class)]);
        $this->assertSame([false, true, false, true], [$reviewer->can('update', $career), $reviewer->can('publish', $career), $reviewer->can('delete', $career), $reviewer->can('viewAny', Career::class)]);
        $this->assertSame([false, false, false, false], [$user->can('update', $career), $user->can('publish', $career), $user->can('delete', $career), $user->can('viewAny', Career::class)]);
    }

    public function test_only_admins_see_personal_data_and_nobody_edits_it(): void
    {
        $entry = WaitlistEntry::factory()->create();
        $admin = User::factory()->admin()->create();

        $this->assertTrue($admin->can('viewAny', WaitlistEntry::class));
        $this->assertTrue($admin->can('export', WaitlistEntry::class));
        $this->assertFalse($admin->can('update', $entry));
        $this->assertFalse($admin->can('create', WaitlistEntry::class));
        foreach ([User::factory()->editor()->create(), User::factory()->reviewer()->create(), User::factory()->create()] as $other) {
            $this->assertFalse($other->can('viewAny', WaitlistEntry::class));
            $this->assertFalse($other->can('export', WaitlistEntry::class));
        }
    }

    public function test_editors_write_messages_but_only_admins_send_and_nothing_sent_changes(): void
    {
        $draft = Message::factory()->create();
        $sent = Message::factory()->create(['status' => MessageStatus::Sent]);
        $editor = User::factory()->editor()->create();
        $admin = User::factory()->admin()->create();

        $this->assertTrue($editor->can('update', $draft));
        $this->assertFalse($editor->can('send', $draft));
        $this->assertTrue($admin->can('send', $draft));
        $this->assertFalse($admin->can('update', $sent));
        $this->assertFalse($admin->can('send', $sent));
        $this->assertFalse(User::factory()->reviewer()->create()->can('viewAny', Message::class));
    }

    public function test_only_admins_manage_accounts_and_never_their_own(): void
    {
        $admin = User::factory()->admin()->create();
        $other = User::factory()->create();

        $this->assertTrue($admin->can('update', $other));
        $this->assertFalse($admin->can('update', $admin));
        $this->assertFalse(User::factory()->editor()->create()->can('viewAny', User::class));
        $this->assertTrue($other->can('view', $other));
        $this->assertFalse($other->can('view', $admin));
    }

    public function test_the_panel_hides_what_a_role_may_not_open(): void
    {
        config(['kaye.admin_emails' => ['ed@kaye.test', 'boss@kaye.test']]);

        $this->actingAs(User::factory()->editor()->create(['email' => 'ed@kaye.test']))->get('/admin/waitlist-entries')->assertForbidden();
        $this->actingAs(User::factory()->editor()->create(['email' => 'ed2@kaye.test']))->get('/admin')->assertForbidden();
        $this->actingAs(User::factory()->admin()->create(['email' => 'boss@kaye.test']))->get('/admin/waitlist-entries')->assertOk();
    }

    public function test_a_moderator_deletes_a_comment_and_another_user_cannot(): void
    {
        $comment = Comment::factory()->create();

        Sanctum::actingAs(User::factory()->create());
        $this->deleteJson("/api/v1/comments/{$comment->id}")->assertForbidden();

        Sanctum::actingAs(User::factory()->reviewer()->create());
        $this->deleteJson("/api/v1/comments/{$comment->id}")->assertNoContent();
        $this->assertModelMissing($comment);
    }
}
