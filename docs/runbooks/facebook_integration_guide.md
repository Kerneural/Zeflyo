# Hướng Dẫn Cấu Hình & Tích Hợp Meta (Facebook API) cho Zeflyo

Tài liệu này làm rõ cơ chế hoạt động của Facebook OAuth, lý do teammate của bạn gặp lỗi **"Ứng dụng không hoạt động" (App Not Active)**, cách thêm người thử nghiệm (Testers) và điều kiện để một tài khoản Facebook có thể sử dụng Zeflyo.

---

## 1. Tại Sao Tài Khoản Của Bạn Vào Được, Nhưng Teammate Thì Không?

Lý do là vì **Ứng dụng Facebook (Meta App ID: 2068439784101224)** của bạn hiện đang ở **Chế độ phát triển (Development Mode)**.

### Chế độ phát triển (Development Mode):
- Đây là chế độ mặc định khi tạo ứng dụng trên [developers.facebook.com](https://developers.facebook.com).
- **Ai có quyền truy cập:** Chỉ những tài khoản Facebook được add trực tiếp vào danh sách **Vai trò (Roles)** của ứng dụng (gồm: Quản trị viên, Nhà phát triển, Người thử nghiệm).
- **Những người khác:** Khi click vào nút đăng nhập sẽ bị Facebook chặn lại và báo lỗi: **"Ứng dụng không hoạt động: Ứng dụng này hiện không thể truy cập..."** (như trong ảnh chụp màn hình của bạn).

### Chế độ hoạt động (Live Mode):
- Là chế độ công khai để bất kỳ ai trên thế giới cũng có thể bấm đăng nhập và cấp quyền cho Zeflyo.
- Để chuyển sang Live Mode, Meta yêu cầu:
  1. Cung cấp URL Chính sách bảo mật (Privacy Policy) và Điều khoản dịch vụ.
  2. Thực hiện **Xét duyệt ứng dụng (App Review)** đối với các quyền nâng cao (`pages_manage_posts`, `pages_read_engagement`, `pages_show_list`, `pages_messaging`).

---

## 2. Cách Để Teammate (Ví dụ: Khoa Ha) Có Thể Đăng Nhập & Test 

Khi ứng dụng đang ở **Development Mode**, bạn (chủ sở hữu App) phải cấp quyền Tester cho teammate của mình:

1. Đăng nhập vào trang quản trị: [developers.facebook.com](https://developers.facebook.com).
2. Chọn ứng dụng **Zeflyo**.
3. Ở menu bên trái, chọn **App Roles (Vai trò)** -> click tiếp vào mục **Roles (Vai trò)**.
4. Ở phần **Testers (Người thử nghiệm)**, bấm **Add Testers (Thêm người thử nghiệm)**.
5. Nhập **Facebook ID** hoặc tên người dùng của teammate (Khoa Ha) rồi bấm **Submit**.
6. **Teammate của bạn cần làm gì:** 
   - Truy cập vào trang [developers.facebook.com](https://developers.facebook.com) bằng tài khoản Facebook của họ.
   - Nhấp vào phần thông báo (hoặc vào danh sách ứng dụng) để **Chấp nhận lời mời thử nghiệm (Accept invitation)**.
   - Sau khi chấp nhận, teammate của bạn sẽ đăng nhập vào `https://zeflyo.duckdns.org` bình thường mà không bị lỗi nữa.

---

## 3. Điều Kiện Về Tài Khoản Facebook Để Sử Dụng Zeflyo

Để sử dụng các tính năng tự động hóa của Zeflyo, tài khoản Facebook của người dùng **phải đáp ứng các điều kiện sau**:

### A. Phải có sẵn ít nhất một Fanpage Facebook (Trang):
- Zeflyo là công cụ quản lý và tự động hóa **Fanpage** (Trang doanh nghiệp), không tự động hóa trên **Trang cá nhân (Personal Profile)** do chính sách bảo mật của Meta.
- Nếu người dùng Facebook mới hoàn toàn, **chưa có Fanpage nào**:
  - Khi đăng nhập vào Zeflyo, API `/me/accounts` của Facebook sẽ trả về danh sách trống (`[]`).
  - Hệ thống sẽ báo không tìm thấy trang nào để kết nối.
- **Giải pháp:** Người dùng đó phải vào Facebook của họ, tự tạo một Fanpage mới (hoặc được cấp quyền quản trị một Fanpage có sẵn). Sau đó quay lại Zeflyo đăng nhập thì trang đó sẽ xuất hiện để kết nối.

### B. Cấp đầy đủ quyền khi đăng nhập (Authorize Permissions):
- Trong quá trình đăng nhập qua Facebook, người dùng phải tích chọn cấp toàn bộ quyền mà ứng dụng yêu cầu (đọc danh sách trang, quản lý nội dung bài viết, đọc tin nhắn).
- Nếu người dùng bỏ tích hoặc từ chối cấp quyền, hệ thống sẽ báo lỗi: **"User cancelled Facebook login or did not fully authorize."** (như ở ảnh thứ 3 bạn gửi).
- **Cách sửa lỗi:** Người dùng cần đăng xuất, bấm đăng nhập lại và chọn "Cấp tất cả quyền" (Hoặc vào *Cài đặt tài khoản Facebook -> Tiện ích tích hợp và Ứng dụng* để xóa Zeflyo đi và cấp quyền lại từ đầu).
