import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuthRequest } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// GET /api/orders - Get all orders (Protected)
export async function GET(req: NextRequest) {
  try {
    const adminUser = verifyAuthRequest(req);
    if (!adminUser) {
      return NextResponse.json({ message: 'No autorizado.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const district = searchParams.get('district');

    // Build filter
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (district) {
      where.deliveryDistrict = district;
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { clientName: { contains: search, mode: 'insensitive' } },
        { clientEmail: { contains: search, mode: 'insensitive' } },
        { clientPhone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    return NextResponse.json(
      { message: 'Error al obtener los pedidos.', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/orders - Place a new order (Public)
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const clientName = formData.get('clientName') as string;
    const clientPhone = formData.get('clientPhone') as string;
    const clientEmail = formData.get('clientEmail') as string;
    const deliveryAddress = formData.get('deliveryAddress') as string;
    const deliveryDistrict = formData.get('deliveryDistrict') as string;
    const deliveryDate = formData.get('deliveryDate') as string;
    const deliveryTime = formData.get('deliveryTime') as string;
    const cardMessage = formData.get('cardMessage') as string;
    const paymentMethod = formData.get('paymentMethod') as string;
    const deliveryFee = formData.get('deliveryFee') as string;
    
    const itemsRaw = formData.get('items') as string;
    let items: any[] = [];
    if (itemsRaw) {
      items = JSON.parse(itemsRaw);
    }

    const paymentReceiptFile = formData.get('paymentReceipt') as File | null;

    // Validation
    if (
      !clientName ||
      !clientPhone ||
      !clientEmail ||
      !deliveryAddress ||
      !deliveryDistrict ||
      !deliveryDate ||
      !deliveryTime ||
      !paymentMethod ||
      !items ||
      items.length === 0
    ) {
      return NextResponse.json(
        { message: 'Todos los campos de contacto, entrega y productos son obligatorios.' },
        { status: 400 }
      );
    }

    // Double check product stocks and calculate total
    let subtotal = 0;
    const dbItemsData: {
      productId: number;
      productName: string;
      price: number;
      quantity: number;
      cardMessage: string | null;
    }[] = [];

    for (const item of items) {
      const dbProduct = await prisma.product.findUnique({
        where: { id: item.id },
      });

      if (!dbProduct) {
        return NextResponse.json(
          { message: `El producto "${item.name}" ya no está disponible.` },
          { status: 400 }
        );
      }

      if (dbProduct.stock < item.quantity) {
        return NextResponse.json(
          { message: `Stock insuficiente para "${dbProduct.name}". Stock disponible: ${dbProduct.stock}` },
          { status: 400 }
        );
      }

      const activePrice = dbProduct.salePrice !== null ? dbProduct.salePrice : dbProduct.price;
      subtotal += activePrice * item.quantity;

      dbItemsData.push({
        productId: dbProduct.id,
        productName: dbProduct.name,
        price: activePrice,
        quantity: item.quantity,
        cardMessage: item.cardMessage || null,
      });
    }

    const calculatedTotal = subtotal + parseFloat(deliveryFee || '0');

    // Generate unique order number (e.g., PF-2026-XXXXXX)
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `PF-2026-${randomSuffix}`;

    // Process Payment Receipt Upload
    let receiptUrl = null;
    if (paymentReceiptFile && paymentMethod !== 'TARJETA') {
      try {
        const bytes = await paymentReceiptFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        receiptUrl = `data:${paymentReceiptFile.type || 'image/png'};base64,${base64}`;
      } catch (err) {
        console.error('Error saving receipt file (base64):', err);
      }
    }

    // Perform transaction to save Order, OrderItems, and deduct inventory
    const createdOrder = await prisma.$transaction(async (tx) => {
      // 1. Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          clientName,
          clientPhone,
          clientEmail,
          deliveryAddress,
          deliveryDistrict,
          deliveryDate: new Date(deliveryDate),
          deliveryTime,
          cardMessage: cardMessage || null,
          total: calculatedTotal,
          deliveryFee: parseFloat(deliveryFee || '0'),
          status: 'PENDING',
          paymentMethod,
          paymentStatus: 'PENDING', // Always initial pending for secure verification
          paymentReceipt: receiptUrl,
          items: {
            create: dbItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      // 2. Deduct inventory
      for (const item of items) {
        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
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

          // Map items to Mercado Pago format
          const mpItems = createdOrder.items.map((item) => ({
            id: item.productId.toString(),
            title: item.productName,
            quantity: item.quantity,
            unit_price: item.price,
            currency_id: 'PEN',
          }));

          // Add delivery fee as an item if present
          if (createdOrder.deliveryFee > 0) {
            mpItems.push({
              id: 'delivery_fee',
              title: 'Costo de Envío',
              quantity: 1,
              unit_price: createdOrder.deliveryFee,
              currency_id: 'PEN',
            });
          }

          const origin = req.headers.get('origin') || 'http://localhost:3000';
          const redirectUrl = `${origin}/confirmation/${createdOrder.id}`;

          const preferenceResult = await preference.create({
            body: {
              items: mpItems,
              back_urls: {
                success: `${redirectUrl}?payment_status=approved`,
                failure: `${redirectUrl}?payment_status=failed`,
                pending: `${redirectUrl}?payment_status=pending`,
              },
              auto_return: 'approved',
              external_reference: createdOrder.orderNumber,
            },
          });

          initPoint = preferenceResult.init_point;
        } catch (mpError) {
          console.error('Failed to create Mercado Pago preference:', mpError);
        }
      }
    }

    // Simulated Automation hooks
    console.log(`[AUTOMATION] Venta registrada. Pedido número: ${orderNumber}`);
    console.log(`[AUTOMATION] Inventario actualizado para productos: ${items.map((i: any) => i.name).join(', ')}`);
    console.log(`[AUTOMATION] Correo de confirmación enviado a: ${clientEmail}`);
    console.log(`[AUTOMATION] Notificación de nuevo pedido enviada al administrador.`);

    return NextResponse.json({ ...createdOrder, initPoint }, { status: 201 });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { message: 'Error al registrar el pedido.', error: error.message },
      { status: 500 }
    );
  }
}
