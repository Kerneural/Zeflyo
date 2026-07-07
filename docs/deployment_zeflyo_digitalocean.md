# Hướng Dẫn Deploy Dự Án Zeflyo Lên DigitalOcean Bằng Terraform & Docker Compose

Tài liệu này hướng dẫn quy trình khởi tạo máy chủ và triển khai dự án **Zeflyo** (Laravel Backend Octane + Next.js Frontend + PostgreSQL + Redis + Soketi WebSockets) tự động trên **DigitalOcean** sử dụng **Terraform** và **Docker Compose**.

---

## 🏗️ Kiến Trúc Hệ Thống Trên DigitalOcean

Bằng việc sử dụng một VPS (Droplet) trắng riêng biệt, chúng ta có thể cô lập hoàn toàn môi trường chạy Docker, không gây loãng hoặc ảnh hưởng đến các dự án khác (như WordPress cũ):
*   **Máy chủ**: Ubuntu 22.04 LTS (Khuyên dùng cấu hình tối thiểu 1 vCPU / 2GB RAM để chạy mượt mà các container Docker).
*   **Docker Containers**:
    *   `nginx_zeflyo` (Cổng 80/443): Web server chính phục vụ giao diện Next.js tĩnh và reverse-proxy định tuyến `/api` & WebSockets.
    *   `app_zeflyo` (Cổng 8000 nội bộ): Laravel Octane chạy mã nguồn PHP Backend.
    *   `worker_zeflyo`: Laravel Queue Worker chạy ngầm xử lý hàng đợi.
    *   `postgres_zeflyo` (Cổng 5432): Cơ sở dữ liệu chính PostgreSQL.
    *   `redis_zeflyo` (Cổng 6379): Lưu trữ cache và làm driver hàng đợi.
    *   `soketi_zeflyo` (Cổng 6001): Máy chủ WebSockets thời gian thực.

---

## 🛠️ Quy Trình Triển Khai Chi Tiết

### BƯỚC 1: Khởi Tạo Hạ Tầng Tự Động Bằng Terraform

