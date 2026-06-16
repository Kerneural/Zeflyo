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
        Schema::create('fanpages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('fb_page_id')->unique(); // ID page của Facebook
            $table->string('name');
            $table->text('access_token'); // Lưu ý: Bắt buộc mã hóa (encrypted)
            $table->string('avatar_url')->nullable();
            $table->boolean('is_active')->default(false); // Trạng thái bật tự động hóa
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fanpages');
    }
};
