import { NextResponse } from "next/server";
import { readData } from "@/lib/dataStore";
import { getBenefices } from "@/lib/notion";
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const cached = await readData("benefices");
    if (cached) return NextResponse.json(cached);
    const data = await getBenefices();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
