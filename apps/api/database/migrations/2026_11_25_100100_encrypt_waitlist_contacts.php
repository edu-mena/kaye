<?php

use App\Support\BlindIndex;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * The email and the WhatsApp of the waiting list, encrypted at rest with the APP_KEY (docs/seguranca.md): a copy of
 * the database alone no longer gives the contacts. Each one keeps being on the list once, through its hash
 * (`email_hash`, `whatsapp_hash`), which is also how the list is searched.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('waitlist', function (Blueprint $table): void {
            $table->dropUnique(['email']);
            $table->dropUnique(['whatsapp']);
        });
        Schema::table('waitlist', function (Blueprint $table): void {
            $table->text('email')->nullable()->change();
            $table->text('whatsapp')->nullable()->change();
            $table->char('email_hash', 64)->nullable()->unique()->after('email');
            $table->char('whatsapp_hash', 64)->nullable()->unique()->after('whatsapp');
        });

        foreach (DB::table('waitlist')->orderBy('id')->get(['id', 'email', 'whatsapp']) as $row) {
            $email = is_string($row->email) ? $row->email : null;
            $whatsapp = is_string($row->whatsapp) ? $row->whatsapp : null;
            DB::table('waitlist')->where('id', $row->id)->update([
                'email' => $email === null ? null : Crypt::encryptString($email),
                'email_hash' => BlindIndex::of('email', $email),
                'whatsapp' => $whatsapp === null ? null : Crypt::encryptString($whatsapp),
                'whatsapp_hash' => BlindIndex::of('whatsapp', $whatsapp),
            ]);
        }
    }

    public function down(): void
    {
        foreach (DB::table('waitlist')->orderBy('id')->get(['id', 'email', 'whatsapp']) as $row) {
            DB::table('waitlist')->where('id', $row->id)->update([
                'email' => is_string($row->email) ? Crypt::decryptString($row->email) : null,
                'whatsapp' => is_string($row->whatsapp) ? Crypt::decryptString($row->whatsapp) : null,
            ]);
        }
        Schema::table('waitlist', function (Blueprint $table): void {
            $table->dropUnique(['email_hash']);
            $table->dropUnique(['whatsapp_hash']);
            $table->dropColumn(['email_hash', 'whatsapp_hash']);
        });
        Schema::table('waitlist', function (Blueprint $table): void {
            $table->string('email', 120)->nullable()->unique()->change();
            $table->string('whatsapp', 20)->nullable()->unique()->change();
        });
    }
};
