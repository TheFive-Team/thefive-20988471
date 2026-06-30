import { ShieldCheck, Truck, RotateCcw, CreditCard } from "lucide-react";

export function TrustBadges() {
  const badges = [
    {
      icon: <Truck className="w-6 h-6 mb-2 text-zinc-900" />,
      title: "Free Shipping",
      desc: "On all orders today",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 mb-2 text-zinc-900" />,
      title: "Quality Guarantee",
      desc: "Premium materials",
    },
    {
      icon: <RotateCcw className="w-6 h-6 mb-2 text-zinc-900" />,
      title: "Easy Returns",
      desc: "30-day return policy",
    },
    {
      icon: <CreditCard className="w-6 h-6 mb-2 text-zinc-900" />,
      title: "Cash on Delivery",
      desc: "Pay when you receive",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-zinc-200 bg-zinc-50/50">
      {badges.map((badge, i) => (
        <div key={i} className="flex flex-col items-center text-center p-4">
          {badge.icon}
          <h4 className="font-semibold text-sm text-zinc-900">{badge.title}</h4>
          <p className="text-xs text-zinc-500 mt-1">{badge.desc}</p>
        </div>
      ))}
    </div>
  );
}
