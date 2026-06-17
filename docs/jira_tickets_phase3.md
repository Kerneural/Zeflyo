# 🎫 Jira Tickets for Phase 3: Live Chat Hub & WebSockets

Dưới đây là nội dung chi tiết của các Jira Ticket dành cho hai thành viên **Khoa (Backend)** và **Tiến (Frontend)** để thực hiện Phase 3. Tài liệu này cũng đã được lưu tại [jira_tickets_phase3.md](file:///r:/_Projects/Eurus_Workspace/Zeflyo/docs/jira_tickets_phase3.md).

---

## 1. 🎫 Ticket dành cho Khoa (Core Backend)

* **Ticket ID:** ZEF-101
* **Summary:** Triển khai Laravel Broadcasting (Soketi) & APIs hội thoại cho Live Chat Hub
* **Assignee:** Khoa (Core Backend)
* **Story Point:** 5

### 📖 Mô tả (Description)
Triển khai hệ thống truyền phát sự kiện thời gian thực (Broadcasting) thông qua cổng WebSocket Soketi. Đồng thời, xây dựng các API RESTful phục vụ giao diện chat bao gồm: Lấy danh sách hội thoại của trang hoạt động, tải lịch sử tin nhắn của một khách hàng, và tiếp nhận tin nhắn phản hồi của Admin để gửi ngược lại cho khách hàng qua Facebook Graph API.

---

### 🛠️ Yêu cầu triển khai (Implementation Requirements)

1. **Broadcasting Setup (Soketi integration):**
   * Chạy lệnh cài đặt của Laravel 11 để kích hoạt kênh phát sóng:
     ```bash
     php artisan install:broadcasting --pusher --without-node --no-interaction
     ```
   * Cấu hình driver kết nối trong file `.env` sử dụng driver `pusher` trỏ về container `soketi`:
     * `BROADCAST_CONNECTION=pusher`
     * `PUSHER_HOST=soketi`
     * `PUSHER_PORT=6001`
     * `PUSHER_SCHEME=http`
   * Đảm bảo cấu hình Nginx định tuyến chính xác các yêu cầu `/app` và `/socket.io` sang Soketi port 6001.

2. **Broadcast Events:**
   * Tạo Event `App\Events\MessageReceived` implements `ShouldBroadcast`:
     * Kênh phát: Kênh private đại diện cho Fanpage `private-fanpage.{fanpageId}`.
     * Dữ liệu truyền đi: Chứa payload tin nhắn (`interaction`) và thông tin khách hàng (`customer`).
   * Tạo Event `App\Events\MessageSent` implements `ShouldBroadcast`:
     * Phát đi khi Admin gửi tin phản hồi từ giao diện.
     * Kênh phát: `private-fanpage.{fanpageId}`.
   * Cập nhật `ProcessFacebookWebhookJob` để phát sự kiện `MessageReceived` ngay sau khi lưu tin nhắn/bình luận mới của khách thành công vào database.

3. **RESTful APIs cho Chat Hub:**
   * **`GET /api/conversations`**:
     * Trả về danh sách khách hàng có tương tác (được sắp xếp theo thời gian của tin nhắn/bình luận mới nhất giảm dần).
     * Đi kèm thông tin: `customer_id`, `customer_name`, `avatar_url`, `last_interaction_text`, `last_interaction_time`, `is_active` (trạng thái bật/tắt AI của cuộc chat này).
   * **`GET /api/conversations/{customerId}/messages`**:
     * Trả về danh sách tin nhắn/bình luận giữa Fanpage và khách hàng này, hỗ trợ phân trang (Pagination).
   * **`POST /api/conversations/{customerId}/messages`**:
     * Nhận tin phản hồi của Admin (`content` dạng text).
     * Ghi nhận tin nhắn phản hồi vào bảng `interactions` với trạng thái `is_from_customer = false`.
     * Sử dụng **Page Access Token** tương ứng để gọi API Meta: `POST https://graph.facebook.com/v20.0/me/messages` gửi tin nhắn Messenger cho khách hàng (sử dụng Laravel Http Client kèm xử lý try-catch bắt lỗi token hết hạn).
     * Phát sự kiện `MessageSent` lên WebSocket.

---

### ✅ Tiêu chí hoàn thành (DoD - Definition of Done)
* [ ] Chạy thành công lệnh `php artisan install:broadcasting` và tạo file `routes/channels.php`.
* [ ] Kiểm thử WebSocket kết nối thành công từ server PHP sang container Soketi không bị lỗi xác thực.
* [ ] File log Laravel không xuất hiện lỗi kết nối Redis/Pusher khi dispatch sự kiện phát sóng.
* [ ] Viết đầy đủ unit/integration test cho 3 API: Lấy danh sách, Lấy chi tiết tin nhắn, và Gửi tin nhắn.
* [ ] Facebook API Client tự động lấy Page Token tương ứng từ database để gửi tin, có fallback log lỗi rõ ràng khi token bị lỗi/hết hạn.

---
---

## 2. 🎫 Ticket dành cho Tiến (Fullstack / Frontend)

* **Ticket ID:** ZEF-102
* **Summary:** Xây dựng giao diện Live Chat Hub 3 cột và tích hợp Laravel Echo kết nối WebSocket
* **Assignee:** Tiến (Fullstack/Frontend)
* **Story Point:** 8

### 📖 Mô tả (Description)
Xây dựng giao diện Hộp thư tập trung (Live Chat Hub) hoàn chỉnh với thiết kế Premium Glassmorphic 3 cột. Đồng thời tích hợp thư viện `laravel-echo` và `pusher-js` để nhận diện các sự kiện tin nhắn mới từ khách hàng và đẩy thẳng lên giao diện chat theo thời gian thực mà không cần tải lại trang (F5).

---

### 🛠️ Yêu cầu triển khai (Implementation Requirements)

1. **Giao diện Chat Hub 3 Cột (Pancake Glassmorphism Layout):**
   * **Cột 1 (Sidebar danh sách chat):**
     * Hiển thị danh sách khách hàng, Avatar, Tên, nội dung tin nhắn cuối cùng kèm thời gian.
     * Nếu có tin nhắn mới chưa đọc, hiển thị Badge chấm cam nổi có hiệu ứng nhấp nháy (`animate-pulse-glow`).
     * Cuộc hội thoại đang chọn phải có viền trái nổi bật (`border-l-4 border-blue-600`).
   * **Cột 2 (Khung chat chính):**
     * Hiển thị bong bóng hội thoại: Khách hàng căn trái (màu xám nhạt), Admin/AI căn phải (màu xanh dương thương hiệu).
     * Sử dụng thư viện phản hồi hành động cuộn tự động. Đảm bảo khi có tin nhắn mới, khung chat tự động cuộn xuống dưới cùng (`scrollTo({ behavior: 'smooth' })`).
     * Ô nhập liệu phản hồi của Admin có hỗ trợ nút gửi bằng phím `Enter` (không bị nhảy dòng) và giữ phím `Shift + Enter` để xuống dòng.
   * **Cột 3 (Chi tiết khách hàng):**
     * Hiển thị thông tin Profile khách hàng, Fanpage nguồn.
     * Thiết kế một nút gạt Toggle Switch: **"Kích hoạt tự động trả lời AI"** cho riêng cuộc hội thoại này (gọi API để bật/tắt AI auto-reply cho khách hàng cụ thể).

2. **Tích hợp Laravel Echo Client:**
   * Cài đặt dependencies: `npm install laravel-echo pusher-js`.
   * Khởi tạo file cấu hình kết nối Echo Client kết nối về cổng `80/443` thông qua địa chỉ host của trình duyệt (`window.location.hostname`).
   * Lắng nghe kênh tư nhân: `private-fanpage.{fanpageId}`.
   * **Xử lý sự kiện thời gian thực:**
     * Khi nhận sự kiện `MessageReceived`: Thêm tin nhắn mới vào cuộc hội thoại hiện tại (nếu đang mở), hoặc cập nhật tin nhắn cuối cùng và tăng badge chưa đọc ở Sidebar (nếu đang đóng).
     * Khi nhận sự kiện `MessageSent` (Admin khác gửi hoặc AI gửi): Thêm tin nhắn phản hồi của shop vào giao diện chat.
   * **WebSocket Indicator:** Hiển thị một chấm tròn nhỏ ở thanh tiêu đề thể hiện trạng thái kết nối WebSocket (Xanh lá = Đã kết nối, Vàng = Đang kết nối lại, Đỏ = Mất kết nối).

3. **React Performance Optimization:**
   * Sử dụng `React.memo` cho component bong bóng tin nhắn (`MessageBubble`) để tránh re-render giật lag khi danh sách tin nhắn lớn.
   * Thêm bộ xương tải trang (Skeleton Loaders) khi chuyển đổi giữa các cuộc hội thoại.

---

### ✅ Tiêu chí hoàn thành (DoD - Definition of Done)
* [ ] Giao diện được thiết kế chuẩn Responsive, hỗ trợ mượt mà trên cả máy tính và thiết bị di động (ở di động, ẩn cột 3 và hiển thị cột 1/2 dạng trượt slide).
* [ ] Kết nối WebSocket mở thành công ở Client (kiểm tra tab Network/WS trong F12 hiển thị `101 Switching Protocols`).
* [ ] Nhận tin nhắn từ Facebook và hiển thị ngay trên UI trong vòng dưới 1 giây mà không cần F5.
* [ ] Nút gửi tin nhắn hoạt động đúng, tự động xóa sạch ô nhập liệu sau khi gửi thành công và hiển thị tin nhắn mới ở góc phải.
* [ ] Nút gạt bật/tắt AI lưu đúng trạng thái xuống Backend.
