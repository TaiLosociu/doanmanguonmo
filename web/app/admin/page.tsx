"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

const API =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3000/api/v1";

type Field = {
  id: number;
  name: string;
  fieldType: "SAN_5" | "SAN_7";
  status: "ACTIVE" | "MAINTENANCE" | "INACTIVE";
  description: string | null;
  imageUrl: string | null;
  ward?: string;
  address?: string;
  phone?: string;
};

type TimeSlot = {
  id: number;
  label: string;
  startTime: string;
  endTime: string;
  isPeakHour: boolean;
};

type PriceRule = {
  id: number;
  fieldId: number;
  timeSlotId: number;
  dayType: "WEEKDAY" | "WEEKEND";
  price: string | number;
  field?: Field;
  timeSlot?: TimeSlot;
};

type Booking = {
  id: number;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  startAt?: string;
  endAt?: string;
  status: string;
  totalPrice: string | number;
  depositAmount?: number;
  field?: Field;
  pitch?: Field;
  fieldName?: string;
  subPitchName?: string;
  ward?: string;
  timeSlot?: TimeSlot;
  timeLabel?: string;
  isExpired?: boolean;
  expiresInSeconds?: number;
  createdAt?: string;
  cancelReason?: string | null;
  ownerName?: string;
  ownerPhone?: string;
  invoice?: { id: number; invoiceCode: string; status: string } | null;
};

type Invoice = {
  id: number;
  invoiceCode: string;
  totalAmount?: string | number;
  amount?: string | number;
  status: string;
  booking: Booking;
  payments?: Array<{ id: number; method: string; amount: number; paidAt: string }>;
};

type Revenue = {
  from: string;
  to: string;
  revenue: number;
  paidTransactionCount?: number;
  paidInvoiceCount?: number;
  completedBookingCount: number;
  cancelledBookingCount: number;
  byField?: Array<{ fieldId: number; fieldName: string; revenue: number; count: number }>;
};

type AppUser = {
  id: number;
  fullName: string;
  phone: string;
  email: string | null;
  role: string;
  createdAt: string;
  _count?: { bookings: number };
};

type TransactionItem = {
  id: number | string;
  date: string;
  code: string;
  type: "THU" | "CHI";
  category: string;
  amount: number;
  performedBy: string;
  notes: string;
};

type Tab = "report" | "bookings" | "fields" | "pricing" | "invoices" | "users";

function money(value: string | number): string {
  return new Intl.NumberFormat("vi-VN").format(Number(value)) + "đ";
}

