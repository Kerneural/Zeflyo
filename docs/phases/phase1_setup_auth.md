# Phase 1: Setup Môi Trường & Core Authentication (Ngày 1 - 3)

## 🎯 Mục tiêu
*   Thiết lập môi trường Docker local đồng nhất cho toàn bộ team.
*   Khởi tạo dự án Laravel 11 và Next.js.
*   Tích hợp thành công đăng nhập Facebook Login (OAuth 2.0) lấy Long-lived Page Access Token.

---

## 👥 Phân công nhiệm vụ chi tiết

### 1. Hoàng (PM & DevOps)
*   **Công việc 1: Khởi tạo Docker-compose local**
    *   Tạo file `docker-compose.yml` bao gồm các service:
        *   `laravel-app`: Dockerfile sử dụng PHP 8.3-cli chạy Laravel Octane (RoadRunner).
        *   `nginx`: Port 80, reverse proxy trỏ về Laravel Octane (cổng 8000).
        *   `postgres`: Database chính (port 5432).
        *   `redis`: Cache và Queue driver (port 6379).
    *   *Sản phẩm:* File `docker-compose.yml` chạy thành công bằng lệnh `docker-compose up -d`.
*   **Công việc 2: Cấu hình repository & Gitflow**
    *   Thiết lập cấu trúc thư mục dự án (Monorepo hoặc 2 folder `backend/` và `frontend/`).
    *   Tạo nhánh `main` và `staging`, cấu hình khóa bảo vệ 2 nhánh này trên GitHub.

### 2. Khoa
*   **Công việc 1: Khởi tạo Laravel 11 Backend**
    *   Khởi tạo dự án Laravel 11 trong thư mục `backend/`.
    *   Cài đặt các gói: `laravel/sanctum` (cho API Token), `laravel/socialite` (cho Facebook OAuth), `laravel/octane`.
*   **Công việc 2: Facebook Login API & Token Security**
    *   Cấu hình Facebook Provider trong Socialite (`config/services.php`).
    *   Tạo API endpoint `/api/auth/facebook/callback` để:
        1. Nhận access token ngắn hạn từ client.
        2. Gọi API Facebook đổi lấy **Long-lived User Access Token** (hạn 60 ngày).
        3. Gọi API Facebook `/me/accounts` lấy danh sách Fanpages và đổi các short-lived token của page thành **Long-lived Page Access Token** (không hết hạn).
    *   Mã hóa toàn bộ Page Access Tokens trước khi lưu vào database (Sử dụng Laravel Eloquent Casts: `encrypted`).

### 3. Tiến (Fullstack Developer)
*   **Công việc 1: Khởi tạo Next.js Frontend**
    *   Khởi tạo dự án Next.js bằng TypeScript trong thư mục `frontend/`.
    *   Cài đặt Tailwind CSS và **Shadcn/ui** làm UI Framework. Thiết lập theme (hỗ trợ Dark/Light mode).
*   **Công việc 2: Giao diện Login & Sync Page**
    *   Thiết kế trang Đăng nhập (`/login`) với nút "Đăng nhập bằng Facebook".
    *   Xây dựng luồng gọi Facebook SDK ở Client, lấy User Access Token truyền về cho Backend (Khoa) qua API.
    *   Thiết kế giao diện quản lý trang (`/dashboard/pages`) hiển thị danh sách các Fanpage đồng bộ từ Backend về, có nút bật/tắt (Switch) kích hoạt chăm sóc tự động cho từng page.

---

## 🗄️ Thiết kế Cơ sở dữ liệu (Database Schema)

Tiến và Khoa phối hợp tạo migrations cho các bảng sau:

### Bảng `users`
```php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->string('password')->nullable(); // Vì đăng nhập qua FB
    $table->string('avatar')->nullable();
    $table->rememberToken();
    $table->timestamps();
});
```

### Bảng `fanpages`
```php
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
```

---

---

## 🎨 Hướng dẫn UI/UX & Design System (Antigravity Kit)

Để đảm bảo sản phẩm đạt tiêu chuẩn cao cấp, hiện đại và thu hút người dùng ngay từ lần đầu truy cập, Tiến (Frontend) cần áp dụng các bộ quy tắc sau khi dựng giao diện:

### 1. Phong cách thiết kế (Style Pattern)
*   **Phong cách:** **Clean SaaS / Soft UI Evolution**
*   **Đặc điểm:** Các phần tử giao diện có các góc bo mềm mại (`rounded-xl` đến `rounded-3xl`), sử dụng bóng đổ tinh tế (`shadow-sm` đến `shadow-md`), hạn chế viền đen cứng mà sử dụng viền xám nhạt (`border-slate-100` hoặc `border-slate-800`).
*   **Độ mượt mà:** Bắt buộc cấu hình hiệu ứng chuyển tiếp (transition) từ `150ms` đến `300ms` với hàm easing `ease-in-out` cho tất cả các trạng thái hover/focus của nút và các thẻ tương tác.

### 2. Bảng màu sắc (Color Palette)
*   **Primary (Màu chủ đạo):** `#2563EB` (Royal Blue) - Thể hiện sự chuyên nghiệp và an toàn công nghệ.
*   **Secondary (Màu phụ):** `#475569` (Slate Gray) - Dùng cho các tiêu đề phụ, icon và mô tả.
*   **CTA / Accent (Màu nhấn):** `#F97316` (Orange Amber) - Dùng duy nhất cho các nút hành động quan trọng (ví dụ: Nút "Kích hoạt tự động", "Bật chatbot").
*   **Background (Màu nền):** 
    *   *Light Mode:* `#F8FAFC` (Slate White)
    *   *Dark Mode:* `#0F172A` (Slate Dark)
*   **Text (Chữ):**
    *   *Light Mode:* `#0F172A` (Slate Dark)
    *   *Dark Mode:* `#F8FAFC` (Slate White)

### 3. Font chữ & Typography
*   **Heading Font (Tiêu đề):** **Outfit** (tạo cảm giác hiện đại, sang trọng).
*   **Body Font (Nội dung):** **Inter** (tối ưu hóa khả năng đọc dữ liệu số, bảng biểu).
*   **Cách tích hợp (Google Fonts):**
    ```html
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300..800&family=Outfit:wght@400..900&display=swap');
    ```

### 4. Lỗi thiết kế cần tránh (Anti-patterns)
*   🚫 **Không** sử dụng màu đen tuyệt đối `#000000` làm nền ở Dark mode (dùng màu Slate `#0F172A` hoặc `#1E293B`).
*   🚫 **Không** lạm dụng các dải màu gradient màu hồng/tím quá sặc sỡ làm mất đi độ chuyên nghiệp của công cụ quản trị.
*   🚫 **Không** sử dụng Emoji làm icon điều hướng (Sử dụng bộ thư viện SVG chuẩn như **Lucide Icons**).

---

## 🧪 Kiểm định & Verify ở cuối Phase
1.  **Chạy local:** Cả team kéo code về, chạy `docker-compose up -d`, chạy các migrations thành công.
2.  **Đăng nhập thử nghiệm:** Click nút đăng nhập FB trên giao diện Next.js -> Login thành công -> Lưu thành công Page Access Token vào DB ở dạng mã hóa.
3.  **Verify Lệnh:** Chạy `php artisan test` kiểm tra luồng login không có lỗi HTTP.
