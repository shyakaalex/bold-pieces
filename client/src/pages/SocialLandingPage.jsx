import { Link, useParams, useSearchParams } from "react-router-dom";

import StoreLayout from "../components/StoreLayout";
import { readUtmParams } from "../utils/format";

const SOCIAL_COPY = {
  instagram: {
    title: "Welcome from Instagram",
    body: "Discover the pieces our community loves most — curated for bold elegance.",
    cta: "Shop Instagram favorites",
  },
  tiktok: {
    title: "Welcome from TikTok",
    body: "See the viral styles everyone is talking about. Limited pieces available now.",
    cta: "Shop TikTok picks",
  },
};

export default function SocialLandingPage() {
  const { platform } = useParams();
  const [searchParams] = useSearchParams();
  const utm = readUtmParams();
  const key = (platform || "instagram").toLowerCase();
  const copy = SOCIAL_COPY[key] || SOCIAL_COPY.instagram;
  const campaign = searchParams.get("utm_campaign") || utm.utmCampaign || key;

  return (
    <StoreLayout>
      <section className="page-hero social-landing">
        <small>@{key} · {campaign}</small>
        <h1>{copy.title}</h1>
        <p>{copy.body}</p>
        <Link to={`/shop?utm_source=${key}&utm_campaign=${encodeURIComponent(campaign)}`} className="primary-btn">
          {copy.cta}
        </Link>
      </section>
    </StoreLayout>
  );
}