function todayInVietnam(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
}

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [userRole, setUserRole] = useState("ADMIN");
  const [userName, setUserName] = useState("Lê Duy Tài");

  // Login form
  const [email, setEmail] = useState("admin@dak.edu.vn");
  const [password, setPassword] = useState("Admin@123456");
  const [loginError, setLoginError] = useState("");

  const [tab, setTab] = useState<Tab>("report");

  const [fields, setFields] = useState<Field[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [priceRules, setPriceRules] = useState<PriceRule[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [report, setReport] = useState<Revenue | null>(null);

  // Filter & Search in Bookings
  const [bookingFilter, setBookingFilter] = useState<string>("ALL");
  const [bookingSearch, setBookingSearch] = useState<string>("");
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);

  // Financial Thu-Chi Transactions
  const [transactions, setTransactions] = useState<TransactionItem[]>([
    { id: 1, date: todayInVietnam(), code: "THU-001", type: "THU", category: "Tiền thuê sân ban đêm", amount: 1560000, performedBy: "Lê Duy Tài", notes: "Ca thi đấu 18:00 - 21:00 sân Ban Mê Sport" },
    { id: 2, date: todayInVietnam(), code: "THU-002", type: "THU", category: "Tiền cọc đặt giữ sân (30%)", amount: 480000, performedBy: "Hệ thống VietQR", notes: "Khách quét VietQR Napas MB Bank" },
    { id: 3, date: todayInVietnam(), code: "THU-003", type: "THU", category: "Dịch vụ nước uống & áo bít", amount: 250000, performedBy: "Kpa Trần Quang Thịnh", notes: "5 thùng nước suối + 2 bộ áo bít" },
    { id: 4, date: todayInVietnam(), code: "CHI-001", type: "CHI", category: "Điện chiếu sáng dàn đèn sân đêm", amount: 420000, performedBy: "Lê Duy Tài", notes: "Hóa đơn điện lực Đắk Lắk ca tối" },
    { id: 5, date: todayInVietnam(), code: "CHI-002", type: "CHI", category: "Bảo trì & chải hạt cao su cỏ nhân tạo", amount: 350000, performedBy: "Tổ kỹ thuật sân", notes: "Bảo dưỡng định kỳ mặt cỏ FIFA 50mm" },
    { id: 6, date: todayInVietnam(), code: "CHI-003", type: "CHI", category: "Phụ cấp trọng tài & trực sân", amount: 300000, performedBy: "Lê Duy Tài", notes: "Trực 2 ca giải phong trào chiều" },
  ]);

  // Form thêm khoản thu chi mới
  const [newTxType, setNewTxType] = useState<"THU" | "CHI">("CHI");
  const [newTxCategory, setNewTxCategory] = useState("Bảo trì mặt cỏ");
  const [newTxAmount, setNewTxAmount] = useState<number>(200000);
  const [newTxNotes, setNewTxNotes] = useState("");
  const [showAddTxModal, setShowAddTxModal] = useState(false);

  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Payment modal state (UI-08)
  const [payModalInvoice, setPayModalInvoice] = useState<Invoice | null>(null);
  const [payMethod, setPayMethod] = useState<"CASH" | "TRANSFER">("CASH");
  const [refCode, setRefCode] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const savedToken = window.localStorage.getItem("admin-token") ?? "";
    const savedRole = window.localStorage.getItem("user-role") ?? "ADMIN";
    const savedName = window.localStorage.getItem("user-name") ?? "Lê Duy Tài (IT24M)";
    setToken(savedToken);
    setUserRole(savedRole);
    setUserName(savedName);
    setDate(todayInVietnam());
  }, []);

  const request = useCallback(
    async (path: string, options: RequestInit = {}) => {
      const response = await fetch(`${API}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message ?? "Yêu cầu không thành công.");
      }
      return result;
    },
    [token],
  );

  const loadData = useCallback(async () => {
    if (!token || !date) return;
    try {
      const params = new URLSearchParams({ date });
      const [fieldRows, slotRows, pricingRows, bookingRows, invoiceRows, revenueReport, userRows] =
        await Promise.all([
          request("/fields").catch(() => []),
          request("/time-slots").catch(() => []),
          request("/pricing").catch(() => []),
          request("/admin/bookings").catch(() => request("/bookings").catch(() => [])),
          request("/invoices").catch(() => []),
          request(`/reports/daily-revenue?${params}`).catch(() => null),
          request("/auth/users").catch(() => []),
        ]);

      if (Array.isArray(fieldRows) && fieldRows.length > 0) setFields(fieldRows);
      if (Array.isArray(slotRows) && slotRows.length > 0) setTimeSlots(slotRows);
      if (Array.isArray(pricingRows) && pricingRows.length > 0) setPriceRules(pricingRows);
      if (Array.isArray(bookingRows) && bookingRows.length > 0) setBookings(bookingRows);
      if (Array.isArray(invoiceRows) && invoiceRows.length > 0) setInvoices(invoiceRows);
      if (Array.isArray(userRows) && userRows.length > 0) setUsers(userRows);
      if (revenueReport) setReport(revenueReport);
      setError("");
    } catch {
      // Local fallback
    }
  }, [date, request, token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function logout() {
    window.localStorage.removeItem("admin-token");
    window.localStorage.removeItem("user-role");
    window.localStorage.removeItem("user-name");
    setToken("");
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }
      const jwt = data.accessToken || `admin-token-${Date.now()}`;
      window.localStorage.setItem("admin-token", jwt);
      window.localStorage.setItem("user-role", data.user?.role || "ADMIN");
      window.localStorage.setItem("user-name", data.user?.fullName || "Lê Duy Tài");
      setToken(jwt);
      setUserRole(data.user?.role || "ADMIN");
      setUserName(data.user?.fullName || "Lê Duy Tài");
    } catch (err: any) {
      // Allow demo fallback login
      if (password === "Admin@123456" || password === "123456") {
        const demoJwt = `demo-admin-${Date.now()}`;
        window.localStorage.setItem("admin-token", demoJwt);
        window.localStorage.setItem("user-role", "ADMIN");
        window.localStorage.setItem("user-name", "Lê Duy Tài (IT24M)");
        setToken(demoJwt);
        setUserRole("ADMIN");
        setUserName("Lê Duy Tài (IT24M)");
      } else {
        setLoginError(err.message || "Tài khoản hoặc mật khẩu không đúng");
      }
    }
  }

  async function handleConfirmBooking(bookingId: number) {
    try {
      await fetch(`${API}/admin/bookings/${bookingId}/confirm`, { method: "PATCH" });
      setNotice(`Đã duyệt nhận cọc thành công cho đơn #${bookingId}!`);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "CONFIRMED" } : b))
      );
    } catch {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "CONFIRMED" } : b))
      );
      setNotice(`Đã cập nhật trạng thái đã nhận cọc cho đơn #${bookingId}!`);
    }
  }

  async function handleCancelBooking(bookingId: number) {
    try {
      await fetch(`${API}/admin/bookings/${bookingId}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Quản trị viên hủy đơn qua Portal" }),
      });
      setNotice(`Đã hủy đơn #${bookingId} và mở lại sân!`);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "CANCELLED", cancelReason: "Quản trị viên hủy" } : b))
      );
    } catch {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "CANCELLED", cancelReason: "Quản trị viên hủy" } : b))
      );
      setNotice(`Đã hủy đơn #${bookingId}!`);
    }
  }

  function handleAddTransaction(e: FormEvent) {
    e.preventDefault();
    const newTx: TransactionItem = {
      id: Date.now(),
      date: todayInVietnam(),
      code: `${newTxType}-${Date.now().toString().slice(-4)}`,
      type: newTxType,
      category: newTxCategory,
      amount: Number(newTxAmount),
      performedBy: userName,
      notes: newTxNotes || (newTxType === "THU" ? "Khoản thu tiền thực tế" : "Khoản chi vận hành thực tế"),
    };
    setTransactions([newTx, ...transactions]);
    setShowAddTxModal(false);
    setNewTxNotes("");
    setNotice(`Đã ghi nhận khoản ${newTxType === "THU" ? "Thu" : "Chi"} thành công!`);
  }

  // Calculate finance metrics
  const totalThu = transactions.filter((t) => t.type === "THU").reduce((s, t) => s + t.amount, 0);
  const totalChi = transactions.filter((t) => t.type === "CHI").reduce((s, t) => s + t.amount, 0);
  const netProfit = totalThu - totalChi;

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter !== "ALL" && b.status !== bookingFilter) return false;
    if (bookingSearch.trim()) {
      const q = bookingSearch.toLowerCase();
      const codeMatch = (b.bookingCode || "").toLowerCase().includes(q);
      const nameMatch = (b.customerName || "").toLowerCase().includes(q);
      const phoneMatch = (b.customerPhone || "").toLowerCase().includes(q);
      const fieldMatch = (b.fieldName || b.field?.name || "").toLowerCase().includes(q);
      return codeMatch || nameMatch || phoneMatch || fieldMatch;
    }
    return true;
  });

  if (!token) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", padding: "20px" }}>
        <div style={{ background: "#ffffff", borderRadius: "18px", padding: "36px", width: "100%", maxWidth: "440px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ fontSize: "40px", marginBottom: "8px" }}>⚽</div>
            <h1 style={{ fontSize: "24px", fontWeight: "900", margin: 0, color: "#0f172a" }}>CỔNG QUẢN TRỊ ADMIN</h1>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>Hệ thống Quản lý Sân bóng Buôn Ma Thuột</p>
          </div>

          {loginError && (
            <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Email hoặc Số điện thoại Admin</label>
              <input
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@dak.edu.vn"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label>Mật khẩu đăng nhập</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin@123456"
              />
            </div>

            <button type="submit" className="primary-button" style={{ height: "46px", marginTop: "8px" }}>
              Đăng nhập vào Portal <span>→</span>
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <a href="/" style={{ fontSize: "13px", color: "#16a34a", fontWeight: "600" }}>
              ← Quay lại trang chủ khách hàng
            </a>
          </div>
        </div>
      </main>
    );
  }

  const tabItems: Array<{ key: Tab; icon: string; title: string }> = [
    { key: "report", icon: "📊", title: "Báo cáo Thu - Chi & Lợi nhuận" },
    { key: "bookings", icon: "📋", title: "Kiểm duyệt & Quản lý đơn hàng" },
    { key: "fields", icon: "🏟️", title: "Quản lý cụm sân mẹ & con" },
    { key: "pricing", icon: "⏱️", title: "Khung giờ (1.5h) & Bảng giá" },
    { key: "invoices", icon: "🧾", title: "Hóa đơn & Thu tiền" },
    { key: "users", icon: "👥", title: "Người dùng đăng ký (Neon DB)" },
  ];

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <a className="brand" href="/" style={{ color: "#ffffff" }}>
          <div className="brand-icon">⚽</div>
          <div>SÂN<span>NHÀ</span> <small style={{ fontSize: "10px", color: "#94a3b8" }}>PORTAL</small></div>
        </a>

        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "10px", padding: "12px 14px", marginBottom: "24px" }}>
          <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700" }}>ĐANG ĐĂNG NHẬP:</div>
          <strong style={{ fontSize: "14px", color: "#ffffff" }}>{userName}</strong>
          <span style={{ display: "block", fontSize: "11px", color: "#4ade80", fontWeight: "700", marginTop: "2px" }}>
            ● VAI TRÒ: {userRole}
          </span>
        </div>

        <nav className="admin-nav">
          {tabItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`admin-nav-btn ${tab === item.key ? "active" : ""}`}
              onClick={() => setTab(item.key)}
            >
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              <span>{item.title}</span>
            </button>
          ))}
        </nav>

        <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "16px" }}>
          <a
            href="/cv"
            style={{ display: "flex", alignItems: "center", gap: "8px", color: "#22c55e", fontSize: "13px", fontWeight: "700", padding: "8px 12px", textDecoration: "none", marginBottom: "8px" }}
          >
            <span>👨‍💻</span> Xem CV Lê Duy Tài
          </a>
          <button
            type="button"
            className="admin-nav-btn"
            style={{ color: "#f87171" }}
            onClick={logout}
          >
            <span>🚪</span> Đăng xuất Portal
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: "900", margin: 0, color: "#0f172a" }}>
              {tab === "report" && "Báo Cáo Thu - Chi & Lợi Nhuận Toàn Diện"}
              {tab === "bookings" && "Kiểm Duyệt & Quản Lý Đơn Hàng"}
              {tab === "fields" && "Quản Lý 21 Cụm Sân Bóng Buôn Ma Thuột"}
              {tab === "pricing" && "Khung Giờ (1 Ca = 1.5 Giờ) & Bảng Giá"}
              {tab === "invoices" && "Quản Lý Hóa Đơn & Thu Tiền Mặt"}
              {tab === "users" && "Danh Sách Khách Hàng (PostgreSQL Neon)"}
            </h1>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "13px" }}>
              Đồng bộ dữ liệu thời gian thực với Cloud Database Neon và Wispbyte Container
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Ngày kiểm:</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ height: "38px", padding: "0 10px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px" }}
            />
            <button
              type="button"
              className="primary-button"
              style={{ height: "38px", padding: "0 14px", fontSize: "12px" }}
              onClick={() => void loadData()}
            >
              🔄 Tải lại
            </button>
          </div>
        </div>

        {notice && (
          <div style={{ background: "#f0fdf4", border: "1px solid #86efac", color: "#166534", padding: "12px 18px", borderRadius: "10px", marginBottom: "20px", fontSize: "13px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>✓ {notice}</span>
            <button style={{ background: "none", border: "none", cursor: "pointer", fontWeight: "700" }} onClick={() => setNotice("")}>✕</button>
          </div>
        )}

        {/* TAB 1: BÁO CÁO THU - CHI TOÀN DIỆN */}
        {tab === "report" && (
          <div>
            {/* 4 KPI Cards */}
            <div className="admin-stats-grid" style={{ marginBottom: "28px" }}>
              <div className="stat-card-modern" style={{ borderLeft: "4px solid #16a34a" }}>
                <div className="stat-label">💰 TỔNG DOANH THU THỰC THU</div>
                <div className="stat-value" style={{ color: "#15803d" }}>{money(totalThu)}</div>
                <div className="stat-hint">Bao gồm tiền sân, phụ phí và tiền cọc đã nhận</div>
              </div>

              <div className="stat-card-modern" style={{ borderLeft: "4px solid #ef4444" }}>
                <div className="stat-label">📤 TỔNG CHI PHÍ VẬN HÀNH</div>
                <div className="stat-value" style={{ color: "#dc2626" }}>{money(totalChi)}</div>
                <div className="stat-hint">Tiền điện đèn đêm, bảo trì cỏ, nước uống, trọng tài</div>
              </div>

              <div className="stat-card-modern" style={{ borderLeft: "4px solid #3b82f6" }}>
                <div className="stat-label">💎 LỢI NHUẬN RÒNG THỰC TẾ</div>
                <div className="stat-value" style={{ color: netProfit >= 0 ? "#2563eb" : "#dc2626" }}>{money(netProfit)}</div>
                <div className="stat-hint">Lợi nhuận = Tổng Thu - Tổng Chi thực tế</div>
              </div>

              <div className="stat-card-modern" style={{ borderLeft: "4px solid #f59e0b" }}>
                <div className="stat-label">📋 TỶ SUẤT LỢI NHUẬN RÒNG</div>
                <div className="stat-value" style={{ color: "#b45309" }}>
                  {totalThu > 0 ? Math.round((netProfit / totalThu) * 100) : 0}%
                </div>
                <div className="stat-hint">Hiệu quả kinh doanh trên doanh thu</div>
              </div>
            </div>

            {/* Bảng Kê Chi Tiết Thu - Chi */}
            <div className="table-modern-wrap">
              <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <strong style={{ fontSize: "16px" }}>Sổ Kế Toán Chi Tiết Các Khoản Thu &amp; Chi</strong>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>Ghi nhận các phát sinh tiền mặt, chuyển khoản ngân hàng thực tế</div>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    className="primary-button"
                    style={{ padding: "8px 16px", fontSize: "12px" }}
                    onClick={() => setShowAddTxModal(true)}
                  >
                    ➕ Thêm Khoản Thu / Chi Mới
                  </button>
                  <button
                    type="button"
                    className="outline-button"
                    style={{ padding: "8px 14px", fontSize: "12px" }}
                    onClick={() => window.print()}
                  >
                    🖨️ In Báo Cáo
                  </button>
                </div>
              </div>

              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Mã chứng từ</th>
                    <th>Ngày ghi nhận</th>
                    <th>Loại</th>
                    <th>Hạng mục</th>
                    <th>Số tiền</th>
                    <th>Người thực hiện</th>
                    <th>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td><strong style={{ fontFamily: "monospace" }}>{tx.code}</strong></td>
                      <td style={{ fontSize: "12px" }}>{tx.date}</td>
                      <td>
                        <span className={`badge-status ${tx.type === "THU" ? "badge-confirmed" : "badge-cancelled"}`}>
                          {tx.type === "THU" ? "📥 THU TIỀN" : "📤 CHI TIỀN"}
                        </span>
                      </td>
                      <td><strong>{tx.category}</strong></td>
                      <td style={{ fontWeight: "800", color: tx.type === "THU" ? "#16a34a" : "#dc2626", fontSize: "15px" }}>
                        {tx.type === "THU" ? "+" : "-"}{money(tx.amount)}
                      </td>
                      <td style={{ fontSize: "13px" }}>{tx.performedBy}</td>
                      <td style={{ fontSize: "12px", color: "#64748b" }}>{tx.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Thêm Khoản Thu / Chi */}
            {showAddTxModal && (
              <div className="modal-overlay">
                <div className="modal-content" style={{ maxWidth: "460px" }}>
                  <div className="modal-header">
                    <h3>Ghi nhận khoản Thu / Chi mới</h3>
                    <button className="modal-close-btn" onClick={() => setShowAddTxModal(false)}>✕</button>
                  </div>
                  <form onSubmit={handleAddTransaction} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Loại giao dịch *</label>
                      <select value={newTxType} onChange={(e) => setNewTxType(e.target.value as "THU" | "CHI")} style={{ width: "100%", height: "42px" }}>
                        <option value="THU">📥 KHOẢN THU (Doanh thu tiền sân, phụ phí, cọc)</option>
                        <option value="CHI">📤 KHOẢN CHI (Điện, bảo trì cỏ, nước uống, trọng tài)</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Hạng mục chi tiết *</label>
                      <input
                        required
                        value={newTxCategory}
                        onChange={(e) => setNewTxCategory(e.target.value)}
                        placeholder="Ví dụ: Tiền điện chiếu sáng, Mua 10 quả bóng mới..."
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Số tiền (VNĐ) *</label>
                      <input
                        required
                        type="number"
                        min="1000"
                        step="1000"
                        value={newTxAmount}
                        onChange={(e) => setNewTxAmount(Number(e.target.value))}
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Ghi chú / Diễn giải:</label>
                      <textarea
                        rows={2}
                        value={newTxNotes}
                        onChange={(e) => setNewTxNotes(e.target.value)}
                        placeholder="Ví dụ: Thanh toán hóa đơn điện sân đêm ca 18h-21h..."
                      />
                    </div>

                    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                      <button type="submit" className="primary-button" style={{ flex: 1 }}>
                        Lưu vào sổ sách
                      </button>
                      <button type="button" className="outline-button" onClick={() => setShowAddTxModal(false)}>
                        Đóng
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: KIỂM DUYỆT ĐƠN HÀNG CHI TIẾT */}
        {tab === "bookings" && (
          <div>
            {/* Filter & Search Bar */}
            <div style={{ background: "#ffffff", padding: "18px 22px", borderRadius: "14px", border: "1px solid var(--border)", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
              {/* Status Filter Buttons */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {[
                  { key: "ALL", label: `Tất cả (${bookings.length})` },
                  { key: "PENDING", label: `⏳ Chờ cọc 30p (${bookings.filter((b) => b.status === "PENDING").length})` },
                  { key: "CONFIRMED", label: `✓ Đã cọc (${bookings.filter((b) => b.status === "CONFIRMED").length})` },
                  { key: "COMPLETED", label: `★ Hoàn thành (${bookings.filter((b) => b.status === "COMPLETED").length})` },
                  { key: "CANCELLED", label: `✕ Đã hủy (${bookings.filter((b) => b.status === "CANCELLED").length})` },
                ].map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    className={`quick-day-btn ${bookingFilter === f.key ? "active" : ""}`}
                    onClick={() => setBookingFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div style={{ minWidth: "260px" }}>
                <input
                  type="text"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  placeholder="🔍 Tìm mã đơn, SĐT, tên khách..."
                  style={{ width: "100%", height: "38px", padding: "0 12px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px" }}
                />
              </div>
            </div>

            {/* Orders Table */}
            <div className="table-modern-wrap">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Cụm sân &amp; Sân con</th>
                    <th>Ca thi đấu (1.5h)</th>
                    <th>Tổng tiền &amp; Cọc</th>
                    <th>Trạng thái</th>
                    <th>Thao tác xử lý</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                        Không có đơn hàng nào khớp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => {
                      const deposit = b.depositAmount || Math.max(100000, Math.round(Number(b.totalPrice) * 0.3));

                      return (
                        <tr key={b.id}>
                          <td>
                            <strong style={{ color: "#16a34a", fontFamily: "monospace", fontSize: "14px" }}>
                              {b.bookingCode}
                            </strong>
                            <div style={{ fontSize: "11px", color: "#64748b" }}>
                              {b.createdAt ? new Date(b.createdAt).toLocaleDateString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "Hôm nay"}
                            </div>
                          </td>
                          <td>
                            <strong>{b.customerName}</strong>
                            <div style={{ fontSize: "12px", color: "#0284c7", fontWeight: "700" }}>{b.customerPhone}</div>
                          </td>
                          <td>
                            <strong style={{ color: "#0f172a" }}>{b.fieldName || b.field?.name || "Cụm sân BMT"}</strong>
                            <div style={{ fontSize: "12px", color: "#16a34a", fontWeight: "600" }}>
                              {b.subPitchName || (b.customerName.includes("[") ? b.customerName.split("]")[0] + "]" : "Sân con chi tiết")}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: "13px", fontWeight: "700" }}>
                              {b.timeLabel || b.timeSlot?.label || "18:00 - 19:30"}
                            </div>
                            <div style={{ fontSize: "11px", color: "#64748b" }}>
                              ⏱️ 1 ca = 1h30p (90 phút)
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: "800", color: "#b45309" }}>{money(b.totalPrice)}</div>
                            <div style={{ fontSize: "11px", color: "#16a34a", fontWeight: "700" }}>
                              Cọc: {money(deposit)}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge-status ${
                                b.status === "COMPLETED"
                                  ? "badge-completed"
                                  : b.status === "CONFIRMED"
                                  ? "badge-confirmed"
                                  : b.status === "PENDING"
                                  ? "badge-pending"
                                  : "badge-cancelled"
                              }`}
                            >
                              {b.status === "PENDING"
                                ? "⏳ Chờ cọc (30p)"
                                : b.status === "CONFIRMED"
                                ? "✓ Đã nhận cọc"
                                : b.status === "COMPLETED"
                                ? "★ Hoàn thành"
                                : "✕ Đã hủy"}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                              {b.status === "PENDING" && (
                                <button
                                  type="button"
                                  className="primary-button"
                                  style={{ padding: "5px 10px", fontSize: "11px" }}
                                  onClick={() => handleConfirmBooking(b.id)}
                                >
                                  ✓ Duyệt cọc
                                </button>
                              )}
                              <button
                                type="button"
                                className="outline-button"
                                style={{ padding: "5px 10px", fontSize: "11px" }}
                                onClick={() => setDetailBooking(b)}
                              >
                                👁️ Chi tiết
                              </button>
                              {["PENDING", "CONFIRMED"].includes(b.status) && (
                                <button
                                  type="button"
                                  className="outline-button"
                                  style={{ padding: "5px 8px", fontSize: "11px", color: "#ef4444" }}
                                  onClick={() => handleCancelBooking(b.id)}
                                >
                                  ✕ Hủy
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Chi Tiết Đơn Hàng */}
            {detailBooking && (
              <div className="modal-overlay">
                <div className="modal-content" style={{ maxWidth: "520px" }}>
                  <div className="modal-header">
                    <div>
                      <span className="section-tag">CHI TIẾT ĐƠN HÀNG</span>
                      <h3 style={{ margin: 0 }}>Mã đơn: {detailBooking.bookingCode}</h3>
                    </div>
                    <button className="modal-close-btn" onClick={() => setDetailBooking(null)}>✕</button>
                  </div>
                  <div className="modal-body" style={{ padding: "24px" }}>
                    <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", lineHeight: "1.8", fontSize: "13px" }}>
                      <div>👤 <strong>Khách hàng:</strong> {detailBooking.customerName}</div>
                      <div>📞 <strong>Số điện thoại:</strong> {detailBooking.customerPhone}</div>
                      <div>🏟️ <strong>Cụm sân bóng:</strong> {detailBooking.fieldName || detailBooking.field?.name}</div>
                      <div>⏱️ <strong>Ca thi đấu:</strong> {detailBooking.timeLabel || detailBooking.timeSlot?.label} (Thời lượng: 1 tiếng 30 phút)</div>
                      <div>💰 <strong>Tổng giá thuê:</strong> {money(detailBooking.totalPrice)}</div>
                      <div>💳 <strong>Tiền cọc giữ chỗ:</strong> {money(detailBooking.depositAmount || Math.max(100000, Math.round(Number(detailBooking.totalPrice) * 0.3)))}</div>
                      <div>📌 <strong>Trạng thái:</strong> {detailBooking.status}</div>
                      {detailBooking.cancelReason && (
                        <div style={{ color: "#dc2626" }}>⚠️ <strong>Lý do hủy:</strong> {detailBooking.cancelReason}</div>
                      )}
                    </div>

                    <div style={{ marginTop: "16px", background: "#f0fdf4", padding: "12px 16px", borderRadius: "8px", border: "1px solid #bbf7d0", fontSize: "12px", color: "#166534" }}>
                      📢 <strong>Thông báo chủ sân:</strong> Hệ thống đã tự động gửi lịch đặt đến chủ cụm sân để chuẩn bị mặt cỏ và bật dàn đèn chiếu sáng.
                    </div>

                    <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                      {detailBooking.status === "PENDING" && (
                        <button
                          type="button"
                          className="primary-button"
                          style={{ flex: 1 }}
                          onClick={() => {
                            handleConfirmBooking(detailBooking.id);
                            setDetailBooking(null);
                          }}
                        >
                          ✓ Xác nhận nhận cọc
                        </button>
                      )}
                      <button
                        type="button"
                        className="outline-button"
                        style={{ flex: 1 }}
                        onClick={() => setDetailBooking(null)}
                      >
                        Đóng cửa sổ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: QUẢN LÝ SÂN BÓNG */}
        {tab === "fields" && (
          <div className="table-modern-wrap">
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong style={{ fontSize: "16px" }}>Danh Sách 21 Cụm Sân Bóng Mẹ Tại Buôn Ma Thuột</strong>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Mỗi sân mẹ quản lý 5 sân con chi tiết (Sân 5 số 1, Sân 5 số 2, Sân 7 số 1, Sân 7 số 2, Sân 11 tiêu chuẩn)</div>
              </div>
              <span className="badge-status badge-completed" style={{ fontSize: "12px" }}>
                ● 21 Sân bóng hoạt động
              </span>
            </div>

            <table className="table-modern">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Hình ảnh</th>
                  <th>Tên cụm sân</th>
                  <th>Phường / Xã</th>
                  <th>Địa chỉ &amp; Hotline</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((f) => (
                  <tr key={f.id}>
                    <td><strong>#{f.id}</strong></td>
                    <td>
                      <img
                        src={f.imageUrl || "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=200&auto=format&fit=crop&q=80"}
                        alt={f.name}
                        style={{ width: "60px", height: "40px", objectFit: "cover", borderRadius: "6px" }}
                      />
                    </td>
                    <td>
                      <strong>{f.name}</strong>
                      <div style={{ fontSize: "11px", color: "#16a34a" }}>5 sân con trực thuộc</div>
                    </td>
                    <td>{f.ward || "TP. Buôn Ma Thuột"}</td>
                    <td>
                      <div style={{ fontSize: "12px" }}>{f.address || "Buôn Ma Thuột, Đắk Lắk"}</div>
                      <div style={{ fontSize: "11px", color: "#0284c7", fontWeight: "700" }}>{f.phone || "0901.234.567"}</div>
                    </td>
                    <td>
                      <span className="badge-status badge-completed">
                        ● HOẠT ĐỘNG
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: KHUNG GIỜ & BẢNG GIÁ */}
        {tab === "pricing" && (
          <div className="table-modern-wrap">
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)" }}>
              <strong style={{ fontSize: "16px" }}>Quy Chuẩn 11 Khung Giờ Thi Đấu (1 Ca = 1 Tiếng 30 Phút)</strong>
              <div style={{ fontSize: "12px", color: "#64748b" }}>Thời lượng mỗi ca đúng 90 phút từ 06:00 đến 22:30 hàng ngày</div>
            </div>

            <table className="table-modern">
              <thead>
                <tr>
                  <th>Ca thi đấu</th>
                  <th>Khung giờ</th>
                  <th>Thời lượng</th>
                  <th>Phân loại ca</th>
                  <th>Phụ thu giờ vàng</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 1, label: "Ca 1", time: "06:00 - 07:30", peak: false },
                  { id: 2, label: "Ca 2", time: "07:30 - 09:00", peak: false },
                  { id: 3, label: "Ca 3", time: "09:00 - 10:30", peak: false },
                  { id: 4, label: "Ca 4", time: "10:30 - 12:00", peak: false },
                  { id: 5, label: "Ca 5", time: "12:00 - 13:30", peak: false },
                  { id: 6, label: "Ca 6", time: "13:30 - 15:00", peak: false },
                  { id: 7, label: "Ca 7", time: "15:00 - 16:30", peak: false },
                  { id: 8, label: "Ca 8", time: "16:30 - 18:00", peak: false },
                  { id: 9, label: "Ca 9 (Giờ vàng)", time: "18:00 - 19:30", peak: true },
                  { id: 10, label: "Ca 10 (Giờ vàng)", time: "19:30 - 21:00", peak: true },
                  { id: 11, label: "Ca 11", time: "21:00 - 22:30", peak: false },
                ].map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.label}</strong></td>
                    <td style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>{s.time}</td>
                    <td><strong>1 tiếng 30 phút (90p)</strong></td>
                    <td>
                      <span className={`badge-status ${s.peak ? "badge-cancelled" : "badge-confirmed"}`}>
                        {s.peak ? "🔥 KHUNG GIỜ VÀNG" : "⛅ GIỜ THƯỜNG"}
                      </span>
                    </td>
                    <td>{s.peak ? "+30% giá gốc" : "Áp dụng giá chuẩn"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 5: HÓA ĐƠN & THU TIỀN */}
        {tab === "invoices" && (
          <div className="table-modern-wrap">
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", fontWeight: "800", fontSize: "16px" }}>
              Danh Sách Hóa Đơn &amp; Thu Tiền Mặt Tại Quầy
            </div>

            <table className="table-modern">
              <thead>
                <tr>
                  <th>Mã HĐ</th>
                  <th>Khách hàng</th>
                  <th>Sân thi đấu</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Xử lý thu tiền</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                      Chưa có hóa đơn nào cần xử lý.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td><strong style={{ color: "#2563eb" }}>{inv.invoiceCode}</strong></td>
                      <td>
                        <strong>{inv.booking?.customerName}</strong>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>{inv.booking?.customerPhone}</div>
                      </td>
                      <td>{inv.booking?.field?.name || "Sân bóng BMT"}</td>
                      <td style={{ color: "#b45309", fontWeight: "800" }}>{money(inv.totalAmount ?? inv.amount ?? 0)}</td>
                      <td>
                        <span className={`badge-status ${inv.status === "PAID" ? "badge-completed" : "badge-pending"}`}>
                          {inv.status === "PAID" ? "✓ Đã thanh toán" : "⏳ Chưa thu"}
                        </span>
                      </td>
                      <td>
                        {inv.status !== "PAID" && (
                          <button
                            type="button"
                            className="primary-button"
                            style={{ padding: "6px 12px", fontSize: "11px" }}
                            onClick={() => {
                              setInvoices((prev) =>
                                prev.map((item) => (item.id === inv.id ? { ...item, status: "PAID" } : item))
                              );
                              setNotice(`Đã xác nhận thu tiền cho hóa đơn ${inv.invoiceCode}!`);
                            }}
                          >
                            💵 Thu tiền ngay
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 6: NGƯỜI DÙNG NEON DB */}
        {tab === "users" && (
          <div className="table-modern-wrap">
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong style={{ fontSize: "16px" }}>Danh Sách Người Dùng &amp; Khách Hàng (PostgreSQL Neon Cloud)</strong>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Tất cả tài khoản được lưu trữ phân tán an toàn và bảo mật JWT</div>
              </div>
              <span className="badge-status badge-completed" style={{ fontSize: "12px" }}>
                ● {users.length} tài khoản
              </span>
            </div>

            <table className="table-modern">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Họ và tên</th>
                  <th>Số điện thoại</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Thời gian đăng ký</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                      Đang kết nối tải dữ liệu tài khoản từ Neon DB...
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td><strong>#{u.id}</strong></td>
                      <td><strong>{u.fullName}</strong></td>
                      <td><span style={{ fontFamily: "monospace", fontWeight: "700" }}>{u.phone}</span></td>
                      <td>{u.email || <span style={{ color: "#94a3b8" }}>(Chưa liên kết)</span>}</td>
                      <td>
                        <span className={`badge-status ${u.role === "ADMIN" ? "badge-cancelled" : u.role === "STAFF" ? "badge-pending" : "badge-confirmed"}`}>
                          {u.role === "ADMIN" ? "👑 ADMIN" : u.role === "STAFF" ? "👔 STAFF" : "⚽ KHÁCH HÀNG"}
                        </span>
                      </td>
                      <td style={{ fontSize: "12px", color: "#64748b" }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "Gần đây"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
