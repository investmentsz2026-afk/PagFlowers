import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const defaultCat = "Día de la Madre";
    
    // Check if the default category exists in Category table
    const catExists = await prisma.category.findUnique({
      where: { name: defaultCat }
    });
    
    if (!catExists) {
      console.log('Category not found, make sure seed-custom-categories was run.');
      return;
    }

    const updated = await prisma.product.updateMany({
      data: {
        category: defaultCat
      }
    });
    console.log(`Updated ${updated.count} products to use category '${defaultCat}'.`);

  } catch (error) {
    console.error('Error updating products:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
