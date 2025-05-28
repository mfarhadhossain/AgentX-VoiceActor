import type {ApiConfig, AnalysisType, ContractData, Metric} from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8501'

export class ApiService {
    private config: ApiConfig | null = null

    setConfig(config: ApiConfig) {
        this.config = config
    }

    async uploadAndAnalyze(file: File, analysisType: AnalysisType): Promise<ContractData> {
        if (!this.config) {
            throw new Error('API configuration not set')
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('openai_api_key', this.config.openaiApiKey)
        formData.append('qdrant_api_key', this.config.qdrantApiKey)
        formData.append('qdrant_url', this.config.qdrantUrl)
        formData.append('analysis_type', analysisType.type)

        if (analysisType.customQuery) {
            formData.append('custom_query', analysisType.customQuery)
        }

        // Log the request details
        console.log("Sending analysis request:", {
            file: file.name,
            fileSize: file.size,
            analysisType: analysisType.type,
            hasCustomQuery: !!analysisType.customQuery,
            apiUrl: `${API_BASE_URL}/api/analyze`
        });

        try {
            const response = await fetch(`${API_BASE_URL}/api/analyze`, {
                method: 'POST',
                body: formData,
            })

            const responseText = await response.text()
            console.log("Response status:", response.status)
            console.log("Response text:", responseText)

            if (!response.ok) {
                // Try to parse error details
                let errorDetail = 'Analysis failed'
                try {
                    const errorData = JSON.parse(responseText)
                    errorDetail = errorData.detail || errorDetail
                } catch {
                    errorDetail = responseText || errorDetail
                }
                throw new Error(errorDetail)
            }

            // Parse successful response
            const data = JSON.parse(responseText)
            console.log("Parsed response data:", data)

            return this.mapBackendResponse(data)
        } catch (error) {
            console.error("API call error:", error)
            throw error
        }
    }

    private mapBackendResponse(backendData: any): ContractData {
        // Map backend response to frontend data structure
        console.log("Mapping backend response:", backendData)

        return {
            overallRiskScore: backendData.risk_score || 0.0,
            metrics: this.extractMetrics(backendData),
            riskSummary: backendData.risk_summary || [],
            clauses: backendData.clauses || [],
            negotiationTips: backendData.recommendations || [],
        }
    }

    private extractMetrics(data: any): Metric[] {
        // Extract metrics from backend response
        const metrics: Metric[] = []

        if (data.complexity_score !== undefined) {
            metrics.push({
                name: "Contract Complexity",
                score: data.complexity_score,
                risk: this.scoreToRisk(data.complexity_score)
            })
        }

        if (data.legal_risk !== undefined) {
            metrics.push({
                name: "Legal Risk Assessment",
                score: data.legal_risk,
                risk: this.scoreToRisk(data.legal_risk)
            })
        }

        if (data.compliance !== undefined) {
            metrics.push({
                name: "Compliance Score",
                score: data.compliance,
                risk: this.scoreToRisk(10 - data.compliance) // Invert for risk
            })
        }

        // If no metrics, return defaults
        if (metrics.length === 0) {
            return [
                { name: "Contract Complexity", score: 6.5, risk: "medium" },
                { name: "Legal Risk Assessment", score: 8.2, risk: "high" },
                { name: "Compliance Score", score: 3.1, risk: "low" },
            ]
        }

        return metrics
    }

    private scoreToRisk(score: number): "low" | "medium" | "high" {
        if (score <= 3.3) return "low"
        if (score <= 6.6) return "medium"
        return "high"
    }
}

export const apiService = new ApiService()