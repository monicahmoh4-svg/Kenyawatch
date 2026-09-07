export interface Contract {
  id: number;
  contract_id: string;
  county: string;
  sector: string;
  year: number;
  title: string;
  supplier: string;
  value_kes: number;
  bid_type: string;
  scope: string;
  award_date: string;
  risk_score: number;
  risk_flags: Record<string, boolean>;
  data_type: 'documented' | 'live_sync' | 'manual_scan' | 'reference';
  source_name?: string;
  source_url?: string;
  created_at: string;
}

export interface GhostProject {
  id: number;
  project_id: string;
  county: string;
  title: string;
  description: string;
  claimed_status: string;
  lat: number;
  lng: number;
  data_type: string;
  source_name?: string;
  source_url?: string;
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

export interface DashboardStats {
  total: number;
  documented: number;
  critical: number;
  reports_total: number;
  by_data_type: Array<{ data_type: string; count: number }>;
  by_county: Array<{ county: string; count: number }>;
}

export interface ContractsMeta {
  counties: string[];
  regions: string[];
  sectors: string[];
  years: number[];
  data_types: string[];
}

export interface Report {
  id: number;
  case_number: string;
  county?: string;
  category?: string;
  summary: string;
  details?: string;
  status: string;
  created_at: string;
}
