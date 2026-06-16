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

const requestedCategories = [
  "Día de la Madre",
  "Día del Novio",
  "Primavera",
  "Día del Padre",
  "Fúnebres",
  "Box de Rosas",
  "Girasoles"
];

async function main() {
  try {
    // Delete existing categories to start fresh
    await prisma.category.deleteMany({});
    console.log('Deleted auto-generated categories.');

    for (const catName of requestedCategories) {
      const slug = generateSlug(catName);
      await prisma.category.create({
        data: {
          name: catName,
          slug,
          isActive: true,
        }
      });
      console.log(`Created category: ${catName}`);
    }
    console.log(`Successfully seeded ${requestedCategories.length} categories.`);
  } catch (error) {
    console.error('Error seeding categories:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
