import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "fr" | "ar";

type Dict = Record<string, { fr: string; ar: string }>;

export const t: Dict = {
  "nav.shop": { fr: "Boutique", ar: "المتجر" },
  "nav.boys": { fr: "Garçons", ar: "أولاد" },
  "nav.girls": { fr: "Filles", ar: "بنات" },
  "nav.collections": { fr: "Collections", ar: "المجموعات" },
  "nav.about": { fr: "Maison", ar: "الدار" },
  "nav.contact": { fr: "Contact", ar: "اتصل" },
  "nav.cart": { fr: "Panier", ar: "السلة" },
  "hero.eyebrow": { fr: "Collection Automne — Hiver", ar: "مجموعة الخريف والشتاء" },
  "hero.title": { fr: "L'élégance se transmet,\njamais ne s'achète.", ar: "الأناقة تُورَّث،\nولا تُشترى." },
  "hero.sub": { fr: "Vêtements raffinés pour enfants — confectionnés dans la tradition des grandes maisons, livrés partout en Algérie.", ar: "ملابس راقية للأطفال — مصنوعة بأسلوب البيوت العريقة، تُسلَّم في جميع أنحاء الجزائر." },
  "hero.cta": { fr: "Découvrir la collection", ar: "اكتشف المجموعة" },
  "hero.cta2": { fr: "Notre maison", ar: "دارنا" },
  "feat.title": { fr: "Pièces signatures", ar: "القطع المميزة" },
  "feat.sub": { fr: "Une sélection intemporelle, taillée pour les jeunes héritiers d'aujourd'hui.", ar: "تشكيلة خالدة، مصممة لورثة اليوم الصغار." },
  "feat.view": { fr: "Voir tout", ar: "عرض الكل" },
  "values.heritage.t": { fr: "Héritage", ar: "إرث" },
  "values.heritage.d": { fr: "Des coupes inspirées des vestiaires classiques européens, pensées pour durer plusieurs générations.", ar: "قصّات مستوحاة من خزائن الملابس الأوروبية الكلاسيكية، صُممت لتدوم لأجيال." },
  "values.fabric.t": { fr: "Étoffes nobles", ar: "أقمشة نبيلة" },
  "values.fabric.d": { fr: "Laine peignée, coton longues fibres, lin lavé — uniquement des matières qui vieillissent avec grâce.", ar: "صوف ممشّط، قطن طويل التيلة، كتان مغسول — فقط مواد تتقادم بأناقة." },
  "values.made.t": { fr: "Fait avec soin", ar: "مصنوع بعناية" },
  "values.made.d": { fr: "Chaque pièce est confectionnée en petite série, vérifiée à la main, livrée pliée dans nos boîtes signature.", ar: "كل قطعة تُصنع بكميات محدودة، تُفحص يدوياً، وتُسلَّم مطوية في علبنا المميزة." },
  "ship.title": { fr: "Livraison à domicile — Paiement à la livraison", ar: "توصيل إلى المنزل — الدفع عند الاستلام" },
  "ship.sub": { fr: "Nous livrons dans les 48 wilayas. Vous ne payez qu'à la réception, en espèces, après avoir vérifié votre commande.", ar: "نوصل إلى جميع الولايات الـ 48. تدفع فقط عند الاستلام، نقداً، بعد فحص طلبك." },
  "ship.f1": { fr: "Livraison à domicile 48 wilayas", ar: "توصيل منزلي لـ 48 ولاية" },
  "ship.f2": { fr: "Paiement cash à la livraison", ar: "الدفع نقداً عند التسليم" },
  "ship.f3": { fr: "Échange sous 7 jours", ar: "استبدال خلال 7 أيام" },
  "shop.title": { fr: "La Boutique", ar: "المتجر" },
  "shop.all": { fr: "Tout", ar: "الكل" },
  "shop.boys": { fr: "Garçons", ar: "أولاد" },
  "shop.girls": { fr: "Filles", ar: "بنات" },
  "shop.outer": { fr: "Vestes & manteaux", ar: "السترات والمعاطف" },
  "shop.knit": { fr: "Mailles", ar: "تريكو" },
  "product.add": { fr: "Ajouter au panier", ar: "أضف إلى السلة" },
  "product.size": { fr: "Taille", ar: "المقاس" },
  "product.cod": { fr: "Paiement à la livraison disponible", ar: "الدفع عند الاستلام متاح" },
  "cart.title": { fr: "Votre Panier", ar: "سلتك" },
  "cart.empty": { fr: "Votre panier est vide.", ar: "سلتك فارغة." },
  "cart.continue": { fr: "Continuer mes achats", ar: "متابعة التسوق" },
  "cart.subtotal": { fr: "Sous-total", ar: "المجموع الفرعي" },
  "cart.shipping": { fr: "Livraison", ar: "التوصيل" },
  "cart.total": { fr: "Total", ar: "الإجمالي" },
  "cart.checkout": { fr: "Commander", ar: "اطلب الآن" },
  "cart.remove": { fr: "Retirer", ar: "إزالة" },
  "checkout.title": { fr: "Finaliser la commande", ar: "إتمام الطلب" },
  "checkout.contact": { fr: "Coordonnées", ar: "بيانات التواصل" },
  "checkout.fullname": { fr: "Nom complet", ar: "الاسم الكامل" },
  "checkout.phone": { fr: "Téléphone", ar: "الهاتف" },
  "checkout.email": { fr: "Email (facultatif)", ar: "البريد الإلكتروني (اختياري)" },
  "checkout.address": { fr: "Adresse de livraison", ar: "عنوان التوصيل" },
  "checkout.street": { fr: "Adresse complète", ar: "العنوان الكامل" },
  "checkout.wilaya": { fr: "Wilaya", ar: "الولاية" },
  "checkout.commune": { fr: "Commune", ar: "البلدية" },
  "checkout.method": { fr: "Mode de livraison", ar: "طريقة التوصيل" },
  "checkout.home": { fr: "À domicile", ar: "إلى المنزل" },
  "checkout.stop": { fr: "Au bureau (stop desk)", ar: "إلى المكتب" },
  "checkout.payment": { fr: "Paiement", ar: "الدفع" },
  "checkout.cod": { fr: "Paiement à la livraison (espèces)", ar: "الدفع عند الاستلام (نقداً)" },
  "checkout.cod.desc": { fr: "Vous payez en espèces au livreur, après avoir vérifié votre commande.", ar: "تدفع نقداً للموزع، بعد فحص طلبك." },
  "checkout.notes": { fr: "Notes (facultatif)", ar: "ملاحظات (اختياري)" },
  "checkout.confirm": { fr: "Confirmer la commande", ar: "تأكيد الطلب" },
  "checkout.success.t": { fr: "Commande confirmée", ar: "تم تأكيد الطلب" },
  "checkout.success.d": { fr: "Merci. Nous vous appellerons sous 24 h pour confirmer la livraison.", ar: "شكراً. سنتصل بك خلال 24 ساعة لتأكيد التسليم." },
  "checkout.success.ref": { fr: "Référence", ar: "المرجع" },
  "checkout.back": { fr: "Retour à la boutique", ar: "العودة إلى المتجر" },
  "about.title": { fr: "La Maison", ar: "الدار" },
  "contact.title": { fr: "Nous écrire", ar: "تواصل معنا" },
  "footer.about": { fr: "La Maison", ar: "الدار" },
  "footer.shop": { fr: "Boutique", ar: "المتجر" },
  "footer.care": { fr: "Service client", ar: "خدمة العملاء" },
  "footer.rights": { fr: "Tous droits réservés.", ar: "جميع الحقوق محفوظة." },
};

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  tr: (key: string) => string;
  dir: "ltr" | "rtl";
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("fiveA_lang")) as Lang | null;
    if (saved === "fr" || saved === "ar") setLangState(saved);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("fiveA_lang", l);
  };

  const tr = (k: string) => t[k]?.[lang] ?? k;
  return <Ctx.Provider value={{ lang, setLang, tr, dir: lang === "ar" ? "rtl" : "ltr" }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useI18n outside provider");
  return c;
}
