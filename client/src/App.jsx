import { Route, Routes } from "react-router-dom";

import AdminApp from "./admin/AdminApp";
import { CartProvider } from "./context/CartContext";
import { CustomerProvider } from "./context/CustomerContext";
import AccountPage from "./pages/AccountPage";
import CheckoutPage from "./pages/CheckoutPage";
import { AboutPage, CollectionsPage, ContactPage, LookbookPage } from "./pages/ContentPages";
import HomePage from "./pages/HomePage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ShopPage from "./pages/ShopPage";
import SocialLandingPage from "./pages/SocialLandingPage";

function App() {
  return (
    <CustomerProvider>
      <CartProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/confirmation/:id" element={<OrderConfirmationPage />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/lookbook" element={<LookbookPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/from/:platform" element={<SocialLandingPage />} />
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </CartProvider>
    </CustomerProvider>
  );
}

export default App;
