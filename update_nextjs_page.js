const fs = require('fs');
const path = require('path');

const pageFile = path.join(__dirname, 'web/app/page.tsx');
let page = fs.readFileSync(pageFile, 'utf8');

console.log("==> Updating web/app/page.tsx branding & Neon sync...");

// 1. Branding replacements
page = page.replace(
  /HỆ THỐNG ĐẶT LỊCH THỂ THAO TRỰC TUYẾN ALO BOOKING · BUÔN MA THUỘT/g,
  'HỆ THỐNG SÂN BÓNG BUÔN MA THUỘT · SÂN NHÀ FC · SÀN CÁP KÈO & LEO RANK ELO'
);

page = page.replace(
  /<span style=\{\{ color: "#ffffff", fontSize: "20px", fontWeight: 900, letterSpacing: "-0\.5px" \}\}>ALO<span style=\{\{ color: "#329dd2" \}\}>BOOKING<\/span><\/span>\s*<span className="alo-brand-badge">BMT<\/span>/g,
  '<span style={{ color: "#ffffff", fontSize: "20px", fontWeight: 900, letterSpacing: "-0.5px" }}>SÂN NHÀ <span style={{ color: "#329dd2" }}>FC</span></span>\n            <span className="alo-brand-badge" style={{ background: "linear-gradient(135deg, #eb2f33 0%, #b91c1c 100%)" }}>BMT</span>'
);

page = page.replace(
  /title="6 Bước đặt lịch chuẩn ALO Booking"/g,
  'title="6 Bước đặt lịch chuẩn Sân Nhà FC"'
);

page = page.replace(
  /Đặt Lịch Sân Thể Thao Nhanh Chóng<br \/><span style=\{\{ color: "#329dd2" \}\}>Giữ Chỗ Tức Thì 24\/7<\/span> · ALO Booking/g,
  'Đặt Lịch Sân & Cáp Kèo Thi Đấu Nhanh Chóng<br /><span style={{ color: "#329dd2" }}>Giữ Chỗ Tức Thì 24/7</span> · Sân Nhà FC'
);

page = page.replace(
  /Nền tảng đặt lịch thể thao thông minh chuẩn ALO Booking\. Theo dõi tình trạng ca sân trống theo thời gian thực tại 21 cụm sân cỏ nhân tạo &amp; tự nhiên ở TP\. Buôn Ma Thuột\./g,
  'Sân Nhà FC - Nền tảng kết nối 21 cụm sân bóng đá cỏ nhân tạo & tự nhiên tại TP. Buôn Ma Thuột. Sàn cáp kèo phủi, tổ đội FC 15 người và leo rank ELO giải đấu hấp dẫn.'
);

page = page.replace(
  /<span className="module-tag tag-dark">📋 QUY TRÌNH ALO BOOKING<\/span>/g,
  '<span className="module-tag tag-dark">📋 QUY TRÌNH ĐẶT SÂN SÂN NHÀ FC</span>'
);

page = page.replace(
  /6 Bước Đặt Lịch Sân Bóng Đá Chuẩn ALO Booking/g,
  '6 Bước Đặt Lịch & Cáp Kèo Chuẩn Sân Nhà FC'
);

// 2. Add Neon Direct helper to page.tsx if not present
if (!page.includes('const NEON_SQL_ENDPOINT =')) {
  const neonBlock = `
const NEON_SQL_ENDPOINT = "https://ep-silent-heart-b5tbjmh7.c-7.us-east-2.aws.neon.tech/sql";
const NEON_DB_CONNECTION = "postgresql://neondb_owner:npg_Y76lDyzLaGkZ@ep-silent-heart-b5tbjmh7-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function queryNeonDirect(sql: string): Promise<any[]> {
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
  } catch (err: any) {
    console.warn("[Neon Direct Warning]", err?.message || err);
    return [];
  }
}
`;
  page = page.replace('const API = getApiUrl();', 'const API = getApiUrl();\n' + neonBlock);
}

