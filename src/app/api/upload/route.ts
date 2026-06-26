import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { verifyAuthRequest } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const adminUser = verifyAuthRequest(req);
    if (!adminUser) {
      return NextResponse.json({ message: 'No autorizado.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'No se envió ningún archivo.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Make sure it's an image or a PDF
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      return NextResponse.json({ message: 'El archivo debe ser una imagen o un PDF.' }, { status: 400 });
    }

    // Clean filename and add timestamp to avoid collisions
    const ext = file.name.split('.').pop();
    const sanitizedName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '-');
    const newFileName = `${sanitizedName}-${Date.now()}.${ext}`;

    // 1. Opcional: Escribir en el disco local (para desarrollo local)
    try {
      const uploadDir = join(process.cwd(), 'public', 'images', 'uploads');
      await mkdir(uploadDir, { recursive: true });
      const filePath = join(uploadDir, newFileName);
      await writeFile(filePath, buffer);
    } catch (e: any) {
      console.warn('No se pudo guardar localmente en disco (Vercel/Solo Lectura). Guardando en base de datos. Error:', e.message);
    }

    // 2. Guardar en base de datos (para persistencia en producción/Vercel)
    const base64String = buffer.toString('base64');
    const filePayload = {
      base64: base64String,
      type: file.type
    };

    await prisma.content.upsert({
      where: { key: `file_${newFileName}` },
      update: { value: JSON.stringify(filePayload) },
      create: { key: `file_${newFileName}`, value: JSON.stringify(filePayload) }
    });

    const publicUrl = `/api/upload/file?name=${newFileName}`;

    return NextResponse.json({ 
      message: 'Archivo subido correctamente.',
      url: publicUrl
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { message: 'Error interno al subir archivo.', error: error.message },
      { status: 500 }
    );
  }
}
