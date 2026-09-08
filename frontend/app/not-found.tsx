import Link from "next/link"
import { Shield, Home, FileText, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
      <div className="text-center px-4 max-w-md">
        <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-6">
          <Shield className="h-7 w-7 text-slate-400" />
        </div>
        <h1 className="text-5xl font-bold text-slate-900 mb-3">404</h1>
        <h2 className="text-xl font-semibold text-slate-700 mb-3">Page Not Found</h2>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col items-center gap-3">
          <Link href="/" className="w-full sm:w-auto">
            <Button className="bg-teal-600 hover:bg-teal-500 w-full sm:w-auto px-6">
              <Home className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/contracts" className="text-slate-500 hover:text-teal-600 transition-colors flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" /> Browse Contracts
            </Link>
            <Link href="/chat" className="text-slate-500 hover:text-teal-600 transition-colors flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" /> AI Investigator
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
