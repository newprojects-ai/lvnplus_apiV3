import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create roles if they don't exist
  const roles = ['STUDENT', 'TEACHER', 'ADMIN', 'PARENT'];
  
  for (const roleName of roles) {
    await prisma.roles.upsert({
      where: { role_name: roleName },
      update: {},
      create: {
        role_name: roleName,
        description: `${roleName.charAt(0) + roleName.slice(1).toLowerCase()} role`,
      },
    });
  }

  console.log('Roles seeded successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
