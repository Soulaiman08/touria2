'use server'

import { revalidatePath } from 'next/cache'

/**
 * Server action to invalidate storefront caches when admin updates data
 */
export async function revalidateStorefrontCaches() {
  try {
    revalidatePath('/', 'layout')
    revalidatePath('/[locale]', 'layout')
    revalidatePath('/[locale]/products', 'layout')
    revalidatePath('/api/products')
    revalidatePath('/api/categories')
    return { success: true }
  } catch (error) {
    console.error('Error revalidating paths:', error)
    return { success: false }
  }
}
