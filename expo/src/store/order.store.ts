import { create } from "zustand"
import { orderApi } from "../services/api"
import type { Order } from "../types"

interface OrderState {
  currentOrder: Order | null
  orders: Order[]
  isLoading: boolean
  error: string | null
  createOrder: (data: {
    vendorId: string
    items: Array<{ menuItemId: string; quantity: number }>
    totalAmount: number
  }) => Promise<Order>
  fetchOrder: (id: string) => Promise<void>
  fetchMyOrders: () => Promise<void>
  setCurrentOrder: (order: Order | null) => void
  updateOrderStatus: (order: Order) => void
}

export const useOrderStore = create<OrderState>((set, get) => ({
  currentOrder: null,
  orders: [],
  isLoading: false,
  error: null,

  createOrder: async (data) => {
    try {
      set({ isLoading: true, error: null })
      const order = await orderApi.create(data)
      set({
        currentOrder: order,
        orders: [order, ...get().orders],
        isLoading: false,
      })
      return order
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create order",
        isLoading: false,
      })
      throw error
    }
  },

  fetchOrder: async (id) => {
    try {
      set({ isLoading: true, error: null })
      const order = await orderApi.getById(id)
      set({ currentOrder: order, isLoading: false })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch order",
        isLoading: false,
      })
    }
  },

  fetchMyOrders: async () => {
    try {
      set({ isLoading: true, error: null })
      const orders = await orderApi.getMyOrders()
      set({ orders, isLoading: false })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch orders",
        isLoading: false,
      })
    }
  },

  setCurrentOrder: (order) => {
    set({ currentOrder: order })
  },

  updateOrderStatus: (updatedOrder) => {
    set((state) => ({
      currentOrder: state.currentOrder?.id === updatedOrder.id ? updatedOrder : state.currentOrder,
      orders: state.orders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)),
    }))
  },
}))
