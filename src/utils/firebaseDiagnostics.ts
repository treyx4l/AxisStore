// Utility to help diagnose Firebase configuration issues
export const checkFirebaseConfig = () => {
    const env = import.meta.env;

    const diagnostics = {
        hasApiKey: !!env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_API_KEY.trim() !== "",
        hasProjectId: !!env.VITE_FIREBASE_PROJECT_ID && env.VITE_FIREBASE_PROJECT_ID.trim() !== "",
        hasAuthDomain: !!env.VITE_FIREBASE_AUTH_DOMAIN && env.VITE_FIREBASE_AUTH_DOMAIN.trim() !== "",
        hasStorageBucket: !!env.VITE_FIREBASE_STORAGE_BUCKET && env.VITE_FIREBASE_STORAGE_BUCKET.trim() !== "",
        hasAppId: !!env.VITE_FIREBASE_APP_ID && env.VITE_FIREBASE_APP_ID.trim() !== "",
        projectId: env.VITE_FIREBASE_PROJECT_ID || "NOT SET",
        apiKeyLength: env.VITE_FIREBASE_API_KEY?.length || 0,
    };

    const isConfigured = diagnostics.hasApiKey && diagnostics.hasProjectId;

    // Logging removed for security

    return { isConfigured, diagnostics };
};

