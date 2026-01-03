// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { checkFirebaseConfig } from "./utils/firebaseDiagnostics";

// Your web app's Firebase configuration
// For Vite, use import.meta.env instead of process.env
// IMPORTANT: .env file must be in the PROJECT ROOT (same level as package.json), NOT in src/
// Helper to clean env values (remove quotes, trailing commas, whitespace)
const cleanEnvValue = (value) => {
  if (!value) return "";
  return value.toString().trim().replace(/^["']|["']$/g, '').replace(/,$/, '').trim();
};

const firebaseConfig = {
  apiKey: cleanEnvValue(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: cleanEnvValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  databaseURL: cleanEnvValue(import.meta.env.VITE_FIREBASE_DATABASE_URL),
  projectId: cleanEnvValue(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnvValue(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnvValue(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnvValue(import.meta.env.VITE_FIREBASE_APP_ID),
  measurementId: cleanEnvValue(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID),
};

// Debug logging removed for security

// Helper function to check if config is valid
const isConfigValid = () => {
  // Check for minimum required fields
  const hasProjectId = firebaseConfig.projectId &&
    firebaseConfig.projectId.trim() !== "" &&
    firebaseConfig.projectId !== "a" &&
    firebaseConfig.projectId.length > 1;
  const hasApiKey = firebaseConfig.apiKey && firebaseConfig.apiKey.trim() !== "";

  // Config validation (logging removed for security)

  return hasProjectId && hasApiKey;
};

// Initialize Firebase only if we have the required config
let app;
let auth;
let db; // Firestore (kept for user profiles)
let rtdb; // Realtime Database (for products, orders, etc.)
let storage;
let googleProvider;
let appleProvider;
let facebookProvider;

try {
  // Try to initialize Firebase - be more lenient
  // Even if some config is missing, try to initialize with what we have
  const hasMinimalConfig = firebaseConfig.projectId &&
    firebaseConfig.projectId.trim() !== "" &&
    firebaseConfig.projectId !== "a" &&
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey.trim() !== "";

  // Check for database URL (required for RTDB)
  // Remove trailing slash if present
  if (firebaseConfig.databaseURL && firebaseConfig.databaseURL.endsWith('/')) {
    firebaseConfig.databaseURL = firebaseConfig.databaseURL.slice(0, -1);
  }

  const hasDatabaseURL = firebaseConfig.databaseURL &&
    firebaseConfig.databaseURL.trim() !== "" &&
    (firebaseConfig.databaseURL.includes('firebaseio.com') ||
      firebaseConfig.databaseURL.includes('firebasedatabase.app'));

  // Database URL check (removed logging for security)

  if (hasMinimalConfig) {
    try {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app); // Firestore for user profiles

      // Initialize RTDB only if databaseURL is provided
      if (hasDatabaseURL) {
        try {
          rtdb = getDatabase(app); // Realtime Database for products, orders, etc.
        } catch (rtdbError) {
          // Silently handle RTDB initialization errors
          rtdb = null;
        }
      } else {
        rtdb = null;
      }

      storage = getStorage(app);
      googleProvider = new GoogleAuthProvider();

      // Apple OAuth Provider
      appleProvider = new OAuthProvider('apple.com');

      // Facebook OAuth Provider
      facebookProvider = new OAuthProvider('facebook.com');
      facebookProvider.addScope('email');

      // Firebase initialized successfully
    } catch (initError) {
      // Silently handle initialization errors
      // Still set to null on error
      auth = null;
      db = null;
      rtdb = null;
      storage = null;
      googleProvider = null;
      appleProvider = null;
      facebookProvider = null;
    }
  } else {
    // Run diagnostics to help user
    checkFirebaseConfig();
    // Logging removed for security
    // Create dummy exports to prevent crashes
    auth = null;
    db = null;
    rtdb = null;
    storage = null;
    googleProvider = null;
    appleProvider = null;
    facebookProvider = null;
  }
} catch (error) {
  // Silently handle setup errors
  // Create dummy exports to prevent crashes
  auth = null;
  db = null;
  rtdb = null;
  storage = null;
  googleProvider = null;
  appleProvider = null;
  facebookProvider = null;
}

// Export a function to check if Firebase is initialized
export const isFirebaseInitialized = () => {
  return !!(auth && db && rtdb && app);
};

// Export config for debugging (without sensitive data)
export const getFirebaseConfigStatus = () => {
  return {
    initialized: isFirebaseInitialized(),
    hasAuth: !!auth,
    hasDb: !!db,
    hasRtdb: !!rtdb,
    hasStorage: !!storage,
    hasGoogleProvider: !!googleProvider,
    hasAppleProvider: !!appleProvider,
    hasFacebookProvider: !!facebookProvider,
    projectId: firebaseConfig.projectId || "NOT SET",
    hasApiKey: !!firebaseConfig.apiKey,
  };
};

export { auth, db, rtdb, storage, googleProvider, appleProvider, facebookProvider };
export default app;