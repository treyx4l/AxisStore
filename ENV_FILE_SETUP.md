# .env File Setup - IMPORTANT!

## ⚠️ Critical: File Location

The `.env` file **MUST** be in the **PROJECT ROOT**, NOT in the `src/` folder!

### Correct Location:
```
TreyTech Store/
├── .env              ← HERE (same level as package.json)
├── package.json
├── src/
│   └── ...
└── ...
```

### Wrong Location:
```
TreyTech Store/
├── package.json
├── src/
│   ├── .env         ← WRONG! Vite won't read this
│   └── ...
└── ...
```

## Why?

Vite (the build tool) only reads `.env` files from the **project root directory**. Files in `src/` or other subdirectories are **ignored**.

## Steps to Fix

1. **Move your .env file**:
   - If it's in `src/.env`, move it to the project root
   - The root is where `package.json` is located

2. **Verify the location**:
   - The `.env` file should be at: `C:\Users\tredw\TreyTech Store\.env`
   - Same level as `package.json`

3. **Restart the dev server**:
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart:
   npm run dev
   ```
   **IMPORTANT**: You MUST restart after moving the file!

4. **Check the console**:
   - Open browser console (F12)
   - Look for "🔍 Firebase Config Check" message
   - It should show `hasApiKey: true` and `hasProjectId: true`

## .env File Format

Your `.env` file should look like this (in the project root):

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=axisstore-gh.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=axisstore-gh
VITE_FIREBASE_STORAGE_BUCKET=axisstore-gh.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

## Important Notes

- ✅ Variable names MUST start with `VITE_`
- ✅ No spaces around the `=` sign
- ✅ No quotes needed around values
- ✅ File must be in project root
- ✅ Must restart dev server after changes

## Verification

After moving the file and restarting, check:

1. **Browser Console**:
   - Should see: "✅ Firebase initialized successfully"
   - Should NOT see: "⚠️ Firebase configuration is incomplete"

2. **Config Check**:
   - Look for "🔍 Firebase Config Check" in console
   - `hasApiKey` should be `true`
   - `hasProjectId` should be `true`

## Troubleshooting

**Still getting "Firebase is not configured"?**

1. ✅ Verify `.env` is in project root (not `src/`)
2. ✅ Check variable names start with `VITE_`
3. ✅ Restart dev server completely
4. ✅ Check browser console for detailed error messages
5. ✅ Verify no typos in variable names
6. ✅ Make sure no extra spaces in `.env` file

## Quick Fix Command

If you have the file in `src/.env`, run this in PowerShell:

```powershell
Move-Item "src\.env" ".env"
```

Then restart your dev server!

