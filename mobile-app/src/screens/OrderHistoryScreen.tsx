"use client"

import { useEffect } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native"
import { useOrderStore } from "../store/order.store"
import type { Order } from "../types"

export default function OrderHistoryScreen({ navigation }: any) {
  const { orders, fetchMyOrders, isLoading } = useOrderStore()

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    await fetchMyOrders()
  }

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity style={styles.orderCard} onPress={() => navigation.navigate("OrderStatus", { orderId: item.id })}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item.id.slice(-6)}</Text>
        <Text style={[styles.status, getStatusStyle(item.status)]}>{item.status}</Text>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.itemCount}>{item.items.length} items</Text>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.amount}>₹{item.totalAmount}</Text>
        <Text style={styles.viewDetails}>View Details →</Text>
      </View>
    </TouchableOpacity>
  )

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return styles.statusCompleted
      case "READY":
        return styles.statusReady
      case "PREPARING":
        return styles.statusPreparing
      case "CANCELLED":
        return styles.statusCancelled
      default:
        return styles.statusDefault
    }
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    )
  }

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No orders yet</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Home")}>
          <Text style={styles.buttonText}>Start Ordering</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#6b7280",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 12,
    paddingHorizontal: 32,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  list: {
    padding: 16,
    gap: 12,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  status: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDefault: {
    backgroundColor: "#eff6ff",
    color: "#3b82f6",
  },
  statusPreparing: {
    backgroundColor: "#fef3c7",
    color: "#f59e0b",
  },
  statusReady: {
    backgroundColor: "#d1fae5",
    color: "#10b981",
  },
  statusCompleted: {
    backgroundColor: "#e5e7eb",
    color: "#6b7280",
  },
  statusCancelled: {
    backgroundColor: "#fee2e2",
    color: "#ef4444",
  },
  orderDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemCount: {
    fontSize: 14,
    color: "#6b7280",
  },
  date: {
    fontSize: 14,
    color: "#6b7280",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3b82f6",
  },
  viewDetails: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "500",
  },
})
