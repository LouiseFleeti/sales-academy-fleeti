import { NextResponse } from "next/server";
import { readData } from "@/lib/dataStore";
import { getEnjeux } from "@/lib/notion";
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const cached = await readData("enjeux");
    if (cached) return NextResponse.json(cached);
    const data = await getEnjeux();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
