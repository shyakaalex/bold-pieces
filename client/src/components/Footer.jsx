import { Link } from "react-router-dom";

const showAdmin = import.meta.env.VITE_SHOW_ADMIN_LINK === "true";

export default function Footer({ variant = "minimal" }) {
  if (variant === "rich") {
    return (
      <footer className="site-footer">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <img src="/assets/logo/White & Gold Full.png" alt="Bold Pieces" />
            <p>Nature inspired. Boldly made. Luxury jewelry crafted in Kigali, Rwanda.</p>
            <div className="site-footer__social">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                IG
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                FB
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok">
                TT
              </a>
              <a href="mailto:hello@boldpieces.com" aria-label="Email">
                @
              </a>
            </div>
          </div>

          <div className="site-footer__col">
            <h4>Shop</h4>
            <nav>
              <Link to="/shop">All Jewelry</Link>
              <Link to="/shop?category=Necklaces">Necklaces</Link>
              <Link to="/shop?category=Bracelets">Bracelets</Link>
              <Link to="/shop?category=Earrings">Earrings</Link>
              <Link to="/shop?category=Rings">Rings</Link>
            </nav>
          </div>

          <div className="site-footer__col">
            <h4>Company</h4>
            <nav>
              <Link to="/about">About Us</Link>
              <Link to="/lookbook">Lookbook</Link>
              <Link to="/collections">Collections</Link>
              <Link to="/contact">Contact</Link>
            </nav>
          </div>

          <div className="site-footer__col">
            <h4>Customer care</h4>
            <nav>
              <Link to="/contact">Shipping Policy</Link>
              <Link to="/contact">Returns & Exchanges</Link>
              <Link to="/contact">Privacy Policy</Link>
              <Link to="/contact">Terms of Service</Link>
            </nav>
          </div>

          <div className="site-footer__col site-footer__contact">
            <h4>Contact</h4>
            <p>
              <a href="tel:+250788000000">+250 788 000 000</a>
            </p>
            <p>
              <a href="mailto:hello@boldpieces.com">hello@boldpieces.com</a>
            </p>
            <p>Kigali, Rwanda</p>
          </div>
        </div>
        <div className="site-footer__bottom">
          <p>&copy; 2025 Bold Pieces. All rights reserved.</p>
          <div className="site-footer__bottom-links">
            <Link to="/account" className="footer-utility-link">
              Account
            </Link>
            {showAdmin ? (
              <Link to="/admin/login" className="footer-utility-link">
                Admin
              </Link>
            ) : null}
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="footer footer--minimal">
      <p>&copy; 2025 Bold Pieces. All rights reserved.</p>
      <nav>
        <Link to="/account">Account</Link>
        <Link to="/contact">Privacy Policy</Link>
        <Link to="/contact">Shipping Policy</Link>
        <Link to="/contact">Returns & Exchanges</Link>
        <Link to="/contact">Terms of Service</Link>
        {showAdmin ? (
          <Link to="/admin/login" className="footer-utility-link">
            Admin
          </Link>
        ) : null}
      </nav>
      <img src="/assets/icons/Maroon initials.png" alt="BP monogram" className="footer-mark" />
    </footer>
  );
}
