import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuthRequest } from '@/lib/auth';

// Helper to ensure user is at least logged in (admin or worker)
const checkAuth = (req: NextRequest) => {
  const payload = verifyAuthRequest(req);
  if (!payload || !payload.userId) {
    return false;
  }
  return true;
};

// GET delivery districts
export async function GET(req: NextRequest) {
  try {
    const content = await prisma.content.findUnique({
      where: { key: 'delivery_districts' },
    });
    
    if (!content) {
      // Default initial data if empty
      return NextResponse.json([{ name: 'Miraflores', cost: 15 }]);
    }

    return NextResponse.json(JSON.parse(content.value));
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching delivery districts' }, { status: 500 });
  }
}

// POST update delivery districts
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
  }

  try {
    const districts = await req.json();

    if (!Array.isArray(districts)) {
      return NextResponse.json({ message: 'Formato inválido. Debe ser un arreglo.' }, { status: 400 });
    }

    await prisma.content.upsert({
      where: { key: 'delivery_districts' },
      update: { value: JSON.stringify(districts) },
      create: {
        key: 'delivery_districts',
        value: JSON.stringify(districts),
      },
    });

    return NextResponse.json({ message: 'Zonas de envío actualizadas exitosamente' }, { status: 200 });
  } catch (error) {
    console.error('Error saving delivery districts:', error);
    return NextResponse.json({ message: 'Error interno al guardar' }, { status: 500 });
  }
}
