import { z } from "zod";

export const productItemSchema = z.object({
  namaBarang: z.string().min(1, "Nama produk wajib diisi"),
  linkProduk: z
    .string()
    .min(1, "Link produk wajib diisi")
    .url("Format link produk tidak valid"),
  ukuranVarian: z.string().optional(),
  warna: z.string().optional(),
  jumlah: z.number().min(1, "Jumlah minimal 1"),
  hargaBarang: z.number().min(0, "Harga barang tidak boleh negatif"),
  sizeOrder: z.enum(
    ["small", "medium", "large_10", "large_15", "large_20"] as const,
    "Pilih ukuran order terlebih dahulu",
  ),
  lampiranUrl: z.string().optional(),
  lampiranName: z.string().optional(),
});

export type ProductItem = z.infer<typeof productItemSchema>;

export const orderFormSchema = z.object({
  // Informasi Pembeli
  namaPemesan: z.string().min(1, "Nama lengkap wajib diisi"),
  whatsapp: z
    .string()
    .min(1, "Nomor WhatsApp wajib diisi")
    .regex(/^[0-9]+$/, "Nomor WhatsApp hanya boleh berisi angka")
    .min(9, "Nomor WhatsApp minimal 9 digit")
    .max(15, "Nomor WhatsApp maksimal 15 digit"),
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  kotaTujuan: z.string().min(1, "Kota tujuan wajib diisi"),
  kodePos: z
    .string()
    .min(1, "Kode pos wajib diisi")
    .regex(/^[0-9]+$/, "Kode pos hanya boleh berisi angka"),

  // Products array
  items: z.array(productItemSchema).min(1, "Minimal 1 produk harus ditambahkan"),

  // General
  catatan: z.string().optional(),
  pembayaran: z.string().optional(),
});

export type OrderFormData = z.infer<typeof orderFormSchema>;

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  defaultLink?: string;
}

export interface OpenTrip {
  id: string;
  destination: string;
  countryCode: string;
  flag: string;
  closeDate: string;
  eta: string;
  status: "Open" | "Closing Soon" | "Closed";
  bannerUrl: string;
}

export interface Order {
  id: string;
  timestamp: string;
  status:
    | "Pending"
    | "Waiting Payment"
    | "Purchased"
    | "Shipped"
    | "Completed"
    | "Cancelled";
  namaPemesan: string;
  whatsapp: string;
  email: string;
  kotaTujuan: string;
  kodePos: string;
  // Flat product fields (from Google Sheet rows)
  namaBarang: string;
  linkProduk?: string;
  ukuranVarian?: string;
  warna?: string;
  jumlah: number;
  hargaBarang: number;
  sizeOrder: string;
  catatan?: string;
  lampiranUrl?: string;
  lampiranName?: string;
  pembayaran: string;
  feeJastip: number;
  estimasiOngkir: number;
  totalPembayaran: number;
}

export interface FeeSettings {
  small: number;
  medium: number;
  large_10: number;
  large_15: number;
  large_20: number;
}
