import { NextRequest, NextResponse } from "next/server";
import { orderFormSchema } from "@/types";
import { DEFAULT_FEE_SETTINGS } from "@/config/jastip";
import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabase";

// Helper to format date as YYYYMMDD
function getFormattedDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Server-side validation using the Zod schema
    const validationResult = orderFormSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validasi data gagal",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
    if (!scriptUrl) {
      console.error(
        "GOOGLE_SCRIPT_URL is not defined in environment variables",
      );
      return NextResponse.json(
        {
          success: false,
          error:
            "Konfigurasi server bermasalah (Google Apps Script URL tidak diset).",
        },
        { status: 500 },
      );
    }

    const orderData = validationResult.data;

    // 2. Fetch current Dynamic Fees from config file
    let feeSettings = DEFAULT_FEE_SETTINGS;
    try {
      const filePath = path.join(process.cwd(), "src/config/fee-settings.json");
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        feeSettings = JSON.parse(fileContent);
      }
    } catch (err) {
      console.error(
        "Failed to read dynamic fee settings, using defaults:",
        err,
      );
    }

    const flatOngkir = body.estimasiOngkir || 20000;

    // 3. Auto-generate Order ID: NC-YYYYMMDD-NNN
    const datePrefix = getFormattedDate();
    let sequenceNumber = "001";

    try {
      // Fetch orders to determine sequence number
      const ordersRes = await fetch(`${scriptUrl}?action=getOrders`, {
        next: { revalidate: 0 }, // Disable fetch caching
      });
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        if (data.success && Array.isArray(data.orders)) {
          // Count orders with today's date prefix
          const todayOrdersCount = data.orders.filter(
            (order: any) =>
              order.id && order.id.startsWith(`NC-${datePrefix}-`),
          ).length;

          sequenceNumber = String(todayOrdersCount + 1).padStart(3, "0");
        }
      }
    } catch (err) {
      console.error(
        "Failed to fetch orders for ID generation, generating random sequence:",
        err,
      );
      // Fallback: Random sequence number between 100 and 999 to prevent collision
      sequenceNumber = String(Math.floor(Math.random() * 900) + 100);
    }

    const orderId = `NC-${datePrefix}-${sequenceNumber}`;

    // WIB Timestamp string
    const now = new Date();
    const wibTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const timestampStr = wibTime
      .toISOString()
      .replace("T", " ")
      .substring(0, 19);

    // 4. Send one row per item to Google Sheets
    let totalAllItems = 0;

    for (let i = 0; i < orderData.items.length; i++) {
      const item = orderData.items[i];
      const feeJastip = feeSettings[item.sizeOrder] || 10000;
      const itemSubtotal = item.hargaBarang * item.jumlah;
      // Distribute ongkir proportionally across items
      const itemOngkir =
        orderData.items.length > 0
          ? Math.round(flatOngkir / orderData.items.length)
          : flatOngkir;
      const totalPembayaran = itemSubtotal + feeJastip;
      totalAllItems += totalPembayaran;

      const itemOrderId =
        orderData.items.length > 1
          ? `${orderId}-${String(i + 1).padStart(2, "0")}`
          : orderId;

      const payload = {
        orderId: itemOrderId,
        timestamp: timestampStr,
        namaPemesan: orderData.namaPemesan,
        whatsapp: orderData.whatsapp,
        email: orderData.email,
        namaBarang: item.namaBarang,
        linkProduk: item.linkProduk || "",
        ukuranVarian: item.ukuranVarian || "",
        warna: item.warna || "",
        jumlah: item.jumlah,
        hargaBarang: item.hargaBarang,
        sizeOrder: item.sizeOrder,
        feeJastip,
        estimasiOngkir: itemOngkir,
        totalPembayaran,
        kotaTujuan: orderData.kotaTujuan,
        kodePos: orderData.kodePos,
        catatan: orderData.catatan || "",
        lampiranUrl: item.lampiranUrl || "",
        lampiranName: item.lampiranName || "",
        pembayaran: orderData.pembayaran || "",
        pengiriman: "",
      };

      // Send POST request to Google Apps Script
      const response = await fetch(scriptUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        redirect: "follow",
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(
          "Google Apps Script response error:",
          response.status,
          text,
        );
        throw new Error(
          `Google Apps Script returned status ${response.status}`,
        );
      }
    }

    // ── Save to Supabase (non-blocking, alongside Google Sheets) ──
    if (supabase) {
      await saveToSupabase(
        orderData,
        orderId,
        feeSettings,
        flatOngkir,
        body.paymentMethod || "qris",
      );
    }

    return NextResponse.json({
      success: true,
      message: "Pesanan berhasil dikirim ke Google Sheet.",
      orderId,
      totalItems: orderData.items.length,
      totalPembayaran: totalAllItems,
    });
  } catch (error: any) {
    console.error("Error in submit-order API Route:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          "Terjadi kesalahan internal saat mengirim pesanan. Silakan coba lagi.",
        details: error?.message || error,
      },
      { status: 500 },
    );
  }
}

