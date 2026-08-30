import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/lib/api-client";
import { walletService } from "@/services/wallet.service";
import { PaginationParams, TransferPointsRequest } from "@/types/api";
import { queryKeys } from "./query-keys";

export function useWalletBalanceQuery() {
  const token = getAccessToken();
  return useQuery({
    queryKey: queryKeys.wallet.balance,
    queryFn: () => walletService.getBalance(),
    enabled: !!token,
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

export function useWalletTransactionsQuery(params?: PaginationParams) {
  const token = getAccessToken();
  return useQuery({
    queryKey: queryKeys.wallet.transactions(params),
    queryFn: () => walletService.getTransactions(params),
    enabled: !!token,
    staleTime: 1000 * 60,
  });
}

export function useTransferPointsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TransferPointsRequest) => walletService.transferPoints(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.balance });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}
