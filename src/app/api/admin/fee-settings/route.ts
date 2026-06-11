import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_FEE_SETTINGS } from "@/config/jastip";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src/config/fee-settings.json");

// GET: Read fee settings
export async function GET() {
  try {
    let settings = DEFAULT_FEE_SETTINGS;
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      settings = JSON.parse(fileContent);
    }
    return NextResponse.json(settings);
  } catch (err: any) {
    console.error("Failed to read fee settings:", err);
    return NextResponse.json(DEFAULT_FEE_SETTINGS);
  }
}

// POST: Save fee settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Simple validation
    const small = Number(body.small);
    const medium = Number(body.medium);
    const large_10 = Number(body.large_10);
    const large_15 = Number(body.large_15);
    const large_20 = Number(body.large_20);

    if (isNaN(small) || isNaN(medium) || isNaN(large_10) || isNaN(large_15) || isNaN(large_20) ||
        small < 0 || medium < 0 || large_10 < 0 || large_15 < 0 || large_20 < 0) {
      return NextResponse.json(
        { success: false, error: "Nilai fee tidak valid" },
        { status: 400 }
      );
    }

    const newSettings = { small, medium, large_10, large_15, large_20 };

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write to file
    fs.writeFileSync(filePath, JSON.stringify(newSettings, null, 2), "utf-8");

    return NextResponse.json({ success: true, settings: newSettings });
  } catch (err: any) {
    console.error("Failed to save fee settings:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal menyimpan fee settings" },
      { status: 500 }
    );
  }
}
