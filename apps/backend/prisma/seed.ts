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

  const createdUsers: Array<{
    id: string;
    email: string;
    role: UserRole;
  }> = [];

  for (const user of seedUsers) {
    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
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
    createdUsers.push(createdUser);
  }

  const [electronics, grocery] = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Electronics' },
      update: { description: 'Devices and accessories' },
      create: { name: 'Electronics', description: 'Devices and accessories' },
    }),
    prisma.category.upsert({
      where: { name: 'Grocery' },
      update: { description: 'Perishable and non-perishable goods' },
      create: { name: 'Grocery', description: 'Perishable and non-perishable goods' },
    }),
  ]);

  const [acmeSupplier, freshSupplier] = await Promise.all([
    prisma.supplier.upsert({
      where: { name: 'ACME Supply Co.' },
      update: { email: 'sales@acme.local', phone: '+55 11 4000-1000' },
      create: {
        name: 'ACME Supply Co.',
        email: 'sales@acme.local',
        phone: '+55 11 4000-1000',
      },
    }),
    prisma.supplier.upsert({
      where: { name: 'Fresh Farms Distributor' },
      update: { email: 'ops@fresh.local', phone: '+55 11 4000-2000' },
      create: {
        name: 'Fresh Farms Distributor',
        email: 'ops@fresh.local',
        phone: '+55 11 4000-2000',
      },
    }),
  ]);

  const [tagFeatured, tagSeasonal, tagFragile] = await Promise.all([
    prisma.tag.upsert({
      where: { name: 'Featured' },
      update: { color: '#1d4ed8' },
      create: { name: 'Featured', color: '#1d4ed8' },
    }),
    prisma.tag.upsert({
      where: { name: 'Seasonal' },
      update: { color: '#15803d' },
      create: { name: 'Seasonal', color: '#15803d' },
    }),
    prisma.tag.upsert({
      where: { name: 'Fragile' },
      update: { color: '#b45309' },
      create: { name: 'Fragile', color: '#b45309' },
    }),
  ]);

  const adminUser = createdUsers.find((user) => user.email === 'admin@testforge.local');
  const operatorUser = createdUsers.find((user) => user.email === 'operator@testforge.local');

  if (!adminUser || !operatorUser) {
    throw new Error('Seed users could not be created');
  }

  const existingProduct = await prisma.product.findUnique({
    where: { sku: 'TF-HEADPHONE-001' },
    select: { id: true },
  });

  if (!existingProduct) {
    await prisma.product.create({
      data: {
        name: 'Forge Wireless Headphones',
        sku: 'TF-HEADPHONE-001',
        shortDescription: 'Noise cancelling wireless headphones',
        longDescription:
          'Premium wireless headphones built for long work sessions and detailed product QA exercises.',
        price: '599.90',
        promotionalPrice: '499.90',
        promotionEndsAt: new Date('2026-12-01T00:00:00.000Z'),
        cost: '320.00',
        stockQuantity: 42,
        category: { connect: { id: electronics.id } },
        supplier: { connect: { id: acmeSupplier.id } },
        status: 'READY',
        isActive: true,
        weight: '0.45',
        width: '18.00',
        height: '22.00',
        length: '9.50',
        barcode: '7891000000011',
        featureBullets: [
          'Active noise cancelling',
          'Bluetooth multipoint',
          'QA-friendly seed data',
        ],
        relatedSkus: ['TF-SNACK-002'],
        createdBy: { connect: { id: adminUser.id } },
        lastUpdatedBy: { connect: { id: operatorUser.id } },
        productTags: {
          create: [{ tagId: tagFeatured.id }, { tagId: tagFragile.id }],
        },
      },
    });
  }

  const existingFoodProduct = await prisma.product.findUnique({
    where: { sku: 'TF-SNACK-002' },
    select: { id: true },
  });

  if (!existingFoodProduct) {
    await prisma.product.create({
      data: {
        name: 'Forge Protein Snack Pack',
        sku: 'TF-SNACK-002',
        shortDescription: 'High-protein snack box',
        longDescription:
          'A curated snack pack with predictable shelf-life data, useful for testing optional expiration dates.',
        price: '49.90',
        promotionalPrice: '39.90',
        promotionEndsAt: new Date('2026-10-31T00:00:00.000Z'),
        cost: '21.50',
        stockQuantity: 120,
        category: { connect: { id: grocery.id } },
        supplier: { connect: { id: freshSupplier.id } },
        status: 'READY',
        isActive: true,
        weight: '0.80',
        width: '24.00',
        height: '12.00',
        length: '18.00',
        barcode: '7891000000028',
        expirationDate: new Date('2026-12-31T00:00:00.000Z'),
        featureBullets: [
          'Shelf-life scenario',
          'Predictable expiration date',
          'Category-based validation',
        ],
        relatedSkus: ['TF-HEADPHONE-001'],
        createdBy: { connect: { id: adminUser.id } },
        lastUpdatedBy: { connect: { id: adminUser.id } },
        productTags: {
          create: [{ tagId: tagSeasonal.id }],
        },
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
