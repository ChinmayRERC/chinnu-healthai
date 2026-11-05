import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { LocaleProvider } from "./lib/locale";
import "./styles.css";
import "./styles/v2-foundation.css";
import "./styles/v2-pages.css";
import "./styles/v2-flow.css";
import "./styles/v2-overlays.css";
import "./styles/login.css";

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Offline support is a bonus; the app works without it.
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LocaleProvider><App /></LocaleProvider>
  </React.StrictMode>,
);
