"use client"
import { useEffect, useState } from "react"
import { MapPin, AlertTriangle, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ghostProjectsApi } from "@/lib/api"
import { dataTypeConfig } from "@/lib/utils"

const GHOST_PROJECT_IMAGES: Record<string, string> = {
  'GP-ARRR-001': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
  'GP-KIMW-001': 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80',
  'GP-KERI-001': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
  'GP-MOMB-001': 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=800&q=80',
  'GP-NAIRO-001': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
  'GP-KISUM-001': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
  'GP-NAKUR-001': 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80',
  'GP-TURK-001': 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=800&q=80',
  'GP-KILIF-001': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  'GP-MACH-001': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  'disputed': { label: 'Disputed', className: 'bg-red-50 text-red-700 border-red-200' },
  'abandoned': { label: 'Abandoned', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  'suspicious': { label: 'Suspicious', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  'ghost': { label: 'Ghost Project', className: 'bg-teal-50 text-teal-700 border-teal-200' },
}

export default function GhostProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ghostProjectsApi.list().then(res => setProjects(res.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative py-12 md:py-16 mb-8 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80"
            alt="Abandoned construction"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1590845077913-1e9e640704e5?w=1920&q=80"
            }}
          />
          <div className="absolute inset-0 bg-slate-950/90" />
        </div>
        <div className="relative z-10 container mx-auto px-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-6 w-6 text-amber-400" />
            <h1 className="text-3xl md:text-4xl font-bold">Ghost Projects</h1>
          </div>
          <p className="text-slate-400 mb-6 max-w-2xl">
            Infrastructure projects funded by public money but never built or abandoned.
          </p>
          <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg px-4 py-3 inline-block">
            <p className="text-sm text-amber-200">
              All cases are documented with evidence from official sources — Auditor-General reports, media investigations, or oversight body findings.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 pb-12">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Ghost Projects", value: projects.length, color: "text-red-600" },
            { label: "Abandoned", value: projects.filter(p => p.claimed_status === 'abandoned').length, color: "text-orange-600" },
            { label: "Suspicious", value: projects.filter(p => p.claimed_status === 'suspicious').length, color: "text-amber-600" },
            { label: "Disputed", value: projects.filter(p => p.claimed_status === 'disputed').length, color: "text-red-600" },
          ].map((stat, i) => (
            <div key={i} className="border border-slate-200 rounded-lg bg-white p-4 text-center">
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                {loading ? <span className="inline-block w-8 h-6 skeleton" /> : stat.value}
              </div>
              <div className="text-xs text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Projects */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Loading ghost projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 border border-slate-200 rounded-lg bg-white">
            <AlertTriangle className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-600 font-medium">No documented ghost projects yet</p>
            <p className="text-sm text-slate-400 mt-1">Projects will appear here as they are documented</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {projects.map((p: any) => {
              const dt = dataTypeConfig[p.data_type as keyof typeof dataTypeConfig]
              const statusConfig = STATUS_CONFIG[p.claimed_status] || { label: p.claimed_status, className: 'bg-slate-50 text-slate-700 border-slate-200' }
              const imageUrl = GHOST_PROJECT_IMAGES[p.project_id] || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80'

              return (
                <Card key={p.id} className="border border-slate-200 overflow-hidden">
                  <div className="relative h-48 bg-slate-200">
                    <img src={imageUrl} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-3 right-3">
                      <Badge variant={p.data_type as any} className="text-[10px] shadow-sm">{dt?.label}</Badge>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <Badge className={`text-[10px] border ${statusConfig.className}`}>{statusConfig.label}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-slate-900">{p.title}</h3>
                        <p className="text-xs text-slate-500">{p.county} County</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-3 line-clamp-3">{p.description}</p>
                    {p.source_url && (
                      <a href={p.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs text-teal-600 hover:text-teal-700 font-medium">
                        <ExternalLink className="h-3 w-3 mr-1" /> {p.source_name || "View Source"}
                      </a>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
