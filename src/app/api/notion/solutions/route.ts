import { NextResponse } from "next/server";
import { getSolutions } from "@/lib/notion";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getSolutions();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error fetching solutions:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: String(err), detail: "Failed to fetch solutions" }, { status: 500 });
  }
}
