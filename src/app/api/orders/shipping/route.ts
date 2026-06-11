import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Supabase belum dikonfigurasi" },
        { status: 503 },
      );
    }

    const body = await request.json();
    const { orderId, shipping_method } = body;

    if (!orderId || !shipping_method) {
      return NextResponse.json(
        { success: false, error: "orderId dan shipping_method wajib diisi" },
        { status: 400 },
      );
    }

    const validMethods = ["shopee", "cod", "gosend"];
    if (!validMethods.includes(shipping_method)) {
      return NextResponse.json(
        { success: false, error: "Metode pengiriman tidak valid" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase!
      .from("orders")
      .update({
        shipping_method,
        shipping_status: shipping_method === "shopee" ? "shopee_checkout" : "wa_confirm",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error("Supabase shipping update error:", error);
      return NextResponse.json(
        { success: false, error: "Gagal memperbarui metode pengiriman" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Metode pengiriman berhasil diperbarui",
      order: data,
    });
  } catch (err: any) {
    console.error("Error in shipping API:", err);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
