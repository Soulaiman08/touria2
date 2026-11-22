import { prisma } from '@/lib/prisma'
import {
  CATEGORY_CONFIG_KEY_PREFIX,
  sanitizeCategoryConfig,
  type CategoryConfig,
  type CategoryIdentityLike,
} from '@/lib/category-config'

export function categoryConfigKey(categoryId: string): string {
  return `${CATEGORY_CONFIG_KEY_PREFIX}${categoryId}`
}

export async function getCategoryConfigMap(
  categories: CategoryIdentityLike[]
): Promise<Map<string, CategoryConfig>> {
  const result = new Map<string, CategoryConfig>()
  if (categories.length === 0) return result

  try {
    const rows = await prisma.siteSetting.findMany({
      where: {
        key: { startsWith: CATEGORY_CONFIG_KEY_PREFIX },
      },
    })

    const rawById = new Map<string, unknown>()
    for (const row of rows) {
      const catId = row.key.slice(CATEGORY_CONFIG_KEY_PREFIX.length)
      if (!catId) continue
      try {
        rawById.set(catId, JSON.parse(row.value))
      } catch {
        // Ignore malformed JSON and fall back to smart defaults
      }
    }

    for (const cat of categories) {
      if (!cat.id) continue
      result.set(cat.id, sanitizeCategoryConfig(rawById.get(cat.id), cat))
    }
  } catch (error) {
    console.error('Failed to read category configs from siteSetting:', error)
    for (const cat of categories) {
      if (!cat.id) continue
      result.set(cat.id, sanitizeCategoryConfig(undefined, cat))
    }
  }

  return result
}

export async function getCategoryConfig(
  category: CategoryIdentityLike
): Promise<CategoryConfig> {
  if (!category.id) {
    return sanitizeCategoryConfig(undefined, category)
  }

  try {
    const row = await prisma.siteSetting.findUnique({
      where: { key: categoryConfigKey(category.id) },
    })
    if (!row?.value) {
      return sanitizeCategoryConfig(undefined, category)
    }
    const parsed = JSON.parse(row.value)
    return sanitizeCategoryConfig(parsed, category)
  } catch {
    return sanitizeCategoryConfig(undefined, category)
  }
}

export async function saveCategoryConfig(
  category: CategoryIdentityLike & { id: string },
  rawConfig: unknown
): Promise<CategoryConfig> {
  const sanitized = sanitizeCategoryConfig(rawConfig, category)
  const key = categoryConfigKey(category.id)
  const serialized = JSON.stringify(sanitized)

  await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value: serialized },
    update: { value: serialized },
  })

  return sanitized
}

export async function deleteCategoryConfig(categoryId: string): Promise<void> {
  try {
    await prisma.siteSetting.deleteMany({
      where: { key: categoryConfigKey(categoryId) },
    })
  } catch (error) {
    console.error('Failed to delete category config:', error)
  }
}
