import { Link } from "react-router-dom";

const STEPS = [
  { id: 1, label: "Cart", path: "/shop" },
  { id: 2, label: "Shipping" },
  { id: 3, label: "Confirm & Pay" },
];

export default function CheckoutProgress({ currentStep }) {
  return (
    <nav className="checkout-progress" aria-label="Checkout progress">
      {STEPS.map((step, index) => {
        const isDone = currentStep > step.id;
        const isActive = currentStep === step.id;
        const itemClass = [
          "checkout-progress__item",
          isDone ? "checkout-progress__item--done" : "",
          isActive ? "checkout-progress__item--active" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div key={step.id} className="checkout-progress__group">
            {index > 0 ? (
              <span
                className={`checkout-progress__line ${currentStep >= step.id ? "checkout-progress__line--done" : ""}`}
                aria-hidden="true"
              />
            ) : null}
            <div className={itemClass}>
              {step.path && isDone ? (
                <Link to={step.path} className="checkout-progress__dot" aria-label={`${step.label}, completed`}>
                  ✓
                </Link>
              ) : (
                <span className="checkout-progress__dot" aria-current={isActive ? "step" : undefined}>
                  {isDone ? "✓" : step.id}
                </span>
              )}
              <span className="checkout-progress__label">{step.label}</span>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
