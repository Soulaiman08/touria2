'use client'

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Cart store is initialized via Zustand with persist
  // This provider just wraps children to allow future cart context if needed
  return <>{children}</>
}
