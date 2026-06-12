"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Truck,
  Package,
  X,
  ZoomIn,
} from "lucide-react";
import NbCard from "@/components/ui/NbCard";
import NbBadge from "@/components/ui/NbBadge";
import NbButton from "@/components/ui/NbButton";
import Swal from "sweetalert2";

interface AdminOrder {
  id: string;
  timestamp: string;
  status: string;
  namaPemesan: string;
  whatsapp: string;
  email: string;
  kotaTujuan: string;
  kodePos: string;
  totalPembayaran: number;
  feeJastip: number;
  estimasiOngkir: number;
  paymentMethod: string;
  shippingMethod: string;
  shippingStatus: string;
  catatan: string;
  namaBarang: string;
  jumlah: number;
  sizeOrder: string;
  lampiranUrl: string;
  items: any[];
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<AdminOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [dataSource, setDataSource] = useState<"supabase" | "sheets" | "none">("none");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  async function loadOrders() {
    setIsLoading(true);
    try {
      // Try Supabase first
      const res = await fetch("/api/admin/supabase-orders");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.orders?.length > 0) {
          setOrders(data.orders);
          setDataSource("supabase");
          return;
        }
      }
    } catch {}

    // Fallback to Google Sheets
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders || []);
          setDataSource("sheets");
          return;
        }
      }
    } catch {}

    setDataSource("none");
    setIsLoading(false);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    let result = [...orders];
    if (statusFilter !== "ALL") {
      result = result.filter((o) => o.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.id?.toLowerCase().includes(q) ||
          o.namaPemesan?.toLowerCase().includes(q) ||
          o.whatsapp?.includes(q) ||
          o.namaBarang?.toLowerCase().includes(q),
      );
    }
    setFilteredOrders(result);
  }, [orders, searchQuery, statusFilter]);

  useEffect(() => {
    setIsLoading(false);
  }, [orders]);

  async function handleStatusChange(orderId: string, newStatus: string) {
    setUpdatingId(orderId);
    try {
      // Try Supabase first
      let res = await fetch("/api/admin/supabase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setOrders((prev) =>
            prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
          );
          return;
        }
      }
      // Fallback to Google Sheets
      res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setOrders((prev) =>
            prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
          );
        } else {
          Swal.fire({ icon: "error", title: "Gagal", text: result.error || "Gagal update status", confirmButtonColor: "#FF69B4" });
        }
      }
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Gagal menghubungi server", confirmButtonColor: "#FF69B4" });
    } finally {
      setUpdatingId(null);
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatIDR = (value: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);

  const statusColors: Record<string, any> = {
    Pending: "white",
    "Waiting Payment": "yellow",
    Purchased: "blue",
    Shipped: "pink",
    Completed: "green",
    Cancelled: "gray",
  };

  const shippingLabel = (m: string) => {
    switch (m) {
      case "shopee": return "🛒 Shopee";
      case "cod": return "💵 COD";
      case "gosend": return "⚡ Gosend";
      default: return "—";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-black font-sans">
        <div className="w-16 h-16 border-8 border-black border-t-pink animate-spin mb-4" />
        <p className="font-black uppercase tracking-wider text-sm">LOADING ORDERS...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-4 border-black pb-6">
        <div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-wider">
            Order Management 
          </h1>
          <p className="font-bold text-black/60 mt-1">
            Kelola pesanan jastip customer.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NbBadge variant={dataSource === "supabase" ? "green" : dataSource === "sheets" ? "yellow" : "pink"} className="shadow-nb-sm text-xs">
            {dataSource === "supabase" ? "🟢 Supabase" : dataSource === "sheets" ? "📊 Google Sheet" : "🔴 No Data Source"}
          </NbBadge>
          <NbButton onClick={loadOrders} variant="white" className="shadow-nb-sm">
            <RefreshCw className="w-4 h-4 stroke-[2.5]" /> REFRESH
          </NbButton>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            placeholder="Cari ID, nama, WhatsApp, atau barang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="nb-input pl-12"
          />
          <div className="absolute left-4"><Search className="w-5 h-5 text-black stroke-[2.5]" /></div>
        </div>
        <div className="w-full md:w-64">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="nb-input">
            <option value="ALL">SEMUA STATUS</option>
            <option value="Pending">PENDING</option>
            <option value="Waiting Payment">WAITING PAYMENT</option>
            <option value="Purchased">PURCHASED</option>
            <option value="Shipped">SHIPPED</option>
            <option value="Completed">COMPLETED</option>
            <option value="Cancelled">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Orders */}
      {filteredOrders.length === 0 ? (
        <NbCard className="p-16 text-center border-4 border-black">
          <p className="font-black uppercase tracking-wider text-black/50">Tidak ada pesanan yang cocok.</p>
        </NbCard>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedIds.has(order.id);
            const hasMultipleItems = order.items && order.items.length > 1;
            return (
              <NbCard key={order.id} className="border-4 border-black shadow-nb-sm overflow-hidden">
                {/* Order Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-pink/30 border-b-2 border-black">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-black text-sm">{order.id}</span>
                    <NbBadge variant={statusColors[order.status] || "white"}>{order.status}</NbBadge>
                    <span className="text-xs font-bold text-black/50">
                      {new Date(order.timestamp).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {order.shippingMethod && (
                      <span className="text-xs font-black bg-white border-2 border-black px-2 py-0.5">
                        {shippingLabel(order.shippingMethod)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm">{formatIDR(order.totalPembayaran)}</span>
                    <a
                      href={`https://wa.me/${order.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 border-2 border-black bg-green hover:bg-green-light shadow-nb-sm transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-black stroke-[2.5]" />
                    </a>
                  </div>
                </div>

                {/* Customer + Items */}
                <div className="p-4 space-y-3">
                  <div className="flex flex-wrap gap-4 text-xs font-bold text-black/70">
                    <span>👤 {order.namaPemesan}</span>
                    <span>📧 {order.email}</span>
                    <span>📍 {order.kotaTujuan} ({order.kodePos})</span>
                    <span>💳 {order.paymentMethod?.toUpperCase() || "QRIS"}</span>
                  </div>

                  {/* Items */}
                  {hasMultipleItems && (
                    <button
                      onClick={() => toggleExpand(order.id)}
                      className="flex items-center gap-1.5 text-xs font-black text-black hover:text-black transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {order.items.length} produk dalam order ini
                    </button>
                  )}

                  {/* Item list */}
                  <div className="space-y-2">
                    {(isExpanded && hasMultipleItems ? order.items : order.items?.slice(0, 1) || []).map((item: any, idx: number) => (
                      <div key={item.id || idx} className="flex items-start gap-3 bg-white border-2 border-black p-3 text-sm">
                        {/* Thumbnail */}
                        {item.lampiran_url ? (
                          <button
                            onClick={() => setPreviewImage(item.lampiran_url)}
                            className="shrink-0 w-14 h-14 border-2 border-black bg-white overflow-hidden hover:opacity-80 transition-opacity relative group"
                          >
                            <img
                              src={item.lampiran_url}
                              alt={item.nama_barang}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ZoomIn className="w-4 h-4 text-white stroke-[2.5]" />
                            </div>
                          </button>
                        ) : (
                          <div className="shrink-0 w-14 h-14 border-2 border-black bg-white flex items-center justify-center">
                            <Package className="w-4 h-4 text-black/30" />
                          </div>
                        )}

                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="min-w-0">
                            <p className="font-black truncate">{item.nama_barang}</p>
                            <p className="text-xs text-black/60">
                              {item.jumlah}x · {item.size_order?.toUpperCase()}
                              {item.ukuran_varian ? ` · ${item.ukuran_varian}` : ""}
                              {item.warna ? ` · ${item.warna}` : ""}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <p className="font-black">{formatIDR(item.subtotal || item.harga_barang * item.jumlah)}</p>
                          <p className="text-[10px] text-black/50">Fee: {formatIDR(item.fee_jastip)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Status update */}
                  <div className="flex items-center gap-3 pt-2 border-t-2 border-black/10">
                    <span className="text-xs font-black uppercase text-black/50">Status:</span>
                    {updatingId === order.id ? (
                      <span className="text-xs font-black uppercase animate-pulse">Updating...</span>
                    ) : (
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="bg-white border-2 border-black py-1 px-2 text-xs font-black uppercase focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Waiting Payment">Waiting Payment</option>
                        <option value="Purchased">Purchased</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    )}
                  </div>
                </div>
              </NbCard>
            );
          })}
        </div>
      )}

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
