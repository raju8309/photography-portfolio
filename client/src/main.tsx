import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import "./index.css";

// Get root element and handle errors gracefully
const rootElement = document.getElementById("root");
if (!rootElement) {
  const errorDiv = document.createElement('div');
  errorDiv.innerHTML = 'Unable to find root element';
  document.body.appendChild(errorDiv);
  throw new Error("Root element not found");
}

// Create root and render app with error handling
try {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>
  );
} catch (error) {
  console.error('Failed to render application:', error);
  rootElement.innerHTML = 'Failed to load application. Please try refreshing the page.';
}