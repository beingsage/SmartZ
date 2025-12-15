import { create } from "zustand"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { authApi } from "../services/api"
import type { User } from "../types"

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    email: string
    password: string
    name: string
    phone: string
  }) => Promise<void>
  logout: () => Promise<void>
  loadUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null })
      const response = await authApi.login({ email, password })
      await AsyncStorage.setItem("token", response.token)
      set({ user: response.user, token: response.token, isLoading: false })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Login failed",
        isLoading: false,
      })
      throw error
    }
  },

  register: async (data) => {
    try {
      set({ isLoading: true, error: null })
      const response = await authApi.register(data)
      await AsyncStorage.setItem("token", response.token)
      set({ user: response.user, token: response.token, isLoading: false })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Registration failed",
        isLoading: false,
      })
      throw error
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem("token")
    set({ user: null, token: null })
  },

  loadUser: async () => {
    try {
      const token = await AsyncStorage.getItem("token")
      if (token) {
        const user = await authApi.getProfile()
        set({ user, token })
      }
    } catch (error) {
      await AsyncStorage.removeItem("token")
      set({ user: null, token: null })
    }
  },
}))
