# Triển khai Ứng dụng PCCC trên Coolify

Ứng dụng là server Node.js (không cần thư viện), vừa phục vụ giao diện vừa lưu dữ liệu
chung tại `pccc_db.json`. Trên Coolify cần gắn **Persistent Storage** để dữ liệu không
mất khi deploy lại.

## A. Chuẩn bị mã nguồn (Git)
Coolify deploy từ Git. Đưa toàn bộ thư mục này lên một repo (GitHub/GitLab/Gitea):

```powershell
git init
git add .
git commit -m "PCCC app"
git branch -M main
git remote add origin <URL-repo-cua-ban>
git push -u origin main
```

> File dữ liệu `pccc_db.json` đã được `.gitignore` bỏ qua — đúng, vì dữ liệu nằm trên volume.

## B. Tạo ứng dụng trong Coolify
1. **+ New Resource → Application → Public/Private Repository**, chọn repo vừa tạo, nhánh `main`.
2. **Build Pack**: chọn **Dockerfile** (repo đã có sẵn `Dockerfile`).
   - (Hoặc chọn **Docker Compose** nếu muốn — repo có sẵn `docker-compose.yml`.)
3. **Port**: đặt **3000** (mục *Ports Exposes* / *Port* = `3000`).
4. **Health Check** (nếu có mục cấu hình): Path = `/api/health`, Port = `3000`.

## C. Gắn lưu trữ bền vững (BẮT BUỘC)
Vào tab **Storages / Persistent Storage** của ứng dụng → **Add**:
- **Name**: `pccc-data`
- **Mount Path (trong container)**: `/data`

App đã được cấu hình ghi dữ liệu vào `/data` (biến môi trường `DATA_DIR=/data` đặt sẵn
trong Dockerfile). Nếu dùng Docker Compose thì volume `pccc-data:/data` đã khai báo sẵn.

## D. Biến môi trường
Trong tab **Environment Variables**:
- `ADMIN_TOKEN=<chuỗi-bí-mật-mạnh>` — **NÊN đặt** để bảo vệ trang quản trị. Nếu bỏ trống,
  server tự sinh token (xem trong log deploy) và lưu ở `/data/admin_token.txt`.
- `PORT=3000` (tuỳ chọn — Coolify thường tự xử lý qua reverse proxy).
- `DATA_DIR=/data` (đã có sẵn trong Dockerfile).

## E. Tên miền & HTTPS
- Đặt **Domain** cho ứng dụng trong Coolify (vd `pccc.congty.com`). Coolify tự cấp HTTPS.
- Khi truy cập qua domain, ứng dụng **tự đồng bộ** về chính server đó (dùng `/api` cùng origin),
  không cần cấu hình thêm.

## F. Deploy
Bấm **Deploy**. Xong, mở domain → dùng app. Mọi người trong/ngoài đơn vị truy cập cùng
domain sẽ **chung dữ liệu**.

## G. Trang quản trị (cấu hình hệ thống bằng token)
- Mở `https://<domain>/admin.html` → nhập **ADMIN_TOKEN** để vào.
- Tại đây quản lý **thành viên & vai trò**, **tên đơn vị**, **tải sao lưu / khôi phục dữ liệu**,
  **xóa toàn bộ dữ liệu**, và **đổi token** (nếu không đặt bằng biến môi trường).
- Cấu hình thành viên lưu trên server (`/data/config.json`) và áp dụng cho mọi người **ngay**,
  không cần deploy lại. (File `pccc_members.js` chỉ là phương án dự phòng khi mở bằng file://.)
- Trong ứng dụng, người dùng thấy link **⚙ Trang quản trị** ở thanh bên (khi chạy qua server).

## H. Cập nhật giao diện / biểu mẫu
- Thêm biểu mẫu / sửa giao diện: chỉnh `PCCC_App.html` → commit → Coolify redeploy.

## H. Sao lưu dữ liệu
Dữ liệu nằm ở volume `/data/pccc_db.json`.
- Sao lưu bằng tính năng **Backups/Volumes** của Coolify, hoặc
- Trong app dùng **⬇ Xuất JSON** để tải bản sao lưu định kỳ.

## I. Kiểm tra nhanh sau khi deploy
- Mở `https://<domain>/api/health` → phải trả `{"ok":true,...}`.
- Mở `https://<domain>/` → giao diện app; tạo 1 hồ sơ, bấm **💾 Lưu**, deploy lại và kiểm tra
  hồ sơ vẫn còn (chứng tỏ volume hoạt động).

---
### Chạy thử bằng Docker ở máy local (không qua Coolify)
```powershell
docker compose up -d --build
# mở http://localhost:3000
docker compose down        # dừng (dữ liệu vẫn giữ trong volume pccc-data)
```
