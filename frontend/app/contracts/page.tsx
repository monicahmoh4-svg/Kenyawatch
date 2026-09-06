"use client"
import { useEffect, useState } from "react"
import { Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { contractsApi } from "@/lib/api"
import { getRiskLevel, dataTypeConfig } from "@/lib/utils"

export default function ContractsPage() {
  const [contracts, setContracts] = useState<any[]>([])
  const [meta, setMeta] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ county: "", sector: "", year: "", risk_level: "", data_type: "", search: "" })

  useEffect(() => { loadContracts(); loadMeta() }, [page])

  const loadContracts = async () => {
    setLoading(true)
    try {
      const res = await contractsApi.list({ ...filters, page, limit: 20 })
      setContracts(res.data.results)
      setTotal(res.data.total)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }
  const loadMeta = async () => {
    try { const res = await contractsApi.getMeta(); setMeta(res.data) } catch (e) { console.error(e) }
  }
  const applyFilters = () => { setPage(1); loadContracts() }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="relative bg-gradient-to-r from-teal-800 to-teal-600 text-white py-16 mb-8">
        <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80')" }} />
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl font-bold mb-2">Procurement Database</h1>
          <p className="text-lg text-white/90">Search and analyze government contracts across all 47 counties</p>
        </div>
      </div>
      <div className="container mx-auto px-4">
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
              <Select value={filters.county} onValueChange={(v) => setFilters({...filters, county: v})}>
                <SelectTrigger><SelectValue placeholder="All Counties" /></SelectTrigger>
                <SelectContent>{meta?.counties?.map((c: string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={filters.sector} onValueChange={(v) => setFilters({...filters, sector: v})}>
                <SelectTrigger><SelectValue placeholder="All Sectors" /></SelectTrigger>
                <SelectContent>{meta?.sectors?.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={filters.year} onValueChange={(v) => setFilters({...filters, year: v})}>
                <SelectTrigger><SelectValue placeholder="All Years" /></SelectTrigger>
                <SelectContent>{meta?.years?.map((y: number) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={filters.risk_level} onValueChange={(v) => setFilters({...filters, risk_level: v})}>
                <SelectTrigger><SelectValue placeholder="All Risk Levels" /></SelectTrigger>
                <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent>
              </Select>
              <Select value={filters.data_type} onValueChange={(v) => setFilters({...filters, data_type: v})}>
                <SelectTrigger><SelectValue placeholder="All Data Types" /></SelectTrigger>
                <SelectContent><SelectItem value="documented">Documented</SelectItem><SelectItem value="live_sync">Live Sync</SelectItem><SelectItem value="manual_scan">Manual Scan</SelectItem><SelectItem value="reference">Reference</SelectItem></SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input placeholder="Search..." value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} className="flex-1" />
                <Button onClick={applyFilters} size="icon"><Search className="h-4 w-4" /></Button>
              </div>
            </div>
            <Button onClick={applyFilters} className="w-full"><Filter className="h-4 w-4 mr-2" /> Apply Filters</Button>
          </CardContent>
        </Card>
        <div className="mb-4 text-sm text-slate-600">Showing {contracts.length} of {total} contracts</div>
        <div className="grid gap-4">
          {loading ? <div className="text-center py-12 text-slate-500">Loading...</div> : contracts.length === 0 ? <div className="text-center py-12 text-slate-500">No contracts found</div> : contracts.map((c: any) => {
            const risk = getRiskLevel(c.risk_score)
            const dt = dataTypeConfig[c.data_type as keyof typeof dataTypeConfig]
            return (
              <Card key={c.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-start gap-3 mb-3">
                    <Badge variant={c.data_type as any} className="text-xs">{dt?.label || c.data_type}</Badge>
                    <Badge variant={risk.level as any} className="text-xs">Risk: {risk.level} ({c.risk_score})</Badge>
                    <Badge variant="outline" className="text-xs">{c.county}</Badge>
                    <Badge variant="outline" className="text-xs">{c.year}</Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{c.title}</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div><span className="text-slate-500">Supplier:</span> <span className="ml-2 font-medium">{c.supplier}</span></div>
                    <div><span className="text-slate-500">Value:</span> <span className="ml-2 font-medium text-kenya-teal">KES {Number(c.value_kes||0).toLocaleString()}</span></div>
                    <div><span className="text-slate-500">Bid Type:</span> <span className="ml-2 font-medium">{c.bid_type}</span></div>
                  </div>
                  {c.source_url && <div className="mt-3 text-xs"><span className="text-slate-500">Source: </span><a href={c.source_url} target="_blank" className="text-kenya-teal hover:underline">{c.source_name || "View Source"}</a></div>}
                </CardContent>
              </Card>
            )
          })}
        </div>
        {total > 20 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
            <span className="px-4 py-2 text-sm">Page {page} of {Math.ceil(total / 20)}</span>
            <Button variant="outline" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)}>Next</Button>
          </div>
        )}
      </div>
    </div>
  )
}