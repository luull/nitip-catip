import React from "react";
import { CheckCircle2, MessageSquare, X } from "lucide-react";
import { OrderFormData } from "@/types";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: OrderFormData | null;
  feeJastip: number;
  flatOngkir: number;
}

export default function SuccessModal({
  isOpen,
  onClose,
  orderData,
  feeJastip,
  flatOngkir,
}: SuccessModalProps) {
  if (!isOpen || !orderData) return null;

  const adminNumber =
    process.env.NEXT_PUBLIC_WA_ADMIN_NUMBER || "6281586298430";
  const totalPrice =
    orderData.hargaBarang * orderData.jumlah + feeJastip + flatOngkir;

  // Format currency helper
  const formatIDR = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Generate WhatsApp pre-filled message
  const generateWAMessage = () => {
    const text = `Halo Kak Admin Nitipcatip! ★ Saya mau konfirmasi pesanan jastip:

*Data Pemesan:*
- Nama: ${orderData.namaPemesan}
- WhatsApp: ${orderData.whatsapp}
- Kota Tujuan: ${orderData.kotaTujuan} (${orderData.kodePos})

*Detail Barang:*
- Nama Barang: ${orderData.namaBarang}
- Varian/Ukuran: ${orderData.ukuranVarian || "-"}
- Warna: ${orderData.warna || "-"}
- Jumlah: ${orderData.jumlah} pcs
- Harga Satuan: ${formatIDR(orderData.hargaBarang)}
- Size Order: ${orderData.sizeOrder.toUpperCase()}
- Fee Jastip: ${formatIDR(feeJastip)}
- Ongkir JNE: ${formatIDR(flatOngkir)}
- *Total Bayar: ${formatIDR(totalPrice)}*
${orderData.linkProduk ? `\n*Link Produk:* ${orderData.linkProduk}` : ""}
${orderData.catatan ? `\n*Catatan:* ${orderData.catatan}` : ""}

Apakah pesanan saya sudah terdata di sistem? Terima kasih!`;

    return `https://wa.me/${adminNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-sans">
      <div className="relative w-full max-w-lg bg-white border-4 border-black shadow-nb-lg flex flex-col max-h-[90vh]">
        {/* Decorative Top Line */}
        <div className="h-4 bg-green w-full border-b-4 border-black" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-4 text-black border-2 border-black bg-white hover:bg-pink-light p-1 transition-colors"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div className="p-6 md:p-8 overflow-y-auto flex-1 flex flex-col items-center text-center text-black">
          {/* Green Checkmark */}
          <div className="w-20 h-20 bg-green border-4 border-black rounded-none flex items-center justify-center text-black mb-6 shadow-nb-sm">
            <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
          </div>

          <h3 className="text-2xl md:text-3xl font-black uppercase tracking-wider mb-2">
            🎉 Pesanan Terkirim!
          </h3>
          <p className="text-black/75 text-sm md:text-base font-bold max-w-sm mb-6">
            Detail request belanja Anda telah sukses tercatat di Google Sheet.
            Silakan klik tombol di bawah untuk konfirmasi ke WhatsApp Admin.
          </p>

          {/* Quick Summary Card */}
          <div className="w-full bg-pink-light/20 border-4 border-black p-5 mb-8 text-left text-sm font-bold space-y-3 shadow-nb-sm">
            <div className="border-b-2 border-black pb-2 mb-2 font-black uppercase text-xs tracking-wider">
              🧾 Ringkasan Invoice Jastip
            </div>

            <div className="flex justify-between">
              <span className="text-black/60">Nama Pemesan</span>
              <span className="text-black">{orderData.namaPemesan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black/60">Barang</span>
              <span className="text-black text-right max-w-[200px] truncate">
                {orderData.namaBarang} ({orderData.jumlah}x)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-black/60">Size Order</span>
              <span className="text-black uppercase">
                {orderData.sizeOrder}
              </span>
            </div>
            <div className="flex justify-between border-t-2 border-black pt-3 mt-1 text-base font-black">
              <span>TOTAL ESTIMASI</span>
              <span className="text-black">{formatIDR(totalPrice)}</span>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="w-full space-y-3">
            <a
              href={generateWAMessage()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 border-4 border-black bg-green hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-black text-base uppercase shadow-nb-sm"
            >
              <MessageSquare className="w-5 h-5 stroke-[2.5]" />
              Hubungi Admin WhatsApp
            </a>

            <button
              onClick={onClose}
              className="w-full py-3.5 border-4 border-black bg-white hover:bg-gray-100 transition-colors font-black text-sm uppercase"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
