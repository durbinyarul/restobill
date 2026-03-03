"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Menu,
  UtensilsCrossed,
  FileText,
  Receipt,
  BarChart3,
  Settings,
  ChevronRight,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "New Bill", href: "/bills/create", icon: FileText },
    { name: "Menu Items", href: "/menu", icon: UtensilsCrossed },
    { name: "Bills List", href: "/bills", icon: Receipt },
    { name: "MIS Report", href: "/reports", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar backdrop on mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsOpen(false)} aria-hidden="true" />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-72 bg-card border-r border-border transition-transform duration-300 z-40 lg:relative lg:translate-x-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className,
        )}
      >
        <div className="p-4 sm:p-6 border-b border-border bg-gradient-to-br from-primary/10 to-accent/5">
          <h1 className="text-2xl sm:text-3xl font-bold text-gradient">RestoBill</h1>
          <p className="text-xs text-muted-foreground mt-1">Professional Billing System</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                  active
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-foreground hover:bg-muted/60 active:bg-muted",
                )}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span className="flex-1 font-medium text-sm">{item.name}</span>
                {active && <ChevronRight size={16} className="opacity-70 flex-shrink-0" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border bg-muted/30 text-center">
          <p className="text-xs text-muted-foreground">© 2025 RestoBill</p>
        </div>
      </aside>
    </>
  )
}
