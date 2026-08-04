// Abstract payment gateway provider interface
export class PaymentProvider {
  /**
   * Create a new payment gateway order
   * @param {number} amount - Order amount in currency units
   * @param {string} currency - e.g. "INR", "USD"
   * @param {object} metadata - Extra details
   * @returns {Promise<{orderId: string, provider: string, amount: number}>}
   */
  async createOrder(amount, currency, metadata) {
    throw new Error("createOrder not implemented");
  }

  /**
   * Verify signature callback from payment gateway
   * @param {string} paymentId
   * @param {string} orderId
   * @param {string} signature
   * @returns {Promise<boolean>}
   */
  async verifyPayment(paymentId, orderId, signature) {
    throw new Error("verifyPayment not implemented");
  }

  /**
   * Refund a processed payment transaction
   * @param {string} paymentId
   * @param {number} amount
   * @returns {Promise<{refundId: string, status: string}>}
   */
  async createRefund(paymentId, amount) {
    throw new Error("createRefund not implemented");
  }
}
