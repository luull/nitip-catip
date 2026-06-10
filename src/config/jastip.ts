import { CatalogItem, OpenTrip, FeeSettings } from "../types";

export const DEFAULT_FEE_SETTINGS: FeeSettings = {
  small: 10000,
  medium: 20000,
  large: 35000,
};

export const ACTIVE_TRIPS: OpenTrip[] = [
  {
    id: "trip-bangkok",
    destination: "Bangkok, Thailand",
    countryCode: "TH",
    flag: "🇹🇭",
    closeDate: "15 Juni 2026",
    eta: "18 Juni 2026",
    status: "Open",
    bannerUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "trip-tokyo",
    destination: "Tokyo, Japan",
    countryCode: "JP",
    flag: "🇯🇵",
    closeDate: "25 Juni 2026",
    eta: "30 Juni 2026",
    status: "Open",
    bannerUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "trip-singapore",
    destination: "Orchard, Singapore",
    countryCode: "SG",
    flag: "🇸🇬",
    closeDate: "12 Juni 2026",
    eta: "14 Juni 2026",
    status: "Closing Soon",
    bannerUrl: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&auto=format&fit=crop&q=80",
  },
];

export const CATALOG_ITEMS: CatalogItem[] = [
  {
    id: "cat-gentle-woman",
    name: "Gentle Woman Canvas Tote Bag",
    category: "Fashion",
    price: 380000,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80",
    description: "Tas kanvas ikonik super populer dari Bangkok. Muat banyak barang dan stylish.",
    defaultLink: "https://www.gentlewomanonline.com/product/gentle-woman-canvas-tote-bag-black",
  },
  {
    id: "cat-tokyo-banana",
    name: "Tokyo Banana Original (8 Pcs)",
    category: "Snacks",
    price: 260000,
    image: "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=600&auto=format&fit=crop&q=80",
    description: "Kue spons lembut berbentuk pisang isi krim custard manis khas Tokyo.",
    defaultLink: "https://www.tokyobanana.jp/language/en/products/1.html",
  },
  {
    id: "cat-labubu",
    name: "Pop Mart Labubu The Monsters Vinyl",
    category: "Toys & Hobbies",
    price: 450000,
    image: "https://images.unsplash.com/photo-1559251606-c623743a6d76?w=600&auto=format&fit=crop&q=80",
    description: "Gantungan kunci/vinyl art toy Labubu Macaron yang sedang viral di seluruh dunia.",
    defaultLink: "https://www.popmart.com/",
  },
  {
    id: "cat-biore-uv",
    name: "Biore UV Aqua Rich Watery Essence SPF 50+",
    category: "Beauty & Skincare",
    price: 135000,
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&auto=format&fit=crop&q=80",
    description: "Sunscreen jepang legendaris dengan tekstur ringan seperti air dan proteksi maksimal.",
    defaultLink: "https://www.kao.com/",
  },
];
