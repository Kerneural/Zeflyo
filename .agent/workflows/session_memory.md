# 💾 SESSION MEMORY — Zeflyo Project
> *Last Checkpoint: 2026-06-17 | Status: Phase 2 (Webhooks & Queue) — 100% COMPLETE*

---

## ✅ ĐÃ HOÀN THÀNH TRONG SESSION NÀY

### [Phase 1] Backend & Frontend Setup — **100% DONE**
- **Docker Compose** local ổn định (Nginx, App, Postgres, Redis, Soketi).
- **Laravel 11 & Next.js v16+** templates, setup và cấu hình Socialite Login.
- **Onboarding Automation:** Đã tạo file `setup.sh` và viết lại `README.md` giúp team startup dự án chỉ bằng 1 lệnh duy nhất. Sửa lỗi thiếu `intl` extension bằng cách cập nhật Dockerfile.
- **Fanpage Management API:** Endpoint đồng bộ danh sách Fanpage và bật/tắt tự động hóa live database.

### [Phase 2] Webhooks & Queue Setup — **100% DONE**
- **Database Migrations & Models:**
  - Tạo mới bảng `customers` (lưu thông tin PSID, tên, ảnh của khách hàng) và bảng `interactions` (lưu tin nhắn/bình luận, ID bài đăng, chiều người gửi).
  - Khởi tạo models `Customer.php` và `Interaction.php` định nghĩa đầy đủ fillable và các mối quan hệ `belongsTo` / `hasMany`.
- **FacebookWebhookController:**
  - Tạo các endpoint `GET /api/webhook/facebook` (handshake verification) và `POST /api/webhook/facebook` (nhận payload tin nhắn/comment).
  - Tích hợp cấu hình `FACEBOOK_WEBHOOK_VERIFY_TOKEN` bảo mật.
  - Phản hồi `200 OK` ngay lập tức dưới 0.05s để đáp ứng giới hạn 3s của Meta.
- **ProcessFacebookWebhookJob:**
  - Tạo Queue Job bóc tách payload thô trong background worker.
  - Phân loại: Tin nhắn Messenger (`messaging`) và bình luận bài viết (`feed`).
  - Hỗ trợ gọi Facebook API tự động đồng bộ tên và ảnh đại diện khách hàng từ PSID bất đồng bộ để tránh nghẽn luồng chính.
- **Kiểm thử Pipeline:**
  - Test GET verification: Thành công ✅.
  - Test POST payload: Thành công đẩy vào Queue DB `jobs` table ✅.
  - Test chạy Worker: Xử lý thành công lưu bản ghi `Customer` và `Interaction` vào Postgres Database ✅.

---

## ❌ CHƯA BẮT ĐẦU (Kế hoạch Phase 3)

- **Phase 3: Live Chat Hub & WebSockets Real-Time**
  - Cấu hình Soketi broadcast server.
  - Tích hợp Laravel Echo phát tin nhắn mới đến Client Next.js.
  - Xây dựng giao diện Hộp thư tập trung (Live Chat Hub) để nhắn tin trực tiếp.

---

## 🔜 NEXT SESSION — VIỆC CẦN LÀM NGAY (Ưu tiên theo thứ tự)

1.  **Cấu hình Soketi Broadcasting:**
    *   Cấu hình file `config/broadcasting.php` sử dụng driver `pusher` trỏ vào container `soketi:6001`.
    *   Tạo Event `MessageReceived` ở Laravel phát tin nhắn mới nhận được trong Queue Job.
2.  **Thiết kế Chat UI:**
    *   Tiến lo phần UI hiển thị danh sách hội thoại và khung chat trên Next.js.
    *   Khoa viết API gửi tin nhắn trả lời (`POST /api/messages/send`) gọi Graph API gửi ngược lại Messenger của khách hàng.

---

## 🧠 KIẾN TRÚC & QUY TẮC QUAN TRỌNG (KHÔNG ĐƯỢC QUÊN)

- **Facebook Webhook:** Phải phản hồi `200 OK` trong < 3 giây để tránh Meta tắt kết nối. Bắt buộc dùng Laravel Queue (`jobs` table trên database) để xử lý async.
- **Token bảo mật:** Page access token luôn được mã hóa trong DB qua Eloquent cast `encrypted`.
- **API Graph version:** Dùng `v20.0` (Tháng 6/2026).
- **Phân chia công việc:** Tiến lo UI & Scheduler; Hoàng/Khoa chịu trách nhiệm Webhook và real-time pipeline.

---

## 📁 CẤU TRÚC FILE QUAN TRỌNG HIỆN TẠI

```
Zeflyo/
├── docker-compose.yaml          # Quản lý 5 containers
├── backend/                     # Laravel 11 Backend
│   ├── routes/api.php           # Định tuyến Webhook và API
│   ├── app/
│   │   ├── Models/Customer.php      # Model khách hàng tương tác
│   │   ├── Models/Interaction.php   # Model tin nhắn / comment
│   │   ├── Jobs/ProcessFacebookWebhookJob.php           # Queue Job xử lý thô
│   │   └── Http/Controllers/Webhook/FacebookWebhookController.php # Endpoint Webhook
│   └── database/migrations/
│       ├── 2026_06_17_060236_create_customers_table.php    # Migration bảng khách
│       └── 2026_06_17_060244_create_interactions_table.php # Migration bảng tương tác
└── frontend/                    # Next.js App
    ├── src/app/globals.css      # CSS styles (Theme dark, ambient glows, glassmorphism)
    └── src/app/page.tsx         # Dashboard chính (Xử lý Mock & Real Auth, Event feeds)
```

---

## 📋 TASK CHECKLIST PHASE 1 & 2

### Phase 1 (Đã Xong)
- [x] Docker Compose local (5 containers)
- [x] README / Local setup guide / setup.sh tự động hóa
- [x] Laravel 11 & Next.js v16+ templates
- [x] Facebook Login Socialite + Fanpage toggle API
- [x] Chạy migration và build thành công 100% không lỗi

### Phase 2 (Đã Xong)
- [x] Tạo migrations và models `Customer` & `Interaction`
- [x] Chạy migration tạo 2 bảng Postgres
- [x] FacebookWebhookController (GET verify handshake, POST receiver)
- [x] ProcessFacebookWebhookJob (phân loại messaging/feed, đồng bộ profile)
- [x] Cấu hình verify token bảo mật `.env`
- [x] Smoke test thành công cả 2 luồng và chạy queue worker lưu DB chuẩn xác
