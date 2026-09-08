"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Bell, CheckCheck, AlertTriangle, AlertCircle, Info, Shield, Search, Filter, Volume2, VolumeX, Loader2, CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { alertsApi } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; border: string; icon: any }> = {
  critical: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle },
  high: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertCircle },
  medium: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: Info },
  low: { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', icon: Info },
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [stats, setStats] = useState<any>(null)
  const [severity, setSeverity] = useState("")
  const [acknowledged, setAcknowledged] = useState("")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [scanning, setScanning] = useState(false)
  const prevUnreadCount = useRef(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const loadAlerts = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, limit: 20 }
      if (severity) params.severity = severity
      if (acknowledged) params.acknowledged = acknowledged
      const res = await alertsApi.list(params)
      setAlerts(res.data.alerts)
      setTotal(res.data.total)
    } catch (e) {
      console.error("Failed to load alerts:", e)
    } finally {
      setLoading(false)
    }
  }, [page, severity, acknowledged])

  const loadStats = async () => {
    try {
      const res = await alertsApi.stats()
      setStats(res.data)

      if (res.data.unread > prevUnreadCount.current && soundEnabled) {
        playAlertSound()
      }
      prevUnreadCount.current = res.data.unread
    } catch {}
  }

  const playAlertSound = () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH+JkI+LhX12dX+DipCLhH11dH2BiI+LhHx0c3yAiI6KhHtzcnqAh42Jg3pycXl/h4yIg3lxcHd+hoyIg3hwb3Z9hYuHg3dwbXV8hIqGg3Zwa3R8g4mFg3Vvam97goeEg3RuaG56gYaDg3NtZ215gIWCg3JsZmx4f4SBg3FrZWt3foOAg3BqY2p2fYJ/gG9pYml1fIF+fm9oYWd0e4B9fW5nYGVzeX58fG1mX2RyeH17e2xlXmJxdnx6empkXGFwc3t5eGljW19vcnp4d2diWl5ucXl3dmZhWV1tcHd2dWVgV1xrbnZ1dGRfVltqbHV0c2NeVVppa3Nyc2JdU1loaXFxcWBcUlho

