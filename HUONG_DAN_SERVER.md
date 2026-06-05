# Hướng dẫn chạy Server & Đồng bộ — Ứng dụng PCCC

## 1. Yêu cầu
- Cài **Node.js** (https://nodejs.org) — bản LTS. Kiểm tra: mở PowerShell gõ `node -v`.

## 2. Chạy server
Trong thư mục chứa các file (PCCC_App.html, server.js…):

```powershell
node server.js
```

Màn hình báo: `Mở ứng dụng: http://localhost:3000/`

- Mở trình duyệt vào **http://localhost:3000/** để dùng app.
- Toàn bộ dữ liệu lưu chung tại file **`pccc_db.json`** (cùng thư mục).
- Dừng server: nhấn **Ctrl + C**.
- Đổi cổng: `PORT=8080 node server.js` (PowerShell: `$env:PORT=8080; node server.js`).

## 3. Cách hoạt động
- **Lưu thủ công**: nhập liệu xong bấm nút **💾 Lưu**. Khi đó hồ sơ mới được ghi vào máy **và đẩy lên server**. Bấm "Tạo mới" mà không lưu thì không sinh hồ sơ rác.
- Nút **☁ Đồng bộ** trên thanh trên cùng: kéo dữ liệu mới nhất từ server (và đẩy phần chưa đồng bộ). App cũng tự đồng bộ định kỳ mỗi phút.
- **Quy tắc gộp**: bản có thời gian sửa mới hơn sẽ thắng (last-write-wins) theo từng hồ sơ. Xóa được đồng bộ bằng "xóa mềm".

## 4. Dùng chung trong mạng nội bộ (nhiều máy/điện thoại)
1. Chạy `node server.js` trên **một máy làm server**.
2. Tìm IP máy đó: PowerShell gõ `ipconfig` → lấy IPv4 (vd `192.168.1.10`).
3. Máy/điện thoại khác (cùng wifi/mạng) mở: **http://192.168.1.10:3000/**
   - Mở cổng 3000 trên tường lửa Windows nếu bị chặn.
4. (Tùy chọn) Nếu muốn mở app bằng file `.html` trực tiếp mà vẫn đồng bộ tới server: sửa `pccc_members.js`, bỏ `//` ở dòng `window.PCCC_SYNC = { url: "http://192.168.1.10:3000/api", enabled: true };`

## 5. Sao lưu & khôi phục
- **Sao lưu**: copy file `pccc_db.json` định kỳ (đây là toàn bộ dữ liệu trên server).
- Trong app vẫn có **Xuất/Nhập JSON** để sao lưu/khôi phục thủ công.
- Phân quyền thành viên: sửa file `pccc_members.js`.

## 6. Lưu ý
- Nếu mở app bằng **file:// (nháy đúp)** mà không qua server: app vẫn chạy, lưu trên trình duyệt (IndexedDB), **không đồng bộ** (nút ☁ ẩn).
- Server này phục vụ mạng nội bộ/đơn vị. Khi đưa ra Internet cần thêm HTTPS và xác thực.
