import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X, TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { ContractData, Metric } from "@/lib/types"

interface RiskScoreCardProps {
  data: ContractData
}

export function RiskScoreCard({ data }: RiskScoreCardProps) {
  const { overallRiskScore, metrics } = data

  // Determine the color based on the risk score
  const getScoreColor = (score: number) => {
    if (score <= 3.3) return "text-green-600"
    if (score <= 6.6) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBackground = (score: number) => {
    if (score <= 3.3) return "bg-green-50"
    if (score <= 6.6) return "bg-yellow-50"
    return "bg-red-50"
  }

  return (
    <Card className="h-full shadow-lg bg-white border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-gray-900">Risk Assessment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Risk Score */}
        <div className={`p-6 rounded-xl ${getScoreBackground(overallRiskScore)}`}>
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 mb-4">
              <CircularProgress
                value={overallRiskScore * 10}
                color={getScoreColor(overallRiskScore).replace("text-", "")}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${getScoreColor(overallRiskScore)}`}>
                  {overallRiskScore.toFixed(1)}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 text-center">Overall Risk Score</p>
            <p className="text-xs text-gray-500 text-center mt-1">Based on OWASP, NIST, MITRE standards</p>
          </div>
        </div>

        {/* Risk Metrics */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Breakdown</h3>
          {metrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function CircularProgress({ value, color }: { value: number; color: string }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (value / 100) * circumference

  return (
    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
      <circle
        cx="50"
        cy="50"
        r={radius}
        stroke="currentColor"
        strokeWidth="8"
        fill="transparent"
        className="text-gray-200"
      />
      <circle
        cx="50"
        cy="50"
        r={radius}
        stroke="currentColor"
        strokeWidth="8"
        fill="transparent"
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        className={`text-${color}-500 transition-all duration-1000 ease-out`}
        strokeLinecap="round"
      />
    </svg>
  )
}

function MetricCard({ metric }: { metric: Metric }) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-600"
      case "medium":
        return "text-yellow-600"
      case "high":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getRiskBackground = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-50 border-green-200"
      case "medium":
        return "bg-yellow-50 border-yellow-200"
      case "high":
        return "bg-red-50 border-red-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "low":
        return <TrendingDown className="h-4 w-4 text-green-600" />
      case "medium":
        return <Minus className="h-4 w-4 text-yellow-600" />
      case "high":
        return <TrendingUp className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  // For boolean metrics like "GenAI Usage Transparency"
  if (metric.isBoolean) {
    return (
      <div className={`p-4 rounded-lg border ${getRiskBackground(metric.risk)}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 text-sm">{metric.name}</h4>
            <div className="flex items-center mt-1">
              {getRiskIcon(metric.risk)}
              <span className={`text-xs font-medium ml-1 ${getRiskColor(metric.risk)}`}>
                {metric.risk.toUpperCase()} RISK
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center min-w-[44px] min-h-[44px]">
            {metric.value ? (
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                <Check className="h-5 w-5 text-green-600" />
              </div>
            ) : (
              <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                <X className="h-5 w-5 text-red-600" />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // For score-based metrics
  return (
    <div className={`p-4 rounded-lg border ${getRiskBackground(metric.risk)}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 text-sm">{metric.name}</h4>
          <div className="flex items-center mt-1">
            {getRiskIcon(metric.risk)}
            <span className={`text-xs font-medium ml-1 ${getRiskColor(metric.risk)}`}>
              {metric.risk.toUpperCase()} RISK
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-lg font-bold ${getRiskColor(metric.risk)}`}>{metric.score.toFixed(1)}</span>
          <span className="text-sm text-gray-500">/10</span>
        </div>
      </div>

      {/* Mini sparkline visualization */}
      <div className="relative">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-out ${
              metric.risk === "low" ? "bg-green-500" : metric.risk === "medium" ? "bg-yellow-500" : "bg-red-500"
            }`}
            style={{ width: `${(metric.score / 10) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>
    </div>
  )
}
