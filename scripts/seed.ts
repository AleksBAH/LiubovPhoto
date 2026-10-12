import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed packages
  const packages = [
    // Newborn
    { name: 'Baby Mini', category: 'Newborn', days: 10, photosCount: 5, price: 180, description: 'Only for a baby, 1 theme', sortOrder: 1 },
    { name: 'Baby', category: 'Newborn', days: 10, photosCount: 15, price: 350, description: 'Only for a baby, 3 themes', sortOrder: 2 },
    { name: 'Siblings', category: 'Newborn', days: 10, photosCount: 20, price: 400, description: 'Baby + siblings, 3 themes', sortOrder: 3 },
    { name: 'Parents', category: 'Newborn', days: 10, photosCount: 35, price: 500, description: 'Baby + parents, 3 themes', sortOrder: 4 },
    { name: 'Family', category: 'Newborn', days: 10, photosCount: 40, price: 550, description: 'Baby + siblings + parents, 3 themes', sortOrder: 5 },
    // Maternity
    { name: 'Bronze', category: 'Maternity', days: 10, photosCount: 7, price: 180, description: '1 outfit, 30-min session', sortOrder: 6 },
    { name: 'Silver', category: 'Maternity', days: 10, photosCount: 15, price: 280, description: '2-3 outfits, 1.5-2hr session', sortOrder: 7 },
    { name: 'Gold', category: 'Maternity', days: 10, photosCount: 25, price: 380, description: '4-5 outfits, 2-3hr session', sortOrder: 8 },
    // Smash Cake
    { name: 'Only child – 1 setup', category: 'Smash Cake', days: 10, photosCount: 5, price: 180, description: 'Colour correction + 5 retouched', sortOrder: 9 },
    { name: 'Only child – 2 setups', category: 'Smash Cake', days: 10, photosCount: 10, price: 250, description: 'Colour correction + 10 retouched', sortOrder: 10 },
    { name: 'Child + Family – 1 setup', category: 'Smash Cake', days: 10, photosCount: 10, price: 250, description: 'Colour correction + 10 retouched', sortOrder: 11 },
    { name: 'Child + Family – 2 setups', category: 'Smash Cake', days: 10, photosCount: 15, price: 300, description: 'Colour correction + 15 retouched', sortOrder: 12 },
  ];

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { id: pkg.name.toLowerCase().replace(/[^a-z0-9]/g, '-') },
      update: { ...pkg },
      create: { id: pkg.name.toLowerCase().replace(/[^a-z0-9]/g, '-'), ...pkg },
    });
  }

  // Seed source tags
  const tags = ['Instagram', 'Referral', 'Website', 'Facebook'];
  for (const tag of tags) {
    await prisma.sourceTag.upsert({
      where: { name: tag },
      update: {},
      create: { name: tag },
    });
  }

  // Seed default widget order
  await prisma.widgetOrder.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default', ordering: JSON.stringify(['projects', 'gantt', 'notes']) },
  });

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
