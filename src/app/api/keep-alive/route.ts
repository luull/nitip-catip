import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    if (!supabase) {
      console.error("Supabase keep-alive query skipped: Supabase is not configured");
      return NextResponse.json(
        { success: false, error: "Supabase belum dikonfigurasi" },
        { status: 503 },
      );
    }

    const { error } = await supabase
      .from("order_items")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Supabase keep-alive query failed:", error);
      return NextResponse.json(
        { success: false, error: "Supabase keep-alive query gagal" },
        { status: 500 },
      );
    }

    console.log("Supabase keep-alive query executed successfully");
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Supabase keep-alive query failed:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
