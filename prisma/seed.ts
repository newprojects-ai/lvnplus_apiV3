import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { loadMasterData } from './seeds/master-data';

const prisma = new PrismaClient();

// Define roles in Title Case to match the Role enum in types/index.ts
const ROLES = ['Student', 'Parent', 'Tutor', 'Admin'] as const;
type RoleType = typeof ROLES[number];

async function main() {
  // Create roles if they don't exist
  for (const roleName of ROLES) {
    await prisma.roles.upsert({
      where: { role_name: roleName },
      update: {},
      create: {
        role_name: roleName,
        description: `${roleName} role`,
      },
    });
  }

  console.log('Roles seeded successfully');

  // Create test users with hashed passwords
  const users = [
    {
      email: 'student@lvnplus.com',
      password: await bcrypt.hash('student123', 10),
      first_name: 'Test',
      last_name: 'Student',
      role: 'Student' as RoleType,
    },
    {
      email: 'parent@lvnplus.com',
      password: await bcrypt.hash('parent123', 10),
      first_name: 'Test',
      last_name: 'Parent',
      role: 'Parent' as RoleType,
    },
    {
      email: 'tutor@lvnplus.com',
      password: await bcrypt.hash('tutor123', 10),
      first_name: 'Test',
      last_name: 'Tutor',
      role: 'Tutor' as RoleType,
    },
    {
      email: 'admin@lvnplus.com',
      password: await bcrypt.hash('admin123', 10),
      first_name: 'Test',
      last_name: 'Admin',
      role: 'Admin' as RoleType,
    },
  ];

  for (const userData of users) {
    const { role, ...userInfo } = userData;
    
    const user = await prisma.users.upsert({
      where: { email: userInfo.email },
      update: userInfo,
      create: userInfo,
    });

    // Get role ID
    const roleRecord = await prisma.roles.findUnique({
      where: { role_name: role },
    });

    if (roleRecord) {
      // Assign role to user
      await prisma.user_roles.upsert({
        where: {
          user_id_role_id: {
            user_id: user.user_id,
            role_id: roleRecord.role_id,
          },
        },
        update: {},
        create: {
          user_id: user.user_id,
          role_id: roleRecord.role_id,
        },
      });
    }
  }

  console.log('Users seeded successfully');

  // Load other master data
  await loadMasterData(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
