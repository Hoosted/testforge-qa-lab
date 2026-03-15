import { PrismaClient, UserStatus, type UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const defaultPasswordHash = await bcrypt.hash('TestForge@123', 10);

  const seedUsers = [
    {
      name: 'TestForge Admin',
      email: 'admin@testforge.local',
      role: 'ADMIN' as UserRole,
      passwordHash: defaultPasswordHash,
    },
    {
      name: 'TestForge Operator',
      email: 'operator@testforge.local',
      role: 'OPERATOR' as UserRole,
      passwordHash: defaultPasswordHash,
    },
  ];

  for (const user of seedUsers) {
    await prisma.user.upsert({
      where: {
        email: user.email,
      },
      update: {
        name: user.name,
        passwordHash: user.passwordHash,
        role: user.role,
        status: UserStatus.ACTIVE,
      },
      create: {
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        status: UserStatus.ACTIVE,
      },
    });
  }
}

void main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error('Seed failed', error);
    await prisma.$disconnect();
    process.exit(1);
  });