// ─── Save to Supabase (called after Google Sheets success) ─────────────
async function saveToSupabase(
  orderData: any,
  orderId: string,
  feeSettings: any,
  flatOngkir: number,
  paymentMethod: string,
) {
  try {
    // 1. Upsert customer by whatsapp
    const { data: customer, error: custErr } = await supabase!
      .from("customers")
      .upsert(
        {
          nama_pemesan: orderData.namaPemesan,
          whatsapp: orderData.whatsapp,
          email: orderData.email,
          kota_tujuan: orderData.kotaTujuan,
          kode_pos: orderData.kodePos,
        },
        { onConflict: "whatsapp" },
      )
      .select("id")
      .single();

    if (custErr) console.error("Supabase customer upsert error:", custErr);

    const customerId = customer?.id || null;

    // 2. Calculate totals
    const totalHargaBarang = orderData.items.reduce(
      (sum: number, item: any) => sum + item.hargaBarang * item.jumlah,
      0,
    );
    const totalFeeJastip = orderData.items.reduce(
      (sum: number, item: any) => sum + (feeSettings[item.sizeOrder] || 3000),
      0,
    );
    const totalPembayaran = totalHargaBarang + totalFeeJastip;

    // 3. Insert order
    const { error: orderErr } = await supabase!.from("orders").insert({
      id: orderId,
      customer_id: customerId,
      nama_pemesan: orderData.namaPemesan,
      whatsapp: orderData.whatsapp,
      email: orderData.email,
      kota_tujuan: orderData.kotaTujuan,
      kode_pos: orderData.kodePos,
      total_harga_barang: totalHargaBarang,
      total_fee_jastip: totalFeeJastip,
      total_pembayaran: totalPembayaran,
      ongkir: flatOngkir,
      payment_method: paymentMethod,
      status: "pending",
      shipping_status: "pending",
      catatan: orderData.catatan || null,
    });

    if (orderErr) console.error("Supabase order insert error:", orderErr);

    // 4. Insert order items
    const orderItems = orderData.items.map((item: any) => ({
      order_id: orderId,
      nama_barang: item.namaBarang,
      link_produk: item.linkProduk || null,
      ukuran_varian: item.ukuranVarian || null,
      warna: item.warna || null,
      jumlah: item.jumlah,
      harga_barang: item.hargaBarang,
      size_order: item.sizeOrder,
      fee_jastip: feeSettings[item.sizeOrder] || 3000,
      subtotal: item.hargaBarang * item.jumlah,
      lampiran_url: item.lampiranUrl || null,
      lampiran_name: item.lampiranName || null,
    }));

    const { error: itemsErr } = await supabase!
      .from("order_items")
      .insert(orderItems);

    if (itemsErr) console.error("Supabase order_items insert error:", itemsErr);
  } catch (err) {
    console.error("saveToSupabase failed (non-blocking):", err);
    // Non-blocking: don't throw, Google Sheets is the primary DB
  }
}
