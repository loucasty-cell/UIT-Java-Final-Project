import { Link, useRouterState } from "@tanstack/react-router";
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
  FileText,
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

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Browse Skills", url: "/browse", icon: Compass },
  { title: "Find Mentors", url: "/mentors", icon: Users },
  { title: "Volunteer Forum", url: "/forum", icon: MessagesSquare },
  { title: "My Sessions", url: "/sessions", icon: CalendarClock },
  { title: "My List", url: "/watchlist", icon: BookmarkCheck },
];

const instructorItems = [
  { title: "Instructor Dashboard", url: "/instructor", icon: BookOpen },
];

const adminItems = [{ title: "Admin Portal", url: "/admin", icon: Shield }];

export function AppSidebar() {
  const { isInstructor, isAdmin } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const isActive = (path: string) => (path === "/" ? pathname === "/" : pathname.startsWith(path));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2.5 px-2 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-sky-600 text-white">
            <GraduationCap className="h-5 w-5" strokeWidth={1.5} />
          </div>
          {!collapsed && (
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold tracking-tight text-slate-900">
                SkillBridge
              </span>
              <span className="truncate text-[11px] text-slate-500">Learn. Teach. Earn.</span>
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

      <SidebarFooter>
        {!collapsed ? (
          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <span className="text-xs text-slate-500">Semester</span>
            <Badge variant="secondary" className="rounded-full border-0 bg-sky-50 text-sky-700">
              Fall 2026
            </Badge>
          </div>
        ) : null}
      </SidebarFooter>
    </Sidebar>
  );
}
