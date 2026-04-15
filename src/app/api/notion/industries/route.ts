import { NextResponse } from "next/server";
import { getIndustries } from "@/lib/notion";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getIndustries();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error fetching industries:", err);
    return NextResponse.json({ error: "Failed to fetch industries" }, { status: 500 });
  }
}
