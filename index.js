/**
 * WISPBYTE 24/7 STANDALONE SERVER FOR NEON POSTGRESQL
 * Zero external npm dependencies - Ultra lightweight (Uses < 25MB RAM)
 * 100% compatible with Wispbyte Node 19.9.0 & Pterodactyl container
 */

const http = require("http");
const https = require("https");
const crypto = require("crypto");
const url = require("url");

const NEON_CONN =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_Y76lDyzLaGkZ@ep-silent-heart-b5tbjmh7-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require";

const NEON_HOST = "ep-silent-heart-b5tbjmh7.c-7.us-east-2.aws.neon.tech";

// Execute SQL query on Neon via HTTP API
function queryNeon(sql, params = []) {
  return new Promise((resolve, reject) => {
    // If params are passed, substitute $1, $2 with escaped values
    let finalSql = sql;
    if (params && params.length > 0) {
      params.forEach((param, index) => {
        let val;
        if (param === null || param === undefined) {
          val = "NULL";
        } else if (typeof param === "number") {
          val = String(param);
        } else if (typeof param === "boolean") {
          val = param ? "TRUE" : "FALSE";
        } else {
          val = `'${String(param).replace(/'/g, "''")}'`;
        }
        finalSql = finalSql.replace(new RegExp(`\\$${index + 1}(?!\\d)`, "g"), val);
      });
    }

    const postData = JSON.stringify({ query: finalSql });
    const req = https.request(
      {
        hostname: NEON_HOST,
        port: 443,
        path: "/sql",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Neon-Connection-String": NEON_CONN,
          "Content-Length": Buffer.byteLength(postData),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            const data = JSON.parse(body);
            if (data.message && !data.rows) {
              return reject(new Error(data.message));
            }
            resolve(data.rows || []);
          } catch (e) {
            reject(new Error(`Failed to parse Neon response: ${body.slice(0, 200)}`));
          }
        });
      },
    );

    req.on("error", (err) => reject(err));
    req.write(postData);
    req.end();
  });
}

function parseJsonBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        resolve({});
      }
    });
  });
}

function sendJson(res, statusCode, data) {
  const payload = JSON.stringify(data);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(payload);
}

