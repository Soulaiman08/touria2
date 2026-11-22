'use client'

import { create } from 'zustand'
import {
  persist,
  createJSONStorage,
  type StateStorage,
} from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'

import type { CartState } from '@/types/cart'

const CART_VERSION = 2

const memoryFallbackStorage = new Map<string, string>()

const safeCartStorage: StateStorage = {
  getItem: (name) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(name)
      }
    } catch {
      // ignore SecurityError in restricted mobile browsers
    }
    return memoryFallbackStorage.get(name) ?? null
  },
  setItem: (name, value) => {
    memoryFallbackStorage.set(name, value)
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(name, value)
      }
    } catch {
      // ignore SecurityError / QuotaExceededError
    }
  },
  removeItem: (name) => {
    memoryFallbackStorage.delete(name)
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(name)
      }
    } catch {
      // ignore SecurityError
    }
  },
}

export const useCartStore =
  create<CartState>()(
    persist(
      (set, get) => ({
        items: [],
        isOpen: false,

        // ==========================================
        // ADD ITEM
        // ==========================================

        addItem: (item) => {
          const items = get().items
          const maxQty = item.maxOrderQuantity ?? null
          const currentProductQty = items
            .filter((cartItem) => cartItem.productId === item.productId)
            .reduce((sum, cartItem) => sum + cartItem.quantity, 0)
          const effectiveAddQty =
            maxQty !== null
              ? Math.min(item.quantity, Math.max(0, maxQty - currentProductQty))
              : item.quantity

          if (maxQty !== null && effectiveAddQty <= 0) {
            set({ isOpen: true })
            return
          }

          // نفس المنتج + نفس الـ variant + نفس المقاس + نفس اللون
          // يعتبر نفس عنصر السلة.
          //
          // النقابات الموجودة داخله لا يتم حذفها.
          const existing = items.find(
            (cartItem) =>
              cartItem.productId === item.productId &&
              cartItem.variantId === item.variantId &&
              (cartItem.size || '') === (item.size || '') &&
              (cartItem.customNote || '').trim() === (item.customNote || '').trim() &&
              cartItem.colorCode === item.colorCode &&
              JSON.stringify(cartItem.niqabItems ?? []) ===
                JSON.stringify(item.niqabItems ?? []),
          )

          if (existing) {
            set({
              items: items.map((cartItem) =>
                cartItem.id === existing.id
                  ? {
                      ...cartItem,
                      minOrderQuantity: item.minOrderQuantity ?? cartItem.minOrderQuantity,
                      maxOrderQuantity:
                        item.maxOrderQuantity !== undefined
                          ? item.maxOrderQuantity
                          : cartItem.maxOrderQuantity,
                      quantity: cartItem.quantity + effectiveAddQty,
                    }
                  : cartItem,
              ),
              isOpen: true,
            })

            return
          }

          set({
            items: [
              ...items,
              {
                ...item,
                quantity: effectiveAddQty,
                id: uuidv4(),
              },
            ],
            isOpen: true,
          })
        },

        // ==========================================
        // REMOVE ITEM
        // ==========================================

        removeItem: (id) => {
          set({
            items: get().items.filter(
              (item) => item.id !== id,
            ),
          })
        },

        // ==========================================
        // UPDATE PRODUCT QUANTITY
        // ==========================================

        updateQuantity: (
          id,
          quantity,
        ) => {
          if (quantity <= 0) {
            get().removeItem(id)
            return
          }

          const currentItems = get().items
          const target = currentItems.find((item) => item.id === id)
          let clampedQty = quantity
          if (target && target.maxOrderQuantity != null) {
            const otherRowsQty = currentItems
              .filter((item) => item.id !== id && item.productId === target.productId)
              .reduce((sum, item) => sum + item.quantity, 0)
            clampedQty = Math.min(quantity, Math.max(1, target.maxOrderQuantity - otherRowsQty))
          }

          set({
            items: currentItems.map((item) =>
              item.id === id
                ? {
                    ...item,
                    quantity: clampedQty,
                  }
                : item,
            ),
          })
        },

        // ==========================================
        // CLEAR CART
        // ==========================================

        clearCart: () => {
          set({
            items: [],
          })
        },

        // ==========================================
        // CART OPEN / CLOSE
        // ==========================================

        openCart: () => {
          set({
            isOpen: true,
          })
        },

        closeCart: () => {
          set({
            isOpen: false,
          })
        },

        toggleCart: () => {
          set({
            isOpen: !get().isOpen,
          })
        },

        // ==========================================
        // TOTAL ITEMS
        // ==========================================
        //
        // Note: We do NOT use getters here because
        // Zustand's Object.assign-based set() evaluates
        // getters with the OLD state, causing stale values.
        // Components should compute these directly:
        //   totalItems = items.reduce(sum + item.quantity, 0)
        //   subtotal = computeCartSubtotal(items)

        // ==========================================
        // SUBTOTAL
        // ==========================================
      }),

      {
        // ==========================================
        // PERSIST CONFIG
        // ==========================================

        name: 'thuraya-cart',

        version: CART_VERSION,

        storage:
          createJSONStorage(
            () => safeCartStorage,
          ),

        // ==========================================
        // MIGRATION
        // ==========================================
        //
        // الإصدار القديم من السلة لا يحتوي بالضرورة
        // على niqabItems.
        //
        // لذلك نحافظ على المنتجات القديمة ونضيف:
        //
        // niqabItems: undefined
        //
        // حتى تصبح متوافقة مع الشكل الجديد.

        migrate: (
          persistedState: unknown,
          version: number,
        ) => {
          // إذا كانت البيانات غير موجودة أو غير صالحة
          if (
            !persistedState ||
            typeof persistedState !== 'object'
          ) {
            return {
              items: [],
            }
          }

          const state =
            persistedState as {
              items?: unknown
            }

          // ==============================
          // OLD VERSION
          // ==============================

          if (version < CART_VERSION) {
            const oldItems =
              Array.isArray(state.items)
                ? state.items
                : []

            const migratedItems =
              oldItems.map((item) => {
                if (
                  !item ||
                  typeof item !==
                  'object'
                ) {
                  return null
                }

                const cartItem =
                  item as Record<
                    string,
                    unknown
                  >

                return {
                  ...cartItem,

                  // ضمان وجود ID
                  id:
                    typeof cartItem.id ===
                      'string'
                      ? cartItem.id
                      : uuidv4(),

                  // ضمان وجود quantity
                  quantity:
                    typeof cartItem.quantity ===
                      'number'
                      ? cartItem.quantity
                      : 1,

                  // الإصدار الجديد
                  // يدعم النقابات المتعددة.
                  //
                  // المنتجات القديمة ليس لديها نقابات،
                  // لذلك نبقيها undefined.
                  niqabItems:
                    Array.isArray(
                      cartItem.niqabItems,
                    )
                      ? cartItem.niqabItems
                      : undefined,
                }
              })

            return {
              items:
                migratedItems.filter(
                  Boolean,
                ) as CartState['items'],
            }
          }

          // ==============================
          // CURRENT VERSION
          // ==============================

          const items =
            Array.isArray(state.items)
              ? state.items
              : []

          return {
            items:
              items as CartState['items'],
          }
        },

        // ==========================================
        // ONLY PERSIST ITEMS
        // ==========================================

        partialize: (state) => ({
          items: state.items,
        }),
      },
    ),
  )