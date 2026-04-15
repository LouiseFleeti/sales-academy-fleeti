import { NextResponse } from "next/server";
import { getBenefices } from "@/lib/notion";

export const revalidate = 600;

export async function GET() {
  try {
    const data = await getBenefices();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error fetching benefices:", err);
    return NextResponse.json({ error: "Failed to fetch benefices" }, { status: 500 });
  }
}
