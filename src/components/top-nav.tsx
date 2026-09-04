import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { useLiveRefresh } from "@/hooks/use-live-refresh";
import { notificationsService } from "@/services/notifications.service";
import { walletService } from "@/services/wallet.service";
import type { NotificationResponse } from "@/types/api";
import { userDisplayName, userInitials } from "@/lib/auth-validation";
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

export function TopNav() {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [points, setPoints] = useState<number | null>(null);
  const [notificationError, setNotificationError] = useState("");
  const [search, setSearch] = useState("");
  const unread = notifications.filter((item) => !item.read).length;
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = userDisplayName(user);
  const [loggingOut, setLoggingOut] = useState(false);
  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const [items, wallet] = await Promise.all([
        notificationsService.getNotifications(),
        walletService.getBalance(),
      ]);
      setNotifications(items);
      setPoints(wallet.availablePoints);
      setNotificationError("");
    } catch {
      setNotificationError("Updates are unavailable. Please try again.");
    }
  }, [user]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  useLiveRefresh(refresh);
  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    // Clear local state immediately; report server revocation failures honestly.
    const revoke = logout();
    void navigate({ to: "/login", search: { redirect: "/" }, replace: true });
    try {
      await revoke;
      toast.success("You have signed out.");
    } catch {
      toast.warning(
        "Signed out on this device. The server could not be reached to revoke the session.",
      );
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 bg-background/70 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/50 sm:px-8">
      <SidebarTrigger className="shrink-0 hover:bg-accent hover:text-accent-foreground" />
      <Separator orientation="vertical" className="h-5 bg-border" />

      {/* Search */}
      <form
        className="relative flex-1 max-w-xl"
        onSubmit={(event) => {
          event.preventDefault();
          void navigate({ to: "/mentors", search: { q: search.trim() } });
        }}
      >
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.5}
        />
        <Input
          type="search"
          placeholder="Search skills or mentors..."
          aria-label="Search skills or mentors"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-11 rounded-xl border-border bg-card pl-10 pr-3 text-base shadow-none focus-visible:ring-brand-bright"
        />
      </form>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {/* Wallet */}
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => void navigate({ to: "/wallet" })}
                className="group flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                <Coins className="h-4 w-4" />
                <span>{points === null ? "—" : points} Pts</span>
                <Info className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
              </button>
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
            onOpenAutoFocus={() => void refresh()}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h4 className="text-sm font-semibold">Notifications</h4>
              <Badge variant="secondary" className="rounded-full">
                {unread} unread
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
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {n.message || n.detail}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground/80">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            {notificationError && (
              <p role="alert" className="p-3 text-sm">
                {notificationError}
              </p>
            )}
            {!notificationError && !notifications.length && (
              <p className="p-3 text-sm">No notifications yet.</p>
            )}
            <div className="border-t border-border p-2">
              <Button
                variant="ghost"
                disabled={!unread}
                className="w-full justify-center text-sm"
                onClick={() =>
                  void notificationsService
                    .markAllAsRead()
                    .then(refresh)
                    .catch(() => toast.error("Could not mark notifications as read."))
                }
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
              aria-label={`Account menu for ${displayName}`}
              className="flex items-center gap-2 rounded-xl border border-transparent p-1 pr-2 transition hover:border-border hover:bg-muted/60"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {userInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold leading-tight">{displayName}</p>
                <p className="text-[11px] leading-tight text-muted-foreground">{user?.email}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{displayName}</span>
                <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => void handleLogout()}
              disabled={loggingOut}
              className="cursor-pointer text-destructive focus:text-destructive"
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
