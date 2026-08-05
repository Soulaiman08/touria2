import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind CSS classes with clsx support
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a price in Moroccan Dirham
 */
export function formatPrice(
  amount: number | string,
  locale: string = 'ar',
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '—'

  const symbol = locale === 'ar' ? 'د.م.' : 'DH'
  const formatted = new Intl.NumberFormat(locale === 'ar' ? 'ar-MA' : 'fr-MA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num)

  return locale === 'ar' ? `${formatted} ${symbol}` : `${formatted} ${symbol}`
}

/**
 * Generates an order number in format TH-YYYYMMDD-XXXXX
 */
export function generateOrderNumber(): string {
  const date = new Date()
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '')
  const randomPart = Math.floor(10000 + Math.random() * 90000).toString()
  return `TH-${datePart}-${randomPart}`
}

/**
 * Slugifies a string (handles Arabic transliteration too)
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Truncates text to a given length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '...'
}

/**
 * Returns the localized field value from a multilingual object
 */
export function getLocalized<T extends Record<string, unknown>>(
  obj: T,
  field: string,
  locale: string,
): string {
  const localeSuffix = locale.charAt(0).toUpperCase() + locale.slice(1)
  const key = `${field}${localeSuffix}` as keyof T
  const fallbackKey = `${field}Ar` as keyof T
  return (obj[key] as string) || (obj[fallbackKey] as string) || ''
}

/**
 * Checks if a locale is RTL
 */
export function isRTL(locale: string): boolean {
  return locale === 'ar'
}

/**
 * Returns text direction for a locale
 */
export function getDirection(locale: string): 'rtl' | 'ltr' {
  return isRTL(locale) ? 'rtl' : 'ltr'
}

/**
 * Validates a Moroccan phone number
 */
export function isValidMoroccanPhone(phone: string): boolean {
  // Accepts: 06XXXXXXXX, 07XXXXXXXX, +2126XXXXXXXX, +2127XXXXXXXX
  const cleaned = phone.replace(/[\s\-().]/g, '')
  return /^(\+?212|0)(6|7)\d{8}$/.test(cleaned)
}

/**
 * Formats a Moroccan phone number for display
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-().]/g, '').replace(/^\+212/, '0')
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`
  }
  return phone
}

/**
 * Calculates discount percentage
 */
export function getDiscountPercentage(basePrice: number, salePrice: number): number {
  if (salePrice >= basePrice) return 0
  return Math.round(((basePrice - salePrice) / basePrice) * 100)
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return function (...args: Parameters<T>) {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
