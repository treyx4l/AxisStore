# Firebase Products Setup Guide

## Step-by-Step Instructions

### 1. Firebase Console Setup

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `axisstore-gh` (or your project name)
3. **Enable Firestore Database**:
   - Go to **Firestore Database** in the left menu
   - Click **Create database** if not already created
   - Choose **Production mode** (or Test mode for development)
   - Select a location (choose closest to your users)

### 2. Set Up Firestore Security Rules

Go to **Firestore Database** > **Rules** and update:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products: public read, authenticated write
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own cart
    match /carts/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can create orders, read their own orders
    match /orders/{orderId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

Click **Publish** to save the rules.

### 3. Create Products Collection

1. In **Firestore Database**, click **Start collection**
2. Collection ID: `products`
3. **Add your first product document**:
   - Click **Add document**
   - Document ID: Auto-generate (or use a custom ID)
   - Add the following fields:

| Field | Type | Value Example |
|-------|------|---------------|
| `name` | string | "AXIS Ultrabook 14\"" |
| `description` | string | "Lightweight productivity laptop..." |
| `price` | number | 1199 |
| `category` | string | "laptops" |
| `image` | string | "/assets/products/laptop-1.jpg" |
| `isSoftware` | boolean | false |

4. **Category options**:
   - `laptops`
   - `desktops`
   - `all-in-one`
   - `others`
   - `softwares`

5. Click **Save**

### 4. Set Up Product Images

1. **Create assets folder structure**:
   ```
   public/
     assets/
       products/
         (your product images here)
   ```

2. **Add product images**:
   - Place image files in `public/assets/products/`
   - Use descriptive filenames: `laptop-1.jpg`, `desktop-pro.jpg`, etc.
   - Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`

3. **Reference in Firestore**:
   - In the product document, set `image` field to: `/assets/products/your-image.jpg`
   - The path should start with `/assets/products/`

### 5. Adding Products via Admin Dashboard

1. **Login to Admin Dashboard**:
   - Go to `/admin/login`
   - Username: `sxmuel`
   - Password: `Tredway.4k`

2. **Add New Product**:
   - Click **Add Product** button
   - Fill in product details:
     - Product Name
     - Description
     - Price
     - Category (select from dropdown)
     - Product Image (select file from your computer)
     - Check "This is a software product" if applicable
   - Click **Add Product**

3. **The image file will be saved**:
   - The file you select will be referenced in the database
   - Make sure to manually copy the image to `public/assets/products/` folder
   - The image path will be stored as `/assets/products/[filename]`

### 6. Image File Management

**Important**: Currently, the admin dashboard stores the file reference. You need to:

1. **Select the image file** in the admin form
2. **Manually copy the file** to `public/assets/products/` folder
3. **Use the same filename** that was selected

**Future Enhancement**: The system can be updated to automatically copy files to the assets folder using a build script or server-side upload.

### 7. Testing

1. **View Products**:
   - Go to the home page
   - Products should load from Firestore
   - If no products show, check browser console for errors

2. **Search and Filter**:
   - Use the search bar to find products
   - Use category chips to filter
   - Use the Filters button for price ranges

3. **Add to Cart**:
   - Click "Add to cart" on any product
   - Sign in if prompted
   - Cart items are saved to Firestore

### 8. Troubleshooting

**Products not showing?**
- Check browser console for errors
- Verify Firestore rules allow public read
- Check that products collection exists
- Verify product documents have all required fields

**Images not loading?**
- Check image path in Firestore matches file location
- Ensure images are in `public/assets/products/`
- Verify image filename matches exactly (case-sensitive)
- Check browser network tab for 404 errors

**Can't add products?**
- Verify you're logged in as admin
- Check Firebase authentication is working
- Verify Firestore rules allow authenticated writes
- Check browser console for error messages

### 9. Sample Product Data

Here's a sample product document structure:

```json
{
  "name": "AXIS Ultrabook 14\"",
  "description": "Lightweight productivity laptop with all‑day battery life.",
  "price": 1199,
  "category": "laptops",
  "image": "/assets/products/laptop-ultrabook.jpg",
  "isSoftware": false
}
```

### 10. Next Steps

- Add more products through the admin dashboard
- Customize product categories if needed
- Set up image optimization if needed
- Configure product variants (size, color, etc.) if required

