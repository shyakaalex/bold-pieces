const COUNTRY_PHONE = {
  RW: { prefix: "+250", currency: "RWF" },
  KE: { prefix: "+254", currency: "KES" },
  UG: { prefix: "+256", currency: "UGX" },
  CD: { prefix: "+243", currency: "CDF" },
};

export function getCountryMeta(countryCode) {
  return COUNTRY_PHONE[countryCode] || COUNTRY_PHONE.RW;
}

export function toE164(phone, countryCode = "RW") {
  const digits = String(phone || "").replace(/\D/g, "");
  const meta = getCountryMeta(countryCode);
  const prefixDigits = meta.prefix.replace(/\D/g, "");

  if (digits.startsWith(prefixDigits)) {
    return `+${digits}`;
  }

  const local = digits.replace(/^0+/, "");
  return `${meta.prefix}${local}`;
}

export function isValidE164(phone) {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}
