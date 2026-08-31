import { api } from "@/lib/api-client";
import {
  PageResponse,
  PaginationParams,
  TransferPointsRequest,
  WalletBalanceResponse,
  WalletTransactionResponse,
} from "@/types/api";

export const walletService = {
  /**
   * Get authenticated user's wallet balance
   * GET /api/v1/me/wallet or /api/v1/me/wallet/balance
   */
  async getBalance(): Promise<WalletBalanceResponse> {
    try {
      return await api.get<WalletBalanceResponse>("/api/v1/me/wallet");
    } catch {
      return api.get<WalletBalanceResponse>("/api/v1/me/wallet/balance");
    }
  },

  /**
   * Get paginated wallet transaction history ledger
   * GET /api/v1/me/wallet/transactions
   */
  async getTransactions(
    params: PaginationParams & { type?: string; from?: string; to?: string } = { page: 0, size: 20 }
  ): Promise<PageResponse<WalletTransactionResponse>> {
    return api.get<PageResponse<WalletTransactionResponse>>(
      "/api/v1/me/wallet/transactions",
      params
    );
  },

  /**
   * Export transactions as downloadable CSV file
   * GET /api/v1/me/wallet/transactions.csv — triggers browser download
   */
  async exportTransactionsCsv(filters?: { type?: string; from?: string; to?: string }): Promise<void> {
    const blob = await api.download("/api/v1/me/wallet/transactions.csv", {
      params: filters as Record<string, any>,
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const date = new Date().toISOString().slice(0, 10);
    a.download = `skillbridge-ledger-${date}.csv`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 1000);
  },

  /**
   * Direct point transfer to another peer user
   * POST /api/v1/wallet/transfer or /api/wallet/transfer
   */
  async transferPoints(
    data: TransferPointsRequest
  ): Promise<WalletTransactionResponse> {
    try {
      return await api.post<WalletTransactionResponse>("/api/v1/wallet/transfer", data);
    } catch {
      return api.post<WalletTransactionResponse>("/api/wallet/transfer", data);
    }
  },
};
