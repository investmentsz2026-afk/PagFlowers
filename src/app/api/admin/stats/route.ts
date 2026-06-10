import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuthRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = verifyAuthRequest(req);
    if (!authUser) {
      return NextResponse.json({ message: 'No autorizado.' }, { status: 401 });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // 1. Fetch sales stats
    const todayOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startOfToday },
        paymentStatus: 'PAID', // count paid sales
      },
      select: { total: true },
    });
    const todaySales = todayOrders.reduce((sum: number, o: { total: number }) => sum + o.total, 0);

    const monthOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startOfMonth },
        paymentStatus: 'PAID',
      },
      select: { total: true },
    });
    const monthSales = monthOrders.reduce((sum: number, o: { total: number }) => sum + o.total, 0);

    // 2. Fetch order status counts
    const pendingCount = await prisma.order.count({
      where: {
        status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED'] },
      },
    });

    const deliveredCount = await prisma.order.count({
      where: {
        status: 'DELIVERED',
      },
    });

    // 3. Registered clients count (distinct emails)
    const distinctClients = await prisma.order.groupBy({
      by: ['clientEmail'],
      _count: { clientEmail: true },
    });
    const clientCount = distinctClients.length;

    // 4. Top Selling Products
    const orderItems = await prisma.orderItem.findMany();
    const productSalesMap: Record<string, { name: string; sales: number; revenue: number }> = {};
    orderItems.forEach((item) => {
      if (!productSalesMap[item.productName]) {
        productSalesMap[item.productName] = { name: item.productName, sales: 0, revenue: 0 };
      }
      productSalesMap[item.productName].sales += item.quantity;
      productSalesMap[item.productName].revenue += item.price * item.quantity;
    });
    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    // 5. Orders by District Distribution
    const districtGroups = await prisma.order.groupBy({
      by: ['deliveryDistrict'],
      _count: { id: true },
    });
    const districtChart = districtGroups.map((g) => ({
      name: g.deliveryDistrict,
      value: g._count.id,
    }));

    // 6. Recent Orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });

    // 7. Monthly Sales Chart Mock/Aggregation for last 6 months
    // We will generate the last 6 months list dynamically and sum up order totals
    const salesChart = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth();
      const monthLabel = d.toLocaleString('es-ES', { month: 'short' }).toUpperCase();

      const mStart = new Date(year, month, 1);
      const mEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

      const mOrders = await prisma.order.findMany({
        where: {
          createdAt: { gte: mStart, lte: mEnd },
          paymentStatus: 'PAID',
        },
        select: { total: true },
      });
      const total = mOrders.reduce((sum, o) => sum + o.total, 0);

      salesChart.push({
        name: monthLabel,
        ventas: total,
      });
    }

    return NextResponse.json({
      todaySales,
      monthSales,
      pendingCount,
      deliveredCount,
      clientCount,
      topProducts,
      districtChart,
      recentOrders,
      salesChart,
    });
  } catch (error: any) {
    console.error('Stats query error:', error);
    return NextResponse.json(
      { message: 'Error al calcular las estadísticas.', error: error.message },
      { status: 500 }
    );
  }
}
