import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import ProductDetailClient from './ProductDetailClient';

export const revalidate = 10; // Revalidate dynamic product detail pages every 10s

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const productId = parseInt(resolvedParams.id);

  if (isNaN(productId)) {
    return notFound();
  }

  // 1. Fetch Product details
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return notFound();
  }

  // 2. Fetch Related products from same category
  let relatedProducts: any[] = [];
  try {
    relatedProducts = await prisma.product.findMany({
      where: {
        category: product.category,
        id: { not: product.id },
      },
      take: 4,
    });
  } catch (error) {
    console.error('Error fetching related products:', error);
  }

  return (
    <div className="bg-[var(--luxury-cream)] min-h-screen pt-32 pb-24">
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </div>
  );
}
