import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuthRequest } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// Update personal profile
export async function PUT(req: NextRequest) {
  try {
    const payload = verifyAuthRequest(req);
    if (!payload) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    const updateData: any = { name, email };

    // If attempting to change password
    if (currentPassword && newPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json({ message: 'La contraseña actual es incorrecta' }, { status: 400 });
      }
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    return NextResponse.json({ message: 'Perfil actualizado con éxito', user: updatedUser });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'El correo ya está en uso' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error interno', error: error.message }, { status: 500 });
  }
}
