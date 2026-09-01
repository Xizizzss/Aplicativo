import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app/components/App";
import "./styles/index.css";
import Cliente from "./app/components/Cliente";

createRoot(document.getElementById("root")!).render(<App />);
