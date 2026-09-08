import type { Metadata } from "next"
import Link from "next/link"
import { Shield, Target, Users, Eye, Database, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "About KenyaWatch - Our Mission for Procurement Transparency",
  description: "Learn about KenyaWatch's mission to make Kenyan government procurement transparent and accountable through AI-powered analysis and citizen engagement.",
  openGraph: {
    title: "About KenyaWatch - Our Mission for Procurement Transparency",
    description: "Learn about KenyaWatch's mission to make Kenyan government procurement transparent and accountable.",
    url: "https://kenyawatch-chi.vercel.app/about",
    siteName: "KenyaWatch AI",
    type: "website",
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="relative bg-gradient-to-r from-teal-900 via-emerald-800 to-slate-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }} />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-8 w-8 text-teal-300" />
              <h1 className="text-4xl font-bold">About KenyaWatch</h1>
            </div>
            <p className="text-lg text-white/90">Empowering Kenyans with data-driven tools to fight procurement corruption</p>
          </div>
        </div>
      </div>

      {/* Mission */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {[
                { icon: Target, title: "Our Mission", text: "To make every Kenyan government procurement transaction transparent, traceable, and accountable through open data and AI-powered analysis." },
                { icon: Eye, title: "Our Vision", text: "A Kenya where public funds are spent with integrity, citizens can verify every contract, and corruption has nowhere to hide." },
                { icon: Users, title: "Who We Serve", text: "Citizens, journalists, civil society organizations, oversight bodies, and anyone who believes in transparent governance." },
              ].map((item, i) => (
                <Card key={i} className="border-0 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <item.icon className="h-7 w-7 text-teal-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h2>
                    <p className="text-slate-600 leading-relaxed">{item.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* What We Do */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">What We Do</h2>
              <div className="prose prose-slate max-w-none text-slate-600 space-y-4">
                <p>
                  KenyaWatch aggregates procurement data from official government sources including the
                  Public Procurement Information Portal (PPIP) at tenders.go.ke, Open Contracting Data
                  Standard (OCDS) feeds, Auditor-General reports, and citizen submissions.
                </p>
                <p>
                  Our AI-powered risk engine analyzes every contract for corruption indicators such as
                  single-source procurement, overpricing, bid rigging patterns, ghost projects, and
                  conflicts of interest. Each contract receives a risk score and is flagged when
                  suspicious patterns are detected.
                </p>
                <p>
                  All data on KenyaWatch is sourced and attributed. We use transparency badges to show
                  whether data comes from official OCDS feeds, documented cases with citations, or
                  reference data. We never present synthetic data as fact.
                </p>
              </div>
            </div>

            {/* Data Sources */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">Our Data Sources</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { name: "PPIP / OCDS", desc: "Official Kenyan procurement data from tenders.go.ke and the Open Contracting Data Standard registry, covering all 47 counties.", url: "https://tenders.go.ke" },
                  { name: "Auditor-General Reports", desc: "Documented cases and findings from the Office of the Auditor-General of Kenya.", url: "https://www.ago.go.ke" },
                  { name: "EACC Referrals", desc: "Cases referred to the Ethics and Anti-Corruption Commission for investigation.", url: "https://eacc.go.ke" },
                  { name: "Citizen Reports", desc: "Anonymous submissions from Kenyan citizens through our secure reporting system." },
                ].map((source, i) => (
                  <Card key={i} className="border border-slate-200">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-slate-900 mb-2">{source.name}</h3>
                      <p className="text-sm text-slate-600 mb-3">{source.desc}</p>
                      {source.url && (
                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                          Visit Source &rarr;
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Join the Fight for Transparency</h2>
              <p className="text-slate-600 mb-8 max-w-xl mx-auto">
                Whether you are a citizen, journalist, or researcher, you can help hold government accountable.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/contracts">
                  <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 px-8">
                    <Database className="mr-2 h-4 w-4" />
                    Explore Data
                  </Button>
                </Link>
                <Link href="/report">
                  <Button variant="outline" className="px-8">
                    <FileText className="mr-2 h-4 w-4" />
                    Report Corruption
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
