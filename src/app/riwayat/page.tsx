"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ExternalLink,
  MessageSquare,
  ShoppingBag,
  X,
  ZoomIn,
} from "lucide-react";
import { DbOrder } from "@/types";
import NbButton from "@/components/ui/NbButton";
import NbInput from "@/components/ui/NbInput";
import NbCard from "@/components/ui/NbCard";

const WA_ADMIN_NUMBER =
  process.env.NEXT_PUBLIC_WA_ADMIN_NUMBER || "6281809010906";

const formatIDR = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

function getStatusConfig(status: string) {
  switch (status) {
    case "pending":
      return { label: "Pending", color: "bg-amber-300", icon: Clock };
    case "waiting_payment":
      return { label: "Menunggu Pembayaran", color: "bg-yellow-400", icon: Clock };
    case "purchased":
      return { label: "Sudah Dibeli", color: "bg-blue-400", icon: CheckCircle };
    case "shipped":
      return { label: "Dikirim", color: "bg-green-light", icon: Truck };
    case "completed":
      return { label: "Selesai", color: "bg-green", icon: CheckCircle };
    case "cancelled":
      return { label: "Dibatalkan", color: "bg-pink", icon: XCircle };
    default:
      return { label: status, color: "bg-gray-200", icon: Clock };
  }
}

function getShippingLabel(method: string | undefined) {
  switch (method) {
    case "shopee":
      return "🛒 Shopee (+Packaging)";
    case "cod":
      return "💵 Cash on Delivery";
    case "gosend":
      return "⚡ Gosend/Grab Instant";
    default:
      return "Belum dipilih";
  }
}

function RiwayatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [whatsapp, setWhatsapp] = useState("");
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Auto-search if whatsapp is in URL
  useEffect(() => {
    const wa = searchParams.get("whatsapp");
    if (wa) {
      setWhatsapp(wa);
      fetchHistory(wa);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchHistory = async (phone?: string) => {
    const queryPhone = phone || whatsapp;
    if (!queryPhone.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `/api/orders/history?whatsapp=${encodeURIComponent(queryPhone.trim())}`,
      );
      const result = await res.json();
      if (result.success) {
        setOrders(result.orders);
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8FB] text-black antialiased font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b-4 border-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="border-2 border-black p-2 bg-white hover:bg-pink-light transition-colors"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div>
              <span className="text-xl font-black text-black tracking-tight block">
                Riwayat Pesanan
              </span>
              <span className="text-[10px] text-black/70 font-black tracking-widest uppercase block -mt-1">
                Nitip Catip
              </span>
            </div>
          </div>
          <a
            href="/"
            className="flex items-center gap-1.5 text-sm font-black uppercase hover:text-pink transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Order Baru
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Search Form */}
        <NbCard variant="white" className="p-6 border-4 border-black">
          <h3 className="font-black text-lg uppercase mb-4">
            🔍 Cari Riwayat Pesanan
          </h3>
          <p className="text-sm font-bold text-black/70 mb-4">
            Masukkan nomor WhatsApp yang digunakan saat memesan untuk melihat
            riwayat pesanan Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <NbInput
                label="Nomor WhatsApp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="081234567890"
              />
            </div>
            <div className="flex items-end">
              <NbButton
                variant="green"
                onClick={() => fetchHistory()}
                disabled={!whatsapp.trim() || loading}
                className="h-[42px] sm:h-auto"
              >
                <Search className="w-4 h-4" />
                Cari
              </NbButton>
            </div>
          </div>
        </NbCard>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-10 h-10 border-4 border-black border-t-pink animate-spin" />
            <p className="text-sm font-bold text-black/70 mt-4">
              Memuat riwayat pesanan...
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && searched && orders.length === 0 && (
          <NbCard
            variant="white"
            className="p-8 border-4 border-black text-center"
          >
            <Package className="w-16 h-16 mx-auto text-black/30 stroke-[1.5]" />
            <p className="font-black text-lg mt-4">
              Belum ada pesanan
            </p>
            <p className="text-sm font-bold text-black/60 mt-2">
              Tidak ditemukan pesanan dengan nomor WhatsApp tersebut.
            </p>
            <a href="/">
              <NbButton variant="pink" className="mt-6">
                Mulai Order Sekarang
              </NbButton>
            </a>
          </NbCard>
        )}

        {/* Order List */}
        {!loading &&
          orders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;
            return (
              <NbCard
                key={order.id}
                variant="white"
                className="p-5 border-4 border-black shadow-nb-sm space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 border-b-2 border-black pb-3">
                  <div>
                    <p className="font-black text-base">{order.id}</p>
                    <p className="text-xs font-bold text-black/50">
                      {new Date(order.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div
                    className={`${statusConfig.color} border-2 border-black px-3 py-1 flex items-center gap-1.5`}
                  >
                    <StatusIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span className="text-xs font-black uppercase">
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                {/* Items */}
                {order.order_items && order.order_items.length > 0 ? (
                  <div className="space-y-2">
                    {order.order_items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 bg-pink-light/20 border-2 border-black p-3"
                      >
                        {/* Thumbnail */}
                        {item.lampiran_url ? (
                          <button
                            onClick={() => setPreviewImage(item.lampiran_url!)}
                            className="shrink-0 w-16 h-16 border-2 border-black bg-white overflow-hidden hover:opacity-80 transition-opacity relative group"
                          >
                            <img
                              src={item.lampiran_url}
                              alt={item.nama_barang}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ZoomIn className="w-5 h-5 text-white stroke-[2.5]" />
                            </div>
                          </button>
                        ) : (
                          <div className="shrink-0 w-16 h-16 border-2 border-black bg-white flex items-center justify-center">
                            <Package className="w-5 h-5 text-black/30" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0 pr-3">
                          <p className="font-black text-sm truncate">
                            {item.nama_barang}
                          </p>
                          <p className="text-xs font-bold text-black/60">
                            {item.jumlah}x · {item.size_order.toUpperCase()}
                            {item.ukuran_varian
                              ? ` · ${item.ukuran_varian}`
                              : ""}
                            {item.warna ? ` · ${item.warna}` : ""}
                          </p>
                          {item.link_produk && (
                            <a
                              href={item.link_produk}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-pink hover:underline flex items-center gap-0.5 mt-0.5"
                            >
                              <ExternalLink className="w-3 h-3" /> Link Produk
                            </a>
                          )}
                        </div>
                        <span className="font-black text-sm flex-shrink-0">
                          {formatIDR(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-bold text-black/50">
                    Detail produk tidak tersedia
                  </p>
                )}

                {/* Summary */}
                <div className="space-y-1 text-sm font-bold">
                  <div className="flex justify-between">
                    <span className="text-black/60">Fee Jastip</span>
                    <span>{formatIDR(order.total_fee_jastip)}</span>
                  </div>
                  {/* <div className="flex justify-between">
                    <span className="text-black/60">Ongkir</span>
                    <span>{formatIDR(order.ongkir)}</span>
                  </div> */}
                  <div className="flex justify-between border-t-2 border-black pt-2 text-base font-black">
                    <span>Total</span>
                    <span>{formatIDR(order.total_pembayaran)}</span>
                  </div>
                </div>

                {/* Shipping info */}
                <div className="flex items-center justify-between bg-green-light/40 border-2 border-black p-3">
                  <div>
                    <p className="text-xs font-black uppercase text-black/60">
                      Pengiriman
                    </p>
                    <p className="text-sm font-black">
                      {getShippingLabel(order.shipping_method || undefined)}
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/${WA_ADMIN_NUMBER}?text=${encodeURIComponent(
                      `Halo Admin, saya ${order.nama_pemesan} (${order.whatsapp}), Order ID: ${order.id}. Saya ingin bertanya tentang pesanan saya.`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 border-2 border-black bg-green px-3 py-2 text-xs font-black uppercase hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all shadow-nb-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5 stroke-[2.5]" />
                    Tanya Admin
                  </a>
                </div>
              </NbCard>
            );
          })}
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-8 border-t-4 border-black mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-xs font-bold text-white/50">
          <p>&copy; {new Date().getFullYear()} Nitip Catip Jasa Titip</p>
        </div>
      </footer>
      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 p-2 bg-white border-4 border-black shadow-nb hover:bg-pink-light transition-colors z-10"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-[85vh] object-contain border-4 border-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default function RiwayatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFF8FB] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-black border-t-pink animate-spin" />
        </div>
      }
    >
      <RiwayatContent />
    </Suspense>
  );
}
