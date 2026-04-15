import { NextResponse } from "next/server";
import { getPainPoints } from "@/lib/notion";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getPainPoints();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error fetching pain points:", err);
    return NextResponse.json({ error: "Failed to fetch pain points" }, { status: 500 });
  }
}
