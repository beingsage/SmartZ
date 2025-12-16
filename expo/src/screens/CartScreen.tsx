import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { useCartStore } from "../store/cart.store"

export default function CartScreen({ navigation }: any) {
  const { items, removeItem, updateQuantity, getTotalAmount, clearCart } = useCartStore()

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert("Empty Cart", "Please add items to cart")
      return
    }
    navigation.navigate("Checkout")
  }

  const renderCartItem = ({ item }: any) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.menuItem.name}</Text>
        <Text style={styles.price}>₹{item.menuItem.price}</Text>
      </View>

      <View style={styles.quantityControl}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => removeItem(item.menuItem.id)}>
        <Text style={styles.removeButton}>🗑️</Text>
      </TouchableOpacity>
    </View>
  )

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Browse Menu</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.menuItem.id}
        contentContainerStyle={styles.list}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalAmount}>₹{getTotalAmount()}</Text>
        </View>

        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearText}>Clear Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
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
  list: {
    padding: 16,
    gap: 12,
  },
  cartItem: {
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
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  price: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3b82f6",
  },
  quantity: {
    fontSize: 16,
    fontWeight: "600",
    minWidth: 24,
    textAlign: "center",
  },
  removeButton: {
    fontSize: 20,
    marginLeft: 12,
  },
  footer: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3b82f6",
  },
  checkoutButton: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  clearText: {
    textAlign: "center",
    color: "#ef4444",
    fontSize: 14,
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
})
