# 🎫 Jira Ticket: ZEF-202 (Tiến - Fullstack / Frontend)
## Phát Triển Module Post Scheduler & Giao Diện Quản Lý Luật Auto-Reply

* **Ticket ID:** ZEF-202
* **Summary:** Xây dựng module Post Scheduler (Lên lịch đăng bài) và màn hình cấu hình Luật Auto-Reply
* **Assignee:** Tiến (Fullstack/Frontend)
* **Story Point:** 8

---

### 📖 Mô tả (Description)
Xây dựng hai module độc lập quan trọng cho Zeflyo để tăng cường khả năng tự động hóa:
1. **Post Scheduler:** Giúp người dùng lên lịch soạn thảo nội dung bài viết kèm hình ảnh và tự động đăng bài lên nhiều Fanpage đã kết nối theo đúng giờ hẹn.
2. **Auto-Reply Rules:** Cho phép người dùng cấu hình quản lý danh sách các luật phản hồi nhanh bằng từ khóa cố định trực tiếp từ giao diện.

---

### 🛠️ Yêu cầu triển khai (Implementation Requirements)

#### 1. Module Lên lịch đăng bài (Post Scheduler)
* **Database Setup:**
  * Tạo migration bảng `scheduled_posts` chứa: `id`, `user_id` (FK), `fanpage_ids` (JSON - lưu mảng ID các Fanpage muốn đăng), `content` (TEXT), `image_url` (VARCHAR, có thể null), `scheduled_at` (TIMESTAMP - thời gian hẹn giờ), `status` (enum: `draft`, `pending`, `published`, `failed`), `error_log` (TEXT, null), `timestamps`.
* **Backend Core:**
  * API `POST /api/posts/schedule` để tiếp nhận dữ liệu bài viết hẹn giờ và lưu vào DB.
  * Viết Console Command `App\Console\Commands\PublishScheduledPosts` (`php artisan posts:publish`):
    * Chạy ngầm mỗi phút bằng cách đăng ký `$schedule->command('posts:publish')->everyMinute();` trong `routes/console.php`.
    * Logic: Quét DB tìm các bài viết có `scheduled_at <= NOW()` và `status = 'pending'`.
    * Với mỗi bài, lấy token tương ứng của từng Fanpage trong `fanpage_ids` để gọi Facebook API `/v20.0/{page-id}/feed` (hoặc `/photos` nếu có ảnh kèm theo) để đăng bài thật lên Fanpage.
    * Cập nhật trạng thái bài viết thành `published` hoặc `failed` kèm thông tin log lỗi chi tiết.
* **Frontend UI (Next.js `/scheduler` Page):**
  * Thiết kế bố cục **Split Pane Layout** (2 cột):
    * **Cột trái (Soạn thảo):** Form nhập nội dung bài viết, ô tải lên hình ảnh (drag-and-drop file uploader), ô chọn ngày giờ (sử dụng Shadcn Calendar Popover, chặn không cho chọn ngày giờ trong quá khứ), và danh sách checkbox các Fanpage muốn đăng.
    * **Cột phải (Facebook Feed Preview):** Thiết kế mockup thời gian thực giả lập bài đăng Facebook (hiển thị avatar/tên Page đang chọn, nội dung chữ đang gõ, hình ảnh hiển thị chuẩn tỷ lệ, các nút Like/Comment/Share giả lập) để Admin xem trước trực quan.

#### 2. Giao diện Cấu hình Luật Auto-Reply
* **Database Setup:**
  * Tạo migration bảng `auto_reply_rules` chứa: `id`, `fanpage_id` (FK), `keyword` (VARCHAR - từ khóa nhận diện), `reply_content` (TEXT - nội dung trả lời), `is_active` (BOOLEAN, mặc định true), `timestamps`.
* **Backend APIs:**
  * Viết các API CRUD đầy đủ cho bảng `auto_reply_rules` bọc trong middleware `auth:sanctum`.
* **Frontend UI (Next.js `/rules` Page):**
  * Thiết kế giao diện danh sách luật dưới dạng Cards hoặc Data Table.
  * Hiển thị từ khóa dạng **Badges** gọn gàng, trực quan.
  * Bổ sung nút **Switch Toggle** trạng thái hoạt động (`is_active`) trực tiếp trên giao diện để bật/tắt nhanh không cần vào trang sửa chi tiết.
  * Thêm hiệu ứng micro-animations mượt mà khi người dùng tương tác chuyển đổi.

---

### ✅ Tiêu chí hoàn thành (DoD - Definition of Done)
* [ ] Tạo thành công migrations và các Eloquent models liên quan không phát sinh lỗi SQL.
* [ ] Kiểm thử command `posts:publish` chạy chính xác qua scheduler hàng phút. Bài viết hẹn giờ tự động đăng lên Facebook (hoặc ghi log lỗi nếu token sai/hết hạn).
* [ ] Giao diện soạn thảo Scheduler hiển thị Mockup Preview khớp 100% dữ liệu đang nhập ở thời gian thực.
* [ ] Giao diện quản lý luật Auto-reply cho phép người dùng CRUD và Toggle nhanh trạng thái hoạt động tức thì.
* [ ] Toàn bộ code frontend được kiểm tra build production thành công, tối ưu hóa CSS và không bị lỗi typescript.
