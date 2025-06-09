import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const App = () => { return <h1 className = "text-3xl font-bold underline text-blue-600 p-4">Hello from React + Electron with Tailwind!</h1>; };

const root = createRoot(document.getElementById("root"));
root.render(<App />);
