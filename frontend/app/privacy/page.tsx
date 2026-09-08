import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy - KenyaWatch AI",
  description: "KenyaWatch privacy policy. Learn how we handle data, protect your anonymity, and respect your privacy on our procurement transparency platform.",
  openGraph: {
    title: "Privacy Policy - KenyaWatch AI",
    description: "KenyaWatch privacy policy.",
    url: "https://kenyawatch-chi.vercel.app/privacy",
    siteName: "KenyaWatch AI",
    type: "website",
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: September 2026</p>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">1. Introduction</h2>
            <p className="text-slate-600 leading-relaxed">
              KenyaWatch (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard information when you use our procurement transparency platform at kenyawatch-chi.vercel.app.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">2. Data We Collect</h2>
            <div className="text-slate-600 leading-relaxed space-y-3">
              <p><strong>Anonymous Reports:</strong> When you submit a corruption report, we collect only the information you provide (county, category, summary, and details). We do not collect IP addresses, browser fingerprints, names, email addresses, or any other identifying information.</p>
              <p><strong>Usage Data:</strong> We may collect anonymized analytics data such as pages visited, time spent on the platform, and general geographic region. This data cannot be used to identify you personally.</p>
              <p><strong>Chat Interactions:</strong> Conversations with the AI Investigator are not stored permanently. They are processed in real-time and discarded after your session ends.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">3. How We Use Your Data</h2>
            <div className="text-slate-600 leading-relaxed space-y-3">
              <p>We use collected data solely to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Process and display anonymous corruption reports</li>
                <li>Improve the platform&apos;s functionality and user experience</li>
                <li>Analyze aggregate usage patterns to optimize performance</li>
                <li>Forward credible reports to relevant oversight authorities</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">4. Anonymity Protection</h2>
            <div className="text-slate-600 leading-relaxed space-y-3">
              <p>KenyaWatch is designed with anonymity as a core principle:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>We do not require account creation or login for reporting</li>
                <li>We do not store IP addresses or browser fingerprints</li>
                <li>We do not use cookies that can identify you</li>
                <li>We do not share report metadata with third parties</li>
                <li>Reports are assigned random case numbers without any link to submitters</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">5. Third-Party Services</h2>
            <div className="text-slate-600 leading-relaxed space-y-3">
              <p>We use the following third-party services:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Vercel:</strong> Hosting and deployment ( collects anonymized analytics)</li>
                <li><strong>Render:</strong> Backend API hosting</li>
                <li><strong>Google Gemini:</strong> AI analysis (queries are not stored)</li>
              </ul>
              <p>Each third-party service has its own privacy policy. We encourage you to review them.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">6. Data Security</h2>
            <p className="text-slate-600 leading-relaxed">
              We implement industry-standard security measures including HTTPS encryption, Content Security Policy headers, rate limiting, and input validation. However, no method of electronic transmission or storage is 100% secure. We encourage users to take additional precautions such as using Tor Browser or a VPN when submitting sensitive reports.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">7. Data Retention</h2>
            <p className="text-slate-600 leading-relaxed">
              Anonymous reports are retained indefinitely to maintain a public record of procurement concerns. AI chat conversations are not permanently stored. Analytics data is retained in anonymized aggregate form.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">8. Changes to This Policy</h2>
            <p className="text-slate-600 leading-relaxed">
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date. Continued use of the platform after changes constitutes acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">9. Contact</h2>
            <p className="text-slate-600 leading-relaxed">
              For privacy-related questions, contact us at{" "}
              <a href="mailto:privacy@kenyawatch.org" className="text-teal-600 hover:text-teal-700 font-medium">
                privacy@kenyawatch.org
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
