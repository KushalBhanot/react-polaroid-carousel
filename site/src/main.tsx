import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { App } from "./app";

// The page is prerendered at build time (site/build.mjs), so this hydrates it.
const root = document.getElementById("root");
if (root) {
  hydrateRoot(
    root,
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
