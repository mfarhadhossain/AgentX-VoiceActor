"use client"

import { useState } from "react"
import { UploadCard } from "./upload-card"
import { RiskScoreCard } from "./risk-score-card"
import { TabbedDetails } from "./tabbed-details"
import { ProjectHeader } from "./project-header"
import { ApiConfigComponent } from "./api-config"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { ContractData, ApiConfig, AnalysisType } from "@/lib/types"
import { apiService } from "@/lib/api-service"

export function ContractDashboard() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [contractData, setContractData] = useState<ContractData | null>(null)
  const [isUploadMinimized, setIsUploadMinimized] = useState(false)
  const [apiConfig, setApiConfig] = useState<ApiConfig | null>(null)
  const [analysisType, setAnalysisType] = useState<AnalysisType>({ type: "Contract Review" })
  const [customQuery, setCustomQuery] = useState("")

  const handleApiConfigChange = (config: ApiConfig) => {
    setApiConfig(config)
    apiService.setConfig(config)
  }

  const handleFileUpload = async (file: File) => {
    if (!apiConfig) {
      alert("Please configure API settings first")
      return
    }

    setIsAnalyzing(true)
    setIsUploadMinimized(true)

    try {
      const analysis: AnalysisType = analysisType.type === "Custom Query"
          ? { ...analysisType, customQuery }
          : analysisType

      const data = await apiService.uploadAndAnalyze(file, analysis)
      setContractData(data)
    } catch (error) {
      console.error("Analysis failed:", error)
      alert("Analysis failed. Please check your API configuration and try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleNewUpload = () => {
    setContractData(null)
    setIsUploadMinimized(false)
    setIsAnalyzing(false)
  }

  return (
      <div className="min-h-screen bg-white">
        <ProjectHeader />

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {!apiConfig && (
              <ApiConfigComponent onConfigChange={handleApiConfigChange} />
          )}

          <div className="mb-6 space-y-4">
            <div>
              <Label htmlFor="analysis-type">Analysis Type</Label>
              <Select
                  value={analysisType.type}
                  onValueChange={(value) => setAnalysisType({ type: value as AnalysisType["type"] })}
              >
                <SelectTrigger id="analysis-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Contract Review">Contract Review</SelectItem>
                  <SelectItem value="Legal Research">Legal Research</SelectItem>
                  <SelectItem value="Risk Assessment">Risk Assessment</SelectItem>
                  <SelectItem value="Compliance Check">Compliance Check</SelectItem>
                  <SelectItem value="Custom Query">Custom Query</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {analysisType.type === "Custom Query" && (
                <div>
                  <Label htmlFor="custom-query">Custom Query</Label>
                  <Textarea
                      id="custom-query"
                      value={customQuery}
                      onChange={(e) => setCustomQuery(e.target.value)}
                      placeholder="Enter your specific legal analysis query..."
                      rows={3}
                  />
                </div>
            )}
          </div>

          <div className={`transition-all duration-300 ${isUploadMinimized ? "mb-4" : "mb-8"}`}>
            <UploadCard
                onFileUpload={handleFileUpload}
                isAnalyzing={isAnalyzing}
                isMinimized={isUploadMinimized}
                onNewUpload={handleNewUpload}
                hasContract={!!contractData}
            />
          </div>

          {contractData && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <RiskScoreCard data={contractData} />
                </div>
                <div className="lg:col-span-2">
                  <TabbedDetails data={contractData} />
                </div>
              </div>
          )}
        </div>
      </div>
  )
}