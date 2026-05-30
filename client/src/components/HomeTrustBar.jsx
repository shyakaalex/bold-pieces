const TRUST_ITEMS = [
  {
    title: "Premium Materials",
    text: "14k Gold & Precious Stones",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3l2.2 4.5 5 .7-3.6 3.5.9 5.2L12 14.8 7.5 17l.9-5.2-3.6-3.5 5-.7L12 3Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Handcrafted with Care",
    text: "Made by Skilled Artisans",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 4c-1.5 0-2.5 1.2-2.5 2.5 0 1 .5 1.8 1.2 2.3L12 10l1.3-1.2c.7-.5 1.2-1.3 1.2-2.3C14.5 5.2 13.5 4 12 4Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M8 11c0 2.2 1.8 4 4 4s4-1.8 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path d="M6 18c1.2-1.5 2.8-2 6-2s4.8.5 6 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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

export default function HomeTrustBar({ embedded = false }) {
  return (
    <section
      className={`home-trust${embedded ? " home-trust--embedded" : ""}`}
      aria-label="Why Bold Pieces"
    >
      <div className="home-trust__scroll">
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
      </div>
    </section>
  );
}
