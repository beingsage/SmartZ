"use client"

import { useEffect } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { useAuthStore } from "./src/store/auth.store"
import LoginScreen from "./src/screens/LoginScreen"
import RegisterScreen from "./src/screens/RegisterScreen"
import HomeScreen from "./src/screens/HomeScreen"
import MenuScreen from "./src/screens/MenuScreen"
import CartScreen from "./src/screens/CartScreen"
import CheckoutScreen from "./src/screens/CheckoutScreen"
import OrderStatusScreen from "./src/screens/OrderStatusScreen"
import OrderHistoryScreen from "./src/screens/OrderHistoryScreen"
import ProfileScreen from "./src/screens/ProfileScreen"

const Stack = createNativeStackNavigator()

export default function FullApp() {
  const { user, loadUser } = useAuthStore()

  useEffect(() => {
    // Load user and log errors if any
    loadUser().catch((err: any) => console.error("[FullApp] loadUser error:", err))
  }, [])

  // Debugging: heartbeat logger to help find where the app gets stuck (prints to Metro / browser console)
  useEffect(() => {
    console.log("[FullApp] mounted - starting heartbeat logs")

    // global error handlers (web + native)
    try {
      if (typeof window !== "undefined") {
        window.addEventListener("error", (e) => {
          console.error("[Global] window error:", e.error ?? e.message ?? e)
        })
        window.addEventListener("unhandledrejection", (e: any) => {
          console.error("[Global] unhandledrejection:", e.reason ?? e)
        })
      }
    } catch (err) {
      // ignore if not supported
    }

    // periodic heartbeat log so we can tell whether JS is running and what `user` contains
    const id = setInterval(() => {
      try {
        console.log("[FullApp][heartbeat] user:", user)
      } catch (err) {
        console.error("[FullApp][heartbeat] error:", err)
      }
    }, 3000)

    return () => {
      clearInterval(id)
      console.log("[FullApp] unmounted - stopped heartbeat logs")
    }
  }, [user])

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: "#3b82f6",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "600",
          },
        }}
      >
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Create Account" }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: "SmartQ - Order Food" }} />
            <Stack.Screen name="Menu" component={MenuScreen} options={{ title: "Menu" }} />
            <Stack.Screen name="Cart" component={CartScreen} options={{ title: "Your Cart" }} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: "Checkout" }} />
            <Stack.Screen name="OrderStatus" component={OrderStatusScreen} options={{ title: "Order Status" }} />
            <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} options={{ title: "Order History" }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
