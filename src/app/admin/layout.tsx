"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Settings, Menu, X, ArrowLeft, LogOut } from "lucide-react";
import NbButton from "@/components/ui/NbButton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.href = "/admin/login";
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin"
    },
    {
      name: "Daftar Pesanan ",
      href: "/admin/orders",
      icon: ShoppingCart,
      active: pathname === "/admin/orders"
    },
    {
      name: "Setting Fee",
      href: "/admin/settings/fee",
      icon: Settings,
      active: pathname === "/admin/settings/fee"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFF8FB] text-black flex flex-col font-sans">
      {/* Admin Header */}
      <header className="sticky top-0 z-30 bg-white border-b-4 border-black h-20 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden border-2 border-black p-1.5 bg-white hover:bg-pink-light shadow-nb-sm"
          >
            {isSidebarOpen ? <X className="w-6 h-6 stroke-[2.5]" /> : <Menu className="w-6 h-6 stroke-[2.5]" />}
          </button>

          <div className="w-10 h-10 bg-green border-2 border-black flex items-center justify-center text-black font-black text-xl shadow-nb-sm">
            A
          </div>
          <div>
            <span className="text-lg font-black tracking-tight block uppercase">
              Admin Panel ⚡
            </span>
            <span className="text-[10px] text-black/60 font-black tracking-wider block -mt-1">
              NITIP CATIP MANAGEMENT
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="border-2 border-black p-2 bg-white hover:bg-red-100 shadow-nb-sm transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4 stroke-[2.5]" />
          </button>
          <Link href="/">
            <NbButton variant="white" className="py-2 px-4 text-xs sm:text-sm shadow-nb-sm">
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              Lihat Website
            </NbButton>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex relative">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 top-20 z-20 w-64 bg-white border-r-4 border-black transition-transform duration-200 transform md:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:static md:h-[calc(100vh-80px)] shrink-0`}
        >
          <nav className="p-6 space-y-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} onClick={() => setIsSidebarOpen(false)}>
                  <div
                    className={`flex items-center gap-3 px-4 py-3 border-4 border-black transition-all font-black text-sm uppercase ${
                      item.active
                        ? "bg-pink shadow-none translate-x-[2px] translate-y-[2px]"
                        : "bg-white shadow-nb-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-nb"
                    }`}
                  >
                    <Icon className="w-5 h-5 stroke-[2.5]" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 top-20 bg-black/40 z-10 md:hidden"
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
