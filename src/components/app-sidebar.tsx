import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Users,
  MessagesSquare,
  CalendarClock,
  Shield,
  GraduationCap,
  Compass,
  BookmarkCheck,
  BookOpen,
  Wallet,
  Coins,
  ArrowRight,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";
import { useWalletBalanceQuery } from "@/hooks/api/use-wallet";
import { cn } from "@/lib/utils";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Browse Skills", url: "/browse", icon: Compass },
  { title: "Find Mentors", url: "/mentors", icon: Users },
  { title: "Volunteer Forum", url: "/forum", icon: MessagesSquare },
  { title: "My Sessions", url: "/sessions", icon: CalendarClock },
  { title: "My Wallet", url: "/wallet", icon: Wallet },
  { title: "My List", url: "/watchlist", icon: BookmarkCheck },
];

const instructorItems = [
  { title: "Instructor Dashboard", url: "/instructor", icon: BookOpen },
];

const adminItems = [{ title: "Admin Portal", url: "/admin", icon: Shield }];

export function AppSidebar() {
  const { user, isInstructor, isAdmin } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const { data: walletData } = useWalletBalanceQuery();

  const availablePoints = (walletData as any)?.availableBalance ?? (walletData as any)?.availablePoints ?? (user as any)?.walletBalance ?? 30;

  const isActive = (path: string) => (path === "/" ? pathname === "/" : pathname.startsWith(path));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className={cn(collapsed && "p-2 items-center")}>
        <Link
          to="/"
          className={cn(
            "flex items-center rounded-lg transition-all",
            collapsed
              ? "w-full justify-center p-0 py-2"
              : "gap-2.5 px-2 py-3"
          )}
          title="SkillBridge"
        >
          <div
            className={cn(
              "flex shrink-0 aspect-square items-center justify-center rounded-xl bg-[#1e90ff] text-white shadow-md shadow-blue-500/20 transition-all",
              collapsed ? "h-8 w-8" : "h-9 w-9"
            )}
          >
            <GraduationCap
              className={cn("transition-all", collapsed ? "h-4 w-4" : "h-5 w-5")}
              strokeWidth={1.5}
            />
          </div>
          {!collapsed && (
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold tracking-tight text-foreground">
                SkillBridge
              </span>
              <span className="truncate text-[11px] text-muted-foreground">Learn. Teach. Earn.</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Main navigation — visible to all authenticated users */}
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Workspace</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Instructor navigation — only for MENTOR or ADMIN */}
        {(isInstructor || isAdmin) && (
          <SidebarGroup>
            {!collapsed && <SidebarGroupLabel>Instructor</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {instructorItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Admin navigation — only for ADMIN */}
        {isAdmin && (
          <SidebarGroup>
            {!collapsed && <SidebarGroupLabel>Administration</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-2 space-y-2">
        {!collapsed && (
          <Link
            to="/wallet"
            className="group block rounded-2xl border border-border bg-gradient-to-br from-card to-secondary/50 p-3 shadow-xs hover:border-[#1e90ff]/50 transition duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#1e90ff]/10 text-[#1e90ff]">
                  <Wallet className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-foreground">My Wallet</span>
              </div>
              <span className="text-xs font-bold font-mono text-[#1e90ff]">
                {availablePoints} Pts
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground group-hover:text-foreground">
              <span>View point ledger</span>
              <ArrowRight className="h-3 w-3 text-[#1e90ff] transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        )}

        {!collapsed ? (
          <div className="flex items-center justify-between gap-2 px-2 py-1">
            <span className="text-xs text-muted-foreground">Semester</span>
            <Badge variant="secondary" className="rounded-full border-0 bg-secondary text-[#1e90ff] text-[10px]">
              Fall 2026
            </Badge>
          </div>
        ) : null}
      </SidebarFooter>
    </Sidebar>
  );
}
