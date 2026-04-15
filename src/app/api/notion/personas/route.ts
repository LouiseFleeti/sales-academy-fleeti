import { NextResponse } from "next/server";
import { getPersonas } from "@/lib/notion";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getPersonas();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error fetching personas:", err);
    return NextResponse.json({ error: "Failed to fetch personas" }, { status: 500 });
  }
}
