import Database from "better-sqlite3"
import path from "path"
import { v4 as uuidv4 } from "uuid"

const db = new Database(path.join(__dirname, "../../smartq.db"))

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS vendors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    imageUrl TEXT,
    rating REAL DEFAULT 4.5,
    isOpen INTEGER DEFAULT 1,
    openTime TEXT NOT NULL,
    closeTime TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    vendorId TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    imageUrl TEXT,
    isAvailable INTEGER DEFAULT 1,
    preparationTime INTEGER NOT NULL,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (vendorId) REFERENCES vendors(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    vendorId TEXT NOT NULL,
    items TEXT NOT NULL,
    totalAmount REAL NOT NULL,
    status TEXT NOT NULL,
    paymentStatus TEXT NOT NULL,
    verificationToken TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    estimatedReadyTime TEXT,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (vendorId) REFERENCES vendors(id)
  );
`)

// Add column for verification token for older DBs that may not have it
try {
  db.prepare("ALTER TABLE orders ADD COLUMN verificationToken TEXT").run()
} catch (e) {
  // ignore if column already exists
}

const vendorCount = db.prepare("SELECT COUNT(*) as count FROM vendors").get() as { count: number }

if (vendorCount.count === 0) {
  console.log("Seeding database with initial data...")

  const vendors = [
    {
      id: uuidv4(),
      name: "Main Cafeteria",
      description: "Delicious home-style meals and snacks",
      rating: 4.5,
      openTime: "08:00",
      closeTime: "20:00",
    },
    {
      id: uuidv4(),
      name: "Coffee Corner",
      description: "Fresh coffee and quick bites",
      rating: 4.3,
      openTime: "07:00",
      closeTime: "22:00",
    },
    {
      id: uuidv4(),
      name: "Healthy Bites",
      description: "Nutritious and wholesome food options",
      rating: 4.7,
      openTime: "09:00",
      closeTime: "18:00",
    },
  ]

  const vendorStmt = db.prepare(`
    INSERT INTO vendors (id, name, description, imageUrl, rating, isOpen, openTime, closeTime, createdAt)
    VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
  `)

  vendors.forEach((vendor) => {
    vendorStmt.run(
      vendor.id,
      vendor.name,
      vendor.description,
      null,
      vendor.rating,
      vendor.openTime,
      vendor.closeTime,
      new Date().toISOString(),
    )
  })

  const menuItems = [
    {
      vendorId: vendors[0].id,
      name: "Veg Thali",
      description: "Complete meal with rice, roti, dal, and vegetables",
      price: 120,
      category: "Main Course",
      prepTime: 15,
    },
    {
      vendorId: vendors[0].id,
      name: "Paneer Butter Masala",
      description: "Rich and creamy paneer curry",
      price: 150,
      category: "Main Course",
      prepTime: 20,
    },
    {
      vendorId: vendors[0].id,
      name: "Chicken Biryani",
      description: "Aromatic rice with tender chicken",
      price: 180,
      category: "Main Course",
      prepTime: 25,
    },
    {
      vendorId: vendors[0].id,
      name: "Masala Dosa",
      description: "Crispy dosa with spiced potato filling",
      price: 80,
      category: "Breakfast",
      prepTime: 12,
    },
    {
      vendorId: vendors[0].id,
      name: "Chole Bhature",
      description: "Spicy chickpeas with fluffy fried bread",
      price: 100,
      category: "Breakfast",
      prepTime: 15,
    },

    {
      vendorId: vendors[1].id,
      name: "Cappuccino",
      description: "Rich espresso with steamed milk",
      price: 80,
      category: "Beverages",
      prepTime: 5,
    },
    {
      vendorId: vendors[1].id,
      name: "Cold Coffee",
      description: "Chilled coffee with ice cream",
      price: 90,
      category: "Beverages",
      prepTime: 5,
    },
    {
      vendorId: vendors[1].id,
      name: "Veg Sandwich",
      description: "Grilled sandwich with fresh vegetables",
      price: 70,
      category: "Snacks",
      prepTime: 8,
    },
    {
      vendorId: vendors[1].id,
      name: "Samosa",
      description: "Crispy pastry with spiced potato filling",
      price: 30,
      category: "Snacks",
      prepTime: 5,
    },

    {
      vendorId: vendors[2].id,
      name: "Quinoa Salad Bowl",
      description: "Healthy quinoa with fresh vegetables",
      price: 140,
      category: "Salads",
      prepTime: 10,
    },
    {
      vendorId: vendors[2].id,
      name: "Grilled Chicken Salad",
      description: "Protein-rich salad with grilled chicken",
      price: 160,
      category: "Salads",
      prepTime: 12,
    },
    {
      vendorId: vendors[2].id,
      name: "Fruit Smoothie",
      description: "Fresh fruit blended with yogurt",
      price: 100,
      category: "Beverages",
      prepTime: 5,
    },
    {
      vendorId: vendors[2].id,
      name: "Avocado Toast",
      description: "Whole grain toast with mashed avocado",
      price: 120,
      category: "Breakfast",
      prepTime: 8,
    },
  ]

  const menuStmt = db.prepare(`
    INSERT INTO menu_items (id, vendorId, name, description, price, category, imageUrl, isAvailable, preparationTime, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
  `)

  menuItems.forEach((item) => {
    menuStmt.run(
      uuidv4(),
      item.vendorId,
      item.name,
      item.description,
      item.price,
      item.category,
      null,
      item.prepTime,
      new Date().toISOString(),
    )
  })

  console.log("Database seeded successfully!")
}

export default db
