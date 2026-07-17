import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuthRequest } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// GET /api/products - List all products
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const isFeatured = searchParams.get('featured');
    const isExclusive = searchParams.get('exclusive');
    const isComplement = searchParams.get('complement');
    const sort = searchParams.get('sort'); // price-asc, price-desc, stock-asc, stock-desc

    // Build filter
    const where: any = {};
    if (category) {
      where.category = { equals: category };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }
    if (isFeatured === 'true') {
      where.isFeatured = true;
    }
    if (isExclusive === 'true') {
      where.isExclusive = true;
    }
    
    // Default to only standard products if not querying complements explicitly
    if (isComplement === 'true') {
      where.isComplement = true;
    } else {
      where.isComplement = { not: true };
    }

    // Build sorting order
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price-desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'stock-asc') {
      orderBy = { stock: 'asc' };
    } else if (sort === 'stock-desc') {
      orderBy = { stock: 'desc' };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
    });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Fetch products error:', error);
    return NextResponse.json(
      { message: 'Error al obtener los productos.', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product (Protected)
export async function POST(req: NextRequest) {
  try {
    const adminUser = verifyAuthRequest(req);
    if (!adminUser) {
      return NextResponse.json({ message: 'No autorizado.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      description,
      price,
      salePrice,
      saleDescription,
      images,
      stock,
      category,
      tags,
      isExclusive,
      isFeatured,
      isComplement,
    } = body;

    if (!name || !description || price === undefined || !category) {
      return NextResponse.json(
        { message: 'Campos obligatorios faltantes: name, description, price, category.' },
        { status: 400 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        saleDescription: saleDescription || null,
        images: images || [],
        stock: parseInt(stock) || 0,
        category,
        tags: tags || [],
        isExclusive: !!isExclusive,
        isFeatured: !!isFeatured,
        isComplement: !!isComplement,
      },
    });

    // Clear caches so the homepage and catalog page reflect the change immediately
    revalidatePath('/');
    revalidatePath('/catalog');
    revalidatePath('/complements');

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { message: 'Error al crear el producto.', error: error.message },
      { status: 500 }
    );
  }
}
