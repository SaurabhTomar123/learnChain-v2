import { createRoot } from "react-dom/client";
import App from "./App";
import { initAnalytics } from "./lib/analytics";
import { registerServiceWorker } from "./lib/serviceWorker";
import "./index.css";

initAnalytics();
registerServiceWorker();
createRoot(document.getElementById("root")!).render(<App />);
