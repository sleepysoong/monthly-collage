import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./fonts.css";
import "./liquid-glass.css";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

function enableLiquidGlassRefraction() {
  const chromium = /Chrome\/|Chromium\/|Edg\//.test(navigator.userAgent) && !/Firefox|FxiOS/.test(navigator.userAgent);
  if (chromium && typeof CSS !== "undefined" && CSS.supports?.("backdrop-filter", "blur(1px)")) {
    document.documentElement.classList.add("lg-distort");
  }
}

enableLiquidGlassRefraction();

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .catch((err) => console.error("service worker registration failed:", err));
  });
}
