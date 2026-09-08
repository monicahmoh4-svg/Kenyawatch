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

  const dismiss = (accepted: boolean) => {
    localStorage.setItem("kw-cookie-dismissed", accepted ? "accepted" : "declined")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6" role="dialog" aria-label="Cookie notice">
      <div className="container mx-auto max-w-3xl">
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-5 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <Shield className="h-4 w-4 text-teal-600" />
              <span className="text-sm font-semibold text-slate-900">Cookie Notice</span>
            </div>
            <p className="text-sm text-slate-600 flex-1 leading-relaxed">
              We use minimal cookies for platform functionality. No tracking or advertising cookies.
              Read our{" "}
              <Link href="/privacy" className="text-teal-600 hover:text-teal-700 underline underline-offset-2">
                Privacy Policy
              </Link>
              {" "}for details.
            </p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button onClick={() => dismiss(false)} variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700">
                Decline
              </Button>
              <Button onClick={() => dismiss(true)} size="sm" className="bg-teal-600 hover:bg-teal-700">
                Accept
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
