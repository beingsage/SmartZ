import db from "../../database/db"
import type { Order } from "../../types"
import type { Server as SocketServer } from "socket.io"

const statusFlow = ["CONFIRMED", "PREPARING", "READY", "COMPLETED"] as const

export const startOrderSimulator = (io: SocketServer) => {
  setInterval(() => {
    const orders = db
      .prepare(`
        SELECT * FROM orders 
        WHERE status IN ('CONFIRMED', 'PREPARING', 'READY') 
        AND paymentStatus = 'PAID'
      `)
      .all() as Order[]

    orders.forEach((order) => {
      const currentStatusIndex = statusFlow.indexOf(order.status as any)

      if (currentStatusIndex >= 0 && currentStatusIndex < statusFlow.length - 1) {
        const shouldProgress = Math.random() > 0.5

        if (shouldProgress) {
          const nextStatus = statusFlow[currentStatusIndex + 1]

          db.prepare(`
            UPDATE orders 
            SET status = ?, updatedAt = ?
            WHERE id = ?
          `).run(nextStatus, new Date().toISOString(), order.id)

          const updatedOrder = db.prepare("SELECT * FROM orders WHERE id = ?").get(order.id) as Order

          const orderWithItems = {
            ...updatedOrder,
            items: JSON.parse(updatedOrder.items),
          }

          console.log(`[v0] Order ${order.id} updated to ${nextStatus}`)

          io.emit("order-status-update", orderWithItems)
        }
      }
    })
  }, 8000)
}
