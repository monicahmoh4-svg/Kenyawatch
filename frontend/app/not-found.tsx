import Link from "next/link"
import { Shield, ArrowRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
      <div className="text-center px-4 max-w-lg">
        <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <Shield className="h-10 w-10 text-teal-600" />
        </div>
        <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-700 mb-4">Page Not Found</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          The page you are looking for does not exist or has been moved.
          Let us help you find what you need.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 px-8">
              <Home className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/contracts">
            <Button variant="outline" className="px-8">
              Browse Contracts
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
