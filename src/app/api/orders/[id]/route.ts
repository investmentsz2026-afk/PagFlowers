import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuthRequest } from '@/lib/auth';

// GET /api/orders/[id] - Get a single order details (Public for Confirmation screen)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return NextResponse.json({ message: 'ID de pedido inválido.' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ message: 'Pedido no encontrado.' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Fetch order detail error:', error);
    return NextResponse.json(
      { message: 'Error al obtener los detalles del pedido.', error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id] - Update order status (Protected for CPanel)
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
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return NextResponse.json({ message: 'ID de pedido inválido.' }, { status: 400 });
    }

    const body = await req.json();
    const { status, paymentStatus } = body;

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return NextResponse.json({ message: 'Pedido no encontrado.' }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: status !== undefined ? status : existingOrder.status,
        paymentStatus: paymentStatus !== undefined ? paymentStatus : existingOrder.paymentStatus,
      },
    });

    // Simulated hooks for status transitions
    if (status && status !== existingOrder.status) {
      console.log(`[AUTOMATION] Estado del pedido ${existingOrder.orderNumber} cambiado a: ${status}`);
      if (status === 'CONFIRMED') {
        console.log(`[AUTOMATION] WhatsApp automático enviado: Pago verificado y pedido confirmado.`);
      } else if (status === 'PREPARING') {
        console.log(`[AUTOMATION] Notificación al taller: Preparando arreglo floral.`);
      } else if (status === 'SHIPPED') {
        console.log(`[AUTOMATION] Notificación de despacho: Pedido en ruta de reparto.`);
      } else if (status === 'DELIVERED') {
        console.log(`[AUTOMATION] Pedido entregado exitosamente. Correo final de agradecimiento enviado.`);
      }
    }

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { message: 'Error al actualizar el pedido.', error: error.message },
      { status: 500 }
    );
  }
}
