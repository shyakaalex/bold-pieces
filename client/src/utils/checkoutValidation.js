const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCheckoutContact(form) {
  const errors = {};
  const name = String(form.customerName || "").trim();
  const email = String(form.email || "").trim();

  if (name.length < 2) {
    errors.customerName = "Please enter your full name.";
  }
  if (!EMAIL_REGEX.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  return errors;
}

export function validateCheckoutShipping(form) {
  const errors = {};
  const address = String(form.address || "").trim();
  const city = String(form.city || "").trim();

  if (address.length < 5) {
    errors.address = "Please enter your delivery address.";
  }
  if (city.length < 2) {
    errors.city = "Please enter your city.";
  }

  return errors;
}

export function validateCheckoutPayment(form, countryPrefix = "+250") {
  const errors = {};
  const digits = String(form.phone || "").replace(/\D/g, "");
  const prefixDigits = countryPrefix.replace(/\D/g, "");

  let normalized = digits;
  if (!digits.startsWith(prefixDigits) && digits.length >= 9) {
    normalized = `${prefixDigits}${digits.replace(/^0+/, "")}`;
  }

  if (normalized.length < 11 || normalized.length > 15) {
    errors.phone = `Use a valid Mobile Money number, e.g. ${countryPrefix} 780 000 000`;
  }

  return errors;
}

export function mergeErrors(...errorObjects) {
  return Object.assign({}, ...errorObjects);
}
