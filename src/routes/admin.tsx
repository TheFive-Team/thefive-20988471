import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";
import { commitFile } from "@/lib/github";
import { 
  ShoppingBag, Hourglass, Truck, CheckCircle, Wallet, Calendar, 
  MapPin, Phone, User, Hash, Clock, Box, FileText, Settings, 
  LogOut, AlertCircle, RefreshCw
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Dashboard — The Five A" }],
  }),
  component: AdminDashboard,
});

// Mock Orders Data based on the provided screenshot
const mockOrders = [
  { id: "ORD-1782872483206", date: "01/07/2026", time: "3:21:24", name: "sami", phone: "660365643", product: "vetement lux", state: "12", stateName: "سعيدة", deliveryType: "توصيل للمنزل", deliveryFee: 500, productFee: 7500, total: 8000, status: "pending" },
  { id: "ORD-1782872509871", date: "01/07/2026", time: "3:28:57", name: "saa", phone: "660365643", product: "vetement lux", state: "6", stateName: "الجلفة", deliveryType: "توصيل للمنزل", deliveryFee: 500, productFee: 7500, total: 8000, status: "cancelled" },
  { id: "ORD-1782872515562", date: "01/07/2026", time: "3:30:11", name: "asada", phone: "660365643", product: "vetement lux", state: "6", stateName: "الشلف", deliveryType: "الاستلام من المكتب", deliveryFee: 500, productFee: 7500, total: 8000, status: "delivery" },
  { id: "ORD-1782875876612", date: "01/07/2026", time: "19:03:13", name: "Mohand", phone: "542099306", product: "vetement lux", state: "6", stateName: "بجاية", deliveryType: "الاستلام من المكتب", deliveryFee: 500, productFee: 7500, total: 8000, status: "pending" },
  { id: "ORD-1782875850221", date: "01/07/2026", time: "19:07:30", name: "محمد ياسر", phone: "542099306", product: "vetement lux", state: "10", stateName: "المسيلة", deliveryType: "توصيل للمنزل", deliveryFee: 500, productFee: 7500, total: 8000, status: "pending" },
  { id: "ORD-1782967312241", date: "02/07/2026", time: "2:01:57", name: "logisik pubg", phone: "660365643", product: "logisik pubg", state: "6", stateName: "الأغواط", deliveryType: "الاستلام من المكتب", deliveryFee: 500, productFee: 6500, total: 7000, status: "delivery" },
  { id: "ORD-1782967356622", date: "02/07/2026", time: "2:42:39", name: "logisik pubg", phone: "660365643", product: "vetement lux", state: "8", stateName: "غرداية", deliveryType: "الاستلام من المكتب", deliveryFee: 500, productFee: 6500, total: 7000, status: "delivered" },
  { id: "ORD-1782967388123", date: "02/07/2026", time: "2:48:09", name: "logisik pubg", phone: "660365643", product: "vetement lux", state: "10", stateName: "بسكرة", deliveryType: "توصيل للمنزل", deliveryFee: 500, productFee: 6500, total: 7000, status: "delivered" },
  { id: "ORD-1782967410099", date: "02/07/2026", time: "2:59:08", name: "logisik pubg", phone: "660365643", product: "logisik pubg", state: "10", stateName: "تلمسان", deliveryType: "توصيل للمنزل", deliveryFee: 500, productFee: 6500, total: 7000, status: "pending" },
];

function AdminDashboard() {
  const [token, setToken] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "settings">("orders");
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
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 text-right" dir="rtl">
        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 w-full max-w-md border border-slate-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">THE FIVE A</h1>
            <p className="text-slate-500">لوحة تحكم الإدارة</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">رمز الوصول الخاص بـ GitHub (PAT)</label>
              <input
                type="password"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full border border-slate-200 p-3 rounded-lg outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all text-left"
                placeholder="ghp_xxxxxxxxxxxx"
                dir="ltr"
              />
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white py-3.5 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-md">
              تسجيل الدخول
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row" dir="rtl">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-l border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100 text-center">
          <h1 className="text-2xl font-serif font-bold tracking-widest text-[#1e293b]">THE FIVE A</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "orders" ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <FileText size={20} />
            <span className="font-bold">سجل الطلبات</span>
          </button>
          <button 
            onClick={() => setActiveTab("products")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "products" ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <Box size={20} />
            <span className="font-bold">إدارة المنتجات</span>
          </button>
          <button 
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "settings" ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <Settings size={20} />
            <span className="font-bold">الإعدادات</span>
          </button>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all font-bold">
            <LogOut size={20} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto w-full">
        {activeTab === "orders" && <OrdersDashboard />}
        {activeTab === "products" && <ProductsManager products={products} token={token} onRefresh={loadProducts} loading={loading} />}
        {activeTab === "settings" && <div className="p-8 text-center text-slate-500 font-bold">إعدادات النظام (قيد التطوير)</div>}
      </main>
    </div>
  );
}

