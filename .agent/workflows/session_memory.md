# 💾 SESSION MEMORY — Zeflyo Project
> Last Checkpoint: 2026-06-25 | Status: Calendar Daily Check-in & System Notifications Management System - 100% COMPLETE

---

## ⚡ Active Task Completed (Những việc ĐÃ HOÀN THÀNH trong session)

*   **Monthly Calendar Daily Check-in & Credit Sync:**
    *   **Backend (`UserCheckin.php`, `UserController.php`, migrations):**
        *   Tạo bảng `user_checkins` ghi nhận `user_id` và `checkin_date` cùng chỉ mục unique composite bảo vệ quy tắc điểm danh 1 lần mỗi ngày.
        *   Tạo endpoint `POST /api/user/checkin` xác thực ngày hiện tại của user dựa theo múi giờ, cộng +50 điểm (credits), cập nhật thông tin profile.
        *   Mở rộng API phản hồi profile (`UserController` và `FacebookAuthController`) trả về mảng `checkin_history` chứa các ngày đã điểm danh trong tháng hiện tại.
    *   **Frontend (`Sidebar.tsx`):**
        *   Tích hợp nút **"Lịch điểm danh" / "Điểm danh nhận +50"** trên thẻ thông tin điểm của Sidebar.
        *   Xây dựng modal lịch điểm danh hiển thị toàn bộ số ngày trong tháng.
        *   Xử lý 4 trạng thái hiển thị trực quan: **Đã điểm danh** (màu xanh lá kèm dấu check), **Hôm nay chưa nhận** (hiệu ứng nháy xanh lục rực rỡ, nhấn vào để nhận điểm), **Bỏ lỡ** (các ngày đã qua trong tháng nhưng không điểm danh, hiển thị màu xám khóa đỏ, không cho phép điểm danh bù), và **Tương lai** (các ngày tiếp theo bị khóa).
        *   Tự động đồng bộ số điểm mới ngay sau khi điểm danh thành công trên giao diện mà không cần tải lại trang.
        *   Hỗ trợ chế độ giả lập (Mock Mode) lưu lịch sử điểm danh qua `localStorage` và tự cộng điểm ảo.
    *   **Unit Tests (`SettingsTest.php`):** Bổ sung test case `test_user_can_checkin_and_claim_credits` và `test_user_cannot_checkin_twice_on_same_day` hoạt động ổn định.

*   **System Notifications & Admin Announcement Management System:**
    *   **Backend (`SystemNotification.php`, `SystemNotificationController.php`, migrations):**
        *   Tạo bảng `system_notifications` lưu trữ thông tin thông báo gồm: danh mục (feature, update, maintenance, event, info), tiêu đề/tóm tắt song ngữ (VI/EN), trạng thái ghim (`pinned`), cấu hình banner card và các khối nội dung chi tiết.
        *   Đăng ký API `GET /api/notifications` cho mọi tài khoản và các API quản trị `POST /api/admin/notifications`, `DELETE /api/admin/notifications/{id}` giới hạn quyền truy cập chỉ cho admin (`admin@zeflyo.io`).
    *   **Frontend (`Sidebar.tsx`):**
        *   Thiết kế biểu tượng Chuông thông báo trên Sidebar (kèm badge đỏ hiển thị số tin chưa đọc) và nút chuông nổi cho thiết bị di động.
        *   Xây dựng modal trung tâm thông báo dạng Dual-pane sang trọng:
            *   *Cột trái:* Danh sách tin nhắn phân loại theo Tab (Tất cả / Chưa đọc) và Bộ lọc danh mục (Tính năng mới, Cập nhật, Bảo trì, Sự kiện, Thông báo).
            *   *Cột phải:* Chi tiết nội dung thông báo được chọn gồm banner màu sắc gradient tương ứng danh mục và các khối nội dung động (Đoạn văn, Khối nổi bật, Gợi ý).
            *   *Mobile Flow:* Giao diện tự động chuyển thành cấu trúc Master-Detail mượt mà trên thiết bị di động.
        *   Lưu trữ trạng thái các thông báo đã đọc qua `localStorage` (`zeflyo_read_notifications`) để lưu vết số lượng tin chưa đọc.
        *   Xây dựng Form đăng thông báo hệ thống cho Admin (+ Đăng tin) hỗ trợ tạo nội dung động bilingual trực tiếp và tích hợp nút Thùng rác xóa tin nhanh.
    *   **Unit Tests (`SettingsTest.php`):** Thêm 4 test case bảo vệ API thông báo: tải tin, tạo tin admin, chặn user thường tạo tin, và xóa tin.

---

## 🧠 Semantic Context Essence (Tinh túy kiến thức & Quyết định thiết kế)
*   *Calendar No Retroactive Check-in:* Thiết kế khóa cứng các ngày đã qua (Missed) để không cho phép người dùng điểm danh bù, đảm bảo mục tiêu kích thích người dùng truy cập ứng dụng hàng ngày.
*   *Admin Identity Validation:* Xác định admin dựa trên email cứng `admin@zeflyo.io` ở cả frontend và backend, đồng bộ với email tài khoản demo hệ thống.
*   *Database-Driven Notifications:* Loại bỏ hoàn toàn mock data tĩnh ở client để hệ thống hoạt động 100% qua cơ sở dữ liệu. Bảng thông báo rỗng sẽ hiển thị trạng thái Empty State đẹp mắt, sẵn sàng để admin đăng thông báo đầu tiên qua UI.

---

## 🔜 Next Steps (3 hành động kỹ thuật trực tiếp kế tiếp)
- [ ] **Step 1:** Đồng bộ hóa dữ liệu credits (điểm) thực tế nhận được từ webhook SePay với hệ thống trừ điểm khi chạy AI Campaigns.
- [ ] **Step 2:** Tích hợp kiểm tra bảo mật (Db encryption) cho các token fanpage liên kết của người dùng.
- [ ] **Step 3:** Mở rộng xuất dữ liệu báo cáo danh sách giao dịch tổng hợp dưới dạng file Excel cho quản trị viên (Admin Panel).
