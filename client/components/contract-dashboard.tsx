"use client"

import { useState } from "react"
import { UploadCard } from "./upload-card"
import { RiskScoreCard } from "./risk-score-card"
import { TabbedDetails } from "./tabbed-details"
import { ProjectHeader } from "./project-header"
import type { ContractData } from "@/lib/types"

export function ContractDashboard() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [contractData, setContractData] = useState<ContractData | null>(null)
  const [isUploadMinimized, setIsUploadMinimized] = useState(false)

  const handleFileUpload = async (file: File) => {
    setIsAnalyzing(true)
    setIsUploadMinimized(true) // Minimize upload card when analysis starts

    // Simulate contract analysis
    setTimeout(() => {
      // Mock data - in a real app, this would come from your API
      const mockData: ContractData = {
        overallRiskScore: 7.2,
        metrics: [
          { name: "Client Trustworthiness", score: 6.5, risk: "medium" },
          { name: "Audition Sample Length", score: 8.2, risk: "high" },
          { name: "Completed Projects Count", score: 3.1, risk: "low" },
          { name: "Hourly Rate", score: 7.8, risk: "high" },
          { name: "GenAI Usage Transparency", score: 0, risk: "high", isBoolean: true, value: false },
          { name: "System Accuracy", score: 8.5, risk: "high" },
        ],
        riskSummary: [
          "Contract contains unlimited revisions clause with no additional compensation",
          "Rights extend to AI voice training without explicit compensation",
          "Non-compete clause is overly restrictive (3 years, global scope)",
        ],
        clauses: [
          {
            title: "Revisions Clause",
            content:
              "Talent agrees to provide unlimited revisions at no additional cost until Client is satisfied with the final product.",
            highlight: "unlimited revisions at no additional cost",
            risk: "high",
          },
          {
            title: "Rights Assignment",
            content:
              "Client shall own all rights to the recordings in perpetuity, including the right to use recordings for training AI voice models.",
            highlight: "training AI voice models",
            risk: "high",
          },
          {
            title: "Non-Compete",
            content:
              "Talent agrees not to work with any competing business in the same industry for a period of three (3) years following the completion of this project, worldwide.",
            highlight: "three (3) years following the completion of this project, worldwide",
            risk: "high",
          },
          {
            title: "Payment Terms",
            content: "Payment shall be made within 60 days of project completion and approval by Client.",
            highlight: "60 days",
            risk: "medium",
          },
        ],
        negotiationTips: [
          "Request a cap on the number of revision rounds (suggest 2-3 rounds)",
          "Add explicit compensation for AI training rights or exclude these rights entirely",
          "Negotiate non-compete to 6 months and limit to specific geographic region",
          "Request payment terms of net-30 instead of net-60",
        ],
      }

      setContractData(mockData)
      setIsAnalyzing(false)
    }, 3000)
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
