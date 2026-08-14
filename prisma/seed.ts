import { PrismaClient, OrderStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ─── Categories ───────────────────────────────────────────────
  const djellabaCat = await prisma.category.upsert({
    where: { slug: 'djellabas' },
    update: {},
    create: {
      slug: 'djellabas',
      nameAr: 'جلابيات',
      nameFr: 'Djellabas',
      nameEn: 'Djellabas',
      descriptionAr: 'جلابيات مغربية مصنوعة يدوياً بأجود المواد',
      descriptionFr: 'Djellabas marocaines artisanales de qualité supérieure',
      descriptionEn: 'Handcrafted Moroccan djellabas of superior quality',
      sortOrder: 1,
    },
  })

  const niqabCat = await prisma.category.upsert({
    where: { slug: 'niqabs' },
    update: {},
    create: {
      slug: 'niqabs',
      nameAr: 'نقابات',
      nameFr: 'Niquab',
      nameEn: 'Niqabs',
      descriptionAr: 'نقابات مغربية أنيقة تتناسق مع جلابياتنا',
      descriptionFr: 'Niquab marocain élégant assorti à nos djellabas',
      descriptionEn: 'Elegant Moroccan niqabs matching our djellabas',
      sortOrder: 2,
    },
  })

  // ─── Products (Djellabas) ──────────────────────────────────────
  const product1 = await prisma.product.upsert({
    where: { slug: 'djellaba-classique-terracotta' },
    update: {},
    create: {
      slug: 'djellaba-classique-terracotta',
      sku: 'DJL-001-TERRA',
      nameAr: 'جلابة كلاسيكية – تيراكوتا',
      nameFr: 'Djellaba Classique – Terracotta',
      nameEn: 'Classic Djellaba – Terracotta',
      descriptionAr:
        'جلابة مغربية كلاسيكية مصنوعة من أجود أنواع القماش، تجمع بين الأناقة التقليدية والراحة العصرية. مثالية للمناسبات والارتداء اليومي.',
      descriptionFr:
        'Djellaba marocaine classique confectionnée dans les meilleures étoffes, alliant élégance traditionnelle et confort moderne. Parfaite pour les occasions et le quotidien.',
      descriptionEn:
        'Classic Moroccan djellaba crafted from the finest fabrics, blending traditional elegance with modern comfort. Perfect for occasions and daily wear.',
      basePrice: 599,
      salePrice: null,
      categoryId: djellabaCat.id,
      isFeatured: true,
      canAddNiqab: true,
      mainImage: '/images/products/djellaba-classique-terracotta-main.jpg',
      images: [
        '/images/products/djellaba-classique-terracotta-main.jpg',
        '/images/products/djellaba-classique-terracotta-2.jpg',
        '/images/products/djellaba-classique-terracotta-3.jpg',
      ],
      tags: ['classique', 'terracotta', 'featured'],
      metaTitleAr: 'جلابة كلاسيكية تيراكوتا – ثريا المغربي',
      metaTitleFr: 'Djellaba Classique Terracotta – ثريا المغربي',
      metaTitleEn: 'Classic Terracotta Djellaba – ثريا المغربي',
    },
  })

  const product2 = await prisma.product.upsert({
    where: { slug: 'djellaba-royale-creme' },
    update: {},
    create: {
      slug: 'djellaba-royale-creme',
      sku: 'DJL-002-CREME',
      nameAr: 'جلابة رويال – كريمي',
      nameFr: 'Djellaba Royale – Crème',
      nameEn: 'Royal Djellaba – Cream',
      descriptionAr:
        'جلابة فاخرة بتصميم ملكي مزينة بتطريز يدوي أصيل. رمز للأناقة المغربية في أبهى صورها.',
      descriptionFr:
        'Djellaba de luxe au design royal ornée de broderies artisanales authentiques. Symbole de l\'élégance marocaine dans sa plus belle expression.',
      descriptionEn:
        'Luxurious djellaba with royal design adorned with authentic handmade embroidery. A symbol of Moroccan elegance at its finest.',
      basePrice: 850,
      salePrice: 750,
      categoryId: djellabaCat.id,
      isFeatured: true,
      canAddNiqab: true,
      mainImage: '/images/products/djellaba-royale-creme-main.jpg',
      images: [
        '/images/products/djellaba-royale-creme-main.jpg',
        '/images/products/djellaba-royale-creme-2.jpg',
      ],
      tags: ['royale', 'creme', 'broderie', 'featured', 'sale'],
    },
  })

  const product3 = await prisma.product.upsert({
    where: { slug: 'djellaba-moderne-marine' },
    update: {},
    create: {
      slug: 'djellaba-moderne-marine',
      sku: 'DJL-003-MARINE',
      nameAr: 'جلابة عصرية – أزرق داكن',
      nameFr: 'Djellaba Moderne – Marine',
      nameEn: 'Modern Djellaba – Navy',
      descriptionAr:
        'جلابة عصرية بقصة أنيقة تجمع بين التراث المغربي الأصيل والتصميم المعاصر. مناسبة لكل المناسبات.',
      descriptionFr:
        'Djellaba moderne à la coupe élégante alliant patrimoine marocain authentique et design contemporain. Adaptée à toutes les occasions.',
      descriptionEn:
        'Modern djellaba with elegant cut blending authentic Moroccan heritage with contemporary design. Suitable for all occasions.',
      basePrice: 680,
      categoryId: djellabaCat.id,
      isFeatured: true,
      canAddNiqab: true,
      mainImage: '/images/products/djellaba-moderne-marine-main.jpg',
      images: ['/images/products/djellaba-moderne-marine-main.jpg'],
      tags: ['moderne', 'marine'],
    },
  })

  // ─── Product Variants ──────────────────────────────────────────
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
  const colors = [
    { code: '#C4622D', ar: 'تيراكوتا', fr: 'Terracotta', en: 'Terracotta' },
    { code: '#F2E4CE', ar: 'كريمي', fr: 'Crème', en: 'Cream' },
    { code: '#1B2B4B', ar: 'أزرق داكن', fr: 'Marine', en: 'Navy' },
    { code: '#2D5A27', ar: 'أخضر زيتوني', fr: 'Vert Olive', en: 'Olive Green' },
    { code: '#8B1A1A', ar: 'أحمر غامق', fr: 'Rouge Foncé', en: 'Dark Red' },
  ]

  for (const size of sizes) {
    for (const color of colors) {
      await prisma.productVariant.upsert({
        where: {
          productId_size_colorCode: {
            productId: product1.id,
            size,
            colorCode: color.code,
          },
        },
        update: {},
        create: {
          productId: product1.id,
          size,
          colorCode: color.code,
          colorNameAr: color.ar,
          colorNameFr: color.fr,
          colorNameEn: color.en,
          stockQuantity: 25,
          images: [],
        },
      })
    }
  }

  // Niqab products
  const niqab1 = await prisma.product.upsert({
    where: { slug: 'niqab-classique-terracotta' },
    update: {},
    create: {
      slug: 'niqab-classique-terracotta',
      sku: 'NQB-001-TERRA',
      nameAr: 'نقاب كلاسيكي – تيراكوتا',
      nameFr: 'Niqab Classique – Terracotta',
      nameEn: 'Classic Niqab – Terracotta',
      descriptionAr: 'نقاب مغربي أنيق يتناسق مع جلابة تيراكوتا الكلاسيكية.',
      descriptionFr: 'Niqab marocain élégant assorti à la djellaba terracotta classique.',
      descriptionEn: 'Elegant Moroccan niqab matching the classic terracotta djellaba.',
      basePrice: 150,
      categoryId: niqabCat.id,
      isNiqab: true,
      isFeatured: false,
      canAddNiqab: false,
      mainImage: '/images/products/niqab-classique-terracotta.jpg',
      images: ['/images/products/niqab-classique-terracotta.jpg'],
      tags: ['niqab', 'terracotta'],
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log(`   Categories: djellabas, niqabs`)
  console.log(`   Products: 3 djellabas + 1 niqab`)
  console.log(`   Variants: ${sizes.length * colors.length} for product 1`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
