'use client';

import React from 'react';

interface NavbarProps {
  dbConnected: boolean;
}

export default function Navbar({ dbConnected }: NavbarProps) {
  return (
    <header className="navbar-wrap">
      <div className="container navbar">
        <a href="#" className="nav-brand">
          <div className="nav-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Lê Duy Tài</span>
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  background: 'rgba(249, 115, 22, 0.2)',
                  color: '#fb923c',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 700,
                  border: '1px solid rgba(249, 115, 22, 0.3)',
                }}
              >
                dev
              </span>
            </div>
            <small style={{ display: 'block', fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>
              IT24M · Software Engineer
            </small>
          </div>
        </a>

        <nav className="nav-links">
          <a href="#about" className="nav-link">Về tôi</a>
          <a href="#pillars" className="nav-link">Chuyên môn</a>
          <a href="#skills" className="nav-link">Kỹ năng</a>
          <a href="#projects" className="nav-link">Dự án</a>
          <a href="#education" className="nav-link">Học vấn</a>
          <a href="#contact" className="nav-link">Liên hệ</a>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            className={`neon-badge-pill ${dbConnected ? 'connected' : 'loading'}`}
            title="Trạng thái kết nối CSDL Neon Serverless PostgreSQL"
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: dbConnected ? '#10b981' : '#eab308',
                boxShadow: dbConnected ? '0 0 8px #10b981' : 'none',
              }}
            />
            {dbConnected ? 'Neon DB Online' : 'Connecting Neon...'}
          </div>

          <a href="#contact" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
            ✉️ Liên hệ ngay
          </a>
        </div>
      </div>
    </header>
  );
}
