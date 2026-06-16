const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generateSlug(name) {
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
  }
}

main();
