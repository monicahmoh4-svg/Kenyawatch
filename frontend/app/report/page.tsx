"use client"
import { useState, useEffect } from "react"
import { Shield, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { reportsApi } from "@/lib/api"

const ALL_COUNTIES = [
  "Baringo","Bomet","Bungoma","Busia","Elgeyo-Marakwet","Embu","Garissa","Homa Bay",
  "Isiolo","Kajiado","Kakamega","Kericho","Kiambu","Kilifi","Kirinyaga","Kisii",
  "Kisumu","Kitui","Kwale","Laikipia","Lamu","Machakos","Makueni","Mandera",
  "Marsabit","Meru","Migori","Mombasa","Murang'a","Nairobi","Nakuru","Nandi",
  "Narok","Nyamira","Nyandarua","Nyeri","Samburu","Siaya","Taita-Taveta",
  "Tana River","Tharaka-Nithi","Trans-Nzoia","Turkana","Uasin Gishu","Vihiga",
  "Wajir","West Pokot"
]

const CATEGORIES = [
  "Bid Rigging", "Ghost Project", "Overpricing", "Single-Source Abuse",
  "Conflict of Interest", "Document Forgery", "Fund Misuse", "Other"
]

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
      const res = await reportsApi.submit({
        county: form.county || null,
        category: form.category || null,
        summary: form.summary,
        details: form.details || null
      })
      setCaseNumber(res.data.case_number)
      setSubmitted(true)
    } catch (err) {
      setError("Failed to submit report. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="shadow-xl border-0">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Report Submitted Successfully</h2>
              <p className="text-slate-600 mb-6">Your anonymous report has been received and assigned case number:</p>
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-6 mb-6">
                <span className="text-3xl font-mono font-bold text-teal-700">{caseNumber}</span>
              </div>
              <p className="text-sm text-slate-500 mb-6">Please save this case number. Due to the sensitive nature of these reports, we cannot provide real-time updates, but credible reports are forwarded to the appropriate authorities.</p>
              <Button onClick={() => { setSubmitted(false); setForm({ county: "", category: "", summary: "", details: "" }); }} variant="outline">
                Submit Another Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative bg-gradient-to-r from-green-900 via-emerald-800 to-teal-900 text-white py-16 mb-8 overflow-hidden">
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=1920&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-8 w-8 text-green-300" />
              <h1 className="text-4xl font-bold">Report Corruption</h1>
            </div>
            <p className="text-lg text-white/90">Safely and anonymously report suspected procurement corruption</p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 max-w-3xl pb-12">
        <Card className="mb-8 border-yellow-300 bg-yellow-50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">Important Security Notice</h3>
                <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                  <li>Do NOT include your name, phone number, or email</li>
                  <li>Do NOT attach files with metadata (photos, documents)</li>
                  <li>Stick to facts - avoid speculation or unverified claims</li>
                  <li>For maximum anonymity, use Tor Browser or a VPN</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-0">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">County (Optional)</label>
                  <Select value={form.county || "none"} onValueChange={(v) => setForm({...form, county: v === "none" ? "" : v})}>
                    <SelectTrigger><SelectValue placeholder="Select county" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not specified</SelectItem>
                      {ALL_COUNTIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
                  <Select value={form.category || "none"} onValueChange={(v) => setForm({...form, category: v === "none" ? "" : v})} required>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select category</SelectItem>
                      {CATEGORIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Summary (20-200 characters) *</label>
                <Input
                  value={form.summary}
                  onChange={(e) => setForm({...form, summary: e.target.value})}
                  placeholder="Brief description of the suspected corruption"
                  minLength={20}
                  maxLength={200}
                  required
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-slate-500">Be specific and factual</p>
                  <p className={`text-xs ${form.summary.length > 180 ? 'text-red-500' : 'text-slate-500'}`}>{form.summary.length}/200</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Details (Optional)</label>
                <textarea
                  value={form.details}
                  onChange={(e) => setForm({...form, details: e.target.value})}
                  placeholder="Provide specific details such as project names, dates, amounts, and any evidence. DO NOT include your personal information."
                  rows={8}
                  maxLength={4000}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">{form.details.length}/4000 characters</p>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 py-6 text-lg"
                disabled={loading || form.summary.length < 20}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </div>
                ) : (
                  "Submit Anonymous Report"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
