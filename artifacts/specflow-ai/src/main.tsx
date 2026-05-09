import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import App from "./App";
import "./index.css";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found.");
}

if (!clerkPublishableKey) {
  root.innerHTML = `
    <div style="min-height:100vh;display:grid;place-items:center;background:#0f172a;color:#e2e8f0;font-family:Inter,system-ui,sans-serif;padding:24px;text-align:center">
      <div style="max-width:520px">
        <div style="font-size:12px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#94a3b8;margin-bottom:12px">SpecFlow AI</div>
        <h1 style="font-size:32px;line-height:1.1;margin:0 0 12px">Clerk key missing</h1>
        <p style="font-size:15px;line-height:1.6;margin:0;color:#cbd5e1">
          Add <code>VITE_CLERK_PUBLISHABLE_KEY</code> to <code>.env</code>, then reload the app.
        </p>
      </div>
    </div>
  `;
} else {
  createRoot(root).render(
    <StrictMode>
      <ClerkProvider
        publishableKey={clerkPublishableKey}
        signInUrl="/login"
        signInFallbackRedirectUrl="/"
      >
        <App />
      </ClerkProvider>
    </StrictMode>,
  );
}
