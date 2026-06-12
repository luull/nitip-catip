"use client";

import OrderForm from "@/components/OrderForm";
import NbBadge from "@/components/ui/NbBadge";
import NbButton from "@/components/ui/NbButton";
import { CatalogItem, OpenTrip } from "@/types";
import { CheckCircle, ShieldCheck, Users, MessageCircle, ShoppingCart, History } from "lucide-react";
import { useRef, useState } from "react";

import { useCart } from "@/context/CartContext";

export default function Home() {
  const { totalCount } = useCart();
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<OpenTrip | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const clearSelection = () => {
    setSelectedItem(null);
    setSelectedTrip(null);
  };

  return (
    <div className="min-h-screen bg-[#FFF8FB] text-black antialiased font-sans">
      {/* HEADER / NAVBAR */}
      <header className="sticky top-0 z-40 bg-white border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-24 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-pink border-4 border-black flex items-center justify-center text-black font-black text-2xl shadow-nb-sm">
              ★
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-black tracking-tight block">
                Nitip Catip <span className="text-pink"></span>
              </span>
              <span className="text-[10px] sm:text-xs text-black/70 font-black tracking-widest uppercase block -mt-1">
                JASA TITIP BELANJA
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm sm:text-base font-black uppercase tracking-wider">
 
            <a
              href="/cart"
              className="flex items-center gap-1.5 hover:text-pink transition-colors relative"
            >
              <ShoppingCart className="w-4 h-4" />
              Keranjang
              {totalCount > 0 && (
                <span className="absolute -top-2 -right-4 bg-pink border-2 border-black text-[10px] font-black w-5 h-5 flex items-center justify-center">
                  {totalCount}
                </span>
              )}
            </a>
            <a
              href="/riwayat"
              className="flex items-center gap-1.5 hover:text-pink transition-colors"
            >
              <History className="w-4 h-4" />
              Riwayat
            </a>
            <a
              href="https://chat.whatsapp.com/GR91ffPlxPuI1jfG3ABrup?mode=gi_t"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-green transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Grup WA
            </a>
          </nav>

          <div>
            <NbButton
              onClick={scrollToForm}
              variant="green"
              className="text-xs sm:text-sm shadow-nb-sm"
            >
              Request Jastip 🚀
            </NbButton>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:py-28 bg-pink border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            <NbBadge variant="green" className="py-2 px-4 shadow-nb-sm text-sm">
              ✨ Jastip Terpercaya Seluruh Dunia
            </NbBadge>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-black leading-[1.1] tracking-tight">
              Titip Belanja <br />
              Jadi Lebih{" "}
              <span className="underline decoration-green decoration-8 underline-offset-4">
                Mudah
              </span>
            </h1>

            <p className="text-black font-bold text-base sm:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Ingin belanja produk viral tapi terkendala ongkos, mager? Nitip
              Catip siap membawakan pesanan Anda langsung ke depan rumah!, tapi
              boong
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <NbButton
                onClick={scrollToForm}
                variant="green"
                className="w-full sm:w-auto text-base py-4 px-8 shadow-nb"
              >
                Gas Jajan Sekarang
              </NbButton>
            </div>
          </div>

          <div className="lg:col-span-5 relative hidden lg:block">
            <img
              src="./karakter.png"
              alt="Jastip Showcase"
              className="w-full h-full object-cover border-4 border-black"
            />
          </div>
        </div>
      </section>

      {/* STATS & TRUST BENEFITS */}
      <section
        id="about"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border-4 border-black p-6 shadow-nb-lg flex items-start gap-4">
            <div className="w-14 h-14 bg-pink border-2 border-black flex items-center justify-center text-black shrink-0 shadow-nb-sm">
              <ShieldCheck className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-black text-lg text-black uppercase">
                100% Transparan
              </h4>
              <p className="text-sm font-bold text-black/70 mt-1">
                Estimasi harga belanja dan ongkir dihitung jujur di awal. Tanpa
                biaya tambahan tersembunyi.
              </p>
            </div>
          </div>

          <div className="bg-white border-4 border-black p-6 shadow-nb-lg flex items-start gap-4">
            <div className="w-14 h-14 bg-green border-2 border-black flex items-center justify-center text-black shrink-0 shadow-nb-sm">
              <Users className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-black text-lg text-black uppercase">
                Grup WhatsApp Eksklusif
              </h4>
              <p className="text-sm font-bold text-black/70 mt-1">
                Setelah pesanan berhasil dibuat, kamu akan mendapatkan akses ke
                grup WhatsApp Nitip Catip untuk update produk yang mau di jastip
              </p>
            </div>
          </div>

          <div className="bg-white border-4 border-black p-6 shadow-nb-lg flex items-start gap-4">
            <div className="w-14 h-14 bg-amber-300 border-2 border-black flex items-center justify-center text-black shrink-0 shadow-nb-sm">
              <CheckCircle className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-black text-lg text-black uppercase">
                Mudah & Cepat
              </h4>
              <p className="text-sm font-bold text-black/70 mt-1">
                Cukup isi form, preview pesanan, dan kirim ke WhatsApp Admin.
                Kami urus semuanya dari A sampai Z.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* REQUEST FORM CONTAINER SECTION */}
      <section
        id="request-form"
        ref={formRef}
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-5 py-16 border-t-4 border-black"
      >
        {/* Selected autofill alert
        {(selectedItem || selectedTrip) && (
          <div className="mb-6 p-4 bg-amber-300 border-4 border-black text-black text-sm font-black shadow-nb flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-black stroke-[2.5]" />
              <span>
                {selectedItem ? (
                  <>
                    AUTOFILL AKTIF: <strong>{selectedItem.name}</strong>
                  </>
                ) : (
                  <>
                    AUTOFILL TRIP: <strong>{selectedTrip?.destination}</strong>
                  </>
                )}
              </span>
            </div>
            <button
              onClick={clearSelection}
              className="text-black underline text-xs font-black uppercase hover:text-pink"
            >
              [ Bersihkan ]
            </button>
          </div>
        )} */}

        <OrderForm
          selectedItem={selectedItem}
          selectedTrip={selectedTrip}
          onClearSelection={clearSelection}
        />
      </section>

      {/* FOOTER */}
      <footer className="bg-black text-white py-16 border-t-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4 col-span-1 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink border-2 border-black flex items-center justify-center text-black font-black text-xl shadow-nb-sm">
                N
              </div>
              <span className="text-xl font-black text-white tracking-tight uppercase">
                Nitip Catip <span className="text-pink">★</span>
              </span>
            </div>
            <p className="text-sm font-bold text-white/70 leading-relaxed max-w-sm">
              Nitip Catip adalah platform perantara jasa titip (jastip) belanja
              barang dari berbagai tempat viral, dan terpercaya aman jaya
            </p>
          </div>

          <div>
            <h5 className="text-pink font-black text-sm uppercase tracking-wider mb-4 border-b-2 border-pink pb-1 w-fit">
              Navigasi Halaman
            </h5>
            <ul className="space-y-2 text-sm font-bold">
           
              <li>
                <a
                  href="#request-form"
                  className="hover:text-pink transition-colors"
                >
                  Form Pemesanan
                </a>
              </li>
              <li>
                <a href="/cart" className="hover:text-pink transition-colors flex items-center gap-1">
                  <ShoppingCart className="w-3.5 h-3.5" /> Keranjang Saya
                </a>
              </li>
              <li>
                <a href="/riwayat" className="hover:text-pink transition-colors flex items-center gap-1">
                  <History className="w-3.5 h-3.5" /> Riwayat Pesanan
                </a>
              </li>
              <li>
                <a
                  href="https://chat.whatsapp.com/GR91ffPlxPuI1jfG3ABrup?mode=gi_t"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green transition-colors flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Grup WhatsApp Jastip
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-green font-black text-sm uppercase tracking-wider mb-4 border-b-2 border-green pb-1 w-fit">
              Layanan Hubungi
            </h5>
            <ul className="space-y-2 text-sm font-bold">
              <li>Instagram: nitipcatip.id</li>
              <li>Whatsapp: 0818-0901-0906 </li>
              <li>Jam Operasional: 09:00 - 17:00 WIB</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t-2 border-white/20 mt-12 pt-6 text-center text-xs font-bold text-white/50">
          <p>&copy; {new Date().getFullYear()} Nitip Catip Jasa Titip</p>
        </div>
      </footer>
    </div>
  );
}
