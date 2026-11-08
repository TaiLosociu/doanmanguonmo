'use client';

import React from 'react';
import { HealthStatus } from '../lib/types';

interface NeonBannerProps {
  health: HealthStatus | null;
}

export default function NeonBanner({ health }: NeonBannerProps) {
  const isConnected = health?.database === 'connected';

  return (
    <div className="neon-banner">
      <div className="neon-banner-left">
        <div className="neon-logo">🐘</div>
        <div className="neon-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4>Neon Serverless PostgreSQL (AWS US-East-2)</h4>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                background: 'rgba(0, 229, 153, 0.15)',
                color: '#34d399',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(0, 229, 153, 0.3)',
              }}
            >
              Cloud Database
            </span>
          </div>
          <p>
            {isConnected
              ? `Đã kết nối mượt mà qua NestJS TypeORM · Độ trễ: ${health?.latencyMs ?? 0}ms · Pooler: ep-wispy-hall`
              : 'Đang duy trì kết nối đến máy chủ cơ sở dữ liệu Neon...'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span className={`neon-badge-pill ${isConnected ? 'connected' : 'loading'}`}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isConnected ? '#10b981' : '#eab308',
            }}
          />
          {isConnected ? 'PostgreSQL Active' : 'Connecting'}
        </span>
      </div>
    </div>
  );
}
