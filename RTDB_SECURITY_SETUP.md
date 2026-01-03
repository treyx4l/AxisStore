# Firebase Realtime Database - Secure Security Rules Setup

## Overview

These security rules provide **maximum security** for your Firebase Realtime Database. They include:

- ✅ Strict authentication requirements
- ✅ Data validation for all fields
- ✅ Role-based access control (admin vs regular users)
- ✅ Input sanitization and length limits
- ✅ Type checking for all data
- ✅ Protection against unauthorized access

## Security Features

### 1. **Products**
- **Read**: Public (anyone can view products)
- **Write**: Admin only (must be authenticated and listed in `/admins`)
- **Validation**: 
  - Name: 1-200 characters
  - Description: 1-2000 characters
  - Price: 0.01 - 1,000,000
  - Category: Must be one of the allowed values
  - Image: Valid string, max 500 characters
  - isSoftware: Boolean

### 2. **Images**
- **Read**: Public (for displaying product images)
- **Write**: Admin only
- **Validation**:
  - Base64 data: Max 10MB
  - CreatedAt: Valid timestamp

### 3. **Orders**
- **Read**: Users can read their own orders, admins can read all
- **Write**: Users can create orders, admins can update any order
- **Validation**:
  - Order number format: `ORD-{timestamp}`
  - Status: Must be valid status
  - Payment status: Must be valid status
  - Customer info: Validated email, phone, address
  - Items: Validated product references
  - Totals: Reasonable limits (0 - 1,000,000)

### 4. **Carts**
- **Read/Write**: Users can only access their own cart
- **Validation**: Max 100 items per cart

### 5. **Statistics**
- **Read**: Public (for displaying store stats)
- **Write**: Admin only
- **Validation**: All values must be non-negative numbers within reasonable limits

### 6. **Users**
- **Read/Write**: Users can only access their own profile
- **Validation**: Email format, length limits on all fields

## Setup Instructions

### Step 1: Set Up Admin Users

You need to add admin user UIDs to the database. There are two methods:

#### Method 1: Using Firebase Console (Quick Setup)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Realtime Database**
4. Click on the database
5. Click the **+** button to add a new node
6. Create path: `admins`
7. Add your admin user's Firebase Auth UID as a key with value `true`

Example structure:
```
admins
  └── {firebase-auth-uid-1}: true
  └── {firebase-auth-uid-2}: true
```

#### Method 2: Using Firebase Admin SDK (Recommended for Production)

Create a script to set admin status:

```javascript
// setAdmin.js
const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-project.firebaseio.com'
});

const db = admin.database();
const adminUid = 'YOUR_FIREBASE_AUTH_UID'; // Get this from Firebase Auth

db.ref(`admins/${adminUid}`).set(true)
  .then(() => {
    console.log('Admin user added successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error adding admin:', error);
    process.exit(1);
  });
```

### Step 2: Get Admin User's Firebase Auth UID

1. Have the admin user sign in to your app using Firebase Auth
2. Check the Firebase Console → Authentication → Users
3. Copy the UID of the admin user
4. Add it to `/admins/{uid}` with value `true` in Realtime Database

### Step 3: Deploy Security Rules

1. Go to Firebase Console → Realtime Database → Rules
2. Copy the contents of `RTDB_SECURITY_RULES.json`
3. Paste into the rules editor
4. Click **Publish**

### Step 4: Test the Rules

1. **Test Product Access**:
   - Try reading products (should work for everyone)
   - Try writing a product without auth (should fail)
   - Try writing a product as non-admin (should fail)
   - Try writing a product as admin (should succeed)

2. **Test Order Access**:
   - Try creating an order as authenticated user (should succeed)
   - Try reading another user's order (should fail)
   - Try reading your own order (should succeed)
   - Try updating order status as admin (should succeed)

3. **Test Cart Access**:
   - Try accessing another user's cart (should fail)
   - Try accessing your own cart (should succeed)

## Important Security Notes

### ⚠️ Admin Authentication

The current admin system uses session-based auth (not Firebase Auth). To use these secure rules, you have two options:

1. **Option A**: Migrate admin authentication to Firebase Auth
   - Have admins sign in with Firebase Auth
   - Add their UIDs to `/admins` path
   - Rules will automatically work

2. **Option B**: Use Custom Claims (Recommended)
   - Set custom claims via Firebase Admin SDK:
   ```javascript
   admin.auth().setCustomUserClaims(uid, { admin: true });
   ```
   - Update rules to check custom claims:
   ```json
   ".write": "auth != null && auth.token.admin == true"
   ```

### 🔒 Data Validation

All data is strictly validated:
- String lengths are limited
- Numbers have min/max bounds
- Email addresses are validated with regex
- URLs are validated
- Enums are restricted to allowed values
- Timestamps are validated

### 🛡️ Protection Against Common Attacks

- **Unauthorized Access**: All writes require authentication
- **Data Injection**: All inputs are validated
- **Privilege Escalation**: Role checks prevent privilege escalation
- **Data Leakage**: Users can only access their own data
- **DoS Attacks**: Size limits prevent excessive data uploads

## Troubleshooting

### "Permission Denied" Errors

1. **Check Authentication**: Ensure user is signed in with Firebase Auth
2. **Check Admin Status**: Verify UID is in `/admins` path with value `true`
3. **Check Rules**: Ensure rules are published correctly
4. **Check Data Format**: Ensure data matches validation rules

### Admin Can't Write Products

1. Verify admin UID is correct in `/admins/{uid}`
2. Ensure value is exactly `true` (boolean, not string)
3. Check that user is authenticated with Firebase Auth (not just session auth)

### Users Can't Create Orders

1. Ensure user is authenticated with Firebase Auth
2. Check that order data matches validation rules
3. Verify order structure includes all required fields

## Production Recommendations

1. **Use Custom Claims**: Instead of `/admins` path, use Firebase Auth custom claims
2. **Enable App Check**: Add App Check to prevent abuse
3. **Monitor Rules**: Use Firebase Rules Monitoring to track rule violations
4. **Regular Audits**: Review admin access regularly
5. **Backup Rules**: Keep a backup of your rules in version control

## Updating Rules for Custom Claims

If you want to use custom claims instead of the `/admins` path, update the rules like this:

```json
".write": "auth != null && auth.token.admin == true"
```

Then set custom claims using Firebase Admin SDK:
```javascript
admin.auth().setCustomUserClaims(uid, { admin: true });
```

This is more secure as it doesn't require a database read to check admin status.

