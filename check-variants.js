const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()
p.product.findMany({ include: { variants: true } }).then(r => {
  r.forEach(x => {
    console.log(x.id.slice(0, 20), x.nameFr, 'isNiqab:', x.isNiqab, 'variants:', x.variants.length, 'canAddNiqab:', x.canAddNiqab)
    x.variants.forEach(v => {
      console.log('  v:', v.id.slice(0, 20), v.colorNameAr, v.size, 'stock:', v.stockQuantity, 'mod:', v.priceModifier)
    })
  })
  p.$disconnect()
}).catch(e => { console.error(e); p.$disconnect() })
