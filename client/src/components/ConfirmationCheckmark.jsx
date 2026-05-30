export default function ConfirmationCheckmark({ className = "" }) {
  return (
    <div className={`confirmation-checkmark ${className}`} aria-hidden="true">
      <svg viewBox="0 0 52 52" className="confirmation-checkmark__svg">
        <circle className="confirmation-checkmark__circle" cx="26" cy="26" r="24" fill="none" />
        <path className="confirmation-checkmark__tick" fill="none" d="M14 27l8 8 16-18" />
      </svg>
    </div>
  );
}
