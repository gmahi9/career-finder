import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

const stored = localStorage.getItem("career-path-theme");
const theme = stored === "light" || stored === "dark"
  ? stored
  : window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
document.documentElement.dataset.theme = theme;

const root = document.getElementById("root");
if (!root) throw new Error("Missing root element");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
