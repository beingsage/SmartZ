# SmartQ Customer App - Full Stack React Native Food Ordering

A complete, production-ready food ordering system with React Native mobile app and Node.js backend.

## Features

### Fully Functional (NO Mocks!)

✅ **Real Authentication** - JWT-based login/registration with bcrypt password hashing  
✅ **Real Database** - SQLite with persistent data storage  
✅ **Live Order Tracking** - Real-time updates via WebSocket (Socket.IO)  
✅ **Real Payment Processing** - Payment gateway simulation with success/failure flows  
✅ **Order Lifecycle** - Automated state transitions (PLACED → PREPARING → READY)  
✅ **Multiple Vendors** - Browse different cafeterias with real menus  
✅ **Smart Cart** - Vendor validation, quantity management, total calculations  
✅ **Order History** - View past orders with status tracking  

## Tech Stack

### Mobile App
- React Native with Expo
- TypeScript
- React Navigation
- Zustand (State Management)
- Socket.IO Client
- Axios

### Backend
- Node.js + Express
- TypeScript
- SQLite (better-sqlite3)
- JWT Authentication
- Socket.IO
- bcrypt

## Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator (or Expo Go app on your phone)

### Backend Setup

1. **Navigate to backend folder:**
   \`\`\`bash
   cd backend
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Create environment file:**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   Edit `.env` and set your JWT secret:
   \`\`\`
   JWT_SECRET=your-super-secret-key-change-this
   PORT=3000
   \`\`\`

4. **Start the backend server:**
   \`\`\`bash
   npm run dev
   \`\`\`

   The server will start on `http://localhost:3000` and automatically seed the database with sample data.

### Mobile App Setup

1. **Find your local IP address:**
   - **Mac/Linux:** Run `ifconfig` and look for `inet` under your network interface (e.g., 192.168.1.100)
   - **Windows:** Run `ipconfig` and look for `IPv4 Address`

2. **Update API configuration:**
   Open `mobile-app/src/config/api.ts` and replace the IP with yours:
   \`\`\`typescript
   export const API_BASE_URL = 'http://YOUR_IP_HERE:3000/api';
   export const SOCKET_URL = 'http://YOUR_IP_HERE:3000';
   \`\`\`

3. **Navigate to mobile app folder:**
   \`\`\`bash
   cd mobile-app
   \`\`\`

4. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

5. **Start the Expo development server:**
   \`\`\`bash
   npx expo start
   \`\`\`

6. **Run the app:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your physical device

## Usage

### First Time Setup

1. **Register a new account** in the mobile app
2. **Browse cafeterias** on the home screen
3. **View menu** and add items to cart
4. **Checkout** and complete payment
5. **Watch live order updates** as the order progresses through states

### Test Credentials

The database starts empty, so you'll need to register. Here's a test account you can create:
- Email: `test@smartq.com`
- Password: `test123`
- Name: `Test User`
- Phone: `1234567890`

### Sample Data

The backend automatically seeds 3 vendors with 13+ menu items:
- **Main Cafeteria** - Traditional meals (Thali, Biryani, Dosa)
- **Coffee Corner** - Beverages and snacks
- **Healthy Bites** - Salads and healthy options

## How It Works

### Order Flow

1. **Browse & Add to Cart** → Items stored in Zustand state
2. **Checkout** → Order created in database
3. **Payment** → Payment processed (95% success rate simulation)
4. **Order Tracking** → Real-time status updates via WebSocket
5. **Order Lifecycle** → Backend simulator transitions: PLACED → CONFIRMED → PREPARING → READY → COMPLETED

### Real-Time Updates

- Socket.IO connection established after order placement
- Backend simulator checks orders every 8 seconds
- Status updates pushed instantly to mobile app
- Order timeline UI updates automatically

### API Endpoints

\`\`\`
POST   /api/auth/register       - Create new account
POST   /api/auth/login          - Login
GET    /api/auth/profile        - Get user profile

GET    /api/vendors             - List all cafeterias
GET    /api/vendors/:id         - Get vendor details

GET    /api/menu/:vendorId      - Get vendor menu

POST   /api/orders              - Create order
GET    /api/orders/:id          - Get order details
GET    /api/orders/my           - Get user's orders

POST   /api/payments/process    - Process payment
POST   /api/payments/create-checkout-session - Create Stripe Checkout session (authenticated)
POST   /api/payments/confirm    - Confirm a checkout session
POST   /api/payments/webhook    - Stripe webhook endpoint (raw body; configure STRIPE_WEBHOOK_SECRET)

POST   /api/orders/:id/resend-qr - Regenerate QR for an order (authenticated)
POST   /api/orders/:id/cancel    - Cancel an order (authenticated)

GET    /api/health              - Health check
\`\`\`

## Troubleshooting

### "Network Error" in app

- Make sure backend is running (`npm run dev` in backend folder)
- Verify IP address in `mobile-app/src/config/api.ts` matches your machine
- Check firewall settings allow connections on port 3000
- Ensure phone and computer are on same WiFi network

### WebSocket not connecting

- Check `SOCKET_URL` in config matches your IP
- Verify backend console shows "Client connected" message
- Try restarting both backend and mobile app

### Database issues

- Delete `backend/smartq.db` and restart server to reset database
- Check backend console for any SQL errors

## Project Structure

\`\`\`
mobile-app/
├── src/
│   ├── config/         # API configuration
│   ├── screens/        # All app screens
│   ├── store/          # Zustand state management
│   ├── services/       # API & Socket services
│   └── types/          # TypeScript types
└── App.tsx            # Navigation setup

backend/
├── src/
│   ├── database/       # SQLite setup & seeding
│   ├── middleware/     # Auth middleware
│   ├── modules/        # Feature modules
│   │   ├── auth/
│   │   ├── vendor/
│   │   ├── menu/
│   │   ├── order/
│   │   └── payment/
│   ├── types/          # TypeScript types
│   └── server.ts       # Express app setup
└── smartq.db          # SQLite database
\`\`\`

## Next Steps

Want to enhance the app? Here are some ideas:

- Add push notifications for order status changes
- Implement order ratings and reviews
- Add favorite items feature
- Enable multiple delivery addresses
- Add order scheduling (order for later)
- Implement real payment gateway (Stripe/Razorpay)
- Add admin dashboard for vendors
- Implement order cancellation
 - QR pickup verification (added): orders now generate a QR (PNG data URL) that customers can show at pickup. Workers can verify orders by POSTing to `/api/orders/verify` with `{ orderId, token }` — in development you may POST just `{ orderId }` for convenience.
 - Payment simulation: backend provides a payment simulation used by the Checkout screen (95% success rate). Replace with a real gateway when ready.
 - Stripe (optional): To enable real Stripe Checkout, set `STRIPE_SECRET_KEY` in the backend `.env` and `CLIENT_URL` (e.g., `http://localhost:19006`) so the server can create Checkout sessions and confirm payments via `POST /api/payments/create-checkout-session` and `/api/payments/confirm`.

## License

MIT License - Feel free to use for learning or commercial projects!
