import React from 'react';

// import { SafeAreaView, StyleSheet, Text, View, StatusBar } from 'react-native';
// import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

// export default function App() {
//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" />
//       <View style={styles.content}>
//         <Text style={styles.title}>Welcome to SmartZ Expo Template</Text>
//         <Text style={styles.subtitle}>Start coding in <Text style={{fontWeight: '700'}}>App.tsx</Text> or add files in <Text style={{fontWeight: '700'}}>src/</Text></Text>
//       </View>
//       <ExpoStatusBar style="auto" />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff'
//   },
//   content: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 24
//   },
//   title: {
//     fontSize: 22,
//     marginBottom: 8,
//     textAlign: 'center'
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#666',
//     textAlign: 'center'
//   }
// });



import { useEffect } from "react"
import { StatusBar } from "expo-status-bar"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { View, ActivityIndicator } from "react-native"
import { useAuthStore } from "./src/store/auth.store"

import HomeScreen from "./src/screens/HomeScreen"
import MenuScreen from "./src/screens/MenuScreen"
import CartScreen from "./src/screens/CartScreen"
import CheckoutScreen from "./src/screens/CheckoutScreen"
import LoginScreen from "./src/screens/LoginScreen"
import RegisterScreen from "./src/screens/RegisterScreen"
import OrderHistoryScreen from "./src/screens/OrderHistoryScreen"
import OrderStatusScreen from "./src/screens/OrderStatusScreen"
import ProfileScreen from "./src/screens/ProfileScreen"
import VerifyOrderScreen from "./src/screens/VerifyOrderScreen"
import VendorScanScreen from "./src/screens/VendorScanScreen"
import PaymentSuccessScreen from "./src/screens/PaymentSuccessScreen"

const Stack = createNativeStackNavigator()

export default function App() {
  const loadUser = useAuthStore((s) => s.loadUser)
  const isAuthLoading = useAuthStore((s) => s.isLoading)

  useEffect(() => {
    console.log("[App] mounted")
    loadUser()
  }, [])

  if (isAuthLoading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </GestureHandlerRootView>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Menu" component={MenuScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="VendorScan" component={VendorScanScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
          <Stack.Screen name="OrderStatus" component={OrderStatusScreen} />
          <Stack.Screen name="Verify" component={VerifyOrderScreen} />
          <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  )
}
