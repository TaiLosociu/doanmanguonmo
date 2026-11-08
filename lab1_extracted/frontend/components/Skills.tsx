'use client';

import React, { useState } from 'react';
import { Skill } from '../lib/types';

interface SkillsProps {
  skills: Skill[];
}

const TABS = [
  { id: 'all', label: 'Tất cả kỹ năng' },
  { id: 'languages-frameworks', label: 'Ngôn ngữ & Framework' },
  { id: 'databases', label: 'Cơ sở dữ liệu' },
  { id: 'tools-methods', label: 'Công cụ & Phương pháp luận' },
];

export default function Skills({ skills }: SkillsProps) {
  const [activeTab, setActiveTab] = useState('all');

  const filtered = skills.filter((s) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'languages-frameworks') {
      return (
        s.category === 'languages-frameworks' ||
        s.category === 'Frontend' ||
        s.category === 'Backend'
      );
    }
    if (activeTab === 'databases') {
      return s.category === 'databases' || s.category === 'Database';
    }
    if (activeTab === 'tools-methods') {
      return (
        s.category === 'tools-methods' ||
        s.category === 'DevOps & Tools' ||
        s.category.includes('Tool')
      );
    }
    return true;
  });

  return (
    <section id="skills" className="section">
      <div className="section-title-wrap">
        <div className="section-badge">Năng lực kỹ thuật</div>
        <h2 className="section-title">Kỹ Năng Chuyên Môn</h2>
        <p className="section-desc">
          Công nghệ, ngôn ngữ lập trình và hệ cơ sở dữ liệu được tôi sử dụng thường xuyên trong các dự án thực tế.
        </p>
      </div>

      <div className="skills-filter-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`filter-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="skills-grid">
        {filtered.map((skill) => (
          <div key={skill.id} className="skill-card">
            <div className="skill-card-top">
              <div className="skill-card-name">
                <span>{skill.icon || '⚡'}</span>
                <span>{skill.name}</span>
              </div>
              <span className="skill-badge">{skill.badge || `${skill.proficiency}%`}</span>
            </div>

            <div className="skill-bar-track">
              <div
                className="skill-bar-prog"
                style={{ width: `${skill.proficiency}%` }}
              />
            </div>

            <p className="skill-exp-desc">
              {skill.experience || `Độ thành thạo ${skill.proficiency}% - Ứng dụng trong các dự án fullstack.`}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
