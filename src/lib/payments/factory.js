import { RazorpayProvider } from "./razorpay.js";
import { WalletProvider } from "./wallet.js";

/**
 * Retrieve the active configured payment provider based on selected system or parameters.
 * Defaults to Razorpay.
 *
 * @param {string} type - 'RAZORPAY' or 'WALLET'
 * @returns {PaymentProvider}
 */
export function getPaymentProvider(type = "RAZORPAY") {
  switch (type.toUpperCase()) {
    case "WALLET":
      return new WalletProvider();
    case "RAZORPAY":
    default:
      return new RazorpayProvider();
  }
}
