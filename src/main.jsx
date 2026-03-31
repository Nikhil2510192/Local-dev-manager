import React from 'react';
import { createRoot } from 'react-dom/client';
import '@neutralinojs/lib';
import App from './App';
import './index.css';

async function startApp() {
  if (window.Neutralino) {
    await window.Neutralino.init();
    console.log("Neutralino initialized");
  } else {
    console.warn("Neutralino not available (running in browser)");
  }

  createRoot(document.getElementById('app')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

startApp();