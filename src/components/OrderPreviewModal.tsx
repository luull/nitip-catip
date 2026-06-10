import React from "react";
import { ClipboardList, ShoppingBag, User, X, Loader2 } from "lucide-react";
import { OrderFormData } from "@/types";

interface OrderPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderData: OrderFormData;
  isLoading: boolean;
  feeJastip: number;
  flatOngkir: number;
  selectedBank: string;
}

export default function OrderPreviewModal({
  isOpen,
  onClose,
  onConfirm,
  orderData,
  isLoading,
  feeJastip,
  flatOngkir,
  selectedBank,
}: OrderPreviewModalProps) {
  if (!isOpen) return null;

  const totalPrice = orderData.hargaBarang * orderData.jumlah + feeJastip;

  // Format currency helper
  const formatIDR = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-sans">
      <div className="relative w-full max-w-2xl bg-white border-4 border-black shadow-nb-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-pink">
          <div className="flex items-center gap-2 text-black">
            <ClipboardList className="w-5 h-5 stroke-[2.5]" />
            <h3 className="font-black text-black text-lg uppercase tracking-wider">
              PRIN PREVIEW PESANAN 🔍
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-black border-2 border-black bg-white hover:bg-pink-light p-1 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-black">
          {/* Dual Column Info Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buyer Info */}
            <div className="space-y-4 border-4 border-black p-4 bg-green-light/20 shadow-nb-sm">
              <h4 className="font-black text-black flex items-center gap-2 border-b-2 border-black pb-2 text-sm uppercase tracking-wider">
                <User className="w-4 h-4 stroke-[2.5]" />
                Customer Info
              </h4>
              <div className="space-y-2 text-sm font-bold">
                <div>
                  <span className="text-black/60 block text-xs uppercase font-black">
                    Nama Lengkap
                  </span>
                  <span className="text-black">{orderData.namaPemesan}</span>
                </div>
                <div>
                  <span className="text-black/60 block text-xs uppercase font-black">
                    WhatsApp
                  </span>
                  <span className="text-black">{orderData.whatsapp}</span>
                </div>
                <div>
                  <span className="text-black/60 block text-xs uppercase font-black">
                    Email
                  </span>
                  <span className="text-black">{orderData.email}</span>
                </div>
                <div>
                  <span className="text-black/60 block text-xs uppercase font-black">
                    Alamat Tujuan
                  </span>
                  <span className="text-black">
                    {orderData.kotaTujuan}, {orderData.kodePos}
                  </span>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-4 border-4 border-black p-4 bg-pink-light/20 shadow-nb-sm">
              <h4 className="font-black text-black flex items-center gap-2 border-b-2 border-black pb-2 text-sm uppercase tracking-wider">
                <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                Product Info
              </h4>
              <div className="space-y-2 text-sm font-bold">
                <div>
                  <span className="text-black/60 block text-xs uppercase font-black">
                    Nama Barang
                  </span>
                  <span className="text-black">{orderData.namaBarang}</span>
                </div>
                {orderData.linkProduk && (
                  <div>
                    <span className="text-black/60 block text-xs uppercase font-black">
                      Link Produk
                    </span>
                    <a
                      href={orderData.linkProduk}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink hover:text-black hover:underline truncate block max-w-xs"
                    >
                      {orderData.linkProduk}
                    </a>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-black/60 block text-xs uppercase font-black">
                      Varian
                    </span>
                    <span className="text-black">
                      {orderData.ukuranVarian || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-black/60 block text-xs uppercase font-black">
                      Warna
                    </span>
                    <span className="text-black">{orderData.warna || "-"}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 border-t border-black/20 pt-2">
                  <div>
                    <span className="text-black/60 block text-xs uppercase font-black">
                      Qty
                    </span>
                    <span className="text-black">{orderData.jumlah}x</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-black/60 block text-xs uppercase font-black">
                      Harga
                    </span>
                    <span className="text-black">
                      {formatIDR(orderData.hargaBarang)}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-black/60 block text-xs uppercase font-black">
                    jenis Pembayaran
                  </span>
                  <span className="text-black">
                    {selectedBank.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Attachment Preview */}
          {orderData.lampiranUrl && (
            <div className="border-4 border-black bg-white p-4 flex items-center gap-4 shadow-nb-sm">
              <img
                src={orderData.lampiranUrl}
                alt="Attachment Preview"
                className="w-16 h-16 object-cover border-2 border-black"
              />
              <div className="truncate">
                <span className="text-sm font-black block truncate max-w-sm">
                  {orderData.lampiranName || "Gambar Produk"}
                </span>
                <span className="text-xs font-bold text-black/60">
                  Foto Referensi Terlampir
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          {orderData.catatan && (
            <div className="border-4 border-black bg-white p-4 font-bold text-sm shadow-nb-sm">
              <span className="text-black/60 block text-xs uppercase font-black mb-1">
                Catatan Pemesan
              </span>
              <p className="italic">{orderData.catatan}</p>
            </div>
          )}

          {/* Cost breakdown */}
          <div className="border-4 border-black bg-green-light p-5 space-y-3 font-bold shadow-nb-sm">
            <div className="flex justify-between text-sm">
              <span>Subtotal ({orderData.jumlah} barang)</span>
              <span>{formatIDR(orderData.hargaBarang * orderData.jumlah)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Jastip Size Fee ({orderData.sizeOrder.toUpperCase()})</span>
              <span>{formatIDR(feeJastip)}</span>
            </div>
            {/* <div className="flex justify-between text-sm">
              <span>Ongkos Kirim JNE</span>
              <span>{formatIDR(flatOngkir)}</span>
            </div> */}
            <div className="flex justify-between pt-3 border-t-2 border-black text-base font-black">
              <span>TOTAL ESTIMASI BAYAR</span>
              <span className="text-lg">{formatIDR(totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white border-t-4 border-black">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-1/2 py-3 border-4 border-black bg-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-black uppercase text-sm shadow-nb-sm disabled:opacity-50"
          >
            Batal & Edit
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-1/2 py-3 border-4 border-black bg-pink hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-black uppercase text-sm shadow-nb-sm flex items-center justify-center gap-2 disabled:opacity-75"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Mengirim...
              </>
            ) : (
              "Kirim Jastip Sekarang 🚀"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
