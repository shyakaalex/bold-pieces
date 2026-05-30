const TRUST_ITEMS = [
  {
    title: "Handcrafted",
    text: "Made with care and precision",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
    title: "Quality materials",
    text: "Premium stones & metals",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 8h12v10H6V8Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: "Fast delivery",
    text: "Across Rwanda",
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
    title: "Beautiful packaging",
    text: "Perfect for gifting",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 10h16v10H4V10Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 10V6M8 6h8a2 2 0 010 4H8a2 2 0 010-4Z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

export default function ShopTrustBar() {
  return (
    <section className="shop-trust" aria-label="Why Bold Pieces">
      <ul className="shop-trust__list">
        {TRUST_ITEMS.map((item) => (
          <li key={item.title} className="shop-trust__item">
            <span className="shop-trust__icon">{item.icon}</span>
            <div>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
