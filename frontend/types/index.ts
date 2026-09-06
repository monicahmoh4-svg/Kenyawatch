export interface Contract {
  id: number; contract_id: string; county: string; sector: string; year: number; title: string;
  supplier: string; value_kes: number; bid_type: string; scope: string; award_date: string;
  risk_score: number; risk_flags: Record<string, boolean>; data_type: 'documented' | 'live_sync' | 'manual_scan' | 'reference';
  source_name?: string; source_url?: string; created_at: string;
}
export interface GhostProject {
  id: number; project_id: string; county: string; title: string; description: string;
  claimed_status: string; lat: number; lng: number; data_type: string; source_name?: string; source_url?: string;
}
export interface ChatMessage { role: 'user' | 'assistant'; content: string; timestamp: Date }
