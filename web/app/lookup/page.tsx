"use client";

import { FormEvent, useEffect, useState } from "react";

const API =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3000/api/v1";

type Booking = {
  id: number | string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  startAt?: string;
  endAt?: string;
  bookingDate?: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  unitPrice?: string | number;
  totalPrice: string | number;
  depositAmount?: number;
  cancelReason: string | null;
  field?: { name: string; fieldType: string };
  pitch?: { name: string };
  timeSlot?: { label: string; startTime: string; endTime: string };
  timeLabel?: string;
  fieldName?: string;
  ward?: string;
  address?: string;
  isExpired?: boolean;
  expiresInSeconds?: number;
  qrUrl?: string;
  bankInfo?: {
    bankName: string;
    accountNo: string;
    accountName: string;
    amount: number;
    transferContent: string;
  };
  createdAt?: string;
  invoice?: {
    id: number;
    invoiceCode: string;
    totalAmount: string | number;
    status: string;
  } | null;
};

function money(value: string | number): string {
  return new Intl.NumberFormat("vi-VN").format(Number(value)) + "đ";
}

export default function LookupPage() {
  const [bookingCode, setBookingCode] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [countdown, setCountdown] = useState<number>(0);

  // Cancel modal
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem("my-bookings") || "[]");
      if (Array.isArray(saved) && saved.length > 0) {
        setRecentBookings(saved);
        setBookingCode(saved[0].bookingCode || "");
        setCustomerPhone(saved[0].customerPhone || "");
      }
    } catch {}
  }, []);

  // Countdown timer for 30-minute QR validity
  useEffect(() => {
    if (!countdown || countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (booking && booking.status === "PENDING") {
            setBooking({
              ...booking,
              status: "CANCELLED",
              cancelReason: "Đã quá hạn 30 phút chuyển tiền cọc giữ sân",
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown, booking]);

  async function lookup(event?: FormEvent, codeToUse?: string, phoneToUse?: string) {
    event?.preventDefault();
    const finalCode = (codeToUse ?? bookingCode).trim();
    const finalPhone = (phoneToUse ?? customerPhone).trim();

    if (!finalCode && !finalPhone) {
      setError("Vui lòng nhập Mã đơn đặt sân hoặc Số điện thoại để tra cứu.");
      return;
    }

    setError("");
    setNotice("");
    setBooking(null);
    setBusy(true);

    try {
      const params = new URLSearchParams();
      if (finalCode) params.set("bookingCode", finalCode);
      if (finalPhone) params.set("customerPhone", finalPhone);

      const response = await fetch(`${API}/bookings/lookup?${params.toString()}`);
      const result = await response.json();
      if (response.ok && result) {
        setBooking(result);
        if (result.status === "PENDING" && typeof result.expiresInSeconds === "number") {
          setCountdown(result.expiresInSeconds);
        } else {
          setCountdown(0);
        }
        setBusy(false);
        return;
      } else if (result?.message) {
        setError(result.message);
      }
    } catch {
      // Fallback: check localStorage tickets
    }

    const foundInLocal = recentBookings.find(
      (b) =>
        (finalCode && b.bookingCode.toUpperCase() === finalCode.toUpperCase()) ||
        (finalPhone && b.customerPhone.trim() === finalPhone),
    );

    if (foundInLocal) {
      const createdAtMs = foundInLocal.createdAt ? new Date(foundInLocal.createdAt).getTime() : Date.now();
      const diffMs = Date.now() - createdAtMs;
      const isExpired = diffMs > 30 * 60 * 1000 && foundInLocal.status === "PENDING";
      const remainingSec = Math.max(0, Math.floor((30 * 60 * 1000 - diffMs) / 1000));

      setBooking({
        id: foundInLocal.bookingCode,
        bookingCode: foundInLocal.bookingCode,
        customerName: foundInLocal.customerName,
        customerPhone: foundInLocal.customerPhone,
        bookingDate: foundInLocal.date,
        timeLabel: foundInLocal.timeLabel,
        fieldName: foundInLocal.fieldName || foundInLocal.parentVenueName,
        totalPrice: foundInLocal.totalPrice,
        depositAmount: foundInLocal.depositAmount || Math.max(100000, Math.round(Number(foundInLocal.totalPrice) * 0.3)),
        status: isExpired ? "CANCELLED" : (foundInLocal.status || "PENDING"),
        cancelReason: isExpired ? "Đã quá hạn 30 phút chuyển cọc" : (foundInLocal.cancelReason || null),
        createdAt: foundInLocal.createdAt,
      });

      if (!isExpired && foundInLocal.status === "PENDING") {
        setCountdown(remainingSec);
      }
    } else {
      setError("Không tìm thấy phiếu đặt sân với mã hoặc số điện thoại này.");
    }

    setBusy(false);
  }

  async function handleConfirmCancel() {
    if (!booking) return;
    setBusy(true);
    setError("");

    try {
      const response = await fetch(`${API}/bookings/${booking.id}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerPhone: booking.customerPhone,
          cancelReason: cancelReason.trim() || "Khách yêu cầu hủy đơn qua trang tra cứu",
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message ?? "Không thể hủy phiếu đặt sân lúc này.");
      }
      setBooking(result);
      setNotice("Phiếu đặt sân đã được hủy thành công theo chính sách.");
    } catch {
      const updated = {
        ...booking,
        status: "CANCELLED" as const,
        cancelReason: cancelReason.trim() || "Khách yêu cầu hủy qua trang tra cứu",
      };
      setBooking(updated);

      const updatedList = recentBookings.map((b) =>
        b.bookingCode === booking.bookingCode ? { ...b, status: "CANCELLED", cancelReason: updated.cancelReason } : b,
      );
      setRecentBookings(updatedList);
      window.localStorage.setItem("my-bookings", JSON.stringify(updatedList));

      setNotice("Phiếu đặt sân đã được hủy thành công.");
    } finally {
      setBusy(false);
      setCancelModal(false);
    }
  }

  const fieldName =
    booking?.field?.name ?? booking?.fieldName ?? booking?.pitch?.name ?? "Sân bóng Buôn Ma Thuột";
  const slotLabel = booking?.timeSlot?.label ?? booking?.timeLabel ?? "";
  const dateStr = booking?.startAt
    ? booking.startAt.slice(0, 10)
    : booking?.bookingDate
    ? booking.bookingDate.slice(0, 10)
    : "";

  const depositAmount = booking?.depositAmount ?? Math.max(100000, Math.round(Number(booking?.totalPrice || 250000) * 0.3));
  const qrUrl = booking?.qrUrl ?? (booking ? `https://img.vietqr.io/image/970422-02304200699999-compact2.png?amount=${depositAmount}&addInfo=${encodeURIComponent(booking.bookingCode)}&accountName=LE%20DUY%20TAI` : "");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Topbar */}
      <header className="topbar-wrapper">
        <div className="topbar">
          <a className="brand" href="/">
            <div className="brand-icon">⚽</div>
            <div>SÂN<span>NHÀ</span> <small style={{ fontSize: "11px", color: "#64748b", fontWeight: "700" }}>BUÔN MA THUỘT</small></div>
          </a>

          <nav className="nav-links">
            <a href="/">← Về trang chủ đặt sân</a>
            <a href="/cv" style={{ color: "#16a34a", fontWeight: "700" }}>👨‍💻 CV Lê Duy Tài</a>
            <a className="btn-nav-admin" href="/admin">⚙️ Cổng Quản trị ↗</a>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: "860px", margin: "40px auto 80px", padding: "0 20px", width: "100%" }}>
        <div style={{ marginBottom: "28px" }}>
          <span className="section-tag">TRA CỨU &amp; MỞ LẠI MÃ QR THANH TOÁN (UI-06)</span>
          <h1 style={{ fontSize: "32px", margin: "6px 0 10px" }}>Tra cứu vé đặt sân &amp; QR Chuyển cọc</h1>
          <p style={{ color: "#64748b", margin: 0 }}>
            Nếu bạn lỡ thoát trang đặt sân, hãy nhập Mã đơn hoặc Số điện thoại để mở lại mã QR thanh toán trước khi hết 30 phút.
          </p>
        </div>

        {/* Quick select from recent tickets */}
        {recentBookings.length > 0 && (
          <div style={{ background: "#f8fafc", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px 20px", marginBottom: "24px" }}>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "10px" }}>
              ⚡ CÁC PHIẾU ĐẶT GẦN ĐÂY CỦA BẠN:
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {recentBookings.slice(0, 3).map((item) => (
                <button
                  key={item.bookingCode}
                  type="button"
                  className="quick-day-btn"
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                  onClick={() => {
                    setBookingCode(item.bookingCode);
                    setCustomerPhone(item.customerPhone || "");
                    void lookup(undefined, item.bookingCode, item.customerPhone || "");
                  }}
                >
                  <strong style={{ color: "#16a34a" }}>{item.bookingCode}</strong>
                  <span>({item.fieldName || item.parentVenueName} - {item.date})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Lookup form */}
        <div style={{ background: "#ffffff", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px", boxShadow: "var(--shadow-sm)" }}>
          <form onSubmit={(e) => lookup(e)} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "16px", alignItems: "flex-end" }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Mã phiếu đặt sân (booking code)</label>
              <input
                value={bookingCode}
                onChange={(e) => setBookingCode(e.target.value)}
                placeholder="Ví dụ: SAN-..."
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label>Số điện thoại liên hệ</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Ví dụ: 0896890399"
              />
            </div>

            <button type="submit" className="primary-button" style={{ height: "44px" }} disabled={busy}>
              {busy ? "Đang tra..." : "Tra cứu vé <span>→</span>"}
            </button>
          </form>

          {error && (
            <div style={{ marginTop: "20px", background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "12px 16px", borderRadius: "8px", fontSize: "13px" }}>
              <strong>Lỗi:</strong> {error}
            </div>
          )}

          {notice && (
            <div style={{ marginTop: "20px", background: "#f0fdf4", border: "1px solid #86efac", color: "#166534", padding: "12px 16px", borderRadius: "8px", fontSize: "13px" }}>
              <strong>✓ Thông báo:</strong> {notice}
            </div>
          )}
        </div>

        {/* E-Ticket Display */}
        {booking && (
          <article className="e-ticket-card" style={{ marginTop: "28px" }}>
            <div className="e-ticket-header">
              <div>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>
                  PHIẾU ĐẶT SÂN BÓNG ĐÁ ĐIỆN TỬ
                </span>
                <div className="e-ticket-code">{booking.bookingCode}</div>
              </div>

              {/* Status pill */}
              <span
                className={`badge-status ${
                  booking.status === "COMPLETED"
                    ? "badge-completed"
                    : booking.status === "CONFIRMED"
                    ? "badge-confirmed"
                    : booking.status === "PENDING"
                    ? "badge-pending"
                    : "badge-cancelled"
                }`}
                style={{ fontSize: "13px", padding: "6px 14px" }}
              >
                {booking.status === "PENDING"
                  ? "⏳ Chờ chuyển cọc (PENDING)"
                  : booking.status === "CONFIRMED"
                  ? "✓ Đã nhận cọc & Xác nhận"
                  : booking.status === "COMPLETED"
                  ? "★ Đã hoàn thành (COMPLETED)"
                  : "✕ Đã hủy (CANCELLED)"}
              </span>
            </div>

            <div className="e-ticket-body">
              <div className="ticket-field">
                <span>Khách hàng đặt sân</span>
                <strong>{booking.customerName}</strong>
              </div>

              <div className="ticket-field">
                <span>Số điện thoại</span>
                <strong>{booking.customerPhone}</strong>
              </div>

              <div className="ticket-field">
                <span>Cụm sân thi đấu</span>
                <strong style={{ color: "#16a34a" }}>{fieldName}</strong>
              </div>

              <div className="ticket-field">
                <span>Ca thi đấu (1.5 tiếng)</span>
                <strong>{slotLabel} {dateStr ? `· Ngày ${dateStr}` : ""}</strong>
              </div>

              <div className="ticket-field">
                <span>Tổng giá thuê trọn gói</span>
                <strong style={{ color: "#b45309", fontSize: "18px" }}>{money(booking.totalPrice)}</strong>
              </div>

              <div className="ticket-field">
                <span>Tiền cọc giữ sân (30%)</span>
                <strong style={{ color: "#16a34a", fontSize: "18px" }}>{money(depositAmount)}</strong>
              </div>
            </div>

            {/* 30-Minute VietQR Box for PENDING */}
            {booking.status === "PENDING" && (
              <div style={{ margin: "0 28px 24px", background: "#f8fafc", border: "2px dashed #16a34a", borderRadius: "14px", padding: "20px" }}>
                {countdown > 0 ? (
                  <>
                    <div style={{
                      background: "rgba(234, 88, 12, 0.12)",
                      border: "1px solid #fdba74",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      textAlign: "center",
                      marginBottom: "16px"
                    }}>
                      <div style={{ fontSize: "16px", fontWeight: "900", color: "#c2410c" }}>
                        ⏳ MÃ QR CÒN HIỆU LỰC: {Math.floor(countdown / 60).toString().padStart(2, "0")}:{(countdown % 60).toString().padStart(2, "0")}
                      </div>
                      <div style={{ fontSize: "12px", color: "#7c2d12", marginTop: "4px" }}>
                        Vui lòng hoàn tất chuyển khoản cọc <strong>{money(depositAmount)}</strong> trước khi đồng hồ đếm về 0:00.
                      </div>
                    </div>

                    <div style={{ textAlign: "center", marginBottom: "16px" }}>
                      <img
                        src={qrUrl}
                        alt="Mã VietQR thanh toán cọc"
                        style={{ width: "220px", height: "220px", display: "block", margin: "0 auto", borderRadius: "10px", border: "1px solid #cbd5e1" }}
                      />
                    </div>

                    <div style={{ background: "#ffffff", padding: "14px 18px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", lineHeight: "1.7", color: "#334155" }}>
                      <div>Ngân hàng: <strong>MB Bank (Napas 247)</strong></div>
                      <div>Số tài khoản: <strong style={{ color: "#16a34a", fontSize: "14px" }}>02304200699999</strong></div>
                      <div>Chủ tài khoản: <strong>LE DUY TAI</strong></div>
                      <div>Số tiền cọc: <strong style={{ color: "#b45309" }}>{money(depositAmount)}</strong></div>
                      <div>Nội dung CK: <strong style={{ color: "#16a34a", fontSize: "15px" }}>{booking.bookingCode}</strong></div>
                      <div style={{ borderTop: "1px dashed #cbd5e1", marginTop: "6px", paddingTop: "6px", fontSize: "12px", color: "#64748b" }}>
                        📞 Hotline hỗ trợ: <strong>0896890399</strong> · 📍 Ea Kao, Buôn Ma Thuột
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", padding: "14px", borderRadius: "8px", textAlign: "center", color: "#991b1b" }}>
                    <div style={{ fontSize: "15px", fontWeight: "800" }}>❌ MÃ QR ĐÃ HẾT HẠN HIỆU LỰC (QUÁ 30 PHÚT)</div>
                    <p style={{ margin: "6px 0 0", fontSize: "13px" }}>
                      Đơn giữ chỗ đã tự động bị hủy do quá thời hạn 30 phút chuyển khoản cọc. Ca sân đã được nhường cho đội khác. Vui lòng quay lại trang chủ để đặt lại lịch mới!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Cancel notice if cancelled */}
            {booking.status === "CANCELLED" && (
              <div style={{ margin: "0 28px 20px", background: "#fef2f2", padding: "14px 18px", borderRadius: "8px", border: "1px solid #fecaca", fontSize: "13px", color: "#991b1b" }}>
                <strong>Lý do hủy đơn:</strong> {booking.cancelReason || "Quá hạn 30 phút thanh toán tiền cọc hoặc quản trị viên hủy."}
              </div>
            )}

            {/* Confirmed info */}
            {booking.status === "CONFIRMED" && (
              <div style={{ margin: "0 28px 24px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "16px" }}>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "#166534", marginBottom: "6px" }}>
                  ✓ ĐÃ NHẬN TIỀN CỌC &amp; GIỮ SÂN THÀNH CÔNG!
                </div>
                <div style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6" }}>
                  Chủ sân đã chuẩn bị sẵn sàng mặt cỏ và bật dàn đèn chiếu sáng. Quý khách vui lòng đến trước giờ thi đấu 10-15 phút để khởi động và hoàn tất số tiền còn lại tại quầy.
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div style={{ padding: "18px 28px", background: "#f8fafc", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                * Hỗ trợ kỹ thuật &amp; giải đáp: <strong>0896890399</strong> (Lê Duy Tài)
              </span>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="outline-button"
                  style={{ color: "#0284c7", borderColor: "#bae6fd" }}
                  onClick={() => window.print()}
                >
                  🖨️ In Vé / Lưu PDF
                </button>
                {["PENDING", "CONFIRMED"].includes(booking.status) && (
                  <button
                    type="button"
                    className="outline-button"
                    style={{ color: "#ef4444", borderColor: "#fca5a5" }}
                    onClick={() => setCancelModal(true)}
                  >
                    Yêu cầu hủy phiếu đặt này
                  </button>
                )}
              </div>
            </div>
          </article>
        )}

        {/* Cancel Confirmation Modal */}
        {cancelModal && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: "460px" }}>
              <div className="modal-header">
                <h3>Xác nhận hủy phiếu đặt sân</h3>
                <button className="modal-close-btn" onClick={() => setCancelModal(false)}>✕</button>
              </div>

              <div className="modal-body">
                <p style={{ fontSize: "13px", color: "#475569", margin: "0 0 16px" }}>
                  Bạn có chắc chắn muốn hủy đơn đặt sân <strong>{booking?.bookingCode}</strong>? Ca thi đấu sẽ được giải phóng ngay lập tức cho các đội khác.
                </p>

                <div className="form-group">
                  <label>Lý do hủy đơn:</label>
                  <textarea
                    rows={3}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Ví dụ: Bận đột xuất, trời mưa lớn, đổi giờ đá..."
                  />
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                  <button
                    type="button"
                    className="primary-button"
                    style={{ background: "#dc2626", flex: 1 }}
                    onClick={handleConfirmCancel}
                    disabled={busy}
                  >
                    {busy ? "Đang xử lý..." : "Xác nhận hủy phiếu"}
                  </button>
                  <button
                    type="button"
                    className="outline-button"
                    onClick={() => setCancelModal(false)}
                  >
                    Đóng lại
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ marginTop: "auto", borderTop: "1px solid var(--border)", background: "#0f172a", color: "#94a3b8", padding: "28px 20px", textAlign: "center", fontSize: "13px" }}>
        <div>
          Hệ thống Quản lý Sân bóng đá Buôn Ma Thuột · Đồng hành bởi <strong>Lê Duy Tài</strong> (IT24M) &amp; <strong>Kpa Trần Quang Thịnh</strong>
        </div>
        <div style={{ fontSize: "11px", color: "#64748b", marginTop: "6px" }}>
          Neon Cloud PostgreSQL · Wispbyte Hosting · VietQR Napas 247 · Bản quyền © 2026
        </div>
      </footer>
    </div>
  );
}
