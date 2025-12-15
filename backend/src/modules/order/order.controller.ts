import type { Request, Response } from "express"
import { v4 as uuidv4 } from "uuid"
import db from "../../database/db"
import type { Order, MenuItem } from "../../types"

export const createOrder = (req: Request & { userId?: string }, res: Response) => {
  try {
    const { vendorId, items, totalAmount } = req.body
    const userId = req.userId

    if (!userId || !vendorId || !items || !totalAmount) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    const orderId = uuidv4()
    const now = new Date().toISOString()

    const menuItems = db
      .prepare(`SELECT * FROM menu_items WHERE id IN (${items.map(() => "?").join(",")})`)
      .all(...items.map((item: any) => item.menuItemId)) as MenuItem[]

    const orderItems = items.map((item: any) => {
      const menuItem = menuItems.find((mi) => mi.id === item.menuItemId)
      return {
        menuItemId: item.menuItemId,
        menuItemName: menuItem?.name || "Unknown",
        quantity: item.quantity,
        price: menuItem?.price || 0,
      }
    })

    const maxPrepTime = Math.max(...menuItems.map((item) => item.preparationTime), 15)
    const estimatedReadyTime = new Date(Date.now() + maxPrepTime * 60 * 1000).toISOString()

    db.prepare(`
      INSERT INTO orders (id, userId, vendorId, items, totalAmount, status, paymentStatus, createdAt, updatedAt, estimatedReadyTime)
      VALUES (?, ?, ?, ?, ?, 'PLACED', 'PENDING', ?, ?, ?)
    `).run(orderId, userId, vendorId, JSON.stringify(orderItems), totalAmount, now, now, estimatedReadyTime)

    const order = {
      id: orderId,
      userId,
      vendorId,
      items: orderItems,
      totalAmount,
      status: "PLACED",
      paymentStatus: "PENDING",
      createdAt: now,
      updatedAt: now,
      estimatedReadyTime,
    }

    res.status(201).json(order)
  } catch (error) {
    console.error("Create order error:", error)
    res.status(500).json({ message: "Failed to create order" })
  }
}

export const getOrderById = (req: Request & { userId?: string }, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.userId

    const order = db.prepare("SELECT * FROM orders WHERE id = ? AND userId = ?").get(id, userId) as Order | undefined

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    const orderWithItems = {
      ...order,
      items: JSON.parse(order.items),
    }

    res.json(orderWithItems)
  } catch (error) {
    console.error("Get order error:", error)
    res.status(500).json({ message: "Failed to fetch order" })
  }
}

export const getMyOrders = (req: Request & { userId?: string }, res: Response) => {
  try {
    const userId = req.userId

    const orders = db.prepare("SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC").all(userId) as Order[]

    const ordersWithItems = orders.map((order) => ({
      ...order,
      items: JSON.parse(order.items),
    }))

    res.json(ordersWithItems)
  } catch (error) {
    console.error("Get orders error:", error)
    res.status(500).json({ message: "Failed to fetch orders" })
  }
}
