import React from 'react';
import { prisma } from '@/lib/db';
import ComplementsClient from './ComplementsClient';

export const revalidate = 10; // Revalidate cache every 10 seconds

export default async function ComplementsPage() {
  let products: any[] = [];
  let dbCategories: any[] = [];
  try {
    // Fetch only complement products
    products = await prisma.product.findMany({
      where: {
        isComplement: true
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Fetch complement categories
    dbCategories = await prisma.category.findMany({
      where: {
        isComplement: true,
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    });
  } catch (error) {
    console.error('Error fetching complement catalog data:', error);
  }

  return (
    <div className="bg-[#FAF8F5] dark:bg-[#0B0B0B] min-h-screen pb-20">
      <ComplementsClient initialProducts={products} dbCategories={dbCategories} />
    </div>
  );
}
