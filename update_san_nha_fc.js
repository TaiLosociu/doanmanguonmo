const fs = require('fs');
const path = require('path');

// 1. UPDATE public_html/leduytai/doan/index.html
console.log("==> Updating index.html...");
let indexHtml = fs.readFileSync(path.join(__dirname, 'public_html/leduytai/doan/index.html'), 'utf8');

// Title & Brand
indexHtml = indexHtml.replace(
  /<title>.*?<\/title>/i,
  '<title>SÂN NHÀ FC · Đặt Lịch Sân Bóng Đá & Sàn Cáp Kèo Trực Tuyến Buôn Ma Thuột</title>'
);

// Topbar notice
indexHtml = indexHtml.replace(
  'HỆ THỐNG SÂN BÓNG BUÔN MA THUỘT · SÀN CÁP KÈO & BẢNG XẾP HẠNG ELO CLB',
  'HỆ THỐNG SÂN BÓNG BUÔN MA THUỘT · SÂN NHÀ FC · SÀN CÁP KÈO & LEO RANK ELO'
);

// Brand logo & title in header
indexHtml = indexHtml.replace(
  /<span style="color: #ffffff; font-size: 20px; font-weight: 900; letter-spacing: -0\.5px;">ALO<span style="color: #329dd2;">BOOKING<\/span><\/span>\s*<span class="alo-brand-badge">BMT<\/span>/g,
  '<span style="color: #ffffff; font-size: 20px; font-weight: 900; letter-spacing: -0.5px;">SÂN NHÀ <span style="color: #329dd2;">FC</span></span>\n            <span class="alo-brand-badge" style="background: linear-gradient(135deg, #eb2f33 0%, #b91c1c 100%);">BMT</span>'
);

indexHtml = indexHtml.replace(
  'ĐẶT LỊCH THỂ THAO TRỰC TUYẾN',
  'HỆ THỐNG SÂN BÓNG & CÁP KÈO BMT'
);

// Quy trình nav
indexHtml = indexHtml.replace(
  'title="6 Bước đặt lịch chuẩn ALO Booking"',
  'title="6 Bước đặt lịch chuẩn Sân Nhà FC"'
);

// Hero tagline & title
indexHtml = indexHtml.replace(
  '<span>NỀN TẢNG ĐẶT LỊCH THỂ THAO TRỰC TUYẾN SỐ 1 BUÔN MA THUỘT</span>',
  '<span>NỀN TẢNG ĐẶT SÂN & CÁP KÈO THỂ THAO SỐ 1 BUÔN MA THUỘT · SÂN NHÀ FC</span>'
);

indexHtml = indexHtml.replace(
  /<h1[^>]*>[\s\S]*?Giữ Chỗ Tức Thì 24\/7<\/span> · ALO Booking[\s\S]*?<\/h1>/i,
  `<h1 style="font-size: clamp(28px, 4.5vw, 46px); line-height: 1.2; margin-bottom: 12px;">
          Đặt Lịch Sân & Cáp Kèo Thi Đấu Nhanh Chóng<br><span style="color: #329dd2;">Giữ Chỗ Tức Thì 24/7</span> · Sân Nhà FC
        </h1>`
);

indexHtml = indexHtml.replace(
  'Nền tảng đặt lịch thể thao thông minh chuẩn ALO Booking.',
  'Sân Nhà FC - Nền tảng đặt sân & sàn cáp kèo thể thao phủi số 1 Buôn Ma Thuột.'
);

// Section 6 bước
indexHtml = indexHtml.replace(
  '📋 QUY TRÌNH ALO BOOKING',
  '📋 QUY TRÌNH ĐẶT SÂN SÂN NHÀ FC'
);

indexHtml = indexHtml.replace(
  '6 Bước Đặt Lịch Sân Bóng Đá Chuẩn ALO Booking',
  '6 Bước Đặt Lịch & Cáp Kèo Chuẩn Sân Nhà FC'
);

fs.writeFileSync(path.join(__dirname, 'public_html/leduytai/doan/index.html'), indexHtml, 'utf8');
console.log("✓ index.html updated successfully!");

// 2. UPDATE public_html/leduytai/doan/js/app.js for REAL NEON POSTING & SYNC
console.log("==> Updating app.js for real Neon DB Matchmaking & FC...");
let appJs = fs.readFileSync(path.join(__dirname, 'public_html/leduytai/doan/js/app.js'), 'utf8');

