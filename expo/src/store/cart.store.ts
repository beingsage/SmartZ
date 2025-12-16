import { create } from "zustand"
import type { CartItem, MenuItem } from "../types"

interface CartState {
  items: CartItem[]
  vendorId: string | null
  addItem: (item: MenuItem, quantity: number) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getTotalAmount: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  vendorId: null,

  addItem: (menuItem, quantity) => {
    const { items, vendorId } = get()

    if (vendorId && vendorId !== menuItem.vendorId) {
      throw new Error("Cannot add items from different vendors")
    }

    const existingItemIndex = items.findIndex((item) => item.menuItem.id === menuItem.id)

    if (existingItemIndex >= 0) {
      const newItems = [...items]
      newItems[existingItemIndex].quantity += quantity
      set({ items: newItems })
    } else {
      set({
        items: [...items, { menuItem, quantity }],
        vendorId: menuItem.vendorId,
      })
    }
  },

  removeItem: (itemId) => {
    const newItems = get().items.filter((item) => item.menuItem.id !== itemId)
    set({
      items: newItems,
      vendorId: newItems.length === 0 ? null : get().vendorId,
    })
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId)
      return
    }

    const newItems = get().items.map((item) => (item.menuItem.id === itemId ? { ...item, quantity } : item))
    set({ items: newItems })
  },

  clearCart: () => {
    set({ items: [], vendorId: null })
  },

  getTotalAmount: () => {
    return get().items.reduce((total, item) => total + item.menuItem.price * item.quantity, 0)
  },

  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0)
  },
}))
