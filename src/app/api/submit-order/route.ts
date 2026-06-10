import { NextRequest, NextResponse } from "next/server";
import { orderFormSchema } from "@/types";
import { DEFAULT_FEE_SETTINGS } from "@/config/jastip";
import fs from "fs";
import path from "path";

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
      console.error("GOOGLE_SCRIPT_URL is not defined in environment variables");
      return NextResponse.json(
        {
          success: false,
          error: "Konfigurasi server bermasalah (Google Apps Script URL tidak diset).",
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
      console.error("Failed to read dynamic fee settings, using defaults:", err);
    }

    const feeJastip = feeSettings[orderData.sizeOrder] || 10000;
    const flatOngkir = body.estimasiOngkir || 20000;
    const totalPembayaran = (orderData.hargaBarang * orderData.jumlah) + feeJastip + flatOngkir;

    // 3. Auto-generate Order ID: NC-YYYYMMDD-NNN
    const datePrefix = getFormattedDate();
    let sequenceNumber = "001";

    try {
      // Fetch orders to determine sequence number
      const ordersRes = await fetch(`${scriptUrl}?action=getOrders`, {
        next: { revalidate: 0 } // Disable fetch caching
      });
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        if (data.success && Array.isArray(data.orders)) {
          // Count orders with today's date prefix
          const todayOrdersCount = data.orders.filter((order: any) => 
            order.id && order.id.startsWith(`NC-${datePrefix}-`)
          ).length;

          sequenceNumber = String(todayOrdersCount + 1).padStart(3, "0");
        }
      }
    } catch (err) {
      console.error("Failed to fetch orders for ID generation, generating random sequence:", err);
      // Fallback: Random sequence number between 100 and 999 to prevent collision
      sequenceNumber = String(Math.floor(Math.random() * 900) + 100);
    }

    const orderId = `NC-${datePrefix}-${sequenceNumber}`;

    // WIB Timestamp string
    const now = new Date();
    const wibTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const timestampStr = wibTime.toISOString().replace("T", " ").substring(0, 19);

    // 4. Prepare payload for Google Sheet
    const payload = {
      orderId,
      timestamp: timestampStr,
      namaPemesan: orderData.namaPemesan,
      whatsapp: orderData.whatsapp,
      email: orderData.email,
      namaBarang: orderData.namaBarang,
      linkProduk: orderData.linkProduk || "",
      ukuranVarian: orderData.ukuranVarian || "",
      warna: orderData.warna || "",
      jumlah: orderData.jumlah,
      hargaBarang: orderData.hargaBarang,
      sizeOrder: orderData.sizeOrder,
      feeJastip,
      estimasiOngkir: flatOngkir,
      totalPembayaran,
      kotaTujuan: orderData.kotaTujuan,
      kodePos: orderData.kodePos,
      catatan: orderData.catatan || "",
      lampiranUrl: orderData.lampiranUrl || "",
      lampiranName: orderData.lampiranName || "",
    };

    // 5. Send POST request to Google Apps Script
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
      console.error("Google Apps Script response error:", response.status, text);
      throw new Error(`Google Apps Script returned status ${response.status}`);
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: "Pesanan berhasil dikirim ke Google Sheet.",
      orderId,
      data: result,
    });
  } catch (error: any) {
    console.error("Error in submit-order API Route:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan internal saat mengirim pesanan. Silakan coba lagi.",
        details: error?.message || error,
      },
      { status: 500 },
    );
  }
}
