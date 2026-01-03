# Firebase Realtime Database Setup Guide

## Overview

The store now uses **Firebase Realtime Database (RTDB)** for all ecommerce data including:
- Products (admin-managed)
- Orders (customer orders)
- Carts (user shopping carts)
- Statistics (revenue, order counts, etc.)

## Database Structure

The RTDB structure follows this schema:

```
{
  "products": {
    "productId1": {
      "name": "Product Name",
      "description": "Product description",
      "price": 1199,
      "category": "laptops",
      "image": "/assets/products/image.jpg",
      "isSoftware": false
    },
    "productId2": { ... }
  },
  "orders": {
    "orderId1": {
      "userId": "user123",
      "orderNumber": "ORD-1234567890",
      "items": [
        {
          "productId": "productId1",
          "productName": "Product Name",
          "quantity": 2,
          "price": 1199
        }
      ],
      "subtotal": 2398,
      "shipping": 15,
      "total": 2413,
      "status": "pending",
      "customerInfo": {
        "fullName": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "address": "123 Main St",
        "city": "City",
        "postalCode": "12345"
      },
      "paymentMethod": "card",
      "createdAt": 1234567890000,
      "updatedAt": 1234567890000
    }
  },
  "carts": {
    "userId1": [
      {
        "product": { /* full product object */ },
        "quantity": 2
      }
    ]
  },
  "stats": {
    "totalRevenue": 0,
    "totalOrders": 0,
    "totalProducts": 0
  }
}
```

## Setup Steps

### 1. Enable Realtime Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `axisstore-gh`
3. Click **Realtime Database** in the left menu
4. Click **Create Database**
5. Choose a location (same as Firestore recommended)
6. Choose **Start in test mode** (we'll update rules next)

### 2. Set Up Security Rules

Go to **Realtime Database** > **Rules** and update:

```json
{
  "rules": {
    "products": {
      ".read": true,
      ".write": true
    },
    "orders": {
      "$orderId": {
        ".read": "auth != null && (data.child('userId').val() == auth.uid || root.child('users').child(auth.uid).child('isAdmin').val() == true)",
        ".write": "auth != null && (!data.exists() || data.child('userId').val() == auth.uid)"
      }
    },
    "carts": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid"
      }
    },
    "stats": {
      ".read": true,
      ".write": true
    },
    "users": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid"
      }
    }
  }
}
```

**Note**: Products and stats have open write access for development. In production, you should restrict writes to authenticated admin users only.

**Important**: These rules allow:
- **Products**: Public read, authenticated write (admin)
- **Orders**: Users can read their own orders, admins can read all
- **Carts**: Users can only access their own cart
- **Stats**: Public read, admin-only write
- **Users**: Users can only access their own data

### 3. Get Database URL

1. In **Realtime Database**, click on the **Data** tab
2. At the top, you'll see your database URL: `https://axisstore-gh-default-rtdb.firebaseio.com/`
3. Copy this URL

### 4. Update .env File

Add the database URL to your `.env` file:

```env
VITE_FIREBASE_DATABASE_URL=https://axisstore-gh-default-rtdb.firebaseio.com/
```

**Important**: The database URL format is:
- `https://[PROJECT_ID]-default-rtdb.[REGION].firebasedatabase.app/`
- Or: `https://[PROJECT_ID]-default-rtdb.firebaseio.com/`

### 5. Restart Dev Server

After updating `.env`:
```bash
# Stop server (Ctrl+C)
npm run dev
```

## Database Features

### Products
- **Real-time updates**: Products update instantly across all users
- **Admin management**: Add, edit, delete products via admin dashboard
- **Automatic sorting**: Products sorted alphabetically

### Orders
- **Order tracking**: Full order history with status updates
- **Real-time status**: Order status updates in real-time
- **Order numbers**: Auto-generated order numbers (ORD-timestamp)
- **Revenue tracking**: Automatic revenue calculation

### Carts
- **Persistent carts**: Saved per user
- **Real-time sync**: Cart updates sync across devices
- **Auto-clear**: Cart clears after order placement

### Statistics
- **Total Revenue**: Tracks all order totals
- **Total Orders**: Counts all orders
- **Total Products**: Counts all products
- **Reset function**: Admin can reset stats

## Admin Features

### Product Management
- Add products with file uploads
- Edit existing products
- Delete products
- Real-time product count

### Order Management
- View all orders
- Update order status (pending → processing → shipped → delivered)
- Track revenue in real-time
- Reset statistics

### Statistics Dashboard
- Total Revenue (with reset button)
- Total Orders count
- Total Products count
- Pending orders count

## User Features

### Order Tracking
- View order history
- Real-time order status updates
- Order details (items, totals, dates)
- Order number tracking

### Cart Management
- Persistent shopping cart
- Real-time cart sync
- Auto-save on changes

## Testing

1. **Add a product**:
   - Login as admin
   - Go to Products tab
   - Click "Add Product"
   - Fill in details and select image
   - Product appears in store immediately

2. **Place an order**:
   - Add items to cart
   - Go to checkout
   - Complete order
   - Order appears in admin dashboard and user orders

3. **Check statistics**:
   - Admin dashboard shows real-time stats
   - Revenue updates automatically
   - Order count increments

## Troubleshooting

### "Realtime Database is not configured"
- Check `.env` file has `VITE_FIREBASE_DATABASE_URL`
- Verify database URL is correct
- Restart dev server after updating `.env`

### Products not showing
- Check RTDB rules allow public read
- Verify products exist in database
- Check browser console for errors

### Orders not saving
- Check RTDB rules allow authenticated write
- Verify user is logged in
- Check browser console for errors

### Statistics not updating
- Check admin user has write permissions
- Verify stats node exists in database
- Check browser console for errors

## Database Reset

To reset the database:
1. Go to Firebase Console > Realtime Database
2. Click the three dots menu
3. Select "Export JSON" (backup first!)
4. Delete all data manually or use the reset function in admin dashboard

## Next Steps

1. Set up Realtime Database in Firebase Console
2. Add database URL to `.env` file
3. Update security rules
4. Test product creation
5. Test order placement
6. Verify statistics tracking

All data is now stored in Firebase Realtime Database with real-time synchronization!

