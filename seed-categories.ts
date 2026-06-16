import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function main() {
  try {
    const products = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category']
    });

    const categories = products.map((p) => p.category).filter(Boolean);

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
      console.log(`Seeded category: ${catName}`);
    }
    console.log(`Successfully seeded ${categories.length} categories.`);
  } catch (error) {
    console.error('Error seeding categories:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
