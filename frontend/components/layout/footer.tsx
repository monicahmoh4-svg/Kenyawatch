import Link from "next/link"
import { Shield, Github, Mail, ExternalLink } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 text-white">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold">KenyaWatch AI</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Making Kenyan government procurement transparent and accountable for all citizens.
              Built with love for Kenya.
            </p>
          </div>
          <nav aria-label="Quick links">
            <h3 className="font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contracts" className="text-slate-400 hover:text-teal-400 transition-colors">Contracts</Link></li>
              <li><Link href="/ghost-projects" className="text-slate-400 hover:text-teal-400 transition-colors">Ghost Projects</Link></li>
              <li><Link href="/report" className="text-slate-400 hover:text-teal-400 transition-colors">Report Corruption</Link></li>
              <li><Link href="/chat" className="text-slate-400 hover:text-teal-400 transition-colors">AI Investigator</Link></li>
            </ul>
          </nav>
          <nav aria-label="Resources">
            <h3 className="font-semibold mb-4 text-white">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://www.ago.go.ke" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-1">
                  Auditor-General <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://eacc.go.ke" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-1">
                  EACC <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://ppra.go.ke" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-1">
                  PPRA / PPIP <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://data.open-contracting.org" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-1">
                  OCDS Data <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </nav>
          <div>
            <h3 className="font-semibold mb-4 text-white">Connect</h3>
            <div className="flex space-x-3">
              <a href="https://github.com/monicahmoh4-svg/Kenyawatch" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-teal-400 transition-colors" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
              <a href="mailto:info@kenyawatch.org" className="text-slate-400 hover:text-teal-400 transition-colors" aria-label="Email us">
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <div className="mt-6 space-y-2 text-sm">
              <Link href="/about" className="block text-slate-400 hover:text-teal-400 transition-colors">About</Link>
              <Link href="/contact" className="block text-slate-400 hover:text-teal-400 transition-colors">Contact</Link>
              <Link href="/privacy" className="block text-slate-400 hover:text-teal-400 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="block text-slate-400 hover:text-teal-400 transition-colors">Terms &amp; Conditions</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} KenyaWatch AI. Built for transparency and accountability.</p>
        </div>
      </div>
    </footer>
  )
}
