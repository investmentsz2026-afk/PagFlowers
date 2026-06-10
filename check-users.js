const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: 'postgresql://postgres:1234@localhost:5432/FlowersPag?schema=public'
});

async function main() {
  // 1. Delete ALL existing users
  await pool.query('DELETE FROM "User"');
  console.log('✓ Todos los usuarios eliminados.');

  // 2. Create the single admin user
  const hashedPassword = await bcrypt.hash('admin1234', 10);
  await pool.query(
    `INSERT INTO "User" (email, password, name, role, status, "createdAt", "updatedAt") 
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
    ['admin@pagflowers.com', hashedPassword, 'Administrador Principal', 'admin', 'ACTIVE']
  );
  console.log('✓ Admin creado: admin@pagflowers.com / admin1234');

  // 3. Verify
  const result = await pool.query('SELECT id, email, name, role, status FROM "User"');
  console.log('Usuarios en la BD:', JSON.stringify(result.rows, null, 2));

  await pool.end();
}

main();
