import type { Request, Response } from "express"
import { v4 as uuidv4 } from "uuid"
import db from "../../database/db"

export const processPayment = async (req: Request, res: Response) => {
  try {
    const { orderId, amount, paymentMethod } = req.body

    if (!orderId || !amount || !paymentMethod) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    await new Promise((resolve) => setTimeout(resolve, 1500))

    const success = Math.random() > 0.05

    if (success) {
      db.prepare(`
        UPDATE orders 
        SET paymentStatus = 'PAID', status = 'CONFIRMED', updatedAt = ?
        WHERE id = ?
      `).run(new Date().toISOString(), orderId)

      res.json({
        success: true,
        transactionId: uuidv4(),
      })
    } else {
      db.prepare(`
        UPDATE orders 
        SET paymentStatus = 'FAILED', updatedAt = ?
        WHERE id = ?
      `).run(new Date().toISOString(), orderId)

      res.status(400).json({
        success: false,
        message: "Payment failed",
      })
    }
  } catch (error) {
    console.error("Payment error:", error)
    res.status(500).json({ message: "Payment processing failed" })
  }
}
