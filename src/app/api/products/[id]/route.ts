import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuthRequest } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// GET /api/products/[id] - Get a single product details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json({ message: 'ID de producto inválido.' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ message: 'Producto no encontrado.' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Fetch product detail error:', error);
    return NextResponse.json(
      { message: 'Error al obtener los detalles del producto.', error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update an existing product (Protected)
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
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json({ message: 'ID de producto inválido.' }, { status: 400 });
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
    } = body;

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json({ message: 'Producto no encontrado.' }, { status: 404 });
    }

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (description !== undefined) dataToUpdate.description = description;
    if (price !== undefined) dataToUpdate.price = parseFloat(price);
    if (salePrice !== undefined) dataToUpdate.salePrice = salePrice ? parseFloat(salePrice) : null;
    if (saleDescription !== undefined) dataToUpdate.saleDescription = saleDescription || null;
    if (images !== undefined) dataToUpdate.images = images;
    if (stock !== undefined) dataToUpdate.stock = parseInt(stock);
    if (category !== undefined) dataToUpdate.category = category;
    if (tags !== undefined) dataToUpdate.tags = tags;
    if (isExclusive !== undefined) dataToUpdate.isExclusive = !!isExclusive;
    if (isFeatured !== undefined) dataToUpdate.isFeatured = !!isFeatured;

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: dataToUpdate,
    });

    // Clear caches so the homepage and catalog page reflect the change immediately
    revalidatePath('/');
    revalidatePath('/catalog');

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { message: 'Error al actualizar el producto.', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete a product (Protected)
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
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json({ message: 'ID de producto inválido.' }, { status: 400 });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json({ message: 'Producto no encontrado.' }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    // Clear caches so the homepage and catalog page reflect the change immediately
    revalidatePath('/');
    revalidatePath('/catalog');

    return NextResponse.json({ message: 'Producto eliminado exitosamente.' });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { message: 'Error al eliminar el producto.', error: error.message },
      { status: 500 }
    );
  }
}
