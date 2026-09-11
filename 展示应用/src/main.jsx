import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./styles.css";
import "./experience.css";
import "./immersive.css";
import "./home-story.css";
import "./atrium.css";

if (import.meta.env.DEV) {
  window.__SHOWROOM_ERRORS__ = [];
  const record = value => {window.__SHOWROOM_ERRORS__.push(String(value));if(window.__SHOWROOM_ERRORS__.length>8)window.__SHOWROOM_ERRORS__.shift();};
  const error=e=>record(e.error?.stack||e.message),rejection=e=>record(e.reason?.stack||e.reason);
  window.addEventListener('error',error);window.addEventListener('unhandledrejection',rejection);
  import.meta.hot?.dispose(()=>{window.removeEventListener('error',error);window.removeEventListener('unhandledrejection',rejection);});
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
