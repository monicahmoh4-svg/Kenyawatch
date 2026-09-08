"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield, Menu, X, ExternalLink, Database, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { AlertNotification } from "@/components/AlertNotification"

const navigation = [
  { name: "Dashboard", href: "/" },
  { name: "Contracts", href: "/contracts" },
  { name: "Sync & Browse", href: "/sync", icon: Database },
  { name: "Ghost Projects", href: "/ghost-projects" },
  { name: "Alerts", href: "/alerts", icon: Bell },
  { name: "Report", href: "/report" },
  { name: "AI Investigator", href: "/chat" },
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [mobileMenuOpen])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto px-4">
        <div className="flex h-14 md:h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="KenyaWatch AI - Home">
            <div className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-lg bg-teal-600 text-white">
              <Shield className="h-4 w-4 md:h-5 md:w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm md:text-base font-bold text-slate-900 leading-tight">KenyaWatch</span>
              <span className="text-[9px] md:text-[10px] text-slate-400 tracking-wider uppercase leading-tight">AI Platform</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  pathname === item.href
                    ? "text-teal-700 bg-teal-50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                {item.name}
              </Link>
            ))}
            <a
              href="https://tenders.go.ke"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 ml-1"
            >
              PPIP <ExternalLink className="h-3 w-3" />
            </a>
          </nav>

          <div className="flex items-center gap-1">
            <AlertNotification />
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-200 ease-out",
            mobileMenuOpen ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0"
          )}
        >
          <nav className="border-t border-slate-100 pt-3 space-y-0.5" aria-label="Mobile navigation">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                  pathname === item.href
                    ? "text-teal-700 bg-teal-50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
