import type { Request, Response } from "express"
import { v4 as uuidv4 } from "uuid"
import db from "../../database/db"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2022-11-15" })

// Webhook handler to process Stripe events (checkout.session.completed, payment_intent.payment_failed, etc.)
export const handleWebhook = async (req: any, res: any) => {
  try {
    const signingSecret = process.env.STRIPE_WEBHOOK_SECRET
    const sig = req.headers["stripe-signature"]

    let event

    if (signingSecret) {
      // When a signing secret is configured, construct and verify event
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, signingSecret)
      } catch (err: any) {
        console.error("⚠️  Webhook signature verification failed.", err.message)
        return res.status(400).send(`Webhook Error: ${err.message}`)
      }
    } else {
      // No signing secret configured (dev): parse JSON
      event = req.body
    }

    console.log("[webhook] Received event:", event.type)

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        const orderId = session.metadata?.orderId
        if (orderId) {
          db.prepare(`
            UPDATE orders
            SET paymentStatus = 'PAID', status = 'CONFIRMED', updatedAt = ?
            WHERE id = ?
          `).run(new Date().toISOString(), orderId)
          console.log(`[webhook] Order ${orderId} marked PAID via checkout.session.completed`)
        }
        break
      }
      case "payment_intent.payment_failed":
      case "checkout.session.async_payment_failed": {
        const obj = event.data.object
        const orderId = obj.metadata?.orderId || (obj.payment_intent && obj.payment_intent.metadata?.orderId)
        if (orderId) {
          db.prepare(`
            UPDATE orders
            SET paymentStatus = 'FAILED', updatedAt = ?
            WHERE id = ?
          `).run(new Date().toISOString(), orderId)
          console.log(`[webhook] Order ${orderId} marked FAILED via ${event.type}`)
        }
        break
      }
      default:
        // unhandled events kept intentionally quiet
        break
    }

    res.json({ received: true })
  } catch (err) {
    console.error("Webhook processing error:", err)
    res.status(500).send("Webhook handler error")
  }
}

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

// Create a Stripe Checkout session for the order
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(501).json({ message: "Stripe not configured on server" })
    }
    const { orderId, amount, success_url, cancel_url } = req.body

    if (!orderId || !amount) {
      return res.status(400).json({ message: "orderId and amount are required" })
    }

    // Create session with amount in cents
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Order ${orderId}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: success_url || `${process.env.CLIENT_URL || "http://localhost:19006"}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${process.env.CLIENT_URL || "http://localhost:19006"}/cancel`,
      metadata: { orderId },
    })

    console.log(`[payments] Created checkout session ${session.id} for order ${orderId}`)
    res.json({ url: session.url, id: session.id })
  } catch (error) {
    console.error("Create checkout session error:", error)
    res.status(500).json({ message: "Failed to create checkout session" })
  }
}

// Endpoint to confirm payment (can be called after redirect or via webhook)
export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body
    if (!sessionId) return res.status(400).json({ message: "sessionId is required" })

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status === "paid") {
      const orderId = session.metadata?.orderId
      db.prepare(`
        UPDATE orders 
        SET paymentStatus = 'PAID', status = 'CONFIRMED', updatedAt = ?
        WHERE id = ?
      `).run(new Date().toISOString(), orderId)

      res.json({ success: true, orderId })
    } else {
      res.status(400).json({ success: false, message: "Payment not complete" })
    }
  } catch (error) {
    console.error("Confirm payment error:", error)
    res.status(500).json({ message: "Failed to confirm payment" })
  }
}
