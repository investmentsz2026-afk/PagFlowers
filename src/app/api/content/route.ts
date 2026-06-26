import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuthRequest } from '@/lib/auth';

// GET /api/content - Retrieve website config content keys
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (key) {
      const content = await prisma.content.findUnique({
        where: { key },
      });
      if (!content) {
        return NextResponse.json({ message: 'Contenido no encontrado.' }, { status: 404 });
      }
      return NextResponse.json(JSON.parse(content.value));
    }

    const allContent = await prisma.content.findMany();
    const result: any = {};
    allContent.forEach((c) => {
      try {
        result[c.key] = JSON.parse(c.value);
      } catch (e) {
        result[c.key] = c.value;
      }
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Fetch content error:', error);
    return NextResponse.json(
      { message: 'Error al obtener las configuraciones del sitio.', error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/content - Update website config content (Protected)
export async function PUT(req: NextRequest) {
  try {
    const adminUser = verifyAuthRequest(req);
    if (!adminUser) {
      return NextResponse.json({ message: 'No autorizado.' }, { status: 401 });
    }

    const body = await req.json();
    const { key, value } = body; // value should be an object/array

    if (!key || value === undefined) {
      return NextResponse.json(
        { message: 'Los campos "key" y "value" son obligatorios.' },
        { status: 400 }
      );
    }

    const valueString = JSON.stringify(value);

    const updatedContent = await prisma.content.upsert({
      where: { key },
      update: { value: valueString },
      create: { key, value: valueString },
    });

    return NextResponse.json({
      message: `Configuración "${key}" actualizada exitosamente.`,
      content: updatedContent,
    });
  } catch (error: any) {
    console.error('Update content error:', error);
    return NextResponse.json(
      { message: 'Error al actualizar la configuración.', error: error.message },
      { status: 500 }
    );
  }
}
