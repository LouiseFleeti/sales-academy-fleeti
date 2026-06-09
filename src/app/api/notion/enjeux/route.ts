import { NextResponse } from "next/server";
import { getEnjeux } from "@/lib/notion";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getEnjeux();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error fetching enjeux:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: String(err), detail: "Failed to fetch enjeux" }, { status: 500 });
  }
}
