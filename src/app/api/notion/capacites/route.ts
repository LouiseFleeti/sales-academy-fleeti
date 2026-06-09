import { NextResponse } from "next/server";
import { readData } from "@/lib/dataStore";
import { getCapacites } from "@/lib/notion";
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const cached = await readData("capacites");
    if (cached) return NextResponse.json(cached);
    const data = await getCapacites();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