Playing alert sound...</think>Now let me create the alerts page with sound notifications:<tool_call>
<function=write>
<parameter=content>"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Bell, CheckCheck, AlertTriangle, AlertCircle, Info, Shield, Loader2, CheckCircle, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { alertsApi } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [stats, setStats] = useState<any>(null)
  const [severity, setSeverity] = useState("")
  const [acknowledged, setAcknowledged] = useState("")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [scanning, setScanning] = useState(false)
  const prevUnread = useRef(0)
  const audioCtxRef = useRef<AudioContext | null>(null)

  const playAlertSound = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const ctx = audioCtxRef.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1)
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2)
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.5)
    } catch {}
  }

  const loadAlerts = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { limit: 20, offset: (page - 1) * 20 }
      if (severity) params.severity = severity
      if (acknowledged) params.acknowledged = acknowledged
      const res = await alertsApi.list(params)
      setAlerts(res.data.alerts)
      setTotal(res.data.total)
    } catch (e) {
      console.error("Failed to load alerts:", e)
    } finally {
      setLoading(false)
    }
  }, [page, severity, acknowledged])

  const loadStats = async () => {
    try {
      const res = await alertsApi.stats()
      setStats(res.data)
      if (res.data.unread > prevUnread.current && soundEnabled) {
        playAlertSound()
      }
      prevUnread.current = res.data.unread
    } catch {}
  }

  useEffect(() => { loadAlerts(); loadStats() }, [loadAlerts])
  useEffect(() => {
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [loadStats])

  const handleAcknowledge = async (id: number) => {
    try {
      await alertsApi.acknowledge(id)
      loadAlerts()
      loadStats()
    } catch {}
  }

  const handleAcknowledgeAll = async () => {
    try {
      await alertsApi.acknowledgeAll()
      loadAlerts()
      loadStats()
    } catch {}
  }

  const handleScan = async () => {
    setScanning(true)
    try {
      await alertsApi.triggerScan()
      loadAlerts()
      loadStats()
    } catch {} finally {
      setScanning(false)
    }
  }

  const getSeverityConfig = (sev: string) => {
    switch (sev) {
      case 'critical': return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle, label: 'Critical' }
      case 'high': return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertCircle, label: 'High' }
      case 'medium': return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: Info, label: 'Medium' }
      default: return { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', icon: Info, label: 'Low' }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative py-12 md:py-16 mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-slate-900" />
        <div className="relative z-10 container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Bell className="h-6 w-6 text-red-400" />
                <h1 className="text-3xl md:text-4xl font-bold">Alert Center</h1>
              </div>
              <p className="text-slate-400 max-w-2xl">
                AI-powered real-time monitoring for procurement anomalies and corruption indicators.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setSoundEnabled(!soundEnabled)}
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white"
              >
                {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </Button>
              <Button onClick={handleScan} disabled={scanning} className="bg-teal-600 hover:bg-teal-500">
                {scanning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
                Run Scan
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 pb-12 space-y-6">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border border-slate-200 bg-white rounded-xl p-5">
              <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
              <div className="text-sm text-slate-500">Total Alerts</div>
            </div>
            <div className="border border-red-200 bg-red-50 rounded-xl p-5">
              <div className="text-2xl font-bold text-red-600">{stats.unread}</div>
              <div className="text-sm text-red-500">Unread Alerts</div>
            </div>
            <div className="border border-slate-200 bg-white rounded-xl p-5">
              <div className="text-2xl font-bold text-orange-600">
                {stats.by_severity?.find((s: any) => s.severity === 'critical')?.count || 0}
              </div>
              <div className="text-sm text-slate-500">Critical</div>
            </div>
            <div className="border border-slate-200 bg-white rounded-xl p-5">
              <div className="text-2xl font-bold text-amber-600">
                {stats.by_severity?.find((s: any) => s.severity === 'high')?.count || 0}
              </div>
              <div className="text-sm text-slate-500">High Priority</div>
            </div>
          </div>
        )}

        <div className="border border-slate-200 bg-white rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-slate-500" />
              <h2 className="text-lg font-semibold text-slate-800">Active Alerts</h2>
            </div>
            <div className="flex items-center gap-2">
              <Select value={severity || "all"} onValueChange={(v) => { setSeverity(v === "all" ? "" : v); setPage(1) }}>
                <SelectTrigger className="w-40"><SelectValue placeholder="All Severities" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={acknowledged || "all"} onValueChange={(v) => { setAcknowledged(v === "all" ? "" : v); setPage(1) }}>
                <SelectTrigger className="w-40"><SelectValue placeholder="All Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="false">Unread</SelectItem>
                  <SelectItem value="true">Read</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAcknowledgeAll} variant="outline" size="sm">
                <CheckCheck className="h-4 w-4 mr-1" /> Mark All Read
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No alerts found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert: any) => {
                const sev = getSeverityConfig(alert.severity)
                const SevIcon = sev.icon
                return (
                  <div
                    key={alert.id}
                    className={`border ${sev.border} ${sev.bg} rounded-lg p-4 ${alert.acknowledged ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <SevIcon className={`h-5 w-5 ${sev.color} mt-0.5 flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={`${sev.color} text-xs`}>{sev.label}</Badge>
                            <span className="text-xs text-slate-500">{alert.alert_type?.replace(/_/g, ' ')}</span>
                            {alert.contract_id && (
                              <span className="text-xs font-mono text-slate-400">{alert.contract_id}</span>
                            )}
                          </div>
                          <p className="text-sm text-slate-800 mb-2">{alert.message}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            {alert.contract_county && <span>{alert.contract_county}</span>}
                            {alert.contract_value && <span>{formatCurrency(alert.contract_value)}</span>}
                            {alert.contract_supplier && <span className="truncate max-w-[200px]">{alert.contract_supplier}</span>}
                            <span>{new Date(alert.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      {!alert.acknowledged && (
                        <Button
                          onClick={() => handleAcknowledge(alert.id)}
                          variant="ghost"
                          size="sm"
                          className="flex-shrink-0"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

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
      </div>
    </div>
  )
}
