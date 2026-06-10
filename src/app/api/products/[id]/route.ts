import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuthRequest } from '@/lib/auth';

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

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: name !== undefined ? name : existingProduct.name,
        description: description !== undefined ? description : existingProduct.description,
        price: price !== undefined ? parseFloat(price) : existingProduct.price,
        salePrice: salePrice !== undefined ? (salePrice ? parseFloat(salePrice) : null) : existingProduct.salePrice,
        images: images !== undefined ? images : existingProduct.images,
        stock: stock !== undefined ? parseInt(stock) : existingProduct.stock,
        category: category !== undefined ? category : existingProduct.category,
        tags: tags !== undefined ? tags : existingProduct.tags,
        isExclusive: isExclusive !== undefined ? !!isExclusive : existingProduct.isExclusive,
        isFeatured: isFeatured !== undefined ? !!isFeatured : existingProduct.isFeatured,
      },
    });

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

    return NextResponse.json({ message: 'Producto eliminado exitosamente.' });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { message: 'Error al eliminar el producto.', error: error.message },
      { status: 500 }
    );
  }
}
