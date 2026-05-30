import { Link } from "react-router-dom";

export default function AnnouncementBar({ variant = "default" }) {
  if (variant === "compact") {
    return (
      <div className="announcement-bar announcement-bar--compact" role="region" aria-label="Promotion">
        <p>✨ Free delivery on orders over RWF 200,000</p>
      </div>
    );
  }

  return (
    <div className="announcement-bar announcement-bar--rich" role="region" aria-label="Site announcement">
      <p className="announcement-bar__left">Free delivery on orders over RWF 200,000</p>
      <p className="announcement-bar__center">Handcrafted. Timeless. Yours.</p>
      <div className="announcement-bar__right">
        <Link to="/contact">Customer Support</Link>
      </div>
    </div>
  );
}
