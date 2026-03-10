import { useState } from "react"
import { 
  LayoutDashboard, 
  FolderKanban, 
  Calendar, 
  Code, 
  Palette, 
  PenTool, 
  MessageSquare,
  Settings,
  Users,
  BarChart3,
  Bell,
  Contact2,
  FileText,
  AlarmClock,
  MessageCircle,
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import type { UserRole } from "@/types"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

type NavItem = {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  roles?: UserRole[] // si défini, seuls ces rôles voient l’entrée
}

const mainNavItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Clients", url: "/clients", icon: Contact2, roles: ["ADMIN", "ADMIN_ASSISTANT", "MANAGER"] },
  { title: "Projets", url: "/projects", icon: FolderKanban },
  { title: "Factures", url: "/invoices", icon: FileText, roles: ["ADMIN", "ADMIN_ASSISTANT", "MANAGER"] },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Équipe", url: "/team", icon: Users },
]

const moduleItems: NavItem[] = [
  { 
    title: "Community Manager",
    url: "/community",
    icon: Calendar,
    roles: ["ADMIN", "ADMIN_ASSISTANT", "COMMUNITY_MANAGER"],
  },
  { 
    title: "Développement",
    url: "/development",
    icon: Code,
    roles: ["ADMIN", "ADMIN_ASSISTANT", "DEVELOPER"],
  },
  { 
    title: "Design",
    url: "/design",
    icon: Palette,
    roles: ["ADMIN", "ADMIN_ASSISTANT", "DESIGNER"],
  },
  { 
    title: "Content Manager / Vidéaste",
    url: "/writing",
    icon: PenTool,
    roles: ["ADMIN", "ADMIN_ASSISTANT", "CONTENT_MANAGER"],
  },
]

const settingsItems: NavItem[] = [
  { 
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
    roles: ["ADMIN", "ADMIN_ASSISTANT"],
  },
  { 
    title: "Feedback clients",
    url: "/feedback",
    icon: MessageCircle,
    roles: ["ADMIN", "ADMIN_ASSISTANT", "MANAGER", "COMMUNITY_MANAGER", "CONTENT_MANAGER", "DESIGNER"],
  },
  { 
    title: "Rappels",
    url: "/reminders",
    icon: AlarmClock,
    roles: ["ADMIN", "ADMIN_ASSISTANT", "MANAGER"],
  },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Paramètres", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"
  const { user, logout } = useAuth()

  const isActive = (path: string) => {
    if (path === "/dashboard") return currentPath === "/dashboard"
    return currentPath.startsWith(path)
  }

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium shadow-sm" 
      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"

  const canSeeItem = (item: NavItem) => {
    if (!item.roles || !user) return true
    if (user.role === "ADMIN" || user.role === "ADMIN_ASSISTANT") return true
    return item.roles.includes(user.role)
  }

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} border-r border-sidebar-border bg-sidebar transition-all duration-300`}
      collapsible="icon"
    >
      <SidebarContent className="p-4">
        {/* Header */}
        <div className="mb-6">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">AC</span>
              </div>
              <div>
                <h1 className="font-semibold text-sidebar-foreground">Andal Creative</h1>
                <p className="text-xs text-sidebar-foreground/60">Marketing Digital 360°</p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
              <span className="text-primary-foreground font-bold text-sm">AC</span>
            </div>
          )}
        </div>

        {/* Navigation principale */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.filter(canSeeItem).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"} 
                      className={({ isActive }) => getNavCls({ isActive })}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Modules */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Modules
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {moduleItems.filter(canSeeItem).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => getNavCls({ isActive })}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Système
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.filter(canSeeItem).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => getNavCls({ isActive })}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout */}
        <div className="pt-4 border-t border-sidebar-border mt-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="w-full text-left text-sm text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors rounded-md px-2 py-1.5"
                >
                  Déconnexion
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}