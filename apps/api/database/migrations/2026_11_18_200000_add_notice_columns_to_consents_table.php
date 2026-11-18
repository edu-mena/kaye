<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * `consents` for the notices (docs/base-de-dados.md): who is only on the waiting list (`waitlist_id`), where the
 * consent was given (`source`) and the truncated IP. `push` becomes `push_service`, one consent per purpose.
 * The waiting list's own consents are copied in: an email waits for its double opt-in, a number is for the
 * messages sent by hand.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('consents', function (Blueprint $table): void {
            $table->foreignId('waitlist_id')->nullable()->after('user_id')->constrained('waitlist')->cascadeOnDelete();
            $table->string('source', 16)->nullable()->after('version');
            $table->string('ip_prefix', 45)->nullable()->after('source');

            $table->index(['waitlist_id', 'kind']);
        });

        DB::table('consents')->where('kind', 'push')->update(['kind' => 'push_service']);

        foreach (DB::table('waitlist')->orderBy('id')->lazy() as $entry) {
            /** @var object{id: int, email: ?string, whatsapp: ?string, source: string, consent_at: string, confirmed_at: ?string, unsubscribed_at: ?string} $entry */
            $rows = [];
            if ($entry->email !== null) {
                $rows[] = ['kind' => 'email_service', 'confirmed_at' => $entry->confirmed_at];
            }
            if ($entry->whatsapp !== null) {
                $rows[] = ['kind' => 'whatsapp_marketing', 'confirmed_at' => null];
            }
            foreach ($rows as $row) {
                DB::table('consents')->insert([
                    ...$row,
                    'waitlist_id' => $entry->id,
                    'version' => '2026-11-12',
                    'source' => $entry->source,
                    'granted_at' => $entry->consent_at,
                    'revoked_at' => $entry->unsubscribed_at,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        DB::table('consents')->whereNotNull('waitlist_id')->delete();
        DB::table('consents')->where('kind', 'push_service')->update(['kind' => 'push']);
        DB::table('consents')->where('kind', 'push_marketing')->delete();

        Schema::table('consents', function (Blueprint $table): void {
            $table->dropIndex(['waitlist_id', 'kind']);
            $table->dropConstrainedForeignId('waitlist_id');
            $table->dropColumn(['source', 'ip_prefix']);
        });
    }
};
