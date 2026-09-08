import type { Metadata } from "next"
import { Mail, Shield, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Contact Us - KenyaWatch AI",
  description: "Get in touch with the KenyaWatch team. Report issues, suggest features, or learn more about our procurement transparency platform.",
  openGraph: {
    title: "Contact Us - KenyaWatch AI",
    description: "Get in touch with the KenyaWatch team.",
    url: "https://kenyawatch-chi.vercel.app/contact",
    siteName: "KenyaWatch AI",
    type: "website",
  },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="relative bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 text-white py-20 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-8 w-8 text-blue-300" />
              <h1 className="text-4xl font-bold">Contact Us</h1>
            </div>
            <p className="text-lg text-white/90">We would love to hear from you. Reach out with questions, feedback, or collaboration ideas.</p>
          </div>
        </div>
      </div>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-teal-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Email Us</h2>
                <p className="text-slate-600 mb-4">
                  For general inquiries, bug reports, or collaboration proposals.
                </p>
                <a
                  href="mailto:info@kenyawatch.org"
                  className="text-teal-600 hover:text-teal-700 font-semibold text-lg"
                >
                  info@kenyawatch.org
                </a>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Report a Vulnerability</h2>
                <p className="text-slate-600 mb-4">
                  Found a security issue? Report it responsibly through our secure channel.
                </p>
                <a
                  href="mailto:security@kenyawatch.org"
                  className="text-teal-600 hover:text-teal-700 font-semibold text-lg"
                >
                  security@kenyawatch.org
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Useful Links */}
          <Card className="border-0 shadow-lg mb-12">
            <CardContent className="p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Useful Links</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: "Public Procurement Information Portal (PPIP)", url: "https://tenders.go.ke" },
                  { name: "Office of the Auditor-General", url: "https://www.ago.go.ke" },
                  { name: "Ethics and Anti-Corruption Commission", url: "https://eacc.go.ke" },
                  { name: "Public Procurement Regulatory Authority", url: "https://ppra.go.ke" },
                  { name: "Open Contracting Data Standard", url: "https://data.open-contracting.org" },
                  { name: "Kenya ICT Authority", url: "https://icta.go.ke" },
                ].map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-slate-600 hover:text-teal-600 transition-colors p-3 rounded-lg hover:bg-slate-50"
                  >
                    <ExternalLink className="h-4 w-4 flex-shrink-0" />
                    {link.name}
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQ Quick */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6">
                {[
                  { q: "Is KenyaWatch affiliated with the Kenyan government?", a: "No. KenyaWatch is an independent civic-tech platform built by citizens for citizens. We are not affiliated with any government agency." },
                  { q: "How accurate is the data?", a: "We source data from official government portals (PPIP/OCDS) and clearly label each record with its source. Synthetic data used for demonstration is always marked as 'Reference'." },
                  { q: "Can I report corruption anonymously?", a: "Yes. Our reporting system collects no personal information. We recommend using Tor Browser or a VPN for maximum anonymity." },
                  { q: "How can I contribute?", a: "You can submit anonymous reports, share the platform with others, contribute to our open-source codebase on GitHub, or partner with us as a civil society organization." },
                ].map((faq, i) => (
                  <div key={i}>
                    <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
