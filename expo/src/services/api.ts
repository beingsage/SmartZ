import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { API_BASE_URL } from "../config/api"
import type { AuthResponse, User, Vendor, MenuItem, Order } from "../types"

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authApi = {
  register: async (data: {
    email: string
    password: string
    name: string
    phone: string
  }): Promise<AuthResponse> => {
    const response = await api.post("/auth/register", data)
    return response.data
  },

  login: async (data: {
    email: string
    password: string
  }): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", data)
    return response.data
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get("/auth/profile")
    return response.data
  },
}

export const vendorApi = {
  getAll: async (): Promise<Vendor[]> => {
    const response = await api.get("/vendors")
    return response.data
  },

  getById: async (id: string): Promise<Vendor> => {
    const response = await api.get(`/vendors/${id}`)
    return response.data
  },
}

export const menuApi = {
  getByVendor: async (vendorId: string): Promise<MenuItem[]> => {
    const response = await api.get(`/menu/${vendorId}`)
    return response.data
  },
}

export const orderApi = {
  create: async (data: {
    vendorId: string
    items: Array<{ menuItemId: string; quantity: number }>
    totalAmount: number
  }): Promise<Order> => {
    const response = await api.post("/orders", data)
    return response.data
  },

  getById: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`)
    return response.data
  },

  getMyOrders: async (): Promise<Order[]> => {
    const response = await api.get("/orders/my")
    return response.data
  },
}

export const paymentApi = {
  process: async (data: {
    orderId: string
    amount: number
    paymentMethod: string
  }): Promise<{ success: boolean; transactionId: string }> => {
    const response = await api.post("/payments/process", data)
    return response.data
  },
  createCheckoutSession: async (data: { orderId: string; amount: number }) => {
    const response = await api.post("/payments/create-checkout-session", data)
    return response.data
  },
  confirm: async (sessionId: string) => {
    const response = await api.post("/payments/confirm", { sessionId })
    return response.data
  },
}

export default api
