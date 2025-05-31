// Updated types.ts
export interface ContractData {
  analysis: string
  keyPoints: string
  negotiations: string
}

export interface ApiConfig {
  openaiApiKey: string
}

export interface AnalysisType {
  type: "Contract Review" | "Risk Assessment" | "Legal Research" | "Custom Query"
  customQuery?: string
}