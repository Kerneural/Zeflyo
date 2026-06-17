# 🎫 Jira Ticket: ZEF-201 (Khoa - Core Backend)
## Triển Khai Gemini AI Service & Tích Hợp Auto-Reply Engine

* **Ticket ID:** ZEF-201
* **Summary:** Xây dựng GeminiService và tích hợp Auto-Reply Engine vào Webhook Job
* **Assignee:** Khoa (Core Backend)
* **Story Point:** 5

---

### 📖 Mô tả (Description)
Triển khai hệ thống tự động trả lời tin nhắn của khách hàng. Tích hợp Google Gemini API để phân tích câu hỏi của khách và sinh câu trả lời tự động thông minh theo ngữ cảnh cửa hàng. Cập nhật Job xử lý webhook để tự động khớp luật từ khóa (Keyword Rules) và gọi Gemini AI khi không trùng từ khóa.

---

### 🛠️ Yêu cầu triển khai (Implementation Requirements)

1. **Cấu hình API Key an toàn:**
   * Thêm biến cấu hình `GEMINI_API_KEY` vào `.env.example` và file `.env` local của Laravel.
   * Đăng ký key trong `config/services.php`:
     ```php
     'gemini' => [
         'key' => env('GEMINI_API_KEY'),
     ],
     ```

2. **Xây dựng `GeminiService`:**
   * Tạo class `App\Services\GeminiService`.
   * Sử dụng Laravel HTTP Client (`Http::post`) gửi request đến API Google AI Studio:
     `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}`
   * Viết hàm `generateReply(string $customerMessage, string $systemPrompt): ?string` để sinh câu trả lời.
   * Xử lý ngoại lệ (try-catch) và ghi log lỗi đầy đủ khi API gặp sự cố hoặc key hết hạn/sai, trả về `null` để tránh lỗi ứng dụng.

3. **Tích hợp Auto-Reply Engine vào `ProcessFacebookWebhookJob`:**
   * Tại luồng xử lý tin nhắn của khách hàng (`$isFromCustomer = true`):
     * **Bước 1: Kiểm tra quy tắc từ khóa (Keyword Rules)**
       * Duyệt danh sách các luật kích hoạt (`is_active = true`) thuộc Fanpage đang nhận tin nhắn.
       * Kiểm tra xem tin nhắn của khách hàng có chứa hoặc khớp hoàn toàn với `keyword` không.
       * Nếu trùng khớp, chọn nội dung `reply_content` của quy tắc đó làm câu trả lời tĩnh và bỏ qua bước AI.
     * **Bước 2: Sử dụng AI thông minh (Gemini AI)**
       * Nếu không khớp bất kỳ từ khóa nào, và cuộc hội thoại đang bật chế độ AI (`$customer->ai_active === true`).
       * Sử dụng `GeminiService` để sinh câu trả lời dựa trên nội dung tin nhắn và một prompt định hướng có sẵn (ví dụ: tư vấn quần áo thời trang, lịch sự, ngắn gọn).
     * **Bước 3: Gửi phản hồi & Đồng bộ**
       * Nếu có câu trả lời (tĩnh hoặc AI), thực hiện lưu tin nhắn phản hồi vào bảng `interactions` (`is_from_customer = false`).
       * Gọi API Graph của Facebook gửi tin nhắn phản hồi tới khách hàng thật.
       * Phát sự kiện `MessageSent` qua WebSocket để cập nhật tức thì lên giao diện Live Chat Hub của Admin.

---

### ✅ Tiêu chí hoàn thành (DoD - Definition of Done)
* [ ] Biến cấu hình `GEMINI_API_KEY` hoạt động tốt thông qua file `.env`.
* [ ] Viết UnitTest độc lập cho `GeminiService` để kiểm tra độ chính xác của payload gửi đi và nhận về.
* [ ] Kiểm thử luồng tự động trả lời bằng từ khóa: Khi mô phỏng gửi webhook khớp từ khóa (ví dụ: "giá"), hệ thống tự phản hồi đúng nội dung tĩnh đã cấu hình.
* [ ] Kiểm thử luồng tự động trả lời bằng AI: Khi mô phỏng gửi webhook nội dung thông thường, hệ thống tự gọi Gemini sinh câu trả lời tự nhiên.
* [ ] Đảm bảo toàn bộ luồng tự động trả lời diễn ra bất đồng bộ trong hàng đợi Redis (`worker_zeflyo`) dưới 5 giây.
* [ ] Ghi nhận đầy đủ log lỗi nếu quá trình gọi API Gemini hoặc Facebook Graph thất bại.
