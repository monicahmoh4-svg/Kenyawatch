"use client"

import { useEffect, useState } from "react"
import { Search, Filter, Eye, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { contractsApi } from "@/lib/api"
import { getRiskLevel, dataTypeConfig, formatCurrency } from "@/lib/utils"

export default function ContractsPage() {
  const [contracts, setContracts] = useState<any[]>([])
  const [meta, setMeta] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  
  const [filters, setFilters] = useState({
    county: "",
    sector: "",
    year: "",
    risk_level: "",
    data_type: "",
    search: "",
  })

  useEffect(() => {
    loadContracts()
    loadMeta()
  }, [page])

  const loadContracts = async () => {
    setLoading(true)
    try {
      const params = { ...filters, page, limit: 20 }
      const res = await contractsApi.list(params)
      setContracts(res.data.results)
      setTotal(res.data.total)
    } catch (error) {
      console.error("Failed to load contracts:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadMeta = async () => {
    try {
      const res = await contractsApi.getMeta()
      setMeta(res.data)
    } catch (error) {
      console.error("Failed to load meta:", error)
    }
  }

  const applyFilters = () => {
    setPage(1)
    loadContracts()
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      {/* HD Background Header */}
      <div className="relative bg-gradient-to-r from-teal-800 to-teal-600 text-white py-16 mb-8">
        <div 
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80')" }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl font-bold mb-2">Procurement Database</h1>
          <p className="text-lg text-white/90">
            Search and analyze government contracts across all 47 counties
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
              <Select 
                value={filters.county} 
                onValueChange={(v) => setFilters({...filters, county: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Counties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Counties</SelectItem>
                  {meta?.counties?.map((c: string) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={filters.sector} 
                onValueChange={(v) => setFilters({...filters, sector: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Sectors</SelectItem>
                  {meta?.sectors?.map((s: string) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={filters.year} 
                onValueChange={(v) => setFilters({...filters, year: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Years</SelectItem>
                  {meta?.years?.map((y: number) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={filters.risk_level} 
                onValueChange={(v) => setFilters({...filters, risk_level: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Risk Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Risk Levels</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="critical">Critical Risk</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.data_type} 
                onValueChange={(v) => setFilters({...filters, data_type: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Data Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Data Types</SelectItem>
                  <SelectItem value="documented">Documented</SelectItem>
                  <SelectItem value="live_sync">Live Sync</SelectItem>
                  <SelectItem value="manual_scan">Manual Scan</SelectItem>
                  <SelectItem value="reference">Reference</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Input
                  placeholder="Search title/supplier..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="flex-1"
                />
                <Button onClick={applyFilters} size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button onClick={applyFilters} className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </CardContent>
        </Card>

        {/* Results Header */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing {contracts.length} of {total} contracts
          </p>
        </div>

        {/* Data Table */}
        <div className="rounded-md border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap">Contract ID</th>
                  <th className="px-4 py-3">Contract Details</th>
                  <th className="px-4 py-3 whitespace-nowrap">County</th>
                  <th className="px-4 py-3 whitespace-nowrap">Sector</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">Contract Value</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">Risk Score</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                      Loading contracts...
                    </td>
                  </tr>
                ) : contracts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                      No contracts found matching your criteria
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
                          <div className="font-medium text-slate-900 line-clamp-2 group-hover:text-kenya-teal transition-colors">
                            {c.title}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">Year: {c.year}</div>
                          {c.source_url && (
                            <a 
                              href={c.source_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-kenya-teal hover:underline flex items-center gap-1 mt-1.5"
                            >
                              <ExternalLink className="h-3 w-3" /> View Source
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                          {c.county}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                          {c.sector}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap font-medium text-kenya-teal">
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
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-kenya-teal hover:bg-kenya-teal/10">
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
    </div>
  )
}
