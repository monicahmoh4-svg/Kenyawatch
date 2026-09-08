"use client"

import { Suspense, useEffect, useState, useCallback, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Search, Filter, Eye, ExternalLink, X, Calendar, MapPin, Building2, AlertTriangle, FileText, DollarSign, Tag, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { contractsApi } from "@/lib/api"
import { getRiskLevel, dataTypeConfig, formatCurrency } from "@/lib/utils"
import { type Contract } from "@/types"

export default function ContractsPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <ContractsPage />
    </Suspense>
  )
}

function ContractsPage() {
  const searchParams = useSearchParams()
  const [contracts, setContracts] = useState<any[]>([])
  const [meta, setMeta] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  const [filters, setFilters] = useState({
    county: "", sector: "", year: "", risk_level: "", data_type: "",
    search: searchParams.get("search") || "",
  })

  const loadContracts = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page, limit: 20 }
      if (filters.county) params.county = filters.county
      if (filters.sector) params.sector = filters.sector
      if (filters.year) params.year = filters.year
      if (filters.risk_level) params.risk_level = filters.risk_level
      if (filters.data_type) params.data_type = filters.data_type
      if (filters.search) params.search = filters.search
      const res = await contractsApi.list(params)
      setContracts(res.data.results)
      setTotal(res.data.total)
    } catch (error) {
      console.error("Failed to load contracts:", error)
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  const loadMeta = async () => {
    try { const res = await contractsApi.getMeta(); setMeta(res.data) } catch {}
  }

  useEffect(() => { loadContracts() }, [loadContracts])
  useEffect(() => { loadMeta() }, [])

  const applyFilters = () => { setPage(1) }

  const exportCSV = () => {
    const headers = ["Contract ID", "Title", "County", "Sector", "Year", "Supplier", "Value (KES)", "Risk Score", "Data Type", "Source"]
    const rows = contracts.map(c => [
      c.contract_id, `"${(c.title || '').replace(/"/g, '""')}"`,
      c.county || '', c.sector || '', c.year || '', `"${(c.supplier || '').replace(/"/g, '""')}"`,
      c.value_kes || 0, c.risk_score || 0, c.data_type || '', c.source_name || ''
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kenyawatch-contracts-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleViewContract = async (contract: any) => {
    setDetailLoading(true)
    setSelectedContract(contract)
    try {
      const res = await contractsApi.getById(contract.contract_id)
      setSelectedContract(res.data)
    } catch {} finally { setDetailLoading(false) }
  }

  // Focus trap and escape key for modal
  useEffect(() => {
    if (!selectedContract) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedContract(null)
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    modalRef.current?.focus()
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [selectedContract])

  const totalValue = contracts.reduce((sum: number, c: any) => sum + (c.value_kes || 0), 0)
  const avgRisk = contracts.length ? Math.round(contracts.reduce((sum: number, c: any) => sum + (c.risk_score || 0), 0) / contracts.length) : 0

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="relative py-12 md:py-16 mb-8 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1450101499163-c8848e968838?w=1920&q=80"
            alt="Government contracts"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/90" />
        </div>
        <div className="relative z-10 container mx-auto px-6">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="h-6 w-6 text-teal-400" />
            <h1 className="text-3xl md:text-4xl font-bold">Procurement Database</h1>
          </div>
          <p className="text-slate-400 mb-8 max-w-2xl">
            Search and analyze government contracts across all 47 counties with AI-powered risk scoring.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Contracts", value: total.toLocaleString(), color: "text-white" },
              { label: "Total Value", value: formatCurrency(totalValue), color: "text-teal-400" },
              { label: "Avg Risk Score", value: String(avgRisk), color: "text-amber-400" },
              { label: "Counties", value: "47", color: "text-blue-400" },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className={`text-xl md:text-2xl font-bold ${stat.color} mb-1`}>
                  {loading ? <span className="inline-block w-16 h-5 skeleton" /> : stat.value}
                </div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 pb-12">
        {/* Filters */}
        <Card className="mb-6 border border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-slate-500" />
              <h2 className="text-sm font-medium text-slate-700">Filters</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-3 mb-3">
              <Select value={filters.county || "all"} onValueChange={(v) => setFilters({...filters, county: v === "all" ? "" : v})}>
                <SelectTrigger><SelectValue placeholder="All Counties" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Counties</SelectItem>
                  {meta?.counties?.map((c: string) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                </SelectContent>
              </Select>
              <Select value={filters.sector || "all"} onValueChange={(v) => setFilters({...filters, sector: v === "all" ? "" : v})}>
                <SelectTrigger><SelectValue placeholder="All Sectors" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {meta?.sectors?.map((s: string) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                </SelectContent>
              </Select>
              <Select value={filters.year || "all"} onValueChange={(v) => setFilters({...filters, year: v === "all" ? "" : v})}>
                <SelectTrigger><SelectValue placeholder="All Years" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {meta?.years?.map((y: number) => (<SelectItem key={y} value={String(y)}>{y}</SelectItem>))}
                </SelectContent>
              </Select>
              <Select value={filters.risk_level || "all"} onValueChange={(v) => setFilters({...filters, risk_level: v === "all" ? "" : v})}>
                <SelectTrigger><SelectValue placeholder="All Risk Levels" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="critical">Critical Risk</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.data_type || "all"} onValueChange={(v) => setFilters({...filters, data_type: v === "all" ? "" : v})}>
                <SelectTrigger><SelectValue placeholder="All Data Types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Data Types</SelectItem>
                  <SelectItem value="documented">Documented</SelectItem>
                  <SelectItem value="live_sync">Live Sync</SelectItem>
                  <SelectItem value="manual_scan">Manual Scan</SelectItem>
                  <SelectItem value="reference">Reference</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input placeholder="Search..." value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} className="flex-1" />
                <Button onClick={applyFilters} size="icon" variant="outline" className="flex-shrink-0" aria-label="Search contracts">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-700">{contracts.length}</span> of <span className="font-medium text-slate-700">{total}</span> contracts
          </p>
          <Button onClick={exportCSV} variant="outline" size="sm" disabled={contracts.length === 0}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>

        {/* Table */}
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-4 py-3 whitespace-nowrap">Contract ID</th>
                  <th scope="col" className="px-4 py-3">Details</th>
                  <th scope="col" className="px-4 py-3 whitespace-nowrap">County</th>
                  <th scope="col" className="px-4 py-3 whitespace-nowrap">Sector</th>
                  <th scope="col" className="px-4 py-3 text-right whitespace-nowrap">Value</th>
                  <th scope="col" className="px-4 py-3">Supplier</th>
                  <th scope="col" className="px-4 py-3 text-center whitespace-nowrap">Risk</th>
                  <th scope="col" className="px-4 py-3 text-center whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={8} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-slate-500">Loading contracts...</span>
                    </div>
                  </td></tr>
                ) : contracts.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <AlertTriangle className="h-10 w-10 text-slate-300" />
                      <span className="text-sm text-slate-500">No contracts found matching your criteria</span>
                    </div>
                  </td></tr>
                ) : contracts.map((c: any) => {
                  const risk = getRiskLevel(c.risk_score)
                  const dt = dataTypeConfig[c.data_type as keyof typeof dataTypeConfig]
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono text-xs text-slate-600">{c.contract_id}</span>
                        <Badge variant={c.data_type as any} className="mt-1 text-[10px] px-1.5 py-0">{dt?.label || c.data_type}</Badge>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-medium text-slate-900 line-clamp-2">{c.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5">Year: {c.year}</div>
                        {c.source_url && (
                          <a href={c.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-600 hover:underline flex items-center gap-1 mt-1">
                            <ExternalLink className="h-3 w-3" /> Source
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                        <MapPin className="h-3 w-3 text-slate-400 inline mr-1" />{c.county}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600">{c.sector}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap font-medium text-slate-900">{formatCurrency(c.value_kes)}</td>
                      <td className="px-4 py-3 max-w-[180px]"><div className="truncate text-slate-600" title={c.supplier}>{c.supplier}</div></td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <Badge variant={risk.level as any} className="font-mono text-xs">{c.risk_score}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleViewContract(c)} aria-label={`View contract ${c.contract_id}`}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {total > 20 && !loading && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
            <span className="px-4 py-2 text-sm text-slate-600">Page {page} of {Math.ceil(total / 20)}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)}>Next</Button>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 modal-overlay" onClick={() => setSelectedContract(null)} />
          <div ref={modalRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Contract details" className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto modal-content outline-none">
            <div className="sticky top-0 bg-slate-900 text-white p-5 rounded-t-xl z-10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-slate-400 mb-1 font-mono">{selectedContract.contract_id}</div>
                  <h2 className="text-lg font-bold leading-snug pr-8">{selectedContract.title}</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedContract(null)} className="text-slate-400 hover:text-white hover:bg-slate-800 absolute top-4 right-4 h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant={selectedContract.data_type as any} className="text-xs">{dataTypeConfig[selectedContract.data_type as keyof typeof dataTypeConfig]?.label}</Badge>
                <Badge variant={getRiskLevel(selectedContract.risk_score).level as any} className="text-xs">Risk: {selectedContract.risk_score}</Badge>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {detailLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { icon: MapPin, label: "County", value: selectedContract.county },
                      { icon: Building2, label: "Sector", value: selectedContract.sector },
                      { icon: DollarSign, label: "Value", value: formatCurrency(selectedContract.value_kes), className: "text-teal-600" },
                      { icon: Calendar, label: "Award Date", value: selectedContract.award_date || 'N/A' },
                      { icon: Tag, label: "Bid Type", value: selectedContract.bid_type || 'N/A' },
                      { icon: Calendar, label: "Year", value: selectedContract.year },
                    ].map((item, i) => (
                      <div key={i} className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                          <item.icon className="h-3 w-3" /> {item.label}
                        </div>
                        <div className={`text-sm font-semibold ${item.className || 'text-slate-900'}`}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-xs text-slate-500 mb-1">Supplier</div>
                    <div className="text-sm font-medium text-slate-900">{selectedContract.supplier || 'N/A'}</div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-xs text-slate-500 mb-1">Scope / Description</div>
                    <div className="text-sm text-slate-700 leading-relaxed">{selectedContract.scope || 'No description available'}</div>
                  </div>

                  {selectedContract.risk_flags && Object.keys(selectedContract.risk_flags).length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-red-800 mb-2">
                        <AlertTriangle className="h-3.5 w-3.5" /> Risk Flags Detected
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(selectedContract.risk_flags).map(([key, value]) => (
                          value && <Badge key={key} variant="destructive" className="text-[10px]">{key.replace(/_/g, ' ')}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedContract.source_url && (
                    <a href={selectedContract.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium">
                      <ExternalLink className="h-3.5 w-3.5" /> View Original Source ({selectedContract.source_name || 'External'})
                    </a>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
