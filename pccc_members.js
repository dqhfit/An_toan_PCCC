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
  companies: ["VFM", "DQH"],
  members: [
    // ----- Ban chỉ huy / Quản lý -----
    { name: "Chu Văn Long",           msnv: "002495", unit: "VFM", department: "Bảo trì",     position: "Đội trưởng PCCC — Cán bộ ATLĐ", role: "manager" },
    { name: "Đỗ Hữu Thiện",           msnv: "000719", unit: "VFM", department: "Văn phòng",   position: "Đội phó PCCC",         role: "manager" },
    { name: "Hồ Đình Khương",         msnv: "003558", unit: "DQH", department: "Bảo trì",     position: "Đội trưởng PCCC (DQH)", role: "manager" },
    { name: "Văn Quý Hộp",            msnv: "",       unit: "DQH", department: "Sản xuất",    position: "Đội trưởng ATVSV (DQH)", role: "manager" },

    // ----- Thành viên / Đội viên (VFM) -----
    { name: "Trần Đức Bảo",           msnv: "000154", unit: "VFM", department: "Kho sơn",     position: "Đội viên", role: "member" },
    { name: "Khổng Thị Ái",           msnv: "001810", unit: "VFM", department: "Kho ngũ kim", position: "Đội viên", role: "member" },
    { name: "Huỳnh Phương Thúy",      msnv: "003216", unit: "VFM", department: "Sơn Balet",   position: "Đội viên", role: "member" },
    { name: "Nguyễn Thị Minh Ngọc",   msnv: "003621", unit: "VFM", department: "Thành phẩm",  position: "Đội viên", role: "member" },
    { name: "Nguyễn Văn Trọng",       msnv: "002605", unit: "VFM", department: "Bảo trì",     position: "Đội viên", role: "member" },
    { name: "Lê Văn Chốt",            msnv: "003219", unit: "VFM", department: "Bảo trì",     position: "Đội viên", role: "member" },
    { name: "Huỳnh Văn Động",         msnv: "003605", unit: "VFM", department: "Sơn Balet",   position: "Đội viên", role: "member" },
    { name: "Danh Su",                msnv: "003680", unit: "VFM", department: "Sơn Balet",   position: "Đội viên", role: "member" },
    { name: "Đoàn Trung Toàn",        msnv: "003281", unit: "VFM", department: "Sơn Balet",   position: "Đội viên", role: "member" },
    { name: "Võ Hoàng Nam",           msnv: "003461", unit: "VFM", department: "Sơn Balet",   position: "Đội viên", role: "member" },
    { name: "Nguyễn Văn Liêm",        msnv: "003586", unit: "VFM", department: "Sơn Balet",   position: "Đội viên", role: "member" },
    { name: "Nguyễn Văn Quý",         msnv: "000654", unit: "VFM", department: "Sơn treo",    position: "Đội viên", role: "member" },
    { name: "Hồ Thiên Lâm",           msnv: "003195", unit: "VFM", department: "Sơn treo",    position: "Đội viên", role: "member" },
    { name: "Hoàng Xuân Nghĩa",       msnv: "003634", unit: "VFM", department: "Sơn UV",      position: "Đội viên", role: "member" },
    { name: "Lê Nhân Huy",            msnv: "003168", unit: "VFM", department: "Thành phẩm",  position: "Đội viên", role: "member" },
    { name: "Đinh Xuân Phúc",         msnv: "003144", unit: "VFM", department: "Thành phẩm",  position: "Đội viên", role: "member" },
    { name: "Phạm Phước Phát",        msnv: "003622", unit: "VFM", department: "Thành phẩm",  position: "Đội viên", role: "member" },
    { name: "Đỗ Duy Tiếp",            msnv: "001379", unit: "VFM", department: "Thành phẩm",  position: "Đội viên", role: "member" }
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

