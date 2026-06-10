import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuthRequest } from '@/lib/auth';
import bcrypt from 'bcryptjs';

const checkAdmin = (req: NextRequest) => {
  const payload = verifyAuthRequest(req);
  if (!payload || payload.role !== 'admin') {
    return null;
  }
  return payload;
};

// PUT update user (ADMIN only)
export async function PUT(req: NextRequest, context: any) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
  }

  const { id } = await context.params;
  const userId = parseInt(id, 10);
  if (isNaN(userId)) {
    return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
  }

  try {
    const { name, email, password, role, status } = await req.json();
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'El correo ya está en uso' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error interno' }, { status: 500 });
  }
}

// DELETE user (ADMIN only)
export async function DELETE(req: NextRequest, context: any) {
  const adminPayload = checkAdmin(req);
  if (!adminPayload) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
  }

  const { id } = await context.params;
  const userId = parseInt(id, 10);
  if (isNaN(userId)) {
    return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
  }

  // Prevent self-deletion
  if (adminPayload.userId === userId) {
    return NextResponse.json({ message: 'No puedes eliminarte a ti mismo' }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ message: 'Usuario eliminado' });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error al eliminar el usuario' }, { status: 500 });
  }
}
