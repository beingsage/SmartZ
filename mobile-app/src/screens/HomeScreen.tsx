"use client"

import { useEffect, useState } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native"
import { vendorApi } from "../services/api"
import { useAuthStore } from "../store/auth.store"
import type { Vendor } from "../types"

export default function HomeScreen({ navigation }: any) {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, logout } = useAuthStore()

  useEffect(() => {
    console.log("[HomeScreen] mounted")
    loadVendors()
  }, [])

  const loadVendors = async () => {
    try {
      const data = await vendorApi.getAll()
      setVendors(data)
    } catch (error) {
      console.error("Failed to load vendors:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderVendor = ({ item }: { item: Vendor }) => (
    <TouchableOpacity
      style={styles.vendorCard}
      onPress={() => navigation.navigate("Menu", { vendorId: item.id, vendorName: item.name })}
    >
      <View style={styles.vendorInfo}>
        <Text style={styles.vendorName}>{item.name}</Text>
        <Text style={styles.vendorDescription}>{item.description}</Text>
        <View style={styles.vendorMeta}>
          <Text style={styles.rating}>⭐ {item.rating.toFixed(1)}</Text>
          <Text style={[styles.status, !item.isOpen && styles.closed]}>{item.isOpen ? "🟢 Open" : "🔴 Closed"}</Text>
        </View>
        <Text style={styles.hours}>
          {item.openTime} - {item.closeTime}
        </Text>
      </View>
    </TouchableOpacity>
  )

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name}!</Text>
          <Text style={styles.subtitle}>Choose a cafeteria to order from</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("OrderHistory")}>
            <Text style={styles.iconText}>📋</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Profile")}>
            <Text style={styles.iconText}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={vendors}
        renderItem={renderVendor}
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
  header: {
    backgroundColor: "#fff",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 20,
  },
  list: {
    padding: 16,
    gap: 16,
  },
  vendorCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vendorInfo: {
    gap: 8,
  },
  vendorName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
  },
  vendorDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  vendorMeta: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  rating: {
    fontSize: 14,
    color: "#1f2937",
  },
  status: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "500",
  },
  closed: {
    color: "#ef4444",
  },
  hours: {
    fontSize: 12,
    color: "#9ca3af",
  },
})