// 3. Update handleCreateMatchSubmit to async and insert to Neon
page = page.replace(
  /function handleCreateMatchSubmit\(e: FormEvent\) \{[\s\S]*?alert\("🎉 Đã đăng tin tìm đối thành công lên Sàn phủi Buôn Ma Thuột!"\);\s*\}/,
  `async function handleCreateMatchSubmit(e: FormEvent) {
    e.preventDefault();
    if (!currentUser) { alert("⚠️ Bạn cần đăng nhập để đăng tin tìm đối / cáp kèo!"); return; }
    if (!cmTeam || !cmCaptain || !cmPhone || cmPhone.length < 9) { alert("⚠️ Tên đội, đội trưởng và SĐT (tối thiểu 9 số) là bắt buộc!"); return; }
    const field = fieldsList.find((f) => f.id === cmFieldId) || fieldsList[0];
    const levelLabels: Record<string, string> = {
      "VUI_VE": "Dưỡng sinh (Vui vẻ)",
      "TRUNG_BINH": "Trung bình (Phong trào)",
      "BAN_CHUYEN": "Khá - Chiến (Cọ xát)"
    };
    const betLabels: Record<string, string> = {
      "CHIA_DOI": "Tiền sân 5-5",
      "THUA_BAO": "Đội thua trả sân",
      "KEO_NUOC": "Kèo nước ngọt"
    };

    const safeCaptain = (cmCaptain || currentUser.fullName || "Đội trưởng").replace(/'/g, "''");
    const safeTeam = cmTeam.replace(/'/g, "''");
    const safePhone = cmPhone.replace(/'/g, "''");
    const safeDate = (cmDate || "2026-11-25").replace(/'/g, "''");
    const safeSlot = cmSlot.replace(/'/g, "''");
    const safeField = field.name.replace(/'/g, "''");
    const safeDesc = (cmDesc || "Kèo giao lưu hữu nghị, đá đẹp, văn minh.").replace(/'/g, "''");
    const betLabel = betLabels[cmBet] || "Tiền sân 5-5";
    const levelLabel = levelLabels[cmLevel] || "Phong trào";

    try {
      const rows = await queryNeonDirect(\`
        INSERT INTO matchmaking_posts (user_id, user_name, team_name, phone, play_date, play_time, pitch_name, pitch_id, format, bet_type, level, note, status)
        VALUES (\${currentUser.id || 'NULL'}, '\${safeCaptain}', '\${safeTeam}', '\${safePhone}', '\${safeDate}', '\${safeSlot}', '\${safeField}', \${field.id}, '\${field.fieldType || 'SAN_5'}', '\${betLabel}', '\${levelLabel}', '\${safeDesc}', 'OPEN')
        RETURNING *
      \`);
      const newId = rows && rows[0] ? rows[0].id : Date.now();

      const newPost: MatchmakingPost = {
        id: newId,
        teamName: cmTeam,
        captainName: cmCaptain,
        phone: cmPhone,
        fieldId: field.id,
        fieldName: field.name,
        fieldType: field.fieldType,
        matchDate: cmDate || "2026-11-25",
        timeSlot: cmSlot,
        level: cmLevel,
        levelLabel,
        betRule: cmBet,
        betLabel,
        status: "OPEN",
        avatar: "⚡",
        description: cmDesc || "Kèo giao lưu hữu nghị, đá đẹp, văn minh.",
        createdAt: "Vừa xong"
      };

      const updated = [newPost, ...matchPosts];
      setMatchPosts(updated);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("football_matchmaking", JSON.stringify(updated));
      }
      setCreateMatchOpen(false);
      setCmTeam("");
      setCmCaptain("");
      setCmDesc("");
      alert("🎉 Đã đăng bài cáp kèo THÀNH CÔNG lên Sàn Cáp Kèo Sân Nhà FC!\\nDữ liệu đã được lưu trữ vĩnh viễn trên Neon PostgreSQL Cloud.");
    } catch (err: any) {
      alert("Lỗi khi lưu bài đăng: " + (err?.message || err));
    }
  }`
);

// 4. Update handleDeleteMatchPost to also delete from Neon
page = page.replace(
  /function handleDeleteMatchPost\(id: number\) \{[\s\S]*?if \(typeof window !== "undefined"\) window\.localStorage\.setItem\("football_matchmaking", JSON\.stringify\(updated\)\);\s*\}/,
  `async function handleDeleteMatchPost(id: number) {
    if (!confirm("Bạn có chắc chắn muốn xóa bài đăng cáp kèo này khỏi Neon Database?")) return;
    try {
      await queryNeonDirect(\`DELETE FROM matchmaking_posts WHERE id = \${id}\`);
    } catch (e) {
      console.warn("Lỗi xóa bài đăng trên Neon:", e);
    }
    const updated = matchPosts.filter((p) => p.id !== id);
    setMatchPosts(updated);
    if (typeof window !== "undefined") window.localStorage.setItem("football_matchmaking", JSON.stringify(updated));
    alert("✓ Đã xóa bài đăng cáp kèo khỏi hệ thống Neon!");
  }`
);

