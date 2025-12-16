import React, { useEffect, useState } from "react"
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from "react-native"
import { BarCodeScanner } from "expo-barcode-scanner"
import api from "../services/api"
import { useNavigation } from "@react-navigation/native"

export default function VendorScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scanned, setScanned] = useState(false)
  const navigation = useNavigation()

  useEffect(() => {
    ;(async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync()
      setHasPermission(status === "granted")
    })()
  }, [])

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return
    setScanned(true)

    // Expect QR payload to be JSON string { orderId, verificationToken }
    try {
      let payload: any = null
      try {
        payload = JSON.parse(data)
      } catch (e) {
        // sometimes data might be the orderId alone
        payload = { orderId: data }
      }

      const res = await api.post("/orders/verify", { orderId: payload.orderId, token: payload.verificationToken })

      Alert.alert("Verified", `Order status: ${res.data.status}`)
      navigation.goBack()
    } catch (err: any) {
      console.error("Scan verification error:", err)
      Alert.alert("Error", err.response?.data?.message || "Verification failed")
      // allow rescanning
      setTimeout(() => setScanned(false), 1500)
    }
  }

  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    )
  }

  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <Text>No access to camera</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vendor QR Scan</Text>
      <View style={styles.scanner}>
        <BarCodeScanner onBarCodeScanned={handleBarCodeScanned} style={{ flex: 1 }} />
      </View>
      <View style={styles.footer}>
        <Text style={styles.hint}>Point camera at customer's QR</Text>
        {scanned && (
          <TouchableOpacity style={styles.button} onPress={() => setScanned(false)}>
            <Text style={styles.buttonText}>Tap to Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "700", padding: 16 },
  scanner: { flex: 1, margin: 16, borderRadius: 12, overflow: "hidden" },
  footer: { padding: 16, alignItems: "center" },
  hint: { color: "#6b7280" },
  button: { marginTop: 12, backgroundColor: "#3b82f6", padding: 12, borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "700" },
})
