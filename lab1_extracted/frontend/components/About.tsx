'use client';

import React from 'react';
import { Profile } from '../lib/types';

interface AboutProps {
  profile: Profile;
}

export default function About({ profile }: AboutProps) {
  return (
    <section id="about" className="section">
      <div className="section-title-wrap">
        <div className="section-badge">Hồ sơ cá nhân</div>
        <h2 className="section-title">Về Bản Thân Tôi</h2>
        <p className="section-desc">
          Sinh viên chuyên ngành Công Nghệ Thông Tin với định hướng trở thành Software Engineer / Full-stack Developer chuyên nghiệp.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '32px', alignItems: 'stretch' }}>
        {/* Photo Card */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px',
            backdropFilter: 'blur(14px)',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 12px 35px -10px rgba(0,0,0,0.6)',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '380px',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              marginBottom: '16px',
              border: '2px solid rgba(249, 115, 22, 0.4)',
            }}
          >
            <img
              src="./avatar.jpg"
              alt="Lê Duy Tài"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 20%',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                right: '10px',
                background: 'rgba(9, 13, 22, 0.85)',
                backdropFilter: 'blur(8px)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <strong style={{ fontSize: '13px', color: '#ffffff', display: 'block' }}>Lê Duy Tài</strong>
                <small style={{ fontSize: '11px', color: '#fb923c', fontFamily: 'var(--font-mono)' }}>23/04/2006 · IT24M</small>
              </div>
              <span style={{ fontSize: '16px' }}>📍 Đắk Lắk</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
            <a
              href="tel:0896890399"
              className="btn btn-primary"
              style={{ flex: 1, padding: '10px 12px', fontSize: '12px' }}
            >
              📞 Gọi điện
            </a>
            <a
              href="https://zalo.me/0896890399"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ flex: 1, padding: '10px 12px', fontSize: '12px' }}
            >
              💬 Nhắn Zalo
            </a>
          </div>
        </div>

        {/* Info & Story Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="about-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '14px', color: '#fb923c' }}>
              Lê Duy Tài — Sinh viên IT24M (dak.edu.vn)
            </h3>
            <p style={{ color: '#cbd5e1', marginBottom: '14px', lineHeight: '1.75' }}>
              Tôi sinh ngày <strong>23/04/2006</strong> tại Đắk Lắk, hiện đang theo học chuyên ngành Công Nghệ Thông Tin tại trường (Lớp <strong>IT24M</strong> - môn Lập trình mã nguồn mở 2).
            </p>
            <p style={{ color: '#cbd5e1', marginBottom: '14px', lineHeight: '1.75' }}>
              Với niềm đam mê sâu sắc dành cho lập trình phần mềm, tôi luôn chủ động nghiên cứu và ứng dụng những công nghệ web tiên tiến nhất: <strong>Next.js 16, NestJS Framework, TypeScript</strong> và kiến trúc cơ sở dữ liệu điện toán đám mây <strong>Neon Serverless PostgreSQL</strong>.
            </p>
            <p style={{ color: '#94a3b8', lineHeight: '1.75' }}>
              Phương châm làm việc của tôi là: <em>&ldquo;Viết mã nguồn sạch, cấu trúc rõ ràng, tối ưu trải nghiệm người dùng và luôn đảm bảo tính toàn vẹn của dữ liệu.&rdquo;</em>
            </p>
          </div>

          <div className="about-card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '16px', color: '#ffffff' }}>
              📋 Chi Tiết Thông Tin Cá Nhân
            </h4>

            <div className="about-info-grid" style={{ marginTop: 0 }}>
              <div className="info-cell">
                <span>Họ và Tên</span>
                <strong>{profile.fullName}</strong>
              </div>

              <div className="info-cell">
                <span>Ngày Sinh</span>
                <strong>23/04/2006 (20 tuổi)</strong>
              </div>

              <div className="info-cell">
                <span>Số Điện Thoại</span>
                <strong style={{ color: '#fb923c' }}>0896890399</strong>
              </div>

              <div className="info-cell">
                <span>Email Cá Nhân</span>
                <strong style={{ wordBreak: 'break-all' }}>huavanhen456@gmail.com</strong>
              </div>

              <div className="info-cell">
                <span>Lớp Học Phần</span>
                <strong>IT24M (dak.edu.vn)</strong>
              </div>

              <div className="info-cell">
                <span>Địa Chỉ / Khu Vực</span>
                <strong>Buôn Ma Thuột, Đắk Lắk</strong>
              </div>

              <div className="info-cell">
                <span>Cơ Sở Dữ Liệu</span>
                <strong style={{ color: '#34d399' }}>Neon PostgreSQL Cloud</strong>
              </div>

              <div className="info-cell">
                <span>Trạng Thái</span>
                <strong style={{ color: '#38bdf8' }}>Sẵn sàng nhận dự án</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
