export function getPaymentUiState(order) {
  const paymentStatus = order?.paymentStatus || "pending";

  if (paymentStatus === "completed") {
    return {
      tone: "success",
      headline: "Your Bold Piece is on its way.",
      body: "Payment received. We are preparing your order for delivery.",
      polling: false,
    };
  }

  if (paymentStatus === "failed") {
    return {
      tone: "error",
      headline: "Payment didn't go through — please try again.",
      body: order?.paymentFailureReason || "The Mobile Money request was not completed.",
      polling: false,
      showRetry: true,
    };
  }

  if (paymentStatus === "cancelled") {
    return {
      tone: "cancelled",
      headline: "Payment cancelled.",
      body: order?.paymentFailureReason || "You can try again when you are ready.",
      polling: false,
      showRetry: true,
    };
  }

  if (paymentStatus === "submitted") {
    return {
      tone: "pending",
      headline: "Confirming your Bold Piece…",
      body: "Approve the payment prompt on your phone.",
      polling: true,
    };
  }

  return {
    tone: "pending",
    headline: "Confirming your Bold Piece…",
    body: "Waiting for payment confirmation from Shwary Mobile Money.",
    polling: true,
  };
}