// --- ORDERS DASHBOARD COMPONENT ---
function OrdersDashboard() {
  const currentDate = new Date().toLocaleDateString("en-GB"); // DD/MM/YYYY
  
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      
      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Logo / Title */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex flex-col justify-center items-center shadow-sm">
          <h2 className="text-xl font-serif font-bold text-[#1e293b] tracking-wider mb-2 uppercase">The Five A</h2>
          <div className="flex items-center gap-2 text-[#D29E5B]">
            <div className="h-[1px] w-8 bg-[#D29E5B]/40"></div>
            <span className="font-bold text-sm">سجل الطلبات</span>
            <div className="h-[1px] w-8 bg-[#D29E5B]/40"></div>
          </div>
        </div>
        
        {/* Total Orders */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-slate-50 rounded-lg text-slate-700">
            <ShoppingBag size={28} strokeWidth={1.5}/>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 mb-1">إجمالي الطلبات</p>
            <p className="text-2xl font-black text-slate-900">9 <span className="text-sm font-normal text-slate-400">طلب</span></p>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-amber-50 rounded-lg text-[#D29E5B]">
            <Hourglass size={28} strokeWidth={1.5}/>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 mb-1">قيد المراجعة</p>
            <p className="text-2xl font-black text-slate-900">4 <span className="text-sm font-normal text-slate-400">طلب</span></p>
          </div>
        </div>

        {/* Delivery */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <Truck size={28} strokeWidth={1.5}/>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 mb-1">قيد التوصيل</p>
            <p className="text-2xl font-black text-slate-900">2 <span className="text-sm font-normal text-slate-400">طلب</span></p>
          </div>
        </div>

        {/* Delivered */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <CheckCircle size={28} strokeWidth={1.5}/>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 mb-1">تم التسليم</p>
            <p className="text-2xl font-black text-slate-900">2 <span className="text-sm font-normal text-slate-400">طلب</span></p>
          </div>
        </div>

        {/* Total Sales & Date */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 mb-1">إجمالي المبيعات</p>
              <p className="text-xl font-black text-slate-900" dir="ltr">84,950 <span className="text-xs font-normal text-slate-400">DZD</span></p>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg text-[#D29E5B]">
              <Wallet size={20} strokeWidth={1.5}/>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-slate-500 text-xs justify-between">
            <span className="font-bold">تاريخ اليوم</span>
            <div className="flex items-center gap-1 text-[#D29E5B]">
              <Calendar size={14} />
              <span className="font-bold" dir="ltr">{currentDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[#1e293b] text-white">
                <th className="p-4 font-bold border-r border-slate-600"><div className="flex items-center justify-center gap-2"><Hourglass size={16}/> الحالة</div></th>
                <th className="p-4 font-bold border-r border-slate-600"><div className="flex items-center justify-center gap-2"><Wallet size={16}/> إجمالي السعر</div></th>
                <th className="p-4 font-bold border-r border-slate-600"><div className="flex items-center justify-center gap-2"><Box size={16}/> رسوم المنتج</div></th>
                <th className="p-4 font-bold border-r border-slate-600"><div className="flex items-center justify-center gap-2"><Truck size={16}/> رسوم التوصيل</div></th>
                <th className="p-4 font-bold border-r border-slate-600"><div className="flex items-center justify-center gap-2"><MapPin size={16}/> نوع التوصيل</div></th>
                <th className="p-4 font-bold border-r border-slate-600"><div className="flex items-center justify-center gap-2"><MapPin size={16}/> الولاية</div></th>
                <th className="p-4 font-bold border-r border-slate-600"><div className="flex items-center justify-center gap-2"><Box size={16}/> المنتج</div></th>
                <th className="p-4 font-bold border-r border-slate-600"><div className="flex items-center justify-center gap-2"><Phone size={16}/> رقم الهاتف</div></th>
                <th className="p-4 font-bold border-r border-slate-600"><div className="flex items-center justify-center gap-2"><User size={16}/> الاسم</div></th>
                <th className="p-4 font-bold border-r border-slate-600"><div className="flex items-center justify-center gap-2"><Hash size={16}/> رقم الطلب</div></th>
                <th className="p-4 font-bold"><div className="flex items-center justify-center gap-2"><Clock size={16}/> الوقت</div></th>
              </tr>
            </thead>
            <tbody>
              {mockOrders.map((order, i) => (
                <tr key={order.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}>
                  <td className="p-3 border-r border-slate-100">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="p-3 border-r border-slate-100 font-bold text-slate-800" dir="ltr">{order.total.toLocaleString()} DZD</td>
                  <td className="p-3 border-r border-slate-100 text-slate-600" dir="ltr">{order.productFee.toLocaleString()} DZD</td>
                  <td className="p-3 border-r border-slate-100 text-slate-600" dir="ltr">{order.deliveryFee.toLocaleString()} DZD</td>
                  <td className="p-3 border-r border-slate-100 text-slate-600">
                    <div className="flex items-center justify-center gap-2">
                      {order.deliveryType === "توصيل للمنزل" ? <MapPin size={14} className="text-[#D29E5B]"/> : <Box size={14} className="text-slate-400"/>}
                      {order.deliveryType}
                    </div>
                  </td>
                  <td className="p-3 border-r border-slate-100 text-slate-700">{order.stateName} <span className="text-slate-400 text-xs ml-1">{order.state}</span></td>
                  <td className="p-3 border-r border-slate-100 text-slate-700">{order.product}</td>
                  <td className="p-3 border-r border-slate-100 font-medium text-slate-800" dir="ltr">{order.phone}</td>
                  <td className="p-3 border-r border-slate-100 text-slate-700">{order.name}</td>
                  <td className="p-3 border-r border-slate-100 text-slate-500 font-mono text-xs">{order.id}</td>
                  <td className="p-3 text-slate-500 text-xs" dir="ltr">{order.date}, {order.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
        
        {/* Price Summary */}
        <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-6 shadow-sm text-center flex flex-col justify-center">
          <h3 className="text-[#D29E5B] font-bold mb-5 font-serif text-lg">ملخص الأسعار</h3>
          <div className="flex items-center justify-center gap-4">
            <div className="bg-white border border-blue-100 px-4 py-3 rounded-lg w-1/3 shadow-sm">
              <p className="text-xs text-blue-700 flex justify-center gap-1 mb-1"><Truck size={14}/> رسوم التوصيل</p>
              <p className="font-bold text-blue-800" dir="ltr">4,500 DZD</p>
            </div>
            <div className="text-slate-400 font-bold text-lg">+</div>
            <div className="bg-white border border-amber-100 px-4 py-3 rounded-lg w-1/3 shadow-sm">
              <p className="text-xs text-[#D29E5B] flex justify-center gap-1 mb-1"><Box size={14}/> رسوم المنتج</p>
              <p className="font-bold text-amber-800" dir="ltr">80,450 DZD</p>
            </div>
            <div className="text-slate-400 font-bold text-lg">=</div>
            <div className="bg-emerald-50 px-4 py-3 rounded-lg w-1/3 border border-emerald-200 shadow-sm">
              <p className="text-xs text-emerald-700 flex justify-center gap-1 mb-1"><Wallet size={14}/> إجمالي السعر</p>
              <p className="font-bold text-emerald-800" dir="ltr">84,950 DZD</p>
            </div>
          </div>
        </div>

        {/* Status Guide */}
        <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-6 shadow-sm text-center flex flex-col justify-center">
          <h3 className="text-[#D29E5B] font-bold mb-5 font-serif text-lg">دليل الحالات</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <StatusBadge status="pending" />
            <StatusBadge status="delivery" />
            <StatusBadge status="delivered" />
            <StatusBadge status="cancelled" />
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
          <h3 className="text-slate-800 font-bold mb-4 flex items-center justify-center md:justify-start gap-2 font-serif text-lg">
            <AlertCircle className="text-[#D29E5B]" size={20}/> 
            ملاحظات مهمة
          </h3>
          <ul className="text-sm text-slate-600 space-y-3 px-2">
            <li className="flex items-start gap-3"><CheckCircle size={16} className="text-[#D29E5B] mt-0.5 shrink-0"/> تأكد من مراجعة الطلبات الجديدة بانتظام.</li>
            <li className="flex items-start gap-3"><CheckCircle size={16} className="text-[#D29E5B] mt-0.5 shrink-0"/> تواصل مع العملاء لتأكيد الطلبات قيد المراجعة.</li>
            <li className="flex items-start gap-3"><CheckCircle size={16} className="text-[#D29E5B] mt-0.5 shrink-0"/> حدّث حالة الطلبية بعد كل إجراء.</li>
            <li className="flex items-start gap-3"><CheckCircle size={16} className="text-[#D29E5B] mt-0.5 shrink-0"/> احتفظ بسجل المنتجات المرتجعة في ورقة منفصلة.</li>
          </ul>
        </div>
      </div>

    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-xs font-bold whitespace-nowrap min-w-[110px] justify-center shadow-sm"><Hourglass size={14}/> قيد المراجعة</div>;
    case "delivery":
      return <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-xs font-bold whitespace-nowrap min-w-[110px] justify-center shadow-sm"><Truck size={14}/> قيد التوصيل</div>;
    case "delivered":
      return <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-bold whitespace-nowrap min-w-[110px] justify-center shadow-sm"><CheckCircle size={14}/> تم التسليم</div>;
    case "cancelled":
      return <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-md text-xs font-bold whitespace-nowrap min-w-[110px] justify-center shadow-sm"><AlertCircle size={14}/> ملغاة</div>;
    default:
      return null;
  }
}

// --- PRODUCTS MANAGER COMPONENT ---
function ProductsManager({ products, token, onRefresh, loading }: { products: ShopifyProduct[], token: string, onRefresh: () => void, loading: boolean }) {
  
  const handleUpdatePrice = async (product: ShopifyProduct, newAmount: string) => {
    if (!token) return;
    try {
      // Create a deep copy of products to update
      const updatedProducts = products.map(p => {
        if (p.node.id === product.node.id) {
          const newProduct = { ...p };
          newProduct.node.priceRange.minVariantPrice.amount = newAmount;
          newProduct.node.variants.edges.forEach(v => {
            v.node.price.amount = newAmount;
          });
          return newProduct;
        }
        return p;
      });
      
      // Commit to GitHub
      await commitFile(
        "public/data/products.json",
        JSON.stringify(updatedProducts, null, 2),
        `Update price for ${product.node.title}`,
        token,
        false
      );
      
      alert("تم تحديث السعر بنجاح! / Price updated successfully!");
      onRefresh();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-[#E5E7EB]">
        <h2 className="text-2xl font-bold font-serif text-[#1e293b] flex items-center gap-3">
          <Box className="text-[#D29E5B]"/>
          إدارة المنتجات المتاحة
        </h2>
        <button 
          onClick={onRefresh} 
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          تحديث البيانات
        </button>
      </div>

      <div className="grid gap-6">
        {products.map((p) => (
          <div key={p.node.id} className="bg-white border border-[#E5E7EB] rounded-xl p-6 flex flex-col md:flex-row gap-6 items-center shadow-sm hover:shadow-md transition-shadow">
            <div className="w-28 h-36 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
              {p.node.images.edges[0] && (
                <img src={p.node.images.edges[0].node.url} alt="product" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 space-y-3 text-right">
              <div>
                <h3 className="font-bold text-2xl text-[#1e293b]">{p.node.title}</h3>
                <p className="text-slate-500 text-sm font-mono mt-1">{p.node.handle}</p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-bold border border-emerald-100">
                <CheckCircle size={12}/> متوفر في المتجر
              </div>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto p-5 bg-[#FAFAFA] rounded-xl border border-[#E5E7EB]">
              <label className="text-sm font-bold text-slate-700">تعديل السعر الحالي (د.ج)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  defaultValue={p.node.priceRange.minVariantPrice.amount}
                  className="border border-slate-300 p-2.5 rounded-lg w-32 text-left font-bold outline-none focus:border-slate-800 transition-colors"
                  dir="ltr"
                  id={`price-${p.node.id}`}
                />
                <button
                  onClick={() => {
                    const el = document.getElementById(`price-${p.node.id}`) as HTMLInputElement;
                    handleUpdatePrice(p, el.value);
                  }}
                  disabled={loading}
                  className="bg-[#1e293b] text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-sm"
                >
                  تأكيد وحفظ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
