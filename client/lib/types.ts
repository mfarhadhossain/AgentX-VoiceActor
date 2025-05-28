export interface ContractData {
  overallRiskScore: number
  metrics: Metric[]
  riskSummary: string[]
  clauses: Clause[]
  negotiationTips: string[]
}

export interface Metric {
  name: string
  score: number
  risk: "low" | "medium" | "high"
  isBoolean?: boolean
  value?: boolean
}

export interface Clause {
  title: string
  content: string
  highlight: string
  risk: "low" | "medium" | "high"
}

export interface ApiConfig {
  openaiApiKey: string
  qdrantApiKey: string
  qdrantUrl: string
}

export interface AnalysisType {
  type: "Contract Review" | "Legal Research" | "Risk Assessment" | "Compliance Check" | "Custom Query"
  customQuery?: string
}