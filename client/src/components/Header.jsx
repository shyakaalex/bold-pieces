import { useEffect, useId, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { IconCart, IconClose, IconMenu, IconSearch } from "./Icons";

const NAV_LINKS = [{ to: "/shop", label: "Shop" }];

export default function Header() {
  const { cartCount, setCartOpen, cartOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputId = useId();
  const searchInputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const cartLabel =
    cartCount > 0 ? `Open cart, ${cartCount} item${cartCount === 1 ? "" : "s"}` : "Open cart";

  const closeSearch = () => setSearchOpen(false);
  const closeMenu = () => setMenuOpen(false);

  const submitSearch = (event) => {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;
    navigate(`/shop?q=${encodeURIComponent(term)}`);
    closeSearch();
    closeMenu();
    setQuery("");
  };

  useEffect(() => {
    closeMenu();
    closeSearch();
  }, [location.pathname]);

  useEffect(() => {
    if (!searchOpen) return;
    searchInputRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") closeSearch();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [searchOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") closeMenu();
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (searchOpen && cartOpen) setCartOpen(false);
    if (menuOpen && cartOpen) setCartOpen(false);
    if (menuOpen && searchOpen) closeSearch();
  }, [searchOpen, cartOpen, menuOpen, setCartOpen]);

  return (
    <>
      <header className="topbar">
        <div className="topbar__start">
          <button
            type="button"
            className="topbar-icon mobile-nav-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-panel"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <IconClose /> : <IconMenu />}
          </button>

          <div className="brand">
            <Link to="/" aria-label="Bold Pieces home" onClick={closeMenu}>
              <img src="/assets/logo/White & Gold Full.png" alt="Bold Pieces" className="brand-logo-full" />
              <img src="/assets/logo/Green initials.png" alt="BP" className="brand-logo-mobile" />
            </Link>
          </div>
        </div>

        <nav className="nav desktop-only" aria-label="Main">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => (isActive ? "nav-link--active" : undefined)}
            >
              {label.toUpperCase()}
            </NavLink>
          ))}
        </nav>

        <div className="topbar-actions">
          <button
            type="button"
            className={`topbar-icon ${searchOpen ? "topbar-icon--active" : ""}`}
            aria-label="Search products"
            aria-expanded={searchOpen}
            aria-controls="header-search-panel"
            onClick={() => {
              closeMenu();
              setSearchOpen((open) => !open);
            }}
          >
            <IconSearch />
          </button>

          <button
            type="button"
            className={`topbar-icon ${cartOpen ? "topbar-icon--active" : ""}`}
            aria-label={cartLabel}
            onClick={() => {
              closeMenu();
              setCartOpen(true);
            }}
          >
            <IconCart />
            {cartCount > 0 ? (
              <span className="topbar-icon__badge" aria-hidden="true">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </button>
        </div>
      </header>

      <div className={`mobile-nav ${menuOpen ? "mobile-nav--open" : ""}`} aria-hidden={!menuOpen}>
        <button type="button" className="mobile-nav__backdrop" aria-label="Close menu" onClick={closeMenu} />
        <nav
          id="mobile-nav-panel"
          className="mobile-nav__panel"
          aria-label="Mobile"
          role="dialog"
          aria-modal="true"
        >
          <div className="mobile-nav__head">
            <span>Menu</span>
            <button type="button" className="topbar-icon" aria-label="Close menu" onClick={closeMenu}>
              <IconClose />
            </button>
          </div>
          <div className="mobile-nav__links">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink key={to} to={to} onClick={closeMenu} className={({ isActive }) => (isActive ? "nav-link--active" : undefined)}>
                {label}
              </NavLink>
            ))}
          </div>
          <div className="mobile-nav__cta">
            <Link to="/shop" className="btn-primary" onClick={closeMenu}>
              Shop all pieces
            </Link>
          </div>
        </nav>
      </div>

      {searchOpen ? (
        <>
          <button
            type="button"
            className="search-backdrop"
            aria-label="Close search"
            onClick={closeSearch}
          />
          <div id="header-search-panel" className="search-panel" role="search">
            <form className="search-panel__form" onSubmit={submitSearch}>
              <div className="search-panel__field">
                <label htmlFor={searchInputId}>Search jewelry</label>
                <input
                  ref={searchInputRef}
                  id={searchInputId}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. emerald pendant"
                  autoComplete="off"
                />
              </div>
              <button type="submit" className="btn-primary">
                Search
              </button>
              <button
                type="button"
                className="topbar-icon search-panel__close"
                aria-label="Close search"
                onClick={closeSearch}
              >
                <IconClose />
              </button>
            </form>
          </div>
        </>
      ) : null}
    </>
  );
}
