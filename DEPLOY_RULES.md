# How to Deploy RTDB Security Rules

## Important: You MUST deploy the security rules to Firebase for them to take effect!

The rules in `RTDB_SECURITY_RULES.json` are just local files. They need to be deployed to Firebase Console for the database to use them.

## Step-by-Step Instructions

1. **Open Firebase Console**

   - Go to https://console.firebase.google.com/
   - Select your project: `axisstore-gh` (or your project name)

2. **Navigate to Realtime Database**

   - In the left sidebar, click **Realtime Database**
   - Click on the **Rules** tab at the top

3. **Copy the Rules**

   - Open `RTDB_SECURITY_RULES.json` in your project
   - Copy the **entire contents** of the file (including the outer `{` and `}`)

4. **Paste and Deploy**

   - Delete all existing rules in the Firebase Console rules editor
   - Paste the copied rules
   - Click **Publish** button

5. **Verify**
   - You should see a success message
   - The rules should now be active

## Current Admin Email

The rules are configured to allow only: **tredway4k@gmail.com**

Make sure you're logged in with this exact email address in your app.

## Troubleshooting

If you still get permission errors after deploying:

1. **Check your email matches exactly**

   - The email must be exactly `tredway4k@gmail.com` (case-sensitive)
   - Check the browser console for the logged email

2. **Verify rules were deployed**

   - Go back to Firebase Console → Realtime Database → Rules
   - Check that the rules show `auth.token.email == 'tredway4k@gmail.com'`

3. **Clear browser cache and reload**

   - Sometimes cached rules can cause issues
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

4. **Check Firebase Auth**
   - Make sure you're signed in with Firebase Auth
   - The email must match exactly what's in the rules

## Quick Test

After deploying, try saving a banner again. If it still fails, check the browser console for the exact error message.
