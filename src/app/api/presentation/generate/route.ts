import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);
const PYTHON = process.env.PYTHON_BIN || '/Library/Frameworks/Python.framework/Versions/3.10/bin/python3';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type = 'envoyer', client, vehicles, vehicleTypes, painPoints, logoB64, sales, industry } = body;

  if (!client?.trim()) {
    return NextResponse.json({ error: 'Nom du client requis' }, { status: 400 });
  }

  const outputPath = join(tmpdir(), `fleeti-${randomUUID()}.pptx`);
  const scriptPath = join(process.cwd(), 'scripts', 'personalize_pptx.py');
  const safe = (s: string) => s.replace(/"/g, '').replace(/'/g, '');

  // Écrire le logo dans un fichier temp si fourni
  let logoPath = '';
  if (logoB64) {
    const { writeFile } = await import('fs/promises');
    logoPath = join(tmpdir(), `logo-${randomUUID()}.png`);
    await writeFile(logoPath, Buffer.from(logoB64, 'base64'));
  }

  const args = [
    `--type "${type}"`,
    `--client "${safe(client.trim())}"`,
    vehicles      ? `--vehicles ${parseInt(vehicles)}` : '',
    vehicleTypes?.length ? `--vehicle-types "${vehicleTypes.join(',')}"` : '',
    painPoints?.length   ? `--pain-points "${painPoints.join(',')}"` : '',
    logoPath ? `--logo-path "${logoPath}"` : '',
    sales    ? `--sales "${safe(sales.trim())}"` : '',
    industry ? `--industry "${safe(industry)}"` : '',
    `--output "${outputPath}"`,
  ].filter(Boolean).join(' ');

  try {
    await execAsync(`${PYTHON} ${scriptPath} ${args}`);
    const fileBuffer = await readFile(outputPath);
    await unlink(outputPath).catch(() => {});
    if (logoPath) await unlink(logoPath).catch(() => {});

    const suffix = type === 'rdv' ? '(RDV)' : '';
    const filename = `${client.trim()} x Fleeti${suffix ? ` ${suffix}` : ''}.pptx`;

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
