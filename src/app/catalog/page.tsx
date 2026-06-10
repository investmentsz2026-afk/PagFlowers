import React from 'react';
import { prisma } from '@/lib/db';
import CatalogClient from './CatalogClient';

export const revalidate = 10; // Revalidate cache every 10 seconds

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const initialCategory = resolvedParams.category || 'TODOS';

  let products: any[] = [];
  try {
    // Fetch all products from database to feed the client catalog
    products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.error('Error fetching catalog products:', error);
  }

  return (
    <div className="bg-[var(--background)] min-h-screen pb-20">
      <CatalogClient initialProducts={products} initialCategory={initialCategory} />
    </div>
  );
}
