'use client';

import React, { useState, useEffect } from 'react';
import { Profile } from '../lib/types';

interface HeroProps {
  profile: Profile;
}

const ROLES = [
  'Sinh viên CNTT / Software Engineering Student (IT24M)',
  'Full-stack Developer (Next.js & NestJS)',
  'Database Architecture & Neon PostgreSQL Specialist',
  'Clean Code & System Architecture Enthusiast',
];

export default function Hero({ profile }: HeroProps) {
  const [roleIndex, setRoleIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentRole = ROLES[roleIndex];
    const typingSpeed = isDeleting ? 30 : 65;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (text.length < currentRole.length) {
          setText(currentRole.slice(0, text.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 1800);
        }
      } else {
        if (text.length > 0) {
          setText(currentRole.slice(0, text.length - 1));
        } else {
          setIsDeleting(false);
          setRoleIndex((prev) => (prev + 1) % ROLES.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [text, isDeleting, roleIndex]);

  return (
    <section className="hero">
      <div className="hero-left">
        <div className="hero-badge-wrap">
          <span className="hero-dot" />
          <span>Sẵn sàng nhận dự án mới &amp; thực tập chuyên môn</span>
        </div>

        <h1 className="hero-title">
          Xin chào, tôi là <br />
          <span className="text-gradient">{profile.fullName}</span>
        </h1>

        <div className="hero-typing-wrap">
          <span>{text}</span>
          <span className="typing-cursor" />
        </div>

        <p className="hero-bio">
          Sinh viên ngành <strong>Công nghệ Thông tin (Lớp IT24M)</strong> sinh ngày <strong>23/04/2006</strong> tại Đắk Lắk. Đam mê kỹ thuật phần mềm, kiến trúc hệ thống phân tán, tối ưu hóa cơ sở dữ liệu quan hệ (<strong>Neon PostgreSQL Cloud, MySQL</strong>) và xây dựng ứng dụng web hiệu năng cao với <strong>Next.js</strong> và <strong>NestJS</strong>.
        </p>

        <div className="hero-actions">
          <a href="#projects" className="btn btn-primary">
            🚀 Khám phá Dự án
          </a>
          <a href="#contact" className="btn btn-secondary">
            💬 Liên hệ ngay
          </a>
          <a href="tel:0896890399" className="btn btn-secondary" title="Gọi điện trực tiếp">
            📞 0896890399
          </a>
          {profile.githubUrl && (
            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              🐙 GitHub
            </a>
          )}
        </div>

        <div className="hero-stats">
          <div className="stat-box">
            <h4>2+</h4>
            <p>Năm Học Tập &amp; Thực Hành</p>
          </div>
          <div className="stat-box">
            <h4>12+</h4>
            <p>Dự Án Hoàn Thành</p>
          </div>
          <div className="stat-box">
            <h4>99.8%</h4>
            <p>Code Quality &amp; Uptime</p>
          </div>
          <div className="stat-box">
            <h4>100%</h4>
            <p>Neon Cloud Sync</p>
          </div>
        </div>
      </div>

      <div className="hero-right">
        <div className="hero-card-preview">
          <div style={{ textAlign: 'center' }}>
            <span className="hero-card-badge">Sinh viên CNTT (IT24M)</span>
            <div style={{ position: 'relative', width: '130px', height: '130px', margin: '0 auto 16px' }}>
              <img
                src="./avatar.jpg"
                alt={profile.fullName}
                className="hero-card-avatar"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 15%',
                  borderRadius: '50%',
                  border: '3px solid #f97316',
                  boxShadow: '0 0 25px rgba(249, 115, 22, 0.45)',
                  margin: 0,
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#10b981',
                  border: '3px solid #0f172a',
                  boxShadow: '0 0 8px #10b981',
                }}
                title="Đang trực tuyến"
              />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>
              {profile.fullName}
            </h3>
            <p style={{ fontSize: '13px', color: '#fb923c', fontWeight: 600, marginBottom: '16px' }}>
              leduytai.dev · 23/04/2006
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
              <span>Lớp học phần:</span>
              <strong style={{ color: '#ffffff' }}>IT24M (dak.edu.vn)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
              <span>Điện thoại:</span>
              <strong style={{ color: '#fb923c' }}>0896890399</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
              <span>Email:</span>
              <strong style={{ color: '#ffffff' }}>huavanhen456@gmail.com</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
              <span>Cơ sở dữ liệu:</span>
              <strong style={{ color: '#34d399' }}>Neon PostgreSQL</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
