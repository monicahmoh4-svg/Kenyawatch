"use client"
import { useState } from "react"
import { Shield, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
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
    } catch {
      setError("Failed to submit report. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="container mx-auto px-4 max-w-xl">
          <div className="border border-slate-200 bg-white rounded-xl p-8 text-center">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="h-7 w-7 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Report Submitted</h1>
            <p className="text-slate-500 mb-6">Your anonymous report has been received.</p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
              <div className="text-xs text-slate-500 mb-1">Case Number</div>
              <div className="text-2xl font-mono font-bold text-slate-900">{caseNumber}</div>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Save this case number. Due to the sensitive nature of these reports, we cannot provide real-time updates, but credible reports are forwarded to the appropriate authorities.
            </p>
            <Button onClick={() => { setSubmitted(false); setForm({ county: "", category: "", summary: "", details: "" }) }} variant="outline" className="border-slate-200">
              Submit Another Report
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-slate-900 text-white py-12 md:py-16 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="h-6 w-6 text-teal-400" />
            <h1 className="text-3xl md:text-4xl font-bold">Report Corruption</h1>
          </div>
          <p className="text-slate-400 max-w-2xl">
            Safely and anonymously report suspected procurement corruption. No personal data is collected.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-2xl pb-12">
        {/* Security Notice */}
        <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-amber-900 mb-1.5">Security Notice</h3>
              <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                <li>Do NOT include your name, phone number, or email</li>
                <li>Do NOT attach files with metadata</li>
                <li>Stick to facts — avoid speculation</li>
                <li>For maximum anonymity, use Tor Browser or a VPN</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="border border-slate-200 bg-white rounded-xl">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="county" className="block text-sm font-medium text-slate-700 mb-1.5">County (Optional)</label>
                  <Select value={form.county || "none"} onValueChange={(v) => setForm({...form, county: v === "none" ? "" : v})}>
                    <SelectTrigger id="county"><SelectValue placeholder="Select county" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not specified</SelectItem>
                      {ALL_COUNTIES.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
                  <Select value={form.category || "none"} onValueChange={(v) => setForm({...form, category: v === "none" ? "" : v})} required>
                    <SelectTrigger id="category"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select category</SelectItem>
                      {CATEGORIES.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label htmlFor="summary" className="block text-sm font-medium text-slate-700 mb-1.5">Summary (20-200 characters) *</label>
                <Input id="summary" value={form.summary} onChange={(e) => setForm({...form, summary: e.target.value})} placeholder="Brief description of the suspected corruption" minLength={20} maxLength={200} required />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-slate-400">Be specific and factual</p>
                  <p className={`text-xs ${form.summary.length > 190 ? 'text-red-500' : 'text-slate-400'}`}>{form.summary.length}/200</p>
                </div>
              </div>

              <div>
                <label htmlFor="details" className="block text-sm font-medium text-slate-700 mb-1.5">Details (Optional)</label>
                <textarea id="details" value={form.details} onChange={(e) => setForm({...form, details: e.target.value})} placeholder="Project names, dates, amounts, evidence. DO NOT include personal information." rows={6} maxLength={4000} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none" />
                <p className="text-xs text-slate-400 mt-1">{form.details.length}/4000</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {error}
                </div>
              )}

              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 py-5 text-base font-medium" disabled={loading || form.summary.length < 20}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...
                  </span>
                ) : "Submit Anonymous Report"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
