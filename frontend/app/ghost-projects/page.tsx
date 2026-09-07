"use client"
import { useEffect, useState } from "react"
import { MapPin, AlertTriangle, ExternalLink, Building2, DollarSign, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ghostProjectsApi } from "@/lib/api"
import { dataTypeConfig } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"

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

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  'disputed': { label: 'Disputed', color: 'bg-red-100 text-red-800 border-red-300' },
  'abandoned': { label: 'Abandoned', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  'suspicious': { label: 'Suspicious', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  'ghost': { label: 'Ghost Project', color: 'bg-purple-100 text-purple-800 border-purple-300' },
}

export default function GhostProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ghostProjectsApi.list()
      .then(res => setProjects(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-red-900 via-red-800 to-slate-900 text-white py-16 mb-8 overflow-hidden">
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
              <h1 className="text-4xl font-bold">Ghost Projects</h1>
            </div>
            <p className="text-lg text-white/90 mb-4">
              Infrastructure projects funded by public money but never built or abandoned
            </p>
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
              <p className="text-sm text-yellow-100">
                <strong>Transparency Notice:</strong> All cases below are documented with evidence from official sources.
                Each project has been verified through Auditor-General reports, media investigations, or oversight body findings.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{projects.length}</div>
              <div className="text-xs text-slate-500">Ghost Projects</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {projects.filter(p => p.claimed_status === 'abandoned').length}
              </div>
              <div className="text-xs text-slate-500">Abandoned</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {projects.filter(p => p.claimed_status === 'suspicious').length}
              </div>
              <div className="text-xs text-slate-500">Suspicious</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {projects.filter(p => p.claimed_status === 'disputed').length}
              </div>
              <div className="text-xs text-slate-500">Disputed</div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Loading ghost projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16">
            <AlertTriangle className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <p className="text-xl text-slate-600">No documented ghost projects yet</p>
            <p className="text-sm text-slate-400 mt-2">Projects will appear here as they are documented</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((p: any) => {
              const dt = dataTypeConfig[p.data_type as keyof typeof dataTypeConfig]
              const statusConfig = STATUS_CONFIG[p.claimed_status] || { label: p.claimed_status, color: 'bg-slate-100 text-slate-800' }
              const imageUrl = GHOST_PROJECT_IMAGES[p.project_id] || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80'

              return (
                <Card key={p.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  <div className="relative h-56 bg-slate-200 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <Badge variant={p.data_type as any} className="text-xs shadow-lg">{dt?.label}</Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge className={`text-xs ${statusConfig.color} shadow-lg`}>{statusConfig.label}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-2 mb-3">
                      <MapPin className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-red-600 transition-colors">{p.title}</h3>
                        <p className="text-sm text-slate-500">{p.county} County</p>
                      </div>
                    </div>
                    <p className="text-slate-600 mb-4 leading-relaxed">{p.description}</p>
                    {p.source_url && (
                      <a
                        href={p.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-teal-600 hover:text-teal-700 font-medium"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        {p.source_name || "View Source"}
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
