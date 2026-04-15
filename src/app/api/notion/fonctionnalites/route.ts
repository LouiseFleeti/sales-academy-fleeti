import { NextResponse } from "next/server";
import { getFonctionnalites } from "@/lib/notion";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getFonctionnalites();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error fetching fonctionnalites:", err);
    return NextResponse.json({ error: "Failed to fetch fonctionnalites" }, { status: 500 });
  }
}
