require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // 1. Create default admin user
  const adminEmail = 'admin@rossyflowers.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('AdminRossyFlowers2026!', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Administrador Principal',
        role: 'admin',
      },
    });
    console.log('Admin user created: admin@rossyflowers.com / AdminRossyFlowers2026!');
  } else {
    console.log('Admin user already exists.');
  }

  // 2. Clear existing products (optional, for clean seed)
  await prisma.product.deleteMany({});
  console.log('Cleared existing products.');

  // 3. Create Premium Products
  const products = [
    {
      name: 'Ramillete de Rosas Pastel "Elegance"',
      description: 'Espectacular bouquet de 24 rosas en tonos pastel seleccionadas de los mejores invernaderos de la región. Envuelto finamente en papel coreano de seda y atado con un listón de organza premium. Ideal para aniversarios y momentos románticos.',
      price: 189.0,
      salePrice: 159.0,
      images: ['/images/products/bouquet-pasteles.webp', '/images/products/bouquet-pasteles-2.webp'],
      stock: 15,
      category: 'Ramos',
      tags: ['Rosas', 'Pastel', 'Aniversario', 'Amor'],
      isExclusive: false,
      isFeatured: true,
    },
    {
      name: 'Orquídea Phalaenopsis Blanca "Purity"',
      description: 'Elegante orquídea de doble tallo de flores blancas impecables, presentada en una base de cerámica artesanal importada y decorada con musgo natural preservado. Transmite paz, pureza y sofisticación absoluta.',
      price: 249.0,
      salePrice: null,
      images: ['/images/products/orquidea-blanca.webp'],
      stock: 8,
      category: 'Orquídeas',
      tags: ['Orquídeas', 'Blanco', 'Elegante', 'Corporativo'],
      isExclusive: true,
      isFeatured: true,
    },
    {
      name: 'Caja de Rosas Rojas "L\'Amour"',
      description: 'Lujosa caja circular negra de tacto aterciopelado con 36 rosas rojas importadas de la más alta calidad dispuestas simétricamente. Incluye tapa y un delicado lazo de seda dorado. Un regalo inolvidable que redefine el romance.',
      price: 299.0,
      salePrice: 269.0,
      images: ['/images/products/caja-rosas.webp', '/images/products/caja-rosas-2.webp'],
      stock: 20,
      category: 'Cajas de Lujo',
      tags: ['Cajas', 'Rojo', 'Rosas', 'Romance', 'San Valentin'],
      isExclusive: true,
      isFeatured: true,
    },
    {
      name: 'Florero de Tulipanes "Primavera"',
      description: 'Delicado arreglo de 20 tulipanes holandeses en tonos encendidos (amarillo, naranja y rosa) dispuestos en un florero de cristal de corte premium. Incluye follaje fino para complementar el diseño.',
      price: 219.0,
      salePrice: 199.0,
      images: ['/images/products/tulipanes-primavera.webp'],
      stock: 12,
      category: 'Ramos',
      tags: ['Tulipanes', 'Primavera', 'Florero', 'Cumpleaños'],
      isExclusive: false,
      isFeatured: false,
    },
    {
      name: 'Caja Premium Golden "Sinfonía Floral"',
      description: 'Nuestra obra maestra: caja hexagonal dorada con detalles metálicos que combina rosas pastel, minirrosas, lirios aromáticos y hortensias seleccionadas. Un arreglo tridimensional lleno de vida y elegancia suprema.',
      price: 389.0,
      salePrice: 349.0,
      images: ['/images/products/caja-dorada.webp'],
      stock: 5,
      category: 'Cajas de Lujo',
      tags: ['Cajas', 'Lujo', 'Mixto', 'Premium'],
      isExclusive: true,
      isFeatured: true,
    },
    {
      name: 'Orquídea Imperial Púrpura "Royal"',
      description: 'Majestuosa orquídea de tres tallos en un vibrante color púrpura real, presentada en una maceta texturizada de estilo contemporáneo. Perfecta para expresar admiración profunda y gratitud.',
      price: 289.0,
      salePrice: null,
      images: ['/images/products/orquidea-purpura.webp'],
      stock: 6,
      category: 'Orquídeas',
      tags: ['Orquídeas', 'Púrpura', 'Exclusivo', 'Agradecimiento'],
      isExclusive: true,
      isFeatured: false,
    },
    {
      name: 'Canasta de Girasoles "Sol de Verano"',
      description: 'Canasta rústica tejida a mano con 12 girasoles gigantes, acompañados de flores silvestres y hojas de eucalipto fresco. Transmite luz, alegría y energía positiva instantánea.',
      price: 159.0,
      salePrice: 139.0,
      images: ['/images/products/girasoles-alegria.webp'],
      stock: 18,
      category: 'Detalles Especiales',
      tags: ['Girasoles', 'Alegre', 'Canasta', 'Recuperación'],
      isExclusive: false,
      isFeatured: false,
    },
    {
      name: 'Combo Dulce Detalle "Golden Night"',
      description: 'El regalo de acompañamiento perfecto: bouquet premium de rosas rojas y tulipanes, caja de bombones belgas artesanales de 250g y un oso de peluche ultra suave importado de 35cm.',
      price: 269.0,
      salePrice: 239.0,
      images: ['/images/products/combo-especial.webp'],
      stock: 10,
      category: 'Detalles Especiales',
      tags: ['Combo', 'Rosas', 'Chocolates', 'Peluche', 'Cumpleaños'],
      isExclusive: false,
      isFeatured: true,
    },
  ];

  for (const prod of products) {
    await prisma.product.create({
      data: prod,
    });
  }
  console.log(`Successfully seeded ${products.length} products.`);

  // 4. Create Content for banners and coverage
  const bannerValue = [
    {
      id: 1,
      title: 'Elegancia y Exclusividad en Cada Flor',
      subtitle: 'Diseños florales de autor inspirados en la alta costura para expresar tus sentimientos más profundos en Lima.',
      buttonText: 'Ver Colección Premium',
      image: '/images/hero/banner-1.webp',
      link: '/catalog',
    },
    {
      id: 2,
      title: 'Momentos Inolvidables',
      subtitle: 'Colecciones exclusivas en cajas aterciopeladas y orquídeas imperiales con envío express garantizado el mismo día.',
      buttonText: 'Explorar Cajas de Lujo',
      image: '/images/hero/banner-2.webp',
      link: '/catalog?category=Cajas+de+Lujo',
    },
  ];

  await prisma.content.upsert({
    where: { key: 'home_banners' },
    update: { value: JSON.stringify(bannerValue) },
    create: { key: 'home_banners', value: JSON.stringify(bannerValue) },
  });
  console.log('Seeded homepage banners configuration.');

  const deliveryDistricts = [
    { name: 'Miraflores', cost: 15 },
    { name: 'San Isidro', cost: 15 },
    { name: 'Santiago de Surco', cost: 18 },
    { name: 'La Molina', cost: 25 },
    { name: 'San Borja', cost: 18 },
    { name: 'Barranco', cost: 15 },
    { name: 'Jesús María', cost: 18 },
    { name: 'Lince', cost: 18 },
    { name: 'Magdalena del Mar', cost: 18 },
    { name: 'Pueblo Libre', cost: 18 },
    { name: 'Chorrillos', cost: 20 },
    { name: 'San Miguel', cost: 20 },
    { name: 'Surquillo', cost: 15 },
  ];

  await prisma.content.upsert({
    where: { key: 'delivery_districts' },
    update: { value: JSON.stringify(deliveryDistricts) },
    create: { key: 'delivery_districts', value: JSON.stringify(deliveryDistricts) },
  });
  console.log('Seeded delivery districts and coverage cost config.');

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
