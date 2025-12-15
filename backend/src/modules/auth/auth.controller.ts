import type { Request, Response } from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid"
import db from "../../database/db"
import type { User } from "../../types"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone } = req.body

    if (!email || !password || !name || !phone) {
      return res.status(400).json({ message: "All fields are required" })
    }

    const existingUser = db.prepare("SELECT * FROM users WHERE email = ?").get(email)

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const userId = uuidv4()

    db.prepare(`
      INSERT INTO users (id, email, password, name, phone, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, email, hashedPassword, name, phone, new Date().toISOString())

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })

    const user = db.prepare("SELECT id, email, name, phone FROM users WHERE id = ?").get(userId) as Omit<
      User,
      "password"
    >

    res.status(201).json({ token, user })
  } catch (error) {
    console.error("Register error:", error)
    res.status(500).json({ message: "Registration failed" })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" })
    }

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as User | undefined

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" })

    const { password: _, ...userWithoutPassword } = user

    res.json({ token, user: userWithoutPassword })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Login failed" })
  }
}

export const getProfile = (req: Request & { userId?: string }, res: Response) => {
  try {
    const user = db.prepare("SELECT id, email, name, phone FROM users WHERE id = ?").get(req.userId) as
      | Omit<User, "password">
      | undefined

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ message: "Failed to fetch profile" })
  }
}
