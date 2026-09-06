"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Shield, FileText, MapPin, MessageSquare, ArrowRight, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { statsApi, type DashboardStats } from "@/lib/api"

export default function HomePage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    statsApi.getDashboard().then(res => setStats(res.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const features = [
    { icon: FileText, title: "Procurement Database", description: "Search and filter contracts across all 47 counties with AI-powered risk scoring", href: "/contracts", color: "bg-blue-500" },
    { icon: MapPin, title: "Ghost Project Detection", description: "Identify infrastructure projects that were funded but never built", href: "/ghost-projects", color: "bg-red-500" },
    { icon: Shield, title: "Anonymous Reporting", description: "Safely report suspected corruption with end-to-end anonymity", href: "/report", color: "bg-green-500" },
    { icon: MessageSquare, title: "AI Investigator", description: "Ask natural language questions about procurement data", href: "/chat", color: "bg-purple-500" },
  ]

  return (
    <div>
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523805009345-783ee736e547?w=1920&q=80')" }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
              <Shield className="h-4 w-4 text-teal-400" />
              <span className="text-sm text-white/90">Civic-Tech for Transparency</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">Fighting Procurement<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">Corruption in Kenya</span></h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">AI-powered platform making government procurement transparent, accountable, and accessible to every Kenyan citizen.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/contracts"><Button size="lg" className="bg-kenya-teal hover:bg-kenya-teal/90 text-white px-8">Explore Contracts <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
              <Link href="/report"><Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">Report Corruption</Button></Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-3xl mx-auto">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white"><CardContent className="p-6 text-center"><div className="text-3xl font-bold">{loading ? "—" : stats?.total || 0}</div><div className="text-sm text-white/70">Contracts</div></CardContent></Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white"><CardContent className="p-6 text-center"><div className="text-3xl font-bold text-green-400">{loading ? "—" : stats?.documented || 0}</div><div className="text-sm text-white/70">Documented</div></CardContent></Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white"><CardContent className="p-6 text-center"><div className="text-3xl font-bold text-red-400">{loading ? "—" : stats?.critical || 0}</div><div className="text-sm text-white/70">High Risk</div></CardContent></Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white"><CardContent className="p-6 text-center"><div className="text-3xl font-bold">{loading ? "—" : stats?.reports_total || 0}</div><div className="text-sm text-white/70">Reports</div></CardContent></Card>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Tools for Accountability</h2>
            <p className="text-lg text-slate-600">Comprehensive platform empowering citizens, journalists, and oversight bodies to track public procurement.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <Link key={i} href={feature.href}>
                <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-kenya-teal/20">
                  <CardContent className="p-8">
                    <div className={`${feature.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-slate-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 bg-gradient-to-r from-teal-800 to-teal-600 text-white">
        <div className="container mx-auto px-4 text-center space-y-6">
          <AlertTriangle className="h-12 w-12 mx-auto" />
          <h2 className="text-3xl font-bold">Data Integrity First</h2>
          <p className="text-lg text-white/90">Every record carries a transparency badge showing its source. We never present synthetic data as fact.</p>
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <Badge variant="documented" className="text-sm px-4 py-2">Documented</Badge>
            <Badge variant="live_sync" className="text-sm px-4 py-2">Live Sync</Badge>
            <Badge variant="manual_scan" className="text-sm px-4 py-2">Manual Scan</Badge>
            <Badge variant="reference" className="text-sm px-4 py-2">Reference (Synthetic)</Badge>
          </div>
        </div>
      </section>
    </div>
  )
}