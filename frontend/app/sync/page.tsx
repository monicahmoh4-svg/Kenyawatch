"use client"

import { useState, useEffect } from "react"
import { RefreshCw, Database, Filter, CheckCircle, AlertTriangle, Loader2, Search, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"

export default function SyncPage() {
  const [syncStatus, setSyncStatus] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<any>(null)
  const [selectedYear, setSelectedYear] = useState("2024")
  const [selectedCounty, setSelectedCounty] = useState("")
  const [contracts, setContracts] = useState<any[]>([])
  const [contractsLoading, setContractsLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState<any>(null)

  const [filters, setFilters] = useState({
    county: "",
    sector: "",
    year: "",
    data_type: "",
    search: "",
  })

  useEffect(() => {
    loadSyncStatus()
    loadMeta()
    loadContracts()
  }, [page])

  const loadSyncStatus = async () => {
    try {
      const res = await api.get('/api/sync/status')
      setSyncStatus(res.data)
    } catch (e) {
      console.error('Failed to load sync status:', e)
    } finally {
      setLoading(false)
    }
  }

  const loadMeta = async () => {
    try {
      const res = await api.get('/api/contracts/meta')
      setMeta(res.data)
    } catch (e) {
      console.error('Failed to load meta:', e)
    }
  }

  const loadContracts = async () => {
    setContractsLoading(true)
    try {
      const params: Record<string, string | number> = { page, limit: 50 }
      if (filters.county) params.county = filters.county
      if (filters.sector) params.sector = filters.sector
      if (filters.year) params.year = filters.year
      if (filters.data_type) params.data_type = filters.data_type
      if (filters.search) params.search = filters.search
      const res = await api.get('/api/contracts', { params })
      setContracts(res.data.results)
      setTotal(res.data.total)
    } catch (e) {
      console.error('Failed to load contracts:', e)
    } finally {
      setContractsLoading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await api.post('/api/sync/ocds', {
        year: Number(selectedYear),
        county: selectedCounty || undefined
      })
      setSyncResult(res.data)
      loadSyncStatus()
      loadContracts()
    } catch (e: any) {
      setSyncResult({ error: e?.response?.data?.error || 'Sync failed' })
    } finally {
      setSyncing(false)
    }
  }

  const applyFilters = () => {
    setPage(1)
    loadContracts()
  }

  const years = Array.from({ length: 12 }, (_, i) => 2015 + i)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="relative py-12 md:py-16 mb-8 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=80"
            alt="Data synchronization"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/90" />
        </div>
        <div className="relative z-10 container mx-auto px-6">
          <div className="flex items-center gap-3 mb-3">
            <Database className="h-6 w-6 text-blue-400" />
            <h1 className="text-3xl md:text-4xl font-bold">Data Sync & Browser</h1>
          </div>
          <p className="text-slate-400 max-w-2xl">
            Browse all contracts and sync new data from the Public Procurement Information Portal.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 pb-12 space-y-6">
        {/* Sync Controls */}
        <div className="border border-slate-200 bg-white rounded-xl">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw className="h-4 w-4 text-slate-500" />
              <h2 className="text-lg font-semibold text-slate-800">Sync from PPIP</h2>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Fetch real contract data from Kenya's Public Procurement Information Portal (tenders.go.ke). Data is sourced from the Open Contracting Data Standard (OCDS) feed.
            </p>
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {years.map(y => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">County (Optional)</label>
                <Select value={selectedCounty || "all"} onValueChange={(v) => setSelectedCounty(v === "all" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="All Counties" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Counties</SelectItem>
                    {meta?.counties?.map((c: string) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleSync}
                  disabled={syncing}
                  className="w-full bg-teal-600 hover:bg-teal-500"
                >
                  {syncing ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Syncing...</>
                  ) : (
                    <><RefreshCw className="h-4 w-4 mr-2" /> Sync Now</>
                  )}
                </Button>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={loadContracts}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowUpDown className="h-4 w-4 mr-2" /> Refresh Data
                </Button>
              </div>
            </div>
            {syncResult && (
              <div className={`p-4 rounded-lg ${syncResult.error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                {syncResult.error ? (
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    <span>{syncResult.error}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span>Sync complete: {syncResult.added} new contracts added from {syncResult.total_releases} releases for {syncResult.year}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Contract Browser with Filters */}
        <div className="border border-slate-200 bg-white rounded-xl">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Search className="h-4 w-4 text-slate-500" />
              <h2 className="text-lg font-semibold text-slate-800">Browse Contracts</h2>
              <Badge variant="outline" className="ml-auto">{total.toLocaleString()} total</Badge>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
              <Select value={filters.county || "all"} onValueChange={(v) => setFilters({...filters, county: v === "all" ? "" : v})}>
                <SelectTrigger><SelectValue placeholder="All Counties" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Counties</SelectItem>
                  {meta?.counties?.map((c: string) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.sector || "all"} onValueChange={(v) => setFilters({...filters, sector: v === "all" ? "" : v})}>
                <SelectTrigger><SelectValue placeholder="All Sectors" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {meta?.sectors?.map((s: string) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.year || "all"} onValueChange={(v) => setFilters({...filters, year: v === "all" ? "" : v})}>
                <SelectTrigger><SelectValue placeholder="All Years" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {meta?.years?.map((y: number) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.data_type || "all"} onValueChange={(v) => setFilters({...filters, data_type: v === "all" ? "" : v})}>
                <SelectTrigger><SelectValue placeholder="All Data Types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Data Types</SelectItem>
                  <SelectItem value="live_sync">Live Sync (PPIP)</SelectItem>
                  <SelectItem value="documented">Documented Cases</SelectItem>
                  <SelectItem value="reference">Reference Data</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Search contracts..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              />
              <Button onClick={applyFilters} className="bg-teal-600 hover:bg-teal-500">
                <Filter className="h-4 w-4 mr-2" /> Apply
              </Button>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Contract ID</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Title</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">County</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Sector</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Value</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Supplier</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-700">Risk</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-700">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contractsLoading ? (
                    <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Loading contracts...
                    </td></tr>
                  ) : contracts.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                      No contracts found. Try adjusting your filters.
                    </td></tr>
                  ) : contracts.map((c: any) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs">{c.contract_id}</td>
                      <td className="px-4 py-3 max-w-xs truncate">{c.title}</td>
                      <td className="px-4 py-3">{c.county}</td>
                      <td className="px-4 py-3">{c.sector}</td>
                      <td className="px-4 py-3 text-right font-medium text-teal-600">{formatCurrency(c.value_kes)}</td>
                      <td className="px-4 py-3 max-w-[200px] truncate">{c.supplier}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={c.risk_score >= 75 ? 'destructive' : c.risk_score >= 50 ? 'secondary' : 'outline'}>
                          {c.risk_score}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={c.data_type as any} className="text-[10px]">
                          {c.data_type === 'live_sync' ? 'PPIP' : c.data_type}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {total > 50 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  Previous
                </Button>
                <span className="px-4 py-2 text-sm text-slate-600">
                  Page {page} of {Math.ceil(total / 50)}
                </span>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 50)}>
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sync History */}
        <div className="border border-slate-200 bg-white rounded-xl">
          <div className="p-5">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Sync History</h2>
            {loading ? (
              <div className="text-center py-8 text-slate-500">Loading...</div>
            ) : syncStatus.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No sync history yet. Click "Sync Now" to fetch data from PPIP.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Year</th>
                      <th className="px-4 py-3 text-left">County</th>
                      <th className="px-4 py-3 text-right">Records Added</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {syncStatus.map((s: any) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">{new Date(s.created_at).toLocaleString()}</td>
                        <td className="px-4 py-3">{s.year}</td>
                        <td className="px-4 py-3">{s.county || 'All'}</td>
                        <td className="px-4 py-3 text-right">{s.records_added}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={s.status === 'ok' ? 'documented' : 'destructive'}>
                            {s.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
