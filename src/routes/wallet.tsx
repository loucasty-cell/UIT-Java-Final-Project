import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Coins, RefreshCw, Wallet as WalletIcon } from "lucide-react";
import { walletService } from "@/services/wallet.service";
import { getAccessToken } from "@/lib/api-client";
import type { WalletTransactionResponse } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/wallet")({
  head: () => ({ meta: [{ title: "Wallet · SkillBridge" }] }),
  component: WalletPage,
});

const MOCK_BALANCE = { availablePoints: 120, heldPoints: 35, totalEarned: 260, totalSpent: 105 };
const MOCK_TRANSACTIONS: WalletTransactionResponse[] = [
  { id: "mock-1", type: "REGISTRATION_BONUS", availableDelta: 50, heldDelta: 0, description: "Welcome bonus", createdAt: "2026-08-30T10:00:00Z" },
  { id: "mock-2", type: "VOLUNTEER_REWARD", availableDelta: 40, heldDelta: 0, description: "Peer teaching reward", createdAt: "2026-08-29T14:30:00Z" },
  { id: "mock-3", type: "ESCROW_HOLD", availableDelta: -35, heldDelta: 35, description: "Mentorship session escrow", createdAt: "2026-08-28T09:15:00Z" },
];

function WalletPage() {
  const enabled = Boolean(getAccessToken());
  const balance = useQuery({
    queryKey: ["wallet", "balance"],
    queryFn: () => walletService.getBalance(),
    enabled,
  });
  const transactions = useQuery({
    queryKey: ["wallet", "transactions", 0, 50],
    queryFn: () => walletService.getTransactions({ page: 0, size: 50 }),
    enabled,
  });
  const points = balance.data ?? MOCK_BALANCE;
  const rows = transactions.data?.content?.length ? transactions.data.content : MOCK_TRANSACTIONS;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Wallet</h1>
          <p className="text-sm text-muted-foreground">Manage your SkillBridge points and activity.</p>
        </div>
        <Button variant="outline" onClick={() => { void balance.refetch(); void transactions.refetch(); }}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      {!enabled && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4 text-sm text-muted-foreground">
          <span>Sign in to view your wallet.</span>
          <Button asChild size="sm"><Link to="/login">Sign in</Link></Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2 border-primary/20 bg-card shadow-sm">
          <CardHeader><CardTitle className="flex items-center gap-2 text-foreground"><WalletIcon className="h-5 w-5 text-primary" /> Available points</CardTitle></CardHeader>
          <CardContent><div className="text-4xl font-bold text-primary">{points.availablePoints}</div><p className="mt-1 text-muted-foreground">Total: {points.totalEarned - points.totalSpent} points</p></CardContent>
        </Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Coins className="h-5 w-5 text-primary" /> Held in escrow</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{points.heldPoints}</div><p className="text-sm text-muted-foreground">Released when sessions complete</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent transactions</CardTitle></CardHeader>
        <CardContent className="p-0">
          {transactions.isLoading ? <p className="p-6 text-sm text-muted-foreground">Loading transactions…</p> : rows.length === 0 ? <p className="p-6 text-sm text-muted-foreground">No transactions yet.</p> : <div className="divide-y">{rows.map((tx: WalletTransactionResponse) => { const amount = tx.availableDelta || tx.amount || 0; const positive = amount >= 0; return <div key={tx.id} className="flex items-center justify-between gap-4 p-4"><div className="flex min-w-0 items-center gap-3"><div className={`rounded-full p-2 ${positive ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>{positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}</div><div className="min-w-0"><p className="truncate text-sm font-medium">{tx.description || tx.type}</p><p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleString()}</p></div></div><Badge variant={positive ? "secondary" : "outline"}>{positive ? "+" : ""}{amount} pts</Badge></div>; })}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
