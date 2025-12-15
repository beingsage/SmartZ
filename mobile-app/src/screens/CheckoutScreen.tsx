"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from "react-native"
import { useCartStore } from "../store/cart.store"
import { useOrderStore } from "../store/order.store"
import { paymentApi } from "../services/api"
import socketService from "../services/socket"

export default function CheckoutScreen({ navigation }: any) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "cash">("card")
  const { items, vendorId, getTotalAmount, clearCart } = useCartStore()
  const { createOrder } = useOrderStore()

  const handlePlaceOrder = async () => {
    setIsProcessing(true)

    try {
      const orderData = {
        vendorId: vendorId!,
        items: items.map((item) => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
        })),
        totalAmount: getTotalAmount(),
      }

      const order = await createOrder(orderData)

      const paymentResult = await paymentApi.process({
        orderId: order.id,
        amount: getTotalAmount(),
        paymentMethod,
      })

      if (paymentResult.success) {
        clearCart()

        await socketService.connect()

        Alert.alert("Success", "Order placed successfully!", [
          {
            text: "Track Order",
            onPress: () => navigation.replace("OrderStatus", { orderId: order.id }),
          },
        ])
      } else {
        Alert.alert("Payment Failed", "Please try again")
      }
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to place order")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {items.map((item) => (
          <View key={item.menuItem.id} style={styles.summaryItem}>
            <Text style={styles.itemName}>
              {item.menuItem.name} x {item.quantity}
            </Text>
            <Text style={styles.itemPrice}>₹{item.menuItem.price * item.quantity}</Text>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>₹{getTotalAmount()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>

        <TouchableOpacity
          style={[styles.paymentOption, paymentMethod === "card" && styles.selectedPayment]}
          onPress={() => setPaymentMethod("card")}
        >
          <Text style={styles.paymentText}>💳 Credit/Debit Card</Text>
          {paymentMethod === "card" && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.paymentOption, paymentMethod === "upi" && styles.selectedPayment]}
          onPress={() => setPaymentMethod("upi")}
        >
          <Text style={styles.paymentText}>📱 UPI</Text>
          {paymentMethod === "upi" && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.paymentOption, paymentMethod === "cash" && styles.selectedPayment]}
          onPress={() => setPaymentMethod("cash")}
        >
          <Text style={styles.paymentText}>💵 Cash on Pickup</Text>
          {paymentMethod === "cash" && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder} disabled={isProcessing}>
        {isProcessing ? <ActivityIndicator color="#fff" /> : <Text style={styles.placeOrderText}>Place Order</Text>}
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  section: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  itemName: {
    fontSize: 14,
    color: "#6b7280",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3b82f6",
  },
  paymentOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  selectedPayment: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  paymentText: {
    fontSize: 16,
    color: "#1f2937",
  },
  checkmark: {
    fontSize: 20,
    color: "#3b82f6",
  },
  placeOrderButton: {
    backgroundColor: "#3b82f6",
    margin: 16,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  placeOrderText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
})
