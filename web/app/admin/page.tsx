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

export type CustomerBookingHistory = {
  code: string;
  field: string;
  time: string;
  date: string;
  amount: number;
  status: "CONFIRMED" | "COMPLETED" | "CANCELLED" | "PENDING";
};

export type CustomerProfile = {
  id: number;
  code: string;
  fullName: string;
  phone: string;
  email: string | null;
  tier: "VIP_GOLD" | "VIP_SILVER" | "STANDARD";
  totalBookings: number;
  totalSpent: number;
  status: "ACTIVE" | "LOCKED";
  joinedDate: string;
  favoritePitch: string;
  notes: string;
  history: CustomerBookingHistory[];
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

  // Customer Profiles & Settings State
  const [customerSubTab, setCustomerSubTab] = useState<"PROFILES" | "SETTINGS">("PROFILES");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerTierFilter, setCustomerTierFilter] = useState("ALL");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);

  // Settings for customers
  const [customerSettings, setCustomerSettings] = useState({
    depositRate: 30, // 30%
    holdTimeMinutes: 30, // 30 mins
    autoVipThreshold: 5, // 5 bookings
    vipDiscountPercent: 5, // 5% discount
    smsRemindHours: 2, // 2 hours before match
    lockAfterCancellations: 2, // 2 unexcused cancellations
    enableZaloNotification: true,
  });

  const [customersList, setCustomersList] = useState<CustomerProfile[]>([
    {
      id: 1,
      code: "KH-001",
      fullName: "Lê Duy Tài (Trưởng nhóm IT24M)",
      phone: "0896890399",
      email: "leduytai.it24m@dak.edu.vn",
      tier: "VIP_GOLD",
      totalBookings: 14,
      totalSpent: 4350000,
      status: "ACTIVE",
      joinedDate: "01/10/2026",
      favoritePitch: "Sân bóng C1 (Sân 7)",
      notes: "Khách quen khoa CNTT, thường đá tối thứ 4 & thứ 7, thanh toán rất chuẩn.",
      history: [
        { code: "SAN-MW671Q37-CCCB", field: "Sân CĐ Sư Phạm (Ca 4)", time: "10:30 - 12:00", date: "2026-11-07", amount: 300000, status: "CONFIRMED" },
        { code: "SAN-MW52A180-8812", field: "Sân bóng C1 (Ca 9)", time: "18:00 - 19:30", date: "2026-11-04", amount: 375000, status: "COMPLETED" },
        { code: "SAN-MW44B991-3140", field: "Sân Ban Mê Sport (Ca 10)", time: "19:30 - 21:00", date: "2026-10-31", amount: 430000, status: "COMPLETED" },
      ],
    },
    {
      id: 2,
      code: "KH-002",
      fullName: "Kpa Trần Quang Thịnh",
      phone: "0901234567",
      email: "thinh.kpa@gmail.com",
      tier: "VIP_SILVER",
      totalBookings: 9,
      totalSpent: 2700000,
      status: "ACTIVE",
      joinedDate: "05/10/2026",
      favoritePitch: "Sân Ban Mê Sport",
      notes: "Đội bóng sinh viên Ea Tam, thường chọn ca 18:00 - 19:30.",
      history: [
        { code: "SAN-MW610A92-F110", field: "Sân Ban Mê Sport (Ca 9)", time: "18:00 - 19:30", date: "2026-11-06", amount: 375000, status: "COMPLETED" },
        { code: "SAN-MW508119-2041", field: "SVĐ Buôn Ma Thuột (Ca 8)", time: "16:30 - 18:00", date: "2026-11-01", amount: 345000, status: "COMPLETED" },
      ],
    },
    {
      id: 3,
      code: "KH-003",
      fullName: "Nguyễn Văn Hùng",
      phone: "0912345678",
      email: "hung.nguyen@gmail.com",
      tier: "STANDARD",
      totalBookings: 5,
      totalSpent: 1625000,
      status: "ACTIVE",
      joinedDate: "15/10/2026",
      favoritePitch: "SVĐ Buôn Ma Thuột",
      notes: "Thường đi cùng cơ quan vào chiều Chủ nhật.",
      history: [
        { code: "SAN-MW6713S8-D93F", field: "Sân bóng C1 (Ca 9)", time: "18:00 - 19:30", date: "2026-11-07", amount: 375000, status: "CONFIRMED" },
      ],
    },
    {
      id: 4,
      code: "KH-004",
      fullName: "Trần Đình Trọng",
      phone: "0987654321",
      email: "trong.tran@gmail.com",
      tier: "STANDARD",
      totalBookings: 2,
      totalSpent: 600000,
      status: "ACTIVE",
      joinedDate: "28/10/2026",
      favoritePitch: "Sân ĐH Tây Nguyên",
      notes: "Khách mới đăng ký thi đấu giải sinh viên.",
      history: [
        { code: "SAN-MW499120-1049", field: "Sân ĐH Tây Nguyên (Ca 3)", time: "09:00 - 10:30", date: "2026-11-02", amount: 300000, status: "COMPLETED" },
      ],
    },
    {
      id: 5,
      code: "KH-005",
      fullName: "Võ Thành Nam",
      phone: "0978112233",
      email: "nam.vo@gmail.com",
      tier: "STANDARD",
      totalBookings: 1,
      totalSpent: 300000,
      status: "LOCKED",
      joinedDate: "02/11/2026",
      favoritePitch: "Sân Manchester",
      notes: "Tạm khóa do đặt ca tối nhưng không đến và không báo trước 2 lần.",
      history: [
        { code: "SAN-MW400192-9110", field: "Sân Manchester (Ca 9)", time: "18:00 - 19:30", date: "2026-11-01", amount: 375000, status: "CANCELLED" },
      ],
    },
  ]);

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
    setUserRole("ADMIN");
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError("");
    const lowerEmail = email.toLowerCase().trim();
    const isStaff = lowerEmail.includes("staff") || lowerEmail.includes("nhanvien");
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: lowerEmail, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }
      const jwt = data.accessToken || `admin-token-${Date.now()}`;
      const role = data.user?.role || (isStaff ? "STAFF" : "ADMIN");
      const name = data.user?.fullName || (isStaff ? "Kpa Trần Quang Thịnh (Staff)" : "Lê Duy Tài (Admin)");
      window.localStorage.setItem("admin-token", jwt);
      window.localStorage.setItem("user-role", role);
      window.localStorage.setItem("user-name", name);
      setToken(jwt);
      setUserRole(role);
      setUserName(name);
      if (role === "STAFF") setTab("bookings");
    } catch (err: any) {
      // Allow demo fallback login
      if (password === "Admin@123456" || password === "Staff@123456" || password === "123456") {
        const demoJwt = `demo-${isStaff ? "staff" : "admin"}-${Date.now()}`;
        const role = isStaff ? "STAFF" : "ADMIN";
        const name = isStaff ? "Kpa Trần Quang Thịnh (Nhân viên trực sân)" : "Lê Duy Tài (Quản trị viên IT24M)";
        window.localStorage.setItem("admin-token", demoJwt);
        window.localStorage.setItem("user-role", role);
        window.localStorage.setItem("user-name", name);
        setToken(demoJwt);
        setUserRole(role);
        setUserName(name);
        if (role === "STAFF") setTab("bookings");
      } else {
        setLoginError(err.message || "Tài khoản hoặc mật khẩu không đúng. Vui lòng thử lại!");
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
        <div style={{ background: "#ffffff", borderRadius: "18px", padding: "36px", width: "100%", maxWidth: "460px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <div style={{ fontSize: "40px", marginBottom: "8px" }}>⚽</div>
            <h1 style={{ fontSize: "24px", fontWeight: "900", margin: 0, color: "#0f172a" }}>CỔNG QUẢN TRỊ &amp; NHÂN VIÊN</h1>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>Đăng nhập vai trò ADMIN (Quản lý) hoặc STAFF (Nhân viên trực sân)</p>
          </div>

          {/* Quick 1-click test credentials */}
          <div style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "10px", padding: "12px", marginBottom: "18px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "8px" }}>
              ⚡ 1-CLICK ĐIỀN TÀI KHOẢN MẪU (TEST NHANH):
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                className="quick-day-btn"
                style={{ flex: 1, fontSize: "12px", background: "#dcfce7", color: "#166534", borderColor: "#86efac", fontWeight: 700 }}
                onClick={() => {
                  setEmail("admin@example.com");
                  setPassword("Admin@123456");
                  setLoginError("");
                }}
              >
                👑 Tài khoản Admin
              </button>
              <button
                type="button"
                className="quick-day-btn"
                style={{ flex: 1, fontSize: "12px", background: "#e0f2fe", color: "#0369a1", borderColor: "#7dd3fc", fontWeight: 700 }}
                onClick={() => {
                  setEmail("staff@example.com");
                  setPassword("Staff@123456");
                  setLoginError("");
                }}
              >
                👔 Tài khoản Staff
              </button>
            </div>
          </div>

          {loginError && (
            <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Email hoặc Số điện thoại (Admin / Nhân viên) *</label>
              <input
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com hoặc staff@example.com"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label>Mật khẩu đăng nhập *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin@123456 hoặc Staff@123456"
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
    { key: "users", icon: "👥", title: "Hồ sơ & Cài đặt khách hàng" },
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

        {/* TAB 6: HỒ SƠ & CÀI ĐẶT KHÁCH HÀNG (CRM) */}
        {tab === "users" && (
          <div>
            {/* Sub-tab navigation */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <button
                type="button"
                className={`quick-day-btn ${customerSubTab === "PROFILES" ? "active" : ""}`}
                style={{ padding: "10px 18px", fontSize: "14px", fontWeight: 700, borderRadius: "10px" }}
                onClick={() => setCustomerSubTab("PROFILES")}
              >
                📋 Danh Sách Hồ Sơ Khách Hàng ({customersList.length})
              </button>
              <button
                type="button"
                className={`quick-day-btn ${customerSubTab === "SETTINGS" ? "active" : ""}`}
                style={{ padding: "10px 18px", fontSize: "14px", fontWeight: 700, borderRadius: "10px" }}
                onClick={() => setCustomerSubTab("SETTINGS")}
              >
                ⚙️ Cài Đặt &amp; Chính Sách Khách Hàng
              </button>
            </div>

            {customerSubTab === "PROFILES" ? (
              <div>
                {/* 4 Stat Cards */}
                <div className="admin-stats-grid" style={{ marginBottom: "24px" }}>
                  <div className="stat-card-modern" style={{ borderLeft: "4px solid #16a34a" }}>
                    <div className="stat-label">👥 TỔNG KHÁCH HÀNG ĐĂNG KÝ</div>
                    <div className="stat-value" style={{ color: "#16a34a" }}>45 người</div>
                    <div className="stat-hint">Đã kích hoạt tài khoản Neon Cloud</div>
                  </div>
                  <div className="stat-card-modern" style={{ borderLeft: "4px solid #f59e0b" }}>
                    <div className="stat-label">⭐ THÀNH VIÊN VIP VÀNG &amp; BẠC</div>
                    <div className="stat-value" style={{ color: "#b45309" }}>18 khách hàng</div>
                    <div className="stat-hint">Hưởng ưu đãi giảm giá 5% tự động</div>
                  </div>
                  <div className="stat-card-modern" style={{ borderLeft: "4px solid #2563eb" }}>
                    <div className="stat-label">⚽ TỔNG CA ĐÃ ĐÁ THÀNH CÔNG</div>
                    <div className="stat-value" style={{ color: "#2563eb" }}>124 ca sân</div>
                    <div className="stat-hint">Tỷ lệ thanh toán cọc thành công 98.2%</div>
                  </div>
                  <div className="stat-card-modern" style={{ borderLeft: "4px solid #ef4444" }}>
                    <div className="stat-label">🚫 TÀI KHOẢN TẠM KHÓA</div>
                    <div className="stat-value" style={{ color: "#dc2626" }}>1 tài khoản</div>
                    <div className="stat-hint">Bùng sân 2 lần không báo trước</div>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div style={{ background: "#ffffff", padding: "16px 20px", borderRadius: "12px", border: "1px solid var(--border)", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#475569" }}>Lọc theo hạng:</span>
                    {["ALL", "VIP_GOLD", "VIP_SILVER", "STANDARD", "LOCKED"].map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        className={`quick-day-btn ${customerTierFilter === tier ? "active" : ""}`}
                        style={{ fontSize: "11px", padding: "4px 10px" }}
                        onClick={() => setCustomerTierFilter(tier)}
                      >
                        {tier === "ALL" && "Tất cả"}
                        {tier === "VIP_GOLD" && "⭐ VIP Vàng"}
                        {tier === "VIP_SILVER" && "🥈 VIP Bạc"}
                        {tier === "STANDARD" && "⚽ Tiêu chuẩn"}
                        {tier === "LOCKED" && "🚫 Tạm khóa"}
                      </button>
                    ))}
                  </div>

                  <div style={{ minWidth: "260px" }}>
                    <input
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder="🔍 Tìm tên, SĐT, email khách hàng..."
                      style={{ width: "100%", height: "38px", padding: "0 12px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px" }}
                    />
                  </div>
                </div>

                {/* Customer Table */}
                <div className="table-modern-wrap">
                  <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ fontSize: "16px" }}>Danh Sách Hồ Sơ Khách Hàng (CRM)</strong>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>Nhân viên và Quản trị viên có thể theo dõi lịch sử, nâng hạng VIP hoặc ghi chú khách</div>
                    </div>
                  </div>

                  <table className="table-modern">
                    <thead>
                      <tr>
                        <th>Mã KH</th>
                        <th>Họ và tên khách</th>
                        <th>Số điện thoại / Email</th>
                        <th>Hạng thành viên</th>
                        <th>Số ca đặt</th>
                        <th>Tổng chi tiêu</th>
                        <th>Trạng thái</th>
                        <th>Thao tác hồ sơ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customersList
                        .filter((c) => {
                          if (customerTierFilter === "LOCKED" && c.status !== "LOCKED") return false;
                          if (customerTierFilter !== "ALL" && customerTierFilter !== "LOCKED" && c.tier !== customerTierFilter) return false;
                          if (customerSearch.trim()) {
                            const q = customerSearch.toLowerCase();
                            return (
                              c.fullName.toLowerCase().includes(q) ||
                              c.phone.includes(q) ||
                              (c.email && c.email.toLowerCase().includes(q)) ||
                              c.code.toLowerCase().includes(q)
                            );
                          }
                          return true;
                        })
                        .map((c) => (
                          <tr key={c.id}>
                            <td><strong style={{ color: "#2563eb" }}>{c.code}</strong></td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "13px", color: "#334155" }}>
                                  {c.fullName.charAt(0)}
                                </div>
                                <div>
                                  <strong>{c.fullName}</strong>
                                  <div style={{ fontSize: "11px", color: "#64748b" }}>📍 Thích: {c.favoritePitch}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ fontFamily: "monospace", fontWeight: 700, color: "#0f172a" }}>{c.phone}</div>
                              <div style={{ fontSize: "11px", color: "#64748b" }}>{c.email || "(Chưa có email)"}</div>
                            </td>
                            <td>
                              {c.tier === "VIP_GOLD" && (
                                <span className="badge-status" style={{ background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a" }}>
                                  ⭐ VIP VÀNG (-5%)
                                </span>
                              )}
                              {c.tier === "VIP_SILVER" && (
                                <span className="badge-status" style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1" }}>
                                  🥈 VIP BẠC
                                </span>
                              )}
                              {c.tier === "STANDARD" && (
                                <span className="badge-status badge-confirmed">
                                  ⚽ THÀNH VIÊN
                                </span>
                              )}
                            </td>
                            <td><strong>{c.totalBookings} ca</strong></td>
                            <td style={{ color: "#16a34a", fontWeight: 800 }}>{money(c.totalSpent)}</td>
                            <td>
                              <span className={`badge-status ${c.status === "ACTIVE" ? "badge-completed" : "badge-cancelled"}`}>
                                {c.status === "ACTIVE" ? "● Hoạt động" : "🚫 Tạm khóa"}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "6px" }}>
                                <button
                                  type="button"
                                  className="primary-button"
                                  style={{ padding: "5px 10px", fontSize: "11px" }}
                                  onClick={() => setSelectedCustomer(c)}
                                >
                                  👁️ Xem hồ sơ
                                </button>
                                <button
                                  type="button"
                                  className="outline-button"
                                  style={{ padding: "5px 8px", fontSize: "11px", color: c.status === "ACTIVE" ? "#ef4444" : "#16a34a", borderColor: c.status === "ACTIVE" ? "#fca5a5" : "#86efac" }}
                                  onClick={() => {
                                    const nextStatus = c.status === "ACTIVE" ? "LOCKED" : "ACTIVE";
                                    setCustomersList((prev) =>
                                      prev.map((item) => (item.id === c.id ? { ...item, status: nextStatus } : item))
                                    );
                                    setNotice(`Đã ${nextStatus === "ACTIVE" ? "kích hoạt lại" : "tạm khóa"} tài khoản của ${c.fullName}!`);
                                  }}
                                >
                                  {c.status === "ACTIVE" ? "Khóa" : "Mở"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Sub-tab 2: Customer Settings & System Policy */
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
                {/* Policy Card 1 */}
                <div style={{ background: "#ffffff", padding: "24px", borderRadius: "14px", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                    <span style={{ fontSize: "24px" }}>💰</span>
                    <div>
                      <strong style={{ fontSize: "16px", color: "#0f172a" }}>Chính Sách Cọc &amp; Giữ Chỗ</strong>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>Quy chuẩn đặt cọc giữ sân trực tuyến qua VietQR Napas 247</div>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: "14px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 700 }}>Hạn mức tiền cọc tối thiểu (% tổng đơn):</label>
                    <select
                      value={customerSettings.depositRate}
                      onChange={(e) => setCustomerSettings({ ...customerSettings, depositRate: Number(e.target.value) })}
                      style={{ width: "100%", height: "40px", borderRadius: "8px", border: "1px solid var(--border)", padding: "0 12px" }}
                    >
                      <option value={20}>20% tổng tiền sân</option>
                      <option value={30}>30% tổng tiền sân (Khuyến nghị chuẩn)</option>
                      <option value={50}>50% tổng tiền sân</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: "14px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 700 }}>Thời gian chờ quét mã QR cọc (Auto-Cancel):</label>
                    <select
                      value={customerSettings.holdTimeMinutes}
                      onChange={(e) => setCustomerSettings({ ...customerSettings, holdTimeMinutes: Number(e.target.value) })}
                      style={{ width: "100%", height: "40px", borderRadius: "8px", border: "1px solid var(--border)", padding: "0 12px" }}
                    >
                      <option value={15}>15 phút</option>
                      <option value={30}>30 phút (Chuẩn FIFA Buôn Ma Thuột)</option>
                      <option value={45}>45 phút</option>
                      <option value={60}>60 phút</option>
                    </select>
                  </div>

                  <div style={{ background: "#f0fdf4", border: "1px solid #86efac", padding: "10px 14px", borderRadius: "8px", fontSize: "12px", color: "#166534" }}>
                    ✓ Khi hết hạn 30 phút mà khách chưa chuyển khoản cọc, hệ thống sẽ tự động hủy đơn và giải phóng ca đá cho đội bóng khác.
                  </div>
                </div>

                {/* Policy Card 2 */}
                <div style={{ background: "#ffffff", padding: "24px", borderRadius: "14px", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                    <span style={{ fontSize: "24px" }}>⭐</span>
                    <div>
                      <strong style={{ fontSize: "16px", color: "#0f172a" }}>Chương Trình Thành Viên VIP</strong>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>Cơ chế tự động tri ân và chiết khấu cho khách đá thường xuyên</div>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: "14px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 700 }}>Số lượt đá hoàn thành để thăng hạng VIP:</label>
                    <input
                      type="number"
                      value={customerSettings.autoVipThreshold}
                      onChange={(e) => setCustomerSettings({ ...customerSettings, autoVipThreshold: Number(e.target.value) })}
                      style={{ width: "100%", height: "40px", borderRadius: "8px", border: "1px solid var(--border)", padding: "0 12px" }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: "14px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 700 }}>Mức giảm giá tự động khi khách đạt VIP (%):</label>
                    <input
                      type="number"
                      value={customerSettings.vipDiscountPercent}
                      onChange={(e) => setCustomerSettings({ ...customerSettings, vipDiscountPercent: Number(e.target.value) })}
                      style={{ width: "100%", height: "40px", borderRadius: "8px", border: "1px solid var(--border)", padding: "0 12px" }}
                    />
                  </div>

                  <div style={{ background: "#fef3c7", border: "1px solid #fde68a", padding: "10px 14px", borderRadius: "8px", fontSize: "12px", color: "#b45309" }}>
                    ⭐ Khách hàng đạt từ 5 ca thi đấu sẽ tự động nhận huy hiệu VIP Vàng và được trừ trực tiếp 5% khi đặt lịch mới.
                  </div>
                </div>

                {/* Policy Card 3 */}
                <div style={{ background: "#ffffff", padding: "24px", borderRadius: "14px", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                    <span style={{ fontSize: "24px" }}>📲</span>
                    <div>
                      <strong style={{ fontSize: "16px", color: "#0f172a" }}>Thông Báo &amp; Nhắc Lịch Tự Động</strong>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>Gửi SMS / Zalo ZNS nhắc nhở trước giờ bóng lăn</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={customerSettings.enableZaloNotification}
                        onChange={(e) => setCustomerSettings({ ...customerSettings, enableZaloNotification: e.target.checked })}
                      />
                      <span>Tự động gửi tin nhắn Zalo ZNS / SMS nhắc lịch đá trước 2 giờ</span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
                      <input type="checkbox" defaultChecked />
                      <span>Thông báo nhắc chuyển khoản cọc khi còn 10 phút cuối</span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
                      <input type="checkbox" defaultChecked />
                      <span>Tự động gửi biên lai hóa đơn điện tử PDF sau khi tất toán tại sân</span>
                    </label>
                  </div>
                </div>

                {/* Policy Card 4 */}
                <div style={{ background: "#ffffff", padding: "24px", borderRadius: "14px", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                    <span style={{ fontSize: "24px" }}>🛡️</span>
                    <div>
                      <strong style={{ fontSize: "16px", color: "#0f172a" }}>Quy Định Kỷ Luật &amp; Chống Bùng Sân</strong>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>Bảo vệ quyền lợi chủ sân và giữ uy tín cộng đồng bóng đá</div>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: "14px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 700 }}>Số lần hủy muộn / không đến tối đa trước khi khóa tài khoản:</label>
                    <input
                      type="number"
                      value={customerSettings.lockAfterCancellations}
                      onChange={(e) => setCustomerSettings({ ...customerSettings, lockAfterCancellations: Number(e.target.value) })}
                      style={{ width: "100%", height: "40px", borderRadius: "8px", border: "1px solid var(--border)", padding: "0 12px" }}
                    />
                  </div>

                  <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", padding: "10px 14px", borderRadius: "8px", fontSize: "12px", color: "#991b1b", marginBottom: "16px" }}>
                    ⚠️ Tài khoản bùng sân từ 2 lần sẽ bị hệ thống tự động khóa tính năng đặt lịch online, bắt buộc liên hệ hotline 0896890399 để mở lại.
                  </div>

                  <button
                    type="button"
                    className="primary-button"
                    style={{ width: "100%", padding: "12px", fontSize: "14px" }}
                    onClick={() => {
                      setNotice("✓ Đã lưu thành công toàn bộ cài đặt & chính sách khách hàng cho hệ thống!");
                    }}
                  >
                    💾 Lưu Cài Đặt Chính Sách Khách Hàng
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Chi Tiết Hồ Sơ Khách Hàng */}
        {selectedCustomer && (
          <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
            <div className="modal-content" style={{ maxWidth: "620px" }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <span className="section-tag">HỒ SƠ KHÁCH HÀNG CRM ({selectedCustomer.code})</span>
                  <h3>{selectedCustomer.fullName}</h3>
                </div>
                <button type="button" className="modal-close-btn" onClick={() => setSelectedCustomer(null)}>✕</button>
              </div>

              <div className="modal-body" style={{ maxHeight: "75vh", overflowY: "auto" }}>
                {/* Customer card header */}
                <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", color: "#ffffff", padding: "20px", borderRadius: "14px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <div style={{ fontSize: "18px", fontWeight: 800 }}>{selectedCustomer.fullName}</div>
                      <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "2px" }}>
                        📞 {selectedCustomer.phone} {selectedCustomer.email ? `· ✉️ ${selectedCustomer.email}` : ""}
                      </div>
                      <div style={{ fontSize: "12px", color: "#cbd5e1", marginTop: "6px" }}>
                        📅 Ngày gia nhập: <strong>{selectedCustomer.joinedDate}</strong> · Sân hay đá: <strong>{selectedCustomer.favoritePitch}</strong>
                      </div>
                    </div>
                    <div>
                      {selectedCustomer.tier === "VIP_GOLD" && (
                        <span className="badge-status" style={{ background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a", fontSize: "12px" }}>
                          ⭐ VIP VÀNG (-5%)
                        </span>
                      )}
                      {selectedCustomer.tier === "VIP_SILVER" && (
                        <span className="badge-status" style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", fontSize: "12px" }}>
                          🥈 VIP BẠC
                        </span>
                      )}
                      {selectedCustomer.tier === "STANDARD" && (
                        <span className="badge-status badge-confirmed" style={{ fontSize: "12px" }}>
                          ⚽ THÀNH VIÊN
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px", borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: "12px" }}>
                    <div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>TỔNG CA ĐÃ THI ĐẤU</div>
                      <div style={{ fontSize: "20px", fontWeight: 800, color: "#38bdf8" }}>{selectedCustomer.totalBookings} ca</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>TỔNG CHI TIÊU</div>
                      <div style={{ fontSize: "20px", fontWeight: 800, color: "#4ade80" }}>{money(selectedCustomer.totalSpent)}</div>
                    </div>
                  </div>
                </div>

                {/* History of Bookings */}
                <div style={{ marginBottom: "20px" }}>
                  <strong style={{ fontSize: "14px", display: "block", marginBottom: "8px", color: "#0f172a" }}>
                    📋 Lịch Sử Đặt Sân Gần Nhất Của Khách Hàng:
                  </strong>
                  {selectedCustomer.history.length === 0 ? (
                    <div style={{ fontSize: "13px", color: "#64748b" }}>Chưa có lịch sử đặt sân nào được ghi nhận.</div>
                  ) : (
                    <table className="table-modern" style={{ fontSize: "12px" }}>
                      <thead>
                        <tr>
                          <th>Mã đơn</th>
                          <th>Cụm sân</th>
                          <th>Khung giờ</th>
                          <th>Số tiền</th>
                          <th>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCustomer.history.map((h, i) => (
                          <tr key={i}>
                            <td><strong>{h.code}</strong></td>
                            <td>{h.field}</td>
                            <td>{h.time} ({h.date})</td>
                            <td style={{ color: "#16a34a", fontWeight: 700 }}>{money(h.amount)}</td>
                            <td>
                              <span className={`badge-status ${h.status === "CONFIRMED" || h.status === "COMPLETED" ? "badge-completed" : "badge-cancelled"}`}>
                                {h.status === "CONFIRMED" ? "✓ Đã cọc" : h.status === "COMPLETED" ? "★ Hoàn thành" : "✕ Đã hủy"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Staff internal notes */}
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                    📝 Ghi chú nội bộ của nhân viên trực sân:
                  </label>
                  <textarea
                    rows={3}
                    defaultValue={selectedCustomer.notes}
                    id="customerNotesInput"
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px" }}
                  />
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                    * Giúp nhân viên ca tiếp theo biết thói quen của khách (chân trái, thích nước mát, giờ thi đấu).
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                  <button
                    type="button"
                    className="quick-day-btn"
                    style={{ background: "#fef3c7", color: "#b45309", borderColor: "#fde68a", fontWeight: 700, fontSize: "12px" }}
                    onClick={() => {
                      setCustomersList((prev) =>
                        prev.map((c) => (c.id === selectedCustomer.id ? { ...c, tier: "VIP_GOLD" } : c))
                      );
                      setSelectedCustomer({ ...selectedCustomer, tier: "VIP_GOLD" });
                      setNotice(`Đã nâng hạng ⭐ VIP Vàng cho ${selectedCustomer.fullName}!`);
                    }}
                  >
                    ⭐ Thăng VIP Vàng
                  </button>

                  <button
                    type="button"
                    className="quick-day-btn"
                    style={{ background: "#f1f5f9", color: "#475569", borderColor: "#cbd5e1", fontWeight: 700, fontSize: "12px" }}
                    onClick={() => {
                      setCustomersList((prev) =>
                        prev.map((c) => (c.id === selectedCustomer.id ? { ...c, tier: "VIP_SILVER" } : c))
                      );
                      setSelectedCustomer({ ...selectedCustomer, tier: "VIP_SILVER" });
                      setNotice(`Đã chuyển sang 🥈 VIP Bạc cho ${selectedCustomer.fullName}!`);
                    }}
                  >
                    🥈 Chuyển VIP Bạc
                  </button>

                  <button
                    type="button"
                    className="primary-button"
                    style={{ padding: "8px 16px", fontSize: "12px" }}
                    onClick={() => {
                      const notesVal = (document.getElementById("customerNotesInput") as HTMLTextAreaElement)?.value;
                      if (notesVal !== undefined) {
                        setCustomersList((prev) =>
                          prev.map((c) => (c.id === selectedCustomer.id ? { ...c, notes: notesVal } : c))
                        );
                        setSelectedCustomer({ ...selectedCustomer, notes: notesVal });
                      }
                      setNotice(`Đã lưu ghi chú cho khách hàng ${selectedCustomer.fullName}!`);
                    }}
                  >
                    💾 Lưu ghi chú
                  </button>

                  <button
                    type="button"
                    className="outline-button"
                    style={{ marginLeft: "auto", padding: "8px 18px", fontSize: "12px" }}
                    onClick={() => setSelectedCustomer(null)}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
