---
name: workflow_efficiency
description: Quy tắc tối ưu hóa tốc độ làm việc, tiết kiệm token và tránh lặp lại lỗi cho dự án Next.js & Laravel 11.
---

# Cẩm Nang Rút Kinh Nghiệm & Tối Ưu Hóa Quy Trình (Next.js & Laravel)

Tài liệu này ghi lại các bài học kinh nghiệm và quy tắc làm việc tối ưu nhằm tránh lặp lại lỗi, giảm thời gian xử lý và tiết kiệm token tối đa cho dự án Zeflyo.

---

## 1. Tối ưu hóa Token qua việc đọc/tìm kiếm thông tin (Context Budget)
*   **Bài học:** Đọc toàn bộ thư mục lớn hoặc gọi quá nhiều tool nhỏ nhặt (như đọc file, grep search liên tục) gây lãng phí ngân sách Token của phiên chat.
*   **Quy tắc:**
    *   Sử dụng `list_dir` có mục tiêu trước khi đi sâu vào đọc code.
    *   Hạn chế chèn toàn bộ nội dung file lớn vào chat nếu chỉ cần chỉnh sửa một đoạn nhỏ. Sử dụng `view_file` với tham số `StartLine` và `EndLine`.
    *   Gộp các chỉnh sửa không liên tiếp trong cùng một file vào một cuộc gọi `multi_replace_file_content` duy nhất thay vì gọi `replace_file_content` nhiều lần liên tục.

## 2. Quy tắc phát triển Webhook & WebSockets
*   **Webhook Facebook**: Yêu cầu phản hồi tức thời (`200 OK` < 3 giây). Do đó, không được xử lý logic nặng trực tiếp trong Webhook Controller. Phải đẩy ngay dữ liệu vào Laravel Queue (`Redis/Database`) để xử lý ngầm.
*   **Kiểm thử Local**: Phải bật Ngrok hoặc Cloudflare Tunnel để ánh xạ webhook từ API Facebook Developer Console về máy local (Nginx container).
*   **WebSockets**: Tránh tự cấu hình SSL Socket phức tạp khi deploy AWS trong 2 tuần đầu. Sử dụng Pusher client/broadcaster để tích hợp nhanh trong 5 phút.

## 3. Quản lý Chất lượng Mã nguồn & Quy trình PR
*   Để đảm bảo tính song song khi phát triển và tránh xung đột code ở các module lõi:
*   **Quy tắc**:
    *   Mọi thay đổi code ở nhánh tính năng phải đi qua Pull Request, yêu cầu kiểm định và duyệt từ Bạn (PM/DevOps) và Security Lead (Thành viên 2).
    *   Định nghĩa sẵn Database Migrations và API Interfaces cho các module chức năng phụ (như Post Scheduler) trước khi phân bổ phát triển để đảm bảo tính độc lập.
