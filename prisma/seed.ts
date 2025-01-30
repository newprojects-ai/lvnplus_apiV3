import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { loadMasterData } from './seeds/master-data';

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

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.users.upsert({
    where: { email: 'admin@lvnplus.com' },
    update: {},
    create: {
      email: 'admin@lvnplus.com',
      password: adminPassword,
      first_name: 'Admin',
      last_name: 'User',
      user_roles: {
        create: {
          roles: {
            connect: { role_name: 'ADMIN' }
          }
        }
      }
    }
  });

  console.log('Admin user created:', admin.email);

  // Create a teacher
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const teacher = await prisma.users.upsert({
    where: { email: 'teacher@lvnplus.com' },
    update: {},
    create: {
      email: 'teacher@lvnplus.com',
      password: teacherPassword,
      first_name: 'Teacher',
      last_name: 'Smith',
      user_roles: {
        create: {
          roles: {
            connect: { role_name: 'TEACHER' }
          }
        }
      }
    }
  });

  console.log('Teacher created:', teacher.email);

  // Create a student
  const studentPassword = await bcrypt.hash('student123', 10);
  const student = await prisma.users.upsert({
    where: { email: 'student@lvnplus.com' },
    update: {},
    create: {
      email: 'student@lvnplus.com',
      password: studentPassword,
      first_name: 'Student',
      last_name: 'Johnson',
      user_roles: {
        create: {
          roles: {
            connect: { role_name: 'STUDENT' }
          }
        }
      }
    }
  });

  console.log('Student created:', student.email);

  // Create a parent
  const parentPassword = await bcrypt.hash('parent123', 10);
  const parent = await prisma.users.upsert({
    where: { email: 'parent@lvnplus.com' },
    update: {},
    create: {
      email: 'parent@lvnplus.com',
      password: parentPassword,
      first_name: 'Parent',
      last_name: 'Brown',
      user_roles: {
        create: {
          roles: {
            connect: { role_name: 'PARENT' }
          }
        }
      }
    }
  });

  console.log('Parent created:', parent.email);

  // Create a study group
  const studyGroup = await prisma.study_groups.create({
    data: {
      group_name: 'Math Class 101',
      description: 'Introduction to Mathematics',
      tutor: {
        connect: { user_id: teacher.user_id }
      },
      students: {
        connect: [{ user_id: student.user_id }]
      }
    }
  });

  console.log('Study group created:', studyGroup.group_name);

  // Create a guardian relationship
  await prisma.student_guardians.create({
    data: {
      guardian_id: parent.user_id,
      student_id: student.user_id,
      relationship_type: 'PARENT',
      status: 'ACTIVE'
    }
  });

  console.log('Guardian relationship created');

  // Load master data
  await loadMasterData();
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
