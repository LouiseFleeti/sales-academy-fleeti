import { NextResponse } from "next/server";
import { getCapacites } from "@/lib/notion";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getCapacites();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error fetching capacites:", err);
    return NextResponse.json({ error: "Failed to fetch capacites" }, { status: 500 });
  }
}
