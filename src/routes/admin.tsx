import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";
import { commitFile } from "@/lib/github";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Panel — The Five A" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [token, setToken] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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

  const handleUpdatePrice = async (product: ShopifyProduct, newAmount: string) => {
    if (!token) return;
    try {
      setLoading(true);
      
      // Update local state first
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
      
      setProducts(updatedProducts);

      // Commit to GitHub
      await commitFile(
        "public/data/products.json",
        JSON.stringify(updatedProducts, null, 2),
        `Update price for ${product.node.title}`,
        token,
        false
      );
      
      alert("تم تحديث السعر بنجاح! / Price updated successfully!");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-zinc-50">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-zinc-200">
          <h1 className="text-2xl font-bold mb-6 text-center">لوحة التحكم / Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">GitHub Personal Access Token</label>
              <input
                type="password"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full border p-3 rounded-md outline-none focus:border-zinc-800"
                placeholder="ghp_xxxxxxxxxxxx"
              />
            </div>
            <button type="submit" className="w-full bg-zinc-900 text-white py-3 rounded-md font-bold hover:bg-zinc-800">
              الدخول / Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12" dir="rtl">
      <div className="flex justify-between items-center mb-10 border-b pb-4">
        <h1 className="text-3xl font-bold font-serif">إدارة المنتجات</h1>
        <button onClick={handleLogout} className="text-red-500 hover:underline font-bold">
          تسجيل الخروج
        </button>
      </div>

      {loading && <div className="text-center py-4">جاري التحميل...</div>}

      <div className="grid gap-6">
        {products.map((p) => (
          <div key={p.node.id} className="bg-white border rounded-xl p-6 flex flex-col md:flex-row gap-6 items-center shadow-sm">
            <div className="w-24 h-32 flex-shrink-0 bg-zinc-100 rounded-md overflow-hidden">
              {p.node.images.edges[0] && (
                <img src={p.node.images.edges[0].node.url} alt="product" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 space-y-2 text-right">
              <h3 className="font-bold text-xl">{p.node.title}</h3>
              <p className="text-zinc-500 text-sm">{p.node.handle}</p>
            </div>
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <label className="text-sm font-bold text-zinc-600">السعر (د.ج)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  defaultValue={p.node.priceRange.minVariantPrice.amount}
                  className="border p-2 rounded-md w-32 text-left"
                  dir="ltr"
                  id={`price-${p.node.id}`}
                />
                <button
                  onClick={() => {
                    const el = document.getElementById(`price-${p.node.id}`) as HTMLInputElement;
                    handleUpdatePrice(p, el.value);
                  }}
                  disabled={loading}
                  className="bg-zinc-900 text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-zinc-800"
                >
                  حفظ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 bg-amber-50 p-6 rounded-xl border border-amber-200">
        <h3 className="font-bold text-amber-800 mb-2">ملاحظة حول الصور</h3>
        <p className="text-amber-700 text-sm">
          لرفع الصور الجديدة، حالياً يتم الاعتماد على روابط خارجية. قريباً سيتم إضافة زر لرفع الصور مباشرة إلى GitHub.
        </p>
      </div>
    </div>
  );
}
