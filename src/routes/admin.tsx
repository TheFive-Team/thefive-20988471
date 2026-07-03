import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";
import { commitFile } from "@/lib/github";
import { 
  ShoppingBag, Hourglass, Truck, CheckCircle, Wallet, Calendar, 
  MapPin, Phone, User, Hash, Clock, Box, FileText, Settings, 
  LogOut, AlertCircle, RefreshCw, Trash2, Plus, X, Download, Search, Filter, Copy, MessageCircle, Edit, ChevronDown
, Sun, Moon } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Dashboard — The Five A" }],
  }),
  component: AdminDashboard,
});

export interface SupabaseOrder {
  id: string;
  created_at: string;
  order_id: string;
  fullname: string;
  phone: string;
  wilaya: string;
  commune: string;
  address: string;
  product_name: string;
  variant_title: string;
  total_amount: number;
  delivery_type: string;
  delivery_fee: number;
  status: string;
  notes?: string;
  call_status?: string;
}

function AdminDashboard() {
  const [token, setToken] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "settings">("orders");
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin_theme") === "dark";
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      localStorage.setItem("admin_theme", "dark");
    } else {
      localStorage.setItem("admin_theme", "light");
    }
  }, [darkMode]);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("github_pat");
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
      loadProducts();
    }
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const data = await fetchProducts(undefined, 100);
    setProducts(data);
    setLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      localStorage.setItem("github_pat", token);
      setIsLoggedIn(true);
      loadProducts();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("github_pat");
    setToken("");
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-[#1f2937] text-right" dir="rtl">
        <div className="bg-white dark:bg-[#111827] p-8 rounded-2xl shadow-xl shadow-slate-200/50 w-full max-w-md border border-slate-100 dark:border-slate-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-[#F9FAFB] mb-2">THE FIVE A</h1>
            <p className="text-slate-500 dark:text-[#9CA3AF]">لوحة تحكم الإدارة</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">رمز الوصول الخاص بـ GitHub (PAT)</label>
              <input
                type="password"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full border border-slate-200 dark:border-[#374151] p-3 rounded-lg outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all text-left"
                placeholder="ghp_xxxxxxxxxxxx"
                dir="ltr"
              />
            </div>
            <button type="submit" className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-[#0B1120] py-3.5 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-md dark:shadow-none">
              تسجيل الدخول
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={darkMode ? "dark" : ""}>
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B1120] text-slate-900 dark:text-[#F9FAFB] dark:text-[#F9FAFB] transition-colors duration-300 flex flex-col md:flex-row" dir="rtl">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-[#111827] border-l border-slate-200 dark:border-[#374151] flex flex-col">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 text-center">
          <h1 className="text-2xl font-serif font-bold tracking-widest text-[#1e293b]">THE FIVE A</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "orders" ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-[#0B1120] shadow-md dark:shadow-none" : "text-slate-600 dark:text-[#9CA3AF] hover:bg-slate-50 dark:hover:bg-[#1f2937] dark:bg-[#1f2937]"}`}
          >
            <FileText size={20} />
            <span className="font-bold">سجل الطلبات</span>
          </button>
          <button 
            onClick={() => setActiveTab("products")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "products" ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-[#0B1120] shadow-md dark:shadow-none" : "text-slate-600 dark:text-[#9CA3AF] hover:bg-slate-50 dark:hover:bg-[#1f2937] dark:bg-[#1f2937]"}`}
          >
            <Box size={20} />
            <span className="font-bold">إدارة المنتجات</span>
          </button>
          <button 
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "settings" ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-[#0B1120] shadow-md dark:shadow-none" : "text-slate-600 dark:text-[#9CA3AF] hover:bg-slate-50 dark:hover:bg-[#1f2937] dark:bg-[#1f2937]"}`}
          >
            <Settings size={20} />
            <span className="font-bold">الإعدادات</span>
          </button>
        </nav>
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 dark:border-slate-700 flex flex-col gap-2">
          <button onClick={() => setDarkMode(!darkMode)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-[#9CA3AF] dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-[#1f2937] dark:bg-[#1f2937] dark:hover:bg-[#1f2937] transition-all font-bold">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span>{darkMode ? "الوضع النهاري" : "الوضع الليلي"}</span>
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-bold">
            <LogOut size={20} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto w-full">
        {activeTab === "orders" && <OrdersDashboard />}
        {activeTab === "products" && <ProductsManager products={products} token={token} onRefresh={loadProducts} loading={loading} />}
        {activeTab === "settings" && <div className="p-8 text-center text-slate-500 dark:text-[#9CA3AF] font-bold">إعدادات النظام (قيد التطوير)</div>}
      </main>
    </div>
    </div>
  );
}

// --- STATUS CONFIGURATION ---
const CALL_STATUS_OPTIONS = [
  { value: "لم يرد 1", color: "#F59E0B", bg: "bg-[#FEF3C7]", text: "text-[#B45309]", hover: "hover:bg-[#FDE68A]" },
  { value: "لم يرد 2", color: "#EA580C", bg: "bg-[#FED7AA]", text: "text-[#C2410C]", hover: "hover:bg-[#FDBA74]" },
  { value: "لم يرد 3", color: "#DC2626", bg: "bg-[#FECACA]", text: "text-[#B91C1C]", hover: "hover:bg-[#FCA5A5]" },
  { value: "تم الرد", color: "#166534", bg: "bg-[#DCFCE7]", text: "text-[#166534]", hover: "hover:bg-[#BBF7D0]", icon: "check" },
  { value: "إعادة الاتصال لاحقًا", color: "#2563EB", bg: "bg-[#DBEAFE]", text: "text-[#1E3A8A]", hover: "hover:bg-[#BFDBFE]" },
];

const STATUS_OPTIONS = [
  { value: "جديد", label: "جديد", color: "text-[#2563EB]", bg: "bg-[#2563EB]/10", icon: Plus },
  { value: "مؤكد", label: "مؤكد", color: "text-[#7C3AED]", bg: "bg-[#7C3AED]/10", icon: CheckCircle },
  { value: "قيد التوصيل", label: "قيد التوصيل", color: "text-[#EA580C]", bg: "bg-[#EA580C]/10", icon: Truck },
  { value: "تم التسليم", label: "تم التسليم", color: "text-[#16A34A]", bg: "bg-[#16A34A]/10", icon: CheckCircle },
  { value: "ملغى", label: "ملغى", color: "text-[#DC2626]", bg: "bg-[#DC2626]/10", icon: X },
  { value: "رجوع", label: "رجوع / استبدال", color: "text-[#6B7280]", bg: "bg-[#6B7280]/10", icon: AlertCircle },
];

function getStatusConfig(status: string) {
  if (status === "pending") return STATUS_OPTIONS[0];
  if (status === "delivery") return STATUS_OPTIONS[2];
  if (status === "delivered") return STATUS_OPTIONS[3];
  if (status === "cancelled") return STATUS_OPTIONS[4];
  return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
}

function StatusBadge({ status }: { status: string }) {
  const config = getStatusConfig(status);
  const Icon = config.icon;
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap min-w-[100px] justify-center shadow-sm dark:shadow-none transition-colors ${config.bg} ${config.color}`}>
      <Icon size={14} strokeWidth={2.5}/> {config.label}
    </div>
  );
}

// --- ORDERS DASHBOARD COMPONENT ---
function OrdersDashboard() {
  const currentDate = new Date().toLocaleDateString("en-GB"); 
  const [orders, setOrders] = useState<SupabaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCallMenuId, setActiveCallMenuId] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [wilayaFilter, setWilayaFilter] = useState("all");

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setOrders(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    await supabase.from('orders').update({ status: newStatus }).eq('id', id);
  };

  const updateCallStatus = async (id: string, call_status: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, call_status } : o));
    setActiveCallMenuId(null);
    await supabase.from('orders').update({ call_status }).eq('id', id);
  };

  const updateNotes = async (id: string, notes: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, notes } : o));
    await supabase.from('orders').update({ notes }).eq('id', id);
  };

  const confirmDelete = async (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    setOrderToDelete(null);
    await supabase.from('orders').delete().eq('id', id);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.fullname.toLowerCase().includes(searchQuery.toLowerCase()) || 
      o.phone.includes(searchQuery) || 
      o.order_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    let normalizedStatus = o.status;
    if (o.status === "pending") normalizedStatus = "جديد";
    if (o.status === "delivery") normalizedStatus = "قيد التوصيل";
    if (o.status === "delivered") normalizedStatus = "تم التسليم";
    if (o.status === "cancelled") normalizedStatus = "ملغى";

    const matchesStatus = statusFilter === "all" || normalizedStatus === statusFilter;
    const matchesWilaya = wilayaFilter === "all" || o.wilaya === wilayaFilter;
    
    return matchesSearch && matchesStatus && matchesWilaya;
  });

  const uniqueWilayas = Array.from(new Set(orders.map(o => o.wilaya))).filter(Boolean);

  const exportToCSV = () => {
    if (filteredOrders.length === 0) return;
    const headers = ["Order ID", "Date", "Time", "Customer Name", "Phone", "Wilaya", "Commune", "Address", "Product", "Variant", "Total Amount (DZD)", "Delivery Type", "Status", "Notes"];
    const rows = filteredOrders.map(order => {
      const dateObj = new Date(order.created_at);
      return [
        order.order_id,
        dateObj.toLocaleDateString("en-GB"),
        dateObj.toLocaleTimeString("en-GB"),
        order.fullname,
        order.phone,
        order.wilaya,
        order.commune,
        order.address,
        order.product_name,
        order.variant_title,
        order.total_amount,
        order.delivery_type,
        getStatusConfig(order.status).label,
        order.notes || ""
      ];
    });
    const csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" }); 
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalSales = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500 font-sans pb-12" style={{ fontFamily: "'Cairo', sans-serif" }}>
      
      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0E1A2F] dark:bg-[#E5E7EB] rounded-xl p-6 flex items-center justify-between shadow-sm dark:shadow-none text-white dark:text-[#0B1120] border border-[#0E1A2F]">
          <div>
            <p className="text-sm font-bold text-slate-300 mb-2">إجمالي الطلبات</p>
            <p className="text-4xl font-black">{orders.length}</p>
          </div>
          <ShoppingBag size={48} className="text-[#C9A46A] dark:text-[#D4AF37] opacity-90" strokeWidth={1.5}/>
        </div>

        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-[#374151] p-6 flex items-center justify-between shadow-sm dark:shadow-none hover:shadow-md dark:shadow-none transition-shadow">
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-[#9CA3AF] mb-2">طلبات جديدة</p>
            <p className="text-4xl font-black text-slate-900 dark:text-[#F9FAFB]">{orders.filter(o => o.status === 'pending' || o.status === 'جديد').length}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-2xl text-blue-600"><Plus size={28} strokeWidth={2}/></div>
        </div>

        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-[#374151] p-6 flex items-center justify-between shadow-sm dark:shadow-none hover:shadow-md dark:shadow-none transition-shadow">
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-[#9CA3AF] mb-2">قيد التوصيل</p>
            <p className="text-4xl font-black text-slate-900 dark:text-[#F9FAFB]">{orders.filter(o => o.status === 'delivery' || o.status === 'قيد التوصيل').length}</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-2xl text-orange-600"><Truck size={28} strokeWidth={2}/></div>
        </div>

        <div className="bg-[#C9A46A] dark:bg-[#D4AF37] rounded-xl p-6 flex items-center justify-between shadow-sm dark:shadow-none text-white dark:text-[#0B1120] border border-[#C9A46A] dark:border-[#D4AF37]">
          <div>
            <p className="text-sm font-bold text-white dark:text-[#0B1120]/90 mb-2">المبيعات الإجمالية</p>
            <p className="text-2xl font-black" dir="ltr">{totalSales.toLocaleString()} <span className="text-sm font-normal">DZD</span></p>
          </div>
          <Wallet size={48} className="text-white dark:text-[#0B1120] opacity-90" strokeWidth={1.5}/>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#374151] p-4 shadow-sm dark:shadow-none flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="flex flex-1 flex-col sm:flex-row gap-4 w-full">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="البحث بالاسم، الهاتف، أو رقم الطلب..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F7F5F0] dark:bg-[#0B1120] border-transparent rounded-xl py-3 pr-11 pl-4 text-sm font-bold outline-none focus:border-[#0E1A2F] focus:ring-1 focus:ring-[#0E1A2F] transition-all placeholder:text-slate-400 dark:text-slate-500 text-slate-800 dark:text-[#F9FAFB]"
            />
          </div>
          
          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#F7F5F0] dark:bg-[#0B1120] border-transparent rounded-xl py-3 pr-11 pl-4 text-sm font-bold outline-none focus:border-[#0E1A2F] focus:ring-1 focus:ring-[#0E1A2F] appearance-none min-w-[160px] cursor-pointer text-slate-800 dark:text-[#F9FAFB] transition-all"
            >
              <option value="all">كل الحالات</option>
              {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {/* Wilaya Filter */}
          <div className="relative">
            <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
            <select 
              value={wilayaFilter}
              onChange={(e) => setWilayaFilter(e.target.value)}
              className="bg-[#F7F5F0] dark:bg-[#0B1120] border-transparent rounded-xl py-3 pr-11 pl-4 text-sm font-bold outline-none focus:border-[#0E1A2F] focus:ring-1 focus:ring-[#0E1A2F] appearance-none min-w-[160px] cursor-pointer text-slate-800 dark:text-[#F9FAFB] transition-all"
            >
              <option value="all">كل الولايات</option>
              {uniqueWilayas.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
        </div>

        <button onClick={exportToCSV} className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0E1A2F] dark:bg-[#E5E7EB] text-white dark:text-[#0B1120] rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-md dark:shadow-none whitespace-nowrap text-sm w-full lg:w-auto">
          <Download size={18} strokeWidth={2.5} />
          تصدير إلى Excel
        </button>
      </div>

      {/* Compact Status Summary Bar */}
      <div className="flex flex-wrap gap-3">
        {STATUS_OPTIONS.map(statusObj => {
          const count = orders.filter(o => {
            // Need to match exactly what getStatusConfig returns so legacy maps to new properly
            const config = getStatusConfig(o.status);
            return config.value === statusObj.value;
          }).length;
          
          const Icon = statusObj.icon;
          
          return (
            <div key={statusObj.value} className={`flex-1 min-w-[140px] bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] rounded-xl p-3 flex items-center justify-between shadow-sm dark:shadow-none hover:border-slate-300 transition-all cursor-default group relative overflow-hidden`}>
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${statusObj.bg}`}></div>
              <div className="flex items-center gap-2 relative z-10">
                <div className={`p-1.5 rounded-lg ${statusObj.bg} ${statusObj.color}`}>
                  <Icon size={14} strokeWidth={2.5} />
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-[#9CA3AF] group-hover:text-slate-800 dark:text-[#F9FAFB] transition-colors">{statusObj.label}</span>
              </div>
              <span className="text-base font-black text-slate-800 dark:text-[#F9FAFB] relative z-10">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] rounded-2xl shadow-sm dark:shadow-none overflow-hidden relative">
        <div className="overflow-x-auto w-full" style={{ maxHeight: "calc(100vh - 300px)" }}>
          <table className="w-full text-sm text-center border-collapse whitespace-nowrap">
            <thead className="sticky top-0 z-20 bg-[#F7F5F0] dark:bg-[#0B1120] shadow-sm dark:shadow-none">
              <tr className="text-[#0E1A2F] dark:text-[#F9FAFB]">
                {/* Right-to-Left Column Order */}
                <th className="p-4 font-bold border-b border-slate-200 dark:border-[#374151] bg-[#F7F5F0] dark:bg-[#0B1120] sticky right-0 z-30 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] min-w-[150px]">الحالة</th>
                <th className="p-4 font-bold border-b border-slate-200 dark:border-[#374151]">إجراءات</th>
                <th className="p-4 font-bold border-b border-slate-200 dark:border-[#374151] min-w-[200px]">ملاحظات</th>
                <th className="p-4 font-bold border-b border-slate-200 dark:border-[#374151] text-[#C9A46A] dark:text-[#D4AF37]">المجموع</th>
                <th className="p-4 font-bold border-b border-slate-200 dark:border-[#374151]">سعر المنتج</th>
                <th className="p-4 font-bold border-b border-slate-200 dark:border-[#374151]">التوصيل</th>
                <th className="p-4 font-bold border-b border-slate-200 dark:border-[#374151]">النوع</th>
                <th className="p-4 font-bold border-b border-slate-200 dark:border-[#374151]">البلدية</th>
                <th className="p-4 font-bold border-b border-slate-200 dark:border-[#374151]">الولاية</th>
                <th className="p-4 font-bold border-b border-slate-200 dark:border-[#374151]">المقاس</th>
                <th className="p-4 font-bold border-b border-slate-200 dark:border-[#374151]">المنتج</th>
                <th className="p-4 font-bold border-b border-slate-200 dark:border-[#374151]">الهاتف</th>
                <th className="p-4 font-bold border-b border-slate-200 dark:border-[#374151] min-w-[150px]">الاسم</th>
                <th className="p-4 font-bold border-b border-slate-200 dark:border-[#374151] text-slate-500 dark:text-[#9CA3AF]">رقم الطلب</th>
                <th className="p-4 font-bold border-b border-slate-200 dark:border-[#374151]">الوقت</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={15} className="p-16 text-slate-400 dark:text-slate-500 font-bold text-lg">جاري تحميل الطلبات...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={15} className="p-16 text-slate-400 dark:text-slate-500 font-bold text-lg">لا توجد طلبات مطابقة</td></tr>
              ) : filteredOrders.map((order, i) => {
                const dateObj = new Date(order.created_at);
                const time = dateObj.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' });
                const date = dateObj.toLocaleDateString("en-GB", { day: '2-digit', month: 'short' });
                const productFee = order.total_amount - (order.delivery_fee || 0);

                return (
                <tr key={order.id} className={`h-[68px] border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#1f2937] dark:bg-[#1f2937]/80 transition-colors ${i % 2 === 0 ? 'bg-white dark:bg-[#111827]' : 'bg-[#FAFAFA]'}`}>
                  
                  {/* Status - Sticky Right */}
                  <td className={`p-3 border-l border-slate-100 dark:border-slate-700 bg-inherit sticky right-0 z-10 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] ${i % 2 === 0 ? 'bg-white dark:bg-[#111827]' : 'bg-[#FAFAFA] group-hover:bg-slate-50 dark:hover:bg-[#1f2937] dark:bg-[#1f2937]/80'}`}>
                    <div className="relative group cursor-pointer w-full h-full flex items-center justify-center">
                      <select 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        value={getStatusConfig(order.status).value}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                      <StatusBadge status={order.status} />
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-3 border-l border-slate-100 dark:border-slate-700 relative">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="flex items-center justify-center gap-1.5">
                        <a href={`https://wa.me/213${order.phone.replace(/^0+/, '')}`} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 hover:scale-110 transition-all shadow-sm dark:shadow-none border border-green-100" title="مراسلة عبر واتساب">
                          <MessageCircle size={16} strokeWidth={2.5} />
                        </a>
                        
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <button 
                              className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 hover:scale-110 transition-all shadow-sm dark:shadow-none border border-blue-100 relative outline-none" 
                              title="حالة الاتصال"
                            >
                              <Phone size={16} strokeWidth={2.5} />
                              {order.call_status && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white" style={{ backgroundColor: CALL_STATUS_OPTIONS.find(c => c.value === order.call_status)?.color }}></span>
                              )}
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-48 z-[9999] rounded-xl p-2 bg-white dark:bg-[#111827]" align="end" sideOffset={8}>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-2 pb-1 text-right mb-1">حالة الاتصال بالزبون</p>
                            {CALL_STATUS_OPTIONS.map(opt => (
                              <DropdownMenuItem
                                key={opt.value}
                                onSelect={() => updateCallStatus(order.id, opt.value)}
                                className={`flex items-center gap-2 w-full text-right px-3 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer outline-none ${order.call_status === opt.value ? 'bg-slate-50 dark:bg-[#1f2937]' : 'hover:bg-slate-50 dark:hover:bg-[#1f2937] dark:bg-[#1f2937] focus:bg-slate-50 dark:bg-[#1f2937]'}`}
                                dir="rtl"
                              >
                                {opt.icon === "check" ? (
                                  <CheckCircle size={14} strokeWidth={3} className={opt.text.replace('text-', 'text-')} style={{ color: opt.color }} />
                                ) : (
                                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: opt.color }}></span>
                                )}
                                <span className={opt.text}>{opt.value}</span>
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-[#374151]" />
                            <DropdownMenuItem
                              onSelect={() => updateCallStatus(order.id, "")}
                              className="flex items-center justify-center gap-2 w-full text-center px-3 py-2.5 rounded-lg text-xs font-bold text-slate-500 dark:text-[#9CA3AF] hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600 transition-colors cursor-pointer outline-none"
                              dir="rtl"
                            >
                              <Trash2 size={14} strokeWidth={2.5} /> مسح حالة الاتصال
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <button onClick={() => copyToClipboard(order.phone)} className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#374151] text-slate-600 dark:text-[#9CA3AF] flex items-center justify-center hover:bg-slate-200 hover:scale-110 transition-all shadow-sm dark:shadow-none border border-slate-200 dark:border-[#374151]" title="نسخ الرقم">
                          <Copy size={16} strokeWidth={2.5} />
                        </button>
                        <div className="w-[1px] h-5 bg-slate-200 mx-0.5"></div>
                        <button onClick={(e) => { e.stopPropagation(); setOrderToDelete(order.id); }} className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 hover:scale-110 transition-all shadow-sm dark:shadow-none border border-red-100 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40" title="حذف نهائي">
                          <Trash2 size={16} strokeWidth={2.5} />
                        </button>
                      </div>

                      {/* Call Status Badge */}
                      {order.call_status && (
                        <div className="flex items-center gap-1.5">
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black shadow-sm dark:shadow-none transition-colors cursor-default ${CALL_STATUS_OPTIONS.find(c => c.value === order.call_status)?.bg} ${CALL_STATUS_OPTIONS.find(c => c.value === order.call_status)?.text} ${CALL_STATUS_OPTIONS.find(c => c.value === order.call_status)?.hover}`}>
                            {CALL_STATUS_OPTIONS.find(c => c.value === order.call_status)?.icon === "check" ? (
                              <CheckCircle size={14} strokeWidth={3} />
                            ) : (
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CALL_STATUS_OPTIONS.find(c => c.value === order.call_status)?.color }}></span>
                            )}
                            {order.call_status}
                          </div>
                          <button 
                            onClick={() => updateCallStatus(order.id, "")}
                            className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-100 dark:bg-[#374151] text-slate-400 dark:text-slate-500 hover:bg-red-100 hover:text-red-500 transition-colors"
                            title="مسح حالة الاتصال"
                          >
                            <X size={12} strokeWidth={3} />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* Notes */}
                  <td className="p-3 border-l border-slate-100 dark:border-slate-700">
                    <textarea 
                      className="w-full h-10 resize-none bg-[#F7F5F0] dark:bg-[#0B1120] border border-transparent hover:border-slate-200 dark:hover:border-[#4B5563] dark:border-[#374151] focus:border-[#C9A46A] dark:focus:border-[#D4AF37] dark:border-[#D4AF37] focus:bg-white dark:bg-[#111827] rounded-lg p-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none transition-all placeholder:text-slate-400 dark:text-slate-500 placeholder:font-normal"
                      placeholder="أضف ملاحظة..."
                      defaultValue={order.notes || ""}
                      onBlur={(e) => updateNotes(order.id, e.target.value)}
                    />
                  </td>

                  {/* Total */}
                  <td className="p-3 border-l border-slate-100 dark:border-slate-700 font-black text-[#0E1A2F] dark:text-[#F9FAFB] bg-[#C9A46A] dark:bg-[#D4AF37]/5" dir="ltr">
                    {Number(order.total_amount || 0).toLocaleString()} <span className="text-[10px] text-[#C9A46A] dark:text-[#D4AF37] font-bold">DZD</span>
                  </td>

                  {/* Product Fee */}
                  <td className="p-3 border-l border-slate-100 dark:border-slate-700 font-bold text-slate-600 dark:text-[#9CA3AF]" dir="ltr">
                    {productFee.toLocaleString()}
                  </td>

                  {/* Delivery Fee */}
                  <td className="p-3 border-l border-slate-100 dark:border-slate-700 font-bold text-slate-600 dark:text-[#9CA3AF]" dir="ltr">
                    {Number(order.delivery_fee || 0).toLocaleString()}
                  </td>

                  {/* Delivery Type */}
                  <td className="p-3 border-l border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold">
                    <div className="flex items-center justify-center gap-1.5 px-2 py-1 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] rounded-md whitespace-nowrap shadow-sm dark:shadow-none">
                      {order.delivery_type === "توصيل للمنزل" ? <MapPin size={12} className="text-[#C9A46A] dark:text-[#D4AF37]"/> : <Box size={12} className="text-slate-400 dark:text-slate-500"/>}
                      {order.delivery_type}
                    </div>
                  </td>

                  {/* Commune */}
                  <td className="p-3 border-l border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold">{order.commune}</td>
                  
                  {/* Wilaya */}
                  <td className="p-3 border-l border-slate-100 dark:border-slate-700 text-slate-900 dark:text-[#F9FAFB] font-black">{order.wilaya}</td>

                  {/* Variant */}
                  <td className="p-3 border-l border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold">
                    {order.variant_title && <span className="px-2.5 py-1 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] shadow-sm dark:shadow-none rounded-md text-xs">{order.variant_title}</span>}
                  </td>

                  {/* Product */}
                  <td className="p-3 border-l border-slate-100 dark:border-slate-700 text-[#0E1A2F] dark:text-[#F9FAFB] font-bold">{order.product_name}</td>

                  {/* Phone */}
                  <td className="p-3 border-l border-slate-100 dark:border-slate-700 font-bold text-[#0E1A2F] dark:text-[#F9FAFB] hover:text-[#C9A46A] dark:text-[#D4AF37] transition-colors cursor-pointer" dir="ltr" onClick={() => copyToClipboard(order.phone)} title="انقر للنسخ">
                    {order.phone}
                  </td>

                  {/* Name */}
                  <td className="p-3 border-l border-slate-100 dark:border-slate-700 text-[#0E1A2F] dark:text-[#F9FAFB] font-black">{order.fullname}</td>

                  {/* Order ID */}
                  <td className="p-3 border-l border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 font-mono text-[11px] font-bold">#{order.order_id.split('-')[1] || order.order_id}</td>

                  {/* Time */}
                  <td className="p-3 text-slate-500 dark:text-[#9CA3AF] text-xs font-bold" dir="ltr">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-slate-800 dark:text-[#F9FAFB]">{time}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">{date}</span>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm" onClick={() => setOrderToDelete(null)}>
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 w-[90%] max-w-md shadow-2xl border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-4 text-red-600 dark:text-red-400">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold">تأكيد الحذف</h3>
            </div>
            <div className="space-y-2 mb-8 text-right">
              <p className="text-slate-700 dark:text-slate-300 font-medium">هل أنت متأكد أنك تريد حذف هذا الطلب؟</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">لا يمكن التراجع عن هذه العملية.</p>
            </div>
            <div className="flex items-center justify-end gap-3" dir="rtl">
              <button onClick={(e) => { e.stopPropagation(); setOrderToDelete(null); }} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                إلغاء
              </button>
              <button onClick={(e) => { e.stopPropagation(); confirmDelete(orderToDelete); }} className="px-5 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20">
                حذف الطلب
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

// --- PRODUCTS MANAGER COMPONENT ---
type ProductImageObj = { id: string, url?: string, base64?: string };

function ProductsManager({ products, token, onRefresh, loading }: { products: ShopifyProduct[], token: string, onRefresh: () => void, loading: boolean }) {
  const [mode, setMode] = useState<"list" | "edit" | "create">("list");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [productImages, setProductImages] = useState<ProductImageObj[]>([]);

  const startEdit = (product: ShopifyProduct) => {
    setMode("edit");
    setEditingProductId(product.node.id);
    
    const sizeOption = product.node.options?.find(o => o.name.toLowerCase() === "size");
    const sizes = sizeOption ? sizeOption.values.join(", ") : "";

    setEditForm({
      title: product.node.title,
      handle: product.node.handle,
      descriptionHtml: (product.node.descriptionHtml || "").replace(/<br\s*\/?>/gi, '\n'),
      price: product.node.priceRange.minVariantPrice.amount,
      sizes: sizes
    });
    
    const existingImages = product.node.images.edges.map((e, idx) => ({
      id: `img-${Date.now()}-${idx}`,
      url: e.node.url
    }));
    setProductImages(existingImages);
  };

  const startCreate = () => {
    setMode("create");
    setEditingProductId(null);
    setEditForm({
      title: "",
      handle: "",
      descriptionHtml: "",
      price: "",
      sizes: ""
    });
    setProductImages([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setProductImages(prev => [...prev, {
          id: `new-${Date.now()}-${idx}`,
          base64: base64String,
          url: reader.result as string // For immediate preview
        }]);
      };
      reader.readAsDataURL(file);
    });
    
    // Clear input so same file can be selected again if needed
    e.target.value = "";
  };

  const removeImage = (id: string) => {
    setProductImages(prev => prev.filter(img => img.id !== id));
  };

  const generateShopifyNode = (form: any, imageEdges: any[], id: string) => {
    const sizeValues = form.sizes ? form.sizes.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
    const options = sizeValues.length > 0 ? [{ name: "size", values: sizeValues }] : [];
    
    const variantsEdges = sizeValues.length > 0 
      ? sizeValues.map((size: string, idx: number) => ({
          node: {
            id: `gid://shopify/ProductVariant/${Date.now()}${idx}`,
            title: size,
            availableForSale: true,
            price: { amount: form.price, currencyCode: "DZD" },
            selectedOptions: [{ name: "size", value: size }]
          }
        }))
      : [{
          node: {
            id: `gid://shopify/ProductVariant/${Date.now()}`,
            title: "Default Title",
            availableForSale: true,
            price: { amount: form.price, currencyCode: "DZD" },
            selectedOptions: []
          }
        }];

    return {
      id,
      title: form.title,
      description: "",
      descriptionHtml: (form.descriptionHtml || "").replace(/\n/g, '<br />'),
      handle: form.handle || form.title.toLowerCase().replace(/\s+/g, '-'),
      tags: [],
      productType: "",
      vendor: "My Store",
      priceRange: { minVariantPrice: { amount: form.price, currencyCode: "DZD" } },
      images: { edges: imageEdges },
      variants: { edges: variantsEdges },
      options: options
    };
  };

  const saveProduct = async () => {
    if (!token) return;
    if (!editForm.title || !editForm.price) {
      alert("الرجاء إدخال اسم المنتج والسعر / Please enter title and price");
      return;
    }
    setIsSaving(true);
    try {
      const finalImageEdges: any[] = [];
      
      // Upload new images and preserve existing ones
      for (let i = 0; i < productImages.length; i++) {
        const img = productImages[i];
        if (img.base64) {
          const fileName = `product-${Date.now()}-${i}.png`;
          const imagePath = `public/images/${fileName}`;
          await commitFile(imagePath, img.base64, `Upload image for ${editForm.title}`, token, true);
          finalImageEdges.push({ node: { url: `/images/${fileName}`, altText: null } });
        } else if (img.url) {
          finalImageEdges.push({ node: { url: img.url, altText: null } });
        }
      }

      let updatedProducts = [...products];

      if (mode === "create") {
        const newId = `gid://shopify/Product/${Date.now()}`;
        const newNode = generateShopifyNode(editForm, finalImageEdges, newId);
        updatedProducts.push({ node: newNode as any });
      } else if (mode === "edit" && editingProductId) {
        updatedProducts = products.map(p => {
          if (p.node.id === editingProductId) {
            return { node: generateShopifyNode(editForm, finalImageEdges, editingProductId) as any };
          }
          return p;
        });
      }
      
      await commitFile(
        "public/data/products.json",
        JSON.stringify(updatedProducts, null, 2),
        `${mode === "create" ? "Create" : "Update"} product: ${editForm.title}`,
        token,
        false
      );
      
      alert(mode === "create" ? "تمت إضافة المنتج بنجاح!" : "تم تحديث المنتج بنجاح!");
      setMode("list");
      onRefresh();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProduct = async (id: string, title: string) => {
    if (!confirm(`هل أنت متأكد من حذف المنتج: ${title}؟\nAre you sure you want to delete this product?`)) return;
    
    setIsSaving(true);
    try {
      const updatedProducts = products.filter(p => p.node.id !== id);
      await commitFile(
        "public/data/products.json",
        JSON.stringify(updatedProducts, null, 2),
        `Delete product: ${title}`,
        token,
        false
      );
      alert("تم حذف المنتج بنجاح!");
      onRefresh();
    } catch (err: any) {
      alert("Error deleting product: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (mode !== "list") {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
        <div className="flex justify-between items-center bg-white dark:bg-[#111827] p-6 rounded-xl shadow-sm dark:shadow-none border border-[#E5E7EB]">
          <h2 className="text-2xl font-bold font-serif text-[#1e293b]">{mode === "create" ? "إضافة منتج جديد" : `تعديل المنتج: ${editForm.title}`}</h2>
          <button onClick={() => setMode("list")} className="text-slate-500 dark:text-[#9CA3AF] hover:text-slate-800 dark:text-[#F9FAFB] font-bold px-4 py-2 bg-slate-100 dark:bg-[#374151] rounded-lg">إلغاء ورجوع</button>
        </div>
        
        <div className="bg-white dark:bg-[#111827] p-8 rounded-xl shadow-sm dark:shadow-none border border-[#E5E7EB] space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="font-bold text-slate-700 dark:text-slate-200 text-sm">اسم المنتج (Title)</label>
              <input type="text" className="w-full border border-slate-300 p-3.5 rounded-xl outline-none focus:border-slate-800 font-bold text-slate-900 dark:text-[#F9FAFB]" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
            </div>
            <div className="space-y-3">
              <label className="font-bold text-slate-700 dark:text-slate-200 text-sm">الرابط (Handle)</label>
              <input type="text" className="w-full border border-slate-300 p-3.5 rounded-xl outline-none focus:border-slate-800 font-mono text-left" dir="ltr" value={editForm.handle} onChange={e => setEditForm({...editForm, handle: e.target.value})} />
            </div>
            <div className="space-y-3">
              <label className="font-bold text-slate-700 dark:text-slate-200 text-sm">السعر (Price in DZD)</label>
              <input type="number" className="w-full border border-slate-300 p-3.5 rounded-xl outline-none focus:border-slate-800 text-left font-bold text-lg text-slate-900 dark:text-[#F9FAFB]" dir="ltr" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} />
            </div>
            <div className="space-y-3">
              <label className="font-bold text-slate-700 dark:text-slate-200 text-sm">القياسات المتوفرة (Available Sizes)</label>
              <input type="text" className="w-full border border-slate-300 p-3.5 rounded-xl outline-none focus:border-slate-800 text-left font-bold text-slate-900 dark:text-[#F9FAFB]" dir="ltr" value={editForm.sizes} onChange={e => setEditForm({...editForm, sizes: e.target.value})} placeholder="38, 40, 42, 44" />
              <p className="text-xs text-slate-500 dark:text-[#9CA3AF]">افصل بين القياسات بفاصلة (مثال: S, M, L) / Separate sizes with commas</p>
            </div>
            <div className="space-y-3">
              <label className="font-bold text-slate-700 dark:text-slate-200 text-sm">معرض الصور (Gallery)</label>
              <div className="border border-slate-200 dark:border-[#374151] rounded-xl bg-slate-50 dark:bg-[#1f2937] p-4">
                <div className="flex flex-wrap gap-4 mb-4">
                  {productImages.map(img => (
                    <div key={img.id} className="relative w-24 h-24 bg-white dark:bg-[#111827] rounded-lg border shadow-sm dark:shadow-none group">
                      <img src={img.url} className="w-full h-full object-cover rounded-lg" alt="product" />
                      <button 
                        onClick={() => removeImage(img.id)}
                        className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 shadow-sm dark:shadow-none opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                      >
                        <X size={14} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center">
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="text-sm text-slate-500 dark:text-[#9CA3AF] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-white dark:bg-[#111827] file:text-slate-700 dark:text-slate-200 file:shadow-sm dark:shadow-none file:cursor-pointer hover:file:bg-slate-100 dark:bg-[#374151]" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="font-bold text-slate-700 dark:text-slate-200 text-sm">وصف المنتج (Product Description)</label>
            <textarea rows={8} className="w-full border border-slate-300 p-4 rounded-xl outline-none focus:border-slate-800 text-right font-medium text-sm leading-relaxed" dir="auto" value={editForm.descriptionHtml} onChange={e => setEditForm({...editForm, descriptionHtml: e.target.value})} placeholder="اكتب وصف المنتج هنا... المسافات والأسطر الجديدة ستظهر بشكل صحيح" />
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-slate-100 dark:border-slate-700">
            <button disabled={isSaving} onClick={saveProduct} className="bg-[#1e293b] text-white dark:text-[#0B1120] px-10 py-3.5 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2 shadow-md dark:shadow-none transition-all active:scale-95">
               {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle size={18} />}
               {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center bg-white dark:bg-[#111827] p-6 rounded-xl shadow-sm dark:shadow-none border border-[#E5E7EB]">
        <h2 className="text-2xl font-bold font-serif text-[#1e293b] flex items-center gap-3">
          <Box className="text-[#D29E5B]"/>
          إدارة المنتجات المتاحة
        </h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={startCreate} 
            disabled={loading || isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#D29E5B] text-white dark:text-[#0B1120] rounded-lg font-bold hover:bg-[#c28f4d] transition-colors shadow-sm dark:shadow-none disabled:opacity-50"
          >
            <Plus size={18} />
            إضافة منتج جديد
          </button>
          <button 
            onClick={onRefresh} 
            disabled={loading || isSaving}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-[#374151] text-slate-700 dark:text-slate-200 rounded-lg font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        {products.map((p) => (
          <div key={p.node.id} className="bg-white dark:bg-[#111827] border border-[#E5E7EB] rounded-xl p-6 flex flex-col md:flex-row gap-6 items-center shadow-sm dark:shadow-none hover:shadow-md dark:shadow-none transition-shadow">
            <div className="w-28 h-36 flex-shrink-0 bg-slate-100 dark:bg-[#374151] rounded-lg overflow-hidden border border-slate-200 dark:border-[#374151]">
              {p.node.images.edges[0] && (
                <img src={p.node.images.edges[0].node.url} alt="product" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 space-y-3 text-right">
              <div>
                <h3 className="font-bold text-2xl text-[#1e293b]">{p.node.title}</h3>
                <p className="text-slate-500 dark:text-[#9CA3AF] text-sm font-mono mt-1">{p.node.handle}</p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-bold border border-emerald-100">
                <CheckCircle size={12}/> متوفر في المتجر
              </div>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto p-5 bg-[#FAFAFA] rounded-xl border border-[#E5E7EB] min-w-[200px] justify-center items-center">
              <p className="font-bold text-xl text-slate-900 dark:text-[#F9FAFB]" dir="ltr">{Number(p.node.priceRange.minVariantPrice.amount).toLocaleString()} DZD</p>
              <div className="w-full flex gap-2">
                <button
                  onClick={() => startEdit(p)}
                  disabled={loading || isSaving}
                  className="flex-1 bg-[#1e293b] text-white dark:text-[#0B1120] px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-sm dark:shadow-none"
                >
                  تعديل
                </button>
                <button
                  onClick={() => deleteProduct(p.node.id, p.node.title)}
                  disabled={loading || isSaving}
                  className="bg-red-50 text-red-600 px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-red-100 transition-colors disabled:opacity-50 border border-red-200 shadow-sm dark:shadow-none flex items-center justify-center"
                  title="حذف المنتج"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
