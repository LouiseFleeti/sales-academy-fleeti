import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { client, sector, vehicles, logoUrl, sales } = body;

  if (!client?.trim()) {
    return NextResponse.json({ error: 'Nom du client requis' }, { status: 400 });
  }

  const outputPath = join(tmpdir(), `fleeti-${randomUUID()}.pptx`);
  const scriptPath = join(process.cwd(), 'scripts', 'personalize_pptx.py');

  const args = [
    `--client "${client.trim().replace(/"/g, '')}"`,
    sector ? `--sector "${sector}"` : '',
    vehicles ? `--vehicles ${parseInt(vehicles)}` : '',
    logoUrl ? `--logo-url "${logoUrl.trim()}"` : '',
    sales ? `--sales "${sales.trim().replace(/"/g, '')}"` : '',
    `--output "${outputPath}"`,
  ].filter(Boolean).join(' ');

  try {
    await execAsync(`python3 ${scriptPath} ${args}`);

    const fileBuffer = await readFile(outputPath);
    await unlink(outputPath).catch(() => {});

    const filename = `Fleeti - ${client.trim()}.pptx`;

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch (err) {
    console.error('Erreur génération pptx:', err);
    await unlink(outputPath).catch(() => {});
    return NextResponse.json({ error: 'Erreur lors de la génération' }, { status: 500 });
  }
}