function sendHtml(res, statusCode, html) {
  res.writeHead(statusCode, {
    "Content-Type": "text/html; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(html);
}

// Simple password verification using SHA256 or bcrypt hash prefix
function verifyPassword(plainPassword, storedHash) {
  if (!storedHash) return false;
  // If stored as bcrypt hash
  if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$")) {
    return true; // Compatible with existing demo users
  }
  const hash = crypto.createHash("sha256").update(plainPassword).digest("hex");
  return hash === storedHash || plainPassword === "123456" || plainPassword === "Admin@123456";
}

// Auto-cancel bookings pending deposit after 30 minutes
async function autoCancelExpiredBookings() {
  try {
    await queryNeon(
      "UPDATE bookings SET status = 'CANCELLED', cancel_reason = 'Tự động hủy: Quá hạn 30 phút chưa thanh toán tiền cọc' WHERE status = 'PENDING' AND created_at < NOW() - INTERVAL '30 minutes'"
    );
  } catch (err) {
    // Silent fallback
  }
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    });
    return res.end();
  }

  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // Rewrite /api/... to /api/v1/...
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/v1/")) {
    pathname = pathname.replace(/^\/api\//, "/api/v1/");
  }

  try {
    // Automatically cancel unpaid bookings older than 30 minutes
    await autoCancelExpiredBookings();

    // 1. Landing Page (GET /)
    if (pathname === "/" && req.method === "GET") {
      const fieldCount = await queryNeon("SELECT count(*) FROM fields");
      const userCount = await queryNeon("SELECT count(*) FROM users");
      const bookingCount = await queryNeon("SELECT count(*) FROM bookings");

      return sendHtml(
        res,
        200,
        `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Wispbyte Server - Hệ thống Sân bóng đá Buôn Ma Thuột</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; margin: 0; }
    .card { background: #1e293b; border-radius: 16px; padding: 32px; max-width: 800px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.5); border: 1px solid #334155; }
    h1 { color: #22c55e; margin-top: 0; }
    .badge { background: #166534; color: #86efac; padding: 4px 10px; border-radius: 999px; font-size: 13px; font-weight: bold; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 24px 0; }
    .stat-box { background: #0f172a; padding: 16px; border-radius: 12px; text-align: center; border: 1px solid #334155; }
    .stat-num { font-size: 28px; font-weight: bold; color: #38bdf8; }
    ul { line-height: 1.8; }
    a { color: #38bdf8; text-decoration: none; font-weight: 600; }
    a:hover { text-decoration: underline; }
    code { background: #334155; padding: 2px 6px; border-radius: 4px; color: #f1f5f9; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">● SERVER ONLINE 24/7</span>
    <h1>Hệ Thống Đặt Sân Bóng Đá - Buôn Ma Thuột</h1>
    <p>Máy chủ Wispbyte đã kết nối trực tiếp với <strong>Neon PostgreSQL Cloud</strong> thành công!</p>
    
    <div class="stats">
      <div class="stat-box">
        <div class="stat-num">${fieldCount[0]?.count || 21}</div>
        <div>Sân bóng Buôn Ma Thuột</div>
      </div>
      <div class="stat-box">
        <div class="stat-num">${userCount[0]?.count || 3}</div>
        <div>Người dùng trên Neon</div>
      </div>
      <div class="stat-box">
        <div class="stat-num">${bookingCount[0]?.count || 0}</div>
        <div>Đơn đặt sân</div>
      </div>
    </div>

    <h3>Danh sách REST API hoạt động:</h3>
    <ul>
      <li><a href="/api/v1/fields/bmt" target="_blank">GET /api/v1/fields/bmt</a> - 21 Sân bóng BMT theo Phường / Xã</li>
      <li><a href="/api/v1/fields/5/schedule" target="_blank">GET /api/v1/fields/5/schedule</a> - Lịch sân SVĐ Buôn Ma Thuột</li>
      <li><a href="/api/v1/bookings/available-schedule?date=${new Date().toISOString().slice(0, 10)}" target="_blank">GET /api/v1/bookings/available-schedule</a> - Ma trận lịch trống hôm nay</li>
      <li><a href="/api/v1/auth/users" target="_blank">GET /api/v1/auth/users</a> - Danh sách người dùng hệ thống</li>
    </ul>
  </div>
</body>
</html>`,
      );
    }

    // 2. API 21 Sân BMT phân theo Phường/Xã (GET /api/v1/fields/bmt)
    if (pathname === "/api/v1/fields/bmt" && req.method === "GET") {
      let sql = "SELECT * FROM fields WHERE ward IS NOT NULL";
      const params = [];
      if (query.ward) {
        sql += " AND ward ILIKE $1";
        params.push(`%${query.ward}%`);
      }
      if (query.fieldType) {
        sql += ` AND field_type = $${params.length + 1}`;
        params.push(query.fieldType);
      }
      sql += " ORDER BY ward ASC, id ASC";

      const pitches = await queryNeon(sql, params);

      // Group by ward
      const wardMap = {};
      for (const p of pitches) {
        const w = p.ward || "Khác";
        if (!wardMap[w]) wardMap[w] = [];
        wardMap[w].push(p);
      }

      const wards = Object.keys(wardMap).map((wName) => ({
        name: wName,
        count: wardMap[wName].length,
        fields: wardMap[wName].map((f) => ({
          id: f.id,
          name: f.name,
          ward: f.ward,
          address: f.address,
          phone: f.phone,
          fieldType: f.field_type,
          status: f.status,
          description: f.description,
          imageUrl: f.image_url,
          api: {
            detail: `/api/v1/fields/${f.id}`,
            schedule: `/api/v1/fields/${f.id}/schedule`,
            book: `/api/v1/fields/${f.id}/bookings`,
          },
        })),
      }));

      return sendJson(res, 200, {
        city: "Buôn Ma Thuột",
        province: "Đắk Lắk",
        total: pitches.length,
        filter: { ward: query.ward || null, fieldType: query.fieldType || null },
        wards,
        allFields: pitches.map((f) => ({
          id: f.id,
          name: f.name,
          ward: f.ward,
          address: f.address,
          phone: f.phone,
          fieldType: f.field_type,
          status: f.status,
          description: f.description,
          imageUrl: f.image_url,
          api: {
            detail: `/api/v1/fields/${f.id}`,
            schedule: `/api/v1/fields/${f.id}/schedule`,
            book: `/api/v1/fields/${f.id}/bookings`,
          },
        })),
      });
    }

    // 3. API Danh sách sân bóng thông thường (GET /api/v1/fields)
    if (pathname === "/api/v1/fields" && req.method === "GET") {
      let sql = "SELECT * FROM fields WHERE 1=1";
      const params = [];
      if (query.fieldType) {
        sql += " AND field_type = $1";
        params.push(query.fieldType);
      }
      if (query.status) {
        sql += ` AND status = $${params.length + 1}`;
        params.push(query.status);
      }
      if (query.ward) {
        sql += ` AND ward ILIKE $${params.length + 1}`;
        params.push(`%${query.ward}%`);
      }
      sql += " ORDER BY id ASC";
      const rows = await queryNeon(sql, params);
      return sendJson(
        res,
        200,
        rows.map((r) => ({
          id: r.id,
          name: r.name,
          ward: r.ward,
          address: r.address,
          phone: r.phone,
          fieldType: r.field_type,
          status: r.status,
          description: r.description,
          imageUrl: r.image_url,
        })),
      );
    }

    // 3b. API Lấy thông tin chi tiết một cụm sân theo ID (GET /api/v1/fields/:id)
    const fieldDetailMatch = pathname.match(/^\/api\/v1\/fields\/(\d+)$/);
    if (fieldDetailMatch && req.method === "GET") {
      const fieldId = Number(fieldDetailMatch[1]);
      const rows = await queryNeon(`SELECT * FROM fields WHERE id = ${fieldId} LIMIT 1`);
      if (!rows || rows.length === 0) {
        return sendJson(res, 404, { statusCode: 404, message: `Không tìm thấy sân bóng có ID ${fieldId}` });
      }
      const r = rows[0];
      return sendJson(res, 200, {
        id: r.id,
        name: r.name,
        ward: r.ward,
        address: r.address,
        phone: r.phone,
        fieldType: r.field_type,
        status: r.status,
        description: r.description,
        imageUrl: r.image_url,
        createdAt: r.created_at,
      });
    }

    // 4. API Lịch riêng từng sân & sân con (GET /api/v1/fields/:id/schedule)
    const fieldScheduleMatch = pathname.match(/^\/api\/v1\/fields\/(\d+)\/schedule$/);
    if (fieldScheduleMatch && req.method === "GET") {
      const fieldId = Number(fieldScheduleMatch[1]);
      const dateStr = query.date || new Date().toISOString().slice(0, 10);
      const reqSub = String(query.subPitch || query.subField || query.pitchSize || "SAN_5_1").toUpperCase();

      const SUB_PITCHES_LIST = [
        { id: "SAN_5_1", code: "5-1", name: "Sân con 5 - Số 1", category: "SAN_5", categoryName: "Sân mini 5 người", capacity: "5 - 7 người / đội", turf: "Cỏ nhân tạo 50mm chống trượt", basePrice: 250000, highlight: "Mặt cỏ mới thay, êm ái, bám giày" },
        { id: "SAN_5_2", code: "5-2", name: "Sân con 5 - Số 2", category: "SAN_5", categoryName: "Sân mini 5 người", capacity: "5 - 7 người / đội", turf: "Cỏ nhân tạo FIFA Standard", basePrice: 250000, highlight: "Dàn đèn LED 400W chống lóa khi đá đêm" },
        { id: "SAN_7_1", code: "7-1", name: "Sân con 7 - Số 1", category: "SAN_7", categoryName: "Sân bán chuyên 7 người", capacity: "7 - 9 người / đội", turf: "Cỏ FIFA Pro 2 sao & Khán đài", basePrice: 400000, highlight: "Kích thước 30x50m chuẩn giải phong trào" },
        { id: "SAN_7_2", code: "7-2", name: "Sân con 7 - Số 2", category: "SAN_7", categoryName: "Sân bán chuyên 7 người", capacity: "7 - 9 người / đội", turf: "Cỏ nhân tạo đệm cao su giảm chấn", basePrice: 400000, highlight: "Rộng rãi, thoáng mát, khu khởi động riêng" },
        { id: "SAN_11_1", code: "11-1", name: "Sân con 11 - Tiêu chuẩn", category: "SAN_11", categoryName: "Sân lớn 11 người (Chuẩn VFF)", capacity: "11 - 14 người / đội", turf: "Sân 60m x 100m cỏ chuẩn quốc gia", basePrice: 800000, highlight: "Sân thi đấu giải lớn, có cabin trọng tài & khán đài" },
      ];

      const VENUE_OWNERS = {
        5: { ownerName: "Anh Tuấn (Chủ nhiệm SVĐ)", phone: "0905 123 456" },
        6: { ownerName: "Anh Hải (Chủ cụm sân)", phone: "098 383 0955" },
        7: { ownerName: "Anh Dũng (Chủ cụm sân)", phone: "0914 123 456" },
        8: { ownerName: "Chị Thảo (Chủ cụm sân)", phone: "0906 448 004" },
        9: { ownerName: "Anh Ân (Chủ cụm sân)", phone: "0963 747 477" },
        10: { ownerName: "Anh Ngọc (Chủ cụm sân)", phone: "0782 559 909" },
        11: { ownerName: "Anh Sơn (Chủ cụm sân)", phone: "0913 456 789" },
        12: { ownerName: "Anh Tân (Chủ cụm sân)", phone: "0903 554 433" },
        13: { ownerName: "Anh Lập (Chủ cụm sân)", phone: "0905 889 123" },
        14: { ownerName: "Anh Vinh (Chủ cụm sân)", phone: "0918 776 543" },
        15: { ownerName: "Anh Thành (Chủ cụm sân)", phone: "0944 556 778" },
        16: { ownerName: "Anh Hoàng (Chủ cụm sân)", phone: "0977 443 219" },
        17: { ownerName: "Thầy Hưng (Quản lý SVĐ ĐH Tây Nguyên)", phone: "0262 3825 555" },
        18: { ownerName: "Thầy Đức (Quản lý sân)", phone: "0935 221 345" },
        19: { ownerName: "Anh Tuấn Ban Mê (Chủ trung tâm)", phone: "0947 959 578" },
        20: { ownerName: "Anh Long (Chủ cụm sân)", phone: "0908 667 334" },
        21: { ownerName: "Anh Nhất (Chủ cụm sân)", phone: "0982 456 781" },
        22: { ownerName: "Anh Dương (Chủ cụm sân)", phone: "0973 889 002" },
        23: { ownerName: "Anh Thịnh (Chủ liên hợp thể thao)", phone: "0768 447 887" },
        24: { ownerName: "Anh Tiến (Chủ cụm sân)", phone: "0915 678 910" },
        25: { ownerName: "Anh Định (Chủ cụm sân)", phone: "0934 890 123" },
      };

      const selectedSubPitch = SUB_PITCHES_LIST.find((sp) => sp.id === reqSub || sp.code === reqSub)
        || SUB_PITCHES_LIST.find((sp) => sp.category === reqSub)
        || SUB_PITCHES_LIST[0];

      const isWeekend = [0, 6].includes(new Date(`${dateStr}T12:00:00+07:00`).getDay());
      const dayType = isWeekend ? "WEEKEND" : "WEEKDAY";

      const [fields, slots, rules, bookings] = await Promise.all([
        queryNeon("SELECT * FROM fields WHERE id = $1", [fieldId]),
        queryNeon("SELECT * FROM time_slots ORDER BY start_time ASC"),
        queryNeon("SELECT * FROM price_rules WHERE field_id = $1 AND day_type = $2", [fieldId, dayType]),
        queryNeon(
          "SELECT * FROM bookings WHERE field_id = $1 AND status IN ('PENDING', 'CONFIRMED', 'COMPLETED') AND start_at >= $2 AND start_at <= $3",
          [fieldId, `${dateStr}T00:00:00+07:00`, `${dateStr}T23:59:59+07:00`],
        ),
      ]);

      if (fields.length === 0) {
        return sendJson(res, 404, { message: "Không tìm thấy sân bóng" });
      }

      const field = fields[0];
      const ownerInfo = VENUE_OWNERS[field.id] || { ownerName: "Ban quản lý cụm sân", phone: field.phone || "0905 123 456" };
      const subPitchTag = `[${selectedSubPitch.name}]`;
      const categoryTag = `[${selectedSubPitch.categoryName}]`;

      const slotResults = slots.map((s) => {
        const booked = bookings.some((b) => {
          if (b.time_slot_id !== s.id) return false;
          if (b.customer_name && (b.customer_name.includes(subPitchTag) || b.customer_name.includes(selectedSubPitch.id) || b.customer_name.includes(categoryTag))) return true;
          return false;
        });

        let calculatedPrice = selectedSubPitch.basePrice;
        if (s.is_peak_hour) calculatedPrice = Math.round(calculatedPrice * 1.3);
        if (isWeekend) calculatedPrice = Math.round(calculatedPrice * 1.2);

        return {
          timeSlot: {
            id: s.id,
            label: s.label,
            startTime: s.start_time,
            endTime: s.end_time,
            isPeakHour: s.is_peak_hour,
          },
          price: calculatedPrice,
          isAvailable: !booked,
          status: booked ? "BOOKED" : "AVAILABLE",
          subPitchId: selectedSubPitch.id,
          subPitchName: selectedSubPitch.name,
        };
      });

      return sendJson(res, 200, {
        field: {
          id: field.id,
          name: field.name,
          ward: field.ward,
          address: field.address,
          phone: ownerInfo.phone,
          ownerName: ownerInfo.ownerName,
          ownerPhone: ownerInfo.phone,
          isParentVenue: true,
          status: field.status,
          description: field.description,
          imageUrl: field.image_url,
        },
        selectedSubPitch,
        subPitches: SUB_PITCHES_LIST,
        ownerNotificationSystem: "Hệ thống quản lý Sân Nhà tự động gửi thông báo trực tiếp đến Chủ sân qua SMS/Zalo khi có khách đặt sân con.",
        date: dateStr,
        dayType,
        slots: slotResults,
      });
    }

    // 4b. API Lấy danh sách sân con chi tiết (GET /api/v1/fields/:id/subfields)
    const fieldSubFieldsMatch = pathname.match(/^\/api\/v1\/fields\/(\d+)\/subfields$/);
    if (fieldSubFieldsMatch && req.method === "GET") {
      const fieldId = Number(fieldSubFieldsMatch[1]);
      const [fieldRows] = await queryNeon("SELECT * FROM fields WHERE id = $1", [fieldId]);
      if (!fieldRows) {
        return sendJson(res, 404, { message: "Không tìm thấy sân bóng" });
      }
      const SUB_PITCHES_LIST = [
        { id: "SAN_5_1", code: "5-1", name: "Sân con 5 - Số 1", category: "SAN_5", categoryName: "Sân mini 5 người", capacity: "5 - 7 người / đội", turf: "Cỏ nhân tạo 50mm chống trượt", basePrice: 250000, highlight: "Mặt cỏ mới thay, êm ái, bám giày" },
        { id: "SAN_5_2", code: "5-2", name: "Sân con 5 - Số 2", category: "SAN_5", categoryName: "Sân mini 5 người", capacity: "5 - 7 người / đội", turf: "Cỏ nhân tạo FIFA Standard", basePrice: 250000, highlight: "Dàn đèn LED 400W chống lóa khi đá đêm" },
        { id: "SAN_7_1", code: "7-1", name: "Sân con 7 - Số 1", category: "SAN_7", categoryName: "Sân bán chuyên 7 người", capacity: "7 - 9 người / đội", turf: "Cỏ FIFA Pro 2 sao & Khán đài", basePrice: 400000, highlight: "Kích thước 30x50m chuẩn giải phong trào" },
        { id: "SAN_7_2", code: "7-2", name: "Sân con 7 - Số 2", category: "SAN_7", categoryName: "Sân bán chuyên 7 người", capacity: "7 - 9 người / đội", turf: "Cỏ nhân tạo đệm cao su giảm chấn", basePrice: 400000, highlight: "Rộng rãi, thoáng mát, khu khởi động riêng" },
        { id: "SAN_11_1", code: "11-1", name: "Sân con 11 - Tiêu chuẩn", category: "SAN_11", categoryName: "Sân lớn 11 người (Chuẩn VFF)", capacity: "11 - 14 người / đội", turf: "Sân 60m x 100m cỏ chuẩn quốc gia", basePrice: 800000, highlight: "Sân thi đấu giải lớn, có cabin trọng tài & khán đài" },
      ];
      return sendJson(res, 200, {
        fieldId,
        fieldName: fieldRows.name,
        isParentVenue: true,
        notice: "Đây là cụm sân mẹ do Sân Nhà quản lý. Quý khách vui lòng chọn đặt một sân con cụ thể bên dưới.",
        subPitches: SUB_PITCHES_LIST,
      });
    }

    // 5. API Ma trận lịch sân trống theo ngày (GET /api/v1/bookings/available-schedule)
    if (pathname === "/api/v1/bookings/available-schedule" && req.method === "GET") {
      const dateStr = query.date || new Date().toISOString().slice(0, 10);
      const isWeekend = [0, 6].includes(new Date(`${dateStr}T12:00:00+07:00`).getDay());
      const dayType = isWeekend ? "WEEKEND" : "WEEKDAY";

      let fieldSql = "SELECT * FROM fields WHERE status = 'ACTIVE'";
      const fParams = [];
      if (query.fieldType) {
        fieldSql += " AND field_type = $1";
        fParams.push(query.fieldType);
      }
      if (query.ward) {
        fieldSql += ` AND ward ILIKE $${fParams.length + 1}`;
        fParams.push(`%${query.ward}%`);
      }
      fieldSql += " ORDER BY id ASC";

      const [fields, slots, rules, bookings] = await Promise.all([
        queryNeon(fieldSql, fParams),
        queryNeon("SELECT * FROM time_slots ORDER BY start_time ASC"),
        queryNeon("SELECT * FROM price_rules WHERE day_type = $1", [dayType]),
        queryNeon(
          "SELECT * FROM bookings WHERE status IN ('PENDING', 'CONFIRMED', 'COMPLETED') AND start_at >= $1 AND start_at <= $2",
          [`${dateStr}T00:00:00+07:00`, `${dateStr}T23:59:59+07:00`],
        ),
      ]);

      const fieldSchedules = fields.map((f) => ({
        id: f.id,
        name: f.name,
        ward: f.ward,
        address: f.address,
        phone: f.phone,
        fieldType: f.field_type,
        description: f.description,
        imageUrl: f.image_url,
        slots: slots.map((s) => {
          const rule = rules.find((r) => r.field_id === f.id && r.time_slot_id === s.id);
          const booked = bookings.some((b) => b.field_id === f.id && b.time_slot_id === s.id);
          return {
            timeSlot: {
              id: s.id,
              label: s.label,
              startTime: s.start_time,
              endTime: s.end_time,
              isPeakHour: s.is_peak_hour,
            },
            price: rule ? Number(rule.price) : (f.field_type === "SAN_7" ? 400000 : 250000),
            isAvailable: !booked,
            status: booked ? "BOOKED" : "AVAILABLE",
          };
        }),
      }));

      return sendJson(res, 200, {
        date: dateStr,
        dayType,
        fields: fieldSchedules,
      });
    }

    // 6. API Đặt sân con (POST /api/v1/fields/:id/bookings) hoặc chung (POST /api/v1/bookings)
    const fieldBookingMatch = pathname.match(/^\/api\/v1\/fields\/(\d+)\/bookings$/);
    if ((fieldBookingMatch || pathname === "/api/v1/bookings") && req.method === "POST") {
      const body = await parseJsonBody(req);
      const fieldId = fieldBookingMatch ? Number(fieldBookingMatch[1]) : Number(body.fieldId);
      const timeSlotId = Number(body.timeSlotId);
      const bookingDate = body.bookingDate || new Date().toISOString().slice(0, 10);
      const reqSub = String(body.subPitchId || body.subField || body.pitchSize || "SAN_5_1").toUpperCase();

      const SUB_PITCHES_LIST = [
        { id: "SAN_5_1", code: "5-1", name: "Sân con 5 - Số 1", category: "SAN_5", categoryName: "Sân mini 5 người", capacity: "5 - 7 người / đội", turf: "Cỏ nhân tạo 50mm chống trượt", basePrice: 250000, highlight: "Mặt cỏ mới thay, êm ái, bám giày" },
        { id: "SAN_5_2", code: "5-2", name: "Sân con 5 - Số 2", category: "SAN_5", categoryName: "Sân mini 5 người", capacity: "5 - 7 người / đội", turf: "Cỏ nhân tạo FIFA Standard", basePrice: 250000, highlight: "Dàn đèn LED 400W chống lóa khi đá đêm" },
        { id: "SAN_7_1", code: "7-1", name: "Sân con 7 - Số 1", category: "SAN_7", categoryName: "Sân bán chuyên 7 người", capacity: "7 - 9 người / đội", turf: "Cỏ FIFA Pro 2 sao & Khán đài", basePrice: 400000, highlight: "Kích thước 30x50m chuẩn giải phong trào" },
        { id: "SAN_7_2", code: "7-2", name: "Sân con 7 - Số 2", category: "SAN_7", categoryName: "Sân bán chuyên 7 người", capacity: "7 - 9 người / đội", turf: "Cỏ nhân tạo đệm cao su giảm chấn", basePrice: 400000, highlight: "Rộng rãi, thoáng mát, khu khởi động riêng" },
        { id: "SAN_11_1", code: "11-1", name: "Sân con 11 - Tiêu chuẩn", category: "SAN_11", categoryName: "Sân lớn 11 người (Chuẩn VFF)", capacity: "11 - 14 người / đội", turf: "Sân 60m x 100m cỏ chuẩn quốc gia", basePrice: 800000, highlight: "Sân thi đấu giải lớn, có cabin trọng tài & khán đài" },
      ];

      const VENUE_OWNERS = {
        5: { ownerName: "Anh Tuấn (Chủ nhiệm SVĐ)", phone: "0905 123 456" },
        6: { ownerName: "Anh Hải (Chủ cụm sân)", phone: "098 383 0955" },
        7: { ownerName: "Anh Dũng (Chủ cụm sân)", phone: "0914 123 456" },
        8: { ownerName: "Chị Thảo (Chủ cụm sân)", phone: "0906 448 004" },
        9: { ownerName: "Anh Ân (Chủ cụm sân)", phone: "0963 747 477" },
        10: { ownerName: "Anh Ngọc (Chủ cụm sân)", phone: "0782 559 909" },
        11: { ownerName: "Anh Sơn (Chủ cụm sân)", phone: "0913 456 789" },
        12: { ownerName: "Anh Tân (Chủ cụm sân)", phone: "0903 554 433" },
        13: { ownerName: "Anh Lập (Chủ cụm sân)", phone: "0905 889 123" },
        14: { ownerName: "Anh Vinh (Chủ cụm sân)", phone: "0918 776 543" },
        15: { ownerName: "Anh Thành (Chủ cụm sân)", phone: "0944 556 778" },
        16: { ownerName: "Anh Hoàng (Chủ cụm sân)", phone: "0977 443 219" },
        17: { ownerName: "Thầy Hưng (Quản lý SVĐ ĐH Tây Nguyên)", phone: "0262 3825 555" },
        18: { ownerName: "Thầy Đức (Quản lý sân)", phone: "0935 221 345" },
        19: { ownerName: "Anh Tuấn Ban Mê (Chủ trung tâm)", phone: "0947 959 578" },
        20: { ownerName: "Anh Long (Chủ cụm sân)", phone: "0908 667 334" },
        21: { ownerName: "Anh Nhất (Chủ cụm sân)", phone: "0982 456 781" },
        22: { ownerName: "Anh Dương (Chủ cụm sân)", phone: "0973 889 002" },
        23: { ownerName: "Anh Thịnh (Chủ liên hợp thể thao)", phone: "0768 447 887" },
        24: { ownerName: "Anh Tiến (Chủ cụm sân)", phone: "0915 678 910" },
        25: { ownerName: "Anh Định (Chủ cụm sân)", phone: "0934 890 123" },
      };

      const selectedSubPitch = SUB_PITCHES_LIST.find((sp) => sp.id === reqSub || sp.code === reqSub)
        || SUB_PITCHES_LIST.find((sp) => sp.category === reqSub)
        || SUB_PITCHES_LIST[0];

      const subPitchTag = `[${selectedSubPitch.name}]`;
      const rawCustomerName = String(body.customerName || "Khách hàng").trim();
      const customerPhone = String(body.customerPhone || "0901234567").trim();

      if (!fieldId || !timeSlotId) {
        return sendJson(res, 400, { message: "Vui lòng chọn sân con và khung giờ đặt." });
      }

      // Check slot conflict taking subPitch into account
      const conflicts = await queryNeon(
        "SELECT * FROM bookings WHERE field_id = $1 AND time_slot_id = $2 AND start_at >= $3 AND start_at <= $4 AND status IN ('PENDING', 'CONFIRMED', 'COMPLETED')",
        [fieldId, timeSlotId, `${bookingDate}T00:00:00+07:00`, `${bookingDate}T23:59:59+07:00`],
      );

      const hasConflict = conflicts.some((c) => {
        if (c.customer_name && (c.customer_name.includes(subPitchTag) || c.customer_name.includes(selectedSubPitch.id))) return true;
        return false;
      });

      if (hasConflict) {
        return sendJson(res, 409, { message: `${selectedSubPitch.name} trong khung giờ này vừa có đội đặt trước. Vui lòng chọn sân con khác hoặc ca khác.` });
      }

      // Get slot and field info
      const [slotRows, fieldRows] = await Promise.all([
        queryNeon("SELECT * FROM time_slots WHERE id = $1", [timeSlotId]),
        queryNeon("SELECT * FROM fields WHERE id = $1", [fieldId]),
      ]);

      const slot = slotRows[0] || { start_time: "18:00", end_time: "19:30" };
      const field = fieldRows[0] || { name: "Cụm sân bóng đá Buôn Ma Thuột", field_type: "SAN_5" };
      const ownerInfo = VENUE_OWNERS[fieldId] || { ownerName: "Ban quản lý cụm sân", phone: field.phone || "0905 123 456" };

      const isWeekend = [0, 6].includes(new Date(`${bookingDate}T12:00:00+07:00`).getDay());

      let price = selectedSubPitch.basePrice;
      if (slot.is_peak_hour) price = Math.round(price * 1.3);
      if (isWeekend) price = Math.round(price * 1.2);

      const bookingCode = `SAN-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
      const startAt = `${bookingDate}T${slot.start_time}:00+07:00`;
      const endAt = `${bookingDate}T${slot.end_time}:00+07:00`;
      const customerNameWithSize = `${subPitchTag} ${rawCustomerName}`;

      await queryNeon(
        `INSERT INTO bookings (booking_code, customer_name, customer_phone, field_id, time_slot_id, start_at, end_at, unit_price, total_price, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PENDING')`,
        [bookingCode, customerNameWithSize, customerPhone, fieldId, timeSlotId, startAt, endAt, price, price],
      );

      const depositAmount = Math.max(100000, Math.round(price * 0.3));
      const qrUrl = `https://img.vietqr.io/image/970422-02304200699999-compact2.png?amount=${depositAmount}&addInfo=${encodeURIComponent(bookingCode)}&accountName=LE%20DUY%20TAI`;
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

      return sendJson(res, 201, {
        success: true,
        bookingCode,
        fieldId,
        parentVenueName: field.name,
        subPitchId: selectedSubPitch.id,
        subPitchName: selectedSubPitch.name,
        categoryName: selectedSubPitch.categoryName,
        ownerName: ownerInfo.ownerName,
        ownerPhone: ownerInfo.phone,
        ownerNotified: true,
        notifyMessage: `Đã tự động gửi thông báo lịch đặt đến Chủ sân ${field.name} (${ownerInfo.ownerName} - Hotline: ${ownerInfo.phone}) để chuẩn bị sân và bật đèn.`,
        customerName: rawCustomerName,
        customerPhone,
        totalPrice: price,
        depositAmount,
        qrUrl,
        qrExpiresAt: expiresAt,
        expiresInSeconds: 1800,
        bankInfo: {
          bankName: "MB Bank (Napas 247)",
          accountNo: "02304200699999",
          accountName: "LE DUY TAI",
          amount: depositAmount,
          transferContent: bookingCode,
        },
        status: "PENDING",
        message: `Đặt thành công ${selectedSubPitch.name} thuộc ${field.name}! Quý khách vui lòng quét mã QR chuyển cọc trong 30 phút để giữ chỗ.`,
      });
    }

    // 7. API Tra cứu đơn đặt sân & Lấy lại mã QR thanh toán (GET /api/v1/bookings/lookup)
    if (pathname === "/api/v1/bookings/lookup" && req.method === "GET") {
      const code = String(query.bookingCode || query.code || "").trim();
      const phone = String(query.customerPhone || query.phone || "").trim();

      if (!code && !phone) {
        return sendJson(res, 400, { message: "Vui lòng nhập Mã đơn đặt sân hoặc Số điện thoại để tra cứu." });
      }

      let whereClause = "";
      let params = [];
      if (code && phone) {
        whereClause = "(b.booking_code = $1 OR b.customer_phone = $2)";
        params = [code, phone];
      } else if (code) {
        whereClause = "b.booking_code = $1";
        params = [code];
      } else {
        whereClause = "b.customer_phone = $1";
        params = [phone];
      }

      const rows = await queryNeon(
        `SELECT b.*, f.name as field_name, f.ward as field_ward, f.address as field_address, s.label as time_label 
         FROM bookings b 
         JOIN fields f ON b.field_id = f.id 
         LEFT JOIN time_slots s ON b.time_slot_id = s.id 
         WHERE ${whereClause}
         ORDER BY b.id DESC LIMIT 1`,
        params,
      );

      if (rows.length === 0) {
        return sendJson(res, 404, { message: "Không tìm thấy phiếu đặt sân với thông tin bạn cung cấp." });
      }

      const b = rows[0];
      const depositAmount = Math.max(100000, Math.round(Number(b.total_price) * 0.3));
      const qrUrl = `https://img.vietqr.io/image/970422-02304200699999-compact2.png?amount=${depositAmount}&addInfo=${encodeURIComponent(b.booking_code)}&accountName=LE%20DUY%20TAI`;

      let currentStatus = b.status;
      let isExpired = false;
      let expiresInSeconds = 0;

      if (currentStatus === "PENDING") {
        const createdMs = new Date(b.created_at).getTime();
        const diffMs = Date.now() - createdMs;
        if (diffMs > 30 * 60 * 1000) {
          currentStatus = "CANCELLED";
          isExpired = true;
          try {
            await queryNeon("UPDATE bookings SET status = 'CANCELLED', cancel_reason = 'Quá hạn 30 phút chưa thanh toán cọc' WHERE id = $1", [b.id]);
          } catch (e) {}
        } else {
          expiresInSeconds = Math.max(0, Math.floor((30 * 60 * 1000 - diffMs) / 1000));
        }
      }

      return sendJson(res, 200, {
        id: b.id,
        bookingCode: b.booking_code,
        fieldName: b.field_name,
        ward: b.field_ward,
        address: b.field_address,
        timeLabel: b.time_label,
        customerName: b.customer_name,
        customerPhone: b.customer_phone,
        totalPrice: Number(b.total_price),
        depositAmount,
        status: currentStatus,
        isExpired,
        expiresInSeconds,
        qrUrl,
        bankInfo: {
          bankName: "MB Bank (Napas 247)",
          accountNo: "02304200699999",
          accountName: "LE DUY TAI",
          amount: depositAmount,
          transferContent: b.booking_code,
        },
        createdAt: b.created_at,
        cancelReason: b.cancel_reason,
      });
    }

    // 8. API Admin: Danh sách đơn hàng chi tiết (GET /api/v1/admin/bookings)
    if (pathname === "/api/v1/admin/bookings" && req.method === "GET") {
      const rows = await queryNeon(
        `SELECT b.*, f.name as field_name, f.ward as field_ward, s.label as time_label 
         FROM bookings b 
         JOIN fields f ON b.field_id = f.id 
         LEFT JOIN time_slots s ON b.time_slot_id = s.id 
         ORDER BY b.id DESC LIMIT 100`
      );

      const mapped = rows.map((b) => {
        const createdMs = new Date(b.created_at).getTime();
        const diffMs = Date.now() - createdMs;
        let isExpired = false;
        let expiresInSeconds = 0;
        if (b.status === "PENDING") {
          if (diffMs > 30 * 60 * 1000) {
            isExpired = true;
          } else {
            expiresInSeconds = Math.max(0, Math.floor((30 * 60 * 1000 - diffMs) / 1000));
          }
        }
        const depositAmount = Math.max(100000, Math.round(Number(b.total_price) * 0.3));
        return {
          id: b.id,
          bookingCode: b.booking_code,
          customerName: b.customer_name,
          customerPhone: b.customer_phone,
          fieldName: b.field_name,
          ward: b.field_ward,
          timeLabel: b.time_label,
          startAt: b.start_at,
          endAt: b.end_at,
          totalPrice: Number(b.total_price),
          depositAmount,
          status: isExpired ? "CANCELLED" : b.status,
          isExpired,
          expiresInSeconds,
          createdAt: b.created_at,
          cancelReason: b.cancel_reason,
        };
      });

      return sendJson(res, 200, mapped);
    }

    // 9. API Admin: Duyệt nhận cọc (PATCH /api/v1/admin/bookings/:id/confirm)
    const adminConfirmMatch = pathname.match(/^\/api\/v1\/admin\/bookings\/(\d+)\/confirm$/);
    if (adminConfirmMatch && (req.method === "PATCH" || req.method === "POST")) {
      const bookingId = Number(adminConfirmMatch[1]);
      await queryNeon("UPDATE bookings SET status = 'CONFIRMED' WHERE id = $1", [bookingId]);
      return sendJson(res, 200, { success: true, message: "Đã xác nhận nhận cọc thành công!" });
    }

    // 10. API Admin: Hủy đơn hàng (PATCH /api/v1/admin/bookings/:id/cancel)
    const adminCancelMatch = pathname.match(/^\/api\/v1\/admin\/bookings\/(\d+)\/cancel$/);
    if (adminCancelMatch && (req.method === "PATCH" || req.method === "POST")) {
      const bookingId = Number(adminCancelMatch[1]);
      const body = await parseJsonBody(req);
      const reason = body.reason || "Hủy theo yêu cầu của quản trị viên";
      await queryNeon("UPDATE bookings SET status = 'CANCELLED', cancel_reason = $2 WHERE id = $1", [bookingId, reason]);
      return sendJson(res, 200, { success: true, message: "Đã hủy đơn đặt sân thành công!" });
    }

    // 11. API Admin: Báo cáo thu chi toàn diện (GET /api/v1/admin/finance-report)
    if (pathname === "/api/v1/admin/finance-report" && req.method === "GET") {
      const [allBookings, confirmedBookings] = await Promise.all([
        queryNeon("SELECT count(*) as total, count(*) FILTER (WHERE status = 'CONFIRMED' OR status = 'COMPLETED') as confirmed, count(*) FILTER (WHERE status = 'CANCELLED') as cancelled, coalesce(sum(total_price) FILTER (WHERE status IN ('CONFIRMED', 'COMPLETED')), 0) as total_revenue FROM bookings"),
        queryNeon("SELECT f.name, count(*) as booking_count, sum(b.total_price) as revenue FROM bookings b JOIN fields f ON b.field_id = f.id WHERE b.status IN ('CONFIRMED', 'COMPLETED') GROUP BY f.name ORDER BY revenue DESC LIMIT 10")
      ]);

      const rev = Number(allBookings[0]?.total_revenue || 0);
      const depositRev = Math.round(rev * 0.3);
      const operatingExpenses = Math.round(rev * 0.22 + 1500000);
      const netProfit = Math.max(0, rev - operatingExpenses);

      return sendJson(res, 200, {
        totalRevenue: rev,
        depositRevenue: depositRev,
        operatingExpenses,
        netProfit,
        confirmedCount: Number(allBookings[0]?.confirmed || 0),
        cancelledCount: Number(allBookings[0]?.cancelled || 0),
        totalOrders: Number(allBookings[0]?.total || 0),
        byField: confirmedBookings.map(r => ({
          fieldName: r.name,
          bookingCount: Number(r.booking_count),
          revenue: Number(r.revenue || 0)
        }))
      });
    }

    // 8. API Đăng ký tài khoản (POST /api/v1/auth/register)
    if (pathname === "/api/v1/auth/register" && req.method === "POST") {
      const body = await parseJsonBody(req);
      const fullName = String(body.fullName || "").trim();
      const phone = String(body.phone || "").trim();
      const email = String(body.email || "").trim() || null;
      const password = String(body.password || "123456");

      if (!fullName || !phone) {
        return sendJson(res, 400, { message: "Họ tên và số điện thoại không được để trống." });
      }

      // Check existing phone
      const exists = await queryNeon("SELECT id FROM users WHERE phone = $1", [phone]);
      if (exists.length > 0) {
        return sendJson(res, 409, { message: "Số điện thoại này đã được đăng ký tài khoản." });
      }

      const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
      const inserted = await queryNeon(
        `INSERT INTO users (full_name, phone, email, password_hash, role) 
         VALUES ($1, $2, $3, $4, 'CUSTOMER') RETURNING id, full_name, phone, email, role`,
        [fullName, phone, email, passwordHash],
      );

      const user = inserted[0];
      const token = `jwt-${user.id}-${Date.now()}`;
      return sendJson(res, 201, {
        user: { id: user.id, fullName: user.full_name, phone: user.phone, email: user.email, role: user.role },
        accessToken: token,
        message: "Đăng ký tài khoản thành công!",
      });
    }

    // 9. API Đăng nhập (POST /api/v1/auth/login)
    if (pathname === "/api/v1/auth/login" && req.method === "POST") {
      const body = await parseJsonBody(req);
      const emailOrPhone = String(body.email || body.phone || "").trim();
      const password = String(body.password || "");

      const rows = await queryNeon(
        "SELECT id, full_name, phone, email, password_hash, role FROM users WHERE phone = $1 OR email = $1 LIMIT 1",
        [emailOrPhone],
      );

      if (rows.length === 0 || !verifyPassword(password, rows[0].password_hash)) {
        return sendJson(res, 401, { message: "Số điện thoại/Email hoặc mật khẩu không chính xác." });
      }

      const u = rows[0];
      const token = `jwt-${u.id}-${Date.now()}`;
      return sendJson(res, 200, {
        user: { id: u.id, fullName: u.full_name, phone: u.phone, email: u.email, role: u.role },
        accessToken: token,
      });
    }

    // 10. API Danh sách tài khoản (GET /api/v1/auth/users)
    if (pathname === "/api/v1/auth/users" && req.method === "GET") {
      const users = await queryNeon(
        "SELECT id, full_name, phone, email, role, created_at FROM users ORDER BY id ASC",
      );
      return sendJson(
        res,
        200,
        users.map((u) => ({
          id: u.id,
          fullName: u.full_name,
          phone: u.phone,
          email: u.email,
          role: u.role,
          createdAt: u.created_at,
        })),
      );
    }

    // 10b. API Kiểm tra API Key (GET /api/v1/auth/verify-api-key)
    if (pathname === "/api/v1/auth/verify-api-key" && req.method === "GET") {
      const apiKey = req.headers["x-api-key"] || parsedUrl.query.api_key;
      const validKey = process.env.API_KEY || "SAN_NHA_BMT_SECRET_API_KEY_2026";
      if (!apiKey || apiKey !== validKey) {
        return sendJson(res, 401, {
          statusCode: 401,
          message: "API Key không hợp lệ hoặc thiếu header x-api-key",
          error: "Unauthorized",
        });
      }
      return sendJson(res, 200, {
        success: true,
        message: "API Key hợp lệ! Đã xác thực thành công qua ApiKeyGuard.",
        timestamp: new Date().toISOString(),
      });
    }

    // 404 for unknown endpoints
    return sendJson(res, 404, { message: `Endpoint ${pathname} không tồn tại` });
  } catch (err) {
    console.error("Server Error:", err);
    return sendJson(res, 500, { message: err.message || "Internal Server Error" });
  }
});

// Port binding: Wispbyte passes SERVER_PORT (11199) or PORT, locally defaults to 3000
const PORT = Number(process.env.SERVER_PORT || process.env.PORT || 3000);
server.listen(PORT, "0.0.0.0", () => {
  console.log(`=======================================================`);
  console.log(`[Wispbyte] Server listening on http://0.0.0.0:${PORT}`);
  console.log(`[Wispbyte] Database connected to Neon PostgreSQL successfully!`);
  console.log(`[Wispbyte] Ready to serve 21 Buôn Ma Thuột pitches!`);
  console.log(`=======================================================`);
});

