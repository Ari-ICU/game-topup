/**
 * Frontend Service Layer for API Communication
 * Resolves local Next.js proxy endpoints to process store checkout activities securely.
 */

export interface CreateTransactionInput {
  packageId: string;
  paymentMethod: string;
  playerInfo: Record<string, any>;
  promoCode?: string;
  vipDiscountPercentage?: number;
}

export const apiService = {
  /**
   * Fetch all active games
   */
  async getGames(): Promise<any[]> {
    const res = await fetch("/api/games");
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch games");
    }
    return await res.json();
  },

  /**
   * Fetch game details and denomination packages from proxy endpoint
   */
  async getGameDetails(slug: string): Promise<any> {
    const res = await fetch(`/api/games/${slug}`);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch details for slug: ${slug}`);
    }

    return await res.json();
  },

  /**
   * Initiate a new pending checkout transaction
   */
  async createTransaction(payload: CreateTransactionInput): Promise<any> {
    const res = await fetch(`/api/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || "Failed to create transaction");
    }

    return data;
  },

  /**
   * Check/poll details of a transaction
   */
  async getTransaction(id: string): Promise<any> {
    const res = await fetch(`/api/transactions/${id}`);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch transaction details");
    }

    return await res.json();
  },

  /**
   * Trigger the payment completion simulation webhook
   */
  async simulatePayment(id: string): Promise<any> {
    const res = await fetch(`/api/transactions/${id}/pay`, {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.error?.message || "Failed to simulate payment callback"
      );
    }

    return data;
  }
};
