"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Bell, X, AlertTriangle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { alertsApi } from "@/lib/api"

export function AlertNotification() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [recentAlerts, setRecentAlerts] = useState<any[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const prevCount = useRef(0)
  const audioCtxRef = useRef<AudioContext | null>(null)

  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') ctx.resume()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1)
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2)
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.4)
    } catch {}
  }, [soundEnabled])

  const checkAlerts = useCallback(async () => {
    try {
      const res = await alertsApi.unreadCount()
      const count = res.data.count
      setUnreadCount(count)
      if (count > prevCount.current && prevCount.current > 0) {
        playNotificationSound()
        const alertsRes = await alertsApi.list({ limit: 5, acknowledged: 'false' })
        setRecentAlerts(alertsRes.data.alerts || [])
      }
      prevCount.current = count
    } catch {}
  }, [playNotificationSound])

  useEffect(() => {
    checkAlerts()
    const interval = setInterval(checkAlerts, 15000)
    return () => clearInterval(interval)
  }, [checkAlerts])

  if (unreadCount === 0) return null

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 text-slate-600 hover:text-red-600"
        onClick={() => {
          setShowDropdown(!showDropdown)
          if (!showDropdown) {
            alertsApi.list({ limit: 5, acknowledged: 'false' }).then(res => {
              setRecentAlerts(res.data.alerts || [])
            }).catch(() => {})
          }
        }}
      >
        <Bell className="h-5 w-5" />
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      </Button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-red-500" />
                <span className="font-semibold text-sm">Alerts</span>
                <span className="text-xs text-slate-500">({unreadCount} unread)</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowDropdown(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {recentAlerts.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">No new alerts</div>
              ) : recentAlerts.map((alert: any) => (
                <div key={alert.id} className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50">
                  <div className="flex items-start gap-2">
                    {alert.severity === 'critical' ? (
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-800 line-clamp-2">{alert.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(alert.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-slate-100">
              <a href="/alerts" className="text-center block text-sm font-medium text-teal-600 hover:text-teal-700">
                View All Alerts
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
