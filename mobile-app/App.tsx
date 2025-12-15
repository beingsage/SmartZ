"use client"

import React, { useEffect, useState, Suspense, lazy } from "react"
import { View, Text, Button, StyleSheet } from "react-native"

const FullApp = lazy(() => import("./App.full"))

class ErrorBoundary extends React.Component<any, { error: any }> {
  constructor(props: any) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: any) {
    return { error }
  }

  componentDidCatch(error: any, info: any) {
    console.error("[ErrorBoundary] caught:", error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.center}>
          <Text style={{ color: "#b00020", fontWeight: "700", marginBottom: 8 }}>Error loading app</Text>
          <Text>{String(this.state.error)}</Text>
        </View>
      )
    }

    return this.props.children
  }
}

export default function App() {
  useEffect(() => console.log("[App shell] mounted"), [])
  const [loadFull, setLoadFull] = useState(false)

  return loadFull ? (
    <ErrorBoundary>
      <Suspense fallback={<View style={styles.center}><Text>Loading full app...</Text></View>}>
        <FullApp />
      </Suspense>
    </ErrorBoundary>
  ) : (
    <View style={styles.center}>
      <Text style={styles.title}>Debug Shell</Text>
      <Text style={styles.desc}>Basic app shell is running — press to load full app.</Text>
      <Button title="Load full app" onPress={() => setLoadFull(true)} />
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  desc: { marginBottom: 12, color: "#444" },
})
