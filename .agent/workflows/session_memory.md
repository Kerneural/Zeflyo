# 💾 SESSION MEMORY — Zeflyo Project
> Last Checkpoint: 2026-07-07 | Status: Triển khai thành công Zeflyo lên DigitalOcean VPS sạch bằng Terraform, Docker Compose và cấu hình HTTPS bảo mật hoàn chỉnh qua Certbot.

---

## ⚡ Active Task Completed (Những việc ĐÃ HOÀN THÀNH trong session)
*   **Infrastructure (Terraform & VPS Sạch)**:
    *   Xây dựng hạ tầng tự động qua [main.tf](file:///r:/_Projects/Eurus_Workspace/Zeflyo/terraform/main.tf), [variables.tf](file:///r:/_Projects/Eurus_Workspace/Zeflyo/terraform/variables.tf) để tạo Droplet `4 vCPU / 8GB RAM` tại Singapore (IP: `165.232.163.188`) thay thế cho cấu hình 1Panel cũ bị lỗi.
    *   Tách biệt môi trường và an toàn cho website WordPress (`dailysmartlife.com`) hiện tại.
*   **Docker Stack Optimization (Nginx & Frontend)**:
    *   Cấu hình Next.js export tĩnh, nén cục bộ và giải nén tại thư mục `/app/frontend/out` trên máy chủ.
    *   Nâng cấp [docker-compose.yaml](file:///r:/_Projects/Eurus_Workspace/Zeflyo/docker-compose.yaml) và [default.conf](file:///r:/_Projects/Eurus_Workspace/Zeflyo/docker/nginx/conf.d/default.conf) để Nginx phục vụ trực tiếp tệp tĩnh, không dùng Node.js chạy ngầm, tiết kiệm dung lượng RAM.
    *   Cấu hình chuyển tiếp reverse proxy cho Laravel Octane API `/api` và Soketi WebSockets `/app`, `/socket.io`.
*   **PHP Dockerfile Compilation Fixes**:
    *   Sửa lỗi biên dịch thư viện trên ảnh Alpine trong [Dockerfile](file:///r:/_Projects/Eurus_Workspace/Zeflyo/docker/app/Dockerfile) bằng việc bổ sung `pkgconf` và `sqlite-dev` vào quy trình cài đặt apk, giúp biên dịch trơn tru `pdo_pgsql`, `gd`, `zip`, `opcache`, và `intl`.
*   **Laravel Database Setup & Dependencies**:
    *   Chạy thành công `composer install` có kèm dev-dependencies bên trong container để có sẵn Faker phục vụ Seed dữ liệu.
    *   Chạy khởi tạo hệ thống gồm `key:generate`, `migrate --force` và `db:seed --force` trên PostgreSQL thành công.
*   **SSL / HTTPS Integration**:
    *   Cài đặt Certbot trên host VPS, tạm dừng container Nginx và chạy `certbot certonly --standalone` để cấp phát chứng chỉ HTTPS cho tên miền `zeflyo.duckdns.org`.
    *   Mount an toàn thư mục `/etc/letsencrypt` từ host vào container Nginx dưới quyền Read-Only và định cấu hình SSL bảo mật nghiêm ngặt.

## 🧠 Semantic Context Essence (Tinh túy kiến thức & Quyết định thiết kế)
*   **Lý do Nginx phục vụ Next.js trực tiếp**: Tránh chạy Node.js trong môi trường sản xuất giúp giảm thiểu RAM sử dụng, giảm thiểu rủi ro bảo mật và tối đa hóa tốc độ tải trang tĩnh của Next.js.
*   **Lý do cần sqlite-dev**: PHP 8.4 khi biên dịch PDO trên Alpine bắt buộc cần các file headers của Sqlite3 kể cả khi chúng ta chỉ sử dụng driver pdo_pgsql.
*   **Cơ chế lưu trữ RAM của Octane**: Do Octane chạy nạp mã nguồn Laravel vào RAM, khi có thay đổi tệp tin lớp học hoặc nạp thêm dependency mới (như Faker), cần phải chạy `docker restart app_zeflyo` để khởi động lại Octane trong container thay vì chỉ chạy composer ngoài host.
*   **Lưu ý bảo mật**: Đã thêm các tệp tin cấu hình nhạy cảm của Terraform (`*.tfvars`, `*.tfstate`, `.terraform/`) vào [.gitignore](file:///r:/_Projects/Eurus_Workspace/Zeflyo/.gitignore) tránh lộ token DigitalOcean lên GitHub.

## 🔜 Next Steps (3 hành động kỹ thuật trực tiếp kế tiếp)
- [ ] **Step 1:** Kiểm tra liên kết Webhook Facebook trực tiếp bằng các tương tác bình luận/tin nhắn từ fanpage thực tế xem luồng ghi nhận của Queue Worker có hoạt động chính xác.
- [ ] **Step 2:** Thiết lập cronjob tự động sao lưu định kỳ thư mục dữ liệu PostgreSQL (`postgres_data`) trên VPS ra không gian lưu trữ ngoài (ví dụ: S3 hoặc DO Spaces).
- [ ] **Step 3:** Thay đổi tên miền thực tế của khách hàng (cấu hình trỏ bản ghi A từ tên miền chính thay vì dùng DuckDNS) và thực hiện cấp lại chứng chỉ SSL Let's Encrypt tương ứng.
