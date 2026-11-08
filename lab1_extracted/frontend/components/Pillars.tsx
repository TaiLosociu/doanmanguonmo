'use client';

import React from 'react';

const PILLARS = [
  {
    id: 'swe',
    icon: '💻',
    title: 'Software Engineering',
    description:
      'Áp dụng Clean Architecture, SOLID principles, Design Patterns và chuẩn hóa mã nguồn TypeScript để đảm bảo ứng dụng có thể mở rộng an toàn và dễ bảo trì.',
    tags: ['Clean Code', 'SOLID', 'TypeScript', 'Design Patterns'],
  },
  {
    id: 'db',
    icon: '🗄️',
    title: 'Database Design & Tuning',
    description:
      'Thành thạo thiết kế lược đồ quan hệ ERD, tối ưu hóa chỉ mục (Indexing), xử lý giao dịch ACID cấp độ cao chống trùng lặp dữ liệu với PostgreSQL & MySQL.',
    tags: ['Neon PostgreSQL', 'MySQL', 'TypeORM', 'Prisma', 'Transactions'],
  },
  {
    id: 'arch',
    icon: '⚡',
    title: 'System Architecture',
    description:
      'Nắm vững kiến trúc RESTful API chuẩn mực với NestJS, xác thực bảo mật JWT, phân quyền người dùng đa cấp bậc (RBAC), kiểm soát lỗi và ghi nhật ký tập trung.',
    tags: ['NestJS API', 'RESTful', 'JWT Auth', 'RBAC Security'],
  },
  {
    id: 'devops',
    icon: '🛠️',
    title: 'DevOps & Test Automation',
    description:
      'Tự động hóa kiểm thử tích hợp (Integration Test) và kiểm tra hiệu năng API với Postman Newman, quản lý mã nguồn bài bản qua Gitflow và Docker.',
    tags: ['Git & GitHub', 'Postman / Newman', 'Docker', 'CI/CD'],
  },
];

export default function Pillars() {
  return (
    <section id="pillars" className="section" style={{ paddingTop: '20px' }}>
      <div className="section-title-wrap">
        <div className="section-badge">Nền tảng năng lực</div>
        <h2 className="section-title">Lĩnh Vực Chuyên Môn Cốt Lõi</h2>
        <p className="section-desc">
          Tập trung vào chất lượng mã nguồn, tư duy kiến trúc hệ thống và khả năng xử lý cơ sở dữ liệu hiệu năng cao.
        </p>
      </div>

      <div className="pillars-grid">
        {PILLARS.map((pillar) => (
          <div key={pillar.id} className="pillar-card">
            <div className="pillar-icon-box">{pillar.icon}</div>
            <h3 className="pillar-title">{pillar.title}</h3>
            <p className="pillar-desc">{pillar.description}</p>
            <div className="pillar-tags">
              {pillar.tags.map((tag) => (
                <span key={tag} className="pillar-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

