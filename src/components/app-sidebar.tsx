import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, MessagesSquare, CalendarClock, Shield } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
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
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Find Mentors", url: "/mentors", icon: Users },
  { title: "Volunteer Forum", url: "/forum", icon: MessagesSquare },
  { title: "My Sessions", url: "/sessions", icon: CalendarClock },
];

const adminItems = [{ title: "Admin Portal", url: "/admin", icon: Shield }];

export function AppSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const isActive = (path: string) => (path === "/" ? pathname === "/" : pathname.startsWith(path));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link
          to="/"
          aria-label="SkillBridge home"
          className={
            collapsed
              ? "flex items-center justify-center px-0 py-3"
              : "flex items-center rounded-xl bg-white px-2 py-3 shadow-sm"
          }
        >
          <BrandLogo showText={!collapsed} className={collapsed ? "gap-0" : undefined} />
        </Link>
      </SidebarHeader>

      <SidebarContent>
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
    </Sidebar>
  );
}
