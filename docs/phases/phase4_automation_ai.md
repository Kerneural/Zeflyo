# Phase 4: Gemini AI Integration & Module Độc Lập (Ngày 4 - 5)

## 🎯 Mục tiêu
*   Tích hợp Google Gemini API để tự động sinh bài viết và tự động phản hồi khách hàng theo ngữ cảnh.
*   Xây dựng module **Post Scheduler (Lên lịch đăng bài)** và **Cấu hình Luật Auto-reply** chạy độc lập.

---

## 👥 Phân công nhiệm vụ chi tiết

### 1. Hoàng (PM & DevOps)
*   **Công việc 1: Quản lý API Key an toàn**
    *   Đăng ký Google Gemini API Key tại Google AI Studio.
    *   Lưu trữ API Key này vào `.env` ở local (và AWS Secrets Manager khi lên production).
    *   *Sản phẩm:* Cấu hình `GEMINI_API_KEY` hoạt động qua Laravel service container.

### 2. Khoa
*   **Công việc 1: Xây dựng `GeminiService`**
    *   Viết Service gọi API Gemini (`Gemini 1.5 Flash`) để sinh câu trả lời dựa trên:
        1. Nội dung tin nhắn của khách hàng.
        2. Nội dung prompt cấu hình (Thông tin doanh nghiệp, giọng điệu, quy định trả lời).
*   **Công việc 2: Kích hoạt Auto-Reply Engine**
    *   Cập nhật logic xử lý của `ProcessFacebookWebhookJob` (ở Phase 2):
        *   Khi nhận tin nhắn mới $\rightarrow$ Kiểm tra cấu hình của Fanpage.
        *   Nếu bật tự động trả lời bằng từ khóa: Duyệt danh sách Keyword Rules của trang đó để khớp từ khóa $\rightarrow$ Lấy câu trả lời tĩnh $\rightarrow$ Trả lời ngay.
        *   Nếu không khớp từ khóa nhưng bật chế độ AI: Gọi `GeminiService` lấy câu trả lời $\rightarrow$ Gọi API Facebook phản hồi khách.

### 3. Tiến (Fullstack Developer - Phát triển Module Độc lập)
Để Tiến tự do phát huy năng lực viết code nhanh mà không làm hỏng luồng Webhook/Socket cốt lõi, Tiến sẽ chịu trách nhiệm chính ở 2 module độc lập sau:

*   **Công việc 1: Phát triển Module Lên lịch đăng bài (Post Scheduler & AI Content)**
    *   *Database:* Tạo bảng `scheduled_posts` nâng cao chứa thông tin cấu hình lịch đăng, chế độ lặp, nguồn WooCommerce.
    *   *Frontend (Next.js):*
        *   Giao diện Split Pane Layout.
        *   Form cấu hình: Chọn nguồn tạo nội dung (từ Chủ đề, tự tải ảnh hoặc quét API WooCommerce sản phẩm), nhập Prompt cá nhân hóa, thiết lập lịch đăng lặp tuần hoặc ngày cố định, chọn chế độ đăng (Đăng ngay, Duyệt trước, Chờ đăng).
        *   Màn hình giả lập Mockup Preview hiển thị giao diện hiển thị thật trên Facebook Feed.
    *   *Backend (Laravel):*
        *   API `POST /api/posts/schedule` tiếp nhận lưu cấu hình.
        *   Tích hợp dịch vụ gọi Gemini sinh bài viết dựa trên chủ đề hoặc thông tin WooCommerce sản phẩm (quét thông tin tự động).
        *   Tạo lệnh Console Command `php artisan posts:publish` chạy hàng phút quét lịch trình DB, gọi Facebook API xuất bản và ghi log trạng thái.
*   **Công việc 2: Giao diện cấu hình Luật Auto-Reply**
    *   *Database:* Tạo bảng `auto_reply_rules` (Lưu từ khóa, loại tương tác, nội dung phản hồi).
    *   *Frontend (Next.js):* Màn hình CRUD danh sách các luật tự động (ví dụ: tạo rule cho từ khóa "giá" $\rightarrow$ tự trả lời "Sản phẩm giá 100k").

---

## 🗄️ Thiết kế Cơ sở dữ liệu (Database Schema)

Tiến khởi tạo migrations cho 2 bảng:

### Bảng `auto_reply_rules`
```php
Schema::create('auto_reply_rules', function (Blueprint $table) {
    $table->id();
    $table->foreignId('fanpage_id')->constrained()->onDelete('cascade');
    $table->string('keyword'); // Từ khóa khớp (ví dụ: "giá", "ib", "inbox")
    $table->text('reply_content'); // Nội dung tự động trả lời
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});
```

