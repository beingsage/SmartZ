import type { Request, Response } from "express"
import db from "../../database/db"
import type { Vendor } from "../../types"

export const getAllVendors = (req: Request, res: Response) => {
  try {
    const vendors = db.prepare("SELECT * FROM vendors ORDER BY rating DESC").all() as Vendor[]

    res.json(vendors)
  } catch (error) {
    console.error("Get vendors error:", error)
    res.status(500).json({ message: "Failed to fetch vendors" })
  }
}

export const getVendorById = (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const vendor = db.prepare("SELECT * FROM vendors WHERE id = ?").get(id) as Vendor | undefined

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" })
    }

    res.json(vendor)
  } catch (error) {
    console.error("Get vendor error:", error)
    res.status(500).json({ message: "Failed to fetch vendor" })
  }
}
