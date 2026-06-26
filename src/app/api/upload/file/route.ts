import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('name');

    if (!filename) {
      return NextResponse.json({ message: 'Nombre de archivo faltante.' }, { status: 400 });
    }

    const fileContent = await prisma.content.findUnique({
      where: { key: `file_${filename}` }
    });

    if (!fileContent) {
      return NextResponse.json({ message: 'Archivo no encontrado.' }, { status: 404 });
    }

    const fileData = JSON.parse(fileContent.value); // { base64: string, type: string }
    const buffer = Buffer.from(fileData.base64, 'base64');

    return new Response(buffer, {
      headers: {
        'Content-Type': fileData.type || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      }
    });
  } catch (error: any) {
    console.error('Error serving file from database:', error);
    return NextResponse.json(
      { message: 'Error al obtener el archivo.', error: error.message },
      { status: 500 }
    );
  }
}
