import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuthRequest } from '@/lib/auth';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// GET /api/subscriptions - List all subscriptions (Protected)
export async function GET(req: NextRequest) {
  try {
    const adminUser = verifyAuthRequest(req);
    if (!adminUser) {
      return NextResponse.json({ message: 'No autorizado.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // ACTIVE, PAUSED, CANCELLED
    const search = searchParams.get('search');

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { subNumber: { contains: search, mode: 'insensitive' } },
        { clientName: { contains: search, mode: 'insensitive' } },
        { clientPhone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const subscriptions = await prisma.subscription.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(subscriptions);
  } catch (error: any) {
    console.error('Fetch subscriptions error:', error);
    return NextResponse.json(
      { message: 'Error al obtener las suscripciones.', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions - Register a new subscription (Public)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      clientName,
      clientPhone,
      clientEmail,
      deliveryAddress,
      deliveryDistrict,
      planName,
      frequency,
      flowerPreference,
      customDetails,
      paymentMethod,
      paymentReceipt, // Base64 data string (optional)
      total,
    } = body;

    // Validate fields
    if (
      !clientName ||
      !clientPhone ||
      !clientEmail ||
      !deliveryAddress ||
      !deliveryDistrict ||
      !planName ||
      !frequency ||
      !flowerPreference ||
      !paymentMethod ||
      total === undefined
    ) {
      return NextResponse.json(
        { message: 'Todos los campos obligatorios son requeridos.' },
        { status: 400 }
      );
    }

    // Generate unique subscription number (e.g. SUB-2026-XXXXXX)
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const subNumber = `SUB-2026-${randomSuffix}`;

    // Save subscription in DB
    const createdSubscription = await prisma.subscription.create({
      data: {
        subNumber,
        clientName,
        clientPhone,
        clientEmail,
        deliveryAddress,
        deliveryDistrict,
        planName,
        frequency,
        flowerPreference,
        customDetails: customDetails || null,
        paymentMethod,
        paymentStatus: 'PENDING',
        paymentReceipt: paymentReceipt || null,
        total: parseFloat(total.toString()),
        status: 'ACTIVE',
      },
    });

    // Create Mercado Pago Preference if paying with card
    let initPoint = null;
    const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (paymentMethod === 'TARJETA') {
      if (!mpAccessToken) {
        console.error('MERCADOPAGO_ACCESS_TOKEN is not configured in .env');
      } else {
        try {
          const client = new MercadoPagoConfig({ accessToken: mpAccessToken });
          const preference = new Preference(client);

          const origin = req.headers.get('origin') || 'http://localhost:3000';
          // After card checkout, redirect back to /suscripcion with success parameters
          const redirectUrl = `${origin}/suscripcion`;

          const preferenceResult = await preference.create({
            body: {
              items: [
                {
                  id: subNumber,
                  title: `Suscripción de Flores RossyFlowers - ${planName} (${frequency})`,
                  quantity: 1,
                  unit_price: parseFloat(total.toString()),
                  currency_id: 'PEN',
                }
              ],
              back_urls: {
                success: `${redirectUrl}?status=confirmed&subNumber=${subNumber}`,
                failure: `${redirectUrl}?status=failed`,
                pending: `${redirectUrl}?status=pending`,
              },
              auto_return: 'approved',
              external_reference: subNumber,
            },
          });

          initPoint = preferenceResult.init_point;
        } catch (mpError) {
          console.error('Failed to create subscription Mercado Pago preference:', mpError);
        }
      }
    }

    console.log(`[AUTOMATION] Nueva suscripción creada: ${subNumber}`);

    return NextResponse.json({ ...createdSubscription, initPoint }, { status: 201 });
  } catch (error: any) {
    console.error('Create subscription error:', error);
    return NextResponse.json(
      { message: 'Error al registrar la suscripción.', error: error.message },
      { status: 500 }
    );
  }
}
