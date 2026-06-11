import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Supabase belum dikonfigurasi" },
        { status: 503 },
      );
    }

    const whatsapp = request.nextUrl.searchParams.get("whatsapp");
    const email = request.nextUrl.searchParams.get("email");

    if (!whatsapp && !email) {
      return NextResponse.json(
        { success: false, error: "Parameter whatsapp atau email diperlukan" },
        { status: 400 },
      );
    }

    // Build query
    let query = supabase!
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
      .limit(50);

    if (whatsapp) {
      query = query.eq("whatsapp", whatsapp);
    } else if (email) {
      query = query.eq("email", email);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase history query error:", error);
      return NextResponse.json(
        { success: false, error: "Gagal mengambil riwayat pesanan" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      orders: data || [],
      total: data?.length || 0,
    });
  } catch (err: any) {
    console.error("Error in history API:", err);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
