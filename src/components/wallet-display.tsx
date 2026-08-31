import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingUp, TrendingDown, Lock } from "lucide-react";

interface WalletData {
  availablePoints: number;
  heldPoints: number;
  totalEarned: number;
  totalSpent: number;
}

interface WalletDisplayProps {
  wallet: WalletData;
}

function StatBox({
  icon,
  label,
  value,
  subtext,
  variant = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  subtext?: string;
  variant?: "default" | "success" | "warning" | "danger";
}) {
  const variants = {
    default: "bg-blue-50 border-blue-200",
    success: "bg-green-50 border-green-200",
    warning: "bg-amber-50 border-amber-200",
    danger: "bg-red-50 border-red-200",
  };

  const textVariants = {
    default: "text-blue-600",
    success: "text-green-600",
    warning: "text-amber-600",
    danger: "text-red-600",
  };

  return (
    <div className={`rounded-lg border p-4 ${variants[variant]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-foreground/70">{label}</p>
          <p className={`text-3xl font-bold mt-2 ${textVariants[variant]}`}>
            {value.toLocaleString()}
          </p>
          {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
        </div>
        <div className={`${textVariants[variant]} opacity-30`}>{icon}</div>
      </div>
    </div>
  );
}

/**
 * PHASE 5: Wallet Display Component
 * 
 * Shows:
 * - Available points balance
 * - Held points (in escrow)
 * - Total earned points
 * - Total spent points
 * - Point statistics and visualization
 */
export function WalletDisplay({ wallet }: WalletDisplayProps) {
  const totalBalance = wallet.availablePoints + wallet.heldPoints;
  const netPoints = wallet.totalEarned - wallet.totalSpent;

  return (
    <div className="space-y-6">
      {/* Main Balance Card */}
      <Card className="rounded-2xl border-0 shadow-sm p-6 bg-gradient-to-br from-blue-500 to-cyan-500">
        <div className="text-white">
          <p className="text-sm opacity-90">Total Balance</p>
          <p className="text-5xl font-bold mt-2">{totalBalance.toLocaleString()}</p>
          <div className="flex items-center gap-2 mt-3">
            <Coins className="w-4 h-4" />
            <span className="text-sm opacity-90">Points</span>
          </div>
        </div>
      </Card>

      {/* Balance Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatBox
          icon={<Coins className="w-8 h-8" />}
          label="Available"
          value={wallet.availablePoints}
          subtext="Ready to spend"
          variant="success"
        />

        <StatBox
          icon={<Lock className="w-8 h-8" />}
          label="Held Points"
          value={wallet.heldPoints}
          subtext="In escrow"
          variant="warning"
        />
      </div>

      {/* Earned vs Spent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatBox
          icon={<TrendingUp className="w-8 h-8" />}
          label="Total Earned"
          value={wallet.totalEarned}
          subtext="All time"
          variant="success"
        />

        <StatBox
          icon={<TrendingDown className="w-8 h-8" />}
          label="Total Spent"
          value={wallet.totalSpent}
          subtext="All time"
          variant="danger"
        />
      </div>

      {/* Net Points */}
      <Card className="rounded-2xl border-0 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Net Points</p>
            <p className={`text-3xl font-bold mt-2 ${netPoints >= 0 ? "text-green-600" : "text-red-600"}`}>
              {netPoints >= 0 ? "+" : ""}{netPoints.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Earned - Spent</p>
          </div>
          <div className="text-right">
            <Badge variant={netPoints >= 0 ? "default" : "secondary"}>
              {netPoints >= 0 ? "Positive" : "Negative"}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Info */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          💡 <strong>Points</strong> are earned by completing sessions and can be spent on courses or mentoring services.
        </p>
      </div>
    </div>
  );
}
