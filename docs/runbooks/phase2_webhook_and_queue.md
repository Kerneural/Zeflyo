# 📡 Runbook: Webhooks & Redis Queue Setup — Phase 2

> **Ngày thực hiện:** 2026-06-17  
> **Người thực hiện:** Agent (Antigravity)  
> **Mục đích:** Hướng dẫn triển khai, tích hợp cổng thu Webhook (GET/POST) và hệ thống hàng đợi bất đồng bộ (Redis Queue) phục vụ việc nhận và lưu tin nhắn/bình luận từ Facebook Graph API.

---

## 1. Mục tiêu kiến trúc & Yêu cầu của Meta

Facebook Webhook gửi thông báo thay đổi (tin nhắn mới hoặc bình luận mới trên bài viết) bằng một HTTP Request (POST) đến server của bạn.
Meta yêu cầu các tiêu chuẩn bắt buộc:
1.  **Phản hồi nhanh:** Server phải trả về phản hồi `200 OK` trong vòng **dưới 3 giây** (3000ms). Nếu quá thời gian này, Meta sẽ coi như request thất bại và gửi lại (retry) nhiều lần. Nếu tỷ lệ lỗi cao, Webhook của ứng dụng sẽ bị **Meta tạm khóa (disabled)**.
2.  **Xử lý bất đồng bộ (Asynchronous Queue):** Vì lý do trên, tuyệt đối không được thực hiện các tác vụ nặng (như truy vấn DB phức tạp, gọi API ngoài, xử lý AI, gửi mail...) trực tiếp bên trong controller xử lý request Webhook. Controller chỉ nhận payload thô, đẩy (dispatch) vào Queue Job, và trả về `200 OK` ngay lập tức.

---

## 2. Các thành phần đã triển khai ở Backend

Chúng ta đã thiết lập một luồng xử lý khép kín từ Webhook request cho tới hàng đợi và Database:

### 2a. Database Migrations & Models
Chúng ta đã tạo 2 bảng dữ liệu mới và chạy migrate thành công:
1.  **Bảng `customers` (Khách hàng tương tác):**
    *   *Mục đích:* Lưu trữ Page-Scoped ID (PSID) của khách hàng chat/bình luận với từng Fanpage.
    *   *Schema:* `id`, `fanpage_id` (FK), `fb_customer_id` (PSID, unique cho mỗi page), `name`, `avatar_url`, `timestamps`.
2.  **Bảng `interactions` (Hội thoại):**
    *   *Mục đích:* Lưu lịch sử tin nhắn hoặc bình luận.
    *   *Schema:* `id`, `customer_id` (FK), `fanpage_id` (FK), `type` (enum: `'message'`, `'comment'`), `fb_item_id` (ID tin nhắn/bình luận từ FB), `fb_post_id` (null nếu là tin nhắn, có giá trị nếu là bình luận bài viết), `content` (nội dung chữ), `is_from_customer` (bool), `timestamps`.

