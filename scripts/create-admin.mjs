import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ADMIN_EMAIL    = process.argv[2] || 'admin@piebags.com';
const ADMIN_PASSWORD = process.argv[3] || 'Admin@1234';
const ADMIN_NAME     = process.argv[4] || 'Admin';

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

  if (existing) {
    // Upgrade existing account to ADMIN
    const updated = await prisma.user.update({
      where: { email: ADMIN_EMAIL },
      data: { role: 'ADMIN' },
    });
    console.log('✅ Existing user upgraded to ADMIN:', updated.email);
    return;
  }

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const user = await prisma.user.create({
    data: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashed,
      role: 'ADMIN',
    },
    select: { id: true, name: true, email: true, role: true },
  });

  console.log('✅ Admin account created:');
  console.log('   Email   :', user.email);
  console.log('   Password:', ADMIN_PASSWORD);
  console.log('   Role    :', user.role);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
