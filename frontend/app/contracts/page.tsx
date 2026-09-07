"use client"

import { useEffect, useState, useCallback } from "react"
import { Search, Filter, Eye, ExternalLink, X, Calendar, MapPin, Building2, AlertTriangle, FileText, DollarSign, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { contractsApi } from "@/lib/api"
import { getRiskLevel, dataTypeConfig, formatCurrency } from "@/lib/utils"
import { type Contract } from "@/types"

export default function ContractsPage() {
  const [contracts, setContracts] = useState<any[]>([])
  const [meta, setMeta] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [filters, setFilters] = useState({
    county: "",
    sector: "",
    year: "",
    risk_level: "",
    data_type: "",
    search: "",
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
    try {
      const res = await contractsApi.getMeta()
      setMeta(res.data)
    } catch (error) {
      console.error("Failed to load meta:", error)
    }
  }

  useEffect(() => {
    loadContracts()
  }, [loadContracts])

  useEffect(() => {
    loadMeta()
  }, [])

  const applyFilters = () => {
    setPage(1)
    loadContracts()
  }

  const handleViewContract = async (contract: any) => {
    setDetailLoading(true)
    setSelectedContract(contract)
    try {
      const res = await contractsApi.getById(contract.contract_id)
      setSelectedContract(res.data)
    } catch (e) {
      console.error("Failed to load contract details:", e)
    } finally {
      setDetailLoading(false)
    }
  }

  const totalValue = contracts.reduce((sum: number, c: any) => sum + (c.value_kes || 0), 0)
  const avgRisk = contracts.length ? Math.round(contracts.reduce((sum: number, c: any) => sum + (c.risk_score || 0), 0) / contracts.length) : 0

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white py-16 mb-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-8 w-8 text-teal-300" />
            <h1 className="text-4xl font-bold">Procurement Database</h1>
          </div>
          <p className="text-lg text-white/90 mb-6">
            Search and analyze government contracts across all 47 counties with AI-powered risk scoring
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-teal-300">{total}</div>
              <div className="text-xs text-white/70">Total Contracts</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-300">{formatCurrency(totalValue)}</div>
              <div className="text-xs text-white/70">Total Value</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-300">{avgRisk}</div>
              <div className="text-xs text-white/70">Avg Risk Score</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-300">47</div>
              <div className="text-xs text-white/70">Counties Covered</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        {/* Filters */}
        <Card className="mb-8 shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-teal-600" />
              <h2 className="text-lg font-semibold text-slate-800">Filter Contracts</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
              <Select
                value={filters.county || "all"}
                onValueChange={(v) => setFilters({...filters, county: v === "all" ? "" : v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Counties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Counties</SelectItem>
                  {meta?.counties?.map((c: string) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.sector || "all"}
                onValueChange={(v) => setFilters({...filters, sector: v === "all" ? "" : v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {meta?.sectors?.map((s: string) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.year || "all"}
                onValueChange={(v) => setFilters({...filters, year: v === "all" ? "" : v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {meta?.years?.map((y: number) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.risk_level || "all"}
                onValueChange={(v) => setFilters({...filters, risk_level: v === "all" ? "" : v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Risk Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="critical">Critical Risk</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.data_type || "all"}
                onValueChange={(v) => setFilters({...filters, data_type: v === "all" ? "" : v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Data Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Data Types</SelectItem>
                  <SelectItem value="documented">Documented</SelectItem>
                  <SelectItem value="live_sync">Live Sync</SelectItem>
                  <SelectItem value="manual_scan">Manual Scan</SelectItem>
                  <SelectItem value="reference">Reference</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Input
                  placeholder="Search contracts..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                  className="flex-1"
                />
                <Button onClick={applyFilters} size="icon" className="bg-teal-600 hover:bg-teal-700">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button onClick={applyFilters} className="w-full bg-teal-600 hover:bg-teal-700">
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </CardContent>
        </Card>

        {/* Results Header */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-900">{contracts.length}</span> of <span className="font-semibold text-slate-900">{total}</span> contracts
          </p>
        </div>

        {/* Data Table */}
        <div className="rounded-xl border bg-white shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 font-semibold border-b">
                <tr>
                  <th className="px-4 py-4 whitespace-nowrap">Contract ID</th>
                  <th className="px-4 py-4">Contract Details</th>
                  <th className="px-4 py-4 whitespace-nowrap">County</th>
                  <th className="px-4 py-4 whitespace-nowrap">Sector</th>
                  <th className="px-4 py-4 text-right whitespace-nowrap">Contract Value</th>
                  <th className="px-4 py-4">Supplier</th>
                  <th className="px-4 py-4 text-center whitespace-nowrap">Risk Score</th>
                  <th className="px-4 py-4 text-center whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-slate-500">Loading contracts...</span>
                      </div>
                    </td>
                  </tr>
                ) : contracts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <AlertTriangle className="h-12 w-12 text-slate-300" />
                        <span className="text-slate-500">No contracts found matching your criteria</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  contracts.map((c: any) => {
                    const risk = getRiskLevel(c.risk_score)
                    const dt = dataTypeConfig[c.data_type as keyof typeof dataTypeConfig]

                    return (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex flex-col gap-1.5">
                            <span className="font-mono text-xs text-slate-600">{c.contract_id}</span>
                            <Badge variant={c.data_type as any} className="w-fit text-[10px] px-1.5 py-0">
                              {dt?.label || c.data_type}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <div className="font-medium text-slate-900 line-clamp-2 group-hover:text-teal-600 transition-colors">
                            {c.title}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">Year: {c.year}</div>
                          {c.source_url && (
                            <a
                              href={c.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-teal-600 hover:underline flex items-center gap-1 mt-1.5"
                            >
                              <ExternalLink className="h-3 w-3" /> View Source
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            {c.county}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                          {c.sector}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap font-medium text-teal-600">
                          {formatCurrency(c.value_kes)}
                        </td>
                        <td className="px-4 py-3 max-w-[180px]">
                          <div className="truncate" title={c.supplier}>
                            {c.supplier}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <Badge variant={risk.level as any} className="font-mono text-xs">
                            {c.risk_score}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-teal-600 hover:bg-teal-50"
                            onClick={() => handleViewContract(c)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {total > 20 && !loading && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm text-slate-600">
              Page {page} of {Math.ceil(total / 20)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(total / 20)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Contract Detail Modal */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedContract(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-teal-700 to-emerald-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-white/70 mb-1">{selectedContract.contract_id}</div>
                  <h2 className="text-xl font-bold">{selectedContract.title}</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedContract(null)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <Badge variant={selectedContract.data_type as any} className="text-xs">
                  {dataTypeConfig[selectedContract.data_type as keyof typeof dataTypeConfig]?.label}
                </Badge>
                <Badge variant={getRiskLevel(selectedContract.risk_score).level as any} className="text-xs">
                  Risk: {selectedContract.risk_score}
                </Badge>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {detailLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                        <MapPin className="h-4 w-4" />
                        County
                      </div>
                      <div className="font-semibold text-slate-900">{selectedContract.county}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                        <Building2 className="h-4 w-4" />
                        Sector
                      </div>
                      <div className="font-semibold text-slate-900">{selectedContract.sector}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                        <DollarSign className="h-4 w-4" />
                        Contract Value
                      </div>
                      <div className="font-semibold text-teal-600 text-lg">{formatCurrency(selectedContract.value_kes)}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                        <Calendar className="h-4 w-4" />
                        Award Date
                      </div>
                      <div className="font-semibold text-slate-900">{selectedContract.award_date || 'N/A'}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                        <Tag className="h-4 w-4" />
                        Bid Type
                      </div>
                      <div className="font-semibold text-slate-900 capitalize">{selectedContract.bid_type || 'N/A'}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                        <Calendar className="h-4 w-4" />
                        Year
                      </div>
                      <div className="font-semibold text-slate-900">{selectedContract.year}</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-sm text-slate-500 mb-2">Supplier</div>
                    <div className="font-semibold text-slate-900">{selectedContract.supplier || 'N/A'}</div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-sm text-slate-500 mb-2">Scope / Description</div>
                    <div className="text-slate-700 leading-relaxed">{selectedContract.scope || 'No description available'}</div>
                  </div>

                  {selectedContract.risk_flags && Object.keys(selectedContract.risk_flags).length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-red-800 mb-3">
                        <AlertTriangle className="h-4 w-4" />
                        Risk Flags Detected
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(selectedContract.risk_flags).map(([key, value]) => (
                          value && (
                            <Badge key={key} variant="destructive" className="text-xs">
                              {key.replace(/_/g, ' ')}
                            </Badge>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedContract.source_url && (
                    <a
                      href={selectedContract.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Original Source ({selectedContract.source_name || 'External'})
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
