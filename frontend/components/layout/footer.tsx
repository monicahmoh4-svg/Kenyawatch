import Link from "next/link"
import { Shield, Github, Twitter, Mail } from "lucide-react"
export function Footer() {
  return (
    <footer className="border-t bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-kenya-teal text-white">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold">KenyaWatch AI</span>
            </div>
            <p className="text-sm text-slate-600">Making Kenyan government procurement transparent and accountable for all citizens.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contracts" className="text-slate-600 hover:text-kenya-teal">Contracts</Link></li>
              <li><Link href="/ghost-projects" className="text-slate-600 hover:text-kenya-teal">Ghost Projects</Link></li>
              <li><Link href="/report" className="text-slate-600 hover:text-kenya-teal">Report Corruption</Link></li>
              <li><Link href="/chat" className="text-slate-600 hover:text-kenya-teal">AI Investigator</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="https://www.ago.go.ke" target="_blank" className="text-slate-600 hover:text-kenya-teal">Auditor-General</a></li>
              <li><a href="https://eacc.go.ke" target="_blank" className="text-slate-600 hover:text-kenya-teal">EACC</a></li>
              <li><a href="https://ppra.go.ke" target="_blank" className="text-slate-600 hover:text-kenya-teal">PPRA</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Connect</h3>
            <div className="flex space-x-3">
              <a href="#" className="text-slate-600 hover:text-kenya-teal"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-slate-600 hover:text-kenya-teal"><Github className="h-5 w-5" /></a>
              <a href="#" className="text-slate-600 hover:text-kenya-teal"><Mail className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} KenyaWatch AI. Built for transparency and accountability.</p>
        </div>
      </div>
    </footer>
  )
}