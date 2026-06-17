# 💾 SESSION MEMORY — Zeflyo Project
> *Last Checkpoint: 2026-06-16 | Status: Phase 1 Backend DONE — Frontend chưa bắt đầu*

---

## ✅ ĐÃ HOÀN THÀNH TRONG SESSION NÀY

### [Phase 1] Backend (Khoa) — **100% DONE**
- **Docker Compose** (`docker-compose.yaml`) đang chạy local với các containers:
  - `app_zeflyo` — Laravel 11 + Octane (RoadRunner, port 8000)
  - `nginx_zeflyo` — Nginx reverse proxy (port 80)
  - `db_zeflyo` — PostgreSQL 16 (port 5432)
  - `redis_zeflyo` — Redis (port 6379)
  - `soketi_zeflyo` — Soketi WebSocket server (port 6001/9601)
- **Packages đã cài trong container:**
  - `laravel/sanctum` (via `php artisan install:api`)
  - `laravel/socialite`
  - `laravel/octane` (đã có sẵn)
- **File đã tạo/sửa:**
  - `backend/app/Http/Controllers/Auth/FacebookAuthController.php` — Logic hoàn chỉnh:
    1. Nhận `access_token` (short-lived) từ frontend
    2. Exchange lấy `long_lived_user_token` qua Graph API `/oauth/access_token`
    3. Fetch profile user (`/me`) → `updateOrCreate` trong bảng `users`
    4. Fetch pages của user (`/me/accounts`) → `updateOrCreate` trong bảng `fanpages`
    5. Tạo Sanctum token → trả về `user + token` cho frontend
  - `backend/app/Models/User.php` — Thêm `HasApiTokens`, `fanpages()` HasMany relation, `avatar` vào fillable
  - `backend/app/Models/Fanpage.php` — Model đầy đủ với `$casts['access_token'] = 'encrypted'`
  - `backend/routes/api.php` — Route `POST /api/auth/facebook/callback`
  - `backend/database/migrations/2026_06_16_123129_create_fanpages_table.php` — Schema: `id, user_id (FK), fb_page_id (unique), name, access_token (encrypted text), avatar_url (nullable), is_active (bool, default false), timestamps`
  - `backend/.env` — Đã điền đầy đủ: `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, `FACEBOOK_REDIRECT_URI`, `DB_*`, `REDIS_*`
  - `backend/config/services.php` — Đã thêm block `facebook` với `client_id/secret/redirect`

### [Phase 1] DevOps (Hoàng) — **80% DONE**
- `docker-compose.yaml` đã tạo và hoạt động ✅
- README / local setup guide: **chưa viết** ❌
- Terraform AWS: **chưa bắt đầu** ❌

---

## ❌ CHƯA BẮT ĐẦU

### [Phase 1] Frontend (Tiến) — **0%**
- Khởi tạo Next.js 14/15 vào `frontend/`
- Cài Tailwind CSS + Shadcn/ui
- Màn hình Login với nút "Login with Facebook"
- Màn hình Dashboard chọn Fanpage (toggle switches)

> ⚠️ **Lưu ý:** Frontend KHÔNG chạy trong Docker. Dev chạy `npm run dev` trực tiếp trên host machine để tránh WSL2 file-watching lag. Production build thì deploy lên AWS S3 + CloudFront.

---

## 🔜 NEXT SESSION — VIỆC CẦN LÀM NGAY (Ưu tiên theo thứ tự)

### Bước 1 — Chạy migration (BẮT BUỘC trước khi test)
```bash
docker compose exec app php artisan migrate
```
> Tạo các bảng: `users`, `cache`, `jobs`, `personal_access_tokens`, `fanpages`

### Bước 2 — Test API bằng Postman/Thunder Client
- Endpoint: `POST http://localhost/api/auth/facebook/callback`
- Body: `{ "access_token": "<short-lived-token-thật-từ-FB>" }`
- Cần lấy test token từ Facebook Developer Debugger: https://developers.facebook.com/tools/accesstoken/

### Bước 3 — Khởi tạo Next.js Frontend
```bash
# Chạy ở host machine (KHÔNG dùng Docker)
cd r:\_Projects\Eurus_Workspace\Zeflyo\frontend
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```

### Bước 4 — Kết nối Frontend với Backend (Facebook Login Flow)
- Dùng thư viện `@greatsumini/react-facebook-login` (hoặc Facebook JS SDK) ở frontend
- Sau khi user đăng nhập FB, gọi `POST /api/auth/facebook/callback` với `access_token` nhận được
- Lưu Sanctum token vào `localStorage` / `httpOnly cookie`

---

## 🧠 KIẾN TRÚC & QUY TẮC QUAN TRỌNG (KHÔNG ĐƯỢC QUÊN)

- **Facebook Webhook:** Phản hồi `200 OK` trong < 3 giây → BẮT BUỘC dùng Laravel Queue để xử lý async
- **Token bảo mật:** Page access token được mã hóa tự động qua Eloquent cast `'encrypted'` — KHÔNG bao giờ lưu plaintext
- **API Graph version:** Dùng `v20.0` (tháng 6/2026, còn hạn dùng)
- **Sanctum token:** Frontend lưu token và gửi qua header `Authorization: Bearer <token>` cho mọi request cần auth
- **Code boundary:** Tiến (Fullstack) chỉ đụng vào Post Scheduler và UI forms. Hoàng + Khoa giữ toàn bộ webhook và real-time pipeline

---

## 📁 CẤU TRÚC FILE QUAN TRỌNG HIỆN TẠI

```
Zeflyo/
├── docker-compose.yaml          ✅ Đang chạy
├── backend/                     ✅ Laravel 11 (Octane + Sanctum + Socialite)
│   ├── .env                     ✅ Đã điền Facebook + DB + Redis keys
│   ├── routes/api.php           ✅ POST /api/auth/facebook/callback
│   ├── app/
│   │   ├── Models/User.php      ✅ HasApiTokens + fanpages relation
│   │   ├── Models/Fanpage.php   ✅ access_token encrypted cast
│   │   └── Http/Controllers/Auth/FacebookAuthController.php ✅
│   └── database/migrations/
│       └── 2026_06_16_*_create_fanpages_table.php ✅ (chưa chạy migrate!)
└── frontend/                    ❌ Chưa khởi tạo
```

---

## 📋 TASK CHECKLIST PHASE 1

- [x] Docker Compose local (5 containers)
- [ ] README / Local setup guide
- [ ] Terraform AWS skeleton
- [x] Laravel 11 khởi tạo trong `backend/`
- [x] Cài `sanctum`, `socialite`, `octane`
- [x] Cấu hình DB PostgreSQL trong `.env`
- [x] FacebookAuthController (logic đầy đủ)
- [x] Fanpage model + migration
- [x] API route `POST /api/auth/facebook/callback`
- [ ] **Chạy `php artisan migrate`** ← SESSION MỚI LÀM TRƯỚC TIÊN
- [ ] Test API với real Facebook token
- [ ] Frontend Next.js khởi tạo
- [ ] Frontend: Login screen
- [ ] Frontend: Dashboard Fanpage selection screen
