"use client";

import React, { useState, useEffect } from "react";
import { Order } from "@/types";
import { Search, ExternalLink, MessageSquare, RefreshCw } from "lucide-react";
import NbCard from "@/components/ui/NbCard";
import NbBadge from "@/components/ui/NbBadge";
import NbButton from "@/components/ui/NbButton";

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadOrders() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // Sort orders by timestamp descending so newer orders are at the top
          const sorted = (data.orders || []).sort((a: any, b: any) => {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          });
          setOrders(sorted);
        } else {
          setError(data.error || "Gagal memuat daftar pesanan dari sheet.");
        }
      } else {
        throw new Error("HTTP error loading orders");
      }
    } catch (err: any) {
      console.error(err);
      setError("Gagal terhubung dengan server API.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  // Filter orders based on query and status filter
  useEffect(() => {
    let result = [...orders];

    if (statusFilter !== "ALL") {
      result = result.filter(o => o.status === statusFilter);
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(o => 
        (o.id && o.id.toLowerCase().includes(query)) ||
        (o.namaPemesan && o.namaPemesan.toLowerCase().includes(query)) ||
        (o.whatsapp && o.whatsapp.includes(query)) ||
        (o.namaBarang && o.namaBarang.toLowerCase().includes(query))
      );
    }

    setFilteredOrders(result);
  }, [orders, searchQuery, statusFilter]);

  // Handle status update
  async function handleStatusChange(orderId: string, newStatus: string) {
    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ orderId, status: newStatus })
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          // Update status locally
          setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
        } else {
          alert(`Gagal: ${result.error || "Terjadi kesalahan"}`);
        }
      } else {
        alert("Gagal menghubungi server untuk update status.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Error: Gagal mengupdate status.");
    } finally {
      setUpdatingId(null);
    }
  }

  const formatIDR = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const statusColors = {
    Pending: "white" as const,
    "Waiting Payment": "yellow" as const,
    Purchased: "blue" as const,
    Shipped: "pink" as const,
    Completed: "green" as const,
    Cancelled: "gray" as const,
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-black font-sans">
        <div className="w-16 h-16 border-8 border-black border-t-pink animate-spin mb-4" />
        <p className="font-black uppercase tracking-wider text-sm">LOAD PESANAN MASUK...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-black">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-4 border-black pb-6">
        <div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-wider">
            Order Management 🧾
          </h1>
          <p className="font-bold text-black/60 mt-1">
            Lihat, kelola, dan update status jastip pesanan customer.
          </p>
        </div>

        <NbButton
          onClick={loadOrders}
          variant="white"
          className="shadow-nb-sm"
        >
          <RefreshCw className="w-4 h-4 stroke-[2.5]" />
          REFRESH DATA
        </NbButton>
      </div>

      {error && (
        <NbCard variant="pink-light" className="p-4 border-4 border-black font-black uppercase text-sm animate-nb-shake">
          ⚠️ ERROR: {error}
        </NbCard>
      )}

      {/* Filter and search bar */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            placeholder="Cari ID Order, nama, WhatsApp, atau nama barang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="nb-input pl-12"
          />
          <div className="absolute left-4 p-1">
            <Search className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
        </div>

        {/* Status select filter */}
        <div className="w-full md:w-64">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="nb-input"
          >
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

      {/* Desktop order table */}
      <div className="hidden lg:block">
        <NbCard className="border-4 border-black shadow-nb overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="p-16 text-center font-black uppercase tracking-wider text-black/50">
              Tidak ada data pesanan yang cocok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-bold text-sm">
                <thead>
                  <tr className="bg-pink text-black border-b-4 border-black uppercase text-xs">
                    <th className="p-4 border-r-2 border-black font-black">Order ID</th>
                    <th className="p-4 border-r-2 border-black font-black">Tanggal</th>
                    <th className="p-4 border-r-2 border-black font-black">Customer</th>
                    <th className="p-4 border-r-2 border-black font-black">WhatsApp</th>
                    <th className="p-4 border-r-2 border-black font-black">Produk</th>
                    <th className="p-4 border-r-2 border-black font-black">Size</th>
                    <th className="p-4 border-r-2 border-black font-black">Fee Jastip</th>
                    <th className="p-4 border-r-2 border-black font-black">Total</th>
                    <th className="p-4 border-r-2 border-black font-black text-center">Status</th>
                    <th className="p-4 font-black text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-pink-light/10">
                      {/* ID */}
                      <td className="p-4 border-r-2 border-black font-black">{order.id}</td>
                      
                      {/* Date */}
                      <td className="p-4 border-r-2 border-black text-xs whitespace-nowrap">
                        {order.timestamp}
                      </td>

                      {/* Customer */}
                      <td className="p-4 border-r-2 border-black">
                        <div>{order.namaPemesan}</div>
                        <div className="text-[10px] text-black/60 truncate max-w-[120px]">{order.email}</div>
                      </td>

                      {/* WhatsApp */}
                      <td className="p-4 border-r-2 border-black">
                        <a
                          href={`https://wa.me/${order.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 hover:underline text-xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          {order.whatsapp}
                        </a>
                      </td>

                      {/* Product */}
                      <td className="p-4 border-r-2 border-black">
                        <div className="truncate max-w-[150px]">{order.namaBarang}</div>
                        <div className="text-xs text-black/60">Qty: {order.jumlah}x</div>
                      </td>

                      {/* Size */}
                      <td className="p-4 border-r-2 border-black uppercase text-xs font-black">
                        {order.sizeOrder}
                      </td>

                      {/* Fee */}
                      <td className="p-4 border-r-2 border-black">
                        {formatIDR(order.feeJastip)}
                      </td>

                      {/* Total */}
                      <td className="p-4 border-r-2 border-black font-black">
                        {formatIDR(order.totalPembayaran)}
                      </td>

                      {/* Status */}
                      <td className="p-4 border-r-2 border-black text-center">
                        {updatingId === order.id ? (
                          <span className="text-xs font-black uppercase text-black/50 animate-pulse">Updating...</span>
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
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          {order.lampiranUrl && order.lampiranUrl.startsWith("http") && (
                            <a
                              href={order.lampiranUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 border border-black bg-white hover:bg-green shadow-nb-sm transition-colors text-xs uppercase font-black"
                              title="Lihat Lampiran Gambar"
                            >
                              <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                            </a>
                          )}
                          <a
                            href={`https://wa.me/${order.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 border border-black bg-green hover:bg-green-light shadow-nb-sm transition-colors"
                          >
                            <MessageSquare className="w-4 h-4 text-black stroke-[2.5]" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </NbCard>
      </div>

      {/* Mobile Stacked Card View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 border-4 border-black border-dashed bg-white text-center font-black uppercase tracking-wider text-black/50">
            Tidak ada data pesanan yang cocok.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <NbCard key={order.id} className="border-4 border-black p-5 shadow-nb space-y-4 font-bold">
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <span className="font-black text-sm uppercase tracking-wider text-black">{order.id}</span>
                <NbBadge variant={statusColors[order.status] || "white"}>{order.status}</NbBadge>
              </div>

              <div className="text-sm space-y-2">
                <div>
                  <span className="text-xs text-black/50 block font-black uppercase">Tanggal:</span>
                  <span>{order.timestamp}</span>
                </div>
                <div>
                  <span className="text-xs text-black/50 block font-black uppercase">Customer:</span>
                  <div>{order.namaPemesan}</div>
                  <div className="text-xs text-black/60">{order.email}</div>
                  <div className="text-xs text-black/60">WA: {order.whatsapp}</div>
                </div>
                <div>
                  <span className="text-xs text-black/50 block font-black uppercase">Belanjaan:</span>
                  <div>{order.namaBarang}</div>
                  <div className="text-xs text-black/60">Varian: {order.ukuranVarian || "-"}, Warna: {order.warna || "-"}</div>
                  <div className="text-xs text-black/60">Qty: {order.jumlah}x</div>
                  <div className="text-xs text-black/60">Size: {order.sizeOrder.toUpperCase()}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-black/20 pt-2 text-xs">
                  <div>
                    <span className="text-black/50 block font-black uppercase">Fee Jastip:</span>
                    <span>{formatIDR(order.feeJastip)}</span>
                  </div>
                  <div>
                    <span className="text-black/50 block font-black uppercase">Total Bayar:</span>
                    <span className="font-black text-pink">{formatIDR(order.totalPembayaran)}</span>
                  </div>
                </div>
              </div>

              {/* Status Select & Actions */}
              <div className="flex items-center justify-between gap-4 border-t-2 border-black pt-3">
                <div className="flex-1">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="w-full bg-white border-2 border-black py-1.5 px-2 text-xs font-black uppercase focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Waiting Payment">Waiting Payment</option>
                    <option value="Purchased">Purchased</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  {order.lampiranUrl && order.lampiranUrl.startsWith("http") && (
                    <a
                      href={order.lampiranUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 border-2 border-black bg-white hover:bg-green shadow-nb-sm"
                    >
                      <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                    </a>
                  )}
                  <a
                    href={`https://wa.me/${order.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 border-2 border-black bg-green hover:bg-green-light shadow-nb-sm"
                  >
                    <MessageSquare className="w-4 h-4 text-black stroke-[2.5]" />
                  </a>
                </div>
              </div>
            </NbCard>
          ))
        )}
      </div>

    </div>
  );
}
