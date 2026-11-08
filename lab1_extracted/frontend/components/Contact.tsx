'use client';

import React, { useState, useEffect } from 'react';
import { sendContactMessage, fetchContactMessages } from '../lib/api';
import { ContactMessage } from '../lib/types';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [showMessages, setShowMessages] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const loadMessages = async () => {
    setLoadingMessages(true);
    const data = await fetchContactMessages();
    setMessages(data);
    setLoadingMessages(false);
  };

  useEffect(() => {
    if (showMessages) {
      loadMessages();
    }
  }, [showMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      const res = await sendContactMessage({ name, email, subject, message });
      setAlert({
        type: 'success',
        text: res.message || 'Tin nhắn của bạn đã được ghi nhận trực tiếp vào CSDL Neon PostgreSQL thành công!',
      });
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      if (showMessages) {
        loadMessages();
      }
    } catch (err) {
      setAlert({
        type: 'error',
        text: (err as Error).message || 'Có lỗi xảy ra khi kết nối tới NestJS API hoặc Neon DB.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="section">
      <div className="section-title-wrap">
        <div className="section-badge">Kết nối trực tiếp</div>
        <h2 className="section-title">Liên Hệ &amp; Gửi Tin Nhắn</h2>
        <p className="section-desc">
          Biểu mẫu tương tác trực tiếp với NestJS RESTful API và lưu trữ tức thời vào cơ sở dữ liệu Neon PostgreSQL.
        </p>
      </div>

      <div className="contact-grid">
        <div className="contact-card">
          <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '24px', color: '#ffffff' }}>
            Thông Tin Liên Hệ
          </h3>

          <a href="tel:0896890399" className="contact-direct-item">
            <div className="contact-direct-icon">📞</div>
            <div className="contact-direct-body">
              <div className="contact-direct-label">Số điện thoại / Hotline</div>
              <div className="contact-direct-val" style={{ color: '#fb923c' }}>0896890399</div>
            </div>
          </a>

          <a href="https://zalo.me/0896890399" target="_blank" rel="noopener noreferrer" className="contact-direct-item">
            <div className="contact-direct-icon" style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
              💬
            </div>
            <div className="contact-direct-body">
              <div className="contact-direct-label">Zalo Trực Tuyến</div>
              <div className="contact-direct-val">0896890399 (Lê Duy Tài)</div>
            </div>
          </a>

          <a href="mailto:huavanhen456@gmail.com" className="contact-direct-item">
            <div className="contact-direct-icon" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
              📧
            </div>
            <div className="contact-direct-body">
              <div className="contact-direct-label">Địa chỉ Email</div>
              <div className="contact-direct-val" style={{ wordBreak: 'break-all' }}>huavanhen456@gmail.com</div>
            </div>
          </a>

          <div className="contact-direct-item">
            <div className="contact-direct-icon" style={{ color: '#a855f7', background: 'rgba(168, 85, 247, 0.12)', borderColor: 'rgba(168, 85, 247, 0.3)' }}>
              🎂
            </div>
            <div className="contact-direct-body">
              <div className="contact-direct-label">Ngày Sinh / Tuổi</div>
              <div className="contact-direct-val">23/04/2006 (20 tuổi)</div>
            </div>
          </div>

          <div className="contact-direct-item">
            <div className="contact-direct-icon" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              📍
            </div>
            <div className="contact-direct-body">
              <div className="contact-direct-label">Vị trí &amp; Lớp học phần</div>
              <div className="contact-direct-val">Buôn Ma Thuột, Đắk Lắk · Lớp IT24M</div>
            </div>
          </div>

          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => setShowMessages(!showMessages)}
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: '13px', fontWeight: 700 }}
            >
              {showMessages ? '🔒 Đóng danh sách tin nhắn Neon DB' : '📬 Xem các tin nhắn đã lưu trong Neon DB'}
            </button>
          </div>
        </div>

        <div className="contact-card">
          <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px', color: '#fb923c' }}>
            ✉️ Gửi Lời Nhắn Đến Tôi
          </h3>

          {alert && (
            <div className={`alert ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              <span>{alert.type === 'success' ? '✅' : '⚠️'}</span>
              <span>{alert.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Họ và tên của bạn</label>
              <input
                type="text"
                className="form-input"
                placeholder="VD: Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Địa chỉ Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="VD: name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tiêu đề tin nhắn</label>
              <input
                type="text"
                className="form-input"
                placeholder="VD: Đánh giá bài tập 1 hoặc thảo luận dự án..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nội dung tin nhắn</label>
              <textarea
                className="form-textarea"
                placeholder="Nhập nội dung tin nhắn gửi vào CSDL Neon..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '14px', fontSize: '15px' }}
            >
              {loading ? '⏳ Đang lưu vào Neon DB...' : '🚀 Gửi Tin Nhắn (Lưu Vào CSDL Neon)'}
            </button>
          </form>
        </div>
      </div>

      {showMessages && (
        <div className="messages-viewer">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#34d399' }}>
              📡 Dữ liệu thực từ bảng `contact_messages` (Neon PostgreSQL)
            </h4>
            <button
              type="button"
              onClick={loadMessages}
              className="btn btn-secondary"
              style={{ padding: '5px 12px', fontSize: '12px' }}
            >
              🔄 Làm mới dữ liệu
            </button>
          </div>

          {loadingMessages ? (
            <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '12px' }}>
              Đang truy vấn dữ liệu từ Neon Serverless PostgreSQL...
            </p>
          ) : messages.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '12px' }}>
              Chưa có tin nhắn nào trong cơ sở dữ liệu.
            </p>
          ) : (
            <div className="messages-list">
              {messages.map((msg) => (
                <div key={msg.id} className="message-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#fb923c' }}>
                      👤 {msg.name} ({msg.email})
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleString('vi-VN') : ''}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#ffffff', marginBottom: '4px' }}>
                    📌 {msg.subject}
                  </div>
                  <div style={{ fontSize: '13px', color: '#cbd5e1' }}>
                    💬 {msg.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
