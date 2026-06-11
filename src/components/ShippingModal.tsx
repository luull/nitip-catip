import React, { useState } from "react";
import {
  X,
  ShoppingBag,
  Truck,
  Zap,
  MessageSquare,
  ExternalLink,
  Clock,
} from "lucide-react";
import Swal from "sweetalert2";

interface ShippingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  whatsapp: string;
  namaPemesan: string;
}

const WA_ADMIN_NUMBER =
  process.env.NEXT_PUBLIC_WA_ADMIN_NUMBER || "6281809010906";

const SHOPEE_LINK =
  "https://shopee.co.id/jastip-by-nitipcatip.id-i.268110076.57161747094?extraParams=%7B%22display_model_id%22%3A446024607810%2C%22model_selection_logic%22%3A2%7D";

export default function ShippingModal({
  isOpen,
  onClose,
  orderId,
  whatsapp,
  namaPemesan,
}: ShippingModalProps) {
  const [selectedShipping, setSelectedShipping] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const updateShippingMethod = async (method: string) => {
    setIsUpdating(true);
    try {
      await fetch("/api/orders/shipping", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, shipping_method: method }),
      });
    } catch (err) {
      console.error("Failed to update shipping method:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShippingSelect = async (method: string) => {
    setSelectedShipping(method);
    await updateShippingMethod(method);

    if (method === "shopee") {
      Swal.fire({
        icon: "success",
        title: "Checkout via Shopee",
        html: `
          <p class="text-sm">Anda akan diarahkan ke Shopee untuk checkout ongkir + packaging.</p>
          <p class="text-xs mt-2 text-gray-500">Pengiriman dilakukan H+2 setelah barang dibeli.</p>
        `,
        confirmButtonText: "Buka Shopee",
        showCancelButton: true,
        cancelButtonText: "Konfirmasi via WA",
        confirmButtonColor: "#EE4D2D",
        cancelButtonColor: "#25D366",
      }).then((result) => {
        if (result.isConfirmed) {
          window.open(SHOPEE_LINK, "_blank", "noopener,noreferrer");
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          const waText = encodeURIComponent(
            `Halo Admin Nitipcatip! ★\n\nSaya *${namaPemesan}* (${whatsapp})\nOrder ID: *${orderId}*\n\nSaya sudah checkout via Shopee dan ingin konfirmasi pengiriman. Mohon infonya ya!`,
          );
          window.open(
            `https://wa.me/${WA_ADMIN_NUMBER}?text=${waText}`,
            "_blank",
            "noopener,noreferrer",
          );
        }
      });
    } else {
      const shippingLabel =
        method === "cod" ? "Cash on Delivery" : "Gosend/Grab Instant";
      const waText = encodeURIComponent(
        `Halo Admin Nitipcatip! ★\n\nSaya *${namaPemesan}* (${whatsapp})\nOrder ID: *${orderId}*\n\nSaya ingin konfirmasi pengiriman via *${shippingLabel}*.\nMohon infonya ya!`,
      );
      window.open(
        `https://wa.me/${WA_ADMIN_NUMBER}?text=${waText}`,
        "_blank",
        "noopener,noreferrer",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-sans">
      <div className="relative w-full max-w-lg bg-white border-4 border-black shadow-nb-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="h-4 bg-pink w-full border-b-4 border-black" />
        <button
          onClick={onClose}
          className="absolute top-8 right-4 text-black border-2 border-black bg-white hover:bg-pink-light p-1 transition-colors"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
          {/* Title */}
          <div className="text-center">
            <div className="w-16 h-16 bg-green border-4 border-black mx-auto flex items-center justify-center text-black mb-4 shadow-nb-sm">
              <Truck className="w-9 h-9 stroke-[2.5]" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-wider text-black">
              Pilih Pengiriman
            </h3>
            <p className="text-sm font-bold text-black/70 mt-2">
              Order ID: <strong className="text-black">{orderId}</strong>
            </p>
            <p className="text-xs font-bold text-black/60 mt-1">
              Pilih metode pengiriman untuk pesanan Anda
            </p>
          </div>

          {/* Shipping Options */}
          <div className="space-y-3">
            {/* Shopee */}
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleShippingSelect("shopee")}
              className={`w-full border-4 border-black p-4 text-left cursor-pointer transition-all flex items-start gap-3 ${
                selectedShipping === "shopee"
                  ? "bg-orange-200 shadow-none translate-x-[2px] translate-y-[2px]"
                  : "bg-white shadow-nb-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-nb"
              }`}
            >
              <div className="w-10 h-10 bg-orange-300 border-2 border-black flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-sm uppercase">
                  Checkout via Shopee
                </h4>
                <p className="text-xs font-bold text-black/70 mt-0.5">
                  + Packaging rapih, pengiriman H+2
                </p>
                <div className="flex items-center gap-1 mt-1.5">
                  <ExternalLink className="w-3 h-3 text-black/50" />
                  <span className="text-[10px] font-bold text-black/50">
                    Diarahkan ke Shopee
                  </span>
                </div>
              </div>
            </button>

            {/* COD */}
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleShippingSelect("cod")}
              className={`w-full border-4 border-black p-4 text-left cursor-pointer transition-all flex items-start gap-3 ${
                selectedShipping === "cod"
                  ? "bg-green-light shadow-none translate-x-[2px] translate-y-[2px]"
                  : "bg-white shadow-nb-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-nb"
              }`}
            >
              <div className="w-10 h-10 bg-green border-2 border-black flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-sm uppercase">
                  Cash on Delivery
                </h4>
                <p className="text-xs font-bold text-black/70 mt-0.5">
                  Konfirmasi via WhatsApp Admin
                </p>
                <div className="flex items-center gap-1 mt-1.5">
                  <Clock className="w-3 h-3 text-black/50" />
                  <span className="text-[10px] font-bold text-black/50">
                    Pengiriman hari H atau H+1
                  </span>
                </div>
              </div>
            </button>

            {/* Gosend / Grab */}
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleShippingSelect("gosend")}
              className={`w-full border-4 border-black p-4 text-left cursor-pointer transition-all flex items-start gap-3 ${
                selectedShipping === "gosend"
                  ? "bg-pink-light shadow-none translate-x-[2px] translate-y-[2px]"
                  : "bg-white shadow-nb-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-nb"
              }`}
            >
              <div className="w-10 h-10 bg-pink border-2 border-black flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-sm uppercase">
                  Gosend / Grab Instant
                </h4>
                <p className="text-xs font-bold text-black/70 mt-0.5">
                  Konfirmasi via WhatsApp Admin
                </p>
                <div className="flex items-center gap-1 mt-1.5">
                  <Clock className="w-3 h-3 text-black/50" />
                  <span className="text-[10px] font-bold text-black/50">
                    Pengiriman hari H atau H+1
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Skip & History link */}
          <div className="text-center space-y-3 border-t-4 border-black pt-4">
            <a
              href={`/riwayat?whatsapp=${encodeURIComponent(whatsapp)}`}
              className="inline-flex items-center gap-1.5 text-sm font-black text-pink hover:text-black transition-colors uppercase"
            >
              📋 Lihat Riwayat Pesanan
            </a>
            <br />
            <button
              onClick={onClose}
              className="text-xs font-bold text-black/50 hover:text-black underline"
            >
              Lewati untuk sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
