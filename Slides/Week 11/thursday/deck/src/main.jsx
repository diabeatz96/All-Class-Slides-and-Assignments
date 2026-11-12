import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DeckShell } from "./ui.jsx";
import { slides } from "./slides.jsx";
import "./deck.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <DeckShell slides={slides} />
  </StrictMode>
);
