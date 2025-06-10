import React from "react";
import { createRoot } from "react-dom/client";
import NotificationApp from "./NotificationApp";

const root = createRoot(document.getElementById("root"));
root.render(<NotificationApp />);