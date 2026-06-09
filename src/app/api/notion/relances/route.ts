import { NextResponse } from "next/server";
import { readData } from "@/lib/dataStore";
import { getRelances } from "@/lib/notion";
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const cached = await readData("relances");
    if (cached) return NextResponse.json(cached);
    const data = await getRelances();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
