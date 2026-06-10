"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Order } from "@/types";
import { ShoppingBag, DollarSign, Wallet, FileText, CheckCircle, Clock } from "lucide-react";
import NbCard from "@/components/ui/NbCard";
import NbBadge from "@/components/ui/NbBadge";
import NbButton from "@/components/ui/NbButton";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [sheetStatus, setSheetStatus] = useState<"connected" | "disconnected">("disconnected");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/admin/orders");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setOrders(data.orders || []);
            setSheetStatus(data.sheetStatus);
          } else {
            setError(data.error || "Gagal memuat data sheet.");
            setSheetStatus("disconnected");
          }
        } else {
          throw new Error("HTTP error loading orders");
        }
      } catch (err: any) {
        console.error("Dashboard error:", err);
        setError("Gagal terhubung dengan server API.");
        setSheetStatus("disconnected");
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const formatIDR = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculations
  const totalOrders = orders.length;
  
  const totalRevenue = orders.reduce((acc, order) => {
    // Only calculate revenue for non-cancelled orders
    if (order.status !== "Cancelled") {
      return acc + (order.totalPembayaran || 0);
    }
    return acc;
  }, 0);

  const totalFeeCollected = orders.reduce((acc, order) => {
    if (order.status !== "Cancelled") {
      return acc + (order.feeJastip || 0);
    }
    return acc;
  }, 0);

  const pendingOrders = orders.filter(o => o.status === "Pending" || o.status === "Waiting Payment").length;
  const completedOrders = orders.filter(o => o.status === "Completed").length;

  const stats = [
    {
      title: "Total Order",
      value: totalOrders,
      icon: ShoppingBag,
      variant: "pink-light" as const
    },
    {
      title: "Total Omset (Revenue)",
      value: formatIDR(totalRevenue),
      icon: DollarSign,
      variant: "green-light" as const
    },
    {
      title: "Total Fee Jastip",
      value: formatIDR(totalFeeCollected),
      icon: Wallet,
      variant: "white" as const
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
      icon: Clock,
      variant: "white" as const
    },
    {
      title: "Completed Orders",
      value: completedOrders,
      icon: CheckCircle,
      variant: "green-light" as const
    }
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-black font-sans">
        <div className="w-16 h-16 border-8 border-black border-t-pink animate-spin mb-4" />
        <p className="font-black uppercase tracking-wider text-sm">LOADING ADMIN DATA...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans text-black">
      
      {/* Header Overview */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-4 border-black pb-6">
        <div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-wider">
            Overview Dashboard 📊
          </h1>
          <p className="font-bold text-black/60 mt-1">
            Ringkasan data transaksi Nitip Catip.
          </p>
        </div>

        {/* Google Sheet Connection Badge */}
        <div>
          {sheetStatus === "connected" ? (
            <NbBadge variant="green" className="shadow-nb-sm py-2 px-3 text-sm">
              🟢 Google Sheet Connected
            </NbBadge>
          ) : (
            <NbBadge variant="pink" className="shadow-nb-sm py-2 px-3 text-sm animate-nb-shake">
              🔴 Google Sheet Disconnected
            </NbBadge>
          )}
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <NbCard
              key={i}
              variant={stat.variant}
              className="p-5 border-4 border-black shadow-nb-sm flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-black uppercase text-black/60 block">{stat.title}</span>
                <span className="text-xl sm:text-2xl font-black block mt-2">{stat.value}</span>
              </div>
              <div className="mt-4 flex justify-end">
                <span className="p-2 border-2 border-black bg-white rounded-none shadow-nb-sm">
                  <Icon className="w-5 h-5 stroke-[2.5]" />
                </span>
              </div>
            </NbCard>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-xl uppercase tracking-wider">
              Recent Orders 🛍️
            </h3>
            <Link href="/admin/orders">
              <NbButton variant="white" className="py-1.5 px-3 text-xs shadow-nb-sm font-black">
                Lihat Semua
              </NbButton>
            </Link>
          </div>

          <NbCard className="border-4 border-black shadow-nb overflow-hidden">
            {orders.length === 0 ? (
              <div className="p-12 text-center">
                <p className="font-black uppercase tracking-wider text-black/50">Belum ada pesanan masuk</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-bold text-sm">
                  <thead>
                    <tr className="bg-pink text-black border-b-4 border-black uppercase text-xs">
                      <th className="p-4 border-r-2 border-black font-black">Order ID</th>
                      <th className="p-4 border-r-2 border-black font-black">Pemesan</th>
                      <th className="p-4 border-r-2 border-black font-black">Produk</th>
                      <th className="p-4 border-r-2 border-black font-black">Total</th>
                      <th className="p-4 font-black text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-black">
                    {orders.slice(-5).reverse().map((order) => {
                      const statusColors = {
                        Pending: "white" as const,
                        "Waiting Payment": "yellow" as const,
                        Purchased: "blue" as const,
                        Shipped: "pink" as const,
                        Completed: "green" as const,
                        Cancelled: "gray" as const,
                      };

                      return (
                        <tr key={order.id} className="hover:bg-pink-light/10">
                          <td className="p-4 border-r-2 border-black font-black">{order.id}</td>
                          <td className="p-4 border-r-2 border-black">{order.namaPemesan}</td>
                          <td className="p-4 border-r-2 border-black truncate max-w-[150px]">{order.namaBarang}</td>
                          <td className="p-4 border-r-2 border-black">{formatIDR(order.totalPembayaran)}</td>
                          <td className="p-4 text-center">
                            <NbBadge variant={statusColors[order.status] || "white"}>
                              {order.status}
                            </NbBadge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </NbCard>
        </div>

        {/* Action Panel / Quick Help */}
        <div className="space-y-6">
          <h3 className="font-black text-xl uppercase tracking-wider">
            Quick Actions ⚙️
          </h3>

          <NbCard variant="green-light" className="p-6 border-4 border-black shadow-nb space-y-4 font-bold">
            <h4 className="font-black text-lg uppercase border-b-2 border-black pb-1">
              Atur Jastip Fee 💰
            </h4>
            <p className="text-sm text-black/80">
              Admin dapat dengan bebas mengatur tarif Jasa Titip (Jastip) berdasarkan ukuran order. Tarif baru akan otomatis langsung digunakan pada form pemesanan customer secara realtime!
            </p>
            <Link href="/admin/settings/fee" className="block">
              <NbButton variant="pink" className="w-full shadow-nb-sm">
                Atur Setting Fee
              </NbButton>
            </Link>
          </NbCard>

          <NbCard variant="white" className="p-6 border-4 border-black shadow-nb space-y-4 font-bold">
            <h4 className="font-black text-lg uppercase border-b-2 border-black pb-1">
              Status Sinkronisasi 🟢
            </h4>
            <div className="text-sm space-y-2 text-black/80">
              <div className="flex justify-between">
                <span>Google Apps Script:</span>
                <span className="font-black text-green">Online</span>
              </div>
              <div className="flex justify-between">
                <span>Total Data Sinkron:</span>
                <span className="font-black">{orders.length} Order</span>
              </div>
              <div className="flex justify-between">
                <span>Mode Panel:</span>
                <span className="font-black uppercase text-pink">Live Admin</span>
              </div>
            </div>
          </NbCard>
        </div>

      </div>
    </div>
  );
}
