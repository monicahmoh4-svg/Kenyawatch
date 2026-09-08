import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms & Conditions - KenyaWatch AI",
  description: "KenyaWatch terms and conditions of use. Read the rules and guidelines for using our procurement transparency platform.",
  openGraph: {
    title: "Terms & Conditions - KenyaWatch AI",
    description: "KenyaWatch terms and conditions of use.",
    url: "https://kenyawatch-chi.vercel.app/terms",
    siteName: "KenyaWatch AI",
    type: "website",
  },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Terms &amp; Conditions</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: September 2026</p>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">1. Acceptance of Terms</h2>
            <p className="text-slate-600 leading-relaxed">
              By accessing or using KenyaWatch (kenyawatch-chi.vercel.app), you agree to be bound by these Terms &amp; Conditions. If you do not agree, please do not use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">2. Platform Description</h2>
            <p className="text-slate-600 leading-relaxed">
              KenyaWatch is an independent civic-tech platform that aggregates publicly available Kenyan government procurement data and provides AI-powered analysis tools. We are not affiliated with, endorsed by, or connected to any government agency, political party, or commercial entity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">3. Data Accuracy</h2>
            <div className="text-slate-600 leading-relaxed space-y-3">
              <p>While we strive for accuracy, we cannot guarantee the completeness or correctness of all data. Data on KenyaWatch comes from multiple sources:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Official OCDS data</strong> from tenders.go.ke and the Open Contracting Data Standard registry</li>
                <li><strong>Documented cases</strong> from Auditor-General reports and other public records</li>
                <li><strong>Synthetic/reference data</strong> used for demonstration purposes, clearly labeled</li>
              </ul>
              <p>Users should independently verify all information before making decisions based on it.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">4. Acceptable Use</h2>
            <div className="text-slate-600 leading-relaxed space-y-3">
              <p>You agree to use KenyaWatch only for lawful purposes. You must not:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Submit false, misleading, or defamatory reports</li>
                <li>Attempt to circumvent security measures or rate limits</li>
                <li>Use automated tools to scrape or overload the platform</li>
                <li>Impersonate any person or entity</li>
                <li>Use the platform to harass, threaten, or harm others</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">5. User-Submitted Content</h2>
            <div className="text-slate-600 leading-relaxed space-y-3">
              <p>When you submit a report through KenyaWatch:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>You are solely responsible for the content you submit</li>
                <li>You must not include personal identifying information about yourself or others</li>
                <li>Reports are published as-is; we do not fact-check individual submissions</li>
                <li>We reserve the right to remove reports that violate these terms</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">6. Intellectual Property</h2>
            <p className="text-slate-600 leading-relaxed">
              The KenyaWatch platform, including its design, code, and original content, is licensed under open-source licenses. Government procurement data displayed on the platform is public data and is not owned by KenyaWatch.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">7. Limitation of Liability</h2>
            <p className="text-slate-600 leading-relaxed">
              KenyaWatch is provided &quot;as is&quot; without warranties of any kind. We shall not be liable for any damages arising from the use of or inability to use the platform, including but not limited to decisions made based on the data presented.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">8. Changes to Terms</h2>
            <p className="text-slate-600 leading-relaxed">
              We reserve the right to modify these terms at any time. Changes will be effective upon posting. Your continued use of the platform after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">9. Contact</h2>
            <p className="text-slate-600 leading-relaxed">
              For questions about these terms, contact us at{" "}
              <a href="mailto:legal@kenyawatch.org" className="text-teal-600 hover:text-teal-700 font-medium">
                legal@kenyawatch.org
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
