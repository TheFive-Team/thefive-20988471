import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";
import { commitFile, deleteFile, listFiles } from "@/lib/github";
import { 
  ShoppingBag, Hourglass, Truck, CheckCircle, Wallet, Calendar, 
  MapPin, Phone, User, Hash, Clock, Box, FileText, Settings, 
  LogOut, AlertCircle, RefreshCw, Trash2, Plus, X, Download, Search, Filter, Copy, MessageCircle, Edit, ChevronDown,
  Sun, Moon, Menu, ArrowUp, ArrowDown, Image as ImageIcon, Upload
} from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { syncConfirmedOrdersFn } from "@/actions/syncZRExpress.server";
import { wilayas } from "@/lib/wilayas";
import ZR_OFFICES from "@/lib/zr_offices.json";

export const Route = createFileRoute("/admin/_protected/")({
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
  tracking_number?: string;
  zr_express_id?: string;
  selectedDeskName?: string | null;
  selectedDeskWilaya?: string | null;
  selectedDeskCommune?: string | null;
  selectedDeskAddress?: string | null;
  selectedDeskCP?: string | null;
  selectedDeskPhone?: string | null;
  selectedDesk?: {
    name?: string;
    wilaya?: string;
    commune?: string;
    address?: string;
    cp?: string;
    phone?: string;
    zrId?: string;
  } | null;
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "settings">("orders");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const data = await fetchProducts(undefined, 100);
    setProducts(data);
    setLoading(false);
  };

  const { useNavigate } = Route.useMatch() as any;
  // Fallback if router hooks aren't perfectly matching the generic, we'll use window.location
  const handleLogout = async () => {
    // Force clear cookies locally for immediate effect before Supabase syncs
    document.cookie = `sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  return (
    <div className={darkMode ? "dark" : ""}>
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B1120] text-slate-900 dark:text-[#F9FAFB] dark:text-[#F9FAFB] transition-colors duration-300 flex flex-col md:flex-row" dir="rtl">
      {/* Sidebar */}
      <aside className={`transition-all duration-300 flex flex-col bg-white dark:bg-[#111827] border-l border-slate-200 dark:border-[#374151] shrink-0 ${isSidebarCollapsed ? 'w-20' : 'w-full md:w-64'}`}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          {!isSidebarCollapsed && <h1 className="text-2xl font-serif font-bold tracking-widest text-[#1e293b] dark:text-[#F9FAFB] whitespace-nowrap overflow-hidden">THE FIVE A</h1>}
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 mx-auto transition-colors">
            <Menu size={20} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-hidden">
          <button 
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "orders" ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-[#0B1120] shadow-md dark:shadow-none" : "text-slate-600 dark:text-[#9CA3AF] hover:bg-slate-50 dark:hover:bg-[#1f2937] dark:bg-[#1f2937]"} ${isSidebarCollapsed ? 'justify-center w-full' : 'w-full'}`}
            title="سجل الطلبات"
          >
            <FileText size={20} className="shrink-0" />
            {!isSidebarCollapsed && <span className="font-bold whitespace-nowrap overflow-hidden">سجل الطلبات</span>}
          </button>
          <button 
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "products" ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-[#0B1120] shadow-md dark:shadow-none" : "text-slate-600 dark:text-[#9CA3AF] hover:bg-slate-50 dark:hover:bg-[#1f2937] dark:bg-[#1f2937]"} ${isSidebarCollapsed ? 'justify-center w-full' : 'w-full'}`}
            title="إدارة المنتجات"
          >
            <Box size={20} className="shrink-0" />
            {!isSidebarCollapsed && <span className="font-bold whitespace-nowrap overflow-hidden">إدارة المنتجات</span>}
          </button>
          <button 
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "settings" ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-[#0B1120] shadow-md dark:shadow-none" : "text-slate-600 dark:text-[#9CA3AF] hover:bg-slate-50 dark:hover:bg-[#1f2937] dark:bg-[#1f2937]"} ${isSidebarCollapsed ? 'justify-center w-full' : 'w-full'}`}
            title="الإعدادات"
          >
            <Settings size={20} className="shrink-0" />
            {!isSidebarCollapsed && <span className="font-bold whitespace-nowrap overflow-hidden">الإعدادات</span>}
          </button>
        </nav>
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 dark:border-slate-700 flex flex-col gap-2 overflow-hidden">
          <button onClick={() => setDarkMode(!darkMode)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-[#9CA3AF] dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-[#1f2937] dark:bg-[#1f2937] dark:hover:bg-[#1f2937] transition-all font-bold ${isSidebarCollapsed ? 'justify-center w-full' : 'w-full'}`} title={darkMode ? "الوضع النهاري" : "الوضع الليلي"}>
            {darkMode ? <Sun size={20} className="shrink-0" /> : <Moon size={20} className="shrink-0" />}
            {!isSidebarCollapsed && <span className="whitespace-nowrap overflow-hidden">{darkMode ? "الوضع النهاري" : "الوضع الليلي"}</span>}
          </button>
          <button onClick={handleLogout} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-bold ${isSidebarCollapsed ? 'justify-center w-full' : 'w-full'}`} title="تسجيل الخروج">
            <LogOut size={20} className="shrink-0" />
            {!isSidebarCollapsed && <span className="whitespace-nowrap overflow-hidden">تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto w-full">
        {activeTab === "orders" && <OrdersDashboard />}
        {activeTab === "products" && <ProductsManager products={products} token={""} onRefresh={(newProducts?: ShopifyProduct[]) => newProducts ? setProducts(newProducts) : loadProducts()} loading={loading} />}
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
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap min-w-[110px] justify-center shadow-sm dark:shadow-none transition-colors ${config.bg} ${config.color}`}>
      <Icon size={16} strokeWidth={2.5}/> {config.label}
    </div>
  );
}

// Helper to normalize strings for comparison (removes accents, lowercases, trims)
const normalizeStr = (str: string) => {
  if (!str) return "";
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
};

const getOfficesForWilaya = (wilayaName: string) => {
  if (!wilayaName) return [];
  
  // Clean up format like "31 - وهران" or "16-Alger" to just "وهران" / "Alger"
  const cleanName = wilayaName.split('-').pop()?.trim() || wilayaName;
  const normalizedInput = normalizeStr(cleanName);
  
  // Find the wilaya in our list by matching either Arabic or French name
  const wilayaObj = wilayas.find(w => 
    normalizeStr(w.name) === normalizedInput || 
    normalizeStr(w.nameAr) === normalizedInput ||
    w.name.toLowerCase() === cleanName.toLowerCase() ||
    w.nameAr === cleanName
  );

  // If found, we use the French name to filter ZR_OFFICES, else we try to filter using the input directly
  const targetVille = wilayaObj ? normalizeStr(wilayaObj.name) : normalizedInput;

  // Filter the JSON dataset where ville matches (we map id from name for React keys)
  return ZR_OFFICES.filter(office => normalizeStr(office.ville) === targetVille).map(o => ({
    id: (o as any).id || o.name,
    name: o.name,
    wilaya: o.ville,
    commune: o.commune,
    address: o.address,
    phone: o.phone,
    cp: o.cp
  }));
};

function ZROfficeSelect({ wilaya, onSelect, selectedOffice }: { wilaya: string, onSelect: (office: any) => void, selectedOffice?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  
  const offices = getOfficesForWilaya(wilaya).filter(o => 
    o.name.toLowerCase().includes(search.toLowerCase()) || 
    o.commune.toLowerCase().includes(search.toLowerCase())
  );

  // Position calculation and scroll/resize listeners
  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        const dropdownHeight = 250;
        const dropUp = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
        
        setDropdownStyle({
          position: 'fixed',
          left: rect.left,
          width: rect.width >= 224 ? rect.width : 224, // min-width for dropdown
          ...(dropUp ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 }),
          zIndex: 99999
        });
      }
    };

    updatePosition(); // Initial calculation

    if (isOpen) {
      const handleScroll = (e: Event) => {
        // Prevent action if scrolling inside the dropdown itself
        if (e.target instanceof Node && dropdownRef.current?.contains(e.target as Node)) {
           return;
        }
        // Recalculate position dynamically when scrolling the page/table
        requestAnimationFrame(updatePosition);
      };

      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, [isOpen]);

  // Focus input without scrolling the page when opened
  useEffect(() => {
    if (isOpen) {
      // Small timeout ensures the portal has mounted and position is set before focusing
      const timer = setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (selectedOffice) {
    return (
      <div className="flex flex-col items-center gap-1 mt-2">
        <div className="bg-slate-900 dark:bg-slate-800 text-white px-2 py-1.5 rounded-md text-[11px] text-center w-full shadow-sm leading-tight border border-slate-700">
          <div className="font-bold text-[#C9A46A]">{selectedOffice.name}</div>
          <div className="text-slate-300 font-normal mt-0.5">{selectedOffice.commune} - {selectedOffice.wilaya}</div>
        </div>
        <button 
          type="button"
          onClick={(e) => { e.preventDefault(); onSelect(null); }} 
          className="text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 underline underline-offset-2 transition-colors"
        >
          تغيير المكتب
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full mt-2">
      <button 
        type="button"
        ref={buttonRef}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen); }} 
        className="w-full text-xs font-bold bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 px-3 py-2 rounded-md flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
      >
        <span>مكتب ZR</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      {isOpen && typeof document !== 'undefined' && createPortal(
        <>
          <div className="fixed inset-0 z-[99998]" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}></div>
          <div 
            ref={dropdownRef}
            style={dropdownStyle}
            className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl p-1 animate-in fade-in zoom-in-95"
            dir="rtl"
          >
            <div className="p-1 border-b border-slate-100 dark:border-slate-800 relative">
              <Search size={12} className="absolute right-2.5 top-3 text-slate-400" />
              <input 
                ref={inputRef}
                type="text" 
                placeholder="بحث عن مكتب..." 
                className="w-full text-xs p-1.5 pr-7 bg-slate-50 dark:bg-slate-900 rounded border border-transparent focus:border-slate-300 dark:focus:border-slate-600 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onClick={e => e.stopPropagation()}
              />
            </div>
            <div className="max-h-[260px] overflow-y-auto overscroll-contain p-1 custom-scrollbar">
              {offices.map(o => (
                <div 
                  key={o.id} 
                  onClick={(e) => { e.stopPropagation(); onSelect(o); setIsOpen(false); }}
                  className="p-2 mb-1 last:mb-0 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md cursor-pointer text-right transition-colors"
                >
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{o.name}</div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">{o.commune} | {o.phone}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5" title={o.address}>{o.address}</div>
                </div>
              ))}
              {offices.length === 0 && <div className="text-center p-3 text-xs text-slate-500 font-medium">لا يوجد مكاتب لهذه الولاية</div>}
            </div>
          </div>
        </>,
        document.body
      )}
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
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [wilayaFilter, setWilayaFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ORDERS_PER_PAGE = 50;
  
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, wilayaFilter, dateRangeFilter, customStartDate, customEndDate]);

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

  const updateZROffice = async (id: string, office: any) => {
    const updates = office ? {
      selectedDesk: {
        id: office.id,
        name: office.name,
        wilaya: office.wilaya,
        commune: office.commune,
        address: office.address,
        cp: office.cp || "",
        phone: office.phone,
        zrId: office.id || ""
      }
    } : {
      selectedDesk: null
    };

    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    const { error } = await supabase.from('orders').update(updates).eq('id', id);
    if (error) {
      console.error("Failed to save desk:", error);
      alert("حدث خطأ أثناء حفظ المكتب، يرجى التأكد من إضافة عمود selectedDesk كـ JSONB في جدول orders.");
    }
  };

  const updateDeliveryType = async (id: string, newType: string) => {
    const order = orders.find(o => o.id === id);
    if (!order || order.delivery_type === newType) return;

    // Clean up format like "31 - وهران"
    const cleanName = order.wilaya.split('-').pop()?.trim() || order.wilaya;
    const normalizedInput = normalizeStr(cleanName);
    
    const wilayaObj = wilayas.find(w => 
      normalizeStr(w.name) === normalizedInput || 
      normalizeStr(w.nameAr) === normalizedInput ||
      w.name.toLowerCase() === cleanName.toLowerCase() ||
      w.nameAr === cleanName
    );

    let newDeliveryFee = order.delivery_fee;
    if (wilayaObj) {
      newDeliveryFee = newType.includes("مكتب") || newType.toLowerCase().includes("stop desk") ? wilayaObj.stop : wilayaObj.home;
    }

    const newTotalAmount = (Number(order.total_amount || 0) - Number(order.delivery_fee || 0)) + Number(newDeliveryFee || 0);

    const updates: any = {
      delivery_type: newType,
      delivery_fee: newDeliveryFee,
      total_amount: newTotalAmount
    };

    if (!newType.includes("مكتب") && !newType.toLowerCase().includes("stop desk")) {
      updates.selectedDesk = null;
    }

    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    await supabase.from('orders').update(updates).eq('id', id);
  };

  const syncZRExpress = async () => {
    setIsSyncing(true);
    
    // --- DEBUG LOGGING ---
    console.log(`[SYNC DEBUG] Total orders loaded in table: ${orders.length}`);
    const eligibleOrders = [];
    
    orders.forEach(o => {
      // Evaluate conditions
      const rawStatus = o.status;
      const isConfirmed = rawStatus === 'مؤكد' || getStatusConfig(rawStatus).label === 'مؤكد';
      const hasTracking = o.tracking_number && String(o.tracking_number).startsWith("ZRE");
      
      const include = isConfirmed && !hasTracking;
      
      if (include) {
        eligibleOrders.push(o);
      } else {
        // Log skipped confirmed orders to debug
        if (isConfirmed) {
           console.log(`[SYNC DEBUG] Excluded Confirmed Order #${o.id}`);
           console.log(`  - status = ${rawStatus} (isConfirmed: ${isConfirmed})`);
           console.log(`  - tracking_number = ${o.tracking_number || "null"} (hasTracking: ${!!hasTracking})`);
           console.log(`  - zr_express_id = ${o.zr_express_id || "null"}`);
           console.log(`  - Excluded because: hasTracking is ${hasTracking}`);
        }
      }
    });
    
    console.log(`[SYNC DEBUG] Eligible orders found: ${eligibleOrders.length}`);
    // -----------------------

    const ordersToSync = eligibleOrders;

    if (ordersToSync.length === 0) {
      alert("لا يوجد طلبات مؤكدة وغير مزامنة بانتظار المزامنة.");
      setIsSyncing(false);
      return;
    }

    for (let o of ordersToSync) {
      console.log('=== RAW MULTI-ITEM ORDER FROM SUPABASE ===', JSON.stringify(o, null, 2));

      // Inspect & Extract Safe Data: Unwrap if wrapped inside an array
      if (Array.isArray(o) && o.length > 0) {
        o = o[0];
      } else if (o.orders && Array.isArray(o.orders) && o.orders.length > 0) {
        o = o.orders[0];
      }

      const wilaya = o.wilaya || (o as any).shipping_wilaya || (o as any).customer_info?.wilaya || (o as any).customer_wilaya || '';
      const commune = o.commune || (o as any).shipping_commune || (o as any).customer_info?.commune || (o as any).customer_commune || '';
      if (!wilaya || !commune) {
        console.error('Missing location data in order:', o);
        alert('Order keys: ' + Object.keys(o).join(', ') + '\nعذراً، بيانات الولاية أو البلدية مفقودة لهذا الطلب في لوحة التحكم');
        setIsSyncing(false);
        return;
      }
    }

    try {
      const response = await syncConfirmedOrdersFn({
        data: { ordersToSync: ordersToSync.map(o => o.id) }
      });

      if (!response.success && !response.results?.length) {
        alert(response.message);
        return;
      }

      if (response.results) {
        // Update local state for successful ones
        for (const result of response.results) {
          if (result.success && result.trackingNumber) {
            setOrders(prev => prev.map(o => o.id === result.id ? { ...o, tracking_number: result.trackingNumber, zr_express_id: result.zrExpressId } : o));
          }
        }

        // Build a detailed feedback string
        const lines = [`نجحت مزامنة ${response.successCount} من ${response.successCount! + response.failedCount!} طلب.`];
        
        const failures = response.results.filter(r => !r.success);
        if (failures.length > 0) {
           lines.push("\n--- الأخطاء ---");
           failures.forEach(f => {
              lines.push(`\nOrder #${f.id}`);
              lines.push(`Stage: ${f.stage}`);
              lines.push(`Failure reason: ${f.message}`);
              if (f.details) lines.push(`Details: ${f.details}`);
              
              if (f.debugContext) {
                 lines.push(`\nContext:`);
                 lines.push(`- customer name: ${f.debugContext.customerName || ''}`);
                 lines.push(`- phone: ${f.debugContext.phoneStr || f.debugContext.phone || ''}`);
                 lines.push(`- wilaya: ${f.debugContext.targetWilaya || f.debugContext.wilaya || ''}`);
                 lines.push(`- commune: ${f.debugContext.targetCommune || f.debugContext.commune || ''}`);
                 lines.push(`- delivery type: ${f.debugContext.deliveryType || f.debugContext.delivery_type || ''}`);
                 lines.push(`- desk: ${f.debugContext.deskName || 'N/A'}`);
              }
              
              if (f.payload) {
                 lines.push(`\nPayload sent to ZR:`);
                 lines.push(JSON.stringify(f.payload, null, 2));
              }
              
              if (f.responseBody) {
                 lines.push(`\nZR Response:`);
                 lines.push(f.responseBody);
              }
              
              lines.push("----------------");
           });
           
           console.error("[SYNC FAILURES BREAKDOWN]", failures);
        }
        
        // Output exactly to console for easy reading
        console.log("FINAL ALERT:\n", lines.join("\n"));
        alert(lines.join("\n"));
      } else {
        alert("اكتملت المزامنة ولكن لم يتم إرجاع تفاصيل.");
      }
    } catch (error) {
      console.error("Sync error:", error);
      alert("حدث خطأ أثناء المزامنة.");
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleOrderSelection = (id: string) => {
    const newSet = new Set(selectedOrders);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedOrders(newSet);
  };

  const toggleAllFilteredOrders = () => {
    if (selectedOrders.size === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const updateBulkStatus = async (newStatus: string) => {
    if (selectedOrders.size === 0) return;
    const ids = Array.from(selectedOrders);
    // Optimistic update
    setOrders(prev => prev.map(o => ids.includes(o.id) ? { ...o, status: newStatus } : o));
    setSelectedOrders(new Set()); // clear selection after action
    await supabase.from('orders').update({ status: newStatus }).in('id', ids);
  };

  const updateNotes = async (id: string, notes: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, notes } : o));
    await supabase.from('orders').update({ notes }).eq('id', id);
  };

  const confirmDelete = async (id: string) => {
    const previousOrders = [...orders];
    setOrders(prev => prev.filter(o => o.id !== id));
    setOrderToDelete(null);
    
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) {
      console.error("Delete Error:", error);
      alert("فشل الحذف! يرجى التأكد من تفعيل صلاحية الحذف (DELETE Policy) في Supabase (RLS).");
      setOrders(previousOrders);
    }
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
    
    let matchesDate = true;
    if (dateRangeFilter !== "all") {
      const orderDate = new Date(o.created_at);
      const now = new Date();
      if (dateRangeFilter === "today") {
        matchesDate = orderDate.toDateString() === now.toDateString();
      } else if (dateRangeFilter === "7days") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        matchesDate = orderDate >= sevenDaysAgo;
      } else if (dateRangeFilter === "thisMonth") {
        matchesDate = orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      } else if (dateRangeFilter === "custom") {
        if (customStartDate) {
          matchesDate = matchesDate && orderDate >= new Date(customStartDate);
        }
        if (customEndDate) {
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && orderDate <= end;
        }
      }
    }
    
    return matchesSearch && matchesStatus && matchesWilaya && matchesDate;
  });

  const uniqueWilayas = Array.from(new Set(orders.map(o => o.wilaya))).filter(Boolean);

  const exportToCSV = () => {
    const ordersToExport = selectedOrders.size > 0 
      ? filteredOrders.filter(o => selectedOrders.has(o.id))
      : filteredOrders;
      
    if (ordersToExport.length === 0) return;
    const headers = ["Order ID", "Date", "Time", "Customer Name", "Phone", "Wilaya", "Commune", "Address", "Product", "Variant", "Total Amount (DZD)", "Delivery Type", "Status", "Notes"];
    const rows = ordersToExport.map(order => {
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

  const totalSales = filteredOrders.reduce((sum, o) => sum + (Number(o.total_amount) - Number(o.delivery_fee || 0)), 0);
  
  return (
    <div className="space-y-8 max-w-[1800px] mx-auto w-full animate-in fade-in duration-500 font-sans pb-12" style={{ fontFamily: "'Cairo', sans-serif" }}>
      
      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-[#0E1A2F] dark:bg-[#E5E7EB] rounded-2xl p-8 flex items-center justify-between shadow-sm dark:shadow-none text-white dark:text-[#0B1120] border border-[#0E1A2F]">
          <div>
            <p className="text-base font-bold text-slate-300 mb-3">إجمالي الطلبات</p>
            <p className="text-5xl font-black">{filteredOrders.length}</p>
          </div>
          <ShoppingBag size={64} className="text-[#C9A46A] dark:text-[#D4AF37] opacity-90" strokeWidth={1.5}/>
        </div>

        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E5E7EB] dark:border-[#374151] p-8 flex items-center justify-between shadow-sm dark:shadow-none hover:shadow-md dark:shadow-none transition-shadow">
          <div>
            <p className="text-base font-bold text-slate-500 dark:text-[#9CA3AF] mb-3">طلبات جديدة</p>
            <p className="text-5xl font-black text-slate-900 dark:text-[#F9FAFB]">{filteredOrders.filter(o => o.status === 'pending' || o.status === 'جديد').length}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-2xl text-blue-600"><Plus size={40} strokeWidth={2}/></div>
        </div>

        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E5E7EB] dark:border-[#374151] p-8 flex items-center justify-between shadow-sm dark:shadow-none hover:shadow-md dark:shadow-none transition-shadow">
          <div>
            <p className="text-base font-bold text-slate-500 dark:text-[#9CA3AF] mb-3">قيد التوصيل</p>
            <p className="text-5xl font-black text-slate-900 dark:text-[#F9FAFB]">{filteredOrders.filter(o => o.status === 'delivery' || o.status === 'قيد التوصيل').length}</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-2xl text-orange-600"><Truck size={40} strokeWidth={2}/></div>
        </div>

        <div className="bg-[#C9A46A] dark:bg-[#D4AF37] rounded-2xl p-8 flex items-center justify-between shadow-sm dark:shadow-none text-white dark:text-[#0B1120] border border-[#C9A46A] dark:border-[#D4AF37]">
          <div>
            <p className="text-base font-bold text-white dark:text-[#0B1120]/90 mb-3">المبيعات الإجمالية</p>
            <p className="text-3xl font-black" dir="ltr">{totalSales.toLocaleString()} <span className="text-lg font-normal">DZD</span></p>
          </div>
          <Wallet size={64} className="text-white dark:text-[#0B1120] opacity-90" strokeWidth={1.5}/>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E5E7EB] dark:border-[#374151] p-6 shadow-sm dark:shadow-none flex flex-col gap-6 justify-between">
        <div className="flex flex-1 flex-col xl:flex-row flex-wrap gap-6 w-full justify-between items-center">
          <div className="flex flex-1 flex-col md:flex-row flex-wrap gap-4 w-full">
            <button 
              onClick={syncZRExpress}
              disabled={isSyncing}
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap text-base w-full md:w-auto order-first md:order-none"
            >
              {isSyncing ? <RefreshCw size={20} className="animate-spin" /> : <RefreshCw size={20} />}
              مزامنة ZR Express 🔄
            </button>
            {/* Search */}
            <div className="relative flex-1 min-w-[280px] max-w-xl">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
              <input 
                type="text" 
                placeholder="البحث بالاسم، الهاتف، أو رقم الطلب..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[52px] bg-[#F7F5F0] dark:bg-[#0B1120] border border-transparent rounded-xl py-3 pr-12 pl-4 text-base font-bold outline-none focus:border-[#0E1A2F] focus:bg-white focus:ring-2 focus:ring-[#0E1A2F]/10 transition-all placeholder:text-slate-400 dark:text-slate-500 text-slate-800 dark:text-[#F9FAFB] shadow-inner"
              />
            </div>
            
            {/* Date Range Filter */}
            <div className="relative min-w-[180px]">
              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <select 
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value)}
                className="h-[52px] w-full bg-[#F7F5F0] dark:bg-[#0B1120] border border-transparent rounded-xl py-3 pr-12 pl-4 text-base font-bold outline-none focus:border-[#0E1A2F] focus:bg-white focus:ring-2 focus:ring-[#0E1A2F]/10 appearance-none cursor-pointer text-slate-800 dark:text-[#F9FAFB] transition-all shadow-inner"
              >
                <option value="all">كل الأوقات</option>
                <option value="today">اليوم</option>
                <option value="7days">آخر 7 أيام</option>
                <option value="thisMonth">هذا الشهر</option>
                <option value="custom">تاريخ مخصص...</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative min-w-[180px]">
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-[52px] w-full bg-[#F7F5F0] dark:bg-[#0B1120] border border-transparent rounded-xl py-3 pr-12 pl-4 text-base font-bold outline-none focus:border-[#0E1A2F] focus:bg-white focus:ring-2 focus:ring-[#0E1A2F]/10 appearance-none cursor-pointer text-slate-800 dark:text-[#F9FAFB] transition-all shadow-inner"
              >
                <option value="all">كل الحالات</option>
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* Wilaya Filter */}
            <div className="relative min-w-[180px]">
              <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <select 
                value={wilayaFilter}
                onChange={(e) => setWilayaFilter(e.target.value)}
                className="h-[52px] w-full bg-[#F7F5F0] dark:bg-[#0B1120] border border-transparent rounded-xl py-3 pr-12 pl-4 text-base font-bold outline-none focus:border-[#0E1A2F] focus:bg-white focus:ring-2 focus:ring-[#0E1A2F]/10 appearance-none cursor-pointer text-slate-800 dark:text-[#F9FAFB] transition-all shadow-inner"
              >
                <option value="all">كل الولايات</option>
                {uniqueWilayas.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          </div>

          <button onClick={exportToCSV} className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[#0E1A2F] dark:bg-[#E5E7EB] text-white dark:text-[#0B1120] rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-md dark:shadow-none whitespace-nowrap text-base w-full md:w-auto">
            <Download size={20} strokeWidth={2.5} />
            {selectedOrders.size > 0 ? `تصدير المحدد (${selectedOrders.size})` : "تصدير إلى Excel"}
          </button>
        </div>
        
        {/* Custom Date Range Inputs */}
        {dateRangeFilter === "custom" && (
          <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-500">من:</span>
              <input 
                type="date" 
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-[#F7F5F0] dark:bg-[#0B1120] border-transparent rounded-lg py-2.5 px-4 text-sm font-bold outline-none focus:border-[#0E1A2F] focus:ring-2 focus:ring-[#0E1A2F]/10 text-slate-800 dark:text-[#F9FAFB]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-500">إلى:</span>
              <input 
                type="date" 
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-[#F7F5F0] dark:bg-[#0B1120] border-transparent rounded-lg py-2.5 px-4 text-sm font-bold outline-none focus:border-[#0E1A2F] focus:ring-2 focus:ring-[#0E1A2F]/10 text-slate-800 dark:text-[#F9FAFB]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Compact Status Summary Bar */}
      <div className="flex flex-wrap gap-4">
        {STATUS_OPTIONS.map(statusObj => {
          const count = orders.filter(o => {
            // Need to match exactly what getStatusConfig returns so legacy maps to new properly
            const config = getStatusConfig(o.status);
            return config.value === statusObj.value;
          }).length;
          
          const Icon = statusObj.icon;
          
          return (
            <div key={statusObj.value} className={`flex-1 min-w-[160px] bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] rounded-2xl p-4 flex items-center justify-between shadow-sm dark:shadow-none hover:border-slate-300 transition-all cursor-default group relative overflow-hidden`}>
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity ${statusObj.bg.replace('/10', '')}`}></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className={`p-2.5 rounded-xl ${statusObj.bg} ${statusObj.color}`}>
                  <Icon size={18} strokeWidth={2.5} />
                </div>
                <span className="text-sm font-bold text-slate-600 dark:text-[#9CA3AF] group-hover:text-slate-900 dark:group-hover:text-[#F9FAFB] transition-colors">{statusObj.label}</span>
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-[#F9FAFB] relative z-10">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] rounded-2xl shadow-sm dark:shadow-none overflow-hidden relative">
        {selectedOrders.size > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/30 p-5 flex items-center justify-between animate-in slide-in-from-top-2">
            <div className="flex items-center gap-4">
              <span className="font-bold text-blue-700 dark:text-blue-400">
                تم تحديد {selectedOrders.size} طلب
              </span>
              <div className="h-5 w-[1px] bg-blue-200 dark:bg-blue-800"></div>
              <select
                className="bg-white dark:bg-[#111827] border border-blue-200 dark:border-blue-800 text-sm font-bold text-blue-700 dark:text-blue-400 rounded-lg px-4 py-2 outline-none cursor-pointer"
                onChange={(e) => {
                  if(e.target.value) {
                    updateBulkStatus(e.target.value);
                    e.target.value = "";
                  }
                }}
                defaultValue=""
              >
                <option value="" disabled>تغيير الحالة إلى...</option>
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <button 
              onClick={() => setSelectedOrders(new Set())}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-bold px-4 py-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg transition-colors"
            >
              إلغاء التحديد
            </button>
          </div>
        )}
        <div className="overflow-x-auto w-full pb-4" style={{ maxHeight: "calc(100vh - 280px)" }}>
          <table className="w-full text-sm text-center border-collapse">
            <thead className="sticky top-0 z-20 bg-[#F7F5F0]/95 dark:bg-[#0B1120]/95 backdrop-blur-md shadow-sm dark:shadow-none">
              <tr className="text-[#0E1A2F] dark:text-[#F9FAFB]">
                {/* Right-to-Left Column Order */}
                <th className="px-3 py-4 font-bold border-b border-[#E5E7EB] dark:border-[#374151] bg-[#F7F5F0]/95 dark:bg-[#0B1120]/95 backdrop-blur-md sticky right-0 z-30 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] w-[110px]">
                  <div className="flex items-center gap-2 justify-center">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300 cursor-pointer"
                      checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                      onChange={toggleAllFilteredOrders}
                      title="تحديد الكل"
                    />
                    <span>الحالة</span>
                  </div>
                </th>
                <th className="px-3 py-4 font-bold border-b border-[#E5E7EB] dark:border-[#374151] whitespace-nowrap w-[150px]">إجراءات</th>
                <th className="px-3 py-4 font-bold border-b border-[#E5E7EB] dark:border-[#374151] whitespace-nowrap min-w-[150px]">ملاحظات</th>
                <th className="px-3 py-4 font-bold border-b border-[#E5E7EB] dark:border-[#374151] whitespace-nowrap w-[90px]">التتبع</th>
                <th className="px-3 py-4 font-bold border-b border-[#E5E7EB] dark:border-[#374151] whitespace-nowrap text-[#C9A46A] dark:text-[#D4AF37] w-[100px]">المجموع</th>
                <th className="px-3 py-4 font-bold border-b border-[#E5E7EB] dark:border-[#374151] whitespace-nowrap w-[110px]">المنتج / التوصيل</th>
                <th className="px-3 py-4 font-bold border-b border-[#E5E7EB] dark:border-[#374151] whitespace-nowrap w-[90px]">النوع</th>
                <th className="px-3 py-4 font-bold border-b border-[#E5E7EB] dark:border-[#374151] whitespace-nowrap w-[130px]">الولاية / البلدية</th>
                <th className="px-3 py-4 font-bold border-b border-[#E5E7EB] dark:border-[#374151] whitespace-nowrap w-[80px]">المقاس</th>
                <th className="px-3 py-4 font-bold border-b border-[#E5E7EB] dark:border-[#374151] whitespace-nowrap w-[150px]">المنتج</th>
                <th className="px-3 py-4 font-bold border-b border-[#E5E7EB] dark:border-[#374151] whitespace-nowrap w-[110px]">الهاتف</th>
                <th className="px-3 py-4 font-bold border-b border-[#E5E7EB] dark:border-[#374151] whitespace-nowrap w-[140px]">الاسم</th>
                <th className="px-3 py-4 font-bold border-b border-[#E5E7EB] dark:border-[#374151] whitespace-nowrap text-slate-500 w-[80px]">الطلب</th>
                <th className="px-3 py-4 font-bold border-b border-[#E5E7EB] dark:border-[#374151] whitespace-nowrap w-[70px]">الوقت</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={14} className="p-16 text-slate-400 dark:text-slate-500 font-bold text-lg">جاري تحميل الطلبات...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={14} className="p-16 text-slate-400 dark:text-slate-500 font-bold text-lg">لا توجد طلبات مطابقة</td></tr>
              ) : (() => {
                const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE) || 1;
                const paginatedOrders = filteredOrders.slice((currentPage - 1) * ORDERS_PER_PAGE, currentPage * ORDERS_PER_PAGE);
                return paginatedOrders.map((order, i) => {
                  const dateObj = new Date(order.created_at);
                  const time = dateObj.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' });
                  const date = dateObj.toLocaleDateString("en-GB", { day: '2-digit', month: 'short' });
                  const productFee = order.total_amount - (order.delivery_fee || 0);

                  return (
                  <tr key={order.id} className={`h-[72px] border-b border-[#E5E7EB] dark:border-slate-700 hover:bg-[#F7F5F0]/60 dark:hover:bg-[#1f2937] transition-colors ${i % 2 === 0 ? 'bg-white dark:bg-[#111827]' : 'bg-[#FAFAFA]'}`}>
                    
                  {/* Status - Sticky Right */}
                  <td className={`px-2 py-2 border-l border-[#E5E7EB] dark:border-slate-700 bg-inherit sticky right-0 z-10 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] ${i % 2 === 0 ? 'bg-white dark:bg-[#111827]' : 'bg-[#FAFAFA] group-hover:bg-[#F7F5F0]/60 dark:hover:bg-[#1f2937]'}`}>
                    <div className="flex items-center justify-center gap-2">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 z-20 cursor-pointer relative"
                        checked={selectedOrders.has(order.id)}
                        onChange={() => toggleOrderSelection(order.id)}
                      />
                      <div className="relative group cursor-pointer flex-1 h-full flex items-center justify-center">
                        <select 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          value={getStatusConfig(order.status).value}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                        <StatusBadge status={order.status} />
                      </div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-2 py-2 border-l border-[#E5E7EB] dark:border-slate-700 relative">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); setOrderToDelete(order.id); }} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors shadow-sm border border-red-100" title="حذف نهائي">
                          <Trash2 size={15} strokeWidth={2.5} />
                        </button>
                        <button onClick={() => copyToClipboard(order.phone)} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#374151] text-slate-600 dark:text-[#9CA3AF] flex items-center justify-center hover:bg-slate-200 transition-colors shadow-sm border border-slate-200" title="نسخ الرقم">
                          <Copy size={15} strokeWidth={2.5} />
                        </button>
                        
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <button 
                              className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors shadow-sm border border-blue-100 relative outline-none" 
                              title="حالة الاتصال"
                            >
                              <Phone size={15} strokeWidth={2.5} />
                              {order.call_status && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white" style={{ backgroundColor: CALL_STATUS_OPTIONS.find(c => c.value === order.call_status)?.color }}></span>
                              )}
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-48 z-[9999] rounded-xl p-2 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl" align="end" sideOffset={8}>
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

                        <a href={`https://wa.me/213${order.phone.replace(/^0+/, '')}`} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors shadow-sm border border-green-100" title="مراسلة عبر واتساب">
                          <MessageCircle size={15} strokeWidth={2.5} />
                        </a>
                      </div>

                      {/* Call Status Badge */}
                      {order.call_status && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black shadow-sm cursor-default ${CALL_STATUS_OPTIONS.find(c => c.value === order.call_status)?.bg} ${CALL_STATUS_OPTIONS.find(c => c.value === order.call_status)?.text}`}>
                            {order.call_status}
                          </div>
                          <button 
                            onClick={() => updateCallStatus(order.id, "")}
                            className="w-4 h-4 flex items-center justify-center rounded-full bg-slate-100 dark:bg-[#374151] text-slate-400 hover:bg-red-100 hover:text-red-500 transition-colors"
                            title="مسح حالة الاتصال"
                          >
                            <X size={10} strokeWidth={3} />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* Notes */}
                  <td className="px-3 py-2 border-l border-[#E5E7EB] dark:border-slate-700">
                    <textarea 
                      className="w-full h-11 resize-none bg-[#F7F5F0] dark:bg-[#0B1120] border border-transparent hover:border-slate-200 focus:border-[#C9A46A] focus:bg-white dark:bg-[#111827] rounded-lg p-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                      placeholder="أضف ملاحظة..."
                      defaultValue={order.notes || ""}
                      onBlur={(e) => updateNotes(order.id, e.target.value)}
                    />
                  </td>

                  {/* Tracking Number */}
                  <td className="px-3 py-2 border-l border-[#E5E7EB] dark:border-slate-700 text-xs font-mono font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {order.tracking_number ? (
                      <button onClick={() => copyToClipboard(order.tracking_number || "")} className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-md hover:bg-slate-200 transition-colors flex items-center gap-1.5 mx-auto" title="نسخ رقم التتبع">
                        <Copy size={12} /> {order.tracking_number}
                      </button>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600">-</span>
                    )}
                  </td>

                  {/* Total */}
                  <td className="px-3 py-2 border-l border-[#E5E7EB] dark:border-slate-700 font-black text-base text-[#0E1A2F] dark:text-[#F9FAFB] bg-[#C9A46A]/10 dark:bg-[#D4AF37]/10 whitespace-nowrap" dir="ltr">
                    {Number(order.total_amount || 0).toLocaleString()} <span className="text-[10px] text-[#C9A46A] dark:text-[#D4AF37] font-bold">DZD</span>
                  </td>

                  {/* Product & Delivery Fee (Stacked) */}
                  <td className="px-3 py-2 border-l border-[#E5E7EB] dark:border-slate-700 font-bold whitespace-nowrap" dir="ltr">
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <div className="text-slate-800 dark:text-[#F9FAFB] text-sm">
                        {productFee.toLocaleString()} <span className="text-[9px] text-slate-500 font-normal">DZD</span>
                      </div>
                      <div className="text-slate-500 dark:text-[#9CA3AF] text-xs">
                        + {Number(order.delivery_fee || 0).toLocaleString()} <span className="text-[9px] font-normal">DZD</span>
                      </div>
                    </div>
                  </td>

                  {/* Delivery Type */}
                  <td className="px-3 py-2 border-l border-[#E5E7EB] dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold whitespace-nowrap">
                    <div className="flex flex-col items-center justify-center gap-1 w-full relative">
                      <div className="relative group cursor-pointer w-full">
                        <select 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          value={order.delivery_type?.includes("مكتب") || order.delivery_type?.toLowerCase().includes("stop desk") ? "استلام من المكتب (Stop Desk)" : "توصيل للمنزل"}
                          onChange={(e) => updateDeliveryType(order.id, e.target.value)}
                        >
                          <option value="توصيل للمنزل">توصيل للمنزل</option>
                          <option value="استلام من المكتب (Stop Desk)">استلام من المكتب (Stop Desk)</option>
                        </select>
                        <div className="flex items-center justify-center gap-1 px-2 py-1.5 bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] rounded-md shadow-sm w-full group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors">
                          {!order.delivery_type?.includes("مكتب") && !order.delivery_type?.toLowerCase().includes("stop desk") ? <MapPin size={12} className="text-[#C9A46A] dark:text-[#D4AF37] shrink-0"/> : <Box size={12} className="text-slate-400 dark:text-slate-500 shrink-0"/>}
                          <span className="truncate">{order.delivery_type?.includes("مكتب") || order.delivery_type?.toLowerCase().includes("stop desk") ? "استلام من المكتب" : "توصيل للمنزل"}</span>
                          <ChevronDown size={10} className="text-slate-400 shrink-0 mr-1" />
                        </div>
                      </div>
                      
                      {(order.delivery_type?.includes("مكتب") || order.delivery_type?.toLowerCase().includes("stop desk") || order.delivery_type?.includes("استلام")) && (
                        <ZROfficeSelect 
                          wilaya={order.wilaya} 
                          selectedOffice={order.selectedDesk ? {
                            name: order.selectedDesk.name,
                            wilaya: order.selectedDesk.wilaya,
                            commune: order.selectedDesk.commune,
                            address: order.selectedDesk.address,
                            phone: order.selectedDesk.phone,
                            cp: order.selectedDesk.cp
                          } : order.selectedDeskName ? {
                            name: order.selectedDeskName,
                            wilaya: order.selectedDeskWilaya,
                            commune: order.selectedDeskCommune,
                            address: order.selectedDeskAddress,
                            phone: order.selectedDeskPhone,
                            cp: order.selectedDeskCP
                          } : null}
                          onSelect={(office) => updateZROffice(order.id, office)}
                        />
                      )}
                    </div>
                  </td>

                  {/* Wilaya & Commune (Stacked) */}
                  <td className="px-3 py-2 border-l border-[#E5E7EB] dark:border-slate-700 whitespace-normal break-words leading-tight">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="text-[#0E1A2F] dark:text-[#F9FAFB] font-black text-sm">{order.wilaya}</span>
                      <span className="text-slate-500 dark:text-[#9CA3AF] text-xs font-bold bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded">{order.commune}</span>
                    </div>
                  </td>

                  {/* Variant */}
                  <td className="px-3 py-2 border-l border-[#E5E7EB] dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold whitespace-nowrap">
                    {order.variant_title && <span className="px-2 py-1 bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] shadow-sm rounded-md text-[11px]">{order.variant_title}</span>}
                  </td>

                  {/* Product */}
                  <td className="px-3 py-2 border-l border-[#E5E7EB] dark:border-slate-700 text-[#0E1A2F] dark:text-[#F9FAFB] font-bold text-sm whitespace-normal break-words leading-tight">
                    {order.product_name}
                  </td>

                  {/* Phone */}
                  <td className="px-3 py-2 border-l border-[#E5E7EB] dark:border-slate-700 font-black text-[#0E1A2F] dark:text-[#F9FAFB] hover:text-[#C9A46A] dark:text-[#D4AF37] transition-colors cursor-pointer text-sm whitespace-nowrap" dir="ltr" onClick={() => copyToClipboard(order.phone)} title="انقر للنسخ">
                    {order.phone}
                  </td>

                  {/* Name */}
                  <td className="px-3 py-2 border-l border-[#E5E7EB] dark:border-slate-700 text-[#0E1A2F] dark:text-[#F9FAFB] font-black text-sm whitespace-normal break-words leading-tight">
                    {order.fullname}
                  </td>

                  {/* Order ID */}
                  <td className="px-3 py-2 border-l border-[#E5E7EB] dark:border-slate-700 text-slate-400 dark:text-slate-500 font-mono text-xs font-bold whitespace-nowrap">#{order.order_id.split('-')[1] || order.order_id}</td>

                  {/* Time */}
                  <td className="px-3 py-2 text-slate-500 dark:text-[#9CA3AF] font-bold whitespace-nowrap" dir="ltr">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-slate-800 dark:text-[#F9FAFB] text-xs">{time}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">{date}</span>
                    </div>
                  </td>
                </tr>
                );
              })
              })()}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        {filteredOrders.length > ORDERS_PER_PAGE && (
          <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-[#374151] bg-[#F7F5F0]/50 dark:bg-[#0B1120]/50">
            <span className="text-sm font-bold text-slate-500 dark:text-[#9CA3AF]">
              الصفحة {currentPage} من {Math.ceil(filteredOrders.length / ORDERS_PER_PAGE)}
            </span>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-4 py-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] rounded-lg text-sm font-bold disabled:opacity-50 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                السابق
              </button>
              <button 
                disabled={currentPage === Math.ceil(filteredOrders.length / ORDERS_PER_PAGE)} 
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-4 py-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] rounded-lg text-sm font-bold disabled:opacity-50 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                التالي
              </button>
            </div>
          </div>
        )}
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
type ProductImageObj = { 
  id: string, 
  url?: string, 
  base64_800?: string,
  base64_400?: string,
  base64_160?: string,
  base64?: string, // for legacy fallback if needed
  group: 'gallery' | 'detail' | 'review'
};

function ProductsManager({ products, token, onRefresh, loading }: { products: ShopifyProduct[], token: string, onRefresh: (newProducts?: ShopifyProduct[]) => void, loading: boolean }) {
  const [mode, setMode] = useState<"list" | "edit" | "create">("list");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [productImages, setProductImages] = useState<ProductImageObj[]>([]);
  
  // Ref for hidden file input for replacing an image
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);

  const getActiveToken = () => {
    let activeToken = token || import.meta.env.VITE_GITHUB_TOKEN || localStorage.getItem("github_token");
    if (!activeToken) {
      activeToken = prompt("الرجاء إدخال رمز جيت هاب (GitHub PAT) لحفظ التعديلات:");
      if (activeToken) {
        localStorage.setItem("github_token", activeToken);
      }
    }
    return activeToken;
  };

  const handleGitHubError = (err: any, prefix = "Error") => {
    alert(`${prefix}: ${err.message}`);
    if (err.message?.includes("Bad credentials") || err.message?.includes("401") || err.message?.includes("Not Found") || err.message?.includes("404")) {
      localStorage.removeItem("github_token");
      alert("تم مسح رمز GitHub غير الصالح. يرجى المحاولة مرة أخرى وإدخال رمز صالح مع صلاحيات (repo).");
    }
  };

  const cleanUnusedImages = async () => {
    const activeToken = getActiveToken();
    if (!activeToken) return;
    setIsCleaning(true);
    try {
      // 1. Fetch all files from public/images
      const allFiles = await listFiles("public/images", activeToken);
      
      // 2. Parse products.json to collect all used filenames
      const usedUrls = new Set<string>();
      products.forEach(p => {
        p.node.images.edges.forEach(e => {
          const url = e.node.url;
          usedUrls.add(url);
          // If it's a webp, also mark the other variants as used
          if (url.endsWith("-800w.webp")) {
            usedUrls.add(url.replace("-800w.webp", "-400w.webp"));
            usedUrls.add(url.replace("-800w.webp", "-160w.webp"));
          }
        });
      });

      // 3. Find orphans
      const orphans = allFiles.filter(f => {
        // Only delete if it's not strictly referenced (checking filename ending)
        return !Array.from(usedUrls).some(usedUrl => usedUrl.endsWith(f.name));
      });

      if (orphans.length === 0) {
        alert("لا توجد صور غير مستخدمة / No unused images found");
        setIsCleaning(false);
        return;
      }

      if (!confirm(`تم العثور على ${orphans.length} صور غير مستخدمة. هل تريد حذفها نهائياً؟\nFound ${orphans.length} unused images. Delete them permanently?`)) {
        setIsCleaning(false);
        return;
      }

      // 4. Delete orphans sequentially
      let deleted = 0;
      for (const orphan of orphans) {
        await deleteFile(`public/images/${orphan.name}`, `Clean unused image ${orphan.name}`, activeToken);
        deleted++;
      }
      
      alert(`تم تنظيف ${deleted} صور بنجاح / Successfully cleaned ${deleted} images`);
    } catch (err: any) {
      handleGitHubError(err, "Error cleaning images");
    } finally {
      setIsCleaning(false);
    }
  };

  const startEdit = (product: ShopifyProduct) => {
    setMode("edit");
    setEditingProductId(product.node.id);
    const inventory = product.node.variants?.edges?.map(e => ({
      size: e.node.selectedOptions.find(o => o.name.toLowerCase() === "size")?.value || e.node.title,
      stock: e.node.quantityAvailable ?? 10 // Fallback to 10 for backward compatibility if undefined
    }));

    setEditForm({
      title: product.node.title,
      handle: product.node.handle,
      descriptionHtml: (product.node.descriptionHtml || "").replace(/<br\s*\/?>/gi, '\n'),
      price: product.node.priceRange.minVariantPrice.amount,
      comparePrice: product.node.compareAtPriceRange?.minVariantPrice?.amount || "",
      inventory: inventory.length > 0 ? inventory : [],
      offers: (product.node as any).offers || [],
      pricingConfig: (product.node as any).pricingConfig || {
        enabled: false,
        quantityRequired: 2,
        discountType: "fixed",
        discountValue: 0,
        badgeText: "",
        maxQuantity: 10
      },
      scarcityConfig: (product.node as any).scarcityConfig || {
        enableLowStockWarning: true,
        enableDiscountMessage: true,
        featuredLabelText: "",
        enableFastShipping: true,
        enableSizeScarcity: true,
        sizeLowStockThreshold: 3
      }
    });
    
    const allImages: ProductImageObj[] = [];
    product.node.images.edges.forEach((e, idx) => {
      allImages.push({ id: `img-gal-${Date.now()}-${idx}`, url: e.node.url, group: 'gallery' });
    });
    if (product.node.detailImages?.edges) {
      product.node.detailImages.edges.forEach((e, idx) => {
        allImages.push({ id: `img-det-${Date.now()}-${idx}`, url: e.node.url, group: 'detail' });
      });
    }
    if (product.node.reviewImages?.edges) {
      product.node.reviewImages.edges.forEach((e, idx) => {
        allImages.push({ id: `img-rev-${Date.now()}-${idx}`, url: e.node.url, group: 'review' });
      });
    }
    setProductImages(allImages);
  };

  const startCreate = () => {
    setMode("create");
    setEditingProductId(null);
    setEditForm({
      title: "",
      handle: "",
      descriptionHtml: "",
      price: "",
      comparePrice: "",
      inventory: [],
      offers: [],
      pricingConfig: {
        enabled: false,
        quantityRequired: 2,
        discountType: "fixed",
        discountValue: 0,
        badgeText: "",
        maxQuantity: 10
      },
      scarcityConfig: {
        enableLowStockWarning: true,
        enableDiscountMessage: true,
        featuredLabelText: "",
        enableFastShipping: true,
        enableSizeScarcity: true,
        sizeLowStockThreshold: 3
      }
    });
    setProductImages([]);
  };

  const resizeImage = (file: File, maxWidth: number): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ratio = maxWidth / img.width;
          const width = ratio < 1 ? img.width * ratio : img.width;
          const height = ratio < 1 ? img.height * ratio : img.height;
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/webp", 0.85);
          resolve(dataUrl.split(",")[1]);
        };
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, group: 'gallery' | 'detail' | 'review') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const base64_800 = await resizeImage(file, 800);
      const base64_400 = await resizeImage(file, 400);
      const base64_160 = await resizeImage(file, 160);
      
      setProductImages(prev => [...prev, {
        id: `new-${group}-${Date.now()}-${i}`,
        base64_800,
        base64_400,
        base64_160,
        url: URL.createObjectURL(file), // For immediate preview
        group
      }]);
    }
    
    // Clear input so same file can be selected again if needed
    e.target.value = "";
  };

  const handleImageReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !replaceTargetId) return;
    
    const file = files[0];
    const base64_800 = await resizeImage(file, 800);
    const base64_400 = await resizeImage(file, 400);
    const base64_160 = await resizeImage(file, 160);
    
    setProductImages(prev => prev.map(img => {
      if (img.id === replaceTargetId) {
        return {
          id: `new-${Date.now()}-replaced`,
          base64_800,
          base64_400,
          base64_160,
          url: URL.createObjectURL(file), // For preview
          group: img.group
        };
      }
      return img;
    }));
    
    setReplaceTargetId(null);
    e.target.value = "";
  };

  const triggerReplace = (id: string) => {
    setReplaceTargetId(id);
    if (replaceInputRef.current) replaceInputRef.current.click();
  };

  const moveImage = (indexWithinGroup: number, direction: -1 | 1, group: 'gallery' | 'detail' | 'review') => {
    setProductImages(prev => {
      const newArray = [...prev];
      const groupItems = newArray.filter(i => i.group === group);
      if (indexWithinGroup + direction < 0 || indexWithinGroup + direction >= groupItems.length) return newArray;
      
      const itemToMove = groupItems[indexWithinGroup];
      const itemToSwapWith = groupItems[indexWithinGroup + direction];
      
      const idxA = newArray.findIndex(i => i.id === itemToMove.id);
      const idxB = newArray.findIndex(i => i.id === itemToSwapWith.id);
      
      newArray[idxA] = itemToSwapWith;
      newArray[idxB] = itemToMove;
      
      return newArray;
    });
  };

  const removeImage = (id: string) => {
    setProductImages(prev => prev.filter(img => img.id !== id));
  };

  const generateShopifyNode = (form: any, galleryEdges: any[], detailEdges: any[], reviewEdges: any[], id: string) => {
    const inventory = form.inventory && form.inventory.length > 0 ? form.inventory : [];
    const options = inventory.length > 0 ? [{ name: "size", values: inventory.map((i: any) => i.size) }] : [];
    
    const compareAtPrice = form.comparePrice ? { amount: form.comparePrice, currencyCode: "DZD" } : undefined;
    
    const variantsEdges = inventory.length > 0 
      ? inventory.map((inv: any, idx: number) => ({
          node: {
            id: `gid://shopify/ProductVariant/${Date.now()}${idx}`,
            title: inv.size,
            availableForSale: true, // We still mark true for UI, stock handles disabled logic
            quantityAvailable: inv.stock,
            price: { amount: form.price, currencyCode: "DZD" },
            ...(compareAtPrice && { compareAtPrice }),
            selectedOptions: [{ name: "size", value: inv.size }]
          }
        }))
      : [{
          node: {
            id: `gid://shopify/ProductVariant/${Date.now()}`,
            title: "Default Title",
            availableForSale: true,
            quantityAvailable: 10,
            price: { amount: form.price, currencyCode: "DZD" },
            ...(compareAtPrice && { compareAtPrice }),
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
      ...(compareAtPrice && { compareAtPriceRange: { minVariantPrice: compareAtPrice, maxVariantPrice: compareAtPrice } }),
      images: { edges: galleryEdges },
      detailImages: { edges: detailEdges },
      reviewImages: { edges: reviewEdges },
      variants: { edges: variantsEdges },
      options: options,
      offers: form.offers || [],
      pricingConfig: form.pricingConfig || {
        enabled: false,
        quantityRequired: 2,
        discountType: "fixed",
        discountValue: 0,
        badgeText: "",
        maxQuantity: 10
      },
      scarcityConfig: form.scarcityConfig || {
        enableLowStockWarning: true,
        enableDiscountMessage: true,
        featuredLabelText: "",
        enableFastShipping: true,
        enableSizeScarcity: true,
        sizeLowStockThreshold: 3
      }
    };
  };

  const saveProduct = async () => {
    const activeToken = getActiveToken();
    if (!activeToken) return;
    if (!editForm.title || !editForm.price) {
      alert("الرجاء إدخال اسم المنتج والسعر / Please enter title and price");
      return;
    }
    setIsSaving(true);
    try {
      const galleryEdges: any[] = [];
      const detailEdges: any[] = [];
      const reviewEdges: any[] = [];
      
      // Upload new images and preserve existing ones
      for (let i = 0; i < productImages.length; i++) {
        const img = productImages[i];
        let finalUrl = img.url;
        
        if (img.base64_800 && img.base64_400 && img.base64_160) {
          const baseName = `product-${img.group}-${Date.now()}-${i}`;
          await commitFile(`public/images/${baseName}-800w.webp`, img.base64_800, `Upload 800w image for ${editForm.title}`, activeToken, true);
          await commitFile(`public/images/${baseName}-400w.webp`, img.base64_400, `Upload 400w image for ${editForm.title}`, activeToken, true);
          await commitFile(`public/images/${baseName}-160w.webp`, img.base64_160, `Upload 160w image for ${editForm.title}`, activeToken, true);
          finalUrl = `/images/${baseName}-800w.webp`;
        } else if (img.base64) {
          // Fallback for any legacy unoptimized upload logic
          const fileName = `product-${img.group}-${Date.now()}-${i}.png`;
          const imagePath = `public/images/${fileName}`;
          await commitFile(imagePath, img.base64, `Upload image for ${editForm.title}`, activeToken, true);
          finalUrl = `/images/${fileName}`;
        }
        
        if (finalUrl) {
          const edge = { node: { url: finalUrl, altText: null } };
          if (img.group === 'gallery') galleryEdges.push(edge);
          else if (img.group === 'detail') detailEdges.push(edge);
          else if (img.group === 'review') reviewEdges.push(edge);
        }
      }

      let updatedProducts = [...products];

      if (mode === "create") {
        const newId = `gid://shopify/Product/${Date.now()}`;
        const newNode = generateShopifyNode(editForm, galleryEdges, detailEdges, reviewEdges, newId);
        updatedProducts.push({ node: newNode as any });
      } else if (mode === "edit" && editingProductId) {
        updatedProducts = products.map(p => {
          if (p.node.id === editingProductId) {
            return { node: generateShopifyNode(editForm, galleryEdges, detailEdges, reviewEdges, editingProductId) as any };
          }
          return p;
        });
      }
      
      await commitFile(
        "public/data/products.json",
        JSON.stringify(updatedProducts, null, 2),
        `${mode === "create" ? "Create" : "Update"} product: ${editForm.title}`,
        activeToken,
        false
      );
      
      alert(mode === "create" ? "تمت إضافة المنتج بنجاح!" : "تم تحديث المنتج بنجاح!");
      setMode("list");
      onRefresh(updatedProducts);
    } catch (err: any) {
      handleGitHubError(err, "Error saving product");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProduct = async (id: string, title: string) => {
    if (!confirm(`هل أنت متأكد من حذف المنتج: ${title}؟\nAre you sure you want to delete this product?`)) return;
    
    const activeToken = getActiveToken();
    if (!activeToken) return;
    
    setIsSaving(true);
    try {
      const updatedProducts = products.filter(p => p.node.id !== id);
      await commitFile(
        "public/data/products.json",
        JSON.stringify(updatedProducts, null, 2),
        `Delete product: ${title}`,
        activeToken,
        false
      );
      alert("تم حذف المنتج بنجاح!");
      onRefresh(updatedProducts);
    } catch (err: any) {
      handleGitHubError(err, "Error deleting product");
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
              <label className="font-bold text-slate-700 dark:text-slate-200 text-sm">السعر بعد التخفيض (Price in DZD)</label>
              <input type="number" className="w-full border border-slate-300 p-3.5 rounded-xl outline-none focus:border-slate-800 text-left font-bold text-lg text-slate-900 dark:text-[#F9FAFB]" dir="ltr" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} />
            </div>
            <div className="space-y-3">
              <label className="font-bold text-slate-700 dark:text-slate-200 text-sm">السعر الأصلي (Compare Price - Optional)</label>
              <input type="number" className="w-full border border-slate-300 p-3.5 rounded-xl outline-none focus:border-slate-800 text-left font-bold text-lg text-slate-900 dark:text-[#F9FAFB]" dir="ltr" value={editForm.comparePrice || ""} onChange={e => setEditForm({...editForm, comparePrice: e.target.value})} placeholder="مثال: 7900" />
            </div>
            <div className="space-y-4 md:col-span-2 border border-slate-200 dark:border-slate-700 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
                <label className="font-bold text-slate-700 dark:text-slate-200 text-lg">المخزون والقياسات (Inventory & Sizes)</label>
                <button 
                  onClick={() => setEditForm({ ...editForm, inventory: [...(editForm.inventory || []), { size: "New Size", stock: 10 }] })} 
                  className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors"
                >
                  <Plus size={16} /> إضافة قياس
                </button>
              </div>
              
              {(editForm.inventory || []).length === 0 ? (
                <p className="text-center text-slate-500 py-4 text-sm font-medium">لا توجد قياسات مضافة. انقر على "إضافة قياس" للبدء.</p>
              ) : (
                <div className="grid gap-3">
                  {(editForm.inventory || []).map((inv: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="flex-1 space-y-1">
                        <label className="text-xs font-bold text-slate-500">القياس (Size)</label>
                        <input 
                          type="text" 
                          dir="ltr"
                          value={inv.size} 
                          onChange={(e) => {
                            const newInv = [...editForm.inventory];
                            newInv[idx].size = e.target.value;
                            setEditForm({ ...editForm, inventory: newInv });
                          }} 
                          className="w-full border border-slate-200 dark:border-slate-700 p-2 rounded-md outline-none focus:border-slate-900 font-bold text-left bg-transparent" 
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <label className="text-xs font-bold text-slate-500">الكمية (Stock)</label>
                        <input 
                          type="number" 
                          dir="ltr"
                          value={inv.stock} 
                          onChange={(e) => {
                            const newInv = [...editForm.inventory];
                            newInv[idx].stock = parseInt(e.target.value) || 0;
                            setEditForm({ ...editForm, inventory: newInv });
                          }} 
                          className="w-full border border-slate-200 dark:border-slate-700 p-2 rounded-md outline-none focus:border-slate-900 font-bold text-left bg-transparent" 
                        />
                      </div>
                      <button 
                        onClick={() => {
                          const newInv = [...editForm.inventory];
                          newInv.splice(idx, 1);
                          setEditForm({ ...editForm, inventory: newInv });
                        }}
                        className="mt-5 p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                        title="حذف القياس"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Pricing Configuration */}
            <div className="space-y-4 md:col-span-2 border border-slate-200 dark:border-slate-700 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
                <label className="font-bold text-slate-700 dark:text-slate-200 text-lg">إعدادات التسعير (Product Pricing)</label>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enableQuantityDiscount"
                    checked={editForm.pricingConfig?.enabled || false}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      pricingConfig: { ...editForm.pricingConfig, enabled: e.target.checked }
                    })}
                    className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <label htmlFor="enableQuantityDiscount" className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                    تفعيل تخفيض الكمية (Enable Quantity Discount)
                  </label>
                </div>

                {editForm.pricingConfig?.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">الكمية المطلوبة للتخفيض (Quantity Required)</label>
                      <input
                        type="number"
                        min="2"
                        dir="ltr"
                        value={editForm.pricingConfig?.quantityRequired || 2}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          pricingConfig: { ...editForm.pricingConfig, quantityRequired: Number(e.target.value) }
                        })}
                        className="w-full border border-slate-200 dark:border-slate-700 p-2 rounded outline-none focus:border-slate-900 bg-white dark:bg-slate-900 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">نوع التخفيض (Discount Type)</label>
                      <select
                        value={editForm.pricingConfig?.discountType || "fixed"}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          pricingConfig: { ...editForm.pricingConfig, discountType: e.target.value }
                        })}
                        className="w-full border border-slate-200 dark:border-slate-700 p-2 rounded outline-none focus:border-slate-900 bg-white dark:bg-slate-900 text-sm"
                      >
                        <option value="fixed">مبلغ ثابت (Fixed Amount)</option>
                        <option value="percentage">نسبة مئوية (Percentage)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">قيمة التخفيض (Discount Value)</label>
                      <input
                        type="number"
                        min="0"
                        dir="ltr"
                        value={editForm.pricingConfig?.discountValue || 0}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          pricingConfig: { ...editForm.pricingConfig, discountValue: Number(e.target.value) }
                        })}
                        className="w-full border border-slate-200 dark:border-slate-700 p-2 rounded outline-none focus:border-slate-900 bg-white dark:bg-slate-900 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">نص التخفيض (Badge Text)</label>
                      <input
                        type="text"
                        placeholder="مثال: وفر 800 دج"
                        value={editForm.pricingConfig?.badgeText || ""}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          pricingConfig: { ...editForm.pricingConfig, badgeText: e.target.value }
                        })}
                        className="w-full border border-slate-200 dark:border-slate-700 p-2 rounded outline-none focus:border-slate-900 bg-white dark:bg-slate-900 text-sm"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1 max-w-xs mt-4">
                  <label className="text-xs font-bold text-slate-500">أقصى كمية مسموحة للطلب (Max Quantity Allowed)</label>
                  <input
                    type="number"
                    min="1"
                    dir="ltr"
                    value={editForm.pricingConfig?.maxQuantity || 10}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      pricingConfig: { ...editForm.pricingConfig, maxQuantity: Number(e.target.value) }
                    })}
                    className="w-full border border-slate-200 dark:border-slate-700 p-2 rounded outline-none focus:border-slate-900 bg-white dark:bg-slate-900 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 md:col-span-2 border border-slate-200 dark:border-slate-700 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <label className="font-bold text-slate-700 dark:text-slate-200 text-lg border-b border-slate-200 dark:border-slate-700 pb-3 block">إعدادات الندرة والثقة (Scarcity & Trust)</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <input
                    type="checkbox"
                    id="enableLowStockWarning"
                    checked={editForm.scarcityConfig?.enableLowStockWarning ?? true}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      scarcityConfig: { ...editForm.scarcityConfig, enableLowStockWarning: e.target.checked }
                    })}
                    className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <label htmlFor="enableLowStockWarning" className="text-sm font-bold text-slate-700 select-none cursor-pointer">
                    تفعيل تحذير انخفاض المخزون
                  </label>
                </div>
                
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <input
                    type="checkbox"
                    id="enableDiscountMessage"
                    checked={editForm.scarcityConfig?.enableDiscountMessage ?? true}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      scarcityConfig: { ...editForm.scarcityConfig, enableDiscountMessage: e.target.checked }
                    })}
                    className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <label htmlFor="enableDiscountMessage" className="text-sm font-bold text-slate-700 select-none cursor-pointer">
                    تفعيل رسالة الخصم
                  </label>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <input
                    type="checkbox"
                    id="enableFastShipping"
                    checked={editForm.scarcityConfig?.enableFastShipping ?? true}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      scarcityConfig: { ...editForm.scarcityConfig, enableFastShipping: e.target.checked }
                    })}
                    className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <label htmlFor="enableFastShipping" className="text-sm font-bold text-slate-700 select-none cursor-pointer">
                    تفعيل رسالة الشحن السريع
                  </label>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <input
                    type="checkbox"
                    id="enableSizeScarcity"
                    checked={editForm.scarcityConfig?.enableSizeScarcity ?? true}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      scarcityConfig: { ...editForm.scarcityConfig, enableSizeScarcity: e.target.checked }
                    })}
                    className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <label htmlFor="enableSizeScarcity" className="text-sm font-bold text-slate-700 select-none cursor-pointer">
                    تفعيل ندرة المقاسات
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">نص الشريط المميز (Featured Label)</label>
                  <input
                    type="text"
                    placeholder="مثال: الأكثر طلبًا"
                    value={editForm.scarcityConfig?.featuredLabelText || ""}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      scarcityConfig: { ...editForm.scarcityConfig, featuredLabelText: e.target.value }
                    })}
                    className="w-full border border-slate-200 dark:border-slate-700 p-2 rounded outline-none focus:border-slate-900 bg-white dark:bg-slate-900 text-sm"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">حد المخزون المنخفض للمقاسات (Size Low Stock Threshold)</label>
                  <input
                    type="number"
                    min="1"
                    dir="ltr"
                    value={editForm.scarcityConfig?.sizeLowStockThreshold || 3}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      scarcityConfig: { ...editForm.scarcityConfig, sizeLowStockThreshold: Number(e.target.value) }
                    })}
                    className="w-full border border-slate-200 dark:border-slate-700 p-2 rounded outline-none focus:border-slate-900 bg-white dark:bg-slate-900 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 md:col-span-2 border border-slate-200 dark:border-slate-700 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
                <label className="font-bold text-slate-700 dark:text-slate-200 text-lg">العروض (Product Offers)</label>
                <button 
                  onClick={() => setEditForm({ ...editForm, offers: [...(editForm.offers || []), { id: `offer-${Date.now()}`, title: "عرض جديد", price: editForm.price, pieces: 1, active: true }] })} 
                  className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors"
                >
                  <Plus size={16} /> إضافة عرض
                </button>
              </div>
              
              {(editForm.offers || []).length === 0 ? (
                <p className="text-center text-slate-500 py-4 text-sm font-medium">لا توجد عروض. انقر على "إضافة عرض" للبدء.</p>
              ) : (
                <div className="grid gap-3">
                  {(editForm.offers || []).map((offer: any, idx: number) => (
                    <div key={offer.id} className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200">عرض #{idx + 1}</h4>
                        <div className="flex gap-2">
                           <button 
                             onClick={() => {
                               const newOffers = [...editForm.offers];
                               if (idx > 0) {
                                 const temp = newOffers[idx];
                                 newOffers[idx] = newOffers[idx - 1];
                                 newOffers[idx - 1] = temp;
                                 setEditForm({ ...editForm, offers: newOffers });
                               }
                             }}
                             disabled={idx === 0}
                             className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 font-bold"
                           >
                             ↑
                           </button>
                           <button 
                             onClick={() => {
                               const newOffers = [...editForm.offers];
                               if (idx < newOffers.length - 1) {
                                 const temp = newOffers[idx];
                                 newOffers[idx] = newOffers[idx + 1];
                                 newOffers[idx + 1] = temp;
                                 setEditForm({ ...editForm, offers: newOffers });
                               }
                             }}
                             disabled={idx === (editForm.offers || []).length - 1}
                             className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 font-bold"
                           >
                             ↓
                           </button>
                           <button 
                             onClick={() => {
                               const newOffers = [...editForm.offers];
                               newOffers.splice(idx, 1);
                               setEditForm({ ...editForm, offers: newOffers });
                             }}
                             className="p-1 text-red-500 hover:bg-red-50 rounded"
                           >
                             <Trash2 size={16} />
                           </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500">العنوان (Title)</label>
                          <input type="text" value={offer.title || ""} onChange={e => { const no = [...editForm.offers]; no[idx].title = e.target.value; setEditForm({...editForm, offers: no}); }} className="w-full border border-slate-200 dark:border-slate-700 p-2 rounded outline-none focus:border-slate-900 bg-transparent text-sm" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500">السعر (Price)</label>
                          <input type="number" dir="ltr" value={offer.price || ""} onChange={e => { const no = [...editForm.offers]; no[idx].price = Number(e.target.value); setEditForm({...editForm, offers: no}); }} className="w-full border border-slate-200 dark:border-slate-700 p-2 rounded outline-none focus:border-slate-900 bg-transparent text-sm" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500">السعر القديم (Compare Price)</label>
                          <input type="number" dir="ltr" value={offer.comparePrice || ""} onChange={e => { const no = [...editForm.offers]; no[idx].comparePrice = Number(e.target.value); setEditForm({...editForm, offers: no}); }} className="w-full border border-slate-200 dark:border-slate-700 p-2 rounded outline-none focus:border-slate-900 bg-transparent text-sm" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500">عدد القطع (Pieces)</label>
                          <input type="number" dir="ltr" min="1" value={offer.pieces || 1} onChange={e => { const no = [...editForm.offers]; no[idx].pieces = Number(e.target.value); setEditForm({...editForm, offers: no}); }} className="w-full border border-slate-200 dark:border-slate-700 p-2 rounded outline-none focus:border-slate-900 bg-transparent text-sm" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500">شريط لاصق (Badge)</label>
                          <input type="text" value={offer.badge || ""} onChange={e => { const no = [...editForm.offers]; no[idx].badge = e.target.value; setEditForm({...editForm, offers: no}); }} className="w-full border border-slate-200 dark:border-slate-700 p-2 rounded outline-none focus:border-slate-900 bg-transparent text-sm" placeholder="مثال: وفر 200 دج" />
                        </div>
                        <div className="space-y-1 flex items-end pb-1 gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={offer.active !== false} onChange={e => { const no = [...editForm.offers]; no[idx].active = e.target.checked; setEditForm({...editForm, offers: no}); }} />
                            <span className="text-xs font-bold text-slate-500">مفعل (Active)</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-6">
              <label className="font-bold text-slate-700 dark:text-slate-200 text-xl block mb-2 border-b pb-2">إدارة الصور (Image Manager)</label>
              
              {productImages.some(img => img.url?.endsWith(".png") || img.url?.endsWith(".jpg")) && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 p-3 rounded-xl flex items-start gap-3 mb-2">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold">تحذير: توجد صور غير محسنة (Warnings: Unoptimized Images Detected)</p>
                    <p>بعض الصور تستخدم صيغة قديمة (.png أو .jpg). يُرجى استبدالها بصيغة WebP المحسنة لتحسين سرعة الموقع وتقييم Lighthouse.</p>
                  </div>
                </div>
              )}

              <input type="file" accept="image/*" className="hidden" ref={replaceInputRef} onChange={handleImageReplace} />

              {[ 
                { id: 'gallery', title: 'الصور العلوية (Top Slider & Hero)' },
                { id: 'detail', title: 'صور التفاصيل (Middle Detail Images)' },
                { id: 'review', title: 'صور التقييمات (Customer Reviews)' }
              ].map(group => {
                const groupImages = productImages.filter(img => img.group === group.id);
                return (
                  <div key={group.id} className="border border-slate-200 dark:border-[#374151] rounded-xl bg-slate-50 dark:bg-[#1f2937] overflow-hidden mb-6">
                    <div className="bg-slate-100 dark:bg-slate-800 p-3 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200">
                      {group.title}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-right">
                        <thead className="bg-slate-50 dark:bg-[#1f2937] text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                          <tr>
                            <th className="p-3">الصورة (Preview)</th>
                            <th className="p-3">النوع (Role)</th>
                            <th className="p-3">الرابط والتحذيرات (URL & Warnings)</th>
                            <th className="p-3 text-center">ترتيب (Reorder)</th>
                            <th className="p-3 text-left">إجراءات (Actions)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                          {groupImages.map((img, indexWithinGroup) => {
                            const isLegacy = img.url && (img.url.endsWith(".png") || img.url.endsWith(".jpg"));
                            const isUnoptimized = img.url && !img.url.endsWith("-800w.webp") && !isLegacy;
                            
                            return (
                              <tr key={img.id} className="hover:bg-white dark:hover:bg-slate-800/50 transition-colors">
                                <td className="p-3">
                                  <div className="w-16 h-16 bg-white dark:bg-[#111827] rounded-lg border shadow-sm dark:shadow-none overflow-hidden">
                                    <img src={img.url || img.base64_160 || img.base64} className="w-full h-full object-cover" alt="product preview" />
                                  </div>
                                </td>
                                <td className="p-3">
                                  {group.id === 'gallery' && indexWithinGroup === 0 ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-md text-xs font-bold border border-emerald-200 dark:border-emerald-800/50">
                                      صورة العرض (Hero)
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-md text-xs font-bold border border-blue-200 dark:border-blue-800/50">
                                      {group.id === 'detail' ? 'تفاصيل (Detail)' : group.id === 'review' ? 'تقييم (Review)' : 'المعرض (Gallery)'}
                                    </span>
                                  )}
                                </td>
                                <td className="p-3">
                                  <div className="font-mono text-xs text-slate-500 dark:text-slate-400 max-w-[200px] truncate" dir="ltr" title={img.url}>
                                    {img.url ? img.url.split('/').pop() : 'New Image'}
                                  </div>
                                  {isLegacy && (
                                    <div className="text-[10px] text-amber-600 font-bold mt-1">⚠️ صيغة قديمة (.png/.jpg)</div>
                                  )}
                                  {isUnoptimized && (
                                    <div className="text-[10px] text-orange-500 font-bold mt-1">⚠️ غير محول للصيغ المتعددة</div>
                                  )}
                                </td>
                                <td className="p-3 text-center">
                                  <div className="flex flex-col items-center justify-center gap-1">
                                    <button 
                                      onClick={() => moveImage(indexWithinGroup, -1, group.id as any)}
                                      disabled={indexWithinGroup === 0}
                                      className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                      <ArrowUp size={14} />
                                    </button>
                                    <button 
                                      onClick={() => moveImage(indexWithinGroup, 1, group.id as any)}
                                      disabled={indexWithinGroup === groupImages.length - 1}
                                      className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                      <ArrowDown size={14} />
                                    </button>
                                  </div>
                                </td>
                                <td className="p-3 text-left space-x-2 space-x-reverse">
                                  <button 
                                    onClick={() => triggerReplace(img.id)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-100 font-bold text-xs shadow-sm transition-colors"
                                  >
                                    <Edit size={12} />
                                    استبدال (Replace)
                                  </button>
                                  <button 
                                    onClick={() => removeImage(img.id)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 font-bold text-xs shadow-sm transition-colors"
                                  >
                                    <Trash2 size={12} />
                                    حذف
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                          {groupImages.length === 0 && (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-slate-500">
                                <ImageIcon size={32} className="mx-auto mb-2 opacity-50" />
                                لا توجد صور في هذه المجموعة.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-4 bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div className="text-sm font-bold text-slate-600 dark:text-slate-300">
                        العدد: {groupImages.length}
                      </div>
                      <label className="flex items-center gap-2 px-5 py-2.5 bg-[#1e293b] text-white dark:text-[#0B1120] rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-md cursor-pointer text-sm">
                        <Upload size={16} />
                        إضافة صور
                        <input type="file" multiple accept="image/*" onChange={(e) => handleImageUpload(e, group.id as any)} className="hidden" />
                      </label>
                    </div>
                  </div>
                );
              })}
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
            onClick={cleanUnusedImages} 
            disabled={loading || isSaving || isCleaning}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg font-bold hover:bg-rose-100 transition-colors shadow-sm dark:shadow-none disabled:opacity-50 text-sm"
          >
            <Trash2 size={16} className={isCleaning ? "animate-pulse" : ""} />
            {isCleaning ? "جاري التنظيف..." : "تنظيف الصور غير المستخدمة"}
          </button>
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
