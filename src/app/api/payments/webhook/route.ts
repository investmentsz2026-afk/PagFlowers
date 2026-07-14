import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || searchParams.get('topic');
    const body = await req.json().catch(() => ({}));

    // Mercado Pago webhook can send type via query param or body
    const id = body.data?.id || searchParams.get('id');

    if ((type === 'payment' || body.type === 'payment' || body.action?.startsWith('payment.')) && id) {
      const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
      if (!mpAccessToken) {
        console.error('[WEBHOOK] Access token missing in environment variables');
        return NextResponse.json({ message: 'Missing token' }, { status: 500 });
      }

      const client = new MercadoPagoConfig({ accessToken: mpAccessToken });
      const paymentClient = new Payment(client);
      const paymentInfo = await paymentClient.get({ id });

      if (paymentInfo.status === 'approved') {
        const orderNumber = paymentInfo.external_reference;

        if (orderNumber) {
          // Find order and update payment status to PAID
          const order = await prisma.order.findUnique({
            where: { orderNumber }
          });

          if (order && order.paymentStatus !== 'PAID') {
            await prisma.order.update({
              where: { id: order.id },
              data: {
                paymentStatus: 'PAID',
                status: 'CONFIRMED', // Set to confirmed when paid
              }
            });
            console.log(`[WEBHOOK] Pago verificado y confirmado para pedido ${orderNumber}. ID Pago: ${id}`);
          }
        }
      }
    }

    // Mercado Pago requires a 200 OK or 201 response to acknowledge receipt of webhook
    return new Response('OK', { status: 200 });
  } catch (error: any) {
    console.error('[WEBHOOK] Error processing notification:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
