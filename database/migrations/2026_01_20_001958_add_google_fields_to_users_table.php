<?php

declare(strict_types=1);

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
		Schema::table('users', function (Blueprint $table) {
			$table->string('google_id')->unique()->nullable()->after('email');
			$table->string('avatar')->nullable()->after('email_verified_at');
			$table->string('password')->nullable()->change();
		});
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void
	{
		Schema::table('users', function (Blueprint $table) {
			$table->dropColumn(['google_id', 'avatar']);
			$table->string('password')->nullable(false)->change();
		});
	}
};
