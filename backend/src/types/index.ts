export interface User {
  id: string
  email: string
  password: string
  name: string
  phone: string
  createdAt: string
}

export interface Vendor {
  id: string
  name: string
  description: string
  imageUrl: string | null
  rating: number
  isOpen: boolean
  openTime: string
  closeTime: string
  createdAt: string
}

export interface MenuItem {
  id: string
  vendorId: string
  name: string
  description: string
  price: number
  category: string
  imageUrl: string | null
  isAvailable: boolean
  preparationTime: number
  createdAt: string
}

export type OrderStatus = "PLACED" | "CONFIRMED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED"

export interface Order {
  id: string
  userId: string
  vendorId: string
  items: string
  totalAmount: number
  status: OrderStatus
  paymentStatus: "PENDING" | "PAID" | "FAILED"
  verificationToken?: string | null
  qr?: string | null
  createdAt: string
  updatedAt: string
  estimatedReadyTime: string | null
}
