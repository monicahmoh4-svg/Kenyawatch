"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield, Menu, X, ExternalLink, Database, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"

const navigation = [
  { name: "Dashboard", href: "/" },
  { name: "Contracts", href: "/contracts" },
  { name: "Sync & Browse", href: "/sync", icon: Database },
  { name: "Ghost Projects", href: "/ghost-projects" },
  { name: "Report", href: "/report" },
  { name: "AI Investigator", href: "/chat" },
  { name: "Admin", href: "/admin", icon: Settings },
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-lg group-hover:shadow-xl transition-shadow">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors">KenyaWatch AI</h1>
              <p className="text-[10px] text-slate-500 tracking-wide uppercase">Procurement Accountability</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5",
                  pathname === item.href
                    ? "bg-teal-50 text-teal-700"
                    : "text-slate-600 hover:text-teal-600 hover:bg-slate-50"
                )}
              >
                {item.icon && <item.icon className="h-3.5 w-3.5" />}
                {item.name}
              </Link>
            ))}
            <a
              href="https://tenders.go.ke"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors flex items-center gap-1"
            >
              PPIP <ExternalLink className="h-3 w-3" />
            </a>
          </nav>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t space-y-1 bg-white">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block px-4 py-3 text-sm font-medium rounded-lg transition-colors flex items-center gap-2",
                  pathname === item.href
                    ? "bg-teal-600 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.name}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
