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
		Schema::create('waitlist_registrations', function (Blueprint $table) {
			$table->id();
			$table->string('stage_name');
			$table->string('instagram_handle')->nullable();
			$table->string('youtube_handle')->nullable();
			$table->string('tiktok_handle')->nullable();
			$table->string('contact_email');
			$table->json('artist_types');
			$table->string('other_artist_type')->nullable();
			$table->string('main_genre')->nullable();
			$table->json('participation_types');
			$table->string('portfolio_link')->nullable();
			$table->string('city_state')->nullable();
			$table->string('creation_availability', 16);
			$table->timestamp('terms_accepted_at');
			$table->timestamps();

			$table->index('contact_email');
		});
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void
	{
		Schema::dropIfExists('waitlist_registrations');
	}
};


