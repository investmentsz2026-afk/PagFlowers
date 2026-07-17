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
  let dbCategories: any[] = [];
  try {
    // Fetch all products from database to feed the client catalog
    products = await prisma.product.findMany({
      where: {
        isComplement: {
          not: true
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Fetch active categories
    dbCategories = await prisma.category.findMany({
      where: { 
        isActive: true,
        isComplement: {
          not: true
        }
      },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching catalog data:', error);
  }

  return (
    <div className="bg-[#FAF8F5] dark:bg-[#0B0B0B] min-h-screen pb-20">
      <CatalogClient initialProducts={products} initialCategory={initialCategory} dbCategories={dbCategories} />
    </div>
  );
}
