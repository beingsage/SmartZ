"use client"

import { useEffect } from "react"
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, TouchableOpacity, Alert, Linking } from "react-native"
import { paymentApi } from "../services/api"
import api from "../services/api"
import { useOrderStore } from "../../../expo/src/store/order.store"
import socketService from "../services/socket"

const statusSteps = {
  PLACED: { label: "Order Placed", icon: "✓", step: 1 },
  CONFIRMED: { label: "Confirmed", icon: "✓", step: 2 },
  PREPARING: { label: "Preparing", icon: "👨‍🍳", step: 3 },
  READY: { label: "Ready for Pickup", icon: "✓", step: 4 },
  COMPLETED: { label: "Completed", icon: "🎉", step: 5 },
}

export default function OrderStatusScreen({ route, navigation }: any) {
  const { orderId } = route.params
  const { currentOrder, fetchOrder, updateOrderStatus } = useOrderStore()

  useEffect(() => {
    loadOrder()
    setupSocketListener()

    return () => {
      socketService.offOrderUpdate()
    }
  }, [orderId])

  const loadOrder = async () => {
    await fetchOrder(orderId)
  }

  const setupSocketListener = () => {
    socketService.onOrderUpdate((updatedOrder) => {
      console.log("[v0] Order update received:", updatedOrder)
      if (updatedOrder.id === orderId) {
        updateOrderStatus(updatedOrder)
      }
    })
  }

  if (!currentOrder) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    )
  }

  const currentStep = statusSteps[currentOrder.status as keyof typeof statusSteps]?.step || 1

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Home")}>
        <Text style={styles.backText}>← Home</Text>
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.orderId}>Order #{currentOrder.id.slice(-6)}</Text>
        <Text style={styles.status}>{statusSteps[currentOrder.status as keyof typeof statusSteps]?.label}</Text>
      </View>

      <View style={styles.timeline}>
        {Object.entries(statusSteps).map(([key, value]) => (
          <View key={key} style={styles.timelineItem}>
            <View style={[styles.timelineIcon, value.step <= currentStep && styles.activeIcon]}>
              <Text style={styles.iconText}>{value.icon}</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineLabel, value.step <= currentStep && styles.activeLabel]}>{value.label}</Text>
            </View>
            {key !== "COMPLETED" && (
              <View style={[styles.timelineLine, value.step < currentStep && styles.activeLine]} />
            )}
          </View>
        ))}
      </View>

      <View style={styles.details}>
        <Text style={styles.detailsTitle}>Order Details</Text>
        {currentOrder.items.map((item, index) => (
          <View key={index} style={styles.detailItem}>
            <Text style={styles.detailName}>
              {item.menuItemName} x {item.quantity}
            </Text>
            <Text style={styles.detailPrice}>₹{item.price * item.quantity}</Text>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>₹{currentOrder.totalAmount}</Text>
        </View>
        <View style={styles.actionsRow}>
          {/* Payment status and retry */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Text style={{ fontWeight: "700" }}>Payment: </Text>
            <Text style={{ color: currentOrder.paymentStatus === "PAID" ? "#10b981" : currentOrder.paymentStatus === "FAILED" ? "#ef4444" : "#6b7280", fontWeight: "700" }}>{currentOrder.paymentStatus}</Text>
          </View>

          {currentOrder.paymentStatus === "FAILED" && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={async () => {
                try {
                  const session = await paymentApi.createCheckoutSession({ orderId: currentOrder.id, amount: currentOrder.totalAmount })
                  if (session?.url) {
                    Linking.openURL(session.url)
                  }
                } catch (err: any) {
                  Alert.alert("Error", err.response?.data?.message || "Failed to start payment")
                }
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Retry Payment</Text>
            </TouchableOpacity>
          )}

          {currentOrder.qr && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={async () => {
                try {
                  const res = await api.post(`/orders/${currentOrder.id}/resend-qr`)
                  Alert.alert("QR refreshed")
                  await fetchOrder(currentOrder.id)
                } catch (err: any) {
                  Alert.alert("Error", err.response?.data?.message || "Failed to refresh QR")
                }
              }}
            >
              <Text style={{ color: "#111827", fontWeight: "700" }}>Refresh QR</Text>
            </TouchableOpacity>
          )}

          {currentOrder.status === "PLACED" && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={async () => {
                try {
                  await api.post(`/orders/${currentOrder.id}/cancel`)
                  Alert.alert("Cancelled", "Order cancelled successfully")
                  await fetchOrder(currentOrder.id)
                } catch (err: any) {
                  Alert.alert("Error", err.response?.data?.message || "Failed to cancel order")
                }
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Cancel Order</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {currentOrder.qr && (
        <View style={styles.qrCard}>
          <Text style={styles.qrLabel}>Show this QR at pickup</Text>
          <Image source={{ uri: currentOrder.qr }} style={styles.qrImage} />
        </View>
      )}

      {currentOrder.estimatedReadyTime && (
        <View style={styles.estimateCard}>
          <Text style={styles.estimateLabel}>Estimated Ready Time</Text>
          <Text style={styles.estimateTime}>{new Date(currentOrder.estimatedReadyTime).toLocaleTimeString()}</Text>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  orderId: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
  },
  status: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3b82f6",
    marginTop: 8,
  },
  timeline: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  timelineItem: {
    position: "relative",
    marginBottom: 24,
  },
  timelineIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  activeIcon: {
    backgroundColor: "#3b82f6",
  },
  iconText: {
    fontSize: 20,
  },
  timelineContent: {
    marginLeft: 8,
  },
  timelineLabel: {
    fontSize: 16,
    color: "#9ca3af",
  },
  activeLabel: {
    color: "#1f2937",
    fontWeight: "600",
  },
  timelineLine: {
    position: "absolute",
    left: 23,
    top: 48,
    width: 2,
    height: 40,
    backgroundColor: "#e5e7eb",
  },
  activeLine: {
    backgroundColor: "#3b82f6",
  },
  details: {
    backgroundColor: "#fff",
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    gap: 12,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  detailName: {
    fontSize: 14,
    color: "#6b7280",
  },
  detailPrice: {
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
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3b82f6",
  },
  estimateCard: {
    backgroundColor: "#eff6ff",
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  estimateLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  estimateTime: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3b82f6",
    marginTop: 4,
  },
  qrCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  qrLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  backButton: {
    padding: 12,
    margin: 16,
  },
  backText: {
    color: "#111827",
    fontWeight: "600",
  },
  actionsRow: { marginHorizontal: 16, flexDirection: "row", gap: 12, alignItems: "center", marginTop: 12 },
  retryButton: { backgroundColor: "#f59e0b", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  secondaryButton: { backgroundColor: "#f3f4f6", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  cancelButton: { backgroundColor: "#ef4444", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
})
