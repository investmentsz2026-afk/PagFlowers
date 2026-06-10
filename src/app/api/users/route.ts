import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuthRequest } from '@/lib/auth';
import bcrypt from 'bcryptjs';

const checkAdmin = (req: NextRequest) => {
  const payload = verifyAuthRequest(req);
  if (!payload || payload.role !== 'admin') {
    return false;
  }
  return true;
};

// GET all users (ADMIN only)
export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener usuarios' }, { status: 500 });
  }
}

// POST create new user (ADMIN only)
export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
  }

  try {
    const { name, email, password, role = 'worker' } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Correo y contraseña son obligatorios' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        status: 'ACTIVE'
      },
      select: { id: true, name: true, email: true, role: true, status: true }
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'El correo ya está en uso' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error interno' }, { status: 500 });
  }
}
