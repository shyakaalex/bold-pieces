import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles/tokens.css'
import './styles/header.css'
import './styles/mobile.css'
import './styles/shop.css'
import './styles/product-detail.css'
import './styles/cart-drawer.css'
import './styles/checkout.css'
import './styles/confirmation.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
