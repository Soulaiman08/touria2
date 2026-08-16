/**
 * Formats visitor count into compact readable strings:
 * 150       -> 150
 * 999       -> 999
 * 1000      -> 1K
 * 5000      -> 5K
 * 150000    -> 150K
 * 1000000   -> 1M
 * 1500000   -> 1.5M
 */
export function formatVisitorCount(count: number): string {
  if (!count || isNaN(count) || count <= 0) return '0'

  if (count < 1000) {
    return String(count)
  }

  if (count < 1_000_000) {
    const k = count / 1000
    // Format without unnecessary decimal if whole (e.g. 150K, 1.5K)
    const formatted = k % 1 === 0 ? k.toFixed(0) : k.toFixed(1).replace(/\.0$/, '')
    return `${formatted}K`
  }

  const m = count / 1_000_000
  const formatted = m % 1 === 0 ? m.toFixed(0) : m.toFixed(1).replace(/\.0$/, '')
  return `${formatted}M`
}
