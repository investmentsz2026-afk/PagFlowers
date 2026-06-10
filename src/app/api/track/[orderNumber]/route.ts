import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const resolvedParams = await params;
    const { orderNumber } = resolvedParams;

    if (!orderNumber) {
      return NextResponse.json({ message: 'Número de pedido requerido' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: {
        orderNumber: true,
        clientName: true,
        status: true,
        deliveryDate: true,
        deliveryTime: true,
        deliveryDistrict: true,
        createdAt: true,
      },
    });

    if (!order) {
      return NextResponse.json({ message: 'Pedido no encontrado' }, { status: 404 });
    }

    // Only return the first name for privacy
    const firstName = order.clientName.split(' ')[0];

    return NextResponse.json({
      orderNumber: order.orderNumber,
      clientName: firstName,
      status: order.status,
      deliveryDate: order.deliveryDate,
      deliveryTime: order.deliveryTime,
      deliveryDistrict: order.deliveryDistrict,
      createdAt: order.createdAt,
    });
  } catch (error) {
    console.error('Error fetching order tracking info:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
