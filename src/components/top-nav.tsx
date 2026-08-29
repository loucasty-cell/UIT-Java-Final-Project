import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, Search, Coins, LogOut, User, Info, GraduationCap, Sparkles } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth-context";
import { useWalletBalanceQuery } from "@/hooks/api/use-wallet";
import {
  useMarkAllNotificationsReadMutation,
  useNotificationsQuery,
  useUnreadNotificationsCountQuery,
} from "@/hooks/api/use-notifications";
import { toast } from "sonner";

type FallbackNotification = {
  id: string;
  title: string;
  detail: string;
  time: string;
  tone: "success" | "info" | "warning";
};

const fallbackNotifications: FallbackNotification[] = [
  {
    id: "1",
    title: "Mentor accepted your request",
    detail: "Priya A. accepted your Calculus II session request.",
    time: "2m ago",
    tone: "success",
  },
  {
    id: "2",
    title: "New reply on your forum post",
    detail: "Marcus D. replied to your Data Structures thread.",
    time: "1h ago",
    tone: "info",
  },
  {
    id: "3",
    title: "Escrow released",
    detail: "10 pts released for your Data Structures session.",
    time: "Yesterday",
    tone: "warning",
  },
];

export function TopNav() {
  const { user, logout, isAuthenticated, isLearner, isInstructor, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { data: walletData } = useWalletBalanceQuery();
  const { data: notificationsData } = useNotificationsQuery();
  const { data: unreadCountData } = useUnreadNotificationsCountQuery();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();

  const [localDismissed, setLocalDismissed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Active points and held points — never fake balance per forbackend.md:16
  const availablePoints = walletData?.availablePoints ?? 0;
  const heldPoints = walletData?.heldPoints ?? 0;

  // Notifications
  const items =
    notificationsData && notificationsData.length > 0
      ? notificationsData.map((n) => ({
          id: n.id,
          title: n.title,
          detail: n.message || n.detail || "",
          time: new Date(n.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          tone: (n.tone as any) || "info",
        }))
      : fallbackNotifications;

  const unreadCount = localDismissed
    ? 0
    : unreadCountData?.unreadCount ?? items.length;

  const displayName =
    (user as any)?.displayName ||
    ((user as any)?.firstName ? `${(user as any).firstName} ${(user as any).lastName || ""}`.trim() : "Ava Ramirez");

  const major = (user as any)?.major || "Computer Science";
  const yearOfStudy = (user as any)?.yearOfStudy ? `Year ${(user as any).yearOfStudy}` : "Junior";

  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AR";

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate({ to: "/login" });
    } catch {
      toast.error("Logout failed");
    }
  };

  const handleOpenNotifications = () => {
    // Per api.md:323 — opening popover must NOT auto mark read; user must explicitly click "Mark all as read"
    // We keep localDismissed for dot animation only if user explicitly dismissed via button
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/browse", search: { q: searchQuery.trim() } });
    }
  };

  // Build role badges for the user dropdown
  const roleBadges: { label: string; variant: "default" | "secondary" | "destructive" | "outline" }[] = [];
  if (isAdmin) roleBadges.push({ label: "Admin", variant: "destructive" });
  if (isInstructor) roleBadges.push({ label: "Instructor", variant: "default" });
  if (isLearner && !isInstructor && !isAdmin) roleBadges.push({ label: "Learner", variant: "secondary" });

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 bg-background/70 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/50 sm:px-8">
      <SidebarTrigger className="shrink-0 hover:bg-sky-50" />
      <Separator orientation="vertical" className="h-5 bg-slate-100" />

      {/* Search — navigates to /browse on submit */}
      <form onSubmit={handleSearch} className="relative flex-1 max-w-xl">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          strokeWidth={1.5}
        />
        <Input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search skills, mentors, or forum topics..."
          className="h-11 rounded-xl border-slate-100 bg-white pl-10 pr-3 text-base shadow-none focus-visible:ring-sky-200"
        />
      </form>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {/* Become Instructor CTA — only for learner-only users */}
        {isLearner && !isInstructor && !isAdmin && (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/mentor-application"
                  className="group hidden items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-sm font-semibold text-violet-700 shadow-sm transition hover:bg-violet-100 sm:flex"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Teach</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Become an instructor and earn points by teaching!</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Wallet */}
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="group flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                <Coins className="h-4 w-4" />
                <span>{availablePoints} Pts</span>
                <Info className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="text-xs leading-relaxed">
                Your wallet balance: <span className="font-semibold">{availablePoints} available</span>.
                {heldPoints > 0 && (
                  <span>
                    {" "}(<span className="font-semibold text-amber-500">{heldPoints} pts held in escrow</span> during active sessions).
                  </span>
                )}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-xl"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-[22rem] rounded-xl p-0"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h4 className="text-sm font-semibold">Notifications</h4>
              <Badge variant="secondary" className="rounded-full">
                {items.length} total
              </Badge>
            </div>
            <ul className="max-h-80 divide-y divide-border overflow-y-auto">
              {items.map((n) => (
                <li key={n.id} className="flex gap-3 px-4 py-3 hover:bg-muted/50">
                  <span
                    className={
                      "mt-1 h-2 w-2 shrink-0 rounded-full " +
                      (n.tone === "success"
                        ? "bg-emerald-500"
                        : n.tone === "warning"
                          ? "bg-amber-500"
                          : "bg-sky-500")
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{n.title}</p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{n.detail}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground/80">{n.time}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-border p-2">
              <Button
                variant="ghost"
                className="w-full justify-center text-sm"
                onClick={() => {
                  if (isAuthenticated) markAllReadMutation.mutate();
                  setLocalDismissed(true);
                  toast.success("All marked as read");
                }}
              >
                Mark all as read
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-transparent p-1 pr-2 transition hover:border-border hover:bg-muted/60"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold leading-tight">{displayName}</p>
                <p className="text-[11px] leading-tight text-muted-foreground">{major}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold">{displayName}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {major} · {yearOfStudy}
                </span>
                {/* Role badges */}
                <div className="flex flex-wrap gap-1">
                  {roleBadges.map(({ label, variant }) => (
                    <Badge key={label} variant={variant} className="rounded-full text-[10px] px-2 py-0">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Dashboard Profile
              </Link>
            </DropdownMenuItem>
            {isLearner && !isInstructor && (
              <>
                <DropdownMenuItem asChild>
                  <Link to="/mentor-application" className="cursor-pointer">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Become an Instructor
                  </Link>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
