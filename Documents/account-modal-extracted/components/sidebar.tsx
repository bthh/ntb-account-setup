"use client"

import type * as React from "react"
import {
  LayoutDashboard,
  Users,
  FileText,
  ListChecks,
  TrendingUp,
  Shield,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <div
      className={`fixed left-0 top-0 flex flex-col h-screen bg-white border-r border-neutral-gray-200 transition-width duration-300 z-10 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex items-center p-4">
        <div className="flex items-center space-x-2">
          <div className="rounded-full bg-primary-blue-600 text-white w-8 h-8 flex items-center justify-center">
            <span className="font-bold">AF</span>
          </div>
          {!collapsed && <span className="text-lg font-semibold">Advisor Firm</span>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1">
          <SidebarItem collapsed={collapsed} icon={LayoutDashboard} label="Dashboard" active={false} />
          <SidebarItem collapsed={collapsed} icon={Users} label="Clients" active={false} />
          <SidebarItem collapsed={collapsed} icon={TrendingUp} label="Trading" active={false} />
          <SidebarItem collapsed={collapsed} icon={Shield} label="Servicing" active={true} />
          <SidebarItem collapsed={collapsed} icon={FileText} label="Reports" active={false} />
          <SidebarItem collapsed={collapsed} icon={ListChecks} label="Resources" active={false} />
        </nav>
      </div>

      <div className="p-4 border-t border-neutral-gray-200">
        <Button
          variant="ghost"
          onClick={onToggle}
          className="flex items-center space-x-2 w-full justify-start text-neutral-gray-700 hover:bg-neutral-gray-100"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>Collapse Sidebar</span>}
        </Button>
      </div>
    </div>
  )
}

interface SidebarItemProps {
  collapsed: boolean
  icon: React.ComponentType<{ className?: string }>
  label: string
  active: boolean
}

function SidebarItem({ collapsed, icon: Icon, label, active }: SidebarItemProps) {
  return (
    <Button
      variant="ghost"
      className={`flex items-center space-x-2 w-full justify-start ${active ? "font-semibold" : ""}`}
    >
      <Icon className="w-4 h-4" />
      {!collapsed && <span>{label}</span>}
    </Button>
  )
}
