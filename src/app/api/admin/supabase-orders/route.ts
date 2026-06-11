import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET: Fetch all orders from Supabase with items
export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({
        success: false,
        source: "supabase",
        orders: [],
        error: "Supabase belum dikonfigurasi",
      });
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("Supabase admin orders error:", error);
      return NextResponse.json({
        success: false,
        source: "supabase",
        orders: [],
        error: error.message,
      });
    }

    // Transform to a format compatible with the existing admin UI
    const orders = (data || []).map((order: any) => ({
      id: order.id,
      timestamp: order.created_at,
      status: mapStatus(order.status),
      namaPemesan: order.nama_pemesan,
      whatsapp: order.whatsapp,
      email: order.email,
      kotaTujuan: order.kota_tujuan,
      kodePos: order.kode_pos,
      totalPembayaran: order.total_pembayaran,
      feeJastip: order.total_fee_jastip,
      estimasiOngkir: order.ongkir,
      paymentMethod: order.payment_method,
      shippingMethod: order.shipping_method || "",
      shippingStatus: order.shipping_status || "pending",
      catatan: order.catatan || "",
      // Flat fields for backward compat (use first item)
      namaBarang: order.order_items?.[0]?.nama_barang || "-",
      jumlah: order.order_items?.[0]?.jumlah || 0,
      sizeOrder: order.order_items?.[0]?.size_order || "",
      lampiranUrl: order.order_items?.[0]?.lampiran_url || "",
      // Nested items
      items: order.order_items || [],
    }));

    return NextResponse.json({
      success: true,
      source: "supabase",
      orders,
      total: orders.length,
    });
  } catch (err: any) {
    console.error("Admin Supabase orders error:", err);
    return NextResponse.json({
      success: false,
      source: "supabase",
      orders: [],
      error: err.message || "Internal error",
    });
  }
}

// POST: Update order status in Supabase
export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Supabase belum dikonfigurasi" },
        { status: 503 },
      );
    }

    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: "Order ID dan status wajib dikirim" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("orders")
      .update({
        status: mapStatusToDb(status),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error("Supabase status update error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Status berhasil diubah",
      order: data,
    });
  } catch (err: any) {
    console.error("Admin status update error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal error" },
      { status: 500 },
    );
  }
}

// Helpers
function mapStatus(dbStatus: string): string {
  const map: Record<string, string> = {
    pending: "Pending",
    waiting_payment: "Waiting Payment",
    purchased: "Purchased",
    shipped: "Shipped",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return map[dbStatus] || dbStatus;
}

function mapStatusToDb(uiStatus: string): string {
  const map: Record<string, string> = {
    Pending: "pending",
    "Waiting Payment": "waiting_payment",
    Purchased: "purchased",
    Shipped: "shipped",
    Completed: "completed",
    Cancelled: "cancelled",
  };
  return map[uiStatus] || uiStatus;
}
