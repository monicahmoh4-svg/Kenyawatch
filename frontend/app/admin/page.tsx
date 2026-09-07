"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Shield,
  Lock,
  FileText,
  AlertTriangle,
  FolderOpen,
  RefreshCw,
  BarChart3,
  Eye,
  Trash2,
  Search,
  LogOut,
  Activity,
  TrendingUp,
  Users,
  Settings,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

interface DashboardData {
  total_contracts: number
  total_reports: number
  total_ghost_projects: number
  risk_distribution: { low: number; medium: number; high: number; critical: number }
  recent_reports: Array<{ id: number; case_number: string; county?: string; category?: string; summary: string; status: string; created_at: string }>
  recent_contracts: Array<{ id: number; contract_id: string; county: string; title: string; supplier: string; value_kes: number; risk_score: number; data_type: string }>
}

export default function AdminPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState("")
  const [token, setToken] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState("")

  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [reports, setReports] = useState<DashboardData["recent_reports"]>([])
  const [contracts, setContracts] = useState<DashboardData["recent_contracts"]>([])
  const [contractSearch, setContractSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<any>(null)
  const [reseedLoading, setReseedLoading] = useState(false)

  useEffect(() => {
    const savedToken = localStorage.getItem("kw_admin_token")
    if (savedToken) {
      setToken(savedToken)
      setIsLoggedIn(true)
      loadDashboard(savedToken)
    }
  }, [])

  const loadDashboard = async (authToken: string) => {
    setDataLoading(true)
    try {
      const { data } = await api.get("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      setDashboard(data)
      setReports(data.recent_reports || [])
      setContracts(data.critical_contracts || [])
      if (data.overview) {
        data.total_contracts = data.overview.total_contracts
        data.total_reports = data.overview.total_reports
        data.total_ghost_projects = data.overview.total_ghost_projects
        data.total_value_kes = data.overview.total_value_kes
        data.avg_risk_score = data.overview.avg_risk_score
      }
      if (data.risk_distribution && Array.isArray(data.risk_distribution)) {
        const riskMap: any = { low: 0, medium: 0, high: 0, critical: 0 }
        data.risk_distribution.forEach((r: any) => { riskMap[r.level] = r.count })
        data.risk_distribution = riskMap
      }
      setDashboard({ ...data })
    } catch (err: any) {
      if (err?.response?.status === 401) {
        localStorage.removeItem("kw_admin_token")
        setIsLoggedIn(false)
        setToken("")
      }
    } finally {
      setDataLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError("")
    try {
      const { data } = await api.post("/api/admin/login", { password })
      const authToken = data.token
      localStorage.setItem("kw_admin_token", authToken)
      setToken(authToken)
      setIsLoggedIn(true)
      loadDashboard(authToken)
    } catch {
      setLoginError("Invalid password. Please try again.")
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("kw_admin_token")
    setIsLoggedIn(false)
    setToken("")
    setDashboard(null)
  }

  const updateReportStatus = async (reportId: number, newStatus: string) => {
    setActionLoading(`report-${reportId}`)
    try {
      await api.put(`/api/admin/reports/${reportId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setReports((prev) => prev.map((r) => r.id === reportId ? { ...r, status: newStatus } : r))
    } catch {
      // silent
    } finally {
      setActionLoading(null)
    }
  }

  const deleteContract = async (contractId: string) => {
    if (!confirm("Delete this contract?")) return
    setActionLoading(`contract-${contractId}`)
    try {
      await api.delete(`/api/admin/contracts/${contractId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setContracts((prev) => prev.filter((c) => c.contract_id !== contractId))
      if (dashboard) {
        setDashboard({ ...dashboard, total_contracts: dashboard.total_contracts - 1 })
      }
    } catch {
      // silent
    } finally {
      setActionLoading(null)
    }
  }

  const handleReseed = async () => {
    setReseedLoading(true)
    try {
      await api.post("/api/admin/seed", {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      loadDashboard(token)
    } catch {
      // silent
    } finally {
      setReseedLoading(false)
    }
  }

  const loadSyncStatus = async () => {
    try {
      const { data } = await api.get("/api/sync/status")
      setSyncStatus(data)
    } catch {
      // silent
    }
  }

  const filteredContracts = contracts.filter(
    (c) =>
      c.title.toLowerCase().includes(contractSearch.toLowerCase()) ||
      c.county.toLowerCase().includes(contractSearch.toLowerCase()) ||
      c.supplier.toLowerCase().includes(contractSearch.toLowerCase())
  )

  const filteredReports = reports.filter(
    (r) => statusFilter === "all" || r.status === statusFilter
  )

  // ── Login Screen ──
  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-600 shadow-lg mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Admin Access</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Enter the admin password to continue</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-center gap-2">
                  <XCircle className="h-4 w-4 shrink-0" />
                  {loginError}
                </div>
              )}
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-center text-lg tracking-wider"
                autoFocus
              />
              <Button
                type="submit"
                disabled={!password || loginLoading}
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white"
              >
                {loginLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Shield className="mr-2 h-4 w-4" />
                )}
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Admin Dashboard ──
  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Admin Top Bar */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600 to-emerald-600">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-[11px] text-slate-500">KenyaWatch Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => loadDashboard(token)} disabled={dataLoading}>
              <RefreshCw className={cn("h-4 w-4 mr-1", dataLoading && "animate-spin")} />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {dataLoading && !dashboard ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-white border border-slate-200">
              <TabsTrigger value="overview" className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">
                <BarChart3 className="h-4 w-4 mr-1.5" /> Overview
              </TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">
                <FileText className="h-4 w-4 mr-1.5" /> Reports
              </TabsTrigger>
              <TabsTrigger value="contracts" className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">
                <FolderOpen className="h-4 w-4 mr-1.5" /> Contracts
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">
                <Settings className="h-4 w-4 mr-1.5" /> Settings
              </TabsTrigger>
            </TabsList>

            {/* ── Overview Tab ── */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-teal-500">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Contracts</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{dashboard?.total_contracts ?? 0}</p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50">
                        <FolderOpen className="h-5 w-5 text-teal-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Reports</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{dashboard?.total_reports ?? 0}</p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-orange-500">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Ghost Projects</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{dashboard?.total_ghost_projects ?? 0}</p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Critical Risk</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{dashboard?.risk_distribution?.critical ?? 0}</p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                        <TrendingUp className="h-5 w-5 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Risk Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-teal-600" />
                    Risk Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: "Low", count: dashboard?.risk_distribution?.low ?? 0, color: "bg-green-500", bg: "bg-green-50", text: "text-green-700" },
                      { label: "Medium", count: dashboard?.risk_distribution?.medium ?? 0, color: "bg-yellow-500", bg: "bg-yellow-50", text: "text-yellow-700" },
                      { label: "High", count: dashboard?.risk_distribution?.high ?? 0, color: "bg-orange-500", bg: "bg-orange-50", text: "text-orange-700" },
                      { label: "Critical", count: dashboard?.risk_distribution?.critical ?? 0, color: "bg-red-500", bg: "bg-red-50", text: "text-red-700" },
                    ].map((item) => (
                      <div key={item.label} className={cn("rounded-xl p-4", item.bg)}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={cn("h-3 w-3 rounded-full", item.color)} />
                          <span className={cn("text-sm font-medium", item.text)}>{item.label}</span>
                        </div>
                        <p className={cn("text-2xl font-bold", item.text)}>{item.count}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Recent Reports
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {reports.slice(0, 5).map((report) => (
                      <div key={report.id} className="flex items-start justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{report.case_number}</p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{report.summary}</p>
                        </div>
                        <Badge variant={report.status === "resolved" ? "documented" : report.status === "under_review" ? "live_sync" : "manual_scan"} className="shrink-0 ml-2">
                          {report.status}
                        </Badge>
                      </div>
                    ))}
                    {reports.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No reports yet</p>}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FolderOpen className="h-5 w-5 text-teal-600" />
                      Recent Contracts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {contracts.slice(0, 5).map((contract) => (
                      <div key={contract.contract_id} className="flex items-start justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{contract.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{contract.county} &middot; {contract.supplier}</p>
                        </div>
                        <Badge
                          variant={
                            contract.risk_score >= 75 ? "risk_critical" :
                            contract.risk_score >= 50 ? "risk_high" :
                            contract.risk_score >= 25 ? "risk_medium" : "risk_low"
                          }
                          className="shrink-0 ml-2"
                        >
                          {contract.risk_score}%
                        </Badge>
                      </div>
                    ))}
                    {contracts.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No contracts yet</p>}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ── Reports Tab ── */}
            <TabsContent value="reports" className="space-y-4">
              <div className="flex items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
                <span className="text-sm text-slate-500">{filteredReports.length} reports</span>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="px-4 py-3 text-left font-medium text-slate-600">Case #</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">County</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">Category</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">Summary</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReports.map((report) => (
                          <tr key={report.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-900">{report.case_number}</td>
                            <td className="px-4 py-3 text-slate-600">{report.county || "—"}</td>
                            <td className="px-4 py-3 text-slate-600">{report.category || "—"}</td>
                            <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate">{report.summary}</td>
                            <td className="px-4 py-3">
                              <Badge
                                variant={
                                  report.status === "resolved" ? "documented" :
                                  report.status === "under_review" ? "live_sync" :
                                  report.status === "dismissed" ? "reference" : "manual_scan"
                                }
                              >
                                {report.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                {actionLoading === `report-${report.id}` ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                                ) : (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 px-2 text-xs"
                                      onClick={() => updateReportStatus(report.id, "under_review")}
                                      disabled={report.status === "under_review"}
                                    >
                                      <Eye className="h-3 w-3 mr-1" /> Review
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                                      onClick={() => updateReportStatus(report.id, "resolved")}
                                      disabled={report.status === "resolved"}
                                    >
                                      <CheckCircle2 className="h-3 w-3 mr-1" /> Resolve
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredReports.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No reports found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Contracts Tab ── */}
            <TabsContent value="contracts" className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search contracts..."
                    value={contractSearch}
                    onChange={(e) => setContractSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <span className="text-sm text-slate-500">{filteredContracts.length} contracts</span>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="px-4 py-3 text-left font-medium text-slate-600">Title</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">County</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">Supplier</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">Value (KES)</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">Risk</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredContracts.map((contract) => (
                          <tr key={contract.contract_id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-900 max-w-[200px] truncate">{contract.title}</td>
                            <td className="px-4 py-3 text-slate-600">{contract.county}</td>
                            <td className="px-4 py-3 text-slate-600 max-w-[150px] truncate">{contract.supplier}</td>
                            <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                              {new Intl.NumberFormat("en-KE").format(contract.value_kes)}
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                variant={
                                  contract.risk_score >= 75 ? "risk_critical" :
                                  contract.risk_score >= 50 ? "risk_high" :
                                  contract.risk_score >= 25 ? "risk_medium" : "risk_low"
                                }
                              >
                                {contract.risk_score}%
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              {actionLoading === `contract-${contract.contract_id}` ? (
                                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => deleteContract(contract.contract_id)}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" /> Delete
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                        {filteredContracts.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No contracts found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Settings Tab ── */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <RefreshCw className="h-5 w-5 text-teal-600" />
                      Database Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-600">
                      Reseed the database with sample procurement data. This will refresh all contracts, ghost projects, and statistics.
                    </p>
                    <Button
                      onClick={handleReseed}
                      disabled={reseedLoading}
                      className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white"
                    >
                      {reseedLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      Reseed Database
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      Sync Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-600">
                      View the current OCDS sync status from the PPIP portal.
                    </p>
                    <Button variant="outline" onClick={loadSyncStatus}>
                      <Clock className="mr-2 h-4 w-4" />
                      Check Sync Status
                    </Button>
                    {syncStatus && (
                      <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Status:</span>
                          <Badge variant={syncStatus.status === "completed" ? "documented" : "live_sync"}>
                            {syncStatus.status}
                          </Badge>
                        </div>
                        {syncStatus.last_sync && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Last Sync:</span>
                            <span className="text-slate-700">{new Date(syncStatus.last_sync).toLocaleString()}</span>
                          </div>
                        )}
                        {syncStatus.records_synced !== undefined && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Records:</span>
                            <span className="text-slate-700">{syncStatus.records_synced}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-slate-600" />
                      Admin Session
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <div>
                        <p className="text-sm font-medium text-slate-900">Authenticated Session</p>
                        <p className="text-xs text-slate-500 mt-0.5">You are logged in as an administrator</p>
                      </div>
                      <Button variant="destructive" size="sm" onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-1" />
                        Sign Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
