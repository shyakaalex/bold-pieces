const TRUST_ITEMS = [
  {
    title: "Premium Materials",
    text: "14k Gold & Precious Stones",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2l2.4 5.2 5.6.8-4 3.9 1 5.7L12 15.2 6 17.6l1-5.7-4-3.9 5.6-.8L12 2Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M12 8v4M10 10h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Handcrafted with Care",
    text: "Made by Skilled Artisans",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M6 20c1.5-2 3.5-3 6-3s4.5 1 6 3M4 14l2-2M20 14l-2-2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Delivery",
    text: "Fast & Reliable Delivery",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 7h11v9H3V7Zm11 2h4l2 3v4h-6V9Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="7" cy="18" r="1.5" fill="currentColor" />
        <circle cx="17" cy="18" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Luxury Packaging",
    text: "Perfect for Gifting",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 10h16v10H4V10Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 10V6M8 6h8a2 2 0 010 4H8a2 2 0 010-4Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 10v10" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

export default function HomeTrustBar() {
  return (
    <section className="home-trust" aria-label="Why Bold Pieces">
      <ul className="home-trust__list">
        {TRUST_ITEMS.map((item) => (
          <li key={item.title} className="home-trust__item">
            <span className="home-trust__icon">{item.icon}</span>
            <div className="home-trust__copy">
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
