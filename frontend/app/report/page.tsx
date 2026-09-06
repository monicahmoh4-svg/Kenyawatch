"use client"
import { useState } from "react"
import { Shield, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { reportsApi } from "@/lib/api"

export default function ReportPage() {
  const [form, setForm] = useState({ county: "", category: "", summary: "", details: "" })
  const [submitted, setSubmitted] = useState(false)
  const [caseNumber, setCaseNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await reportsApi.submit(form)
      setCaseNumber(res.data.case_number)
      setSubmitted(true)
    } catch (err) { setError("Failed to submit report. Please try again.") } finally { setLoading(false) }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card><CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="h-8 w-8 text-green-600" /></div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Report Submitted Successfully</h2>
            <p className="text-slate-600 mb-6">Your report has been received and assigned case number:</p>
            <div className="bg-slate-100 rounded-lg p-4 mb-6"><span className="text-2xl font-mono font-bold text-kenya-teal">{caseNumber}</span></div>
            <p className="text-sm text-slate-500">Please save this case number. Due to the sensitive nature of these reports, we cannot provide real-time updates, but credible reports are forwarded to the appropriate authorities.</p>
          </CardContent></Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="relative bg-gradient-to-r from-green-900 to-teal-900 text-white py-16 mb-8">
        <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=1920&q=80')" }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4"><Shield className="h-8 w-8 text-green-400" /><h1 className="text-4xl font-bold">Report Corruption</h1></div>
            <p className="text-lg text-white/90">Safely and anonymously report suspected procurement corruption</p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="mb-8 border-yellow-300 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">Important Security Notice</h3>
                <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                  <li>Do NOT include your name, phone number, or email</li>
                  <li>Do NOT attach files with metadata (photos, documents)</li>
                  <li>Stick to facts - avoid speculation or unverified claims</li>
                  <li>This form does NOT yet strip IP addresses - use Tor/VPN for maximum anonymity</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">County (Optional)</label>
                  <Select value={form.county} onValueChange={(v) => setForm({...form, county: v})}>
                    <SelectTrigger><SelectValue placeholder="Select county" /></SelectTrigger>
                    <SelectContent><SelectItem value="Nairobi">Nairobi</SelectItem><SelectItem value="Mombasa">Mombasa</SelectItem><SelectItem value="Kisumu">Kisumu</SelectItem><SelectItem value="Nakuru">Nakuru</SelectItem></SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
                  <Select value={form.category} onValueChange={(v) => setForm({...form, category: v})} required>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent><SelectItem value="Bid Rigging">Bid Rigging</SelectItem><SelectItem value="Ghost Project">Ghost Project</SelectItem><SelectItem value="Overpricing">Overpricing</SelectItem><SelectItem value="Single-Source Abuse">Single-Source Abuse</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Summary (20-200 characters) *</label>
                <Input value={form.summary} onChange={(e) => setForm({...form, summary: e.target.value})} placeholder="Brief description of the suspected corruption" minLength={20} maxLength={200} required />
                <p className="text-xs text-slate-500 mt-1">{form.summary.length}/200 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Details (Optional)</label>
                <textarea value={form.details} onChange={(e) => setForm({...form, details: e.target.value})} placeholder="Provide specific details. DO NOT include your personal information." rows={8} maxLength={4000} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kenya-teal" />
              </div>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
              <Button type="submit" className="w-full bg-kenya-teal hover:bg-kenya-teal/90" disabled={loading}>{loading ? "Submitting..." : "Submit Anonymous Report"}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}