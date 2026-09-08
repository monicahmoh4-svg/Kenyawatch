import type { Metadata } from "next"
import { Mail, Shield, ExternalLink } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact Us - KenyaWatch AI",
  description: "Get in touch with the KenyaWatch team. Report issues, suggest features, or learn more about our procurement transparency platform.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-slate-900 text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-3">
            <Mail className="h-6 w-6 text-blue-400" />
            <h1 className="text-3xl md:text-4xl font-bold">Contact Us</h1>
          </div>
          <p className="text-slate-400 max-w-2xl">
            Reach out with questions, feedback, or collaboration ideas.
          </p>
        </div>
      </div>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Contact Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="border border-slate-200 bg-white rounded-xl p-6">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                <Mail className="h-5 w-5 text-slate-700" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">General Inquiries</h2>
              <p className="text-sm text-slate-600 mb-3">
                For general questions, bug reports, or collaboration proposals.
              </p>
              <a href="mailto:info@kenyawatch.org" className="text-teal-600 hover:text-teal-700 font-medium text-sm">
                info@kenyawatch.org
              </a>
            </div>

            <div className="border border-slate-200 bg-white rounded-xl p-6">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-5 w-5 text-slate-700" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Security Issues</h2>
              <p className="text-sm text-slate-600 mb-3">
                Found a security vulnerability? Report it responsibly.
              </p>
              <a href="mailto:security@kenyawatch.org" className="text-teal-600 hover:text-teal-700 font-medium text-sm">
                security@kenyawatch.org
              </a>
            </div>
          </div>

          {/* Useful Links */}
          <div className="border border-slate-200 bg-white rounded-xl p-6 mb-12">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Government Resources</h2>
            <ul className="grid md:grid-cols-2 gap-3">
              {[
                { name: "Public Procurement Information Portal", url: "https://tenders.go.ke" },
                { name: "Office of the Auditor-General", url: "https://www.ago.go.ke" },
                { name: "Ethics and Anti-Corruption Commission", url: "https://eacc.go.ke" },
                { name: "Public Procurement Regulatory Authority", url: "https://ppra.go.ke" },
                { name: "Open Contracting Data Standard", url: "https://data.open-contracting.org" },
                { name: "Kenya ICT Authority", url: "https://icta.go.ke" },
              ].map((link, i) => (
                <li key={i}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-teal-600 transition-colors p-2 rounded-lg hover:bg-slate-50"
                  >
                    <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick FAQ */}
          <div className="border border-slate-200 bg-white rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-5">
              {[
                { q: "Is KenyaWatch affiliated with the Kenyan government?", a: "No. KenyaWatch is an independent civic-tech platform built by citizens for citizens. We are not affiliated with any government agency." },
                { q: "How accurate is the data?", a: "We source data from official government portals (PPIP/OCDS) and clearly label each record with its source. Synthetic data used for demonstration is always marked as 'Reference'." },
                { q: "Can I report corruption anonymously?", a: "Yes. Our reporting system collects no personal information. We recommend using Tor Browser or a VPN for maximum anonymity." },
                { q: "How can I contribute?", a: "You can submit anonymous reports, share the platform, contribute to our open-source codebase on GitHub, or partner with us as a civil society organization." },
              ].map((faq, i) => (
                <div key={i}>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">{faq.q}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
