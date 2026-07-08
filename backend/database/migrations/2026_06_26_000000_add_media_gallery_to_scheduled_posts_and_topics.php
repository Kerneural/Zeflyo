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
        Schema::table('scheduled_posts', function (Blueprint $table) {
            $table->json('media_gallery')->nullable()->after('image_url');
        });

        Schema::table('topics', function (Blueprint $table) {
            $table->json('media_gallery')->nullable()->after('generated_image_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('scheduled_posts', function (Blueprint $table) {
            $table->dropColumn('media_gallery');
        });

        Schema::table('topics', function (Blueprint $table) {
            $table->dropColumn('media_gallery');
        });
    }
};
