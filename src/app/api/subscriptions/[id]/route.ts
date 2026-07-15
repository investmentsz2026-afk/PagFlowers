import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuthRequest } from '@/lib/auth';

// PUT /api/subscriptions/[id] - Update subscription details/status (Protected)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = verifyAuthRequest(req);
    if (!adminUser) {
      return NextResponse.json({ message: 'No autorizado.' }, { status: 401 });
    }

    const { id } = await params;
    const subscriptionId = parseInt(id);

    if (isNaN(subscriptionId)) {
      return NextResponse.json({ message: 'ID de suscripción inválido.' }, { status: 400 });
    }

    const body = await req.json();
    const { status, paymentStatus } = body;

    const existingSubscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!existingSubscription) {
      return NextResponse.json({ message: 'Suscripción no encontrada.' }, { status: 404 });
    }

    const dataToUpdate: any = {};
    if (status !== undefined) dataToUpdate.status = status;
    if (paymentStatus !== undefined) dataToUpdate.paymentStatus = paymentStatus;

    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedSubscription);
  } catch (error: any) {
    console.error('Update subscription status error:', error);
    return NextResponse.json(
      { message: 'Error al actualizar la suscripción.', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/subscriptions/[id] - Delete a subscription (Protected)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = verifyAuthRequest(req);
    if (!adminUser) {
      return NextResponse.json({ message: 'No autorizado.' }, { status: 401 });
    }

    const { id } = await params;
    const subscriptionId = parseInt(id);

    if (isNaN(subscriptionId)) {
      return NextResponse.json({ message: 'ID de suscripción inválido.' }, { status: 400 });
    }

    const existingSubscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!existingSubscription) {
      return NextResponse.json({ message: 'Suscripción no encontrada.' }, { status: 404 });
    }

    await prisma.subscription.delete({
      where: { id: subscriptionId },
    });

    return NextResponse.json({ message: 'Suscripción eliminada exitosamente.' });
  } catch (error: any) {
    console.error('Delete subscription error:', error);
    return NextResponse.json(
      { message: 'Error al eliminar la suscripción.', error: error.message },
      { status: 500 }
    );
  }
}
