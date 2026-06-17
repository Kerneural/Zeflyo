<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fanpages', function (Blueprint $table) {
            $table->text('access_token')->change();
            $table->text('avatar_url')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('fanpages', function (Blueprint $table) {
            $table->string('access_token')->change();
            $table->string('avatar_url')->nullable()->change();
        });
    }
};
