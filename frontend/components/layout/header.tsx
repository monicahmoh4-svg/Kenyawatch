"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"

const navigation = [
  { name: "Dashboard", href: "/" },
  { name: "Contracts", href: "/contracts" },
  { name: "Ghost Projects", href: "/ghost-projects" },
  { name: "Report", href: "/report" },
  { name: "AI Investigator", href: "/chat" },
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-kenya-teal text-white">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">KenyaWatch AI</h1>
              <p className="text-xs text-slate-500">Procurement Accountability</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className={cn("text-sm font-medium transition-colors hover:text-kenya-teal", pathname === item.href ? "text-kenya-teal" : "text-slate-600")}>
                {item.name}
              </Link>
            ))}
          </nav>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <Link key={item.href} href={item.href} className={cn("text-sm font-medium px-3 py-2 rounded-md transition-colors", pathname === item.href ? "bg-kenya-teal/10 text-kenya-teal" : "text-slate-600 hover:bg-slate-100")} onClick={() => setMobileMenuOpen(false)}>
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}