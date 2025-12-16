import { io, type Socket } from "socket.io-client"
import { SOCKET_URL } from "../config/api"
import AsyncStorage from "@react-native-async-storage/async-storage"

class SocketService {
  private socket: Socket | null = null

  async connect() {
    const token = await AsyncStorage.getItem("token")

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ["websocket"],
    })

    this.socket.on("connect", () => {
      console.log("[v0] Socket connected")
    })

    this.socket.on("disconnect", () => {
      console.log("[v0] Socket disconnected")
    })

    return this.socket
  }

  onOrderUpdate(callback: (order: any) => void) {
    if (this.socket) {
      this.socket.on("order-status-update", callback)
    }
  }

  offOrderUpdate() {
    if (this.socket) {
      this.socket.off("order-status-update")
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  getSocket() {
    return this.socket
  }
}

export default new SocketService()
