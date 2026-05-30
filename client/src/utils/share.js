const STORE_WHATSAPP = "250780000000";

export function buildOrderWhatsAppMessage(order) {
  const itemNames = order?.items?.map((item) => item.name).filter(Boolean) || [];
  const productLabel =
    itemNames.length === 0
      ? "my Bold Pieces order"
      : itemNames.length === 1
        ? itemNames[0]
        : `${itemNames[0]} and more`;

  const shopUrl = typeof window !== "undefined" ? window.location.origin : "https://boldpieces.com";

  return `Just ordered ${productLabel} from Bold Pieces Rwanda 💚 Check them out: ${shopUrl}`;
}

export function buildWhatsAppShareUrl(order) {
  const text = encodeURIComponent(buildOrderWhatsAppMessage(order));
  return `https://wa.me/${STORE_WHATSAPP}?text=${text}`;
}
