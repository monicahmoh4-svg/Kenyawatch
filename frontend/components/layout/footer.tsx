import Link from "next/link"
import { Shield, Github, Mail, ExternalLink } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
                <Shield className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-slate-900">KenyaWatch AI</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Making Kenyan government procurement transparent and accountable for all citizens.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="https://github.com/monicahmoh4-svg/Kenyawatch" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-600 transition-colors" aria-label="GitHub">
                <Github className="h-4 w-4" />
              </a>
              <a href="mailto:info@kenyawatch.org" className="text-slate-400 hover:text-slate-600 transition-colors" aria-label="Email us">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <nav aria-label="Platform links">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">Platform</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/contracts" className="text-slate-500 hover:text-teal-600 transition-colors">Contracts</Link></li>
              <li><Link href="/ghost-projects" className="text-slate-500 hover:text-teal-600 transition-colors">Ghost Projects</Link></li>
              <li><Link href="/report" className="text-slate-500 hover:text-teal-600 transition-colors">Report Corruption</Link></li>
              <li><Link href="/chat" className="text-slate-500 hover:text-teal-600 transition-colors">AI Investigator</Link></li>
            </ul>
          </nav>

          {/* Resources */}
          <nav aria-label="External resources">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">Resources</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="https://tenders.go.ke" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-teal-600 transition-colors inline-flex items-center gap-1">
                  PPIP Portal <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://www.ago.go.ke" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-teal-600 transition-colors inline-flex items-center gap-1">
                  Auditor-General <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://eacc.go.ke" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-teal-600 transition-colors inline-flex items-center gap-1">
                  EACC <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://data.open-contracting.org" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-teal-600 transition-colors inline-flex items-center gap-1">
                  OCDS Data <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company links">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="text-slate-500 hover:text-teal-600 transition-colors">About</Link></li>
              <li><Link href="/contact" className="text-slate-500 hover:text-teal-600 transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="text-slate-500 hover:text-teal-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-slate-500 hover:text-teal-600 transition-colors">Terms &amp; Conditions</Link></li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} KenyaWatch AI. All rights reserved.</p>
          <p>Built for transparency and accountability.</p>
        </div>
      </div>
    </footer>
  )
}
