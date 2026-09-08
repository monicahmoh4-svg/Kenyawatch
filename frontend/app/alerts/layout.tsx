import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Alert Center - KenyaWatch AI | Real-time Corruption Monitoring",
  description: "AI-powered real-time monitoring for procurement anomalies and corruption indicators across Kenya's 47 counties.",
}

export default function AlertsLayout({ children }: { children: React.ReactNode }) {
  return children
}
