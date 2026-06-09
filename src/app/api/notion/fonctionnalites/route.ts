import { NextResponse } from "next/server";
import { getFonctionnalites } from "@/lib/notion";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getFonctionnalites();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error fetching fonctionnalites:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: String(err), detail: "Failed to fetch fonctionnalites" }, { status: 500 });
  }
}
