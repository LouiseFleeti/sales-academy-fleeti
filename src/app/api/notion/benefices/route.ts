import { NextResponse } from "next/server";
import { getBenefices } from "@/lib/notion";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getBenefices();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error fetching benefices:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: String(err), detail: "Failed to fetch benefices" }, { status: 500 });
  }
}
