import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // WAŻNE: Musi być './App.jsx', a nie './gildiatrenerow'
import './index.css' // Jeśli masz ten plik, jeśli nie - usuń tę linię, ale Tailwind jest ładowany w index.html

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
