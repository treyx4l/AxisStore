# Firebase Setup Guide

## Quick Setup Steps

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `axisstore-gh` (or your preferred name)
4. Follow the setup wizard

### 2. Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click the **Web** icon (`</>`) to add a web app
4. Register your app (you can skip hosting for now)
5. Copy the configuration values

### 3. Create .env File

Create a file named `.env` in the root of your project with the following content:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=axisstore-gh.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=axisstore-gh
VITE_FIREBASE_STORAGE_BUCKET=axisstore-gh.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

**Replace the values with your actual Firebase configuration!**

### 4. Enable Firebase Services

#### Authentication
1. Go to **Authentication** > **Sign-in method**
2. Enable **Email/Password**
3. Enable **Google** (requires OAuth consent screen setup)
4. Enable **Apple** (requires Apple Developer account)
5. Enable **Facebook** (requires Facebook App setup)

#### Firestore Database
1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Production mode** (or Test mode for development)
4. Select a location for your database

#### Storage
1. Go to **Storage**
2. Click **Get started**
3. Accept the default security rules (you can customize later)
4. Choose a location (same as Firestore recommended)

### 5. Set Up Firestore Security Rules

Go to **Firestore Database** > **Rules** and update:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
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
    
    // Products: public read, admin write (you'll need to add admin check)
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null; // Add admin check here
    }
  }
}
```

### 6. Set Up Storage Security Rules

Go to **Storage** > **Rules** and update:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Product images: public read, authenticated write
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null; // Add admin check here
    }
  }
}
```

### 7. Restart Development Server

After creating/updating the `.env` file:
```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

## Troubleshooting

### "Firebase is not configured" Error

1. **Check .env file exists** in the project root
2. **Verify variable names** start with `VITE_`
3. **Restart the dev server** after creating/updating .env
4. **Check browser console** for detailed error messages
5. **Verify values** are correct (no extra spaces, quotes, etc.)

### Environment Variables Not Loading

- Make sure the `.env` file is in the **root directory** (same level as `package.json`)
- Variable names must start with `VITE_` for Vite to expose them
- Restart the development server after changes
- Check that values don't have quotes around them in .env file

### Authentication Not Working

- Verify Authentication is enabled in Firebase Console
- Check that the sign-in methods are enabled
- For OAuth providers, ensure they're properly configured with client IDs/secrets

## Testing Your Setup

1. Open browser console (F12)
2. Look for "✅ Firebase initialized successfully" message
3. If you see warnings, check the diagnostic output
4. Try signing up with email/password to test

## Need Help?

Check the browser console for detailed error messages. The app includes diagnostic tools that will show exactly what's missing.