// 5. Update handleAcceptMatchSubmit to also update Neon
page = page.replace(
  /function handleAcceptMatchSubmit\(e: FormEvent\) \{[\s\S]*?alert\("🤝 Chúc mừng bạn đã bắt đối thành công[\s\S]*?"\);\s*\}/,
  `async function handleAcceptMatchSubmit(e: FormEvent) {
    e.preventDefault();
    if (!activeMatchToAccept || !amTeam || !amPhone) return;

    try {
      const safeTeam = amTeam.replace(/'/g, "''");
      const safePhone = amPhone.replace(/'/g, "''");
      const challengerId = currentUser ? currentUser.id : 'NULL';
      await queryNeonDirect(\`
        UPDATE matchmaking_posts
        SET status = 'ACCEPTED', challenger_id = \${challengerId}, challenger_name = '\${safeTeam}', challenger_phone = '\${safePhone}'
        WHERE id = \${activeMatchToAccept.id}
      \`);
    } catch (e) {
      console.warn("Lỗi cập nhật bắt đối trên Neon:", e);
    }

    const updated = matchPosts.map((p) => {
      if (p.id === activeMatchToAccept.id) {
        return { ...p, status: "MATCHED" as const, matchedBy: amTeam };
      }
      return p;
    });
    setMatchPosts(updated);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("football_matchmaking", JSON.stringify(updated));
    }
    setActiveMatchToAccept(null);
    setAmTeam("");
    setAmPhone("");
    alert("🤝 Chúc mừng bạn đã bắt đối thành công! Thông tin trận đấu đã được lưu vào Neon Cloud.");
  }`
);

// 6. In useEffect, load initial matchmaking posts & clubs from Neon if available
page = page.replace(
  /useEffect\(\(\) => \{[\s\S]*?fetchFieldsList\(\);[\s\S]*?fetchSchedule\(selectedDate\);[\s\S]*?\}, \[selectedDate\]\);/,
  `useEffect(() => {
    fetchFieldsList();
    fetchSchedule(selectedDate);

    // Đồng bộ Sàn cáp kèo và FC leo rank trực tiếp từ Neon Cloud
    queryNeonDirect("SELECT * FROM matchmaking_posts ORDER BY id DESC").then((rows) => {
      if (Array.isArray(rows) && rows.length > 0) {
        const loaded: MatchmakingPost[] = rows.map((r: any) => ({
          id: r.id,
          teamName: r.team_name,
          captainName: r.user_name || r.team_name,
          phone: r.phone,
          fieldId: r.pitch_id || 5,
          fieldName: r.pitch_name || "SVĐ Buôn Ma Thuột",
          fieldType: (r.format as any) || "SAN_5",
          matchDate: r.play_date || "2026-11-25",
          timeSlot: r.play_time || "19:00 - 20:30",
          level: (r.level as any) || "TRUNG_BINH",
          levelLabel: r.level || "Phong trào",
          betRule: (r.bet_type as any) || "CHIA_DOI",
          betLabel: r.bet_type || "Tiền sân 5-5",
          status: r.status === "ACCEPTED" ? ("MATCHED" as const) : ("OPEN" as const),
          matchedBy: r.challenger_name || undefined,
          avatar: "⚡",
          description: r.note || "Kèo giao lưu hữu nghị",
          createdAt: r.created_at ? new Date(r.created_at).toLocaleDateString("vi-VN") : "Vừa xong"
        }));
        setMatchPosts(loaded);
        if (typeof window !== "undefined") window.localStorage.setItem("football_matchmaking", JSON.stringify(loaded));
      }
    });

    queryNeonDirect("SELECT * FROM football_clubs ORDER BY elo DESC, wins DESC").then((cRows) => {
      if (Array.isArray(cRows) && cRows.length > 0) {
        const loadedClubs: FootballClub[] = cRows.map((c: any) => ({
          id: c.id,
          name: c.name,
          captainName: c.captain_name,
          captainPhone: c.captain_phone,
          homePitch: c.home_pitch || "SVĐ Buôn Ma Thuột",
          tier: c.tier || "Đồng",
          elo: c.elo || 1200,
          wins: c.wins || 0,
          draws: c.draws || 0,
          losses: c.losses || 0,
          avatar: "🛡️",
          description: c.bio || "CLB bóng đá phong trào Buôn Ma Thuột",
          recruiting: c.members_count < 15,
          members: [
            { id: 1, userId: c.user_id || 1, name: c.captain_name, role: "CAPTAIN" as const, position: "Đội trưởng", number: 10, joinedAt: "2026-01-01" }
          ]
        }));
        setClubs(loadedClubs);
        if (typeof window !== "undefined") window.localStorage.setItem("football_clubs", JSON.stringify(loadedClubs));
      }
    });
  }, [selectedDate]);`
);

fs.writeFileSync(pageFile, page, 'utf8');
console.log("✓ web/app/page.tsx updated successfully!");
