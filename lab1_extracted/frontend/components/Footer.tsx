'use client';

import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-brand">
          <span style={{ color: '#ffffff' }}>Lê Duy Tài</span>
          <span style={{ color: '#fb923c' }}>.dev</span>
        </div>
        <p className="footer-copy">
          © 2026 <strong>Lê Duy Tài</strong> (23/04/2006) · Sinh viên Lớp <strong>IT24M</strong> — Trường Cao đẳng Đắk Lắk (dak.edu.vn).
        </p>
        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
          Hotline: <strong style={{ color: '#fb923c' }}>0896890399</strong> · Email:{' '}
          <strong style={{ color: '#cbd5e1' }}>huavanhen456@gmail.com</strong>
        </p>
        <p style={{ fontSize: '12px', color: '#475569', marginTop: '8px' }}>
          Xây dựng với <strong style={{ color: '#ffffff' }}>Next.js 16</strong>,{' '}
          <strong style={{ color: '#e11d48' }}>NestJS Framework</strong> và Cloud Database{' '}
          <strong style={{ color: '#00e599' }}>Neon Serverless PostgreSQL (AWS)</strong>.
        </p>
      </div>
    </footer>
  );
}
