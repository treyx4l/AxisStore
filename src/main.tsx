import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

// Suppress expected Firebase errors and warnings
if (typeof window !== 'undefined') {
  // Suppress WebSocket connection errors (expected when offline)
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    // Filter out Firebase WebSocket connection errors
    if (
      message.includes('WebSocket connection') ||
      message.includes('Failed to load resource') ||
      message.includes('ERR_INTERNET_DISCONNECTED') ||
      message.includes('firebaseio.com') ||
      message.includes('firebasedatabase.app')
    ) {
      return; // Suppress these expected errors
    }
    originalError.apply(console, args);
  };

  // Suppress Cross-Origin-Opener-Policy warnings from Firebase Auth popups
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    // Filter out COOP warnings from Firebase Auth
    if (
      message.includes('Cross-Origin-Opener-Policy') ||
      message.includes('popup.ts') ||
      message.includes('Datadog Browser SDK') ||
      message.includes('No storage available')
    ) {
      return; // Suppress these expected warnings
    }
    originalWarn.apply(console, args);
  };

  // Handle unhandled promise rejections from Firebase
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || event.reason?.toString() || '';
    // Suppress Firebase connection-related rejections
    if (
      message.includes('WebSocket') ||
      message.includes('firebaseio.com') ||
      message.includes('firebasedatabase.app') ||
      message.includes('ERR_INTERNET_DISCONNECTED')
    ) {
      event.preventDefault(); // Suppress these expected errors
    }
  });
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
