import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Bell, Search, Coins, LogOut, User, Info } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { walletService } from "@/services/wallet.service";
import { getAccessToken } from "@/lib/api-client";

type Notification = {
  id: string;
  title: string;
  detail: string;
  time: string;
  tone: "success" | "info" | "warning";
};

const notifications: Notification[] = [
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
  const [unread, setUnread] = useState(notifications.length);
  const wallet = useQuery({
    queryKey: ["wallet", "balance"],
    queryFn: () => walletService.getBalance(),
    enabled: Boolean(getAccessToken()),
  });
  const availablePoints = wallet.data?.availablePoints ?? 50;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 bg-background/70 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/50 sm:px-8">
      <SidebarTrigger className="shrink-0 hover:bg-accent hover:text-accent-foreground" />
      <Separator orientation="vertical" className="h-5 bg-border" />

      {/* Search */}
      <div className="relative flex-1 max-w-xl">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.5}
        />
        <Input
          type="search"
          placeholder="Search skills, mentors, or forum topics..."
          className="h-11 rounded-xl border-border bg-card pl-10 pr-3 text-base shadow-none focus-visible:ring-brand-bright"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {/* Wallet */}
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/wallet"
                className="group flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                <Coins className="h-4 w-4" />
                <span>{availablePoints} Pts</span>
                <Info className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="text-xs leading-relaxed">
                Your wallet balance. Points are held in{" "}
                <span className="font-semibold text-amber-500">escrow</span> during active sessions
                and released once both parties confirm completion.
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
              {unread > 0 && (
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
            onOpenAutoFocus={() => setUnread(0)}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h4 className="text-sm font-semibold">Notifications</h4>
              <Badge variant="secondary" className="rounded-full">
                {notifications.length} new
              </Badge>
            </div>
            <ul className="max-h-80 divide-y divide-border overflow-y-auto">
              {notifications.map((n) => (
                <li key={n.id} className="flex gap-3 px-4 py-3 hover:bg-muted/50">
                  <span
                    className={
                      "mt-1 h-2 w-2 shrink-0 rounded-full " +
                      (n.tone === "success"
                        ? "bg-success"
                        : n.tone === "warning"
                          ? "bg-warning"
                          : "bg-primary")
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
              <Button variant="ghost" className="w-full justify-center text-sm">
                View all notifications
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
                  AR
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold leading-tight">Ava Ramirez</p>
                <p className="text-[11px] leading-tight text-muted-foreground">Computer Science</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Ava Ramirez</span>
                <span className="text-xs font-normal text-muted-foreground">
                  Computer Science · Junior
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
