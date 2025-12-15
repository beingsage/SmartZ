import type { Request, Response } from "express"
import db from "../../database/db"
import type { MenuItem } from "../../types"

export const getMenuByVendor = (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params

    const menuItems = db
      .prepare("SELECT * FROM menu_items WHERE vendorId = ? ORDER BY category, name")
      .all(vendorId) as MenuItem[]

    res.json(menuItems)
  } catch (error) {
    console.error("Get menu error:", error)
    res.status(500).json({ message: "Failed to fetch menu" })
  }
}
