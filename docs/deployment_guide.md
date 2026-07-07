# Hướng Dẫn Deploy Dự Án Lên VPS (1Panel) Chuẩn Hóa

Tài liệu này hướng dẫn chi tiết quy trình đưa mã nguồn dự án **WordPress Hybrid E-Commerce Clone** từ máy local lên môi trường VPS sử dụng bảng quản trị **1Panel**. Quy trình này được tối ưu hóa để khắc phục triệt để các lỗi về đường dẫn Git, mất file do ghi đè (Override), vỡ giao diện (404 Stylesheet/Images) và cấu hình seeder database.

---

## 📋 Yêu cầu chuẩn bị
1. Quyền quản trị trang **1Panel** trên VPS.
2. Tài khoản GitHub có quyền truy cập vào Repo của dự án.
3. Bản nén zip các thư mục tài nguyên bị loại trừ bởi Git (do nằm trong `.gitignore`):
   * Thư mục giao diện gốc: `flatsome`
   * Thư mục giao diện con chứa CSS/JS cũ: `flatsome-child`
   * Thư mục ảnh tĩnh sản phẩm: `uploads`
   * Thư mục phông chữ: `fonts`

---

## 🛠️ Quy trình triển khai 6 bước tiêu chuẩn

### BƯỚC 1: Khởi tạo website WordPress mới trên VPS
1. Đăng nhập 1Panel -> Chọn **Quản lý Website** hoặc **Quản lý WordPress**.
2. Chọn **Cài đặt WordPress** lên tên miền mục tiêu (ví dụ: `dailysmartlife.com`).
3. **Cấu hình khuyên dùng:**
   * **Phiên bản PHP:** `8.1` hoặc cao hơn.
   * **Tài khoản/Mật khẩu quản trị:** Tự chọn và lưu lại để đăng nhập `/wp-admin`.
   * Hệ thống sẽ tự động tạo cấu hình và mã nguồn WordPress sạch tại thư mục gốc `/home/<user>/public_html`.

---

### BƯỚC 2: Cấu hình quy tắc Rewrite WordPress (Nginx/OpenResty) trên 1Panel
> [!IMPORTANT]
> Vì 1Panel sử dụng OpenResty (Nginx) làm web server nên nó không tự nhận diện file `.htaccess` như Apache. Nếu bỏ qua bước này, toàn bộ đường dẫn con hoặc link rút gọn `/go/` sẽ trả về lỗi **404 Not Found** thô của máy chủ Nginx.

1. Tại danh sách tên miền đã tạo trong 1Panel -> Bấm vào biểu tượng **Chỉnh sửa (hình cây bút màu xanh lá)** tại cột *Hành động* bên cạnh tên miền của bạn.
2. Một popup cấu hình chi tiết sẽ hiện lên. Tìm và chọn mục **Rewrite** (hoặc htaccess).
3. Tại ô **Chọn Bản mẫu** ở trên cùng, nhấp chọn mẫu **`wordpress`** (mã cấu hình sẽ tự nạp có dòng `try_files $uri $uri/ /index.php?$args;`).
4. Bấm **Lưu** ở dưới cùng để 1Panel ghi nhận cấu hình và tự động khởi động lại dịch vụ OpenResty (Nginx).

---

### BƯỚC 3: Đồng bộ Code từ GitHub về VPS (Thông qua Git Manager)
> [!WARNING]
> **KHÔNG** clone trực tiếp đè vào thư mục `/public_html` kèm tùy chọn **`Override`** vì 1Panel sẽ xóa sạch mã nguồn WordPress vừa cài ở Bước 1.

1. Vào mục **Git** (Git Manager) trên 1Panel.
2. Chọn **Clone** và điền thông tin:
   * **Git URL:** `https://github.com/Kerneural/NovaElectronics.git`
   * **Branch:** `main` (hoặc nhánh bạn muốn deploy).
   * **Đường dẫn đích (Target Path):** Tạo một thư mục riêng biệt bên ngoài, ví dụ: `/home/<user>/git_source`.
3. Bấm **Clone** để tải toàn bộ source code về thư mục `/home/<user>/git_source`.

---

