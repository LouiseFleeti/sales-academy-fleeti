import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const CONFIG_PATH = join(process.cwd(), 'public', 'presentation-config.json');
const SLIDES_MAP_PATH = join(process.cwd(), 'public', 'slides-map.json');

export async function GET() {
  const [slidesMap, config] = await Promise.all([
    readFile(SLIDES_MAP_PATH, 'utf8').then(JSON.parse),
    readFile(CONFIG_PATH, 'utf8').then(JSON.parse).catch(() => ({})),
  ]);
  return NextResponse.json({ slidesMap, config });
}

export async function POST(req: NextRequest) {
  const config = await req.json();
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
  return NextResponse.json({ ok: true });
}