1.  **Cài đặt Terraform** trên máy tính cá nhân của bạn (tải về từ [terraform.io](https://www.terraform.io/downloads)).
2.  Đảm bảo bạn đã upload **SSH Key** của máy tính lên tài khoản DigitalOcean (vào phần *Settings > Security > SSH Keys*). Copy chính xác **Tên** của SSH Key đó.
3.  Tạo Token truy cập API trên DigitalOcean (vào phần *API > Personal Access Tokens > Generate New Token*).
4.  Mở thư mục dự án Zeflyo tại local, đi tới thư mục `terraform/`:
    ```bash
    cd terraform
    ```
5.  Sao chép tệp `terraform.tfvars.example` thành `terraform.tfvars`:
    ```bash
    cp terraform.tfvars.example terraform.tfvars
    ```
6.  Mở tệp `terraform.tfvars` và cấu hình chính xác các thông tin:
    ```hcl
    do_token     = "dop_v1_your_personal_access_token_here"
    ssh_key_name = "tên-ssh-key-đã-upload-trên-digitalocean"
    droplet_name = "zeflyo-production"
    region       = "sgp1"  # Singapore (khu vực tối ưu nhất cho Việt Nam)
    droplet_size = "s-1vcpu-2gb"
    ```
7.  Khởi chạy các lệnh Terraform để khởi tạo VPS tự động:
    ```bash
    terraform init
    terraform plan
    terraform apply
    ```
    *Gõ `yes` khi hệ thống yêu cầu xác nhận. Khi chạy xong, Terraform sẽ in ra địa chỉ IP công khai của Droplet.*

---

### BƯỚC 2: Cấu Hình Tên Miền
1.  Truy cập vào trang quản trị tên miền của bạn (hoặc tài khoản **DuckDNS** nếu dùng miễn phí).
2.  Trỏ bản ghi **`A`** của tên miền chính (ví dụ: `zeflyo.duckdns.org`) về địa chỉ IP của Droplet vừa được in ra từ Terraform.

---

### BƯỚC 3: Đồng Bộ Mã Nguồn & Cấu Hình `.env` Trên VPS

1.  Kết nối SSH vào máy chủ mới (sử dụng quyền root mặc định):
    ```bash
    ssh root@<IP_MÁY_CHỦ>
    ```
    *(Hệ thống đã tự động cài đặt Docker và Docker Compose V2 trong lúc khởi động nhờ cấu hình Cloud-Init của Terraform).*
2.  Di chuyển vào thư mục `/app` và clone mã nguồn về:
    ```bash
    git clone https://github.com/Kerneural/Zeflyo.git /app
    cd /app
    ```
3.  Tạo tệp cấu hình `.env` cho Laravel Backend:
    ```bash
    cp backend/.env.example backend/.env
    nano backend/.env
    ```
    Điền các thông số kết nối khớp với Docker Compose:
    ```env
    APP_ENV=production
    APP_DEBUG=false
    APP_URL=https://zeflyo.duckdns.org  # Tên miền của bạn
    
    # Kết nối Database PostgreSQL trong Docker
    DB_CONNECTION=pgsql
    DB_HOST=postgres
    DB_PORT=5432
    DB_DATABASE=zeflyo
    DB_USERNAME=zeflyo_user
    DB_PASSWORD=zeflyo_password # Khớp với docker-compose.yaml
    
    # Kết nối Redis trong Docker
    QUEUE_CONNECTION=redis
    REDIS_HOST=redis
    REDIS_PORT=6379
    
    # Cấu hình WebSockets (Soketi)
    BROADCAST_CONNECTION=pusher
    PUSHER_APP_ID=zeflyo_app
    PUSHER_APP_KEY=zeflyo_key
    PUSHER_APP_SECRET=zeflyo_secret
    PUSHER_HOST=soketi
    PUSHER_PORT=6001
    PUSHER_SCHEME=http

    # Meta/Facebook Credentials
    FACEBOOK_CLIENT_ID=2068439784101224
    FACEBOOK_CLIENT_SECRET=your_app_secret
    FACEBOOK_REDIRECT_URI="https://zeflyo.duckdns.org/api/auth/facebook/callback"

    # AI Service API Key
    GEMINI_API_KEY=your_gemini_api_key
    GEMINI_MODEL=gemini-3.1-flash-lite
    ```
    *Bấm `Ctrl+O` -> `Enter` để lưu, `Ctrl+X` để thoát.*

---

### BƯỚC 4: Build Giao Diện Next.js Ở Máy Local & Upload

1.  Tại máy local, truy cập vào thư mục `frontend`:
    ```bash
    cd frontend
    ```
2.  Mở tệp `next.config.ts`, đảm bảo cấu hình xuất tĩnh được kích hoạt:
    ```typescript
    const nextConfig: NextConfig = {
      output: 'export',
      images: {
        unoptimized: true,
      },
    };
    ```
3.  Chạy lệnh build:
    ```bash
    npm run build
    ```
4.  Nén thư mục `out` vừa được sinh ra thành tệp **`out.zip`**.
5.  Upload tệp `out.zip` lên thư mục `/app/frontend` trên VPS (sử dụng công cụ SFTP như FileZilla hoặc lệnh `scp`):
    ```bash
    scp out.zip root@<IP_MÁY_CHỦ>:/app/frontend/
    ```
6.  Trên VPS, giải nén tệp `out.zip` trực tiếp vào thư mục `/app/frontend/out`:
    ```bash
    apt-get install -y unzip
    mkdir -p /app/frontend/out
    unzip /app/frontend/out.zip -d /app/frontend/out
    rm /app/frontend/out.zip
    ```

---

### BƯỚC 5: Khởi Chạy Hệ Thống Docker Compose

1.  Tại thư mục `/app` trên VPS, chạy lệnh khởi dựng Docker Compose:
    ```bash
    docker compose up -d
    ```
    *(Các container Nginx, App, PostgreSQL, Redis, Worker, Soketi sẽ được tự động tải về, biên dịch và chạy ngầm).*
2.  Truy cập vào container backend `app_zeflyo` để cấu hình Laravel:
    ```bash
    docker exec -it app_zeflyo bash
    ```
3.  Chạy các lệnh thiết lập bên trong container:
    ```bash
    composer install --no-dev --optimize-autoloader
    php artisan key:generate
    php artisan migrate --force
    php artisan db:seed --force
    exit
    ```

---

### BƯỚC 6: Cấu hình SSL (HTTPS) bảo mật tự động bằng Certbot
Để bật chứng chỉ bảo mật HTTPS cho dự án, bạn chạy Certbot trực tiếp trên VPS:

1.  Cài đặt Certbot:
    ```bash
    apt-get install -y certbot python3-certbot-nginx
    ```
2.  Bật SSL cho Nginx:
    ```bash
    certbot --nginx -d zeflyo.duckdns.org
    ```
    *(Làm theo hướng dẫn trên màn hình, điền email và chọn chuyển hướng tự động HTTP sang HTTPS).*
3.  Certbot sẽ tự động chèn cấu hình SSL vào Nginx và tự động gia hạn 3 tháng một lần.

Hệ thống Zeflyo của bạn đã hoàn thành triển khai, hoạt động an toàn và bảo mật hoàn hảo trên DigitalOcean!
