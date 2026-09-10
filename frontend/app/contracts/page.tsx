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
    <div className="min-h-screen bg-slate-50">
      <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" /></div>}>
        <ContractsPage />
      </Suspense>
    </div>
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
    const headers = ["Contract ID", "Title", "County", "Sector", "Year", "Supplier", "Value (KES)", "Risk Score", "Data Type"]
    const rows = contracts.map(c => [
      c.contract_id, `"${(c.title || "").replace(/"/g, '""')}"`,
      c.county || "", c.sector || "", c.year || "", `"${(c.supplier || "").replace(/"/g, '""')}"`,
      c.value_kes || 0, c.risk_score || 0, c.data_type || ""
    ])
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
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

  useEffect(() => {
    if (!selectedContract) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedContract(null)
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])")
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
    <div>
      {/* Hero Header */}
      <section className="relative py-12 md:py-16 mb-8 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(20, 184, 166, 0.3) 0%, transparent 50%)`
        }} />
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
                <Input placeholder="Search..." value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} onKeyDown={(e) => e.key === "Enter" && applyFilters()} className="flex-1" />
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
            Showing <span className="font-medium text-slate-700">{contracts.length}</span> of <span className="font-medium text-slate-700">{total.toLocaleString()}</span> contracts
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
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono text-xs text-slate-600">{c.contract_id}</span>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-medium text-slate-900 truncate">{c.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5 truncate">{c.source_name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          <span>{c.county}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant="outline" className="text-xs">{c.sector}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-teal-600">
                        {formatCurrency(c.value_kes)}
                      </td>
                      <td className="px-4 py-3 max-w-[200px] truncate text-slate-600">
                        {c.supplier}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={`risk_${risk.level}` as any}>{c.risk_score}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button onClick={() => handleViewContract(c)} variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
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
        {total > 20 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              Previous
            </Button>
            <span className="px-4 py-2 text-sm text-slate-600">
              Page {page} of {Math.ceil(total / 20)}
            </span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)}>
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Contract Detail Modal */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setSelectedContract(null)}>
          <div
            ref={modalRef}
            tabIndex={-1}
            className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Contract Details</h2>
              <Button onClick={() => setSelectedContract(null)} variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              {detailLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{selectedContract.title}</h3>
                    <p className="text-sm text-slate-500 font-mono">{selectedContract.contract_id}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-slate-400" /><span className="text-slate-600">{selectedContract.county}</span></div>
                    <div className="flex items-center gap-2 text-sm"><Building2 className="h-4 w-4 text-slate-400" /><span className="text-slate-600">{selectedContract.sector}</span></div>
                    <div className="flex items-center gap-2 text-sm"><DollarSign className="h-4 w-4 text-slate-400" /><span className="text-slate-600">{formatCurrency(selectedContract.value_kes)}</span></div>
                    <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-slate-400" /><span className="text-slate-600">{selectedContract.award_date}</span></div>
                    <div className="flex items-center gap-2 text-sm"><Tag className="h-4 w-4 text-slate-400" /><span className="text-slate-600">{selectedContract.bid_type}</span></div>
                    <div className="flex items-center gap-2 text-sm"><AlertTriangle className="h-4 w-4 text-slate-400" /><span className="text-slate-600">Risk: {selectedContract.risk_score}/100</span></div>
                  </div>
                  {selectedContract.supplier && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-1">Supplier</h4>
                      <p className="text-sm text-slate-600">{selectedContract.supplier}</p>
                    </div>
                  )}
                  {selectedContract.scope && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-1">Scope</h4>
                      <p className="text-sm text-slate-600">{selectedContract.scope}</p>
                    </div>
                  )}
                  {selectedContract.source_url && (
                    <a href={selectedContract.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium">
                      <ExternalLink className="h-3.5 w-3.5" /> View Original Source ({selectedContract.source_name || "External"})
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