### Bảng `scheduled_posts`
```php
Schema::create('scheduled_posts', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->json('fanpage_ids'); // Mảng ID các trang muốn đăng bài lên
    $table->string('schedule_type')->default('fixed'); // 'fixed' hoặc 'weekly' (lặp tuần)
    $table->json('days_of_week')->nullable(); // Mảng các ngày đăng nếu là weekly (ví dụ: ["Monday", "Friday"])
    $table->time('publish_time')->nullable(); // Giờ đăng cố định trong ngày (ví dụ: "08:00")
    $table->timestamp('scheduled_at')->nullable(); // Thời gian cụ thể nếu là fixed date
    $table->text('content'); // Nội dung bài viết sinh ra bởi AI hoặc viết tay
    $table->string('image_url')->nullable(); // Đường dẫn hình ảnh đính kèm
    $table->enum('status', ['draft', 'pending', 'published', 'failed'])->default('pending');
    $table->boolean('is_loop')->default(false); // Tự động lặp lại chu kỳ đăng từ đầu khi đăng hết bài
    $table->text('error_log')->nullable(); // Log lỗi chi tiết nếu Graph API phản hồi thất bại
    $table->timestamps();
});
```

---

## 🎨 Chỉ dẫn UI/UX cho Post Scheduler & Auto-Reply Rules (Antigravity Kit)

Các module độc lập này cần sự trực quan cao để Admin thiết lập chính xác các chiến dịch nội dung và phản hồi:

### 1. Module Lên Lịch Bài Đăng (Post Scheduler UX)
*   **Bố cục Soạn thảo & Xem trước (Split Pane Layout):**
    *   *Bên trái:* Form điền thông tin (Chọn cách tạo bài viết từ WooCommerce/Chủ đề; Nhập Prompt cá nhân hóa AI; Uploader kéo thả ảnh; Chọn chế độ lặp tuần/ngày cố định; Cài giờ đăng và check chọn danh sách các Fanpage).
    *   *Bên phải:* **Khung xem trước thời gian thực (Real-time Mockup Preview):** Thiết kế giả lập một bài đăng Facebook hoàn chỉnh hiển thị avatar, tên Page, dòng thời gian, nội dung chữ đang gõ, ảnh co giãn tỷ lệ và các nút Like/Comment/Share ảo. Giúp Admin thấy trước chính xác những gì người dùng sẽ thấy trên Facebook Feed.
*   **Datetime Picker an toàn:**
    *   Sử dụng Shadcn Calendar Popover.
    *   Chặn không cho chọn ngày/giờ trong quá khứ để tránh lỗi Cron job bị quá hạn.

### 2. Giao diện Cấu hình Luật Auto-Reply
*   **Thiết kế Dạng Thẻ / Bảng Dữ Liệu (Card-based / Data Table):**
    *   Hiển thị danh sách từ khóa dưới dạng các **Badges** màu xanh nhạt hoặc xám dịu để dễ phân biệt trực quan.
    *   Cung cấp thanh Switch toggle trạng thái Kích hoạt (`is_active`) trực tiếp trên mỗi dòng/thẻ của luật mà không bắt buộc admin phải vào trang chỉnh sửa chi tiết.
    *   Hiệu ứng phản hồi micro-animation khi bật/tắt Switch thành công (`transition-all duration-200`).

---

## 🧪 Kiểm định & Verify ở cuối Phase
1.  **Verify AI Chat:** Khách hàng nhắn tin hỏi han linh tinh trên Fanpage $\rightarrow$ Kiểm tra DB và Messenger xem có nhận được câu trả lời thông minh sinh ra từ Gemini API sau vài giây không.
2.  **Verify Lên lịch đăng bài:** Tạo một bài viết hẹn giờ đăng sau 2 phút. Đảm bảo:
    *   Đúng 2 phút sau, cron job/scheduler tự động chạy lệnh `posts:publish`.
    *   Bài viết xuất hiện thành công trên tường Fanpage thật.
    *   Trạng thái bài đăng chuyển sang `published` trong database.
    *   Nếu có lỗi (sai token, thiếu quyền), trạng thái chuyển sang `failed` và ghi nhận rõ lý do ở `error_log`.
    *   Nếu bật `is_loop = true`, sau khi đăng bài cuối cùng, đảm bảo trạng thái bài đăng tự reset lại thành `pending`.
