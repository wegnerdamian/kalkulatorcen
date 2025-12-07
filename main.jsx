import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Usunęliśmy linię importu CSS, ponieważ style ładujemy w index.html
// import './index.css' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
