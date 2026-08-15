'use client'

import { create } from 'zustand'
import {
  persist,
  createJSONStorage,
} from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'

import type { CartState } from '@/types/cart'

const CART_VERSION = 2

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

          // نفس المنتج + نفس الـ variant + نفس المقاس + نفس اللون
          // يعتبر نفس عنصر السلة.
          //
          // النقابات الموجودة داخله لا يتم حذفها.
          const existing = items.find(
            (cartItem) =>
              cartItem.productId === item.productId &&
              cartItem.variantId === item.variantId &&
              (cartItem.size || '') === (item.size || '') &&
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
                    quantity:
                      cartItem.quantity +
                      item.quantity,
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

          set({
            items: get().items.map((item) =>
              item.id === id
                ? {
                  ...item,
                  quantity,
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

        get totalItems() {
          return get().items.reduce(
            (sum, item) =>
              sum + item.quantity,
            0,
          )
        },

        // ==========================================
        // SUBTOTAL
        // ==========================================

        get subtotal() {
          return get().items.reduce(
            (total, item) => {
              // ==============================
              // PRODUCT TOTAL
              // ==============================

              const productTotal =
                item.unitPrice *
                item.quantity

              // ==============================
              // NIQAB TOTAL
              // ==============================
              //
              // كل نقاب = 20 د.م
              //
              // مثال:
              //
              // أسود × 2 = 40 د.م
              // بني × 3 = 60 د.م
              // بيج × 1 = 20 د.م
              //
              // المجموع = 120 د.م

              const niqabTotal =
                item.niqabItems?.reduce(
                  (
                    niqabSum,
                    niqab,
                  ) =>
                    niqabSum +
                    niqab.unitPrice *
                    niqab.quantity,
                  0,
                ) || 0

              return (
                total +
                productTotal +
                niqabTotal
              )
            },
            0,
          )
        },
      }),

      {
        // ==========================================
        // PERSIST CONFIG
        // ==========================================

        name: 'thuraya-cart',

        version: CART_VERSION,

        storage:
          createJSONStorage(
            () => localStorage,
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