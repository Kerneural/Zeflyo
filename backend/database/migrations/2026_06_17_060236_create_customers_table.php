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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fanpage_id')->constrained()->onDelete('cascade');
            $table->string('fb_customer_id'); // PSID (Page-Scoped ID) của khách hàng
            $table->string('name')->nullable();
            $table->string('avatar_url')->nullable();
            $table->timestamps();

            $table->unique(['fanpage_id', 'fb_customer_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
