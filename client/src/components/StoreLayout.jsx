import { useLocation } from "react-router-dom";

import AnnouncementBar from "./AnnouncementBar";
import CartDrawer from "./CartDrawer";
import Footer from "./Footer";
import Header from "./Header";

export default function StoreLayout({ children, variant }) {
  const location = useLocation();
  const isShop = variant === "shop" || location.pathname === "/shop";
  const isProduct = variant === "product" || location.pathname.startsWith("/products/");

  return (
    <div className={`storefront ${isShop ? "storefront--shop" : ""} ${isProduct ? "storefront--product" : ""}`}>
      {isShop ? <AnnouncementBar variant="compact" /> : null}
      {isProduct ? <AnnouncementBar variant="rich" /> : null}
      <Header />
      <main className={`site-main ${isShop ? "site-main--shop" : ""} ${isProduct ? "site-main--product" : ""}`}>{children}</main>
      <Footer variant={isShop ? "rich" : "minimal"} />
      <CartDrawer />
    </div>
  );
}
