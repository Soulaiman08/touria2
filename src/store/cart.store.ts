'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type { CartState } from '@/types/cart'

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      // ── Actions ───────────────────────────────────────────────

      addItem: (item) => {
        const items = get().items

        // Check if same product+variant already exists
        const existing = items.find(
          (i) =>
            i.productId === item.productId &&
            i.variantId === item.variantId &&
            i.size === item.size &&
            i.colorCode === item.colorCode,
        )

        if (existing) {
          set({
            items: items.map((i) =>
              i.id === existing.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i,
            ),
            isOpen: true,
          })
        } else {
          set({
            items: [...items, { ...item, id: uuidv4() }],
            isOpen: true,
          })
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) })
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity } : i,
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),

      // ── Computed ──────────────────────────────────────────────

      get totalItems() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      get subtotal() {
        return get().items.reduce(
          (sum, item) =>
            sum +
            item.unitPrice * item.quantity +
            (item.niqabItem ? item.niqabItem.unitPrice * item.quantity : 0),
          0,
        )
      },
    }),
    {
      name: 'thuraya-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
)
