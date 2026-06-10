import { NextRequest, NextResponse } from "next/server";

// GET: Fetch all orders from Google Sheet and check connectivity
export async function GET() {
  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
  if (!scriptUrl) {
    return NextResponse.json({
      success: false,
      sheetStatus: "disconnected",
      orders: [],
      error: "Google Apps Script URL is not configured in env variables"
    });
  }

  try {
    const response = await fetch(`${scriptUrl}?action=getOrders`, {
      next: { revalidate: 0 } // Bypass NextJS fetch cache
    });

    if (!response.ok) {
      throw new Error(`Google Script response status ${response.status}`);
    }

    const data = await response.json();
    if (data && data.success) {
      return NextResponse.json({
        success: true,
        sheetStatus: "connected",
        orders: data.orders || []
      });
    } else {
      throw new Error(data.error || "Gagal mengambil data dari Google Apps Script");
    }
  } catch (err: any) {
    console.error("Failed to fetch orders from Google Sheet:", err);
    return NextResponse.json({
      success: false,
      sheetStatus: "disconnected",
      orders: [],
      error: err.message || "Failed to communicate with Google Sheet"
    });
  }
}

// POST: Update status of an order in Google Sheet
export async function POST(request: NextRequest) {
  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
  if (!scriptUrl) {
    return NextResponse.json(
      { success: false, error: "Google Apps Script URL is not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: "Order ID dan status wajib dikirim" },
        { status: 400 }
      );
    }

    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "updateStatus",
        orderId,
        status
      }),
      redirect: "follow"
    });

    if (!response.ok) {
      throw new Error(`Google Apps Script returned status ${response.status}`);
    }

    const result = await response.json();
    if (result && result.success) {
      return NextResponse.json({
        success: true,
        message: result.message || "Status berhasil diubah"
      });
    } else {
      throw new Error(result.error || "Google Apps Script failed to update status");
    }
  } catch (err: any) {
    console.error("Failed to update status in Google Sheet:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal mengubah status" },
      { status: 500 }
    );
  }
}
