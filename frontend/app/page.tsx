"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Shield, FileText, MapPin, MessageSquare, ArrowRight, AlertTriangle, Eye, Users, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { statsApi } from "@/lib/api"
import { type DashboardStats } from "@/types"

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    statsApi.getDashboard().then(res => setStats(res.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const features = [
    {
      icon: FileText,
      title: "Procurement Database",
      description: "Search and filter contracts across all 47 counties. Each contract is scored for corruption risk using our AI engine.",
      href: "/contracts",
      stat: stats?.total || 0,
      statLabel: "contracts tracked",
    },
    {
      icon: MapPin,
      title: "Ghost Project Detection",
      description: "Infrastructure projects funded by public money but never built. Real documented cases with evidence and source citations.",
      href: "/ghost-projects",
      stat: "10+",
      statLabel: "ghost projects",
    },
    {
      icon: Shield,
      title: "Anonymous Reporting",
      description: "Report suspected procurement corruption with complete anonymity. No personal data is collected or stored.",
      href: "/report",
      stat: stats?.reports_total || 0,
      statLabel: "reports filed",
    },
    {
      icon: MessageSquare,
      title: "AI Investigator",
      description: "Ask natural language questions about procurement data. Our AI analyzes patterns and surfaces corruption indicators.",
      href: "/chat",
      stat: "24/7",
      statLabel: "available",
    },
  ]

  const statsDisplay = [
    { label: "Total Contracts", value: stats?.total || 0, icon: FileText },
    { label: "Documented Cases", value: stats?.documented || 0, icon: Eye },
    { label: "High Risk Items", value: stats?.critical || 0, icon: AlertTriangle },
    { label: "Citizen Reports", value: stats?.reports_total || 0, icon: Users },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] md:min-h-screen flex items-center overflow-hidden bg-slate-900">
        {/* Background image with proper overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1590845077913-1e9e640704e5?w=1920&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-slate-900/80" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-20 md:py-0">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-6 text-teal-300 border-teal-700 bg-teal-900/30 text-xs tracking-wider uppercase">
              Open Data Platform
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              Making Kenyan Public
              <br />
              <span className="text-teal-400">Procurement Transparent</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed mb-8">
              Track government contracts across all 47 counties. AI-powered risk
              detection. Open data. Built for accountability.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-3">
              <Link href="/contracts">
                <Button size="lg" className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-5 text-base font-medium shadow-lg shadow-teal-900/30 transition-colors">
                  Explore Contracts
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/report">
                <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800 px-8 py-5 text-base font-medium transition-colors">
                  Report Corruption
                </Button>
              </Link>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-8 border-t border-slate-700/50">
              {statsDisplay.map((stat, i) => (
                <div key={i}>
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {loading ? <span className="inline-block w-12 h-6 skeleton" /> : stat.value.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mb-14">
            <p className="text-sm font-semibold text-teal-600 tracking-wider uppercase mb-3">What we do</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Tools for procurement accountability
            </h2>
            <p className="text-lg text-slate-600">
              Empowering citizens, journalists, and oversight bodies to track public spending and expose corruption.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 max-w-6xl">
            {features.map((feature, i) => (
              <Link key={i} href={feature.href} className="group">
                <Card className="h-full border border-slate-200 hover:border-slate-300 transition-colors">
                  <CardContent className="p-7 md:p-8">
                    <div className="flex items-start gap-4 mb-5">
                      <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-50 transition-colors">
                        <feature.icon className="h-5 w-5 text-slate-700 group-hover:text-teal-600 transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">{feature.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold text-slate-900">
                          {typeof feature.stat === 'number' ? feature.stat.toLocaleString() : feature.stat}
                        </span>
                        <span className="text-sm text-slate-400">{feature.statLabel}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mb-14">
            <p className="text-sm font-semibold text-teal-600 tracking-wider uppercase mb-3">How it works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Three steps to transparency
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl">
            {[
              { step: "01", title: "Collect", desc: "We aggregate procurement data from PPIP, OCDS feeds, Auditor-General reports, and citizen submissions across all 47 counties." },
              { step: "02", title: "Analyze", desc: "Every contract is scored for risk — detecting bid rigging, overpricing, single-source abuse, and ghost projects." },
              { step: "03", title: "Publish", desc: "All data is freely accessible with source badges. Sort by county, sector, year, or risk level. Verify every claim independently." },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-6xl font-bold text-slate-100 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Integrity */}
      <section className="py-20 md:py-28 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-500/10 rounded-xl mb-6">
              <AlertTriangle className="h-6 w-6 text-amber-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Data integrity first</h2>
            <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
              Every record carries a transparency badge showing its source.
              We never present synthetic data as fact.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: "Documented", desc: "Source-cited", color: "bg-green-500" },
                { label: "Live Sync", desc: "PPIP/OCDS Feed", color: "bg-blue-500" },
                { label: "Manual Scan", desc: "User Submitted", color: "bg-amber-500" },
                { label: "Reference", desc: "Synthetic Data", color: "bg-slate-500" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5">
                  <span className={`w-2 h-2 rounded-full ${item.color} flex-shrink-0`} />
                  <div className="text-left">
                    <div className="text-sm font-medium text-white">{item.label}</div>
                    <div className="text-xs text-slate-500">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mb-14">
            <p className="text-sm font-semibold text-teal-600 tracking-wider uppercase mb-3">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Common questions
            </h2>
          </div>
          <div className="max-w-3xl space-y-3">
            {[
              { q: "What is KenyaWatch?", a: "KenyaWatch is an independent civic-tech platform that aggregates publicly available Kenyan government procurement data from official sources like PPIP and OCDS, and provides AI-powered risk analysis tools to help citizens, journalists, and oversight bodies track public spending." },
              { q: "Where does the data come from?", a: "Our data comes from the Public Procurement Information Portal (PPIP) at tenders.go.ke, the Open Contracting Data Standard (OCDS) registry, Auditor-General reports, and anonymous citizen submissions. Each record is tagged with its source." },
              { q: "Is the data accurate?", a: "We display data exactly as published by official sources. We do not modify or fabricate data. Synthetic data used for demonstration is always clearly labeled as 'Reference'. We encourage users to verify information independently." },
              { q: "Can I report corruption anonymously?", a: "Yes. Our reporting system collects no personal information whatsoever — no IP addresses, no browser fingerprints, no email or phone numbers. For maximum anonymity, use Tor Browser or a VPN." },
              { q: "How does the AI risk scoring work?", a: "Our risk engine analyzes contracts for red flags including single-source procurement, overpricing, vague scope descriptions, unusually high values, and patterns consistent with bid rigging. Each contract receives a risk score from 0-100." },
              { q: "Is KenyaWatch affiliated with the government?", a: "No. KenyaWatch is built independently by citizens who believe in transparent governance. We are not affiliated with, endorsed by, or connected to any government agency, political party, or commercial entity." },
            ].map((faq, i) => (
              <details key={i} className="group border border-slate-200 rounded-lg">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-medium text-slate-900 hover:bg-slate-50 transition-colors [&::-webkit-details-marker]:hidden list-none">
                  {faq.q}
                  <ChevronDown className="h-4 w-4 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" />
                </summary>
                <div className="px-6 pb-4 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/contact">
              <Button variant="ghost" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-0">
                Have more questions? Contact us
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Ready to hold government accountable?
          </h2>
          <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">
            Join thousands of Kenyans using data to fight corruption and demand transparency.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/contracts">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-5 text-base font-medium shadow-sm transition-colors">
                Browse Contracts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/report">
              <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-white px-8 py-5 text-base font-medium transition-colors">
                Submit a Report
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            <Link href="/about" className="text-slate-600 hover:text-teal-600 transition-colors underline underline-offset-2">Learn more about our mission</Link>
            {" "}&middot;{" "}
            <Link href="/contact" className="text-slate-600 hover:text-teal-600 transition-colors underline underline-offset-2">Contact us</Link>
          </p>
        </div>
      </section>
    </div>
  )
}
