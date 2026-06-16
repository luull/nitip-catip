"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Trash2,
  ShoppingCart,
  ArrowRight,
  Package,
  User,
  Check,
  Copy,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { FeeSettings } from "@/types";
import { DEFAULT_FEE_SETTINGS } from "@/config/jastip";
import NbButton from "@/components/ui/NbButton";
import NbCard from "@/components/ui/NbCard";
import NbInput from "@/components/ui/NbInput";
import NbTextArea from "@/components/ui/NbTextArea";
import OrderPreviewModal from "@/components/OrderPreviewModal";
import SuccessModal from "@/components/SuccessModal";
import ShippingModal from "@/components/ShippingModal";
import Swal from "sweetalert2";

interface CheckoutFormData {
  namaPemesan: string;
  whatsapp: string;
  email: string;
  kotaTujuan: string;
  kodePos: string;
  catatan: string;
}

const EMPTY_FORM: CheckoutFormData = {
  namaPemesan: "",
  whatsapp: "",
  email: "",
  kotaTujuan: "",
  kodePos: "",
  catatan: "",
};

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, clearCart, totalPrice, totalCount } = useCart();

  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isShippingOpen, setIsShippingOpen] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [selectedBank, setSelectedBank] = useState("");
  const [copiedBank, setCopiedBank] = useState("");
  const [feeSettings, setFeeSettings] = useState<FeeSettings>(DEFAULT_FEE_SETTINGS);

  const [form, setForm] = useState<CheckoutFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});
  const [submittedData, setSubmittedData] = useState<any>(null);

  // Fetch fee settings
  useEffect(() => {
    async function fetchFees() {
      try {
        const res = await fetch("/api/admin/fee-settings");
        if (res.ok) {
          const data = await res.json();
          if (data && data.small !== undefined) setFeeSettings(data);
        }
      } catch {}
    }
    fetchFees();
  }, []);

  const formatIDR = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleCopyBank = async (bankCode: string, accountNumber: string) => {
    await navigator.clipboard.writeText(accountNumber);
    setCopiedBank(bankCode);
    setTimeout(() => setCopiedBank(""), 2000);
  };

  const totalFeeJastip = items.reduce(
    (sum, item) => sum + (feeSettings[item.sizeOrder] || 3000),
    0,
  );

  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutFormData> = {};
    if (!form.namaPemesan.trim()) newErrors.namaPemesan = "Nama wajib diisi";
    if (!form.whatsapp.trim()) newErrors.whatsapp = "WhatsApp wajib diisi";
    else if (!/^[0-9]+$/.test(form.whatsapp)) newErrors.whatsapp = "Hanya angka";
    else if (form.whatsapp.length < 9) newErrors.whatsapp = "Minimal 9 digit";
    if (!form.email.trim()) newErrors.email = "Email wajib diisi";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Format email tidak valid";
    if (!form.kotaTujuan.trim()) newErrors.kotaTujuan = "Kota wajib diisi";
    if (!form.kodePos.trim()) newErrors.kodePos = "Kode pos wajib diisi";
    else if (!/^[0-9]+$/.test(form.kodePos)) newErrors.kodePos = "Hanya angka";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedCheckout = () => {
    if (items.length === 0) return;
    setShowCheckout(true);
    // Scroll to form
    setTimeout(() => {
      document.getElementById("checkout-form")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handlePreview = () => {
    if (!validateForm()) return;
    // Build data object matching OrderFormData shape
    const data = {
      namaPemesan: form.namaPemesan,
      whatsapp: form.whatsapp,
      email: form.email,
      kotaTujuan: form.kotaTujuan,
      kodePos: form.kodePos,
      items: items.map((item) => ({
        namaBarang: item.namaBarang,
        linkProduk: item.linkProduk,
        ukuranVarian: item.ukuranVarian || "",
        warna: item.warna || "",
        jumlah: item.jumlah,
        hargaBarang: item.hargaBarang,
        sizeOrder: item.sizeOrder,
        lampiranUrl: item.lampiranUrl || "",
        lampiranName: item.lampiranName || "",
      })),
      catatan: form.catatan,
      pembayaran: paymentMethod,
    };
    setSubmittedData(data);
    setIsPreviewOpen(true);
  };

  const handleSubmitOrder = async () => {
    if (!submittedData) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/submit-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...submittedData,
          estimasiOngkir: 20000,
          paymentMethod,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        const err = new Error(result.error || "Gagal mengirim pesanan") as any;
        err.details = result.details;
        throw err;
      }
      setOrderId(result.orderId || "");
      setIsPreviewOpen(false);
      setIsSuccessOpen(true);
      clearCart();
      setForm(EMPTY_FORM);
      setShowCheckout(false);
    } catch (error: any) {
      const errMessage = error.message || "Terjadi kesalahan saat mengirim pesanan.";
      let detailsHtml = "";
      if (error.details && typeof error.details === "object") {
        const lines = Object.entries(error.details)
          .map(([key, val]) => {
            const valStr = Array.isArray(val) ? val.join(", ") : String(val);
            return `<li><strong>${key}:</strong> ${valStr}</li>`;
          })
          .join("");
        detailsHtml = `<ul class="text-left text-sm mt-2 space-y-1">${lines}</ul>`;
      }
      Swal.fire({
        icon: "error",
        title: "Oops! Gagal mengirim pesanan",
        html: `<p class="text-sm">${errMessage}</p>${detailsHtml}`,
        confirmButtonText: "OK, Mengerti",
        confirmButtonColor: "#FF69B4",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8FB] text-black antialiased font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b-4 border-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/order")}
              className="border-2 border-black p-2 bg-white hover:bg-pink-light transition-colors"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div>
              <span className="text-xl font-black text-black tracking-tight block">
                Keranjang Saya
              </span>
              <span className="text-[10px] text-black/70 font-black tracking-widest uppercase block -mt-1">
                Nitip Catip
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-black text-lg">{items.length}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {items.length === 0 && !showCheckout ? (
          <NbCard variant="white" className="p-12 border-4 border-black text-center">
            <ShoppingCart className="w-20 h-20 mx-auto text-black/20 stroke-[1.5]" />
            <p className="font-black text-xl mt-4">Keranjang Kosong</p>
            <p className="text-sm font-bold text-black/60 mt-2">
              Belum ada produk di keranjang. Mulai order dan simpan ke keranjang.
            </p>
            <a href="/order">
              <NbButton variant="pink" className="mt-6">
                Mulai Order <ArrowRight className="w-4 h-4" />
              </NbButton>
            </a>
          </NbCard>
        ) : (
          <>
            {/* Cart Items */}
            {items.length > 0 && (
              <>
                <div className="flex items-center gap-2 border-b-4 border-black pb-3">
                  <ShoppingCart className="w-5 h-5" />
                  <h3 className="font-black text-lg uppercase">
                    Produk di Keranjang ({items.length})
                  </h3>
                </div>
                {items.map((item) => (
                  <NbCard
                    key={item.cartId}
                    variant="white"
                    className="p-5 border-4 border-black shadow-nb-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-pink border-2 border-black px-2 py-0.5 font-black text-xs uppercase">
                            <Package className="w-3 h-3 inline" /> Produk
                          </span>
                          <span className="text-xs font-bold text-black/60">
                            {item.sizeOrder.toUpperCase()}
                          </span>
                        </div>
                        <h4 className="font-black text-base">{item.namaBarang}</h4>
                        {item.linkProduk && (
                          <a
                            href={item.linkProduk}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-pink hover:underline truncate block max-w-sm mt-0.5"
                          >
                            {item.linkProduk}
                          </a>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs font-bold text-black/70">
                          {item.ukuranVarian && <span>Varian: {item.ukuranVarian}</span>}
                          {item.warna && <span>Warna: {item.warna}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.cartId)}
                        className="p-2 border-2 border-black bg-white hover:bg-pink-light transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between border-t-2 border-black pt-3">
                      <span className="text-sm font-bold">
                        {item.jumlah}x @ {formatIDR(item.hargaBarang)}
                      </span>
                      <span className="font-black text-base">
                        {formatIDR(item.hargaBarang * item.jumlah)}
                      </span>
                    </div>
                  </NbCard>
                ))}
              </>
            )}

            {/* Summary */}
            <NbCard variant="green" className="p-6 border-4 border-black space-y-3">
              <h4 className="font-black text-lg uppercase tracking-wider border-b-2 border-black pb-2">
                📊 Ringkasan
              </h4>
              <div className="space-y-2 font-bold text-sm">
                <div className="flex justify-between">
                  <span>Subtotal ({totalCount} pcs)</span>
                  <span>{formatIDR(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fee Jastip ({items.length} item)</span>
                  <span>{formatIDR(totalFeeJastip)}</span>
                </div>
                <div className="flex justify-between border-t-2 border-black pt-2 text-base font-black">
                  <span>Total Estimasi</span>
                  <span>{formatIDR(totalPrice + totalFeeJastip)}</span>
                </div>
              </div>
            </NbCard>

            {/* Checkout / Cart Actions */}
            {items.length > 0 && !showCheckout && (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => clearCart()}
                  className="flex-1 py-3 border-4 border-black bg-white hover:bg-pink-light transition-colors font-black text-sm uppercase flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Kosongkan
                </button>
                <NbButton variant="pink" className="flex-1 text-base" onClick={handleProceedCheckout}>
                  Lanjut Checkout <ArrowRight className="w-5 h-5" />
                </NbButton>
              </div>
            )}

            {/* ─── CHECKOUT FORM ─── */}
            {showCheckout && (
              <div id="checkout-form" className="space-y-6">
                <div className="flex items-center gap-2 border-b-4 border-black pb-3">
                  <User className="w-5 h-5" />
                  <h3 className="font-black text-lg uppercase">Data Pemesan</h3>
                </div>

                <NbCard variant="white" className="p-6 border-4 border-black space-y-4">
                  <NbInput
                    label="Nama Pemesan"
                    requiredMark
                    value={form.namaPemesan}
                    onChange={(e) => setForm({ ...form, namaPemesan: e.target.value })}
                    placeholder="Masukkan nama lengkap"
                    error={errors.namaPemesan}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <NbInput
                      label="WhatsApp"
                      requiredMark
                      value={form.whatsapp}
                      onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                      placeholder="081234567890"
                      error={errors.whatsapp}
                    />
                    <NbInput
                      label="Email"
                      type="email"
                      requiredMark
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="contoh@email.com"
                      error={errors.email}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <NbInput
                      label="Kota Tujuan"
                      requiredMark
                      value={form.kotaTujuan}
                      onChange={(e) => setForm({ ...form, kotaTujuan: e.target.value })}
                      placeholder="Jakarta"
                      error={errors.kotaTujuan}
                    />
                    <NbInput
                      label="Kode Pos"
                      requiredMark
                      value={form.kodePos}
                      onChange={(e) => setForm({ ...form, kodePos: e.target.value })}
                      placeholder="12345"
                      error={errors.kodePos}
                    />
                  </div>
                  <NbTextArea
                    label="Catatan (Opsional)"
                    value={form.catatan}
                    onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                    placeholder="Instruksi tambahan..."
                  />
                </NbCard>

                {/* Payment Method */}
                <div className="space-y-4">
                  <label className="block text-black font-black text-sm uppercase tracking-wider">
                    Metode Pembayaran
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      onClick={() => setPaymentMethod("qris")}
                      className={`border-4 border-black p-4 cursor-pointer ${
                        paymentMethod === "qris"
                          ? "bg-pink shadow-none translate-x-[2px] translate-y-[2px]"
                          : "bg-white shadow-nb-sm"
                      }`}
                    >
                      <h4 className="font-black uppercase">QRIS</h4>
                      <p className="text-xs font-bold mt-1">Scan QR</p>
                    </div>
                    <div
                      onClick={() => setPaymentMethod("transfer")}
                      className={`border-4 border-black p-4 cursor-pointer ${
                        paymentMethod === "transfer"
                          ? "bg-green shadow-none translate-x-[2px] translate-y-[2px]"
                          : "bg-white shadow-nb-sm"
                      }`}
                    >
                      <h4 className="font-black uppercase">Transfer Bank</h4>
                      <p className="text-xs font-bold mt-1">Transfer manual</p>
                    </div>
                  </div>

                  {paymentMethod === "qris" && (
                    <NbCard variant="white" className="p-5 border-4 border-black text-center">
                      <h4 className="font-black uppercase mb-3">Scan QRIS</h4>
                      <img src="/qris.png" alt="QRIS" className="w-48 mx-auto border-4 border-black" />
                      <p className="text-xs font-bold mt-3">Scan setelah admin konfirmasi.</p>
                    </NbCard>
                  )}

                  {paymentMethod === "transfer" && (
                    <div className="flex flex-col gap-3">
                      {[
                        { code: "blubca", name: "BLU BCA (A.N Edita Salsabila)", number: "0062 3009 8646" },
                        { code: "bni", name: "Seabank (A.N Fara Firginia)", number: "901114533859" },
                        { code: "permata", name: "Permata (A.N Edita Salsabila)", number: "9933116295" },
                        { code: "bca", name: "BCA (A.N Fara Firginia)", number: "7475076729" },
                      ].map((bank) => (
                        <div
                          key={bank.code}
                          onClick={() => setSelectedBank(bank.code)}
                          className={`border-4 border-black p-3 cursor-pointer ${
                            selectedBank === bank.code
                              ? "bg-green-light shadow-none translate-x-[2px] translate-y-[2px]"
                              : "bg-white shadow-nb-sm"
                          }`}
                        >
                          <h4 className="font-black text-sm">{bank.name}</h4>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-bold">{bank.number}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyBank(bank.code, bank.number.replace(/\s/g, ""));
                              }}
                              className="flex items-center gap-1 border-2 border-black px-2 py-1 bg-white hover:bg-gray-100 text-xs font-black"
                            >
                              {copiedBank === bank.code ? (
                                <><Check className="w-3 h-3" /> Tersalin</>
                              ) : (
                                <><Copy className="w-3 h-3" /> Salin</>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Checkout Actions */}
                <div className="flex flex-col sm:flex-row gap-3 border-t-4 border-black pt-6">
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="flex-1 py-3 border-4 border-black bg-white hover:bg-gray-100 transition-colors font-black text-sm uppercase"
                  >
                    Kembali ke Keranjang
                  </button>
                  <NbButton variant="pink" className="flex-1 text-base" onClick={handlePreview}>
                    Preview & Kirim <ArrowRight className="w-5 h-5" />
                  </NbButton>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {submittedData && (
        <OrderPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onConfirm={handleSubmitOrder}
          orderData={submittedData}
          isLoading={isSubmitting}
          feeJastip={totalFeeJastip}
          flatOngkir={20000}
          selectedBank={selectedBank}
        />
      )}

      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => {
          setIsSuccessOpen(false);
          setSubmittedData(null);
        }}
        orderData={submittedData}
        orderId={orderId}
        feeJastip={totalFeeJastip}
        flatOngkir={20000}
        onChooseShipping={() => {
          setIsSuccessOpen(false);
          setIsShippingOpen(true);
        }}
      />

      <ShippingModal
        isOpen={isShippingOpen}
        onClose={() => {
          setIsShippingOpen(false);
          setSubmittedData(null);
        }}
        orderId={orderId}
        whatsapp={submittedData?.whatsapp || ""}
        namaPemesan={submittedData?.namaPemesan || ""}
      />

      <footer className="bg-black text-white py-8 border-t-4 border-black mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-xs font-bold text-white/50">
          <p>&copy; {new Date().getFullYear()} Nitip Catip Jasa Titip</p>
        </div>
      </footer>
    </div>
  );
}