// Ensure queryNeonDirect and NEON constants exist at top of app.js if not present
if (!appJs.includes('NEON_SQL_ENDPOINT')) {
  const neonHelper = `
// ==========================================
// KẾT NỐI TRỰC TIẾP NEON POSTGRESQL CLOUD 24/7
// ==========================================
const NEON_SQL_ENDPOINT = "https://ep-silent-heart-b5tbjmh7.c-7.us-east-2.aws.neon.tech/sql";
const NEON_DB_CONNECTION = "postgresql://neondb_owner:npg_Y76lDyzLaGkZ@ep-silent-heart-b5tbjmh7-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function queryNeonDirect(sql) {
  try {
    const res = await fetch(NEON_SQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Neon-Connection-String": NEON_DB_CONNECTION
      },
      body: JSON.stringify({ query: sql })
    });
    const data = await res.json();
    if (data.message && !data.rows) throw new Error(data.message);
    return data.rows || [];
  } catch (err) {
    console.warn("[Neon Direct Warning]", err.message);
    return [];
  }
}

function escapeSqlString(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/'/g, "''");
}
`;
  appJs = neonHelper + '\n' + appJs;
}

// Replace matchmaking functions with real Neon Database synchronization
const newMatchmakingCode = `
// ==========================================
// 5. MATCHMAKING - SÀN CÁP KÈO BÓNG ĐÁ PHỦI BAN MÊ (LƯU TRỰC TIẾP NEON CLOUD)
// ==========================================
let currentMatchmakingFilter = "ALL";
let neonMatchmakingCache = null;

async function fetchNeonMatchmaking() {
  try {
    const rows = await queryNeonDirect("SELECT * FROM matchmaking_posts ORDER BY id DESC");
    if (Array.isArray(rows) && rows.length > 0) {
      neonMatchmakingCache = rows.map(r => ({
        id: r.id,
        userId: r.user_id,
        userFullName: r.user_name || r.team_name,
        teamName: r.team_name,
        captainName: r.user_name || r.team_name,
        phone: r.phone,
        fieldId: r.pitch_id,
        fieldName: r.pitch_name,
        fieldType: r.format || 'SAN_5',
        matchDate: r.play_date,
        timeSlot: r.play_time,
        level: r.level || 'TRUNG_BINH',
        levelLabel: r.level || 'Phong trào',
        betRule: r.bet_type || 'CHIA_DOI',
        betLabel: r.bet_type || 'Tiền sân 5-5',
        status: r.status || 'OPEN',
        matchedBy: r.challenger_name || null,
        matchedPhone: r.challenger_phone || null,
        avatar: "⚡",
        description: r.note || "Kèo giao lưu hữu nghị Ban Mê",
        createdAt: r.created_at ? new Date(r.created_at).toLocaleDateString('vi-VN') : 'Vừa xong'
      }));
      localStorage.setItem("football_matchmaking", JSON.stringify(neonMatchmakingCache));
      return neonMatchmakingCache;
    }
  } catch (e) {
    console.warn("Lỗi fetch matchmaking từ Neon:", e);
  }
  return getMatchmakingPostsLocal();
}

function getMatchmakingPostsLocal() {
  try {
    const saved = localStorage.getItem("football_matchmaking");
    return saved ? JSON.parse(saved) : DEFAULT_MATCHMAKING_POSTS;
  } catch {
    return DEFAULT_MATCHMAKING_POSTS;
  }
}

function getMatchmakingPosts() {
  return neonMatchmakingCache || getMatchmakingPostsLocal();
}

function saveMatchmakingPosts(posts) {
  neonMatchmakingCache = posts;
  localStorage.setItem("football_matchmaking", JSON.stringify(posts));
}

async function renderMatchmaking(filter = "ALL") {
  currentMatchmakingFilter = filter;
  const container = document.getElementById("matchmakingListContainer");
  if (!container) return;

  const authUser = JSON.parse(localStorage.getItem("football_auth_user") || "null");

  // Load from Neon if cache empty
  if (!neonMatchmakingCache) {
    container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 30px; color: #94a3b8; font-size: 13px;">⏳ Đang đồng bộ sàn cáp kèo từ Neon Cloud...</div>';
    await fetchNeonMatchmaking();
  }

  const allPosts = getMatchmakingPosts();
  const posts = allPosts.filter(p => {
    if (filter === "ALL") return true;
    if (filter === "OPEN") return p.status === "OPEN";
    if (filter === "MY_POSTS") return authUser && (p.userId === authUser.id || p.phone === authUser.phone);
    return p.level === filter;
  });

  // Update tabs
  const tabs = ["ALL", "MY_POSTS", "VUI_VE", "TRUNG_BINH", "BAN_CHUYEN", "OPEN"];
  tabs.forEach(t => {
    const el = document.getElementById("tabMatch_" + t);
    if (el) el.className = \`quick-day-btn \${t === filter ? 'active' : ''}\`;
  });

  if (posts.length === 0) {
    container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #94a3b8; background: #0e1626; border-radius: 14px; border: 1px dashed rgba(50, 157, 210, 0.3);">' +
      '<div style="font-size: 32px; margin-bottom: 8px;">🤝</div>' +
      '<div style="color: #ffffff; font-weight: 700; margin-bottom: 6px;">Chưa có kèo nào trong mục này</div>' +
      '<div style="font-size: 13px; color: #94a3b8; margin-bottom: 14px;">Bấm nút <strong>"➕ ĐĂNG TIN TÌM ĐỐI / CÁP KÈO"</strong> bên trên để tạo bài đăng đầu tiên của bạn!</div>' +
      '<button type="button" class="btn-accent-red" style="padding: 8px 18px; font-size: 13px; font-weight: 700; margin: 0 auto;" onclick="openCreateMatchModal()">➕ Tạo bài đăng cáp kèo ngay</button>' +
      '</div>';
    return;
  }

  container.innerHTML = posts.map(post => {
    const isOpen = post.status === "OPEN";
    const isOwner = authUser && (post.userId === authUser.id || post.phone === authUser.phone);
    const levelBg = post.level === "BAN_CHUYEN" ? "rgba(235,47,51,0.18)" : post.level === "TRUNG_BINH" ? "rgba(50,157,210,0.18)" : "rgba(34,197,94,0.18)";
    const levelColor = post.level === "BAN_CHUYEN" ? "#f87171" : post.level === "TRUNG_BINH" ? "#38bdf8" : "#4ade80";

    return '<div style="background: #111a2e; border: 1.5px solid ' + (isOpen ? 'rgba(50, 157, 210, 0.4)' : 'rgba(255, 255, 255, 0.1)') + '; border-radius: 16px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); display: flex; flex-direction: column; justify-content: space-between; transition: all 0.25s ease;">' +
      '<div>' +
      '<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">' +
      '<div style="display: flex; align-items: center; gap: 10px;">' +
      '<span style="font-size: 26px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; width: 44px; height: 44px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.4); border: 1px solid rgba(50,157,210,0.3);">' + (post.avatar || '⚽') + '</span>' +
      '<div>' +
      '<strong style="font-size: 16px; color: #ffffff; display: block;">' + post.teamName + '</strong>' +
      '<small style="color: #94a3b8;">Đội trưởng: <strong style="color: #38bdf8;">' + post.captainName + '</strong> · ' + post.createdAt + '</small>' +
      '</div></div>' +
      '<span style="font-size: 11px; padding: 4px 10px; border-radius: 999px; font-weight: 800; ' + (isOpen ? 'background: rgba(50,157,210,0.18); color: #38bdf8; border: 1px solid rgba(50,157,210,0.4);' : 'background: rgba(34,197,94,0.18); color: #4ade80; border: 1px solid rgba(34,197,94,0.4);') + '">' +
      (isOpen ? '● ĐANG TÌM ĐỐI' : '✓ ĐÃ CÁP KÈO') +
      '</span></div>' +

      '<div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px;">' +
      '<span style="font-size: 11px; font-weight: 700; background: ' + levelBg + '; color: ' + levelColor + '; padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);">🎯 ' + post.levelLabel + '</span>' +
      '<span style="font-size: 11px; font-weight: 700; background: rgba(245,158,11,0.18); color: #fbbf24; padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(245,158,11,0.3);">💰 ' + post.betLabel + '</span>' +
      '<span style="font-size: 11px; font-weight: 700; background: rgba(255,255,255,0.06); color: #e2e8f0; padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);">⚽ ' + (post.fieldType === 'SAN_11' ? 'Sân 11' : post.fieldType === 'SAN_7' ? 'Sân 7' : 'Sân 5') + '</span>' +
      '</div>' +

      '<div style="font-size: 13px; color: #cbd5e1; background: rgba(0,0,0,0.25); border-radius: 10px; padding: 12px; margin-bottom: 12px; line-height: 1.6; border: 1px solid rgba(50,157,210,0.2);">' +
      '<div>🏟️ <strong>Sân:</strong> <span style="color: #ffffff;">' + post.fieldName + '</span></div>' +
      '<div>📅 <strong>Thời gian:</strong> <span style="color: #fbbf24;">' + post.timeSlot + ' (Ngày ' + post.matchDate + ')</span></div>' +
      '<div>📞 <strong>SĐT liên hệ:</strong> <strong style="color: #38bdf8; font-family: monospace;">' + post.phone + '</strong></div>' +
      '<div style="margin-top: 6px; color: #94a3b8; font-style: italic;">"' + post.description + '"</div>' +
      '</div></div>' +

      '<div style="display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap;">' +
      (isOpen
        ? '<button type="button" onclick="openAcceptMatchModal(' + post.id + ')" class="btn-accent-red" style="flex: 1; padding: 9px; font-size: 12px; font-weight: 800; justify-content: center; border-radius: 8px;">🤝 Bắt đối ngay</button>'
        : '<div style="flex: 1; text-align: center; font-size: 12px; font-weight: 700; color: #4ade80; background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3); padding: 8px; border-radius: 8px;">Đã bắt với: <strong>' + (post.matchedBy || 'Đội bạn') + '</strong>' + (post.matchedPhone ? ' (📞 ' + post.matchedPhone + ')' : '') + '</div>'
      ) +
      '<a href="tel:' + post.phone + '" class="outline-button" style="padding: 9px 12px; font-size: 12px; color: #fbbf24; border-color: rgba(251,191,36,0.3);" title="Gọi điện">📞 Gọi</a>' +
      '<a href="https://zalo.me/' + post.phone + '" target="_blank" class="outline-button" style="padding: 9px 12px; font-size: 12px; color: #38bdf8; border-color: rgba(56,189,248,0.3);" title="Nhắn Zalo">💬 Zalo</a>' +
      (isOwner
        ? '<button type="button" onclick="deleteMatchPost(' + post.id + ')" class="outline-button" style="padding: 9px 10px; font-size: 12px; color: #f87171; border-color: rgba(239,68,68,0.3);" title="Xóa bài đăng cáp kèo này khỏi Neon Cloud">🗑️</button>'
        : ''
      ) +
      '</div></div>';
  }).join("");
}

function openCreateMatchModal() {
  const authUser = JSON.parse(localStorage.getItem("football_auth_user") || "null");
  if (!authUser) {
    alert("⚠️ Bạn cần đăng nhập tài khoản để đăng tin tìm đối!\\nHãy bấm nút 'Đăng nhập / Đăng ký' trên thanh menu.");
    if (typeof openAuthModal === 'function') openAuthModal('LOGIN');
    return;
  }
  document.getElementById("createMatchModal").style.display = "flex";
  const captainInput = document.getElementById("cmCaptainName");
  const phoneInput = document.getElementById("cmPhone");
  if (captainInput && !captainInput.value) captainInput.value = authUser.fullName || '';
  if (phoneInput && !phoneInput.value) phoneInput.value = authUser.phone || '';

  const select = document.getElementById("cmFieldSelect");
  if (select) {
    select.innerHTML = DEFAULT_FIELDS.map(f => '<option value="' + f.id + '">' + f.name + ' (' + (f.ward || 'BMT') + ')</option>').join("");
  }
  const dateInput = document.getElementById("cmDateInput");
  if (dateInput) dateInput.value = getTodayString();
}

function closeCreateMatchModal() {
  document.getElementById("createMatchModal").style.display = "none";
}

async function submitMatchPost(e) {
  e.preventDefault();
  const authUser = JSON.parse(localStorage.getItem("football_auth_user") || "null");
  if (!authUser) {
    alert("⚠️ Bạn cần đăng nhập tài khoản để tạo bài đăng cáp kèo!");
    if (typeof openAuthModal === 'function') openAuthModal('LOGIN');
    return;
  }
  const teamName = document.getElementById("cmTeamName").value.trim();
  const captainName = document.getElementById("cmCaptainName").value.trim() || authUser.fullName;
  const phone = document.getElementById("cmPhone").value.trim();
  if (!phone || phone.length < 9) {
    alert("⚠️ Số điện thoại / Zalo là bắt buộc (tối thiểu 9 số) để đội bạn liên hệ bắt đối!");
    return;
  }

  const fieldId = Number(document.getElementById("cmFieldSelect").value);
  const matchDate = document.getElementById("cmDateInput").value;
  const timeSlot = document.getElementById("cmTimeSlot").value;
  const level = document.getElementById("cmLevel").value;
  const betRule = document.getElementById("cmBetRule").value;
  const description = document.getElementById("cmDesc").value.trim() || "Kèo giao lưu hữu nghị, đá đẹp, nhiệt tình.";
  const field = DEFAULT_FIELDS.find(f => f.id === fieldId) || DEFAULT_FIELDS[0];

  const levelLabels = {
    "VUI_VE": "Dưỡng sinh (Vui vẻ)",
    "TRUNG_BINH": "Trung bình (Phong trào)",
    "BAN_CHUYEN": "Khá - Chiến (Cọ xát)"
  };

  const betLabels = {
    "CHIA_DOI": "Tiền sân 5-5",
    "THUA_BAO": "Đội thua trả sân",
    "KEO_NUOC": "Kèo nước ngọt"
  };

  const submitBtn = e.target.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "⏳ Đang lưu vào Neon Cloud...";
  }

  try {
    // 1. Ghi nhận trực tiếp vào Neon Database PostgreSQL (Table matchmaking_posts)
    const sql = \`INSERT INTO matchmaking_posts (user_id, user_name, team_name, phone, play_date, play_time, pitch_name, pitch_id, format, bet_type, level, note, status)
      VALUES (\${authUser.id || 'NULL'}, '\${escapeSqlString(captainName)}', '\${escapeSqlString(teamName)}', '\${escapeSqlString(phone)}', '\${escapeSqlString(matchDate)}', '\${escapeSqlString(timeSlot)}', '\${escapeSqlString(field.name)}', \${field.id}, '\${escapeSqlString(field.fieldType || 'SAN_5')}', '\${escapeSqlString(betLabels[betRule] || betRule)}', '\${escapeSqlString(levelLabels[level] || level)}', '\${escapeSqlString(description)}', 'OPEN')
      RETURNING *\`;

    const insertedRows = await queryNeonDirect(sql);
    const newPostId = insertedRows && insertedRows[0] ? insertedRows[0].id : Date.now();

    const newPost = {
      id: newPostId,
      userId: authUser.id,
      userFullName: authUser.fullName,
      teamName,
      captainName,
      phone,
      fieldId,
      fieldName: field.name,
      fieldType: field.fieldType,
      matchDate,
      timeSlot,
      level,
      levelLabel: levelLabels[level] || "Phong trào",
      betRule,
      betLabel: betLabels[betRule] || "Tiền sân 5-5",
      status: "OPEN",
      matchedBy: null,
      matchedPhone: null,
      avatar: "⚡",
      description,
      createdAt: "Vừa xong"
    };

    const posts = getMatchmakingPosts();
    posts.unshift(newPost);
    saveMatchmakingPosts(posts);

    closeCreateMatchModal();
    renderMatchmaking("ALL");
    alert("🎉 Đã đăng bài cáp kèo THÀNH CÔNG lên Sàn Cáp Kèo Sân Nhà FC!\\nDữ liệu đã được lưu trữ vĩnh viễn trên Neon PostgreSQL Cloud.");
  } catch (err) {
    alert("Có lỗi khi lưu bài đăng: " + err.message);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "🚀 Đăng tin tìm đối ngay";
    }
  }
}

let activeMatchIdToAccept = null;

function openAcceptMatchModal(postId) {
  const authUser = JSON.parse(localStorage.getItem("football_auth_user") || "null");
  if (!authUser) {
    alert("⚠️ Bạn cần đăng nhập tài khoản để nhận kèo / bắt đối!\\nHãy bấm 'Đăng nhập / Đăng ký' trên thanh menu.");
    if (typeof openAuthModal === 'function') openAuthModal('LOGIN');
    return;
  }
  activeMatchIdToAccept = postId;
  const posts = getMatchmakingPosts();
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  document.getElementById("acceptMatchTeamTarget").textContent = post.teamName;
  document.getElementById("acceptMatchDetails").textContent = post.fieldName + ' · ' + post.timeSlot + ' ngày ' + post.matchDate + ' · Kèo: ' + post.betLabel;

  const phoneInput = document.getElementById("amMyPhone");
  if (phoneInput && authUser.phone) phoneInput.value = authUser.phone;

  document.getElementById("acceptMatchModal").style.display = "flex";
}

function closeAcceptMatchModal() {
  document.getElementById("acceptMatchModal").style.display = "none";
  activeMatchIdToAccept = null;
}

async function confirmAcceptMatch(e) {
  e.preventDefault();
  const authUser = JSON.parse(localStorage.getItem("football_auth_user") || "null");
  const myTeam = document.getElementById("amMyTeamName").value.trim();
  const myPhone = document.getElementById("amMyPhone").value.trim();

  if (!myTeam || !myPhone || myPhone.length < 9) {
    alert("⚠️ Tên đội nhận kèo và Số điện thoại (tối thiểu 9 số) là bắt buộc!");
    return;
  }

  const posts = getMatchmakingPosts();
  const idx = posts.findIndex(p => p.id === activeMatchIdToAccept);
  if (idx !== -1) {
    posts[idx].status = "MATCHED";
    posts[idx].matchedBy = myTeam;
    posts[idx].matchedPhone = myPhone;
    saveMatchmakingPosts(posts);

    // Update Neon PostgreSQL
    try {
      const sql = \`UPDATE matchmaking_posts 
        SET status = 'ACCEPTED', challenger_id = \${authUser ? authUser.id : 'NULL'}, challenger_name = '\${escapeSqlString(myTeam)}', challenger_phone = '\${escapeSqlString(myPhone)}'
        WHERE id = \${activeMatchIdToAccept}\`;
      await queryNeonDirect(sql);
    } catch (e) {
      console.warn("Lỗi update match accept trên Neon:", e);
    }
  }

  closeAcceptMatchModal();
  renderMatchmaking(currentMatchmakingFilter);
  alert("🤝 Chúc mừng bạn đã bắt đối thành công với " + (posts[idx]?.teamName || 'đội bạn') + "!\\nHãy gọi SĐT " + (posts[idx]?.phone || '') + " để chốt màu áo thi đấu nhé.\\nDữ liệu bắt đối đã được lưu vào Neon Cloud.");
}

async function deleteMatchPost(postId) {
  if (!confirm("Bạn có chắc chắn muốn xóa bài đăng cáp kèo này khỏi Neon Database?")) return;
  try {
    await queryNeonDirect(\`DELETE FROM matchmaking_posts WHERE id = \${postId}\`);
  } catch (e) {
    console.warn("Lỗi xóa post trên Neon:", e);
  }
  let posts = getMatchmakingPosts();
  posts = posts.filter(p => p.id !== postId);
  saveMatchmakingPosts(posts);
  renderMatchmaking(currentMatchmakingFilter);
  alert("✓ Đã xóa bài đăng cáp kèo khỏi hệ thống Neon!");
}
`;

// Replace matchmaking section in app.js
const regexMatchmaking = /\/\/ ==========================================\s*\/\/\s*5\.\s*MATCHMAKING[\s\S]*?(?=\/\/ ==========================================\s*\/\/\s*6\.\s*FC CLUBS)/;
if (regexMatchmaking.test(appJs)) {
  appJs = appJs.replace(regexMatchmaking, newMatchmakingCode + '\n');
  console.log("✓ Matchmaking replaced in app.js with live Neon DB handlers!");
} else {
  console.warn("Could not find matchmaking regex match in app.js, appending new code...");
  appJs += '\n' + newMatchmakingCode;
}

fs.writeFileSync(path.join(__dirname, 'public_html/leduytai/doan/js/app.js'), appJs, 'utf8');
console.log("✓ app.js written successfully!");
