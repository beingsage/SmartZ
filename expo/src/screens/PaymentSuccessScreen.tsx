import React, { useEffect, useState } from "react"
import { View, Text, ActivityIndicator, StyleSheet, Alert } from "react-native"
import { paymentApi } from "../services/api"
import { useCartStore } from "../store/cart.store"
import { useNavigation } from "@react-navigation/native"

export default function PaymentSuccessScreen({ route }: any) {
  const [isLoading, setIsLoading] = useState(true)
  const navigation = useNavigation()

  useEffect(() => {
    const search = typeof window !== "undefined" ? window.location.search : ""
    const params = new URLSearchParams(search)
    const sessionId = params.get("session_id")

    const confirm = async () => {
      if (!sessionId) {
        Alert.alert("Missing session id")
        navigation.navigate("Home" as any)
        return
      }

      try {
        const res = await paymentApi.confirm(sessionId)
        if (res.success) {
          // Clear cart after confirmed payment
          useCartStore.getState().clearCart()
          navigation.replace("OrderStatus" as any, { orderId: res.orderId })
        } else {
          Alert.alert("Payment not completed", res.message || "")
          navigation.navigate("Home" as any)
        }
      } catch (err: any) {
        Alert.alert("Error confirming payment", err.message || "")
        navigation.navigate("Home" as any)
      } finally {
        setIsLoading(false)
      }
    }

    confirm()
  }, [])

  return (
    <View style={styles.center}>
      {isLoading ? <ActivityIndicator size="large" color="#3b82f6" /> : <Text>Redirecting...</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
})
