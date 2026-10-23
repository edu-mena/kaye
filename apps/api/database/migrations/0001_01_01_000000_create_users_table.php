<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table): void {
            $table->id();
            $table->string('google_sub')->nullable()->unique();
            $table->string('apple_sub')->nullable()->unique();
            $table->string('email')->unique();
            $table->string('name');
            $table->string('avatar_url', 2048)->nullable();
            // Year only, not the full date: collect the minimum needed (Lei n.º 22/11).
            $table->unsignedSmallInteger('birth_year')->nullable();
            $table->string('province', 64)->nullable();
            $table->string('current_education_level', 32)->nullable();
            $table->string('locale', 5)->default('pt');
            $table->string('role', 16)->default('user')->index();
            $table->unsignedInteger('xp')->default(0);
            // Users sign in with Google only. The password exists solely for the
            // local admin login until the admin panel moves to Google sign-in.
            $table->string('password')->nullable();
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
        });

        // No password_reset_tokens table: there are no user passwords to reset.

        Schema::create('sessions', function (Blueprint $table): void {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('sessions');
    }
};
