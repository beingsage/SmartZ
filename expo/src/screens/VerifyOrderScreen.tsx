import React, { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native"
import api from "../services/api"
import { useNavigation } from "@react-navigation/native"

export default function VerifyOrderScreen() {
  const [orderId, setOrderId] = useState("")
  const [token, setToken] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleVerify = async () => {
    setIsLoading(true)
    try {
      const res = await api.post("/orders/verify", { orderId, token })
      Alert.alert("Verified", `Order status: ${res.data.status}`)
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Verification failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Worker Verify</Text>

      <TextInput placeholder="Order ID" value={orderId} onChangeText={setOrderId} style={styles.input} />
      <TextInput placeholder="Token" value={token} onChangeText={setToken} style={styles.input} />

      <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={isLoading}>
        <Text style={styles.buttonText}>{isLoading ? "Verifying..." : "Verify Order"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#f3f4f6', marginTop: 12 }]} onPress={() => useNavigation().navigate('VendorScan' as any)}>
        <Text style={[styles.buttonText, { color: '#111827' }]}>Scan QR instead</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9fafb",
  },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  input: { backgroundColor: "#fff", padding: 12, marginBottom: 12, borderRadius: 8 },
  button: { backgroundColor: "#3b82f6", padding: 16, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700" },
})
