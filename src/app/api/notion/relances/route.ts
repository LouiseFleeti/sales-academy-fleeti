import { NextResponse } from "next/server";
import { getRelances } from "@/lib/notion";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getRelances();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error fetching relances:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: String(err), detail: "Failed to fetch relances" }, { status: 500 });
  }
}
