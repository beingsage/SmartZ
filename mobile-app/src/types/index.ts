export interface User {
  id: string
  email: string
  name: string
  phone: string
}

export interface MenuItem {
  id: string
  vendorId: string
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  isAvailable: boolean
  preparationTime: number
}

export interface CartItem {
  menuItem: MenuItem
  quantity: number
}

export interface Vendor {
  id: string
  name: string
  description: string
  imageUrl?: string
  rating: number
  isOpen: boolean
  openTime: string
  closeTime: string
}

export type OrderStatus = "PLACED" | "CONFIRMED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED"

export interface Order {
  id: string
  userId: string
  vendorId: string
  items: Array<{
    menuItemId: string
    menuItemName: string
    quantity: number
    price: number
  }>
  totalAmount: number
  status: OrderStatus
  paymentStatus: "PENDING" | "PAID" | "FAILED"
  createdAt: string
  updatedAt: string
  estimatedReadyTime?: string
}

export interface AuthResponse {
  token: string
  user: User
}
