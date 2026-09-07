"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Shield, FileText, MapPin, MessageSquare, ArrowRight, AlertTriangle, TrendingUp, Users, Building2, ChevronRight, Globe, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { statsApi } from "@/lib/api"
import { type DashboardStats } from "@/types"
import { formatCurrency } from "@/lib/utils"

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
      description: "Search and filter contracts across all 47 counties with AI-powered risk scoring. Access detailed contract information including values, suppliers, and completion status.",
      href: "/contracts",
      color: "from-blue-500 to-blue-600",
      stat: stats?.total || 0,
      statLabel: "Contracts Tracked"
    },
    {
      icon: MapPin,
      title: "Ghost Project Detection",
      description: "Identify infrastructure projects that were funded by public money but never built or were abandoned. Real documented cases with evidence.",
      href: "/ghost-projects",
      color: "from-red-500 to-red-600",
      stat: "10+",
      statLabel: "Ghost Projects"
    },
    {
      icon: Shield,
      title: "Anonymous Reporting",
      description: "Safely report suspected procurement corruption with end-to-end anonymity. Your identity is never collected or stored.",
      href: "/report",
      color: "from-green-500 to-green-600",
      stat: stats?.reports_total || 0,
      statLabel: "Reports Filed"
    },
    {
      icon: MessageSquare,
      title: "AI Investigator",
      description: "Ask natural language questions about procurement data. Our AI assistant analyzes patterns and provides insights on corruption indicators.",
      href: "/chat",
      color: "from-purple-500 to-purple-600",
      stat: "24/7",
      statLabel: "Available"
    },
  ]

  const statsCards = [
    { label: "Total Contracts", value: stats?.total || 0, icon: FileText, color: "text-blue-600 bg-blue-50" },
    { label: "Documented Cases", value: stats?.documented || 0, icon: Eye, color: "text-green-600 bg-green-50" },
    { label: "High Risk Items", value: stats?.critical || 0, icon: AlertTriangle, color: "text-red-600 bg-red-50" },
    { label: "Citizen Reports", value: stats?.reports_total || 0, icon: Users, color: "text-purple-600 bg-purple-50" },
  ]

  return (
    <div>
      {/* Hero Section with HD Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* HD Background Image - Kenya Parliament */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=1920&q=85')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-slate-900/85 to-teal-900/80" />
        </div>

        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 via-transparent to-blue-600/20 animate-pulse" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-full px-6 py-3 shadow-2xl">
              <Shield className="h-5 w-5 text-teal-400" />
              <span className="text-sm font-medium text-white">Civic-Tech for Transparency & Accountability</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
              Fighting Procurement<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400">
                Corruption in Kenya
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto leading-relaxed">
              AI-powered platform making government procurement transparent,
              accountable, and accessible to every Kenyan citizen.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link href="/contracts">
                <Button size="lg" className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white px-10 py-6 text-lg shadow-xl hover:shadow-2xl transition-all">
                  Explore Contracts
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/report">
                <Button size="lg" variant="outline" className="border-2 border-white/50 text-white hover:bg-white/10 px-10 py-6 text-lg backdrop-blur-sm">
                  Report Corruption
                </Button>
              </Link>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-16 max-w-4xl mx-auto">
              {statsCards.map((stat, i) => (
                <Card key={i} className="bg-white/10 backdrop-blur-md border-white/20 text-white shadow-xl hover:bg-white/15 transition-all">
                  <CardContent className="p-6 text-center">
                    <div className={`w-10 h-10 rounded-full ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {loading ? "—" : stat.value}
                    </div>
                    <div className="text-xs text-slate-300">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4 text-teal-600 border-teal-200">Platform Features</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Tools for Accountability
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              Comprehensive platform empowering citizens, journalists, and oversight
              bodies to track public procurement and expose corruption.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <Link key={i} href={feature.href}>
                <Card className="group hover:shadow-2xl transition-all duration-500 border-2 hover:border-teal-300 overflow-hidden h-full">
                  <CardContent className="p-10">
                    <div className={`bg-gradient-to-br ${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 mb-6 leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <div className="text-3xl font-bold text-teal-600">{feature.stat}</div>
                        <div className="text-sm text-slate-500">{feature.statLabel}</div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-2 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4 text-teal-600 border-teal-200">How It Works</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Transparent by Design</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: "01", title: "Data Collection", desc: "We aggregate data from PPIP, OCDS feeds, Auditor-General reports, and citizen submissions." },
              { step: "02", title: "AI Risk Analysis", desc: "Every contract is scored using our risk engine that detects bid rigging, overpricing, and ghost projects." },
              { step: "03", title: "Public Access", desc: "All data is freely accessible with source badges so you can verify every claim independently." },
            ].map((item, i) => (
              <div key={i} className="text-center p-8 rounded-2xl bg-slate-50 hover:bg-teal-50 transition-colors">
                <div className="text-5xl font-bold text-teal-200 mb-4">{item.step}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Integrity Notice */}
      <section className="py-20 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }} />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/20 rounded-full mb-4">
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
            </div>
            <h2 className="text-4xl font-bold">Data Integrity First</h2>
            <p className="text-xl text-slate-300 leading-relaxed">
              Every record on KenyaWatch carries a transparency badge showing its source.
              We never present synthetic data as fact — trust is earned through verifiable evidence.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-6">
              <Badge variant="documented" className="text-sm px-6 py-3 border-2">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  Documented - Source-cited
                </span>
              </Badge>
              <Badge variant="live_sync" className="text-sm px-6 py-3 border-2">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full" />
                  Live Sync - OCDS Feed
                </span>
              </Badge>
              <Badge variant="manual_scan" className="text-sm px-6 py-3 border-2">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                  Manual Scan - User Submitted
                </span>
              </Badge>
              <Badge variant="reference" className="text-sm px-6 py-3 border-2">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  Reference - Synthetic Data
                </span>
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1920&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }} />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Hold Government Accountable?
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of Kenyans using data to fight corruption and demand
            transparency in public procurement.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/contracts">
              <Button size="lg" className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white px-10 py-6 text-lg shadow-xl">
                Browse Contracts
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/report">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-10 py-6 text-lg">
                Submit a Report
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
