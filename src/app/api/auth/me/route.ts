import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuthRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const payload = verifyAuthRequest(req);
    
    if (!payload) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      }
    });

    if (!user || user.status === 'INACTIVE') {
      return NextResponse.json({ message: 'Cuenta no encontrada o inactiva' }, { status: 403 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    console.error('Auth /me error:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