### 2b. FacebookWebhookController
Tạo mới tại [app/Http/Controllers/Webhook/FacebookWebhookController.php](file:///r:/_Projects/Eurus_Workspace/Zeflyo/backend/app/Http/Controllers/Webhook/FacebookWebhookController.php):
*   **Phương thức `verify(Request $request)` (GET):**
    *   Xác thực webhook URL khi đăng ký với Meta App.
    *   So khớp `hub.verify_token` từ request với giá trị cấu hình `FACEBOOK_WEBHOOK_VERIFY_TOKEN` trong `.env`.
    *   Nếu khớp, trả về giá trị `hub.challenge` dạng plain text để hoàn tất bắt tay (handshake).
*   **Phương thức `receive(Request $request)` (POST):**
    *   Nhận payload JSON thô.
    *   Dispatch job `ProcessFacebookWebhookJob::dispatch($payload)` vào hàng đợi.
    *   Trả về `200 OK` với dòng chữ `EVENT_RECEIVED` ngay lập tức.

### 2c. ProcessFacebookWebhookJob (Queue Worker Job)
Tạo mới tại [app/Jobs/ProcessFacebookWebhookJob.php](file:///r:/_Projects/Eurus_Workspace/Zeflyo/backend/app/Jobs/ProcessFacebookWebhookJob.php):
*   Công việc chạy ngầm trong Queue, tự động bóc tách và phân loại payload:
    *   **Nếu là tin nhắn Messenger (`messaging`):** Tìm hoặc tạo mới customer bằng PSID. Ghi nhận tin nhắn vào bảng `interactions` với type `'message'`.
    *   **Nếu là bình luận Fanpage (`feed` changes):** Tìm hoặc tạo mới customer. Ghi nhận bình luận vào bảng `interactions` với type `'comment'` kèm ID bài viết (`fb_post_id`).
*   **Đồng bộ Profile Khách hàng tự động:** Khi phát hiện khách hàng mới, Job sẽ tự động gọi API Graph của Facebook bằng Page Access Token tương ứng (được mã hóa tự động trong DB) để lấy tên (`first_name`, `last_name`) và link ảnh đại diện (`profile_pic`) để cập nhật vào bảng `customers` một cách bất đồng bộ mà không gây chậm hệ thống.

---

## 3. Khai báo API Routes

Các endpoint công khai dành cho Meta được khai báo tại [routes/api.php](file:///r:/_Projects/Eurus_Workspace/Zeflyo/backend/routes/api.php):
```php
// Facebook Webhook endpoints (Publicly accessible by Meta)
Route::get('/webhook/facebook', [FacebookWebhookController::class, 'verify']);
Route::post('/webhook/facebook', [FacebookWebhookController::class, 'receive']);
```

Chúng ta đã chạy `php artisan octane:reload` để cập nhật các route này vào bộ nhớ RAM của workers.

---

## 4. Kết quả Kiểm định thực tế (Smoke Testing)

Chúng ta đã tiến hành kiểm định đầy đủ hai luồng webhook bằng công cụ `Invoke-RestMethod` ngay trên cổng local:

### 4a. Kiểm tra xác thực (GET Verification)
Gọi request giả lập Meta gửi verify token:
*   *Kết quả:* Trả về mã thử thách `11223344` ở dạng text thô, HTTP Status `200 OK` ✅.

### 4b. Kiểm tra nhận tin nhắn (POST Payload)
Gửi một payload thô dạng JSON giả lập tin nhắn Messenger từ một khách hàng gửi tới Fanpage ID của Zeflyo Fashion Store:
*   *Kết quả:* Trả về `EVENT_RECEIVED` ngay lập tức (thời gian phản hồi < 0.05s) ✅.
*   *Kiểm tra Hàng đợi (Queue):* Job được tạo và đẩy thành công vào bảng `jobs` trong Database dưới cấu trúc queue ✅.

### 4c. Kiểm tra xử lý ngầm (Queue execution)
Khởi chạy Queue worker để xử lý Job đã đẩy vào hàng đợi:
```bash
docker compose exec app php artisan queue:work --once
```
*   *Kết quả:* Job chạy hoàn thành thành công trong 1 giây (`DONE`) ✅.
*   *Kiểm tra PostgreSQL:*
    *   Bảng `customers` tự động thêm 1 dòng mới: `fb_customer_id` = `"1234567"`, `name` = `"Facebook User"` ✅.
    *   Bảng `interactions` tự động thêm 1 dòng tin nhắn mới: `content` = `"hello test message"`, `type` = `"message"`, `is_from_customer` = `true` ✅.

---

## 5. Hướng dẫn thiết lập Tunnel kiểm thử Webhook thực tế

Để Facebook Developer Console kết nối được đến máy local của bạn, bạn cần thiết lập một cổng trung chuyển (Tunnel) bảo mật có HTTPS.

### Cách 1: Dùng Ngrok
1. Tải ngrok và chạy lệnh:
   ```bash
   ngrok http 80
   ```
2. Copy địa chỉ HTTPS được cấp (ví dụ: `https://abcd-12-34.ngrok-free.app`).
3. Webhook URL của bạn để cấu hình trên Meta App sẽ là:  
   `https://abcd-12-34.ngrok-free.app/api/webhook/facebook`
4. Verify Token là: `zeflyo_webhook_token_2026` (đã định nghĩa trong `.env`).

### Cách 2: Dùng Cloudflare Tunnel (Miễn phí & Ổn định hơn)
1. Tải `cloudflared` và chạy lệnh:
   ```bash
   cloudflared tunnel --url http://localhost:80
   ```
2. Copy link public `.trycloudflare.com` và cấu hình webhook URL tương tự như ngrok.

---

## 💡 Lệnh hữu ích để giám sát Queue & Webhook

*   **Chạy Queue Worker liên tục ở máy local:**
    ```bash
    docker compose exec app php artisan queue:work
    ```
*   **Kiểm tra xem có Job nào bị lỗi không:**
    ```bash
    docker compose exec app php artisan queue:failed
    ```
*   **Xóa sạch các job bị lỗi để chạy lại:**
    ```bash
    docker compose exec app php artisan queue:flush
    ```
