import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category']
    });

    const categories = products.map((p: any) => p.category).filter(Boolean);

    for (const catName of categories) {
      const slug = generateSlug(catName);
      await prisma.category.upsert({
        where: { name: catName },
        update: {},
        create: {
          name: catName,
          slug,
          isActive: true,
        }
      });
    }

    return NextResponse.json({ message: 'Categories seeded successfully', count: categories.length });
  } catch (error: any) {
    console.error('Error seeding categories:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
