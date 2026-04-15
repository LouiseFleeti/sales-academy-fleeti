import { NextResponse } from "next/server";
import { getPainPoints } from "@/lib/notion";

export const revalidate = 600;

export async function GET() {
  try {
    const data = await getPainPoints();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error fetching pain points:", err);
    return NextResponse.json({ error: "Failed to fetch pain points" }, { status: 500 });
  }
}
