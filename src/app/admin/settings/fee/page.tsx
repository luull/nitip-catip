"use client";

import React, { useState, useEffect } from "react";
import NbCard from "@/components/ui/NbCard";
import NbButton from "@/components/ui/NbButton";
import NbInput from "@/components/ui/NbInput";
import NbBadge from "@/components/ui/NbBadge";

export default function FeeSettingsPage() {
  const [smallFee, setSmallFee] = useState(10000);
  const [mediumFee, setMediumFee] = useState(20000);
  const [largeFee, setLargeFee] = useState(35000);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadFees() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/admin/fee-settings");
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setSmallFee(data.small || 10000);
            setMediumFee(data.medium || 20000);
            setLargeFee(data.large || 35000);
          }
        }
      } catch (err) {
        console.error("Failed to load fees:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadFees();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/fee-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          small: smallFee,
          medium: mediumFee,
          large: largeFee
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSuccessMsg("Tarif fee jastip berhasil diperbarui!");
        } else {
          setErrorMsg(data.error || "Gagal menyimpan perubahan.");
        }
      } else {
        throw new Error("HTTP error saving fees");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Error: Gagal menyimpan setting fee.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-black font-sans">
        <div className="w-16 h-16 border-8 border-black border-t-pink animate-spin mb-4" />
        <p className="font-black uppercase tracking-wider text-sm">LOAD SETTING TARIF...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto font-sans text-black space-y-6">
      
      {/* Header section */}
      <div className="border-b-4 border-black pb-6">
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-wider">
          Setting Fee Jastip ⚙️
        </h1>
        <p className="font-bold text-black/60 mt-1">
          Atur nominal keuntungan fee jasa titip untuk setiap kategori ukuran barang.
        </p>
      </div>

      {successMsg && (
        <NbCard variant="green-light" className="p-4 border-4 border-black font-black uppercase text-sm animate-nb-shake">
          🎉 SUCCESS: {successMsg}
        </NbCard>
      )}

      {errorMsg && (
        <NbCard variant="pink-light" className="p-4 border-4 border-black font-black uppercase text-sm animate-nb-shake">
          ⚠️ ERROR: {errorMsg}
        </NbCard>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Small Fee Settings Card */}
          <NbCard variant="white" className="p-5 border-4 border-black shadow-nb flex flex-col justify-between space-y-4">
            <div>
              <NbBadge variant="pink" className="mb-2">SMALL SIZE</NbBadge>
              <p className="text-xs font-bold text-black/70 mt-1">
                Accessories, Makeup, Small Items
              </p>
            </div>
            
            <NbInput
              label="Tarif Jastip (Rp)"
              type="number"
              min="0"
              value={smallFee}
              onChange={(e) => setSmallFee(Number(e.target.value))}
            />
          </NbCard>

          {/* Medium Fee Settings Card */}
          <NbCard variant="white" className="p-5 border-4 border-black shadow-nb flex flex-col justify-between space-y-4">
            <div>
              <NbBadge variant="green" className="mb-2">MEDIUM SIZE</NbBadge>
              <p className="text-xs font-bold text-black/70 mt-1">
                Clothes, Small Bags
              </p>
            </div>
            
            <NbInput
              label="Tarif Jastip (Rp)"
              type="number"
              min="0"
              value={mediumFee}
              onChange={(e) => setMediumFee(Number(e.target.value))}
            />
          </NbCard>

          {/* Large Fee Settings Card */}
          <NbCard variant="white" className="p-5 border-4 border-black shadow-nb flex flex-col justify-between space-y-4">
            <div>
              <NbBadge variant="yellow" className="mb-2">LARGE SIZE</NbBadge>
              <p className="text-xs font-bold text-black/70 mt-1">
                Shoes, Large Bags, Bulky Items
              </p>
            </div>
            
            <NbInput
              label="Tarif Jastip (Rp)"
              type="number"
              min="0"
              value={largeFee}
              onChange={(e) => setLargeFee(Number(e.target.value))}
            />
          </NbCard>
        </div>

        {/* Warning Notes */}
        <NbCard variant="green-light" className="p-5 border-4 border-black shadow-nb-sm font-bold text-sm leading-relaxed">
          💡 <strong>INFO PERUBAHAN INSTAN:</strong> Perubahan nominal tarif fee jastip di atas akan langsung disimpan secara persisten di file server dan langsung digunakan pada form customer secara realtime tanpa perlu merestart server.
        </NbCard>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <NbButton
            type="submit"
            variant="pink"
            disabled={isSaving}
            className="w-full sm:w-auto shadow-nb font-black"
          >
            {isSaving ? "Menyimpan..." : "Simpan Tarif Baru 💾"}
          </NbButton>
        </div>

      </form>

    </div>
  );
}
