/* ============================================================================
 *  CẤU HÌNH DANH SÁCH THÀNH VIÊN & VAI TRÒ  —  Công tác An toàn PCCC (VFM & DQH)
 *  --------------------------------------------------------------------------
 *  File này dùng để PHÂN QUYỀN. Đặt cùng thư mục với PCCC_App.html (hoặc cùng
 *  thư mục trên server). Khi mở ứng dụng, người dùng chọn tên của mình và sẽ
 *  được gán đúng vai trò cấu hình ở đây.
 *
 *  role:
 *    "manager" = Đội trưởng / Quản lý  -> toàn quyền (xem tất cả, nhập/xuất JSON)
 *    "member"  = Thành viên            -> chỉ tạo báo cáo (sự cố, kiểm tra, báo cáo công tác)
 *
 *  Cách thêm/sửa: thêm/bớt dòng trong mảng "members" bên dưới. Lưu file là xong.
 *  unit: "VFM" hoặc "DQH". department/position chỉ để hiển thị & điền sẵn vào báo cáo.
 * ========================================================================== */
window.PCCC_MEMBERS = {
  company: "Công ty TNHH SX & TM VFM — DQH",
  members: [
    // ----- Ban chỉ huy / Quản lý -----
    { name: "Chu Văn Long",           msnv: "002495", unit: "VFM", department: "Bảo trì",     position: "Đội trưởng PCCC",      role: "manager" },
    { name: "Đỗ Hữu Thiện",           msnv: "000719", unit: "VFM", department: "Văn phòng",   position: "Đội phó PCCC",         role: "manager" },
    { name: "Hồ Đình Khương",         msnv: "003558", unit: "DQH", department: "Bảo trì",     position: "Đội trưởng PCCC (DQH)", role: "manager" },
    { name: "Văn Quý Hộp",            msnv: "",       unit: "DQH", department: "Sản xuất",    position: "Đội trưởng ATVSV (DQH)", role: "manager" },

    // ----- Thành viên / Đội viên -----
    { name: "Trần Đức Bảo",           msnv: "",       unit: "VFM", department: "IT",          position: "Đội viên", role: "member" },
    { name: "Khổng Thị Ái",           msnv: "",       unit: "VFM", department: "Kho sơn",     position: "Đội viên", role: "member" },
    { name: "Huỳnh Phương Thúy",      msnv: "",       unit: "VFM", department: "Kho ngũ kim", position: "Đội viên", role: "member" },
    { name: "Lê Thị Ngọc Trân",       msnv: "",       unit: "VFM", department: "Sơn",         position: "Đội viên", role: "member" },
    { name: "Nguyễn Văn Trọng",       msnv: "",       unit: "VFM", department: "Thành phẩm",  position: "Đội viên", role: "member" },
    { name: "Lê Văn Chốt",            msnv: "",       unit: "VFM", department: "Bảo trì",     position: "Đội viên", role: "member" },
    { name: "Nguyễn Trần Trung Hiếu", msnv: "",       unit: "VFM", department: "Bảo trì",     position: "Đội viên", role: "member" }
  ]
};

/* --------------------------------------------------------------------------
 *  ĐỒNG BỘ SERVER (tùy chọn)
 *  - Khi mở app QUA SERVER (http://localhost:3000) thì TỰ ĐỘNG đồng bộ về
 *    chính server đó — KHÔNG cần khai báo gì thêm.
 *  - Chỉ khai báo dưới đây nếu muốn ép app (kể cả khi mở bằng file://) đồng
 *    bộ tới một server cố định trong mạng nội bộ. Bỏ dấu // để bật:
 * ------------------------------------------------------------------------ */
// window.PCCC_SYNC = { url: "http://192.168.1.10:3000/api", enabled: true };

