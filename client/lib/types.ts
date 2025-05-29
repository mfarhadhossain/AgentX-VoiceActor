// Updated types.ts
export interface ContractData {
  analysis: string  // Raw markdown from main analysis
  keyPoints: string  // Raw markdown from key points
  recommendations: string  // Raw markdown from recommendations
  riskScore: number
}

// Keep the old interfaces for any existing components that need them
export interface Metric {
  name: string
  score: number
  risk: "low" | "medium" | "high"
  isBoolean?: boolean
  value?: boolean
}

export interface ApiConfig {
  openaiApiKey: string
}

export interface AnalysisType {
  type: "Contract Review" | "Legal Research" | "Risk Assessment" | "Custom Query"
  customQuery?: string
}