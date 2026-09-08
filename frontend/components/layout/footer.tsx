import Link from "next/link"
import { Shield, Github, Mail, ExternalLink } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="container mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-base font-bold text-white">KenyaWatch</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Making Kenyan government procurement transparent and accountable for all citizens.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://github.com/monicahmoh4-svg/Kenyawatch" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-teal-400 transition-colors" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
              <a href="mailto:info@kenyawatch.org" className="text-slate-500 hover:text-teal-400 transition-colors" aria-label="Email us">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <nav aria-label="Platform links">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5">Platform</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/contracts" className="text-slate-400 hover:text-teal-400 transition-colors">Contracts</Link></li>
              <li><Link href="/ghost-projects" className="text-slate-400 hover:text-teal-400 transition-colors">Ghost Projects</Link></li>
              <li><Link href="/alerts" className="text-slate-400 hover:text-teal-400 transition-colors">Alert Center</Link></li>
              <li><Link href="/report" className="text-slate-400 hover:text-teal-400 transition-colors">Report Corruption</Link></li>
              <li><Link href="/chat" className="text-slate-400 hover:text-teal-400 transition-colors">AI Investigator</Link></li>
            </ul>
          </nav>

          {/* Resources */}
          <nav aria-label="External resources">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="https://tenders.go.ke" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-teal-400 transition-colors inline-flex items-center gap-1.5">
                  PPIP Portal <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://www.ago.go.ke" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-teal-400 transition-colors inline-flex items-center gap-1.5">
                  Auditor-General <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://eacc.go.ke" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-teal-400 transition-colors inline-flex items-center gap-1.5">
                  EACC <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://data.open-contracting.org" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-teal-400 transition-colors inline-flex items-center gap-1.5">
                  OCDS Data <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company links">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5">Company</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="text-slate-400 hover:text-teal-400 transition-colors">About</Link></li>
              <li><Link href="/contact" className="text-slate-400 hover:text-teal-400 transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="text-slate-400 hover:text-teal-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-slate-400 hover:text-teal-400 transition-colors">Terms &amp; Conditions</Link></li>
            </ul>
          </nav>
        </div>

        <div className="mt-14 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} KenyaWatch AI. All rights reserved.</p>
          <p>Built for transparency and accountability.</p>
        </div>
      </div>
    </footer>
  )
}
