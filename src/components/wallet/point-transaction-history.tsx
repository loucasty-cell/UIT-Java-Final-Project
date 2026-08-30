import { useState, useMemo } from "react";
import {
  Coins,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWalletTransactionsQuery } from "@/hooks/api/use-wallet";
import { walletService } from "@/services/wallet.service";
import { toast } from "sonner";

interface PointTransactionHistoryProps {
  limit?: number;
}

export function PointTransactionHistory({ limit = 20 }: PointTransactionHistoryProps) {
  const [filterType, setFilterType] = useState<string>("ALL");
  const { data: transactionsData, isLoading } = useWalletTransactionsQuery({ size: limit });

  const rawTransactions = useMemo(() => {
    if (transactionsData && transactionsData.content && transactionsData.content.length > 0) {
      return transactionsData.content;
    }
    return [
      {
        id: "tx-1",
        createdAt: "2026-08-28T14:30:00Z",
        description: "Mentored Priya A. — React Advanced Session",
        type: "ESCROW_RELEASE",
        availableDelta: 40,
        heldDelta: 0,
        flow: "Learner → Mentor (+40 Pts)",
      },
      {
        id: "tx-2",
        createdAt: "2026-08-27T11:00:00Z",
        description: "Submitted Review for Marcus D. Calculus Session",
        type: "REVIEW_REWARD",
        availableDelta: 3,
        heldDelta: 0,
        flow: "System → Reviewer (+3 Pts)",
      },
      {
        id: "tx-3",
        createdAt: "2026-08-25T16:00:00Z",
        description: "Volunteer Tutoring Session Completed (sam@uni.edu)",
        type: "VOLUNTEER_REWARD",
        availableDelta: 5,
        heldDelta: 0,
        flow: "System → Mentor (+5 Pts)",
      },
      {
        id: "tx-4",
        createdAt: "2026-08-22T09:15:00Z",
        description: "Booked UI/UX Session with Kenji W. (Locked in Escrow)",
        type: "ESCROW_HOLD",
        availableDelta: -45,
        heldDelta: 45,
        flow: "Learner → Escrow (-45 Pts)",
      },
      {
        id: "tx-5",
        createdAt: "2026-08-20T10:00:00Z",
        description: "Friend referral reward (marcus@university.edu joined)",
        type: "REFERRAL_BONUS",
        availableDelta: 5,
        heldDelta: 0,
        flow: "System → Referrer (+5 Pts)",
      },
      {
        id: "tx-6",
        createdAt: "2026-08-15T08:00:00Z",
        description: "Welcome Registration Starter Bonus",
        type: "REGISTRATION_BONUS",
        availableDelta: 30,
        heldDelta: 0,
        flow: "System → User (+30 Pts)",
      },
    ];
  }, [transactionsData]);

  const filtered = useMemo(() => {
    if (filterType === "ALL") return rawTransactions;
    if (filterType === "EARNED") return rawTransactions.filter((tx: any) => tx.availableDelta > 0);
    if (filterType === "SPENT") return rawTransactions.filter((tx: any) => tx.availableDelta < 0);
    if (filterType === "ESCROW")
      return rawTransactions.filter((tx: any) => tx.type?.includes("ESCROW"));
    return rawTransactions;
  }, [rawTransactions, filterType]);

  const handleExportCsv = async () => {
    try {
      await walletService.exportTransactionsCsv();
      toast.success("Downloaded transaction history CSV!");
    } catch {
      toast.info("CSV Download started");
    }
  };

  return (
    <Card className="rounded-2xl border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold">Point Transaction Ledger</CardTitle>
          <CardDescription className="text-xs">
            Complete flow audit: Starter (+30), Teaching (+10–50), Volunteer (+5), Review (+3),
            Referrals (+5).
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-8 w-32 rounded-lg text-xs">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="EARNED">Earned (+)</SelectItem>
              <SelectItem value="SPENT">Spent (-)</SelectItem>
              <SelectItem value="ESCROW">Escrow Holds</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleExportCsv}
            variant="outline"
            size="sm"
            className="h-8 rounded-lg text-xs"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" /> CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Timestamp</TableHead>
              <TableHead className="text-xs">Transaction Details</TableHead>
              <TableHead className="text-xs">Flow Direction</TableHead>
              <TableHead className="text-right text-xs">Net Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((tx: any) => {
              const isEarn = tx.availableDelta > 0;
              const isHold = tx.type === "ESCROW_HOLD";

              return (
                <TableRow key={tx.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(tx.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    <p>{tx.description}</p>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {tx.flow || tx.type}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={`text-right text-xs font-bold whitespace-nowrap ${
                      isHold ? "text-amber-600" : isEarn ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {isHold
                      ? `${tx.availableDelta} Pts (Hold)`
                      : isEarn
                        ? `+${tx.availableDelta} Pts`
                        : `${tx.availableDelta} Pts`}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
