/* ============================================================================
 *  PCCC Sync Server — Node.js thuần (KHÔNG cần cài thư viện)
 *  --------------------------------------------------------------------------
 *  Chạy:   node server.js
 *  Mở app: http://localhost:3000/        (dữ liệu lưu chung ở pccc_db.json)
 *
 *  - Phục vụ các file tĩnh trong thư mục này (PCCC_App.html, pccc_members.js...)
 *  - API đồng bộ 2 chiều: POST /api/sync   (last-write-wins theo updatedAt)
 *  - Lưu trữ: pccc_db.json  (sao lưu file này là sao lưu toàn bộ dữ liệu)
 *  Đổi cổng: PORT=8080 node server.js
 * ========================================================================== */
const http   = require("http");
const fs     = require("fs");
const path   = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const ROOT = __dirname;
// Dữ liệu lưu ở DATA_DIR (gắn volume bền vững khi chạy trên Docker/Coolify).
// Mặc định là thư mục con "data" — KHÔNG để trùng ROOT để file nhạy cảm không bị
// server tĩnh phục vụ ra ngoài (token, db, config).
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, "data");
const DBFILE = process.env.DB_FILE || path.join(DATA_DIR, "pccc_db.json");
try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) { /* ignore */ }

// ----- Cấu hình hệ thống (thành viên, vai trò) — sửa qua trang admin, lưu ở /data/config.json -----
const CONFIG_FILE = path.join(DATA_DIR, "config.json");
const DEFAULT_CONFIG_FILE = path.join(ROOT, "pccc_config.default.json");
let config = { company: "", members: [] };
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
    else if (fs.existsSync(DEFAULT_CONFIG_FILE)) {
      config = JSON.parse(fs.readFileSync(DEFAULT_CONFIG_FILE, "utf8"));
      try { fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2)); } catch (e) {}
    }
  } catch (e) { console.error("Đọc config lỗi:", e.message); }
  if (!Array.isArray(config.members)) config.members = [];
  if (typeof config.company !== "string") config.company = "";
}
function saveConfig() { try { fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2)); } catch (e) { console.error("Lưu config lỗi:", e.message); } }
loadConfig();

// ----- Token quản trị: ưu tiên biến môi trường ADMIN_TOKEN, nếu không có thì sinh & lưu ở /data -----
const TOKEN_FILE = path.join(DATA_DIR, "admin_token.txt");
const TOKEN_FROM_ENV = !!process.env.ADMIN_TOKEN;
let ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
if (!ADMIN_TOKEN) {
  try {
    if (fs.existsSync(TOKEN_FILE)) ADMIN_TOKEN = fs.readFileSync(TOKEN_FILE, "utf8").trim();
    if (!ADMIN_TOKEN) { ADMIN_TOKEN = crypto.randomBytes(12).toString("hex"); fs.writeFileSync(TOKEN_FILE, ADMIN_TOKEN); }
  } catch (e) { ADMIN_TOKEN = crypto.randomBytes(12).toString("hex"); }
}
function isAuthed(req) {
  // Token quản trị gửi qua header X-Admin-Token (để không đụng Authorization của Basic Auth)
  return !!req.headers["x-admin-token"] && req.headers["x-admin-token"] === ADMIN_TOKEN;
}

// ----- Basic Auth toàn cục (tuỳ chọn) — BẮT BUỘC bật khi đưa ra Internet -----
// Đặt APP_PASSWORD (và tuỳ chọn APP_USER) để chặn mọi truy cập chưa đăng nhập.
const APP_USER = process.env.APP_USER || "pccc";
const APP_PASSWORD = process.env.APP_PASSWORD || "";
function basicAuthOK(req) {
  if (!APP_PASSWORD) return true; // không đặt mật khẩu => không gác (chỉ nên dùng mạng nội bộ)
  const h = req.headers["authorization"] || "";
  if (!h.startsWith("Basic ")) return false;
  let dec = "";
  try { dec = Buffer.from(h.slice(6), "base64").toString("utf8"); } catch (e) { return false; }
  const i = dec.indexOf(":");
  return dec.slice(0, i) === APP_USER && dec.slice(i + 1) === APP_PASSWORD;
}
function readBody(req, res, cb) {
  let body = "";
  req.on("data", c => { body += c; if (body.length > 200 * 1024 * 1024) req.destroy(); });
  req.on("end", () => {
    let p = null;
    try { p = JSON.parse(body || "{}"); }
    catch (e) { return send(res, 400, JSON.stringify({ error: "JSON không hợp lệ" }), { "Content-Type": "application/json" }); }
    cb(p);
  });
}

