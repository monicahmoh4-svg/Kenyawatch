"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem("kw-cookie-dismissed")
    if (!dismissed) setVisible(true)
  }, [])

  const dismiss = () => {
    localStorage.setItem("kw-cookie-dismissed", "true")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6" role="dialog" aria-label="Cookie notice">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-slate-900 text-white rounded-2xl shadow-2xl p-6 md:p-8 border border-slate-700">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center gap-3 flex-shrink-0">
              <Shield className="h-6 w-6 text-teal-400" />
              <span className="font-semibold">Cookie Notice</span>
            </div>
            <p className="text-sm text-slate-300 flex-1 leading-relaxed">
              We use minimal cookies to ensure the platform works correctly. We do not use tracking or advertising cookies.
              Read our{" "}
              <Link href="/privacy" className="underline text-teal-400 hover:text-teal-300">
                Privacy Policy
              </Link>
              {" "}for details.
            </p>
            <Button
              onClick={dismiss}
              className="bg-teal-600 hover:bg-teal-700 text-white flex-shrink-0"
              size="sm"
            >
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
