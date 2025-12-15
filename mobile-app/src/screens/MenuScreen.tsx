"use client"

import { useEffect, useState } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native"
import { menuApi } from "../services/api"
import { useCartStore } from "../store/cart.store"
import type { MenuItem } from "../types"

export default function MenuScreen({ route, navigation }: any) {
  const { vendorId, vendorName } = route.params
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { addItem, getItemCount } = useCartStore()

  useEffect(() => {
    loadMenu()
  }, [])

  const loadMenu = async () => {
    try {
      const data = await menuApi.getByVendor(vendorId)
      setMenuItems(data)
    } catch (error) {
      Alert.alert("Error", "Failed to load menu")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = (item: MenuItem) => {
    if (!item.isAvailable) {
      Alert.alert("Unavailable", "This item is currently unavailable")
      return
    }

    try {
      addItem(item, 1)
      Alert.alert("Added to Cart", `${item.name} added to cart`)
    } catch (error: any) {
      Alert.alert("Error", error.message)
    }
  }

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <View style={styles.menuItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
        <View style={styles.itemMeta}>
          <Text style={styles.price}>₹{item.price}</Text>
          <Text style={styles.prepTime}>⏱ {item.preparationTime} min</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.addButton, !item.isAvailable && styles.disabledButton]}
        onPress={() => handleAddToCart(item)}
        disabled={!item.isAvailable}
      >
        <Text style={styles.addButtonText}>{item.isAvailable ? "Add +" : "N/A"}</Text>
      </TouchableOpacity>
    </View>
  )

  const cartCount = getItemCount()

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={menuItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.header}>{vendorName} Menu</Text>}
      />

      {cartCount > 0 && (
        <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate("Cart")}>
          <Text style={styles.cartButtonText}>View Cart ({cartCount} items)</Text>
        </TouchableOpacity>
      )}
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
  list: {
    padding: 16,
    gap: 12,
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  menuItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemInfo: {
    flex: 1,
    gap: 6,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  itemDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  itemMeta: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3b82f6",
  },
  prepTime: {
    fontSize: 14,
    color: "#6b7280",
  },
  addButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: "#9ca3af",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  cartButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  cartButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})
