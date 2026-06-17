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
        Schema::create('interactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->foreignId('fanpage_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['message', 'comment']); // Loại tương tác
            $table->string('fb_item_id'); // ID của comment hoặc message trên FB
            $table->string('fb_post_id')->nullable(); // Có giá trị nếu type = comment (để biết ở post nào)
            $table->text('content'); // Nội dung text
            $table->boolean('is_from_customer')->default(true); // true = khách gửi, false = page reply
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interactions');
    }
};
