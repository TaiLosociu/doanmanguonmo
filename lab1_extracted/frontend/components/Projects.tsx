'use client';

import React from 'react';
import { Project } from '../lib/types';

interface ProjectsProps {
  projects: Project[];
}

export default function Projects({ projects }: ProjectsProps) {
  return (
    <section id="projects" className="section">
      <div className="section-title-wrap">
        <div className="section-badge">Dự án tiêu biểu</div>
        <h2 className="section-title">Sản Phẩm &amp; Đồ Án Thực Tế</h2>
        <p className="section-desc">
          Các hệ thống phần mềm full-stack hoàn chỉnh được xây dựng với kiến trúc chuẩn mực và cơ sở dữ liệu cloud.
        </p>
      </div>

      <div className="projects-grid">
        {projects.map((proj) => (
          <div key={proj.id} className="project-card">
            <div className="project-cover">
              <img
                src={proj.imageUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80'}
                alt={proj.title}
              />
              <span className="project-badge-top">
                {proj.badge || (proj.featured ? '⭐ Dự án Tiêu biểu' : 'Dự án')}
              </span>
            </div>

            <div className="project-body">
              <h3 className="project-title">{proj.title}</h3>
              <p className="project-desc">{proj.description}</p>

              {proj.problemStatement && (
                <div className="project-problem-box">
                  <strong>💡 Bài toán thực tế:</strong> {proj.problemStatement}
                </div>
              )}

              {proj.highlights && proj.highlights.length > 0 && (
                <div>
                  <div className="project-highlights-title">Điểm nổi bật kỹ thuật:</div>
                  <ul className="project-highlights-list">
                    {proj.highlights.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="project-tech-tags">
                {proj.techStack &&
                  proj.techStack.map((tech, idx) => (
                    <span key={idx} className="tech-tag">
                      {tech}
                    </span>
                  ))}
              </div>

              <div className="project-links">
                {proj.demoUrl && proj.demoUrl !== '#' && (
                  <a
                    href={proj.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ padding: '9px 18px', fontSize: '13px' }}
                  >
                    🔗 Xem Trực Tiếp
                  </a>
                )}
                {proj.githubUrl && (
                  <a
                    href={proj.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ padding: '9px 18px', fontSize: '13px' }}
                  >
                    🐙 GitHub Repo
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
