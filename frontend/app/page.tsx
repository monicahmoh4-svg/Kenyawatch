"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Shield, FileText, MapPin, MessageSquare, ArrowRight, AlertTriangle, Eye, Users, ChevronDown, TrendingUp, Globe, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { statsApi } from "@/lib/api"
import { type DashboardStats } from "@/types"

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    statsApi.getDashboard().then(res => setStats(res.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/contracts?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const features = [
    {
      icon: FileText,
      title: "Procurement Database",
      description: "Search and filter contracts across all 47 counties. Each contract is scored for corruption risk using our AI engine.",
      href: "/contracts",
      stat: stats?.total || 0,
      statLabel: "contracts tracked",
      image: "https://images.unsplash.com/photo-1450101499163-c8848e968838?w=600&q=75",
    },
    {
      icon: MapPin,
      title: "Ghost Project Detection",
      description: "Infrastructure projects funded by public money but never built. Real documented cases with evidence and source citations.",
      href: "/ghost-projects",
      stat: "10+",
      statLabel: "ghost projects",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=75",
    },
    {
      icon: Shield,
      title: "Anonymous Reporting",
      description: "Report suspected procurement corruption with complete anonymity. No personal data is collected or stored.",
      href: "/report",
      stat: stats?.reports_total || 0,
      statLabel: "reports filed",
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=75",
    },
    {
      icon: MessageSquare,
      title: "AI Investigator",
      description: "Ask natural language questions about procurement data. Our AI analyzes patterns and surfaces corruption indicators.",
      href: "/chat",
      stat: "24/7",
      statLabel: "available",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=75",
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
      {/* Hero Section - Cinematic KICC/Nairobi */}
      <section className="relative min-h-[90vh] md:min-h-screen flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1590845077913-1e9e640704e5?w=1920&q=80"
            alt="Nairobi cityscape"
            className="w-full h-full object-cover"
          />
          {/* Cinematic overlay - gradient from dark left to transparent right */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-slate-900/40" />
          {/* Subtle grain texture */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")" }} />
        </div>

        <div className="relative z-10 container mx-auto px-6 py-24 md:py-0">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-teal-400/20 bg-teal-500/10 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-teal-300 text-xs font-medium tracking-wider uppercase">Live Data Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6">
              Making Kenyan
              <br />
              Public Procurement
              <br />
              <span className="bg-gradient-to-r from-teal-300 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
                Transparent
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300/90 max-w-xl leading-relaxed mb-10 font-light">
              Track government contracts across all 47 counties. AI-powered risk detection. Open data. Built for accountability.
            </p>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch gap-3 mb-8 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search contracts, counties, suppliers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 backdrop-blur-sm text-sm"
                />
              </div>
              <Button type="submit" size="lg" className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-3.5 rounded-xl font-medium shadow-lg shadow-teal-900/40 transition-all hover:shadow-teal-800/50">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link href="/contracts">
                <Button size="lg" className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-5 text-base font-medium shadow-lg shadow-teal-900/40 transition-all hover:shadow-teal-800/50">
                  Explore Contracts
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/report">
                <Button size="lg" variant="outline" className="border-slate-500/50 text-white hover:bg-white/10 px-8 py-5 text-base font-medium backdrop-blur-sm transition-all">
                  Report Corruption
                </Button>
              </Link>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mt-16 pt-8 border-t border-white/10">
              {statsDisplay.map((stat, i) => (
                <div key={i}>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                    {loading ? <span className="inline-block w-16 h-7 skeleton" /> : stat.value.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2">
          <span className="text-xs text-slate-400 tracking-wider uppercase">Scroll</span>
          <ChevronDown className="h-4 w-4 text-slate-400 animate-bounce" />
        </div>
      </section>

      {/* Features Section - HD Image Cards */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mb-16">
            <p className="text-sm font-semibold text-teal-600 tracking-wider uppercase mb-3">What we do</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Tools for procurement accountability
            </h2>
            <p className="text-lg text-slate-600">
              Empowering citizens, journalists, and oversight bodies to track public spending and expose corruption.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-6xl">
            {features.map((feature, i) => (
              <Link key={i} href={feature.href} className="group">
                <Card className="h-full border border-slate-200 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-5 right-5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-bold text-white">
                          {typeof feature.stat === 'number' ? feature.stat.toLocaleString() : feature.stat}
                        </span>
                        <span className="text-sm text-white/80">{feature.statLabel}</span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-5 w-5 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">{feature.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end mt-4 pt-4 border-t border-slate-100">
                      <span className="text-sm font-medium text-teal-600 group-hover:text-teal-700 flex items-center gap-1.5">
                        Learn more <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Editorial Layout */}
      <section className="py-24 md:py-32 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mb-16">
            <p className="text-sm font-semibold text-teal-600 tracking-wider uppercase mb-3">How it works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Three steps to transparency
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10 max-w-5xl">
            {[
              { step: "01", title: "Collect", desc: "We aggregate procurement data from PPIP, OCDS feeds, Auditor-General reports, and citizen submissions across all 47 counties.", icon: Globe },
              { step: "02", title: "Analyze", desc: "Every contract is scored for risk — detecting bid rigging, overpricing, single-source abuse, and ghost projects.", icon: TrendingUp },
              { step: "03", title: "Publish", desc: "All data is freely accessible with source badges. Sort by county, sector, year, or risk level. Verify every claim independently.", icon: Eye },
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="text-7xl font-black text-slate-100 mb-4 group-hover:text-teal-100 transition-colors">{item.step}</div>
                <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center mb-4">
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Integrity - Dark Cinematic Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1590845077913-1e9e640704e5?w=1920&q=80"
            alt="Nairobi city"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/90" />
        </div>
        <div className="relative z-10 container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-500/10 rounded-xl mb-6">
              <AlertTriangle className="h-7 w-7 text-amber-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Data integrity first</h2>
            <p className="text-lg text-slate-300 mb-12 max-w-2xl mx-auto">
              Every record carries a transparency badge showing its source.
              We never present synthetic data as fact.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { label: "Documented", desc: "Source-cited", color: "bg-green-500", textColor: "text-green-400" },
                { label: "Live Sync", desc: "PPIP/OCDS Feed", color: "bg-blue-500", textColor: "text-blue-400" },
                { label: "Manual Scan", desc: "User Submitted", color: "bg-amber-500", textColor: "text-amber-400" },
                { label: "Reference", desc: "Synthetic Data", color: "bg-slate-500", textColor: "text-slate-400" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-3 backdrop-blur-sm">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color} flex-shrink-0`} />
                  <div className="text-left">
                    <div className="text-sm font-semibold text-white">{item.label}</div>
                    <div className={`text-xs ${item.textColor}`}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6">
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
              <details key={i} className="group border border-slate-200 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer font-medium text-slate-900 hover:bg-slate-50 transition-colors [&::-webkit-details-marker]:hidden list-none">
                  {faq.q}
                  <ChevronDown className="h-4 w-4 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" />
                </summary>
                <div className="px-6 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
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

      {/* CTA Section - Dark with background */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=1920&q=80"
            alt="Kenya landscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/85" />
        </div>
        <div className="relative z-10 container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to hold government accountable?
          </h2>
          <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto">
            Join thousands of Kenyans using data to fight corruption and demand transparency.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contracts">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-5 text-base font-medium shadow-lg shadow-teal-900/40 transition-all hover:shadow-teal-800/50">
                Browse Contracts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/report">
              <Button size="lg" variant="outline" className="border-slate-500/50 text-white hover:bg-white/10 px-8 py-5 text-base font-medium backdrop-blur-sm transition-all">
                Submit a Report
              </Button>
            </Link>
          </div>
          <p className="mt-8 text-sm text-slate-400">
            <Link href="/about" className="text-slate-300 hover:text-teal-400 transition-colors underline underline-offset-2">Learn more about our mission</Link>
            {" "}&middot;{" "}
            <Link href="/contact" className="text-slate-300 hover:text-teal-400 transition-colors underline underline-offset-2">Contact us</Link>
          </p>
        </div>
      </section>
    </div>
  )
}
