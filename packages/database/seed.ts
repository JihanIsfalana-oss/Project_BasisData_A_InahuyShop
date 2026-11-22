import { prisma } from './src/client.js'

const categories = [{ name: 'Kategori Demo', slug: 'kategori-demo' }]

try {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
  }
} finally {
  await prisma.$disconnect()
}
