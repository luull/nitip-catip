import React, { useState, useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Swal from "sweetalert2";
import {
  Box,
  User,
  UploadCloud,
  Trash2,
  ArrowRight,
  Check,
  Copy,
  Plus,
} from "lucide-react";
import {
  orderFormSchema,
  OrderFormData,
  CatalogItem,
  OpenTrip,
  FeeSettings,
} from "@/types";
import { DEFAULT_FEE_SETTINGS } from "@/config/jastip";
import OrderPreviewModal from "./OrderPreviewModal";
import SuccessModal from "./SuccessModal";
import NbCard from "./ui/NbCard";
import NbButton from "./ui/NbButton";
import NbInput from "./ui/NbInput";
import NbTextArea from "./ui/NbTextArea";

interface OrderFormProps {
  selectedItem: CatalogItem | null;
  selectedTrip: OpenTrip | null;
  onClearSelection: () => void;
}

const EMPTY_ITEM = {
  namaBarang: "",
  linkProduk: "",
  ukuranVarian: "",
  warna: "",
  jumlah: 1,
  hargaBarang: 0,
  sizeOrder: "small" as const,
  lampiranUrl: "",
  lampiranName: "",
};

const WA_ADMIN_NUMBER = process.env.NEXT_PUBLIC_WA_ADMIN_NUMBER || "6281809010906";
const WA_GROUP_LINK = "https://chat.whatsapp.com/GR91ffPlxPuI1jfG3ABrup?mode=gi_t"; // placeholder

export default function OrderForm({
  selectedItem,
  selectedTrip,
  onClearSelection,
}: OrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [copiedBank, setCopiedBank] = useState("");
  const [submittedData, setSubmittedData] = useState<OrderFormData | null>(
    null,
  );
  const handleCopyBank = async (bankCode: string, accountNumber: string) => {
    await navigator.clipboard.writeText(accountNumber);
    setCopiedBank(bankCode);
    setTimeout(() => setCopiedBank(""), 2000);
  };
  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [selectedBank, setSelectedBank] = useState("");
  // Dynamic fee settings state
  const [feeSettings, setFeeSettings] =
    useState<FeeSettings>(DEFAULT_FEE_SETTINGS);

  // Flat Shipping Fee (not used for calculation anymore, shipping is separate)
  const deliveryPriceMap = {
    small: 5000,
    medium: 10000,
    large_10: 20000,
    large_15: 20000,
    large_20: 20000,
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      namaPemesan: "",
      whatsapp: "",
      email: "",
      kotaTujuan: "",
      kodePos: "",
      items: [{ ...EMPTY_ITEM }],
      catatan: "",
      pembayaran: "",
    },
  });

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({
    control,
    name: "items",
  });

  // Fetch current fee settings from admin endpoint on mount
  useEffect(() => {
    async function fetchFees() {
      try {
        const res = await fetch("/api/admin/fee-settings");
        if (res.ok) {
          const data = await res.json();
          if (data && data.small !== undefined && data.medium !== undefined) {
            setFeeSettings(data);
          }
        }
      } catch (err) {
        console.error("Failed to load dynamic fees, using defaults:", err);
      }
    }
    fetchFees();
  }, []);

  // Watch all items for calculations
  const watchItems = watch("items");
  const [shippingMethod, setShippingMethod] = useState("");

  // Calculate totals across all items
  const totalSubtotal = (watchItems || []).reduce(
    (sum, item) => sum + (item?.hargaBarang || 0) * (item?.jumlah || 1),
    0,
  );
  const totalFeeJastip = (watchItems || []).reduce(
    (sum, item) => sum + (feeSettings[item?.sizeOrder || "small"] || 3000),
    0,
  );
  const totalDelivery = (watchItems || []).reduce(
    (sum, item) =>
      sum +
      (deliveryPriceMap[
        (item?.sizeOrder || "small") as keyof typeof deliveryPriceMap
      ] || 5000),
    0,
  );
  const grandTotal = totalSubtotal + totalFeeJastip;

  // Sync selected catalog item / trip into the LAST product item
  useEffect(() => {
    if (selectedItem) {
      const lastIdx = itemFields.length - 1;
      setValue(`items.${lastIdx}.namaBarang`, selectedItem.name);
      setValue(`items.${lastIdx}.hargaBarang`, selectedItem.price);
      if (selectedItem.defaultLink) {
        setValue(`items.${lastIdx}.linkProduk`, selectedItem.defaultLink);
      }
    }
  }, [selectedItem, setValue, itemFields.length]);

  useEffect(() => {
    if (selectedTrip) {
      setValue("catatan", `Jastip PO Trip: ${selectedTrip.destination}`);
    }
  }, [selectedTrip, setValue]);

  // File upload handlers per product item
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [filePreviews, setFilePreviews] = useState<Record<number, string>>({});
  const [fileNames, setFileNames] = useState<Record<number, string>>({});
  const [dragActive, setDragActive] = useState<number | null>(null);

  const handleFileChange = (index: number, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: "warning",
        title: "File terlalu besar",
        text: "Ukuran file tidak boleh melebihi 5MB.",
        confirmButtonColor: "#FF69B4",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFilePreviews((prev) => ({ ...prev, [index]: base64String }));
      setFileNames((prev) => ({ ...prev, [index]: file.name }));
      setValue(`items.${index}.lampiranUrl`, base64String);
      setValue(`items.${index}.lampiranName`, file.name);
    };
    reader.readAsDataURL(file);
  };

  const onDrag = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(index);
    } else if (e.type === "dragleave") {
      setDragActive(null);
    }
  };

  const onDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(index, e.dataTransfer.files[0]);
    }
  };

  const removeFile = (index: number) => {
    setFilePreviews((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    setFileNames((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    setValue(`items.${index}.lampiranUrl`, "");
    setValue(`items.${index}.lampiranName`, "");
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.value = "";
    }
  };

  const addNewItem = () => {
    appendItem({ ...EMPTY_ITEM });
  };

  const handleRemoveItem = (index: number) => {
    if (itemFields.length <= 1) return;
    removeItem(index);
    // Clean up file refs
    removeFile(index);
  };

  // Currency Formatter Helper
  const formatIDR = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const onSubmitValid = (data: OrderFormData) => {
    setSubmittedData(data);
    setIsPreviewOpen(true);
  };

  const handleConfirmSubmit = async () => {
    if (!submittedData) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/submit-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...submittedData,
          estimasiOngkir: totalDelivery,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const err = new Error(result.error || "Gagal mengirim pesanan") as any;
        err.details = result.details;
        throw err;
      }

      setIsPreviewOpen(false);
      setIsSuccessOpen(true);

      reset();
      setFilePreviews({});
      setFileNames({});
      onClearSelection();
    } catch (error: any) {
      const errMessage = error.message || "Terjadi kesalahan saat mengirim pesanan.";
      // Try to parse BE validation details if available
      let detailsHtml = "";
      if (error.details) {
        if (typeof error.details === "object") {
          const lines = Object.entries(error.details)
            .map(([key, val]) => {
              const valStr = Array.isArray(val) ? val.join(", ") : String(val);
              return `<li><strong>${key}:</strong> ${valStr}</li>`;
            })
            .join("");
          detailsHtml = `<ul class="text-left text-sm mt-2 space-y-1">${lines}</ul>`;
        } else {
          detailsHtml = `<p class="text-sm mt-2">${String(error.details)}</p>`;
        }
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
    <NbCard className="p-6 md:p-10" variant="white">
      {/* Form Title & Intro */}
      <div className="mb-8 border-b-4 border-black pb-6">
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-wider text-black">
          Form Request Jastip 📝
        </h2>
        <p className="text-black/70 text-sm md:text-base font-bold mt-2">
          Lengkapi data belanja Anda. Tambahkan beberapa produk sekaligus! Tim
          kami akan memverifikasi order Anda secepatnya!
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmitValid)} className="space-y-8">
        {/* Main Dual-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* LEFT COLUMN: PRODUCT ITEMS */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b-4 border-black pb-3 bg-pink-light/40 px-3 py-1 border border-black shadow-nb-sm">
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-black stroke-[2.5]" />
                <h3 className="font-black text-black tracking-widest text-sm md:text-base uppercase">
                  DETAIL PRODUK BELANJAAN
                </h3>
              </div>
              <span className="bg-black text-white font-black text-xs px-2 py-1">
                {itemFields.length} PRODUK
              </span>
            </div>

            {/* Render each product item */}
            {itemFields.map((field, index) => (
              <ProductItemCard
                key={field.id}
                index={index}
                register={register}
                watch={watch}
                setValue={setValue}
                errors={errors}
                feeSettings={feeSettings}
                formatIDR={formatIDR}
                filePreview={filePreviews[index]}
                fileName={fileNames[index]}
                dragActive={dragActive === index}
                fileInputRef={(el: HTMLInputElement | null) => {
                  fileInputRefs.current[index] = el;
                }}
                onFileChange={(file: File) => handleFileChange(index, file)}
                onDrag={(e: React.DragEvent) => onDrag(e, index)}
                onDrop={(e: React.DragEvent) => onDrop(e, index)}
                onRemoveFile={() => removeFile(index)}
                onRemoveItem={() => handleRemoveItem(index)}
                canRemove={itemFields.length > 1}
              />
            ))}

            {/* Add Product Button */}
            <button
              type="button"
              onClick={addNewItem}
              className="w-full border-4 border-dashed border-black bg-white/50 hover:bg-pink-light/30 p-4 flex items-center justify-center gap-2 font-black uppercase text-sm transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-nb hover:border-solid"
            >
              <Plus className="w-5 h-5" />
              Tambah Produk Lainnya
            </button>
          </div>

          {/* RIGHT COLUMN: INFORMASI PEMBELI */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b-4 border-black pb-3 bg-green-light/40 px-3 py-1 border border-black shadow-nb-sm">
              <User className="w-5 h-5 text-black stroke-[2.5]" />
              <h3 className="font-black text-black tracking-widest text-sm md:text-base uppercase">
                DETAIL PENGIRIMAN & DATA PEMESAN
              </h3>
            </div>

            {/* Nama Pemesan */}
            <NbInput
              label="Nama Pemesan"
              requiredMark
              {...register("namaPemesan")}
              placeholder="Masukkan nama lengkap Anda"
              error={errors.namaPemesan?.message}
            />

            {/* Email */}
            <NbInput
              label="Email"
              type="email"
              requiredMark
              {...register("email")}
              placeholder="contoh@email.com"
              error={errors.email?.message}
            />

            {/* No. Handphone (WhatsApp) */}
            <NbInput
              label="WhatsApp"
              requiredMark
              {...register("whatsapp")}
              placeholder="081234567890"
              error={errors.whatsapp?.message}
            />

            {/* Kota Tujuan & Kode Pos */}
            <div className="grid grid-cols-2 gap-4">
              <NbInput
                label="Kota Tujuan"
                requiredMark
                {...register("kotaTujuan")}
                placeholder="Contoh: Jakarta"
                error={errors.kotaTujuan?.message}
              />
              <NbInput
                label="Kode Pos"
                requiredMark
                {...register("kodePos")}
                placeholder="12345"
                error={errors.kodePos?.message}
              />
            </div>

            {/* Notes */}
            <NbTextArea
              label="Catatan Tambahan (Opsional)"
              {...register("catatan")}
              placeholder="Detail varian, size cadangan, atau instruksi belanja lainnya..."
            />

            {/* PAYMENT METHOD */}
            <div className="space-y-4">
              <label className="block text-black font-black text-sm md:text-base uppercase tracking-wider">
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
                  <p className="text-xs font-bold mt-1">
                    Scan QR untuk pembayaran
                  </p>
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
                  <p className="text-xs font-bold mt-1">
                    Transfer ke rekening bank
                  </p>
                </div>
              </div>

              {/* QRIS */}
              {paymentMethod === "qris" && (
                <NbCard
                  variant="white"
                  className="p-5 border-4 border-black text-center"
                >
                  <h4 className="font-black uppercase mb-3">Scan QRIS</h4>

                  <img
                    src="/qris.png"
                    alt="QRIS"
                    className="w-56 mx-auto border-4 border-black"
                  />

                  <p className="text-xs font-bold mt-3">
                    Scan QRIS setelah admin mengkonfirmasi pesanan.
                  </p>
                </NbCard>
              )}

              {/* BANK */}
              {paymentMethod === "transfer" && (
                <div className="flex flex-col gap-4">
                  {[
                    {
                      code: "blubca",
                      name: "BLU BCA (A.N Edita Salsabila)",
                      number: "0062 3009 8646",
                      color: "blue",
                    },
                    {
                      code: "bni",
                      name: "Seabank (A.N Fara Firginia)",
                      number: "901114533859",
                      color: "orange",
                    },
                    {
                      code: "permata",
                      name: "Permata Bank (A.N Edita Salsabila)",
                      number: "9933116295",
                      color: "red",
                    },
                    {
                      code: "bca",
                      name: "BCA (A.N Fara Firginia)",
                      number: "7475076729",
                      color: "yellow",
                    },
                  ].map((bank) => (
                    <div
                      key={bank.code}
                      onClick={() => setSelectedBank(bank.code)}
                      className={`border-4 border-black p-2 cursor-pointer ${
                        selectedBank === bank.code
                          ? "bg-green-light shadow-none translate-x-[2px] translate-y-[2px]"
                          : "bg-white shadow-nb-sm"
                      }`}
                    >
                      <h4 className="font-black uppercase">{bank.name}</h4>

                      <div className="flex items-center justify-between mt-2 gap-2">
                        <p className="text-sm font-bold">{bank.number}</p>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyBank(
                              bank.code,
                              bank.number.replace(/\s/g, ""),
                            );
                          }}
                          className="flex items-center gap-1 border-2 border-black px-2 py-1 bg-white hover:bg-gray-100 text-xs font-black"
                        >
                          {copiedBank === bank.code ? (
                            <>
                              <Check className="w-3 h-3" />
                              Tersalin
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Salin
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {errors.pembayaran && (
                <p className="text-pink font-black text-[10px] mt-1 uppercase">
                  {errors.pembayaran.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Real-time Summary Card */}
        <NbCard
          variant="green"
          className="p-6 border-4 border-black space-y-3 mt-8"
        >
          <h4 className="font-black text-xl uppercase tracking-wider border-b-2 border-black pb-2 text-black">
            📊 RINGKASAN PEMBAYARAN REALTIME
          </h4>
          <div className="space-y-2 font-bold text-black text-sm md:text-base">
            <div className="flex justify-between">
              <span>Jenis Pembayaran</span>
              <span>{paymentMethod.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>
                Subtotal ({itemFields.length} produk,{" "}
                {(watchItems || []).reduce(
                  (s, i) => s + (i?.jumlah || 0),
                  0,
                )}{" "}
                pcs)
              </span>
              <span>{formatIDR(totalSubtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span>Total Fee Jastip ({itemFields.length} item)</span>
              <span>{formatIDR(totalFeeJastip)}</span>
            </div>
          </div>
        </NbCard>

        {/* Form Submit Footer */}
        <div className="border-t-4 border-black pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left bg-white border-4 border-black px-4 py-2 shadow-nb-sm">
            <span className="text-xs font-black uppercase text-black/60 block">
              Estimasi Jastip
            </span>
            <span className="text-2xl font-black text-black">
              {formatIDR(grandTotal)}
            </span>
          </div>

          <NbButton
            type="submit"
            variant="pink"
            className="w-full sm:w-auto text-base"
          >
            Preview & Kirim Request
            <ArrowRight className="w-5 h-5" />
          </NbButton>
        </div>
      </form>
      <NbCard
        variant="white"
        className="p-5 mt-3 border-4 border-black space-y-4"
      >
        <div>
          <h4 className="font-black text-lg uppercase">
            🚚 Pengiriman Barang
          </h4>
          <p className="text-sm font-bold mt-2 text-black/70">
            Pilih metode pengiriman setelah proses jastip selesai.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Shopee Checkout */}
          <button
            type="button"
            onClick={() => setShippingMethod("shopee")}
            className={`border-4 border-black p-4 text-left cursor-pointer transition-all ${
              shippingMethod === "shopee"
                ? "bg-orange-300 shadow-none translate-x-[2px] translate-y-[2px]"
                : "bg-white shadow-nb-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-nb"
            }`}
          >
            <h4 className="font-black text-sm uppercase">🛒 Checkout via Shopee</h4>
            <p className="text-xs font-bold mt-1 text-black/70">
              + Packaging rapih
            </p>
          </button>

          {/* COD */}
          <button
            type="button"
            onClick={() => setShippingMethod("cod")}
            className={`border-4 border-black p-4 text-left cursor-pointer transition-all ${
              shippingMethod === "cod"
                ? "bg-green-light shadow-none translate-x-[2px] translate-y-[2px]"
                : "bg-white shadow-nb-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-nb"
            }`}
          >
            <h4 className="font-black text-sm uppercase">💵 Cash on Delivery</h4>
            <p className="text-xs font-bold mt-1 text-black/70">
              Konfirmasi via WA
            </p>
          </button>

          {/* Gosend/Grab */}
          <button
            type="button"
            onClick={() => setShippingMethod("gosend")}
            className={`border-4 border-black p-4 text-left cursor-pointer transition-all ${
              shippingMethod === "gosend"
                ? "bg-pink-light shadow-none translate-x-[2px] translate-y-[2px]"
                : "bg-white shadow-nb-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-nb"
            }`}
          >
            <h4 className="font-black text-sm uppercase">⚡ Gosend / Grab Instant</h4>
            <p className="text-xs font-bold mt-1 text-black/70">
              Konfirmasi via WA
            </p>
          </button>
        </div>

        {/* Shopee CTA */}
        {shippingMethod === "shopee" && (
          <>
             <p className="text-xs font-bold text-black/70">
            ℹ️ Pengiriman Shopee dilakukan H+2 setelah barang dibeli.
          </p>
          <button
            type="button"
            onClick={() =>
              window.open(
                "https://shopee.co.id/jastip-by-nitipcatip.id-i.268110076.57161747094?extraParams=%7B%22display_model_id%22%3A446024607810%2C%22model_selection_logic%22%3A2%7D",
                "_blank",
                "noopener,noreferrer",
              )
            }
            className="w-full border-4 border-black bg-orange-300 px-4 py-3 font-black uppercase shadow-nb-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-nb transition-all"
          >
            Bayar Ongkir via Shopee →
          </button>
          </>
        )}

        {/* COD / Gosend CTA */}
        {(shippingMethod === "cod" || shippingMethod === "gosend") && (
          <button
            type="button"
            onClick={() =>
              window.open(
                `https://wa.me/${WA_ADMIN_NUMBER.replace(/\D/g, "")}?text=${encodeURIComponent(
                  `Halo Admin, saya mau konfirmasi pengiriman via ${shippingMethod === "cod" ? "Cash on Delivery" : "Gosend/Grab Instant"}. Mohon infonya ya!`,
                )}`,
                "_blank",
                "noopener,noreferrer",
              )
            }
            className="w-full border-4 border-black bg-green px-4 py-3 font-black uppercase shadow-nb-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-nb transition-all flex items-center justify-center gap-2"
          >
            Konfirmasi via WhatsApp Admin →
          </button>
        )}

        <div className="border-t-2 border-black pt-3">
          <p className="text-xs font-bold text-black/70">
            ⚠️ Setelah pembayaran ongkir selesai, simpan bukti pembayaran dan
            lanjutkan proses konfirmasi kepada admin.
          </p>
        </div>
      </NbCard>

      {/* Render Modals */}
      {submittedData && (
        <OrderPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onConfirm={handleConfirmSubmit}
          orderData={submittedData}
          isLoading={isSubmitting}
          feeJastip={totalFeeJastip}
          flatOngkir={totalDelivery}
          selectedBank={selectedBank}
        />
      )}

      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        orderData={submittedData}
        feeJastip={totalFeeJastip}
        flatOngkir={totalDelivery}
      />
    </NbCard>
  );
}

/* ─── Product Item Card (repeatable per product) ─────────────────────── */

interface ProductItemCardProps {
  index: number;
  register: any;
  watch: any;
  setValue: any;
  errors: any;
  feeSettings: FeeSettings;
  formatIDR: (v: number) => string;
  filePreview?: string;
  fileName?: string;
  dragActive: boolean;
  fileInputRef: (el: HTMLInputElement | null) => void;
  onFileChange: (file: File) => void;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onRemoveFile: () => void;
  onRemoveItem: () => void;
  canRemove: boolean;
}

function ProductItemCard({
  index,
  register,
  watch,
  setValue,
  errors,
  feeSettings,
  formatIDR,
  filePreview,
  fileName,
  dragActive,
  fileInputRef,
  onFileChange,
  onDrag,
  onDrop,
  onRemoveFile,
  onRemoveItem,
  canRemove,
}: ProductItemCardProps) {
  const watchSizeOrder = watch(`items.${index}.sizeOrder`, "small");
  const itemError = errors?.items?.[index];

  return (
    <NbCard
      variant="white"
      className="p-5 border-4 border-black shadow-nb-sm space-y-4 relative"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <span className="bg-pink border-2 border-black px-2 py-1 font-black text-xs uppercase">
          PRODUK #{index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemoveItem}
            className="flex items-center gap-1 border-2 border-black bg-white hover:bg-pink-light px-2 py-1 text-xs font-black transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Hapus
          </button>
        )}
      </div>

      {/* Nama Produk */}
      <NbInput
        label="Nama Barang"
        requiredMark
        {...register(`items.${index}.namaBarang`)}
        placeholder="Contoh: Gentle Woman Canvas Tote Bag"
        error={itemError?.namaBarang?.message}
      />

      {/* Link Barang */}
      <NbInput
        label="Link Produk"
        requiredMark
        {...register(`items.${index}.linkProduk`)}
        placeholder="https://www.gentlewomanonline.com/..."
        error={itemError?.linkProduk?.message}
      />

      {/* Varian & Warna */}
      <div className="grid grid-cols-2 gap-3">
        <NbInput
          label="Ukuran / Varian"
          {...register(`items.${index}.ukuranVarian`)}
          placeholder="S, M, L, dll"
          error={itemError?.ukuranVarian?.message}
        />
        <NbInput
          label="Warna"
          {...register(`items.${index}.warna`)}
          placeholder="Hitam, Putih, dll"
          error={itemError?.warna?.message}
        />
      </div>

      {/* Size Order System Selection */}
      <div className="space-y-2">
        <label className="block text-black font-black text-sm md:text-base uppercase tracking-wider">
          Size Order <span className="text-pink">★</span>
          <span className="text-xs font-bold text-black/60 block mt-0.5 normal-case">
            *Konfirmasi fee melalui chat admin
          </span>
        </label>

        {/* Small & Medium row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Small */}
          <div
            onClick={() => setValue(`items.${index}.sizeOrder`, "small")}
            className={`border-4 border-black p-3 cursor-pointer transition-all duration-100 flex flex-col justify-between ${
              watchSizeOrder === "small"
                ? "bg-pink shadow-none translate-x-[2px] translate-y-[2px]"
                : "bg-white shadow-nb-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-nb"
            }`}
          >
            <div>
              <h4 className="font-black text-sm uppercase">Small</h4>
              <p className="text-[10px] font-bold mt-1 text-black/80">
                Accessories, Makeup
              </p>
            </div>
            <span className="font-black text-xs mt-2 block border-t-2 border-black pt-1">
              {formatIDR(feeSettings.small)}
            </span>
          </div>

          {/* Medium */}
          <div
            onClick={() => setValue(`items.${index}.sizeOrder`, "medium")}
            className={`border-4 border-black p-3 cursor-pointer transition-all duration-100 flex flex-col justify-between ${
              watchSizeOrder === "medium"
                ? "bg-green shadow-none translate-x-[2px] translate-y-[2px]"
                : "bg-white shadow-nb-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-nb"
            }`}
          >
            <div>
              <h4 className="font-black text-sm uppercase">Medium</h4>
              <p className="text-[10px] font-bold mt-1 text-black/80">
                Clothes, Small Bags
              </p>
            </div>
            <span className="font-black text-xs mt-2 block border-t-2 border-black pt-1">
              {formatIDR(feeSettings.medium)}
            </span>
          </div>
        </div>

        {/* Large sub-tiers row */}
        <div>
          <span className="text-xs font-black uppercase text-black/60 block mb-2">Large (pilih tier):</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "large_10", label: "Large 10K", desc: "Shoes, Bags", fee: feeSettings.large_10, color: "bg-amber-200" },
              { key: "large_15", label: "Large 15K", desc: "Bulky Items", fee: feeSettings.large_15, color: "bg-amber-300" },
              { key: "large_20", label: "Large 20K", desc: "Extra Bulky", fee: feeSettings.large_20, color: "bg-amber-400" },
            ].map((tier) => (
              <div
                key={tier.key}
                onClick={() => setValue(`items.${index}.sizeOrder`, tier.key)}
                className={`border-4 border-black p-2 cursor-pointer transition-all duration-100 flex flex-col justify-between ${
                  watchSizeOrder === tier.key
                    ? `${tier.color} shadow-none translate-x-[2px] translate-y-[2px]`
                    : "bg-white shadow-nb-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-nb"
                }`}
              >
                <div>
                  <h4 className="font-black text-xs uppercase">{tier.label}</h4>
                  <p className="text-[9px] font-bold mt-0.5 text-black/80">{tier.desc}</p>
                </div>
                <span className="font-black text-[11px] mt-1 block border-t-2 border-black pt-1">
                  {formatIDR(tier.fee)}
                </span>
              </div>
            ))}
          </div>
        </div>
        {itemError?.sizeOrder && (
          <p className="text-pink font-black text-xs uppercase mt-1">
            ⚠️ {itemError.sizeOrder.message}
          </p>
        )}
      </div>

      {/* Qty & Harga */}
      <NbCard
        variant="green-light"
        className="p-4 border-4 border-black shadow-nb-sm space-y-3"
      >
        <span className="text-xs font-black text-black uppercase tracking-wider block mb-1">
          💸 KALKULASI HARGA
        </span>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <label className="block text-black font-black text-xs uppercase mb-1">
              Qty
            </label>
            <input
              type="number"
              min="1"
              {...register(`items.${index}.jumlah`, { valueAsNumber: true })}
              className="w-full p-2 bg-white border-2 border-black text-center font-black text-black text-sm focus:outline-none"
            />
            {itemError?.jumlah && (
              <p className="text-pink font-black text-[10px] mt-1 uppercase">
                {itemError.jumlah.message}
              </p>
            )}
          </div>

          <div className="col-span-2">
            <label className="block text-black font-black text-xs uppercase mb-1">
              Harga Satuan (Rp)
            </label>
            <input
              type="text"
              {...register(`items.${index}.hargaBarang`, {
                setValueAs: (v: string) => Number((v || "").replace(/\D/g, "") || 0),
              })}
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                const value = target.value.replace(/\D/g, "");
                target.value = Number(value || 0).toLocaleString("id-ID");
              }}
              className="w-full p-2 bg-white border-2 border-black font-black text-black text-sm focus:outline-none"
            />
            {itemError?.hargaBarang && (
              <p className="text-pink font-black text-[10px] mt-1 uppercase">
                {itemError.hargaBarang.message}
              </p>
            )}
          </div>
        </div>
      </NbCard>

      {/* File upload drag and drop */}
      <div className="space-y-2">
        <label className="block text-black font-black text-xs uppercase tracking-wider">
          Foto Referensi (Opsional, Max 5MB)
        </label>

        {filePreview ? (
          <div className="relative flex items-center gap-4 p-3 border-4 border-black bg-green-light">
            <img
              src={filePreview}
              alt="Upload Preview"
              className="w-14 h-14 object-cover border-2 border-black"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-black truncate">
                {fileName}
              </p>
              <p className="text-[10px] font-bold text-black/70">
                Foto terlampir
              </p>
            </div>
            <button
              type="button"
              onClick={onRemoveFile}
              className="p-2 border-2 border-black bg-pink hover:bg-pink-light transition-colors"
            >
              <Trash2 className="w-4 h-4 text-black" />
            </button>
          </div>
        ) : (
          <div
            onDragEnter={onDrag}
            onDragOver={onDrag}
            onDragLeave={onDrag}
            onDrop={onDrop}
            onClick={() => {
              const el = document.getElementById(`file-input-${index}`);
              el?.click();
            }}
            className={`border-4 border-dashed border-black p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
              dragActive
                ? "bg-pink-light/30"
                : "bg-white hover:bg-pink-light/10"
            }`}
          >
            <input
              type="file"
              id={`file-input-${index}`}
              ref={fileInputRef}
              onChange={(e) =>
                e.target.files?.[0] && onFileChange(e.target.files[0])
              }
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
            />
            <div className="w-10 h-10 bg-pink border-2 border-black rounded-none flex items-center justify-center mb-2 shadow-nb-sm">
              <UploadCloud className="w-5 h-5 text-black" />
            </div>
            <p className="text-xs font-black uppercase">
              Klik atau drop file di sini
            </p>
            <p className="text-[10px] font-bold text-black/60 mt-1">
              JPG, PNG, atau PDF - Max 5MB
            </p>
          </div>
        )}
      </div>
    </NbCard>
  );
}