let db = { records: {} };
try { if (fs.existsSync(DBFILE)) db = JSON.parse(fs.readFileSync(DBFILE, "utf8")) || { records: {} }; }
catch (e) { console.error("Không đọc được pccc_db.json:", e.message); }
if (!db.records) db.records = {};

let saveTimer = null;
function saveDB() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const tmp = DBFILE + ".tmp";
      fs.writeFileSync(tmp, JSON.stringify(db));
      fs.renameSync(tmp, DBFILE);
    } catch (e) { console.error("Lưu DB lỗi:", e.message); }
  }, 250);
}

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml", ".ico": "image/x-icon", ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8"
};
function nowISO() { return new Date().toISOString(); }
function send(res, code, body, headers) {
  res.writeHead(code, Object.assign({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  }, headers || {}));
  res.end(body);
}

const server = http.createServer((req, res) => {
  const u = new URL(req.url, "http://localhost");
  if (req.method === "OPTIONS") return send(res, 204, "");

  // Gác Basic Auth cho mọi request (trừ health check để Coolify kiểm tra được)
  if (u.pathname !== "/api/health" && !basicAuthOK(req)) {
    return send(res, 401, "Cần đăng nhập", { "WWW-Authenticate": 'Basic realm="PCCC", charset="UTF-8"' });
  }

  // ---- API ----
  if (u.pathname === "/api/health") {
    return send(res, 200, JSON.stringify({ ok: true, now: nowISO(), count: Object.keys(db.records).length }),
      { "Content-Type": "application/json" });
  }
  if (u.pathname === "/api/sync" && req.method === "POST") {
    let body = "";
    req.on("data", c => { body += c; if (body.length > 200 * 1024 * 1024) req.destroy(); });
    req.on("end", () => {
      let payload;
      try { payload = JSON.parse(body || "{}"); }
      catch (e) { return send(res, 400, JSON.stringify({ error: "JSON không hợp lệ" }), { "Content-Type": "application/json" }); }
      const since = payload.since || null;
      const incoming = Array.isArray(payload.records) ? payload.records : [];
      const maxFuture = Date.now() + 24 * 3600 * 1000; // chống mốc thời gian tương lai bất thường
      // gộp theo last-write-wins
      for (const rec of incoming) {
        if (!rec || !rec.id) continue;
        const t = Date.parse(rec.updatedAt || "");
        if (!isNaN(t) && t > maxFuture) continue; // bỏ qua bản ghi updatedAt quá xa ở tương lai
        const cur = db.records[rec.id];
        if (!cur || String(rec.updatedAt || "") >= String(cur.updatedAt || "")) db.records[rec.id] = rec;
      }
      // trả về các bản ghi đổi từ lần đồng bộ trước
      const changed = [];
      for (const id in db.records) {
        const r = db.records[id];
        if (!since || String(r.updatedAt || "") > String(since)) changed.push(r);
      }
      if (incoming.length) saveDB();
      return send(res, 200, JSON.stringify({ now: nowISO(), changed }), { "Content-Type": "application/json" });
    });
    return;
  }

  // ---- API cấu hình (công khai: chỉ trả members để app hiển thị màn hình chọn tên) ----
  if (u.pathname === "/api/config" && req.method === "GET") {
    return send(res, 200, JSON.stringify({ company: config.company || "", members: config.members || [] }), { "Content-Type": "application/json" });
  }

  // ---- API quản trị (cần token) ----
  if (u.pathname.startsWith("/api/admin/")) {
    if (u.pathname === "/api/admin/login" && req.method === "POST") {
      return readBody(req, res, p => {
        if (p && p.token === ADMIN_TOKEN) return send(res, 200, JSON.stringify({ ok: true, company: config.company || "", envToken: TOKEN_FROM_ENV }), { "Content-Type": "application/json" });
        return send(res, 401, JSON.stringify({ ok: false, error: "Sai token" }), { "Content-Type": "application/json" });
      });
    }
    if (!isAuthed(req)) return send(res, 401, JSON.stringify({ error: "Unauthorized" }), { "Content-Type": "application/json" });

    if (u.pathname === "/api/admin/config" && req.method === "GET")
      return send(res, 200, JSON.stringify(config), { "Content-Type": "application/json" });

    if (u.pathname === "/api/admin/config" && req.method === "POST")
      return readBody(req, res, p => {
        if (!p || !Array.isArray(p.members)) return send(res, 400, JSON.stringify({ error: "Thiếu danh sách members[]" }), { "Content-Type": "application/json" });
        config.company = String(p.company || "");
        config.members = p.members.map(m => ({
          name: String(m.name || "").trim(), msnv: String(m.msnv || "").trim(),
          unit: String(m.unit || "").trim(), department: String(m.department || "").trim(),
          position: String(m.position || "").trim(), role: m.role === "manager" ? "manager" : "member"
        })).filter(m => m.name);
        saveConfig();
        return send(res, 200, JSON.stringify({ ok: true, count: config.members.length }), { "Content-Type": "application/json" });
      });

    if (u.pathname === "/api/admin/stats" && req.method === "GET")
      return send(res, 200, JSON.stringify({ records: Object.keys(db.records).length, members: (config.members || []).length, envToken: TOKEN_FROM_ENV }), { "Content-Type": "application/json" });

    if (u.pathname === "/api/admin/db" && req.method === "GET")
      return send(res, 200, JSON.stringify({ records: Object.values(db.records) }), { "Content-Type": "application/json" });

    if (u.pathname === "/api/admin/db" && req.method === "POST")
      return readBody(req, res, p => {
        const arr = Array.isArray(p && p.records) ? p.records : (Array.isArray(p) ? p : null);
        if (!arr) return send(res, 400, JSON.stringify({ error: "Thiếu records[]" }), { "Content-Type": "application/json" });
        const map = {}; arr.forEach(r => { if (r && r.id) map[r.id] = r; });
        db.records = map; saveDB();
        return send(res, 200, JSON.stringify({ ok: true, count: Object.keys(map).length }), { "Content-Type": "application/json" });
      });

    if (u.pathname === "/api/admin/wipe" && req.method === "POST") {
      db.records = {}; saveDB();
      return send(res, 200, JSON.stringify({ ok: true }), { "Content-Type": "application/json" });
    }

    if (u.pathname === "/api/admin/token" && req.method === "POST") {
      if (TOKEN_FROM_ENV) return send(res, 400, JSON.stringify({ error: "Token đang đặt bằng biến môi trường ADMIN_TOKEN — đổi tại Coolify/biến môi trường." }), { "Content-Type": "application/json" });
      return readBody(req, res, p => {
        const nt = String((p && p.token) || "").trim();
        if (nt.length < 6) return send(res, 400, JSON.stringify({ error: "Token tối thiểu 6 ký tự" }), { "Content-Type": "application/json" });
        ADMIN_TOKEN = nt; try { fs.writeFileSync(TOKEN_FILE, nt); } catch (e) {}
        return send(res, 200, JSON.stringify({ ok: true }), { "Content-Type": "application/json" });
      });
    }
    return send(res, 404, JSON.stringify({ error: "API quản trị không tồn tại" }), { "Content-Type": "application/json" });
  }

  // ---- File tĩnh ----
  let p = decodeURIComponent(u.pathname);
  if (p === "/") p = "/PCCC_App.html";
  const file = path.normalize(path.join(ROOT, p));
  if (!file.startsWith(ROOT)) return send(res, 403, "Forbidden");
  // Chặn lộ file nhạy cảm & toàn bộ thư mục dữ liệu (kể cả khi DATA_DIR trùng ROOT)
  const SENSITIVE = ["admin_token.txt", "pccc_db.json", "config.json"];
  if (SENSITIVE.includes(path.basename(file)) || file.startsWith(path.normalize(DATA_DIR) + path.sep))
    return send(res, 403, "Forbidden");
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, "Not found: " + p);
    send(res, 200, data, { "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream" });
  });
});

server.listen(PORT, HOST, () => {
  console.log("==================================================");
  console.log("  PCCC Sync Server đang chạy");
  console.log("  Mở ứng dụng:  http://localhost:" + PORT + "/");
  console.log("  Trang quản trị: http://localhost:" + PORT + "/admin.html");
  console.log("  Admin token:  " + (TOKEN_FROM_ENV ? "(đặt qua biến môi trường ADMIN_TOKEN)" : ADMIN_TOKEN));
  console.log("  Basic Auth:   " + (APP_PASSWORD ? ("BẬT (user=" + APP_USER + ")") : "TẮT — chỉ dùng trong mạng nội bộ; đặt APP_PASSWORD khi public"));
  console.log("  Dữ liệu lưu:  " + DBFILE);
  console.log("  Dừng: Ctrl + C");
  console.log("==================================================");
});
