# Admin Email Authentication Setup

## Overview

Admin authentication now uses **Firebase Email Authentication** instead of session-based storage. Admins must sign in with their email and password, and access is controlled by checking if their email is in the admin email list.

## How It Works

1. **Admin emails are configured** in `src/utils/adminConfig.ts`
2. **Admin signs in** using Firebase Auth with email/password
3. **Protected routes check** if the user's email is in the admin list
4. **Security rules check** admin email for database writes

## Setup Instructions

### Step 1: Configure Admin Emails

Edit `src/utils/adminConfig.ts` and add your admin emails:

```typescript
export const ADMIN_EMAILS = [
  "admin@axisstore.com",
  "sxmuel@axisstore.com",
  // Add more admin emails here
];
```

### Step 2: Create Admin Accounts in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** → **Users**
4. Click **Add user**
5. Enter admin email and password
6. Click **Add user**

**Important**: Use the same emails you added to `ADMIN_EMAILS` in the config file.

### Step 3: Update Security Rules

The security rules in `RTDB_SECURITY_RULES.json` check for admin emails. Make sure the emails in the rules match your admin emails:

```json
".write": "auth != null && (auth.token.email == 'admin@axisstore.com' || auth.token.email == 'sxmuel@axisstore.com')"
```

**Note**: If you add more admin emails, you'll need to update both:

- `src/utils/adminConfig.ts` (for app-level checks)
- `RTDB_SECURITY_RULES.json` (for database security rules)

### Step 4: Deploy Security Rules

1. Go to Firebase Console → Realtime Database → Rules
2. Copy the contents of `RTDB_SECURITY_RULES.json`
3. Paste into the rules editor
4. Click **Publish**

## Admin Login

1. Go to `/admin/login`
2. Enter your **admin email** (must be in `ADMIN_EMAILS` list)
3. Enter your **password** (Firebase Auth password)
4. Click **Sign In**

## Security Features

### Application Level

- `ProtectedRoute` checks if user is authenticated and email is in admin list
- Admin login validates email before allowing access

### Database Level

- Security rules check `auth.token.email` for admin operations
- Only admin emails can write to products, images, stats, categories
- Users can still create orders and manage their own carts

## Adding New Admins

1. **Add email to config**: Edit `src/utils/adminConfig.ts`
2. **Update security rules**: Edit `RTDB_SECURITY_RULES.json` and add email check
3. **Create Firebase account**: Add user in Firebase Console → Authentication
4. **Deploy rules**: Publish updated rules in Firebase Console

## Removing Admins

1. **Remove from config**: Remove email from `ADMIN_EMAILS` in `adminConfig.ts`
2. **Remove from rules**: Remove email check from `RTDB_SECURITY_RULES.json`
3. **Deploy rules**: Publish updated rules
4. **Optional**: Delete user from Firebase Console → Authentication

## Troubleshooting

### "Access denied" Error

- Check that email is in `ADMIN_EMAILS` list
- Verify email matches exactly (case-insensitive)
- Ensure user is signed in with Firebase Auth

### "Permission denied" in Database

- Check that email is in security rules
- Verify rules are published in Firebase Console
- Ensure user is authenticated with Firebase Auth (not just session)

### Can't Sign In

- Verify account exists in Firebase Console → Authentication
- Check email and password are correct
- Ensure Firebase Auth is properly configured

## Security Best Practices

1. **Use strong passwords** for admin accounts
2. **Enable 2FA** in Firebase Console for admin accounts
3. **Regularly review** admin email list
4. **Remove unused** admin accounts
5. **Monitor access** logs in Firebase Console

## Migration from Old System

The old session-based admin system has been removed. If you were using it:

1. Create Firebase Auth accounts for all admins
2. Add their emails to `ADMIN_EMAILS`
3. Update security rules with their emails
4. Deploy the updated rules

Old session storage and `/admins` path in RTDB are no longer used.
