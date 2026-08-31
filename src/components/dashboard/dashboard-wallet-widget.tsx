import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Clock,
  ExternalLink,
} from "lucide-react";
import type { WalletTransactionResponse } from "@/types/api";

interface DashboardWalletWidgetProps {
  availablePoints: number;
  heldPoints: number;
  totalEarned: number;
  totalSpent: number;
  transactions?: WalletTransactionResponse[] | Array<{
    id: string;
    date: string;
    activity: string;
    type: "earn" | "spend";
    amount: number;
  }>;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function DashboardWalletWidget({
  availablePoints,
  heldPoints,
  totalEarned,
  totalSpent,
  transactions = [],
  onRefresh,
  isLoading = false,
}: DashboardWalletWidgetProps) {
  const [filter, setFilter] = useState<"all" | "earn" | "spend">("all");

  const totalBalance = availablePoints + heldPoints;

  // Normalize transactions to a consistent display format
  const normalizedList = transactions.slice(0, 5).map((item: any) => {
    if (item.activity) {
      return {
        id: item.id || Math.random().toString(),
        description: item.activity,
        date: item.date,
        type: item.type === "earn" ? "EARN" : "SPEND",
        amount: item.amount,
      };
    }
    return {
      id: item.id || Math.random().toString(),
      description: item.description,
      date: item.timestamp
        ? new Date(item.timestamp).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })
        : "Recent",
      type: item.type || "EARN",
      amount: item.amount || 0,
    };
  });

  const filteredTransactions = normalizedList.filter((item) => {
    if (filter === "earn") return item.type === "EARN" || item.type === "REFUND";
    if (filter === "spend") return item.type === "SPEND" || item.type === "ESCROW_LOCK";
    return true;
  });

  return (
    <Card className="rounded-3xl border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Header with Prominent Icon and Quick Links */}
      <CardHeader className="p-6 pb-4 border-b border-border/80 bg-gradient-to-r from-card via-card to-secondary/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Prominent Glowing Dodger Blue Wallet Icon */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e90ff] to-[#0056D2] text-white shadow-lg shadow-blue-500/25">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold text-foreground">
                  Skill Points & Wallet
                </CardTitle>
                <Badge
                  variant="outline"
                  className="rounded-full border-[#1e90ff]/40 bg-[#1e90ff]/10 text-[#1e90ff] text-[10px] font-semibold px-2 py-0"
                >
                  <Sparkles className="mr-1 h-2.5 w-2.5" /> Peer Escrow
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Current point balance and recent transaction history
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-foreground"
                title="Refresh balance"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-[#1e90ff]" : ""}`} />
              </Button>
            )}
            <Button asChild size="sm" variant="outline" className="rounded-xl border-border bg-card text-xs hover:bg-secondary">
              <Link to="/wallet">
                My Wallet <ExternalLink className="ml-1.5 h-3.5 w-3.5 text-[#1e90ff]" />
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Main Balance Highlight Grid */}
        <div className="grid gap-4 sm:grid-cols-12 items-center">
          {/* Total Points Display Card */}
          <div className="sm:col-span-7 rounded-2xl bg-gradient-to-br from-[#1456B8] via-[#1E90FF] to-[#4DA4FF] p-5 text-white shadow-md relative overflow-hidden">
            <div className="pointer-events-none absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-white/20 blur-xl" />
            
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-100">
                Total Balance
              </span>
              <Coins className="h-4 w-4 text-white" />
            </div>

            <div className="relative z-10 mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-white">
                {availablePoints.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-blue-100 font-mono">Available Pts</span>
            </div>

            <div className="relative z-10 mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs text-blue-100">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-white" />
                <span>Held in Escrow:</span>
              </div>
              <span className="font-mono font-bold text-white">{heldPoints} Pts</span>
            </div>
          </div>

          {/* Quick Metrics Breakdown */}
          <div className="sm:col-span-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-secondary/40 p-3.5">
              <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <ArrowUpRight className="h-3.5 w-3.5 text-[#1e90ff]" /> Lifetime Earned
              </div>
              <p className="mt-1.5 text-lg font-bold text-foreground font-mono">+{totalEarned} Pts</p>
              <p className="text-[10px] text-muted-foreground truncate">Teaching & rewards</p>
            </div>

            <div className="rounded-2xl border border-border bg-secondary/40 p-3.5">
              <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <ArrowDownRight className="h-3.5 w-3.5 text-rose-500" /> Total Spent
              </div>
              <p className="mt-1.5 text-lg font-bold text-foreground font-mono">-{totalSpent} Pts</p>
              <p className="text-[10px] text-muted-foreground truncate">Mentorship sessions</p>
            </div>
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-bold text-foreground">Recent Points History</h3>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 rounded-full bg-secondary p-0.5 border border-border">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition ${
                  filter === "all"
                    ? "bg-[#1e90ff] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilter("earn")}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition ${
                  filter === "earn"
                    ? "bg-[#1e90ff] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Earned
              </button>
              <button
                type="button"
                onClick={() => setFilter("spend")}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition ${
                  filter === "spend"
                    ? "bg-[#1e90ff] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Spent
              </button>
            </div>
          </div>

          {/* History Item Rows */}
          <div className="divide-y divide-border/60 rounded-2xl border border-border bg-card overflow-hidden">
            {filteredTransactions.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No point activity recorded in this view.
              </div>
            ) : (
              filteredTransactions.map((tx) => {
                const isEarn = tx.type === "EARN" || tx.type === "REFUND";
                const isEscrow = tx.type === "ESCROW_LOCK";

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 sm:px-4 hover:bg-secondary/40 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          isEarn
                            ? "bg-blue-50 text-[#1e90ff] dark:bg-blue-950/50"
                            : isEscrow
                            ? "bg-amber-50 text-amber-500 dark:bg-amber-950/50"
                            : "bg-rose-50 text-rose-500 dark:bg-rose-950/50"
                        }`}
                      >
                        {isEarn ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {tx.description}
                        </p>
                        <span className="text-[10px] text-muted-foreground">{tx.date}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-3 font-mono font-bold text-xs sm:text-sm">
                      <span className={isEarn ? "text-[#1e90ff]" : isEscrow ? "text-amber-500" : "text-rose-500"}>
                        {isEarn ? `+${tx.amount}` : `-${tx.amount}`} Pts
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-1 flex justify-end">
            <Link
              to="/wallet"
              className="inline-flex items-center text-xs font-semibold text-[#1e90ff] hover:underline"
            >
              View detailed transaction ledger & full statements
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
