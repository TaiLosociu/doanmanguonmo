"use client";

import Link from "next/link";

export default function CVPage() {
  return (
    <div className="cv-container">
      {/* Top action bar */}
      <div className="cv-nav-bar">
        <Link href="/" className="cv-btn-back">
          <span>←</span> Quay lại Trang Đặt Sân
        </Link>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <a
            href="https://it24m.dak.edu.vn/leduytai/baitap1/"
            target="_blank"
            rel="noreferrer"
            className="cv-btn-online"
          >
            <span>🌐</span> CV Lê Duy Tài (it24m.dak.edu.vn) ↗
          </a>
          <a
            href="https://cv-landing-page-peach.vercel.app/"
            target="_blank"
            rel="noreferrer"
            style={{
              background: "#0284c7",
              color: "#ffffff",
              padding: "10px 18px",
              borderRadius: "999px",
              fontWeight: "700",
              fontSize: "14px",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>🚀</span> CV Kpa Trần Quang Thịnh (Vercel) ↗
          </a>
          <button
            type="button"
            onClick={() => window.print()}
            className="cv-btn-print"
          >
            <span>🖨️</span> In / Tải PDF
          </button>
        </div>
      </div>

      <div className="cv-paper">
        {/* Nhóm đồng sáng lập & phát triển (Team Co-Creators) */}
        <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", borderRadius: "16px", padding: "18px 22px", marginBottom: "32px", color: "#ffffff", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
          <div style={{ fontSize: "11px", fontWeight: "800", color: "#4ade80", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>👥</span> NHÓM SINH VIÊN ĐỒNG PHÁT TRIỂN ĐỒ ÁN (PROJECT CO-CREATORS)
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
            {/* Lê Duy Tài */}
            <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(74, 222, 128, 0.4)", borderRadius: "12px", padding: "14px 16px", display: "flex", gap: "12px", alignItems: "center" }}>
              <img src="/leduytai-cv.png" alt="Lê Duy Tài" style={{ width: "52px", height: "52px", borderRadius: "50%", objectFit: "cover", border: "2px solid #4ade80", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <strong style={{ fontSize: "15px", color: "#ffffff" }}>Lê Duy Tài</strong>
                  <span style={{ background: "#16a34a", color: "#ffffff", fontSize: "9px", fontWeight: "800", padding: "2px 6px", borderRadius: "999px" }}>Lead Dev</span>
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>Full-Stack Engineer · Đại học Đông Á</div>
                <a href="https://it24m.dak.edu.vn/leduytai/baitap1/" target="_blank" rel="noreferrer" style={{ fontSize: "11px", color: "#4ade80", fontWeight: "700", textDecoration: "underline", display: "inline-block", marginTop: "4px" }}>
                  🌐 Mở CV Cá Nhân (it24m.dak.edu.vn) ↗
                </a>
              </div>
            </div>

            {/* Kpa Trần Quang Thịnh */}
            <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(56, 189, 248, 0.4)", borderRadius: "12px", padding: "14px 16px", display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "linear-gradient(135deg, #0284c7, #38bdf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", border: "2px solid #38bdf8", flexShrink: 0 }}>
                👨‍💻
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <strong style={{ fontSize: "15px", color: "#ffffff" }}>Kpa Trần Quang Thịnh</strong>
                  <span style={{ background: "#0284c7", color: "#ffffff", fontSize: "9px", fontWeight: "800", padding: "2px 6px", borderRadius: "999px" }}>Co-Dev</span>
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>Web &amp; Software Developer Fresher</div>
                <a href="https://cv-landing-page-peach.vercel.app/" target="_blank" rel="noreferrer" style={{ fontSize: "11px", color: "#38bdf8", fontWeight: "700", textDecoration: "underline", display: "inline-block", marginTop: "4px" }}>
                  🚀 Mở CV Cá Nhân (Vercel) ↗
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <header className="cv-header">
          <div className="cv-avatar-box">
            <img
              src="/leduytai-cv.png"
              alt="Lê Duy Tài - CV & VietQR"
              className="cv-avatar-img"
              onError={(e) => {
                // fallback if image not found
                e.currentTarget.style.display = "none";
              }}
            />
          </div>

          <div className="cv-header-info">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h1 className="cv-name">LÊ DUY TÀI</h1>
              <span className="cv-badge-student">Sinh viên Đại học Đông Á (UDA)</span>
            </div>
            <h2 className="cv-title">FULL-STACK WEB DEVELOPER / SOFTWARE ENGINEER</h2>
            <p className="cv-bio">
              Sinh viên ngành Công nghệ Thông tin - <strong>Trường Đại học Đông Á</strong> (Lớp IT24M). Đam mê kỹ thuật phần mềm,
              kiến trúc hệ thống phân tán, tối ưu hóa cơ sở dữ liệu quan hệ (Neon Serverless PostgreSQL, MySQL) và
              xây dựng ứng dụng web hiệu năng cao với Next.js và NestJS. Luôn chủ động học hỏi, rèn luyện tư duy
              logic và kiến tạo sản phẩm số có giá trị phục vụ cộng đồng thể thao Đắk Lắk.
            </p>

            <div className="cv-contacts">
              <span>📧 <strong>Email:</strong> huavanhen456@gmail.com</span>
              <span>📞 <strong>Hotline/Zalo:</strong> 0896890399</span>
              <span>🎂 <strong>Ngày sinh:</strong> 23/04/2006 (20 tuổi)</span>
              <span>📍 <strong>Địa chỉ:</strong> Xã Ea Kao, TP. Buôn Ma Thuột, Đắk Lắk</span>
              <span>🌐 <strong>Portfolio:</strong> it24m.dak.edu.vn/leduytai/baitap1</span>
              <span>💳 <strong>VietQR MB Bank:</strong> 02304200699999 (LE DUY TAI)</span>
            </div>
          </div>
        </header>

        {/* Content 2 columns */}
        <div className="cv-grid">
          {/* Main Column */}
          <main className="cv-main-col">
            {/* Project Highlight */}
            <section className="cv-section">
              <h3 className="cv-section-title">
                <span>🚀</span> DỰ ÁN TIÊU BIỂU (FEATURED PROJECTS)
              </h3>

              <div className="cv-item">
                <div className="cv-item-header">
                  <strong>HỆ THỐNG QUẢN LÝ &amp; ĐẶT SÂN BÓNG ĐÁ BUÔN MA THUỘT</strong>
                  <span className="cv-tag">ĐỒ ÁN MÃ NGUỒN MỞ 2</span>
                </div>
                <div className="cv-item-sub">
                  Full-Stack Lead (Đồng hành cùng <strong>Kpa Trần Quang Thịnh</strong>)
                </div>
                <ul className="cv-bullet-list">
                  <li>
                    <strong>Mô hình Sân Mẹ &amp; Sân Con:</strong> Quản lý 21 cụm sân bóng đá thật tại TP. Buôn Ma Thuột.
                    Khách hàng click chọn sân mẹ sẽ mở ra các sân con chi tiết (Sân 5 số 1, Sân 5 số 2, Sân 7 số 1, Sân 7 số 2, Sân 11 tiêu chuẩn).
                  </li>
                  <li>
                    <strong>Quy chuẩn ca thi đấu:</strong> Cài đặt chuẩn 1 ca thi đấu = <strong>1 tiếng 30 phút (90 phút/ca)</strong>, với 11 khung giờ từ 06:00 đến 22:30.
                  </li>
                  <li>
                    <strong>Thanh toán VietQR &amp; Auto-Cancel 30 phút:</strong> Tự động tạo mã QR Napas 247 cho từng đơn đặt sân.
                    Mã QR có hiệu lực <strong>30 phút</strong>; nếu quá hạn chưa nhận được cọc sẽ tự động hủy đơn và giải phóng sân. Khách hàng lỡ thoát có thể dùng <strong>Mã đơn</strong> để tra cứu và mở lại QR thanh toán.
                  </li>
                  <li>
                    <strong>Báo cáo chủ sân &amp; Admin:</strong> Hệ thống tự động phân loại và gửi thông báo về Zalo/SĐT cho chủ từng sân mẹ khi có khách đặt sân con; module Admin kiểm duyệt đơn hàng và báo cáo thu - chi toàn diện.
                  </li>
                  <li>
                    <strong>Công nghệ:</strong> Next.js 15 App Router, Node.js Native Serverless API (không tốn RAM), CSDL <strong>Neon Cloud PostgreSQL</strong>, Docker Wispbyte Hosting 24/7.
                  </li>
                </ul>
              </div>

              <div className="cv-item" style={{ marginTop: "18px" }}>
                <div className="cv-item-header">
                  <strong>LANDING PAGE PROFILE CÁ NHÂN &amp; NEON DB (LAB 1)</strong>
                  <span className="cv-tag">BÀI TẬP 1</span>
                </div>
                <div className="cv-item-sub">Next.js · NestJS API · Neon Serverless PostgreSQL · DirectAdmin</div>
                <ul className="cv-bullet-list">
                  <li>Xây dựng trang Portfolio cá nhân đa thành phần, đồng bộ dữ liệu thời gian thực từ Neon Cloud.</li>
                  <li>Đóng gói triển khai chuẩn DirectAdmin hosting trường: <code>it24m.dak.edu.vn/leduytai/baitap1/</code></li>
                </ul>
              </div>
            </section>

            {/* Đồng nghiệp / Cộng sự Kpa Trần Quang Thịnh */}
            <section className="cv-section" style={{ background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)", padding: "18px 20px", borderRadius: "14px", border: "1px solid #bae6fd", marginBottom: "26px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "10px" }}>
                <div>
                  <span style={{ background: "#0284c7", color: "#ffffff", fontSize: "10px", fontWeight: "800", padding: "3px 8px", borderRadius: "999px" }}>ĐỒNG TÁC GIẢ DỰ ÁN</span>
                  <h4 style={{ margin: "6px 0 2px", fontSize: "18px", color: "#0369a1" }}>KPA TRẦN QUANG THỊNH</h4>
                  <div style={{ fontSize: "13px", color: "#0284c7", fontWeight: "600" }}>Web Developer &amp; Software Developer Fresher</div>
                </div>
                <a
                  href="https://cv-landing-page-peach.vercel.app/"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: "#0284c7",
                    color: "#ffffff",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontWeight: "700",
                    fontSize: "12px",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 2px 8px rgba(2, 132, 199, 0.3)",
                  }}
                >
                  🚀 Mở CV Kpa Trần Quang Thịnh (Vercel) ↗
                </a>
              </div>
              <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#334155", lineHeight: "1.6" }}>
                Cùng đồng hành và tham gia phát triển hệ sinh thái <strong>Đồ Án Mã Nguồn Mở 2 - Sân Nhà Buôn Ma Thuột</strong>.
                Chịu trách nhiệm thiết kế giao diện người dùng, thử nghiệm tích hợp đặt sân và kiểm tra tính năng thanh toán VietQR trên di động.
              </p>
            </section>

            {/* Education & Experience */}
            <section className="cv-section">
              <h3 className="cv-section-title">
                <span>💼</span> HOẠT ĐỘNG &amp; KINH NGHIỆM THỰC TẾ
              </h3>
              <div className="cv-item">
                <div className="cv-item-header">
                  <strong>Nhóm Sinh viên Nghiên cứu Phần mềm Nguồn mở</strong>
                  <span className="cv-period">2024 - Hiện tại</span>
                </div>
                <div className="cv-item-sub">Khoa Công nghệ Thông tin - Trường Cao đẳng Đắk Lắk</div>
                <ul className="cv-bullet-list">
                  <li>Nghiên cứu ứng dụng công nghệ web hiện đại vào số hóa các mô hình kinh doanh thể thao và dịch vụ địa phương tại Buôn Ma Thuột.</li>
                  <li>Xây dựng giải pháp lưu trữ đám mây tối ưu hóa chi phí với PostgreSQL Serverless và container siêu nhẹ.</li>
                </ul>
              </div>
            </section>
          </main>

          {/* Sidebar Column */}
          <aside className="cv-side-col">
            {/* Skills */}
            <section className="cv-section">
              <h3 className="cv-section-title">
                <span>🛠️</span> KỸ NĂNG CÔNG NGHỆ
              </h3>

              <div className="cv-skill-group">
                <strong>Frontend:</strong>
                <div className="cv-skill-tags">
                  <span>React.js</span>
                  <span>Next.js 15/16</span>
                  <span>TypeScript</span>
                  <span>HTML5/CSS3</span>
                  <span>TailwindCSS</span>
                  <span>Responsive Web</span>
                </div>
              </div>

              <div className="cv-skill-group">
                <strong>Backend &amp; API:</strong>
                <div className="cv-skill-tags">
                  <span>Node.js</span>
                  <span>NestJS</span>
                  <span>Express</span>
                  <span>RESTful API</span>
                  <span>VietQR / Napas</span>
                  <span>JWT Auth</span>
                </div>
              </div>

              <div className="cv-skill-group">
                <strong>Database &amp; DevOps:</strong>
                <div className="cv-skill-tags">
                  <span>Neon PostgreSQL</span>
                  <span>MySQL</span>
                  <span>Docker</span>
                  <span>Wispbyte</span>
                  <span>DirectAdmin</span>
                  <span>Git/GitHub</span>
                </div>
              </div>
            </section>

            {/* Education */}
            <section className="cv-section">
              <h3 className="cv-section-title">
                <span>🎓</span> HỌC VẤN
              </h3>
              <div className="cv-item">
                <strong>Trường Đại học Đông Á (UDA)</strong>
                <div style={{ fontSize: "13px", color: "#64748b" }}>Lớp: IT24M · Ngành: Công nghệ Thông tin</div>
                <div style={{ fontSize: "13px", color: "#64748b" }}>Địa chỉ: Ea Kao, Buôn Ma Thuột, Đắk Lắk</div>
                <div style={{ fontSize: "13px", marginTop: "4px", color: "#16a34a", fontWeight: "700" }}>
                  Môn học: Lập trình Mã nguồn mở 2
                </div>
              </div>
            </section>

            {/* VietQR Box */}
            <section className="cv-section" style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px dashed #cbd5e1" }}>
              <h3 className="cv-section-title" style={{ fontSize: "14px", marginBottom: "8px" }}>
                <span>💳</span> ẢNH THẺ MÃ VIETQR CHÍNH CHỦ
              </h3>
              <div style={{ maxWidth: "200px", margin: "0 auto 10px", borderRadius: "8px", overflow: "hidden", border: "1px solid #cbd5e1", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <img
                  src="/leduytai-qr.jpg"
                  alt="Ảnh cầm thẻ VietQR Napas 247 chính chủ"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.7", color: "#334155" }}>
                <div><strong>Ngân hàng:</strong> MB Bank (Napas 247)</div>
                <div><strong>Số tài khoản:</strong> <span style={{ color: "#16a34a", fontSize: "14px", fontWeight: "800" }}>02304200699999</span></div>
                <div><strong>Chủ tài khoản:</strong> LE DUY TAI</div>
                <div><strong>Hotline / Zalo:</strong> 0896890399</div>
              </div>
            </section>

            {/* Personal Qualities */}
            <section className="cv-section">
              <h3 className="cv-section-title">
                <span>🌟</span> ĐẶC ĐIỂM BẢN THÂN
              </h3>
              <ul className="cv-bullet-list">
                <li>Năng động, kiên trì, đam mê công nghệ.</li>
                <li>Khả năng tự nghiên cứu và giải quyết bài toán kỹ thuật mới.</li>
                <li>Kỹ năng phối hợp làm việc nhóm và phân chia công việc hiệu quả.</li>
              </ul>
            </section>
          </aside>
        </div>

        {/* Footer in CV */}
        <footer className="cv-footer">
          <div>Dự án được đồng hành và phát triển bởi <strong>Lê Duy Tài</strong> (Lớp IT24M) &amp; <strong>Kpa Trần Quang Thịnh</strong></div>
          <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}>
            Hồ sơ năng lực cá nhân · Trường Cao đẳng Đắk Lắk (dak.edu.vn) · Bản quyền © 2026 Lê Duy Tài
          </div>
        </footer>
      </div>

      <style jsx>{`
        .cv-container {
          background: #0f172a;
          min-height: 100vh;
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #1e293b;
        }

        .cv-nav-bar {
          width: 100%;
          max-width: 900px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .cv-btn-back {
          background: rgba(255, 255, 255, 0.12);
          color: #f8fafc;
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
          transition: background 0.2s;
        }

        .cv-btn-back:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .cv-btn-online {
          background: #16a34a;
          color: #ffffff;
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
          transition: background 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .cv-btn-online:hover {
          background: #15803d;
        }

        .cv-btn-print {
          background: #2563eb;
          color: #ffffff;
          border: none;
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .cv-btn-print:hover {
          background: #1d4ed8;
        }

        .cv-paper {
          background: #ffffff;
          width: 100%;
          max-width: 900px;
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
          padding: 48px;
          overflow: hidden;
        }

        .cv-header {
          display: flex;
          gap: 32px;
          align-items: center;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 32px;
        }

        .cv-avatar-box {
          flex-shrink: 0;
          width: 140px;
          height: 140px;
          border-radius: 18px;
          overflow: hidden;
          background: #0f172a;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
          border: 3px solid #16a34a;
        }

        .cv-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .cv-header-info {
          flex: 1;
        }

        .cv-name {
          font-size: 32px;
          font-weight: 900;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .cv-badge-student {
          background: #dcfce7;
          color: #166534;
          font-size: 12px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 9999px;
          border: 1px solid #bbf7d0;
        }

        .cv-title {
          font-size: 15px;
          font-weight: 700;
          color: #16a34a;
          margin: 4px 0 12px 0;
          letter-spacing: 0.5px;
        }

        .cv-bio {
          font-size: 13.5px;
          line-height: 1.6;
          color: #475569;
          margin-bottom: 16px;
        }

        .cv-contacts {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 8px;
          font-size: 13px;
          color: #334155;
        }

        .cv-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 36px;
          margin-top: 32px;
        }

        .cv-section {
          margin-bottom: 28px;
        }

        .cv-section-title {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 8px;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cv-item {
          margin-bottom: 16px;
        }

        .cv-item-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 8px;
          font-size: 14.5px;
        }

        .cv-tag {
          font-size: 11px;
          font-weight: 700;
          background: #eff6ff;
          color: #2563eb;
          padding: 2px 8px;
          border-radius: 4px;
          white-space: nowrap;
        }

        .cv-period {
          font-size: 12px;
          color: #64748b;
          font-weight: 600;
        }

        .cv-item-sub {
          font-size: 12.5px;
          color: #64748b;
          font-weight: 600;
          margin: 3px 0 6px 0;
        }

        .cv-bullet-list {
          margin: 0;
          padding-left: 18px;
          font-size: 13px;
          line-height: 1.65;
          color: #334155;
        }

        .cv-bullet-list li {
          margin-bottom: 6px;
        }

        .cv-skill-group {
          margin-bottom: 14px;
          font-size: 13px;
        }

        .cv-skill-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 6px;
        }

        .cv-skill-tags span {
          background: #f1f5f9;
          color: #1e293b;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }

        .cv-footer {
          margin-top: 36px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          font-size: 13px;
          color: #64748b;
        }

        @media (max-width: 768px) {
          .cv-paper {
            padding: 24px;
          }
          .cv-header {
            flex-direction: column;
            text-align: center;
          }
          .cv-contacts {
            grid-template-columns: 1fr;
          }
          .cv-grid {
            grid-template-columns: 1fr;
          }
        }

        @media print {
          .cv-container {
            background: #ffffff;
            padding: 0;
          }
          .cv-nav-bar {
            display: none;
          }
          .cv-paper {
            box-shadow: none;
            padding: 0;
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