### BƯỚC 4: Di chuyển Code tùy biến và Script Seeding vào WordPress
1. Vào **Quản lý tập tin** trên 1Panel, di chuyển tới thư mục `/home/<user>/git_source/src/`.
2. Thực hiện di chuyển các file cốt lõi sang website thật `/public_html`:
   * **Theme tùy biến:** Copy/Cắt thư mục `wp-content/themes/dienmay8-clone` -> Dán vào `/public_html/wp-content/themes/`.
   * **Script Seeding:** Copy/Cắt file `seed_affiliate_products.php` -> Dán vào thư mục gốc `/public_html/`.

---

### BƯỚC 5: Tải lên các thư mục tài nguyên bị Git loại trừ (Ignored Assets)
Do các thư mục chứa tài nguyên ảnh, font và CSS nặng được khai báo trong `.gitignore` để tối ưu dung lượng Repo, bạn cần đóng gói zip chúng từ máy local và tải lên VPS:

1. **Nén các thư mục tại máy local** (nằm ở `src/wp-content/`):
   * Nén thư mục giao diện mẹ thành: `flatsome.zip`
   * Nén thư mục giao diện tùy biến thành: `flatsome-child.zip`
   * Nén thư mục ảnh tĩnh & phông chữ thành: `assets.zip` (gồm 2 thư mục con `uploads` và `fonts`).
2. **Tải lên và giải nén trên 1Panel:**
   * Di chuyển tới thư mục VPS: `/public_html/wp-content/themes/` -> Tải lên `flatsome.zip` và `flatsome-child.zip` -> Giải nén trực tiếp vào thư mục hiện tại (**To current folder**).
   * Di chuyển tới thư mục VPS: `/public_html/wp-content/` -> Tải lên `assets.zip` -> Giải nén trực tiếp vào thư mục hiện tại (**To current folder**).
3. Sau khi giải nén xong, bạn xóa toàn bộ các tệp `.zip` trên VPS để giải phóng bộ nhớ.

---

### BƯỚC 6: Kích hoạt Theme, Plugin & Khởi tạo Dữ liệu (Seeding)
1. Đăng nhập trang Admin của VPS: `http://<domain>/wp-admin/`.
2. **Kích hoạt Giao diện:** Vào **Appearance (Giao diện) > Themes** -> Tìm theme con **`Dienmay8 Clone`** và bấm **Kích hoạt (Activate)**.
3. **Cài đặt WooCommerce:** Vào **Plugins > Add New** -> Tìm kiếm plugin **`WooCommerce`** -> Bấm **Cài đặt ngay** và **Kích hoạt**. Bấm **Skip guided setup** khi màn hình thiết lập xuất hiện.
4. **Nạp dữ liệu:** Mở trình duyệt, truy cập đường dẫn seeder để tự động nạp 50 sản phẩm Affiliate:
   👉 `http://<domain>/seed_affiliate_products.php`
5. Chờ màn hình xuất hiện thông báo: `Seeding completed: 50/50 products created`.
6. **Cập nhật Đường dẫn tĩnh (Flush Permalinks):** Vào **Cài đặt > Đường dẫn tĩnh** (Settings > Permalinks) trong WordPress Admin, chọn cấu trúc là **Tiêu đề bài viết (Post name)** và bấm **Lưu thay đổi** (Save Changes) ở dưới cùng. Bước này bắt buộc phải thực hiện để WordPress đăng ký các cấu trúc định tuyến mới cho `/go/` hoạt động.
7. **Bảo mật:** Quay lại **Quản lý tập tin** trên 1Panel, xóa file `/public_html/seed_affiliate_products.php` ngay lập tức để tránh rủi ro bảo mật dữ liệu.

---

## 🎯 Bảng đối chiếu cấu trúc thư mục chuẩn trên VPS sau khi hoàn tất

Sau khi hoàn tất toàn bộ quy trình, cấu trúc thư mục `/public_html/wp-content` trên VPS bắt buộc phải trông như sau:

```text
public_html/
├── seed_affiliate_products.php       <-- Đã chạy và XÓA BỎ sau khi hoàn tất
├── wp-content/
│   ├── fonts/                         <-- Chứa phông chữ tĩnh (Copy từ local)
│   ├── uploads/                       <-- Chứa hình ảnh sản phẩm tĩnh (Copy từ local)
│   └── themes/
│       ├── flatsome/                  <-- Giao diện mẹ (Nén zip từ local)
│       ├── flatsome-child/            <-- Giao diện CSS tùy biến (Nén zip từ local)
│       └── dienmay8-clone/            <-- Giao diện con Router chính (Clone từ Git)
```
