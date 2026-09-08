import type { Metadata } from "next"
import Link from "next/link"
import { Shield, Target, Users, Eye, Database, FileText, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "About KenyaWatch - Our Mission for Procurement Transparency",
  description: "Learn about KenyaWatch's mission to make Kenyan government procurement transparent and accountable through AI-powered analysis and citizen engagement.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=1920&q=80"
            alt="Nairobi skyline"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/85" />
        </div>
        <div className="relative z-10 container mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-7 w-7 text-teal-400" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">About KenyaWatch</h1>
          </div>
          <p className="text-lg text-slate-300 max-w-2xl">
            Empowering Kenyans with data-driven tools to fight procurement corruption.
          </p>
        </div>
      </section>

      {/* Mission Cards */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
            {[
              { icon: Target, title: "Our Mission", text: "To make every Kenyan government procurement transaction transparent, traceable, and accountable through open data and AI-powered analysis." },
              { icon: Eye, title: "Our Vision", text: "A Kenya where public funds are spent with integrity, citizens can verify every contract, and corruption has nowhere to hide." },
              { icon: Users, title: "Who We Serve", text: "Citizens, journalists, civil society organizations, oversight bodies, and anyone who believes in transparent governance." },
            ].map((item, i) => (
              <div key={i} className="border border-slate-200 bg-white rounded-xl p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-300">
                <div className="w-11 h-11 bg-teal-50 rounded-lg flex items-center justify-center mb-5">
                  <item.icon className="h-5 w-5 text-teal-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          {/* What We Do */}
          <div className="max-w-3xl mx-auto mb-20">
            <p className="text-sm font-semibold text-teal-600 tracking-wider uppercase mb-3">What we do</p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">How KenyaWatch works</h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
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
          <div className="max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold text-teal-600 tracking-wider uppercase mb-3">Data sources</p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Where our data comes from</h2>
            <div className="space-y-4">
              {[
                { name: "PPIP / OCDS", desc: "Official Kenyan procurement data from tenders.go.ke and the Open Contracting Data Standard registry.", url: "https://tenders.go.ke" },
                { name: "Auditor-General Reports", desc: "Documented cases and findings from the Office of the Auditor-General of Kenya.", url: "https://www.ago.go.ke" },
                { name: "EACC Referrals", desc: "Cases referred to the Ethics and Anti-Corruption Commission for investigation.", url: "https://eacc.go.ke" },
                { name: "Citizen Reports", desc: "Anonymous submissions from Kenyan citizens through our secure reporting system." },
              ].map((source, i) => (
                <div key={i} className="border border-slate-200 bg-white rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all">
                  <h3 className="font-bold text-slate-900 mb-1">{source.name}</h3>
                  <p className="text-sm text-slate-600 mb-3">{source.desc}</p>
                  {source.url && (
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-sm text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1">
                      Visit Source <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="max-w-3xl mx-auto text-center border border-slate-200 bg-white rounded-xl p-10">
            <h2 className="text-xl font-bold text-slate-900 mb-3">Join the fight for transparency</h2>
            <p className="text-slate-600 mb-6 max-w-md mx-auto text-sm">
              Whether you are a citizen, journalist, or researcher, you can help hold government accountable.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/contracts">
                <Button className="bg-teal-600 hover:bg-teal-500 px-6">
                  <Database className="mr-2 h-4 w-4" /> Explore Data
                </Button>
              </Link>
              <Link href="/report">
                <Button variant="outline" className="border-slate-200 px-6">
                  <FileText className="mr-2 h-4 w-4" /> Report Corruption
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
