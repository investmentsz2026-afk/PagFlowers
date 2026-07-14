import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return NextResponse.json({ message: 'ID de pedido inválido.' }, { status: 400 });
    }

    const { paymentId } = await req.json();

    if (!paymentId) {
      return NextResponse.json({ message: 'ID de pago faltante.' }, { status: 400 });
    }

    // 1. Fetch order details from database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ message: 'Pedido no encontrado.' }, { status: 404 });
    }

    // If already marked as PAID, no need to query Mercado Pago again
    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({ message: 'Pago ya confirmado anteriormente.', order });
    }

    // 2. Fetch payment details from Mercado Pago
    const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!mpAccessToken) {
      return NextResponse.json(
        { message: 'El servidor no tiene configurado el token de Mercado Pago.' },
        { status: 500 }
      );
    }

    const client = new MercadoPagoConfig({ accessToken: mpAccessToken });
    const paymentClient = new Payment(client);
    const paymentInfo = await paymentClient.get({ id: paymentId });

    // 3. Verify payment details match our order
    const isApproved = paymentInfo.status === 'approved';
    const isMatchingReference = paymentInfo.external_reference === order.orderNumber;

    if (isApproved && isMatchingReference) {
      // Update order to PAID in Prisma
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED', // Set to confirmed when paid
        },
      });

      console.log(`[AUTOMATION] Pago aprobado y verificado para pedido ${order.orderNumber}. ID Pago: ${paymentId}`);
      return NextResponse.json({ message: 'Pago verificado con éxito.', order: updatedOrder });
    } else {
      return NextResponse.json(
        { 
          message: 'Verificación fallida. El estado del pago no es aprobado o no coincide el pedido.',
          mpStatus: paymentInfo.status,
          mpRef: paymentInfo.external_reference
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { message: 'Error interno al verificar el pago.', error: error.message },
      { status: 500 }
    );
  }
}
