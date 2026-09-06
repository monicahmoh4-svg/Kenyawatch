"use client"
import { useEffect, useState } from "react"
import { MapPin, AlertTriangle, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ghostProjectsApi } from "@/lib/api"
import { dataTypeConfig } from "@/lib/utils"

export default function GhostProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { ghostProjectsApi.list().then(res => setProjects(res.data)).catch(console.error).finally(() => setLoading(false)) }, [])

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="relative bg-gradient-to-r from-red-900 to-slate-900 text-white py-16 mb-8">
        <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541364983171-a8fa2a49038b?w=1920&q=80')" }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4"><AlertTriangle className="h-8 w-8 text-yellow-400" /><h1 className="text-4xl font-bold">Ghost Projects</h1></div>
            <p className="text-lg text-white/90 mb-4">Infrastructure projects funded by public money but never built or abandoned</p>
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
              <p className="text-sm text-yellow-100"><strong>Transparency Notice:</strong> This section displays documented cases with satellite imagery. Currently showing static maps - AI-powered change detection is in development.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4">
        {loading ? <div className="text-center py-12 text-slate-500">Loading...</div> : projects.length === 0 ? <div className="text-center py-12"><AlertTriangle className="h-12 w-12 mx-auto text-slate-400 mb-4" /><p className="text-slate-600">No documented ghost projects yet</p></div> : (
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((p: any) => {
              const dt = dataTypeConfig[p.data_type as keyof typeof dataTypeConfig]
              const mapUrl = p.lat && p.lng ? `https://maps.googleapis.com/maps/api/staticmap?center=${p.lat},${p.lng}&zoom=13&size=600x300&maptype=satellite&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''}` : 'https://images.unsplash.com/photo-1524661135-423240fb30fd?w=600&q=80'
              return (
                <Card key={p.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-64 bg-slate-200">
                    <img src={mapUrl} alt={p.title} className="w-full h-full object-cover" />
                    <div className="absolute top-4 right-4"><Badge variant={p.data_type as any} className="text-xs">{dt?.label}</Badge></div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-2 mb-3">
                      <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
                      <div><h3 className="text-xl font-bold text-slate-900">{p.title}</h3><p className="text-sm text-slate-500">{p.county} County</p></div>
                    </div>
                    <p className="text-slate-600 mb-4">{p.description}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm font-medium text-slate-700">Status:</span>
                      <Badge variant="outline" className="capitalize">{p.claimed_status}</Badge>
                    </div>
                    {p.source_url && <a href={p.source_url} target="_blank" className="inline-flex items-center text-sm text-kenya-teal hover:underline"><ExternalLink className="h-4 w-4 mr-1" />{p.source_name || "View Source"}</a>}
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