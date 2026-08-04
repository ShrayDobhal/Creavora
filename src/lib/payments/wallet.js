import { PaymentProvider } from "./index.js";

export class WalletProvider extends PaymentProvider {
  constructor(txContext = null) {
    super();
    this.tx = txContext; // Transaction context for db atomicity
  }

  async createOrder(amount, currency = "INR", metadata = {}) {
    return {
      orderId: `wallet_order_${Math.floor(100000 + Math.random() * 900000)}`,
      provider: "WALLET",
      amount,
      currency,
      metadata
    };
  }

  async verifyPayment(paymentId, orderId, signature) {
    // Wallet payments are verified synchronously inside transactional queries
    return true;
  }

  async createRefund(paymentId, amount) {
    return {
      refundId: `wallet_rfnd_${Math.floor(100000 + Math.random() * 900000)}`,
      status: "processed"
    };
  }
}
