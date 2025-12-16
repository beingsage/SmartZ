import type { Request, Response } from "express"
import { v4 as uuidv4 } from "uuid"
import QRCode from "qrcode"
import db from "../../database/db"
import type { Order, MenuItem } from "../../types"

export const createOrder = async (req: Request & { userId?: string }, res: Response) => {
  try {
    const { vendorId, items, totalAmount } = req.body
    const userId = req.userId

    const amountNum = Number(totalAmount)
    if (!userId || !vendorId || !Array.isArray(items) || items.length === 0 || isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ message: "Missing or invalid required fields" })
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

    // Verify total on server to prevent client mismatch/tampering
    const serverTotal = orderItems.reduce((s, it) => s + (it.price || 0) * (it.quantity || 0), 0)
    if (Math.abs(serverTotal - amountNum) > 0.01) {
      return res.status(400).json({ message: `Total mismatch: expected ${serverTotal}, got ${totalAmount}` })
    }

    const maxPrepTime = Math.max(...menuItems.map((item) => item.preparationTime), 15)
    const estimatedReadyTime = new Date(Date.now() + maxPrepTime * 60 * 1000).toISOString()

    // create a verification token and QR payload
    const verificationToken = uuidv4()
    const qrPayload = JSON.stringify({ orderId, verificationToken })
    const qrDataUrl = await QRCode.toDataURL(qrPayload)

    db.prepare(`
      INSERT INTO orders (id, userId, vendorId, items, totalAmount, status, paymentStatus, verificationToken, createdAt, updatedAt, estimatedReadyTime)
      VALUES (?, ?, ?, ?, ?, 'PLACED', 'PENDING', ?, ?, ?, ?)
    `).run(orderId, userId, vendorId, JSON.stringify(orderItems), serverTotal, verificationToken, now, now, estimatedReadyTime)

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
      qr: qrDataUrl,
    }

    res.status(201).json(order)
  } catch (error) {
    console.error("Create order error:", error)
    res.status(500).json({ message: "Failed to create order" })
  }
}

export const verifyOrder = (req: Request, res: Response) => {
  try {
    const { orderId, token } = req.body

    if (!orderId) {
      return res.status(400).json({ message: "orderId is required" })
    }

    const order: any = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId)

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    if (token) {
      if (order.verificationToken !== token) {
        return res.status(401).json({ message: "Invalid verification token" })
      }
    } else {
      // Allow verification without token in non-production for easier local testing
      if (process.env.NODE_ENV === "production") {
        return res.status(400).json({ message: "token is required in production" })
      }
    }

    // Mark as CONFIRMED if currently PLACED, otherwise respond with current status
    const newStatus = order.status === "PLACED" ? "CONFIRMED" : order.status

    db.prepare("UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?").run(newStatus, new Date().toISOString(), orderId)

    res.json({ success: true, status: newStatus })
  } catch (error) {
    console.error("Verify order error:", error)
    res.status(500).json({ message: "Failed to verify order" })
  }
}

export const getOrderById = async (req: Request & { userId?: string }, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.userId
    const order = db.prepare("SELECT * FROM orders WHERE id = ? AND userId = ?").get(id, userId) as Order | undefined

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    const items = JSON.parse(order.items)
    const qr = order.verificationToken ? await QRCode.toDataURL(JSON.stringify({ orderId: order.id, verificationToken: order.verificationToken })) : null

    const orderWithItems = {
      ...order,
      items,
      qr,
    }

    res.json(orderWithItems)
  } catch (error) {
    console.error("Get order error:", error)
    res.status(500).json({ message: "Failed to fetch order" })
  }
}

export const getMyOrders = async (req: Request & { userId?: string }, res: Response) => {
  try {
    const userId = req.userId

    const orders = db.prepare("SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC").all(userId) as Order[]

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => ({
        ...order,
        items: JSON.parse(order.items),
        qr: order.verificationToken ? await QRCode.toDataURL(JSON.stringify({ orderId: order.id, verificationToken: order.verificationToken })) : null,
      })),
    )

    res.json(ordersWithItems)
  } catch (error) {
    console.error("Get orders error:", error)
    res.status(500).json({ message: "Failed to fetch orders" })
  }
}

// Regenerate verification token and return a fresh QR (useful when QR is lost or needs refresh)
export const resendQr = async (req: Request & { userId?: string }, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.userId

    const order: any = db.prepare("SELECT * FROM orders WHERE id = ? AND userId = ?").get(id, userId)
    if (!order) return res.status(404).json({ message: "Order not found" })

    const newToken = uuidv4()
    db.prepare("UPDATE orders SET verificationToken = ?, updatedAt = ? WHERE id = ?").run(newToken, new Date().toISOString(), id)

    const qr = await QRCode.toDataURL(JSON.stringify({ orderId: id, verificationToken: newToken }))

    res.json({ success: true, qr })
  } catch (err) {
    console.error("Resend QR error:", err)
    res.status(500).json({ message: "Failed to resend QR" })
  }
}

// Cancel an order (if allowed)
export const cancelOrder = async (req: Request & { userId?: string }, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.userId

    const order: any = db.prepare("SELECT * FROM orders WHERE id = ? AND userId = ?").get(id, userId)
    if (!order) return res.status(404).json({ message: "Order not found" })

    if (order.status === "COMPLETED" || order.status === "CANCELLED") {
      return res.status(400).json({ message: "Order cannot be cancelled" })
    }

    db.prepare("UPDATE orders SET status = 'CANCELLED', updatedAt = ? WHERE id = ?").run(new Date().toISOString(), id)

    res.json({ success: true })
  } catch (err) {
    console.error("Cancel order error:", err)
    res.status(500).json({ message: "Failed to cancel order" })
  }
}
