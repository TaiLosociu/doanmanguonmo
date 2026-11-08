'use client';

import React from 'react';
import { Experience as ExpType } from '../lib/types';

interface ExperienceProps {
  experiences: ExpType[];
}

const CERTS = [
  {
    name: 'Next.js & NestJS Full-stack Web Architecture',
    issuer: 'Môn Lập Trình Mã Nguồn Mở 2 (Lớp IT24M)',
    status: 'Đã hoàn thành xuất sắc',
    target: '2026',
    icon: '🏆',
  },
  {
    name: 'Neon Serverless PostgreSQL & Cloud Database',
    issuer: 'Neon Cloud (AWS Infrastructure)',
    status: 'Đã tích hợp thực tế',
    target: '2026',
    icon: '🐘',
  },
  {
    name: 'Clean Code & SOLID Design Principles',
    issuer: 'Software Engineering Best Practices',
    status: 'Ứng dụng liên tục',
    target: '2025 - 2026',
    icon: '📘',
  },
  {
    name: 'Git Version Control & Postman API Automation',
    issuer: 'DevOps & Testing Methodology',
    status: 'Thực hành thành thạo',
    target: '2025 - 2026',
    icon: '🚀',
  },
];

export default function Experience({ experiences }: ExperienceProps) {
  return (
    <section id="education" className="section">
      <div className="section-title-wrap">
        <div className="section-badge">Hành trình học vấn</div>
        <h2 className="section-title">Học Vấn &amp; Quá Trình Đào Tạo</h2>
        <p className="section-desc">
          Quá trình học tập chuyên sâu tại trường và các cột mốc rèn luyện kỹ thuật phần mềm.
        </p>
      </div>

      <div className="timeline">
        {experiences.map((exp) => (
          <div key={exp.id} className="timeline-item">
            <div className="timeline-dot" />
            <div className="timeline-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <h3 className="timeline-role">{exp.role}</h3>
                {exp.grade && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      background: 'rgba(249, 115, 22, 0.15)',
                      color: '#fb923c',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 700,
                      border: '1px solid rgba(249, 115, 22, 0.3)',
                    }}
                  >
                    {exp.grade}
                  </span>
                )}
              </div>
              <div className="timeline-company">{exp.company}</div>
              <div className="timeline-period">📅 {exp.period}</div>
              <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>
                {exp.description}
              </p>

              {exp.details && exp.details.length > 0 && (
                <ul className="timeline-details-list">
                  {exp.details.map((detail, idx) => (
                    <li key={idx}>{detail}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: '820px', margin: '40px auto 0' }}>
        <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🎖️</span> Chứng Chỉ &amp; Năng Lực Trọng Tâm
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {CERTS.map((c, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '24px' }}>{c.icon}</div>
              <div>
                <strong style={{ fontSize: '13px', color: '#ffffff', display: 'block' }}>
                  {c.name}
                </strong>
                <small style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginTop: '2px' }}>
                  {c.issuer}
                </small>
                <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 600 }}>
                  ✓ {c.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
