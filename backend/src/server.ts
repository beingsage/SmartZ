import express from "express"
import cors from "cors"
import { createServer } from "http"
import { Server as SocketServer } from "socket.io"
import dotenv from "dotenv"
import { authenticate } from "./middleware/auth"
import * as authController from "./modules/auth/auth.controller"
import * as vendorController from "./modules/vendor/vendor.controller"
import * as menuController from "./modules/menu/menu.controller"
import * as orderController from "./modules/order/order.controller"
import * as paymentController from "./modules/payment/payment.controller"
import { startOrderSimulator } from "./modules/order/order.simulator"

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new SocketServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

app.use(cors())
// Keep json parser globally, but webhook needs raw body for Stripe signature verification
app.use(express.json())

app.post("/api/auth/register", authController.register)
app.post("/api/auth/login", authController.login)
app.get("/api/auth/profile", authenticate, authController.getProfile)

app.get("/api/vendors", authenticate, vendorController.getAllVendors)
app.get("/api/vendors/:id", authenticate, vendorController.getVendorById)

app.get("/api/menu/:vendorId", authenticate, menuController.getMenuByVendor)

app.post("/api/orders", authenticate, orderController.createOrder)
app.get("/api/orders/:id", authenticate, orderController.getOrderById)
app.get("/api/orders/my", authenticate, orderController.getMyOrders)

// Worker verification endpoint (e.g., scan QR and POST { orderId, token })
app.post("/api/orders/verify", orderController.verifyOrder)
app.post("/api/orders/:id/resend-qr", authenticate, orderController.resendQr)
app.post("/api/orders/:id/cancel", authenticate, orderController.cancelOrder)

app.post("/api/payments/process", authenticate, paymentController.processPayment)
app.post("/api/payments/create-checkout-session", authenticate, paymentController.createCheckoutSession)
app.post("/api/payments/confirm", paymentController.confirmPayment)

// Stripe webhook endpoint (use express.raw to keep raw body for signature verification)
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  // @ts-ignore - handled as raw
  paymentController.handleWebhook,
)

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

io.on("connection", (socket) => {
  console.log("[v0] Client connected:", socket.id)

  socket.on("disconnect", () => {
    console.log("[v0] Client disconnected:", socket.id)
  })
})

startOrderSimulator(io)

const PORT = process.env.PORT || 3000

httpServer.listen(PORT, () => {
  console.log(`\n🚀 SmartQ Backend Server Running`)
  console.log(`📡 HTTP Server: http://localhost:${PORT}`)
  console.log(`🔌 WebSocket Server: ws://localhost:${PORT}`)
  console.log(`💾 Database: SQLite (smartq.db)`)
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("⚠️  STRIPE_SECRET_KEY not configured - Stripe payments disabled or limited")
  }
  console.log("\n✅ Ready to accept connections\n")
})
