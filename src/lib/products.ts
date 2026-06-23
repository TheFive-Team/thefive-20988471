import sweater from "@/assets/product-sweater.jpg";
import blazer from "@/assets/product-blazer.jpg";
import shirt from "@/assets/product-shirt.jpg";
import shorts from "@/assets/product-shorts.jpg";
import skirt from "@/assets/product-skirt.jpg";
import vest from "@/assets/product-vest.jpg";
import coat from "@/assets/product-coat.jpg";

export interface Product {
  slug: string;
  name: { fr: string; ar: string };
  category: "boys" | "girls" | "unisex";
  type: "outer" | "knit" | "shirt" | "bottom";
  price: number; // DZD
  image: string;
  description: { fr: string; ar: string };
  fabric: { fr: string; ar: string };
  sizes: string[];
}

export const products: Product[] = [
  {
    slug: "pull-cable-ecru",
    name: { fr: "Pull torsadé écru", ar: "كنزة مجدولة بلون البيج" },
    category: "unisex",
    type: "knit",
    price: 8900,
    image: sweater,
    description: {
      fr: "Pull en maille torsadée façon traditionnelle, tricoté en laine peignée douce. Une pièce intemporelle, transmise de saison en saison.",
      ar: "كنزة بتريكو مجدول على الطريقة التقليدية، منسوجة من صوف ممشّط ناعم. قطعة خالدة تنتقل من موسم إلى آخر.",
    },
    fabric: { fr: "80% laine peignée, 20% cachemire", ar: "80٪ صوف ممشط، 20٪ كشمير" },
    sizes: ["4 ans", "6 ans", "8 ans", "10 ans", "12 ans"],
  },
  {
    slug: "blazer-marine-ecusson",
    name: { fr: "Blazer marine à écusson", ar: "بليزر كحلي بشعار" },
    category: "boys",
    type: "outer",
    price: 14500,
    image: blazer,
    description: {
      fr: "Veste croisée en laine fine, boutons dorés, doublure satin. Le classique du dimanche, taillé pour les jeunes gentlemen.",
      ar: "سترة بصدر مزدوج من الصوف الناعم، أزرار ذهبية، بطانة ساتان. كلاسيكية الأحد، مفصّلة للسادة الصغار.",
    },
    fabric: { fr: "Laine vierge italienne", ar: "صوف بكر إيطالي" },
    sizes: ["4 ans", "6 ans", "8 ans", "10 ans", "12 ans"],
  },
  {
    slug: "chemise-oxford-blanche",
    name: { fr: "Chemise oxford blanche", ar: "قميص أكسفورد أبيض" },
    category: "unisex",
    type: "shirt",
    price: 5500,
    image: shirt,
    description: {
      fr: "Chemise en coton oxford tissé, col boutonné, coupe droite. Le fondamental du vestiaire.",
      ar: "قميص من قطن الأكسفورد، ياقة بأزرار، قصّة مستقيمة. الأساس في خزانة الملابس.",
    },
    fabric: { fr: "100% coton longues fibres", ar: "100٪ قطن طويل التيلة" },
    sizes: ["4 ans", "6 ans", "8 ans", "10 ans", "12 ans"],
  },
  {
    slug: "short-chino-beige",
    name: { fr: "Short chino beige", ar: "شورت تشينو بيج" },
    category: "boys",
    type: "bottom",
    price: 6200,
    image: shorts,
    description: {
      fr: "Short en sergé de coton, plis marqués, taille ajustable. Pour les longues journées d'été en famille.",
      ar: "شورت من قماش السرج القطني، بطيّات واضحة، خصر قابل للتعديل. لأيام الصيف الطويلة مع العائلة.",
    },
    fabric: { fr: "Sergé de coton lavé", ar: "سرج قطني مغسول" },
    sizes: ["4 ans", "6 ans", "8 ans", "10 ans"],
  },
  {
    slug: "jupe-plissee-creme",
    name: { fr: "Jupe plissée crème", ar: "تنورة بطيّات كريمية" },
    category: "girls",
    type: "bottom",
    price: 6800,
    image: skirt,
    description: {
      fr: "Jupe à plis nets, liseré contrastant, ceinture boutonnée. Inspirée des uniformes des grandes écoles.",
      ar: "تنورة بطيّات أنيقة، حافة بلون مغاير، حزام بأزرار. مستوحاة من زي المدارس العريقة.",
    },
    fabric: { fr: "Mélange laine vierge", ar: "مزيج صوف بكر" },
    sizes: ["4 ans", "6 ans", "8 ans", "10 ans", "12 ans"],
  },
  {
    slug: "gilet-argyle-vert",
    name: { fr: "Gilet argyle vert anglais", ar: "صدرية أرغايل خضراء" },
    category: "unisex",
    type: "knit",
    price: 7400,
    image: vest,
    description: {
      fr: "Gilet sans manches en maille, motif argyle traditionnel, col polo. Le clin d'œil au vestiaire des clubs anglais.",
      ar: "صدرية بدون أكمام من التريكو، نقش أرغايل تقليدي، ياقة بولو. لمسة من خزانة النوادي الإنجليزية.",
    },
    fabric: { fr: "Laine mérinos", ar: "صوف ميرينو" },
    sizes: ["4 ans", "6 ans", "8 ans", "10 ans", "12 ans"],
  },
  {
    slug: "manteau-camel",
    name: { fr: "Manteau camel", ar: "معطف بلون الجمل" },
    category: "unisex",
    type: "outer",
    price: 18900,
    image: coat,
    description: {
      fr: "Manteau en laine drap, col tailleur, boutons en corne. Une pièce de cérémonie, pensée pour les hivers algérois.",
      ar: "معطف من جوخ الصوف، ياقة على الطراز الكلاسيكي، أزرار من القرن. قطعة احتفالية، مصممة لشتاء الجزائر.",
    },
    fabric: { fr: "Drap de laine 90%", ar: "جوخ صوف 90٪" },
    sizes: ["4 ans", "6 ans", "8 ans", "10 ans"],
  },
];

export const formatDZD = (n: number) =>
  new Intl.NumberFormat("fr-DZ").format(n) + " DA";
