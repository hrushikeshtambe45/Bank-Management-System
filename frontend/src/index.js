import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// This is the correct import path because main.css is now in the same folder as index.js
import './main.css'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);