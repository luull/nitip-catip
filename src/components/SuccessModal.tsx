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

  const totalSubtotal = orderData.items.reduce(
    (sum, item) => sum + item.hargaBarang * item.jumlah,
    0,
  );
  const totalPrice = totalSubtotal + feeJastip + flatOngkir;

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
    let itemsText = orderData.items
      .map(
        (item, i) =>
          `
*Produk #${i + 1}:*
- Nama Barang: ${item.namaBarang}
- Varian/Ukuran: ${item.ukuranVarian || "-"}
- Warna: ${item.warna || "-"}
- Jumlah: ${item.jumlah} pcs
- Harga Satuan: ${formatIDR(item.hargaBarang)}
- Size Order: ${item.sizeOrder.toUpperCase()}`,
      )
      .join("\n");

    const text = `Halo Kak Admin Nitipcatip! ★ Saya mau konfirmasi pesanan jastip:

*Data Pemesan:*
- Nama: ${orderData.namaPemesan}
- WhatsApp: ${orderData.whatsapp}
- Kota Tujuan: ${orderData.kotaTujuan} (${orderData.kodePos})

${itemsText}

*Total Fee Jastip: ${formatIDR(feeJastip)}*
*Ongkir: ${formatIDR(flatOngkir)}*
*Total Bayar: ${formatIDR(totalPrice)}*
${orderData.catatan ? `\n*Catatan:* ${orderData.catatan}` : ""}

Apakah pesanan saya sudah terdata di sistem? Terima kasih!`;

    return `https://wa.me/${adminNumber}?text=${encodeURIComponent(text)}`;
  };

  const totalQty = orderData.items.reduce((s, i) => s + i.jumlah, 0);

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

            <div className="border-t border-black/20 pt-2 space-y-2">
              {orderData.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-black/60 truncate pr-2">
                    #{idx + 1} {item.namaBarang}
                  </span>
                  <span className="text-black text-right flex-shrink-0">
                    {item.jumlah}x · {item.sizeOrder.toUpperCase()}
                  </span>
                </div>
              ))}
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
