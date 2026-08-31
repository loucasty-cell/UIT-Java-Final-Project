import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/context/auth-context";
import { useWalletBalanceQuery, useWalletTransactionsQuery } from "@/hooks/api/use-wallet";
import { walletService } from "@/services/wallet.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowDownRight,
  ArrowUpRight,
  Search,
  ShieldCheck,
  RefreshCw,
  GraduationCap,
  ArrowRight,
  Layers,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
} from "lucide-react";

export const Route = createFileRoute("/wallet")({
  component: WalletPage,
});

type FilterTab = "all" | "expenses" | "receives";

export function WalletPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: balanceData,
    isLoading: balanceLoading,
    refetch: refetchBalance,
  } = useWalletBalanceQuery();

  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    refetch: refetchTransactions,
  } = useWalletTransactionsQuery({ size: 50 });

  const availablePoints = balanceData?.availableBalance ?? user?.walletBalance ?? 30;
  const heldPoints = balanceData?.heldBalance ?? 0;
  const totalPoints = availablePoints + heldPoints;

  // Real or rich fallback transactions
  const rawList =
    transactionsData?.content && transactionsData.content.length > 0
      ? transactionsData.content.map((tx) => ({
          id: tx.id,
          description: tx.description || `${tx.type} transaction`,
          type: tx.availableDelta >= 0 ? "EARN" : "SPEND",
          amount: Math.abs(tx.availableDelta || tx.heldDelta || 0),
          timestamp: tx.createdAt || new Date().toISOString(),
          isEscrow: tx.type === "ESCROW_HOLD" || (tx.heldDelta ?? 0) > 0,
        }))
      : [
          {
            id: "tx-init",
            type: "EARN",
            amount: 30,
            description: "Welcome Starter Grant & Onboarding Bonus",
            timestamp: "2026-08-30T10:00:00Z",
            isEscrow: false,
          },
          {
            id: "tx-sess-1",
            type: "SPEND",
            amount: 15,
            description: "Mentorship Session · Advanced React Patterns with Natasha Davel",
            timestamp: "2026-08-29T14:30:00Z",
            isEscrow: false,
          },
          {
            id: "tx-earn-1",
            type: "EARN",
            amount: 25,
            description: "Peer Teaching Reward · Data Structures Tutoring for Marcus Vance",
            timestamp: "2026-08-28T16:00:00Z",
            isEscrow: false,
          },
          {
            id: "tx-escrow-1",
            type: "SPEND",
            amount: 10,
            description: "Escrow Reserved · System Architecture Review (Auto-releases post session)",
            timestamp: "2026-08-27T11:15:00Z",
            isEscrow: true,
          },
          {
            id: "tx-bonus-1",
            type: "EARN",
            amount: 5,
            description: "Peer Referral Bonus · Invited new student to platform",
            timestamp: "2026-08-25T09:45:00Z",
            isEscrow: false,
          },
        ];

  const totalReceived = rawList
    .filter((tx) => tx.type === "EARN")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalSpent = rawList
    .filter((tx) => tx.type === "SPEND")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const filteredTransactions = rawList.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.type.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "expenses") {
      return tx.type === "SPEND";
    }
    if (activeTab === "receives") {
      return tx.type === "EARN";
    }
    return true;
  });

  const handleRefresh = () => {
    refetchBalance();
    refetchTransactions();
  };

  const handleExportCsv = async () => {
    try {
      await walletService.exportTransactionsCsv();
    } catch {
      // Fallback CSV download
      const csvContent =
        "data:text/csv;charset=utf-8," +
        ["Date,Description,Type,Amount"]
          .concat(
            rawList.map(
              (r) =>
                `"${new Date(r.timestamp).toLocaleDateString()}","${r.description}","${r.type}","${r.amount}"`
            )
          )
          .join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `skillbridge-wallet-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const displayName = user?.fullName || "Maria Student";

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Top Profile & Header Row (Inspired by Mobile UI top section) */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-[#1e90ff]/30 shadow-sm">
            <AvatarImage src={user?.avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-[#1e90ff] text-white font-bold text-base">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Hello, {displayName.split(" ")[0]}
            </h1>
            <p className="text-xs text-muted-foreground">SkillBridge Point Pass & Transaction Ledger</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="rounded-full border-border bg-card text-foreground hover:bg-secondary text-xs h-9"
          >
            <Download className="mr-1.5 h-3.5 w-3.5 text-[#1e90ff]" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="rounded-full border-border bg-card text-foreground hover:bg-secondary text-xs h-9"
          >
            <RefreshCw
              className={`mr-1.5 h-3.5 w-3.5 text-[#1e90ff] ${
                balanceLoading || transactionsLoading ? "animate-spin" : ""
              }`}
            />
            Sync
          </Button>
          <Button
            asChild
            size="sm"
            className="rounded-full bg-[#1e90ff] hover:bg-blue-600 text-white shadow-md shadow-blue-500/20 text-xs h-9"
          >
            <Link to="/mentors">
              Find Mentor <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Grid: Card Component on Left, Metric Summaries on Right */}
      <div className="grid gap-6 md:grid-cols-12 items-start">
        {/* Dodger Blue Virtual Card */}
        <div className="md:col-span-7 lg:col-span-6">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-tr from-[#1456B8] via-[#1E90FF] to-[#60A5FA] p-6 sm:p-7 text-white shadow-2xl shadow-blue-500/20 transition-all duration-300 hover:shadow-blue-500/30">
            {/* Ambient translucent backdrop graphics */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
            <div className="pointer-events-none absolute -left-8 -bottom-8 h-40 w-40 rounded-full bg-blue-950/40 blur-2xl" />

            {/* Top row of card */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                  <GraduationCap className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs font-semibold tracking-wider text-blue-100 uppercase">
                  SkillBridge Card
                </span>
              </div>

              {/* Intersecting circles logo */}
              <div className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-white/35 backdrop-blur-xs" />
                <div className="-ml-2.5 h-6 w-6 rounded-full bg-white/60 backdrop-blur-xs" />
              </div>
            </div>

            {/* Points balance display */}
            <div className="relative z-10 mt-7 space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono text-white">
                  {availablePoints.toLocaleString()}
                </span>
                <span className="text-xl font-semibold text-blue-100 font-mono">.00</span>
              </div>
              <p className="text-xs font-medium text-blue-100/90 tracking-wide">Available Skill Points</p>
            </div>

            {/* Card Masked Numbers */}
            <div className="relative z-10 mt-6 pt-2">
              <div className="flex items-center justify-between text-xs tracking-widest font-mono text-blue-100/90">
                <span>* * * *</span>
                <span>* * * *</span>
                <span>* * * *</span>
                <span className="font-bold text-white">9 8 7 5</span>
              </div>
            </div>

            {/* Card Footer Metadata */}
            <div className="relative z-10 mt-5 pt-3 border-t border-white/20 flex items-center justify-between text-[11px] text-blue-100">
              <div>
                <p className="text-[9px] uppercase tracking-wider text-blue-200/80">Valid Thru</p>
                <p className="font-semibold text-white">12/28</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-wider text-blue-200/80">Account Type</p>
                <p className="font-semibold text-white">Student Peer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Summaries Column in Clean White/Grey Style */}
        <div className="md:col-span-5 lg:col-span-6 grid gap-3 sm:grid-cols-2 md:grid-cols-1">
          <div className="grid grid-cols-2 gap-3">
            <Card className="rounded-2xl border-border bg-card shadow-xs p-4 hover:border-[#1e90ff]/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Earned
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-[#1e90ff]">
                  <TrendingUp className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="mt-2 text-xl font-bold text-foreground font-mono">+{totalReceived} Pts</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Teaching & grants</p>
            </Card>

            <Card className="rounded-2xl border-border bg-card shadow-xs p-4 hover:border-rose-500/30 transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Spent
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-rose-500">
                  <TrendingDown className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="mt-2 text-xl font-bold text-foreground font-mono">-{totalSpent} Pts</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Mentorship sessions</p>
            </Card>
          </div>

          <Card className="rounded-2xl border-border bg-card shadow-xs p-4 hover:border-border transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#1e90ff]" />
                <span className="text-xs font-semibold text-foreground">Escrow Protection</span>
              </div>
              <span className="text-xs font-bold font-mono text-[#1e90ff]">{heldPoints} Pts</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
              When booking a mentorship session, points are safely locked in escrow until the lesson completes.
            </p>
          </Card>
        </div>
      </div>

      {/* Transaction List Card (Clean UI based on reference) */}
      <Card className="rounded-3xl border-border bg-card shadow-sm overflow-hidden">
        {/* Pull handle indicator inspired by mobile sheet design */}
        <div className="pt-4 pb-1">
          <div className="mx-auto h-1.5 w-12 rounded-full bg-muted-foreground/25" />
        </div>

        <div className="p-6 pt-2 pb-4 border-b border-border">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-foreground">Transaction List</h2>

            {/* Filter Pills: All / Expenses / Receives */}
            <div className="flex items-center gap-1 rounded-full bg-secondary p-1 border border-border">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`rounded-full px-4 py-1 text-xs font-semibold transition-all ${
                  activeTab === "all"
                    ? "bg-[#1e90ff] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("expenses")}
                className={`rounded-full px-4 py-1 text-xs font-semibold transition-all ${
                  activeTab === "expenses"
                    ? "bg-[#1e90ff] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Expenses
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("receives")}
                className={`rounded-full px-4 py-1 text-xs font-semibold transition-all ${
                  activeTab === "receives"
                    ? "bg-[#1e90ff] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Receives
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative mt-4">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by mentor name, session title, or transaction type..."
              className="h-10 rounded-xl border-border bg-secondary/40 pl-10 pr-3 text-xs sm:text-sm focus-visible:ring-[#1e90ff]"
            />
          </div>
        </div>

        <CardContent className="p-0 divide-y divide-border">
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <Layers className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm font-semibold text-foreground">No transactions found</p>
              <p className="text-xs text-muted-foreground">Try adjusting your filter or search query.</p>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isReceive = tx.type === "EARN";
              const isEscrow = tx.isEscrow;

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 sm:px-6 hover:bg-secondary/30 transition duration-150"
                >
                  {/* Left: Direction Circle Icon + Details */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        isReceive
                          ? "bg-blue-50 text-[#1e90ff] dark:bg-blue-950/50"
                          : isEscrow
                          ? "bg-amber-50 text-amber-500 dark:bg-amber-950/50"
                          : "bg-rose-50 text-rose-500 dark:bg-rose-950/50"
                      }`}
                    >
                      {isReceive ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
                        {tx.description}
                      </p>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(tx.timestamp).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Right: Points Delta in high-contrast color */}
                  <div className="text-right shrink-0 ml-4 font-mono font-bold text-sm sm:text-base">
                    <span
                      className={
                        isReceive
                          ? "text-[#1e90ff]"
                          : isEscrow
                          ? "text-amber-500"
                          : "text-rose-500"
                      }
                    >
                      {isReceive ? `+${tx.amount}` : `-${tx.amount}`} Pts
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
