import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, User, Link, UploadCloud, Trash2, ArrowRight } from "lucide-react";
import { orderFormSchema, OrderFormData, CatalogItem, OpenTrip, FeeSettings } from "@/types";
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

export default function OrderForm({ selectedItem, selectedTrip, onClearSelection }: OrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [submittedData, setSubmittedData] = useState<OrderFormData | null>(null);

  // Dynamic fee settings state
  const [feeSettings, setFeeSettings] = useState<FeeSettings>(DEFAULT_FEE_SETTINGS);

  // Flat Shipping Fee
  const FLAT_ONGKIR = 20000;

  // File states
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [filePreview, setFilePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      namaPemesan: "",
      whatsapp: "",
      email: "",
      kotaTujuan: "",
      kodePos: "",
      namaBarang: "",
      linkProduk: "",
      ukuranVarian: "",
      warna: "",
      jumlah: 1,
      hargaBarang: 0,
      sizeOrder: "small",
      catatan: "",
      lampiranUrl: "",
      lampiranName: "",
    },
  });

  // Fetch current fee settings from admin endpoint on mount
  useEffect(() => {
    async function fetchFees() {
      try {
        const res = await fetch("/api/admin/fee-settings");
        if (res.ok) {
          const data = await res.json();
          if (data && data.small && data.medium && data.large) {
            setFeeSettings(data);
          }
        }
      } catch (err) {
        console.error("Failed to load dynamic fees, using defaults:", err);
      }
    }
    fetchFees();
  }, []);

  // Watch fields for calculations
  const watchJumlah = watch("jumlah", 1);
  const watchHarga = watch("hargaBarang", 0);
  const watchSizeOrder = watch("sizeOrder", "small");

  const feeJastip = feeSettings[watchSizeOrder] || 10000;
  const subtotal = (watchHarga || 0) * (watchJumlah || 1);
  const total = subtotal + feeJastip + FLAT_ONGKIR;

  // Sync selected catalog item / trip into form fields
  useEffect(() => {
    if (selectedItem) {
      setValue("namaBarang", selectedItem.name);
      setValue("hargaBarang", selectedItem.price);
      if (selectedItem.defaultLink) {
        setValue("linkProduk", selectedItem.defaultLink);
      }
    }
  }, [selectedItem, setValue]);

  useEffect(() => {
    if (selectedTrip) {
      setValue("catatan", `Jastip PO Trip: ${selectedTrip.destination}`);
    }
  }, [selectedTrip, setValue]);

  // Handle File upload
  const handleFileChange = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file tidak boleh melebihi 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFilePreview(base64String);
      setFileName(file.name);
      setValue("lampiranUrl", base64String);
      setValue("lampiranName", file.name);
    };
    reader.readAsDataURL(file);
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setFilePreview("");
    setFileName("");
    setValue("lampiranUrl", "");
    setValue("lampiranName", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
          estimasiOngkir: FLAT_ONGKIR, // Add derived shipping fee to submission
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal mengirim pesanan");
      }

      setIsPreviewOpen(false);
      setIsSuccessOpen(true);
      
      reset();
      removeFile();
      onClearSelection();
    } catch (error: any) {
      alert(`Error: ${error.message || "Terjadi kesalahan saat mengirim pesanan."}`);
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
          Lengkapi data belanja Anda. Tim kami akan memverifikasi order Anda secepatnya!
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmitValid)} className="space-y-8">
        
        {/* Main Dual-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* LEFT COLUMN: INFORMASI PRODUK */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b-4 border-black pb-3 bg-pink-light/40 px-3 py-1 border border-black shadow-nb-sm">
              <Box className="w-5 h-5 text-black stroke-[2.5]" />
              <h3 className="font-black text-black tracking-widest text-sm md:text-base uppercase">
                I. DETAIL PRODUK BELANJAAN
              </h3>
            </div>

            {/* Nama Produk */}
            <NbInput
              label="Nama Barang"
              requiredMark
              {...register("namaBarang")}
              placeholder="Contoh: Gentle Woman Canvas Tote Bag"
              error={errors.namaBarang?.message}
            />

            {/* Link Barang */}
            <NbInput
              label="Link Produk (Opsional)"
              {...register("linkProduk")}
              placeholder="https://www.gentlewomanonline.com/..."
              error={errors.linkProduk?.message}
            />

            {/* Varian & Warna */}
            <div className="grid grid-cols-2 gap-4">
              <NbInput
                label="Ukuran/Varian"
                {...register("ukuranVarian")}
                placeholder="M / 39 / L"
              />
              <NbInput
                label="Warna"
                {...register("warna")}
                placeholder="Putih / Hitam"
              />
            </div>

            {/* Size Order System Selection */}
            <div className="space-y-2">
              <label className="block text-black font-black text-sm md:text-base uppercase tracking-wider">
                Size Order <span className="text-pink">💖</span>
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Small */}
                <div
                  onClick={() => setValue("sizeOrder", "small")}
                  className={`border-4 border-black p-4 cursor-pointer transition-all duration-100 flex flex-col justify-between ${
                    watchSizeOrder === "small"
                      ? "bg-pink shadow-none translate-x-[2px] translate-y-[2px]"
                      : "bg-white shadow-nb-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-nb"
                  }`}
                >
                  <div>
                    <h4 className="font-black text-base uppercase">Small</h4>
                    <p className="text-xs font-bold mt-1 text-black/80">
                      Accessories, Makeup, Small Items
                    </p>
                  </div>
                  <span className="font-black text-sm mt-3 block border-t-2 border-black pt-1">
                    {formatIDR(feeSettings.small)}
                  </span>
                </div>

                {/* Medium */}
                <div
                  onClick={() => setValue("sizeOrder", "medium")}
                  className={`border-4 border-black p-4 cursor-pointer transition-all duration-100 flex flex-col justify-between ${
                    watchSizeOrder === "medium"
                      ? "bg-green shadow-none translate-x-[2px] translate-y-[2px]"
                      : "bg-white shadow-nb-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-nb"
                  }`}
                >
                  <div>
                    <h4 className="font-black text-base uppercase">Medium</h4>
                    <p className="text-xs font-bold mt-1 text-black/80">
                      Clothes, Small Bags
                    </p>
                  </div>
                  <span className="font-black text-sm mt-3 block border-t-2 border-black pt-1">
                    {formatIDR(feeSettings.medium)}
                  </span>
                </div>

                {/* Large */}
                <div
                  onClick={() => setValue("sizeOrder", "large")}
                  className={`border-4 border-black p-4 cursor-pointer transition-all duration-100 flex flex-col justify-between ${
                    watchSizeOrder === "large"
                      ? "bg-amber-300 shadow-none translate-x-[2px] translate-y-[2px]"
                      : "bg-white shadow-nb-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-nb"
                  }`}
                >
                  <div>
                    <h4 className="font-black text-base uppercase">Large</h4>
                    <p className="text-xs font-bold mt-1 text-black/80">
                      Shoes, Large Bags, Bulky Items
                    </p>
                  </div>
                  <span className="font-black text-sm mt-3 block border-t-2 border-black pt-1">
                    {formatIDR(feeSettings.large)}
                  </span>
                </div>
              </div>
              {errors.sizeOrder && (
                <p className="text-pink font-black text-xs uppercase mt-1">
                  ⚠️ {errors.sizeOrder.message}
                </p>
              )}
            </div>

            {/* File upload drag and drop */}
            <div className="space-y-2">
              <label className="block text-black font-black text-sm md:text-base uppercase tracking-wider">
                Foto Referensi Produk (Opsional, Max 5MB)
              </label>

              {filePreview ? (
                <div className="relative flex items-center gap-4 p-4 border-4 border-black bg-green-light">
                  <img
                    src={filePreview}
                    alt="Upload Preview"
                    className="w-16 h-16 object-cover border-2 border-black"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-black truncate">{fileName}</p>
                    <p className="text-xs font-bold text-black/70">Foto terlampir</p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-2 border-2 border-black bg-pink hover:bg-pink-light transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-black" />
                  </button>
                </div>
              ) : (
                <div
                  onDragEnter={onDrag}
                  onDragOver={onDrag}
                  onDragLeave={onDrag}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-4 border-dashed border-black p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                    dragActive ? "bg-pink-light/30" : "bg-white hover:bg-pink-light/10"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                  />
                  <div className="w-12 h-12 bg-pink border-2 border-black rounded-none flex items-center justify-center mb-3 shadow-nb-sm">
                    <UploadCloud className="w-6 h-6 text-black" />
                  </div>
                  <p className="text-sm font-black uppercase">Klik atau drop file gambar di sini</p>
                  <p className="text-xs font-bold text-black/60 mt-1">JPG, PNG, atau WEBP - Max 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: INFORMASI PEMBELI */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b-4 border-black pb-3 bg-green-light/40 px-3 py-1 border border-black shadow-nb-sm">
              <User className="w-5 h-5 text-black stroke-[2.5]" />
              <h3 className="font-black text-black tracking-widest text-sm md:text-base uppercase">
                II. DETAIL PENGIRIMAN & DATA PEMESAN
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

            {/* Pricing Section: Jumlah & Harga Barang */}
            <NbCard variant="green-light" className="p-5 border-4 border-black shadow-nb-sm space-y-4">
              <span className="text-sm font-black text-black uppercase tracking-wider block mb-1">
                💸 KALKULASI HARGA BARANG
              </span>
              
              <div className="grid grid-cols-3 gap-3">
                {/* Jumlah */}
                <div className="col-span-1">
                  <label className="block text-black font-black text-xs uppercase mb-1">Qty</label>
                  <input
                    type="number"
                    min="1"
                    {...register("jumlah", { valueAsNumber: true })}
                    className="w-full p-2 bg-white border-2 border-black text-center font-black text-black text-sm focus:outline-none"
                  />
                  {errors.jumlah && (
                    <p className="text-pink font-black text-[10px] mt-1 uppercase">{errors.jumlah.message}</p>
                  )}
                </div>

                {/* Harga Barang */}
                <div className="col-span-2">
                  <label className="block text-black font-black text-xs uppercase mb-1">Harga Satuan (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    {...register("hargaBarang", { valueAsNumber: true })}
                    className="w-full p-2 bg-white border-2 border-black font-black text-black text-sm focus:outline-none"
                  />
                  {errors.hargaBarang && (
                    <p className="text-pink font-black text-[10px] mt-1 uppercase">{errors.hargaBarang.message}</p>
                  )}
                </div>
              </div>
            </NbCard>
          </div>
        </div>

        {/* Real-time Summary Card (Green Neo Brutalism Card) */}
        <NbCard variant="green" className="p-6 border-4 border-black space-y-3 mt-8">
          <h4 className="font-black text-xl uppercase tracking-wider border-b-2 border-black pb-2 text-black">
            📊 RINGKASAN PEMBAYARAN REALTIME
          </h4>
          <div className="space-y-2 font-bold text-black text-sm md:text-base">
            <div className="flex justify-between">
              <span>Subtotal Barang ({watchJumlah} pcs)</span>
              <span>{formatIDR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Fee Jastip (Admin Size: {watchSizeOrder})</span>
              <span>{formatIDR(feeJastip)}</span>
            </div>
            <div className="flex justify-between">
              <span>Ongkir JNE / Flat Local Shipping</span>
              <span>{formatIDR(FLAT_ONGKIR)}</span>
            </div>
            <div className="flex justify-between border-t-2 border-black pt-2 font-black text-lg md:text-xl text-black">
              <span>TOTAL ESTIMASI</span>
              <span>{formatIDR(total)}</span>
            </div>
          </div>
        </NbCard>

        {/* Form Submit Footer */}
        <div className="border-t-4 border-black pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left bg-white border-4 border-black px-4 py-2 shadow-nb-sm">
            <span className="text-xs font-black uppercase text-black/60 block">Estimasi Total Bayar</span>
            <span className="text-2xl font-black text-black">{formatIDR(total)}</span>
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

      {/* Render Modals */}
      {submittedData && (
        <OrderPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onConfirm={handleConfirmSubmit}
          orderData={submittedData}
          isLoading={isSubmitting}
          feeJastip={feeJastip}
          flatOngkir={FLAT_ONGKIR}
        />
      )}

      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        orderData={submittedData}
        feeJastip={feeJastip}
        flatOngkir={FLAT_ONGKIR}
      />
    </NbCard>
  );
}
